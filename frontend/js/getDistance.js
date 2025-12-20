"use strict";

function getDistance(){
	alert('getting distance');
	// getDistanceFromPoint is the function called once the distance has been found
	navigator.geolocation.getCurrentPosition(getDistanceFromPoint)
}

function getDistanceFromPoint(position){
	// find the corrdinates of a point using this website
	// these are the coordinates for Warren St
	let lat = 51.524616
	let lng = -0.13818
	// return the distance in kilometers
	let distance = calculateDistance(position.coords.latitude, position.coords.longitude, lat,lng, 'K');
	document.getElementById("showDistance").innerHTML='Distance:' + distance;
}

// code adapted from https://www.htmlgoodies.com/beyond/javascript/calculate-the-distance-between-two-points-in-your-web-apps.html

function calculateDistance(lat1, lon1, lat2, lon2, unit){
	let radlat1 = Math.PI * lat1/180;
	let radlat2 = Math.PI * lat2/180
	let radlon1 = Math.PI * lon1/180;
	let radlon2 = Math.PI * lon2/180;
	let theta = lon1-lon2;
	let radtheta = Math.PI*theta/180
	let subAngle = Math.sin(radlat1)*Math.sin(radlat2)+Math.cos(radlat1)*Math.cos(radlat2)*Math.cos(radtheta);
	subAngle = Math.acos(subAngle);
	subAngle = subAngle * 180/Math.PI  // converting the degree value returned by acos back to degrees from radians
	let dist = (subAngle/360) * 2 * Math.PI * 3956; // ((subteded angle in degrees/360)*2*pi*radius), where the radius of the earth is 3956 miles
	if (unit=='K'){dist=dist*1.609344;} //convert miles to km
	if (unit=="N"){dist=dist*0.8684;} // convert miles to nautical miles
	return dist
}