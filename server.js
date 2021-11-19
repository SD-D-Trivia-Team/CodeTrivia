//Require statements/variables
const express = require('express');
const fetch = require('node-fetch');
var bodyParser = require('body-parser');
const cors = require('cors');
const { json } = require('body-parser');
const app = express();
const port = 3000;

//variables for use with user/GitHub
const client_id = 'PUT-CLIENT-ID-HERE';
const client_secret = 'PUT-CLIENT-SECRET-HERE';
const user = {
    username: '',
    user_id: ''
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
app.get('/get-questions' , async (req, res) =>{
    try {
        console.log("connecting to db to get plants");
        
        await client.connect();
        let db = client.db('CodeTrivia');
        let collection = db.collection('test');
        let document = await collection.find();
        let items = await document.toArray();
  
        console.log(items);
        res.send(items);
        client.close();
    }catch (e) {
        res.status(400);
        res.json({
            success: false,
            err: 'Cannot get the plant data'
        });
    }
  })


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
set a user's information
precondition: none/values must be valid representations of a GitHub username/id
postcondition: set user's username and id, return
*/
async function setUser(name_value, id_value){
    user.username = name_value;
    user.user_id =id_value;
    return;
}

/*
performUserCallbackFunction()
precondition: code from Github authorization has been acquired.
postcondition: return access token to get user information
*/
async function performUserCallbackFunction(codeName){
    const body = {
        client_id: client_id,
        client_secret: client_secret,
        code: codeName
    };
    token_val = '';

    const response = await fetch(`https://github.com/login/oauth/access_token?client_id=${body.client_id}&client_secret=${body.client_secret}&code=${body.code}`, {
        method:'POST',
        headers: {accept: 'application/json'}
    }).catch(e => {
        res.status(400);
        res.json({
            success: false,
            message: e.message 
        })
    });
    const json_obj = await response.json();
    return json_obj;
}

/*
performUserLookup()
precondition: access token from GitHub has been acquired
postcondition: the user's username and id are acquired and are returned from API
*/
async function performUserLookup(user_token){
    const response = await fetch(`https://api.github.com/user`,  {
        method: 'GET',
        headers: {Authorization: `token ${user_token}`, accept: 'application/json'}
    });
    const user_json = await response.json();
    const set = await setUser(user_json.login, user_json.id);
    return user_json.login;
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
    var user_obj = await performUserLookup(access_obj.access_token);
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
            var cat_scores = scores.filter(i => {
                return i.category == req.query.category;
            });
            if(cat_scores[0] != null){
                scores_ret_list.push({name:elem.username, score:cat_scores[0]['score']});
            }
        }
    });

    res.send(scores_ret_list);   

});

//have server listen on the port 3000
app.use(express.static(__dirname + '/'));

app.listen(port, () => {
    console.log('Listening on *: 3000');
})

client.close();
