const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + '/'));



app.listen(port, () => {
    console.log('Listening on *: 3000')
})