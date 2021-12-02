/*jshint esversion: 8 */
/*globals require, res, __dirname*/

//Require statements/variables
const express = require('express');
const fetch = require('node-fetch');
var body_parser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;


//variables for use with user/GitHub
// const client_id = 'PUT-CLIENT-ID-HERE';
// const client_secret = 'PUT-CLIENT-SECRET-HERE';
const client_id = '7cb697c561a995d7c9f7';
const client_secret = 'b017bc8ba12dcc42477de914b7e7b1f288c2e296';

const user = {
    username: '',
    user_id: ''
};

//express setup
app.use(cors());
app.use(body_parser.json());
app.use(body_parser.urlencoded({
  extended: true
}));

//database setup/connect
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://TriviaUser:TriviaUserPass@cluster0.wn0sd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect();


/*
question endpoint
precondition: server must be listening/active
postcondition: currently, return a list of question objects from mongoDB
*/
app.get('/get-questions/:category' , async (req, res) =>{

    let category = req.params.category;
    console.log(category);

    try {
        
        let db = client.db('CodeTrivia');
        let collection = db.collection('test');
        let document = await collection.find({category: category});
        // let document = await collection.aggregate([{$sample: {size: 10}}]);
        let items = await document.toArray();
        items = items.slice(0, 10);
  
        console.log(items);
        res.send(items);
    }catch (e) {
        res.status(400);
        res.json({
            success: false,
            err: 'Cannot get the question data'
        });
    }
  });


/*
getUser()
precondition: none
postcondition: return user's username and id
*/
function getUser(){
    return user;
}

/*
setUser()
precondition: none/values must be valid representations of a GitHub username/id
postcondition: set user's username and id, return
*/
async function setUser(name_value, id_value){
    user.username = name_value;
    user.user_id = id_value;
    return;
}

/*
performUserCallbackFunction(codeName)
precondition: code from Github authorization has been acquired.
postcondition: return access token to get user information
*/
async function performUserCallbackFunction(code_name){
    const body = {
        client_id: client_id,
        client_secret: client_secret,
        code: code_name
    };

    const response = await fetch(`https://github.com/login/oauth/access_token?client_id=${body.client_id}&client_secret=${body.client_secret}&code=${body.code}`, {
        method:'POST',
        headers: {accept: 'application/json'}
    }).catch(e => {
        res.status(400);
        res.json({
            success: false,
            message: e.message 
        });
    });
    const json_obj = await response.json();
    return json_obj;
}

/*
performUserLookup(user_token)
precondition: access token from GitHub has been acquired
postcondition: the user's username and id are acquired and are returned from API
*/
async function performUserLookup(user_token){
    const response = await fetch(`https://api.github.com/user`,  {
        method: 'GET',
        headers: {Authorization: `token ${user_token}`, accept: 'application/json'}
    });
    const user_json = await response.json();
    await setUser(user_json.login, user_json.id);
    return;
}

/*
user endpoint
precondition: server is listening 
postcondition: user info is returned to client js 
*/
app.get('/user', (req, res) => {
    res.send(getUser());
});

/*
login endpoint
precondition: server is listening 
postcondition: user is sent to GitHub authorization
*/
app.get('/user/login', (req, res) => {
    res.redirect(`https://github.com/login/oauth/authorize?client_id=${client_id}`);
});

/*
callback function endpoint for GitHub OAuth
precondition: user authorizes GitHub to use account, server is listening
postcondition: user is logged in/has information stored on server
*/
app.get('/user/login/callbackfunc', async (req,res) => {
    var access_obj = await performUserCallbackFunction(req.query.code);
    await performUserLookup(access_obj.access_token);
    let user_json = getUser();
    //database lookup/insertion
    let db = client.db('CodeTrivia');
    let collection = db.collection('Users');
    var query = { "username": user_json.username, "id": user_json.user_id};
    await collection.find(query).toArray().then(user_val => {
        //if there is no user in the system for that username, then add one
        console.log(user_val);
        if(!user_val.length){
            const user_structure = {
                username: user_json.username,
                id: user_json.user_id,
                scores: []
            };
            collection.insertOne(user_structure);
            console.log("Inserted a new user into the database");
        }
    });

    res.redirect('http://localhost:3000/');
});

/*
logout endpoint
precondition: server is listening
postcondition: username and id are returned to default blanks
*/
app.get('/user/logout', (req, res) => {
    setUser('','');
    res.redirect('http://localhost:3000/');
});


/*
scores endpoint: gets information related to scores
precondition: connected to server, category is specified in query parameters
postcondition: an array of scores for the specified category are returned.
*/
app.get('/scores', async (req, res) => {
    let scores_ret_list = [];
    let db = client.db('CodeTrivia');
    let collection = db.collection('Users');
    let document = await collection.find();
    //filter scores by category
    await document.toArray().then((result) =>{
        for(const elem of result){
            let scores = elem.scores;
            const cat_val = req.query.category;
            var cat_scores = scores.filter(i => {
                return i.category == cat_val;
            });
            if(cat_scores[0] != null){
                scores_ret_list.push({name:elem.username, score:cat_scores[0].score});
            }
        }
    });

    res.send(scores_ret_list);   

});

/*
updateScore endpoint
precondition: req body contains a score, category, and user for the score
postcondition: correct user has score updated/inserted into their score
*/
app.post('/scores/updateScore', async (req, res) => {

    if(req.body.username == ''){
        return res.send({status: 'empty', message: 'user does not exist in database, cannot add score.'});
    }

    var username = req.body.username;

    if(!req.body.category || req.body.score == undefined){
        return res.send({status: 'score_empty', message: 'category or score for category is empty and as such score cannot be added.'});
    }
    
    var query = { "username": username };
    let db = client.db('CodeTrivia');
    let collection = db.collection('Users');


    var score_in_cat = false;
    await collection.findOne(query).then(response => {
            for (var item of response.scores){
                if(item.category == req.body.category){
                    score_in_cat = true;
                }
            }
        }
    );

    if(score_in_cat){   
        query = { "username": username, "scores.category": req.body.category};
        try{
            await collection.updateOne(query, 
                {$set: 
                    {"scores.$.score": req.body.score } 
                }, {upsert: true});
        }
        catch(error){
            console.error(error);
        }
    }
    
    else{
        try{
            await collection.updateOne(query, 
                {$addToSet: 
                    {"scores": 
                        {"category": req.body.category, "score": req.body.score}
                    } 
                }, {upsert: true});
        }
        catch(error){
            console.error(error);
        }
    }

    return res.send({status:'success', message: 'user score successfully put in'});

});

//have server listen on the port 3000
app.use(express.static(__dirname + '/'));

app.listen(port, () => {
    console.log(`Listening on *: ${port}`);
});

client.close();
