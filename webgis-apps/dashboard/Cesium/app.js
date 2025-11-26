// express is the server that forms part of the nodejs program
"use strict";
let express = require('express');
let path = require("path");
let fs = require('fs');
let app = express();

// add an https server to serve files 
let http = require('http');

let httpServer = http.createServer(app);
let httpServerPort = 4443;

httpServer.listen(httpServerPort);

app.get('/',function (req,res) {
	res.send("Hello World from the App Server on Node port "+httpServerPort + " (mapped to Apache port 443)");
});

// adding functionality to log the requests
app.use(function (req, res, next) {
	let filename = path.basename(req.url);
	let extension = path.extname(filename);
	console.log("The file " + filename + " was requested.");
	next();
});

app.use(express.static(__dirname));

