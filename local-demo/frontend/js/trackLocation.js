"use strict";

// create an array to store all the location tracking points
let trackLocationLayer = [];

// store the ID of the location tracker so that it can be used to switch the location tracking off
let geoLocationID;


// ====================================================
// fucntion to track user location
function trackLocation(){
	if(navigator.geolocation){
		//first test to see if there is an active tracing and clear it if so.
		try{
			(navigator.geolocation.clearWatch(geoLocationID));
		}
		catch (e){
			console.log(e);
		}
		//clear any existing data from the map
		removeTracks();
		
		//set some parameters --e.g. how often to renew, what timeout to set
		const options = {
			enableHighAccuracy:true,
			maximumAge:30000,
			timeout:27000
		};
		// get user location, with showPosition and errorPosition denoting 2 situations:
		// if the position can be get or if there is an error
		geoLocationID = navigator.geolocation.watchPosition(showPosition, errorPosition, options);
	}
	else{
		document.getElementById('showLocation').innerHTML = "Geolocation is not supported by this browser.";
	}
}

// =============================================
// fucntion to tell the track what to do if there is an error 
function errorPosition(error){
	alert(error);
}

// =============================================
// to tell the tracker what will be done with the coordinates 
function showPosition(position){
	// Remove the previous marker if it exists (keep only the latest position)
	if (trackLocationLayer.length > 0) {
		// Remove the last marker from the map
		mymap.removeLayer(trackLocationLayer[trackLocationLayer.length - 1]);
		// Remove it from the array
		trackLocationLayer.pop();
	}
	
	//add the new point into the array by the 'push' command
	let marker = L.marker([position.coords.latitude, position.coords.longitude])
	trackLocationLayer.push(marker.addTo(mymap));
	mymap = mymap.setView([position.coords.latitude, position.coords.longitude],13);

	// log to check items in trackLocation Layer and featureGroup
	//console.log(trackLocationLayer)
	//console.log(featureGroup)
	
	// call closestFormPoint to show the popup for the closest point
	const closestPoint = getClosestPoint(5);
	// show the popup for the closest point, if one was found
	if (closestPoint !== null) {
		closestPoint.openPopup();
		} 
}


// =============================================
// function to remove the position points
function removePositionPoints(){
	// disable the location tracking so that a new point won't be added while removing the old points 
	// use the geoLocationID to do this
	navigator.geolocation.clearWatch(geoLocationID);
	removeTracks();
}

// =============================================
// function to loop through the array and remove any points
function removeTracks(){
	for (let i = trackLocationLayer.length-1; i>-1; i--){ // start with the last point first.
		console.log("removing point" + i + "which has coordinates" + trackLocationLayer[i].getLatLng());
		mymap.removeLayer(trackLocationLayer[i]);
		// using the pop command to totally remove the points from the array where they are stored.
		trackLocationLayer.pop();
	}

}



// =============================================
// function to get the closest Point within a set distance.
function getClosestPoint(proximityDistance) {

	// initialize the closest point and closest distance
	// which will be iterated later/
	let closestPoint = null;
	let closestDistance = Infinity; 

	// get the latest position of user from the track location array
	let lastLayer = trackLocationLayer[trackLocationLayer.length-1];
	console.log(lastLayer)

	// get the coordinates of this latest position
	let userLat = lastLayer.getLatLng().lat;
	let userLng = lastLayer.getLatLng().lng;
	console.log(userLat, userLng)
  
	// loop through all the points in the 'featureGroup' layer and calculate the distance to the user's location
	featureGroup.eachLayer(function(layer) {
		
	  // calculate the distances between each feature in featureGroup and the latest user position
	  const distanceToUser = calculateDistance(userLat, userLng,layer.getLatLng().lat, layer.getLatLng().lng, 'K')

	  // check if the distance is within the given range and closer than any previously found point;
	  // iterate to get the closest feature with the closest feature.
	  if (distanceToUser <= proximityDistance && distanceToUser < closestDistance) {
		closestPoint = layer;
		closestDistance = distanceToUser;
	  }
	});

	return closestPoint
  }

  
  

