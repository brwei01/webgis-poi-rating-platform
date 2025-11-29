"use strict"
// create an empty array (global variable)
let listOfRooms = []

// ================================================================
// rooms

let roomsLayer
function loadRooms(rooms){
	// check if the item is loaded already
	for (let i=0;i<listOfRooms.length;i++) {
		if (listOfRooms[i].rooms == rooms){
			console.log("equal");
			alert("Rooms already loaded");
			return;
		}
	}

let roomsURL = document.location.origin + "/api/geojson/ucfscde/rooms/room_id/location";
$.ajax({url:roomsURL, crossDomain: true, success: function(result){
	console.log(result); // check that the data is correct


	// load the rooms geoJSON layer
    roomsLayer = L.geoJSON().addTo(mymap).bindPopup("<b>"+"This is a room"+"</b>");
    roomsLayer.addData(result);
    
    let rmstyle = {
                    "color":"#08EA3E",
                    "weight":10,
                    "opacity":0.75
                };

    // set layer style
    roomsLayer.eachLayer(function(layer){
    	console.log(layer);
    	layer.setStyle(rmstyle);
    });

    // change the map zoom so that all the data is shown
    mymap.fitBounds(roomsLayer.getBounds());
	
    
	// add rooms into the array so that it can be referenced later
	// push adds an item to the top of the array
	let newRooms = result;
	listOfRooms.push(newRooms);
	} // end of innter function
}); // end of ajax request
} // end of function loadThing

function listAllRooms(){
	console.log("***********************");
	console.log("**********Curret Ethernet Cables**************");
	for (let i=0;i<listofRooms;i++){
		console.log(listofRooms[i].rooms);
	}
	console.log("***********************************************");
}


function removeRooms(rooms){
	for (let i=0;i<listOfRooms.length;i++){
		if (listOfRooms[i].rooms == rooms){
			console.log("equal");

			try{
            	alert("Rooms will be removed");
            	mymap.removeLayer(roomsLayer);
    		}catch(err){
        	alert("Layer does not exist:" + err);
    		}

			listOfRooms.splice(i,1);
			// now have 1 less element in the array. so when try to get the last element it won't be there anymore
			break;
		}
	}
}



// ================================================================
// ================================================================
// buildings

// create an empty array (global variable)
let listOfBuildings = []

let buildingsLayer
function loadBuildings(buildings){
	// check if the item is loaded already
	for (let i=0;i<listOfBuildings.length;i++) {
		if (listOfBuildings[i].buildings == buildings){
			console.log("equal");
			alert("Buildings already loaded");
			return;
		}
	}

let buildingsURL = document.location.origin + "/api/geojson/ucfscde/buildings/building_id/location";
$.ajax({url:buildingsURL, crossDomain: true, success: function(result){
	console.log(result); // check that the data is correct

	let bdstyle = {
                    "color":"#FFFFFF",
                    "weight":10,
                    "opacity":0.75
                };

	// load the buildings geoJSON layer
    buildingsLayer = L.geoJSON().addTo(mymap).bindPopup("<b>"+"This is a building"+"</b>");
    buildingsLayer.addData(result);
    
    // set layer style
    buildingsLayer.eachLayer(function(layer){
    	console.log(layer);
    	layer.setStyle(bdstyle);
    });

    // change the map zoom so that all the data is shown
    mymap.fitBounds(buildingsLayer.getBounds());
	
    
	// add buildings into the array so that it can be referenced later
	// push adds an item to the top of the array
	let newBuildings = result;
	listOfBuildings.push(newBuildings);
	} // end of innter function
}); // end of ajax request
} // end of function loadThing

function listAllBuildings(){
	console.log("***********************");
	console.log("**********Curret Ethernet Cables**************");
	for (let i=0;i<listofBuildings;i++){
		console.log(listofBuildings[i].buildings);
	}
	console.log("***********************************************");
}


function removeBuildings(buildings){

	
	for (let i=0;i<listOfBuildings.length;i++){
		if (listOfBuildings[i].buildings == buildings){
			console.log("equal");
			
			try{
				alert("Buildings will be removed");
				mymap.removeLayer(buildingsLayer);
			}catch(err){
			alert("Layer does not exist:" + err);
			}			

			listOfBuildings.splice(i,1);
			// now have 1 less element in the array. so when try to get the last element it won't be there anymore
			break;
		}
	}
}


// ================================================================
// ================================================================
// ethernet_cables
let listOfECs = []


let ECsLayer
function loadECs(ethernet_cables){
	// check if the item is loaded already
	for (let i=0;i<listOfECs.length;i++) {
		if (listOfECs[i].ethernet_cables == ethernet_cables){
			console.log("equal");
			alert("ethernet_cables already loaded");
			return;
		}
	}

let ECsURL = document.location.origin + "/api/geojson/ucfscde/ethernet_cables/ethernet_id/location";
$.ajax({url:ECsURL, crossDomain: true, success: function(result){
	console.log(result); // check that the data is correct

	let ecstyle = {
                    "color":"#D2122E",
                    "weight":5,
                    "opacity":0.75
                };

	// load the ethernet_cables geoJSON layer
    ECsLayer = L.geoJSON().addTo(mymap).bindPopup("<b>"+"This is a ethernet_cable"+"</b>");
    ECsLayer.addData(result);
    
    // set layer style
    ECsLayer.eachLayer(function(layer){
    	console.log(layer);
    	layer.setStyle(ecstyle);
    });

    // change the map zoom so that all the data is shown
    mymap.fitBounds(ECsLayer.getBounds());
	
    
	// add ethernet_cables into the array so that it can be referenced later
	// push adds an item to the top of the array
	let newECs = result;
	listOfECs.push(newECs);
	} // end of innter function
}); // end of ajax request
} // end of function loadThing

function listAllECs(){
	console.log("***********************");
	console.log("**********Curret Ethernet Cables**************");
	for (let i=0;i<listofECs;i++){
		console.log(listofECs[i].ECs);
	}
	console.log("***********************************************");
}


function removeECs(ethernet_cables){
	for (let i=0;i<listOfECs.length;i++){
		if (listOfECs[i].ethernet_cables == ethernet_cables){
			console.log("equal");

			try{
            	alert("Ethernet cables will be removed");
            	mymap.removeLayer(ECsLayer);
    		}catch(err){
        	alert("Layer does not exist:" + err);
    		}

			listOfECs.splice(i,1);
			// now have 1 less element in the array. so when try to get the last element it won't be there anymore
			break;
		}
	}
}


// ================================================================
// ================================================================
// temperature sensors


// create an empty array (global variable)
let listOfSensors = []

let sensorsLayer
function loadSensors(sensors){
	// check if the item is loaded already
	for (let i=0;i<listOfSensors.length;i++) {
		if (listOfSensors[i].sensors == sensors){
			console.log("equal");
			alert("Sensors already loaded");
			return;
		}
	}

let sensorsURL = document.location.origin + "/api/geojson/ucfscde/temperature_sensors/sensor_id/location";
$.ajax({url:sensorsURL, crossDomain: true, success: function(result){
	console.log(result); // check that the data is correct
                

                let stylePink = L.AwesomeMarkers.icon({
                    icon: 'play',
                    markerColor: 'pink'
            });

                let styleOrange = L.AwesomeMarkers.icon({
                    icon: 'play',
                    markerColor: 'orange'
            });

                let styleBlack = L.AwesomeMarkers.icon({
                    icon: 'play',
                    markerColor: 'black'
            });
                

	// load the sensors geoJSON layer
    sensorsLayer = L.geoJSON(result,{
                    pointToLayer: function(feature, latlng){
                        if (feature.properties.sensor_id <= 7){
                            return L.marker(latlng,{icon:styleOrange}).bindPopup("<b>"+feature.properties.sensor_make +"</b>");
                        }
                        else if (feature.properties.sensor_id > 7 ){
                            return L.marker(latlng,{icon:stylePink}).bindPopup("<b>"+feature.properties.sensor_make +"</b>");
                        }
                    }
                }).addTo(mymap);
    

    // change the map zoom so that all the data is shown
    mymap.fitBounds(sensorsLayer.getBounds());
	
    
	// add sensors layer into the array so that it can be referenced later
	// push adds an item to the top of the array
	let newSensors = result;
	listOfSensors.push(newSensors);
	} // end of innter function
}); // end of ajax request
} // end of function loadThing

function listAllSensors(){
	console.log("***********************");
	console.log("**********Curret Ethernet Cables**************");
	for (let i=0;i<listofSensors;i++){
		console.log(listofSensors[i].sensors);
	}
	console.log("***********************************************");
}


function removeSensors(sensors){
	for (let i=0;i<listOfSensors.length;i++){
		if (listOfSensors[i].sensors == sensors){
			console.log("equal");

			try{
            	alert("Sensors will be removed");
            	mymap.removeLayer(sensorsLayer);
    		}catch(err){
        	alert("Layer does not exist:" + err);
    		}

			listOfSensors.splice(i,1);
			// now have 1 less element in the array. so when try to get the last element it won't be there anymore
			break;
		}
	}
}








