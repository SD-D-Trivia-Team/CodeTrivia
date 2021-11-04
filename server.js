const express = require('express');
const fetch = require('node-fetch');
var bodyParser = require('body-parser');
const cors = require('cors');
const { json } = require('body-parser');
const app = express();
const port = 3000;

const clientID = 'e4baa49643af3729d64f';
const clientSecret = 'dbfda8a0663d4b5846515b75e7a1d01e163e17f9';
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
    console.log('Running callback function');
    console.log(codeName);
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
    console.log(user_json.login);
    const set = await setUser(user_json.login, user_json.id);
    return user_json.login;
}

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
    console.log(req.query.login);
    var access_obj = await performUserCallbackFunction(req.query.code);
    console.log(access_obj);
    var user_obj = await performUserLookup(access_obj.access_token);
    console.log(user_obj);
    console.log(user);
    //redirect back to the home/about/whatever page is decided as 
    //a redirect page for the result
    res.redirect('http://localhost:3000/about');
});

//sets user server information back to defaults
app.get('/user/logout', (req, res) => {
    setUser('','');
    res.redirect('http://localhost:3000/about');
});

app.use(express.static(__dirname + '/'));

app.listen(port, () => {
    console.log('Listening on *: 3000');
})
