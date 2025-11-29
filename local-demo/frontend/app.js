"use strict";
// express is the web server that forms part of the nodejs program
const express = require('express');
const path = require("path");
const fs = require('fs');
const app = express();

// add an https server to serve files 
const http = require('http');

const httpServer = http.createServer(app);
const httpServerPort = 3000;

httpServer.listen(httpServerPort);

app.get('/',function (req,res) {
	let date = new Date();
	res.send("Hello World from the App Server on Node port "+httpServerPort + " (mapped to Apache port 443).<br><br> The date is "+ date);
});

// adding functionality to allow cross-origin queries
app.use(function(req,res,next){
	res.setHeader('Access-Control-Allow-Origin','*');
	res.setHeader('Access-Control-Allow-Headers','X-Requested-With, Content-Type, Accept');
	res.setHeader('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
	next();
});

// adding functionality to log the requests
app.use(function (req, res, next) {
	let filename = path.basename(req.url);
	let extension = path.extname(filename);
	console.log("The file " + filename + " was requested.");
	next();
});

// Mount API routes from backend
// Express 5.x has built-in body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const geoJSON = require('../backend/routes/geoJSON');
app.use('/api/geojson',geoJSON);

const crud = require('../backend/routes/crud');
app.use('/api',crud);

// Serve static files (must be after API routes)
app.use(express.static(__dirname));