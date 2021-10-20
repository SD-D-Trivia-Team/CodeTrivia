const express = require('express');
// const fetch = require('node-fetch');
// var bodyParser = require('body-parser');
// const { json } = require('body-parser');
const app = express();
const port = 3000;

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//   extended: true
// }));

// const { MongoClient } = require('mongodb');
// const uri = "mongodb+srv://TriviaUser:TestUserPass@cluster0.wn0sd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("CodeTrivia").collection("test");
//   // perform actions on the collection object
//   client.close();
// });

app.use(express.static(__dirname + '/'));

app.listen(port, () => {
    console.log('Listening on *: 3000')
})