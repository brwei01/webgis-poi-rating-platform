"use strict";
//global variable to store the map
let mymap; 
// create a custom popup as a global variable
let popup = L.popup();
// get server url, this will be used in all js files
// const serverURL = document.location.origin;
const serverURL = "http://localhost:3000"; // 本地测试只能先用这个地址


// ==========================================================================
// ==========================================================================
// function to create an event detector to wait for the user's click event 
// and then use the popup to show them where they clicked in a message

// create a global variable to store the lat and long
let latitude = 0;
let longitude = 0;

function onMapClick(e){
    latitude = e.latlng.lat;
    longitude = e.latlng.lng;

    let formHTML = basicFormHtml();
    popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString() + "<br>" + formHTML)
    .openOn(mymap);
}


// ==========================================================================
// function loading leafletmap
console.log("initializing the map");
function loadLeafletMap(){
    //call the code to add the markers
    addBasicMarkers();
    // add the click event detector to the map
    mymap.on('click', onMapClick);
}//end code to add the leaflet map
console.log("map created");


// ==========================================================================
// function set the view around a initialzed locaiton (UCL) 
// and load the map layer from source
console.log("starting to add basic markers");
function addBasicMarkers(){

        mymap = L.map('mapid').setView([51.524766, -0.133583], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a >'
        }).addTo(mymap);      
    }
console.log("basic markers added");



// create a global variable to store and update the window width
let width;
// create a feature group to hold all points
const featureGroup = L.featureGroup();
// create a variable to check the window size small or large
let windowSmall;

// function to set up the click behaviour for the map
function setMapClickEvent(){
    
    // the requirements are:
    // use the bs medium and large options for the asset location capture
    // and the samll and xs options for the condition option
    // references:  https://www.w3schools.com/bootstrap/bootstrap_grid_system.asp

    // get the window width
    width = $(window).width();
    
    // if window size is bootStrap s or xs
    // create markers on the map layer and set up click events on these markers
    if(width<768){
        windowSmall = true;
        //console.log("before removal: " + featureGroup.getLayers().length)
        //remove all markers on the map if exists any
        if(featureGroup.getLayers().length > 0){
            featureGroup.clearLayers();
            mymap.removeLayer(featureGroup);
            console.log("after removal: " + featureGroup.getLayers().length)
        }
        // cancel the map onclick event using off
        // so that no reactions if clicking on map. (no asset creation form)
        mymap.off('click', onMapClick)
        // call tracklocation to track user location 
        // adn automatically popup the condition assessment form of a closest asset
        trackLocation();
        // reload the the featureGroup by creating markers again:
        setUpPointClick();


    }
    // if window size is bootStrap lg,
    // load the asset creation popup form
    else if(width < 1200 && width >= 992){
        windowSmall = false;
        //console.log("before removal: " + featureGroup.getLayers().length)
        // remove all markers on the map if exists any
        if(featureGroup.getLayers().length > 0){
            featureGroup.clearLayers();
            mymap.removeLayer(featureGroup);
            console.log("after removal: " + featureGroup.getLayers().length)
        }
        // the on click functionality of the MAP pops up an asset creation form
        mymap.on('click', onMapClick); 
        // reload the the featureGroup by creating markers again:
        setUpPointClick();
    }
    else {
      // if featureGroup is not empty, remove the featureGroup from mymap
      // remove all markers on the map if exists any
        if(featureGroup.getLayers().length > 0){
            mymap.removeLayer(featureGroup);
        }
         mymap.off('click', onMapClick);   
    }
    
}

// ======================================================
// set map click event for routing page
function setMapClickEventRouting(){
    if (featureGroup.getLayers().length > 0) {
      featureGroup.clearLayers();
      mymap.removeLayer(featureGroup);
      console.log("after removal: " + featureGroup.getLayers().length);
    }
    mymap.off('click', onMapClick);
    setUpPointClick('routing');
}


// =====================================================================================
// the function to create markers on map from database
// and pop up condition information or condition assessment according to different window sizes
function setUpPointClick(popupType = 'default') {

    // create a geoJSON feature by making an AJAX call to load the asset points on the map
    getUserAssets().then((geojsonFeatures) => {
        // iterate over all features and add them to the group
        geojsonFeatures.forEach((feature) => {   

            // define variables to store the data get from request
            // for the hidden div on condition assessment form:
            let userId = feature.properties.user_id;
            let assetId = feature.properties.asset_id;

            // for the divs on condition assessment and condition information forms:
            let assetName = feature.properties.asset_name;
            let installationDate = feature.properties.installation_date;
            let previousConditionDescription = feature.properties.condition_description;

            // to get the asset geometry, for marker creation:
            let coords = feature.geometry.coordinates;

            // create the marker according to the geometry of the asset from request.
            let asset = L.marker([coords[1], coords[0]], {
                assetId: assetId,
                assetName: assetName,
                condition_description: previousConditionDescription,
                coords: coords
            })
            
            // define the pop up html depending on window size
            let popUpHTML;
            if (popupType === 'default') {
                if (windowSmall) {
                  popUpHTML = getPopupHTML(assetName, installationDate, previousConditionDescription, userId, assetId);
              } else if(!windowSmall) {
                  popUpHTML = getPopupCondition(assetName, installationDate, previousConditionDescription); 
              } 
            } else if (popupType === 'routing') {
                popUpHTML = getPopupHTMLRouting(assetName, installationDate, userId, assetId, coords);
            }
 
            asset.bindPopup(popUpHTML);
            // add the marker to the featureGroup
            featureGroup.addLayer(asset);    
        });
        // set Marker colors dependint on their condition descriptions
        setMarkerColours(featureGroup);
        // add the point group to the map
        featureGroup.addTo(mymap);   
        // zoom the map to the bounding box of all points
        mymap.fitBounds(featureGroup.getBounds());

    }).catch((error) => {
        console.error(error);
    });

}


// ======================================================
// get user Assets from the server
function getUserAssets() {
    let userId;
    // create promise object to store the asset data get from api.
    const promise = new Promise((resolve, reject) => {
      console.log("serverURL: " + serverURL);
      // get the userId
      $.ajax({
        type: 'GET',
        url: serverURL + '/api/userId',
        success: function(response) {
          userId = response[0].user_id;
          console.log(userId);
          // using userId to get the full api storing user created assets data
          $.ajax({
            type:'GET',
            url: serverURL + '/api/geojson/userAssets/' + userId,
            success: function(response){
              const data = response[0];
              //console.log(data.features);
              // Check if data and features exist
              if(data && data.features && Array.isArray(data.features)){
                // store each feature in userAssets 
                data.features.forEach(feature => {
                  // add user_id as one of the properties of that feature
                  feature.properties.user_id = userId;
                });
                // to return a promise object that resolves with an array of GeoJSON features.
                // to fulfill the promise with the data obtained from the server.
                resolve(data.features);
              } else {
                // Return empty array if no features
                resolve([]);
              }
            },
            error: function(){
              console.error('Failed to get the user assets.');
              reject(new Error('Failed to get user assets.'));
            }
          }); 
        },
        error: function() {
          console.error('Failed to get user ID');
          reject(new Error('Failed to get user ID'));
        }
      });
    });
    return promise
  }



//========================================================================
// FUNCTION TO SET MARKER COLOURS
function setMarkerColours(featureGroup){
    featureGroup.eachLayer(asset => {
    let colour = "gray";
    let condition = asset.options.condition_description;
    // get the radio button values
    if(condition === 'Element is in very good condition'){
        colour = "green"
    }
    if(condition === 'Some aesthetic defects, needs minor repair'){
        colour = "blue";
    }
    if(condition === 'Functional degradation of some parts, needs maintenance'){
        colour = "orange";
    }
    if(condition === 'Not working and maintenance must be done as soon as reasonably possible'){
        colour = "red";
    }
    if(condition === 'Not working and needs immediate, urgent maintenance'){
        colour = "purple";
    }
    if(condition === 'Unknown' || !condition){
        colour = "gray";
    }           
    let colouredMarker = L.AwesomeMarkers.icon({icon: 'play',markerColor: colour});
    //console.log(colour);
        asset.setIcon(colouredMarker);  
    })
  }
  
  



// =================================================================
// =================================================================
// HTML FOR POPUP FORMS

// ================================================================================
// function to pop up a condition information form on the point(when the screen width is lg)
// refer to core functionality 2
function getPopupCondition(assetName, installationDate, previousConditionDescription){
    var myvar = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Asset Information</title>
                </head>
                <body>
                    <div id="installationDate">Asset Name: `+ assetName +`</div>
                    <div id="installationDate">Installation Date: `+ installationDate +`</div>
                    <div id="installationDate"> Previous Condition Description: `+ previousConditionDescription +`</div>
                </body>
                </html>`;
    return myvar
}


// ================================================================================================================
// function to pop up a condition assessment form on the point(when the screen size is xs/s)
function getPopupHTML(assetName, installationDate, previousConditionDescription, userId, assetId){

    var myvar = `
<!DOCTYPE html>
<head>
<title>Condition Survey</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js"></script>
</head>
<body>
<h1 style="font-size: medium;">Please fill in the condition survey</h1>

<div>

<div id="assetName">`+ assetName +`</div>
<div id="installationDate">`+ installationDate +`</div>
<div id="userID" style="display: none;">`+ userId +`</div>
<div id="assetID" style="display: none;">`+ assetId +`</div>

<p>What is the condition of this asset?</p>
  <!-- Use a loop to create radio buttons for each condition in the API endpoint -->
  <!--div id="conditionInputs">
    <button onclick="createConditionInputs();">Load Conditions</button>
  </div-->

  Condition 1: <input type="radio" name="amorpm" id="condition1"/>Element is in very good condition<br />
	Condition 2: <input type="radio" name="amorpm" id="condition2"/>Some aesthetic defects, needs minor repair<br />
	Condition 3: <input type="radio" name="amorpm" id="condition3"/>Functional degradation of some parts, needs maintenance<br />
	Condition 4: <input type="radio" name="amorpm" id="condition4"/>Not working and maintenance must be done as soon as reasonably possible<br />
	Condition 5: <input type="radio" name="amorpm" id="condition5"/>Not working and needs immediate, urgent maintenance<br />
  Condition 6: <input type="radio" name="amorpm" id="condition6"/>Unknown<br />


<div id="newConditionValue"></div>
<!--hidden fields-->
<div id="previousConditionDescription" style="display:none;">`+previousConditionDescription+`</div>
<div id="assetID" style="display:none;">609</div>


<p>Click here to save your feedback</p>
<button  id="saveCondition" onclick="saveConditionInformation()">Save Condition</button>
<br />
<br />
<div id="conditionResult">Response DIV for conditionResult</div>
<br />
<br />


<label for="deleteConditionID">Delete Condition ID:</label>
<input type="text" id="deleteConditionID"/><br>
<button id="deleteCondition" onclick="deleteConditionRecord()">Delete Condition Record</button>
<div id="deleteConditionResponse">The result of the deletion goes here</div>

</body>    
    `;
     
    return myvar
}

// ====================================================================
// 路由页面的弹窗表单
function getPopupHTMLRouting(assetName, installationDate, userId, assetId, coords) {
    let lat = coords[1];
    let lng = coords[0];
    return `
<!DOCTYPE html>
<head>
    <title>Routing Form</title>
</head>
<body>
    <h1 style="font-size: medium;">Route Planning</h1>
    
    <div id="assetName">Asset: ${assetName}</div>
    <div id="installationDate">Date: ${installationDate}</div>
    <div id="userID" style="display: none;">${userId}</div>
    <div id="assetID" style="display: none;">${assetId}</div>
    
    <p>Select destination:</p>
    <button onclick="setAsDestination(${assetId}, ${lat}, ${lng},'${assetName}')">Set as Destination</button>

    <p>Or Add To Routes:</p>
    <button onclick="addToRoute(${assetId}, ${lat}, ${lng},'${assetName}')">Add to Route</button>

    <p>After setting destination or adding waypoints, click below to calculate route:</p>
    <button onclick="calculateRoute()">Calculate Route</button>
    
    <br /><br />

    <div id="routeResult"></div>
</body>
    `;
}


// ====================================================================
// the function to create asset creation form
function basicFormHtml() {

let mylet = `
<head>
    <title>Asset Creation Form</title>
</head>
<body>
    <h1 style="font-size: medium;">Please fill up the below to create asset</h1>

    <div>

        <label for="assetName">Asset Name</label><input type="text" size="25" id="assetName"/><br />
        <label for="installationDate">Installation date</label><input type="date" size="25" id="installationDate"/><br />
        <br />
        <br />

        <label for="latitude">Latitude</label><input type="text" size="25" value=`+latitude+` id="latitude"/><br />
        <label for="longitude">Longitude</label><input type="text" size="25" value=`+longitude+` id="longitude"/><br />


        <div id="userID" style="display: none;"> 6684 </div><br />

        <p>Click here to upload the data</p>
        <button id="saveAsset" onclick="saveNewAsset()">Start Data Upload</button>
        <br />
        <br />
        <div id="ResponseDIVAsset">The result of save asset goes here</div>
        <br />
        <br />

        <label for="deleteID">Delete ID:</label>
        <input type="text" id="deleteID"/><br>
        <button id="deleteAsset" onclick="deleteSingleAsset()">Delete Single Asset</button>
        <div id="deleteAssetResponse">The result of the deletion goes here</div>

    </div>
</body>
`;

return mylet;

}





/*
// this function is a non-hardcoding version of setMarkerColours();
function setMarkerColours(featureGroup, seed) {
  // Create a dictionary to store random colors for each condition
  let conditionColors = {};

  // Loop through each layer in the feature group to set the marker color for each condition
  featureGroup.eachLayer(layer => {
    let condition = layer.options.condition_description;
    let colour = conditionColors[condition] || "gray"; // Retrieve the random color for the condition from the dictionary or use gray as the default color
    let colouredMarker = L.AwesomeMarkers.icon({icon: 'play',markerColor: colour});
    layer.setIcon(colouredMarker);  
  });

  console.log(conditionColors)
}
*/  













