"use strict"


// ================================================
// S MENU: show the help center page
function showHelp(){
	// debug message
	var sCallerName;
	{
		let re = /([^(]+)@|at ([^(]+) \(/g;
		let aRegexResult = re.exec(new Error().stack);	
		sCallerName = aRegexResult[1] || aRegexResult[2];	
		//alert("function is 'showHelp()' "+sCallerName); 	
	}
	// jump to the help page
	window.location.href = document.location.origin + "/help.html";
}

// ======================================================
// LG MENU: get assets in great condition
// GET DATA FROM ENDPOINT "/api/geojson/AssetsInGreatCondition"
// set a status to control the on/off of the toggle button
let listVisible = false;
function listBestConditionAssets(){

  const assetsList = document.getElementById("assetsGreatConditionList");
  let dataURL = serverURL + "/api/geojson/AssetsInGreatCondition";

  // if the list is set to not showing, hide the list;
  if (listVisible) {
    // close the list
    assetsList.innerHTML = "";
    toggleButton1.textContent = "List of Asset in Best Condition";
    listVisible = false;
  } 
  // if the list is set to show, open up and show the list
  // and change the button content to 'hide graph' to prompt hiding list action.
  else {
    fetch(dataURL)
    .then(response => response.json())
    .then(data => {
      data = data[0].array_to_json;
      data.forEach(record=> {
        console.log(record);
        const newAsset = document.createElement("li");
        newAsset.textContent = record.asset_name + ": " + record.installation_date;
        console.log(newAsset)
        assetsList.appendChild(newAsset);
      });
      toggleButton1.textContent = "Hide List";
      listVisible = true
    })
    .catch(error => {
      console.error('Error fetching data: ', error);
    });
  }
}

// ======================================================
// LG MENU: show Graph: see graph.js

// =================================================================
// S MENU: FUNCTION TO GET THE USER RANKING
// GET DATA FROM ENDPOINT ./api/userRanking/:user_id
function getUserRanking(){
	// debug message:
    let sCallerName;
    {
        const re = /([^(]+)@|at ([^(]+) \(/g;
        const aRegexResult = re.exec(new Error().stack);	
        sCallerName = aRegexResult[1] || aRegexResult[2];	
        //alert("function is 'getUserRanking()' "+sCallerName); 	
    }
  
    $.ajax({
    type: 'GET',
    url: serverURL + '/api/userId',
    success: function(response) {
        const userId = response[0].user_id;
        console.log(userId);
        $.ajax({
        type:'GET',
        url: serverURL + '/api/geojson/userRanking/' + userId,
        success: function(response){
            const data = response[0].array_to_json[0];
            //console.log(data);
            alert(`You are ranked ${data.rank}`);
        },
        error: function(){
            console.error('Failed to get the user ranking.');
        }
        }); 
    },
    error: function() {
        console.error('Failed to get user ID');
    }
  });
}



// =================================================================
// S MENU: FUNCTION TO GET AND REMOVE THE 5 CLOSEST ASSETS 
// GET DATA FROM ENDPOINT ./api/geojson/userFiveClosestAssets/:lat/:lng
function add5ClosestAssets(){
	// debug message:
	var sCallerName;
	{
		let re = /([^(]+)@|at ([^(]+) \(/g;
		let aRegexResult = re.exec(new Error().stack);	
		sCallerName = aRegexResult[1] || aRegexResult[2];	
		//alert("function is 'add5ClosestAssets()' "+sCallerName); 	
	}

  const promise = new Promise((resolve, reject) => {
      let lastLayer = trackLocationLayer[trackLocationLayer.length-1];
      console.log(lastLayer)
    
      let userLat = lastLayer.getLatLng().lat;
      let userLng = lastLayer.getLatLng().lng;

      $.ajax({
        type:'GET',
        url: serverURL + '/api/geojson/userFiveClosestAssets/' + userLat +'/'+ userLng,
        success: function(response){
          const data = response[0];
          console.log(data.features)
          resolve(data.features);
        },
        error: function(){
          console.error('Failed to get the user assets.');
          reject(new Error('Failed to get user assets.'));
        }
      }); 
    })
  //return promise;
  promise.then((geojsonFeatures) => {
	if(featureGroup.getLayers().length > 0){
		featureGroup.clearLayers();
		mymap.removeLayer(featureGroup);
	}
    // iterate over all features and add them to the group
    geojsonFeatures.forEach((feature) => {
		let assetName = feature.properties.asset_name;
        let installationDate = feature.properties.installation_date;
        let previousConditionDescription = feature.properties.condition_description;
        let coords = feature.geometry.coordinates;

        let popUpHTML = getPopupCondition(assetName, installationDate, previousConditionDescription)  
        let asset =  L.marker([coords[1], coords[0]], {
			condition_description: previousConditionDescription,
		}).bindPopup(popUpHTML);
		featureGroup.addLayer(asset);
		setMarkerColours(featureGroup);
    });
	featureGroup.addTo(mymap);   
	// zoom the map to the bounding box of all points
	mymap.fitBounds(featureGroup.getBounds());
})
}

// ==========================================================
// S MENUS: function to remove the layer of 5 closeset assets created by any user
function remove5ClosestAssets(){
	var sCallerName;
	{
		let re = /([^(]+)@|at ([^(]+) \(/g;
		let aRegexResult = re.exec(new Error().stack);	
		sCallerName = aRegexResult[1] || aRegexResult[2];	
		//alert("function is 'remove5ClosestAssets()' "+sCallerName); 	
	}

	featureGroup.eachLayer(function (layer) {
	featureGroup.removeLayer(layer);
	});
	mymap.removeLayer(featureGroup);
	setUpPointClick();	
}




// =================================================================
// S MENU: FUNCTION TO GET AND REMOVE THE ASSETS WHERE THE 5 MOST RECENT CONDITION REPORTS ARE MADE
// ENDPOINT ./api/geojson/lastFiveConditionReports/:user_id
// function to load the layer of assets where the 5 latest reports are generated
function add5LatestReports(){
	let userId;
	var sCallerName;
	{
		let re = /([^(]+)@|at ([^(]+) \(/g;
		let aRegexResult = re.exec(new Error().stack);	
		sCallerName = aRegexResult[1] || aRegexResult[2];	
		//alert("function is 'add5LatestReports()' "+sCallerName); 	
	}
	
	const promise = new Promise((resolve, reject) => {
		$.ajax({
			type: 'GET',
			url: serverURL + '/api/userId',
			success: function(response) {
			  userId = response[0].user_id;
			  console.log(userId);
			  $.ajax({
				type:'GET',
				url: serverURL + '/api/geojson/lastFiveConditionReports/' + userId,
				success: function(response){
				  const data = response[0];
				  console.log(data.features)
				  resolve(data.features);
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
	  })
	//return promise;
	promise.then((geojsonFeatures) => {
	if(featureGroup.getLayers().length > 0){
		featureGroup.clearLayers();
		mymap.removeLayer(featureGroup);
	}
	  // iterate over all features and add them to the group
	  geojsonFeatures.forEach((feature) => {
		  let assetName = feature.properties.asset_name;
		  let installationDate = feature.properties.installation_date;
		  let previousConditionDescription = feature.properties.condition_description;
		  let coords = feature.geometry.coordinates;
  
		  let popUpHTML = getPopupCondition(assetName, installationDate, previousConditionDescription)  
		  let asset =  L.marker([coords[1], coords[0]], {
			condition_description: previousConditionDescription,
		}).bindPopup(popUpHTML);
		  featureGroup.addLayer(asset);
		  setMarkerColours(featureGroup);
	  });
	  featureGroup.addTo(mymap);   
	  // zoom the map to the bounding box of all points
	  mymap.fitBounds(featureGroup.getBounds());
  })	
}

// ==========================================================
// S MENU: function to remove the layer of assets with 5 latest reports
function remove5LatestReports(){
	// debug message
	var sCallerName;
	{
		let re = /([^(]+)@|at ([^(]+) \(/g;
		let aRegexResult = re.exec(new Error().stack);	
		sCallerName = aRegexResult[1] || aRegexResult[2];	
		//alert("function is 'remove5LatestReports()' "+sCallerName); 	
	}

	featureGroup.eachLayer(function (layer) {
	featureGroup.removeLayer(layer);
	});
	mymap.removeLayer(featureGroup);
	setUpPointClick();	
}


// =================================================================
// S MENU: FUNCTION TO GET AND REMOVE THE ASSETS WITHOUT REPORTS WITHIN 3 DAYS
// GET DATA FROM ENDPOINT ./api/geojson/conditionReportMissing/:user_id
function addLayerNotRated(){
	// debug message
	var sCallerName;
	{
		let re = /([^(]+)@|at ([^(]+) \(/g;
		let aRegexResult = re.exec(new Error().stack);	
		sCallerName = aRegexResult[1] || aRegexResult[2];	
		//alert("function is 'addLayerNotRated()' "+sCallerName); 	
	}

	let userId
	const promise = new Promise((resolve, reject) => {
		$.ajax({
			type: 'GET',
			url: serverURL + '/api/userId',
			success: function(response) {
			  userId = response[0].user_id;
			  console.log(userId);
			  $.ajax({
				type:'GET',
				url: serverURL + '/api/geojson/conditionReportMissing/' + userId,
				success: function(response){
				  const data = response[0];
				  console.log(data.features)
				  resolve(data.features);
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
	  })
	//return promise;
	promise.then((geojsonFeatures) => {

	if(featureGroup.getLayers().length > 0){
		featureGroup.clearLayers();
		mymap.removeLayer(featureGroup);
	}
	  // iterate over all features and add them to the group
	  if (geojsonFeatures) {
		geojsonFeatures.forEach((feature) => {
			let assetName = feature.properties.asset_name;
			let installationDate = feature.properties.installation_date;
			let previousConditionDescription = feature.properties.condition_description;
			let coords = feature.geometry.coordinates;
	
			let popUpHTML = getPopupCondition(assetName, installationDate, previousConditionDescription)  
			let asset =  L.marker([coords[1], coords[0]], {
			  condition_description: previousConditionDescription,
		  }).bindPopup(popUpHTML);
			featureGroup.addLayer(asset);
			setMarkerColours(featureGroup);
		});
		featureGroup.addTo(mymap);   
		// zoom the map to the bounding box of all points
		mymap.fitBounds(featureGroup.getBounds());

	  } else {
		alert("No assets are found not evaluated in the past 3 days.")
	  }
	 
  })	
	
}


// ===================================================
// S MENU: REMOVE THE ASSETS WITHOUT REPORTS WITHIN 3 DAYS
function removeLayerNotRated(){
	var sCallerName;
	{
		let re = /([^(]+)@|at ([^(]+) \(/g;
		let aRegexResult = re.exec(new Error().stack);	
		sCallerName = aRegexResult[1] || aRegexResult[2];	
		//alert("function is 'removeLayerNotRated()' "+sCallerName); 	
	}

	featureGroup.eachLayer(function (layer) {
	featureGroup.removeLayer(layer);
	});
	mymap.removeLayer(featureGroup);
	setUpPointClick();	

}