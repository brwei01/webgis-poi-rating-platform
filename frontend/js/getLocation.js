"use strict";

function getLocation() {
	alert('getting location');
	navigator.geolocation.getCurrentPosition(getPosition);
}

function getPosition(position) {
	document.getElementById("showLocation").innerHTML = "Latitude: " + position.coords.latitude + 
	"<br>Longitude: " + position.coords.longitude + "<br>Horizontal Accuracy: "+ position.coords.accuracy + 
	"<br>Altitude Accuracy:"+position.coords.altitudeAccuracy+"<br>Heading:" + position.coords.heading + 
	"<br>Speed: " + position.coords.speed + "<br>Altitude: " + position.coords.altitude;
}
