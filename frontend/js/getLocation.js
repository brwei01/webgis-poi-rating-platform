"use strict";
let getLocationLayer = [];

function getLocation() {
	alert('getting location');
	navigator.geolocation.getCurrentPosition(getPosition);
}

function getPosition(position) {
	
	// // Remove the previous marker if it exists (keep only the latest position)
	// if (getLocationLayer.length > 0) {
	// 	// Remove the last marker from the map
	// 	mymap.removeLayer(getLocationLayer[getLocationLayer.length - 1]);
	// 	// Remove it from the array
	// 	getLocationLayer.pop();
	// }
	
	//add the new point into the array by the 'push' command
	let marker = L.marker([position.coords.latitude, position.coords.longitude])
	getLocationLayer.push(marker.addTo(mymap));
	mymap = mymap.setView([position.coords.latitude, position.coords.longitude],13);

	// log to check items in getLocation Layer and featureGroup
	console.log(getLocationLayer)
	console.log(featureGroup)

	document.getElementById("showLocation").innerHTML = "Latitude: " + position.coords.latitude + 
	"<br>Longitude: " + position.coords.longitude + "<br>Horizontal Accuracy: "+ position.coords.accuracy + 
	"<br>Altitude Accuracy:"+position.coords.altitudeAccuracy+"<br>Heading:" + position.coords.heading + 
	"<br>Speed: " + position.coords.speed + "<br>Altitude: " + position.coords.altitude;
}
