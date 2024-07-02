require('dotenv').config();
var compression = require('compression')

var express = require('express')
var app = express();
app.use(compression())
const path = require('path')
const port = process.env.PORT || 8080;

app.use('/DOM', express.static(path.join(__dirname, '../../mimic/react-vanilla')))

app.use('/', express.static(path.join(__dirname, 'public')))
app.use(express.static('public'))

app.listen(port);
console.log(`Listening on ${port}`)