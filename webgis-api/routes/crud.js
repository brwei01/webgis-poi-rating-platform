"use strict"

const express = require('express');
const pg = require('pg');
const crud = require('express').Router();
const fs = require('fs');

// get the username --this ensures that we can use the same code on different machines
const os = require('os');
const userInfo = os.userInfo();
const username = userInfo.username;
console.log(username);

// locate the database login details
const configtext = "" + fs.readFileSync("/home/" + username + "/certs/postGISConnection.js");
// convert the configuration file into the correct format
// i.e. a name/value pair array
const configarray = configtext.split(",");
let config = {};
for (let i=0; i<configarray.length; i++){
	let split = configarray[i].split(":");
	config[split[0].trim()] = split[1].trim();
}
const pool = new pg.Pool(config);
console.log(config);

const bodyParser = require('body-parser'); 
const e = require('express');
crud.use(bodyParser.urlencoded({ extended: true }));

// test endpoint for GET requests (can be called from a browser URL or AJAX) 
crud.get('/testCRUD',function (req,res) {
    res.json({message:req.originalUrl+" " +"GET REQUEST"}); 
 });
 // test endpoint for POST requests - can only be called from AJAX 
 crud.post('/testCRUD',function (req,res) {
     res.json({message:req.body}); 
 });
 


// ======================================================= 
// first get the userID
// userid endpoint
crud.get('/userId',function (req,res) {
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection" + err);
            res.status(400).send(err);
        }
        let query = "select user_id from ucfscde.users where user_name = current_user";
        client.query(query, function(err, result){
            done();
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            res.status(200).send(result.rows);
        });
    });  
    //res.json({message:req.originalUrl+" " +"GET REQUEST"}); 
});




// =======================================================
// get conditionDetails
crud.get('/conditionDetails',function (req,res) {
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection" + err);
            res.status(400).send(err);
        }
        let query = "select * from cege0043.asset_condition_options";
        client.query(query, function(err, result){
            done();
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            res.status(200).send(result.rows);
        });
    });  
    //res.json({message:req.originalUrl+" " +"GET REQUEST"}); 
});
 

// =======================================================
// INSERT ASSET POINT
crud.post('/insertAssetPoint',function (req,res) {
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection" + err);
            res.status(400).send(err);
        }

        let assetName = req.body.asset_name;
        let installationDate = req.body.installation_date;

        let geometrystring = "st_geomfromtext('POINT("+req.body.longitude+ " "+req.body.latitude +")',4326)";
        let querystring = "INSERT into cege0043.asset_information (asset_name,installation_date,location) values ";
        querystring += "($1,$2,";
        querystring += geometrystring + ")"
        client.query(querystring, [assetName, installationDate], function(err, result){
            done();
            if(err){
                if(err.constraint === "asset_name_unique"){
                    res.status(400).send("Asset name already exists");    
                }else{
                    console.log(err);
                    res.status(400).send(err);  
                }              
            }
            else{
                res.status(200).send("Asset: " + req.body.asset_name + " is saved.");
            }
            
        });
    });  
    //res.json({message:req.body}); 
});



// condition survey

// userid endpoint
crud.post('/insertConditionInformation',function (req,res) {
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection" + err);
            res.status(400).send(err);
        }

        let assetName = req.body.asset_name;
        let conditionDescription = req.body.condition_description;

        let querystring = "INSERT into cege0043.asset_condition_information (asset_id, condition_id) values (";
	    querystring += "(select id from cege0043.asset_information where asset_name = $1),(select id from cege0043.asset_condition_options where condition_description = $2))";

        client.query(querystring, [assetName, conditionDescription], function(err, result){
            done();
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            else{
                res.status(200).send(conditionDescription);
            }
            
            
        });
    });  
    //res.json({message:req.body}); 
});



// DELETE ASSET
crud.post('/deleteAsset',function (req,res) {
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection" + err);
            res.status(400).send(err);
        }

        let deleteID = req.body.id;
        
        let querystring = "DELETE from cege0043.asset_information where id = $1";
        client.query(querystring, [deleteID], function(err, result){
            done();
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            else{
                res.status(200).send("Asset " + deleteID + " has been deleted.");
            }

        });
    });
    //res.json({message:req.body}); 
});



// DELETE CONDITION REPORT
crud.post('/deleteConditionReport',function (req,res) {
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection" + err);
            res.status(400).send(err);
        }

        // get the id from asset_condition_information table
        let deleteConditionID = req.body.id;
          
        let querystring = "DELETE from cege0043.asset_condition_information where id = $1";
        client.query(querystring, [deleteConditionID], function(err, result){
            done();
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            else{
                res.status(200).send("Condition " + deleteConditionID + " has been deleted.");
            }
            
        });
    });
    //res.json({message:req.body}); 
});

// end of the file
module.exports = crud;