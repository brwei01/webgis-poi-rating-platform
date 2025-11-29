"use strict";

/*
this file is adapted from https://github.com/ucl-geospatial/cege0043-app-examples.git by Ellul,C. 
*/

// ==================================================
// INITIALIZE THE BASEMAP
// set the defualt acess token for Cesium's Ion API
// used to get access to geographical data Cesium is to provide
Cesium.Ion.defaultAccessToken ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NmQ2NmVmNy0zZGY4LTQ1ZDAtYmUwOC03MjkzM2JjNzQ2OTQiLCJpZCI6MTU2NjMsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1Njg1MjQwNTl9.siDvMt3fH91XzE39FU_xqVrx-i6M1wWOBl_2vCrY6Xo';
Cesium.Ion.defaultAccessToken ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NmQ2NmVmNy0zZGY4LTQ1ZDAtYmUwOC03MjkzM2JjNzQ2OTQiLCJpZCI6MTU2NjMsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1Njg1MjQwNTl9.siDvMt3fH91XzE39FU_xqVrx-i6M1wWOBl_2vCrY6Xo';


// create vew models 
let imageryProviders = Cesium.createDefaultImageryProviderViewModels();
// select the 7th in (MapBox Street imagery) imageryProvider array
let selectedImageryProviderIndex = 7;  

//define the Cesium.Viewer constructor to set the default basemap.
let viewer = new Cesium.Viewer('cesiumContainer', {
  imageryProviderViewModels: imageryProviders,
  selectedImageryProviderViewModel: imageryProviders[selectedImageryProviderIndex]
});



// only load the layer when the cesium basemap has been created
document.addEventListener('DOMContentLoaded', function() {
 loadVectorLayer();
}, false);



// ==================================================
// FUNCTION TO LOAD TO DATA LAYER IN CESIUM VIEW
function loadVectorLayer(assetName = null){

  let serverURL = document.location.origin;
  let userId;

  // get userId
  fetch(serverURL + "/api/userId")
    .then(response => response.json())
    .then(data => {
      userId = data[0].user_id;
      // complete the api
      let layerURL = serverURL +'/api/geojson/userAssets/'+ userId;

      // get userAsset data from complete api
      $.ajax({
        url: layerURL,
        crossDomain: true,
        success: function(result){
          let geoJsonData = result[0]; // get the geojson data from the first element of the array
          
          // if there s an assetName specified, construct and zoom to that asset only.
          if (assetName) {
            geoJsonData = result[0].features.find(feature => 
                feature.properties.asset_name === assetName);
          }

          console.log(geoJsonData);

          // create a new instance of the Cesium GeoJsonDataSource
          let dataSource = new Cesium.GeoJsonDataSource("userAssets");
          console.log(dataSource);
          dataSource.clampToGround = false; // do not clamp data to terrain
          dataSource._name = "userAssets"; // set a private property to store the name of datasource

          // define the style for entities 
          let geoJSONOptions = {
            stroke: Cesium.Color.GREY,
            fill: Cesium.Color.GREY,
            strokeWidth: 3,
            markerSymbol: '*',
          };

          // adding the dataSource defined to Cesium viewer
          viewer.dataSources.add(dataSource);
          // load geoJSONdata into datasource
          dataSource.load(geoJsonData, geoJSONOptions).then(function(dataSource){
            viewer.flyTo(dataSource);
          });

          // used to debug and check entity properties
          dataSource.entities.values.forEach(function(value){
            console.log(value._name);
            //entity.asset_name = entity.properties.asset_name;
        });

      }
    })        
  })
}

