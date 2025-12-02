"use strict";

// ==================================================
// function to save the asset creation
function saveNewAsset() {
  alert ("start data upload");

  // get the variables needed by getting the content from asset creation form html.
  let assetName = document.getElementById("assetName").value;
  let installationDate = document.getElementById("installationDate").value;
  let userID = document.getElementById("userID").innerHTML;
  // get the geometry values
  let latitude = document.getElementById("latitude").value;
  let longitude = document.getElementById("longitude").value;

  // check if assetName and installationDate are empty. (core functionality 2).
  if(!assetName) {
      alert('Asset Name not defined!');
      //return;
  } 
  if (!installationDate) {
      alert('Installation date not defined!');
      //return;
  }
  // check if lat/lng input are left blank.
  if (!longitude || !latitude){
      alert('Geometry is not defined!')
  }
  // if all information are properly filled, prompt the data going to be uploaded
  else{
    alert("Asset: " + assetName + " installed on "+ installationDate + " is going to be created by "+ userID);
    // create a postString for requesting and posting data on the server
    let postString = "asset_name="+assetName+"&installation_date="+installationDate+"&latitude="+latitude+"&longitude="+longitude+"&user_id="+userID;
    processData(postString);
    // load assets points again after creation
    setUpPointClick();

  }
}


// ================================
// function to process the postString and post updates of data on the server
function processData(postString) {
  //alert(postString);
  let dataURL = serverURL + "/api/insertAssetPoint";
   $.ajax({
    url: dataURL,
    crossDomain: true,
    type: "POST",
    data: postString,
    // call functions in 'sucess' to close the form after the uploading is completed 
    success: function(data){console.log(data); assetUploaded(data);mymap.closePopup();},
    error: function(jqXHR, textStatus, errorThrown) {
      if (jqXHR.status === 400) {
        alert(jqXHR.responseText)
      } else{
        alert("Error: " + errorThrown);
      }
        
    }
}); 

}
// =======================================================
// funciton to get response of the save new aset action from the data server store it in the "ResponseDIVAsset" div
function assetUploaded(data) {
    // change the DIV to show the response
    document.getElementById("ResponseDIVAsset").innerHTML = JSON.stringify(data);
}


// ==================================================
// function to delete an Asset
function deleteSingleAsset() {

  // get the id of the asset to be deleted from the 'deleteID' input
  let deleteID = document.getElementById("deleteID").value;
  console.log(deleteID)

  // define a postString for updating data on server.
  let deleteString = "id="+deleteID;

  // define the dataUrl to be used in latter request
  let dataURL= serverURL + "/api/deleteAsset";
  $.ajax({
      url: dataURL,
      crossDomain: true,
      type: "POST", // to update data.
      success: function(data){console.log(data); assetDeleted(data);mymap.closePopup();setUpPointClick();},
      data: deleteString
}); 
}


// ================================
// funciton to get response of the delete action from the data server and store it in the "deleteAssetResponse" div
function assetDeleted(data){
    document.getElementById("deleteAssetResponse").innerHTML = JSON.stringify(data);
    //alert("Condition has been deleted" + JSON.stringify(data));
}












