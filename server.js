/*jshint esversion: 8 */
/*globals require, res, __dirname*/

//Require statements/variables
const express = require('express');
const fetch = require('node-fetch');
var bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;


//variables for use with user/GitHub
// const clientId = 'PUT-CLIENT-ID-HERE';
// const clientSecret = 'PUT-CLIENT-SECRET-HERE';
const clientId = '7cb697c561a995d7c9f7';
const clientSecret = 'b017bc8ba12dcc42477de914b7e7b1f288c2e296';

const user = {
    username: '',
    userId: ''
};

//express setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
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
async function setUser(nameValue, idValue){
    user.username = nameValue;
    user.userId = idValue;
    return;
}

/*
performUserCallbackFunction(codeName)
precondition: code from Github authorization has been acquired.
postcondition: return access token to get user information
*/
async function performUserCallbackFunction(codeName){
    const body = {
        clientId: clientId,
        clientSecret: clientSecret,
        code: codeName
    };

    const response = await fetch(`https://github.com/login/oauth/access_token?client_id=${body.clientId}&client_secret=${body.clientSecret}&code=${body.code}`, {
        method:'POST',
        headers: {accept: 'application/json'}
    }).catch(e => {
        res.status(400);
        res.json({
            success: false,
            message: e.message 
        });
    });
    const jsonObj = await response.json();
    return jsonObj;
}

/*
performUserLookup(userToken)
precondition: access token from GitHub has been acquired
postcondition: the user's username and id are acquired and are returned from API
*/
async function performUserLookup(userToken){
    const response = await fetch(`https://api.github.com/user`,  {
        method: 'GET',
        headers: {Authorization: `token ${userToken}`, accept: 'application/json'}
    });
    const userJson = await response.json();
    await setUser(userJson.login, userJson.id);
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
    res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}`);
});

/*
callback function endpoint for GitHub OAuth
precondition: user authorizes GitHub to use account, server is listening
postcondition: user is logged in/has information stored on server
*/
app.get('/user/login/callbackfunc', async (req,res) => {
    var accessObj = await performUserCallbackFunction(req.query.code);
    await performUserLookup(accessObj.access_token);
    let userJson = getUser();
    //database lookup/insertion
    let db = client.db('CodeTrivia');
    let collection = db.collection('Users');
    var query = { "username": userJson.username, "id": userJson.userId};
    await collection.find(query).toArray().then(userVal => {
        //if there is no user in the system for that username, then add one
        console.log(userVal);
        if(!userVal.length){
            const userStructure = {
                username: userJson.username,
                id: userJson.userId,
                scores: []
            };
            collection.insertOne(userStructure);
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
    let scoresRetList = [];
    let db = client.db('CodeTrivia');
    let collection = db.collection('Users');
    let document = await collection.find();
    //filter scores by category
    await document.toArray().then((result) =>{
        for(const elem of result){
            let scores = elem.scores;
            const catVal = req.query.category;
            var catScores = scores.filter(i => {
                return i.category == catVal;
            });
            if(catScores[0] != null){
                scoresRetList.push({name:elem.username, score:catScores[0].score});
            }
        }
    });

    res.send(scoresRetList);   

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


    var scoreInCat = false;
    await collection.findOne(query).then(response => {
            for (var item of response.scores){
                if(item.category == req.body.category){
                    scoreInCat = true;
                }
            }
        }
    );

    if(scoreInCat){   
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
