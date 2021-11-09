const express = require('express');
const fetch = require('node-fetch');
var bodyParser = require('body-parser');
const cors = require('cors');
const { json } = require('body-parser');
const app = express();
const port = 3000;

const clientID = 'PUT-CLIENT-ID-HERE';
const clientSecret = 'PUT-CLIENT-SECRET-HERE';
const user = {
    userName: '',
    userId: ''
};

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://TriviaUser:TriviaUserPass@cluster0.wn0sd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect();

app.get('/get-questions' , async (req, res) =>{
    try {
        // category = req.body.category;
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


//github user server work (Harrison):
//functions: 
//1.) Authorize a user using Github OAuth's service
//2.) Using the access token given, get the user's information to be stored
//in the backend.
//get the information stored
function getUser(){
    return user;
}

//set a user's information
async function setUser(name_value, id_value){
    user.userName = name_value;
    user.userId =id_value;
    return;
}

//function that gets the access token that can then be used to get
//the user's information to be stored in the database
async function performUserCallbackFunction(codeName){
    const body = {
        client_id: clientID,
        client_secret: clientSecret,
        code: codeName
    };
    token_val = '';

    //perform a post request to the user
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

//function that uses the access token gotten to lookup a user
async function performUserLookup(user_token){
    const response = await fetch(`https://api.github.com/user`,  {
        method: 'GET',
        headers: {Authorization: `token ${user_token}`, accept: 'application/json'}
    });
    const user_json = await response.json();
    const set = await setUser(user_json.login, user_json.id);
    return user_json.login;
}

//github oauth & user endpoints

//send user information back
app.get('/user', (req, res) => {
    res.send(getUser());
});

//the initial call to the oauth authorization for a user to log in 
app.get('/user/login', (req, res) => {
    res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientID}`);
});

//callback function endpoint for github OAuth: this is the function
//that gets the user's information based on the code from authorization
//that then sets the user's username and email into the database.
app.get('/user/login/callbackfunc', async (req,res) => {
    
    //perform callback and user lookup 
    var access_obj = await performUserCallbackFunction(req.query.code);
    var user_obj = await performUserLookup(access_obj.access_token);

    //redirect back to the home/about/whatever page is decided
    res.redirect('http://localhost:3000/about');
});

//sets server user information back to defaults
app.get('/user/logout', (req, res) => {
    setUser('','');
    res.redirect('http://localhost:3000/about');
});

//-- github user work ends here --


// -- work on score endpoints in order to test things for the leaderboard functions (Harrison)-- 
app.get('/scores', async (req, res) => {
    let scores_ret_list = [];
    //wait client connection to DB
    let db = client.db('CodeTrivia');
    let collection = db.collection('Users');
    let document = await collection.find();

    //go through the items returned: filter the scores based on what the person
    //has, and if there is an object within the filtering add it to the return list,
    //otherwise continue
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
//-- score endpoints end here -- 

app.use(express.static(__dirname + '/'));

app.listen(port, () => {
    console.log('Listening on *: 3000');
})
