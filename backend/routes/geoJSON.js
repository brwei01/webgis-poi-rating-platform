"use strict"

const express = require('express');
const pg = require('pg');
const geoJSON = require('express').Router();
const fs = require('fs');

// get the username --this ensures that we can use the same code on multiple machines
const os = require('os');
const userInfo = os.userInfo();
const username = userInfo.username;
console.log(username);

// locate the database login details
let config = {};
try {
	const configtext = "" + fs.readFileSync("/home/" + username + "/certs/postGISConnection.js");
	// convert the configuration file into the correct format
	// i.e. a name/value pair array
	const configarray = configtext.split(",");
	for (let i=0; i<configarray.length; i++){
		let split = configarray[i].split(":");
		config[split[0].trim()] = split[1].trim();
	}
	console.log("Using config file:", config);
	// const pool = new pg.Pool(config);
} catch (err) {
	console.log("Config file not found, using Docker/local configuration");
}

// Use Docker/local configuration (fallback or default)
// Match the configuration in docker-compose.yml
const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,      // ← 从环境变量读取
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  }); // <- docker 部署数据库
  
const bodyParser = require('body-parser'); 
const e = require('express');
geoJSON.use(bodyParser.urlencoded({ extended: true }));

geoJSON.route('/testGeoJSON').get(function(req,res){
	res.json({message:req.originalUrl})
});
geoJSON.route('/testGeoJSON').post(function(req,res){
	res.json({message:req.body})
});


// ===============================================================
// REFERENCE: A2
// Code to get only the geoJSON asset locations for a specific user_id
// Use when first loading the web page and also when another layer is removed
geoJSON.get('/userAssets/:user_id',function (req,res) {
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection" + err);
            res.status(400).send(err);
        }

        // get the id from asset_condition_information table
        let userID = req.params.user_id;

        var colnames = "asset_id, asset_name, installation_date, latest_condition_report_date, condition_description, condition_id";
        var querystring = " SELECT 'FeatureCollection' As type, ";
        querystring += "CASE WHEN COUNT(f.*) = 0 THEN '[]'::json ELSE array_to_json(array_agg(f)) END As features ";
        querystring += "FROM (";
        querystring += "SELECT 'Feature' As type, ST_AsGeoJSON(lg.location)::json As geometry, ";
        querystring += "row_to_json((SELECT l FROM (SELECT "+colnames + " ) As l)) As properties ";
        querystring += "FROM cege0043.asset_with_latest_condition As lg ";
        querystring += "WHERE user_id = $1 LIMIT 100";
        querystring += ") As f";


        client.query(querystring, [userID], function(err, result){
            done();
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            else{
                // Handle empty results - ensure features is always an array
                let responseData;
                if(result.rows.length === 0 || !result.rows[0]){
                    responseData = [{
                        type: 'FeatureCollection',
                        features: []
                    }];
                } else {
                    // Ensure features is an array, not null
                    let features = result.rows[0].features;
                    if(features === null || features === undefined){
                        features = [];
                    }
                    responseData = [{
                        type: 'FeatureCollection',
                        features: features
                    }];
                }
                res.status(200).send(responseData);
            }
            
        });
    });
    //res.json({message:req.body}); 
});




// ==========================================================================================
// REFERENCE: A3
// Condition App: user is told how many condition reports they have saved, when they add a new condition report (xxxx is the user_id of the particular person)
// $1 is the user_id parameter passed to the query
geoJSON.get('/userConditionReports/:user_id', function(req,res){
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection" + err);
            res.status(400).send(err);
        }
        let userID = req.params.user_id;
        var querystring = "select array_to_json (array_agg(c)) from (SELECT COUNT(*) AS num_reports from cege0043.asset_condition_information where user_id = $1) c;"
        client.query(querystring,[userID],function(err,result){
            done();
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            else{
                res.status(200).send(result.rows);
            }
            
        });
    });
}); 



// ===============================================================================================================================
// REFERENCE S1
// Condition App: user is given their ranking (based on condition reports, in comparison to all other users) (as a menu option)
// $1 is the user_id parameter passed to the query
geoJSON.get('/userRanking/:user_id', function(req,res){
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection" + err);
            res.status(400).send(err);
        }
        let userID = req.params.user_id;

        var querystring = "select array_to_json (array_agg(hh)) from";
        querystring += "(select c.rank from (SELECT b.user_id, rank()over (order by num_reports desc) as rank ";
        querystring += "from (select COUNT(*) AS num_reports, user_id ";
        querystring += "from cege0043.asset_condition_information ";
        querystring += "group by user_id) b) c ";
        querystring += "where c.user_id = $1) hh;";

        client.query(querystring,[userID],function(err,result){
            done();
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            else{
                res.status(200).send(result.rows);
            }
            
        });
    });
}); 


// ===============================================================
// REFERENCE L1
// Asset Location App: list of all the assets with at least one report saying that they are in the best condition  (via a menu option) 
// Return result as a JSON list

geoJSON.get('/assetsInGreatCondition', function(req,res){
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection" + err);
            res.status(400).send(err);
        }

        var querystring = "select array_to_json (array_agg(d)) from";
        querystring += "(select c.* from cege0043.asset_information c ";
        querystring += "inner join ";
        querystring += "(select count(*) as best_condition, asset_id from cege0043.asset_condition_information where ";
        querystring += "condition_id in (select id from cege0043.asset_condition_options where condition_description like '%very good%') ";
        querystring += "group by asset_id ";
        querystring += "order by best_condition desc) b ";
        querystring += "on b.asset_id = c.id) d;";


        client.query(querystring,function(err,result){
            done();
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            else{
                res.status(200).send(result.rows);
            }
            
        });
    });
}); 

// ===============================================================
// REFERENCE L2
// Asset App: graph showing daily reporting rates for the past week (how many reports have been submitted, and how many of these had condition as one of the two 'not working' options) (as a menu option)
// return data as JSON so that it can be used in D3 For all users
geoJSON.get('/dailyParticipationRates', function(req,res){
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection" + err);
            res.status(400).send(err);
        }

        var querystring = "select  array_to_json (array_agg(c)) from ";
        querystring += "(select day, sum(reports_submitted) as reports_submitted, sum(not_working) as reports_not_working ";
        querystring += "from cege0043.report_summary ";
        querystring += "group by day) c;";


        client.query(querystring,function(err,result){
            done();
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            else{
                res.status(200).send(result.rows);
            }
            
        });
    });
}); 

// ===============================================================
// REFERENCE S2
// Condition App: map layer showing the 5 assets closest to the user’s current location, added by any user.  The layer must be added/removed via a menu option
// Return result as GeoJSON for display purposes
// XXX and YYY are the lat/lng of the user
// note that as this is a geomfromtext situation you can't use the standard $1, $2 for these variables - instead build the query up using strings

geoJSON.get('/userFiveClosestAssets/:latitude/:longitude', function(req,res){
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection" + err);
            res.status(400).send(err);
        }


        var querystring = "SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
        querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry, ";
        querystring += "row_to_json((SELECT l FROM (SELECT id, asset_name, installation_date) As l ";
        querystring += ")) As properties ";
        querystring += "FROM   (select c.* from cege0043.asset_information c ";
        querystring += "inner join (select id, st_distance(a.location, st_geomfromtext('POINT(" + req.params.longitude + " " + req.params.latitude + ")',4326)) as distance ";
        querystring += "from cege0043.asset_information a ";
        querystring += "order by distance asc ";
        querystring += "limit 5) b ";
        querystring += "on c.id = b.id ) as lg) As f";


        client.query(querystring, function(err,result){
            done();
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            else{
                res.status(200).send(result.rows);
            }
            
        });
    });
}); 

// The above code block adds a new geoJSON.get request to the file, which returns a list of all the assets with at least one report saying that they are in the worst condition. The query is executed when the user navigates to the '/assetsInWorstCondition' endpoint.




// ===============================================================
// REFERENCE S3
// Condition App: map showing the last 5 reports that the user created (colour coded depending on the conditition rating)
// Return result as GeoJSON， $1 is the user_id
geoJSON.get('/lastFiveConditionReports/:user_id', function(req,res){
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection" + err);
            res.status(400).send(err);
        }
        let userID = req.params.user_id;

        var querystring = "SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
        querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry, ";
        querystring += "row_to_json((SELECT l FROM (SELECT id,user_id, asset_name, condition_description ";
        querystring += ") As l ";
        querystring += " )) As properties ";
        querystring += " FROM ";
        querystring += "(select * from cege0043.condition_reports_with_text_descriptions ";
        querystring += "where user_id = $1 ";
        querystring += "order by timestamp desc ";
        querystring += "limit 5) as lg) As f";



        client.query(querystring,[userID],function(err,result){
            done();
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            else{
                res.status(200).send(result.rows);
            }
            
        });
    });
}); 

// ===============================================================
// REFERENCE S4
// Condition App: App only shows assets and calculates proximity alerts for assets that the user hasn’t already given a condition report for in the last 3 days
// so generate a list of the user's assets for which no condition report exists
// return as GeoJSON
// $1 and $2 are the user_id for the user

geoJSON.get('/conditionReportMissing/:user_id', function(req,res){
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection" + err);
            res.status(400).send(err);
        }
        let userID = req.params.user_id;


        var querystring = "SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
        querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry, ";
        querystring += "row_to_json((SELECT l FROM (SELECT asset_id, asset_name, installation_date, latest_condition_report_date, condition_description) As l ";
        querystring += " )) As properties ";
        querystring += " FROM ";
        querystring += "(select * from cege0043.asset_with_latest_condition ";
        querystring += "where user_id = $1 and ";
        querystring += "asset_id not in ( ";
        querystring += "select asset_id from cege0043.asset_condition_information ";
        querystring += "where user_id = $1 and ";
        querystring += "timestamp > NOW()::DATE-EXTRACT(DOW FROM NOW())::INTEGER-3)  ) as lg) As f";


        client.query(querystring,[userID],function(err,result){
            done();
            if(err){
                console.log(err);
                res.status(400).send(err);
            }
            else{
                res.status(200).send(result.rows);
            }
            
        });
    });
}); 

module.exports = geoJSON;