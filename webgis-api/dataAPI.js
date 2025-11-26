"use strict"
// express is the server that forms part of the nodejs program

let express = require('express');
let path = require('path');
let app = express();
let fs = require('fs');

// add an https server to serve files
let http = require('http');

let httpSever = http.createServer(app)
httpSever.listen(4480);

app.get('/',function(req,res){
	res.send("hello world from the Data API"+Date.now());
});

// adding functionality to allow cross-origion queries
app.use(function(req,res,next){
	res.setHeader('Access-Control-Allow-Origin','*');
	res.setHeader('Access-Control-Allow-Headers','X-Requested-With');
	res.setHeader('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
	next();
});

// adding functionality to log the requests
app.use(function(req,res,next){
	let filename = path.basename(req.url);
	let extension = path.extname(filename);
	console.log("The file "+filename+" was requested.");
	next();
});

const geoJSON = require('./routes/geoJSON');
app.use('/geojson',geoJSON);

// adding CORS 
app.use(function(req,res,next){
	res.header("Access-Control-Allow-Origin","*"); // update to match the domain to make the requrest from
	res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
	next();
});


const crud = require('./routes/crud');
app.use('/',crud);


// app.use(express.static(_dirname)); // used for getting data from static files 







