const express = require('express');
const fetch = require('node-fetch');
var bodyParser = require('body-parser');
const { json } = require('body-parser');
const app = express();
const port = 3000;

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



app.use(express.static(__dirname + '/'));

app.listen(port, () => {
    console.log('Listening on *: 3000')
})