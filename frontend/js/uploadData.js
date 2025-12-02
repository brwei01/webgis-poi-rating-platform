"use strict";


// ==============================================
// function to get condition input based on the descriptions 
function saveConditionInformation() {
  
  alert ("start saving condition");     

  // innitialize or get the variables needed
  let currentCondition = "";
  let assetID = document.getElementById("assetID").innerHTML;
  let assetName = document.getElementById("assetName").innerHTML;
  let installationDate = document.getElementById("installationDate").innerHTML;
  let userID = document.getElementById("userID").innerHTML;
  let previousCondition = document.getElementById('previousConditionDescription').innerHTML

  alert("Asset: " + assetName + " installed on "+ installationDate + " is uploaded by "+userID);
  
  // create a postString for requesting and posting data on the server
  let postString = "asset_id="+assetID+"&asset_name="+assetName;


  // get the radio button values
  if(document.getElementById('condition1').checked){
    currentCondition = 'Element is in very good condition'
    postString = postString + "&condition_id=" + 1;
    postString = postString + "&condition_description=" + currentCondition;
  }
  if(document.getElementById('condition2').checked){
    currentCondition = 'Some aesthetic defects, needs minor repair'
    postString = postString + "&condition_id=" + 2;
    postString = postString + "&condition_description=" + currentCondition;
  }

  if(document.getElementById('condition3').checked){
    currentCondition = 'Functional degradation of some parts, needs maintenance';
    postString = postString + "&condition_id=" + 3;
    postString = postString + "&condition_description=" + currentCondition;
  }
  if(document.getElementById('condition4').checked){
    currentCondition = 'Not working and maintenance must be done as soon as reasonably possible'
    postString = postString + "&condition_id=" + 4;
    postString = postString + "&condition_description=" + currentCondition;
  }
  if(document.getElementById('condition5').checked){
    currentCondition = 'Not working and needs immediate, urgent maintenance';
    postString = postString + "&condition_id=" + 5;
    postString = postString + "&condition_description=" + currentCondition;
  }
  if(document.getElementById('condition6').checked){
    currentCondition = 'Unknown';
    postString = postString + "&condition_id=" + 6;
    postString = postString + "&condition_description=" + currentCondition;
  }


// compare the selected conditon and the previous condition
// and prompt if they are the same of different.
  if (previousCondition === currentCondition){
    alert('the current condition you input is same as the previous condition')
  }
  else {
    alert('the current condition you input is different from the previous condition')
  }

  // call function to process the postString.
  processConditionData(postString);
  
  // reload the markers when condition information changed for the asset assessed.
  setUpPointClick();

}


// ======================================================================
// function to process the postString and post updates of data on the server
function processConditionData(postString) {
  //alert(postString);

  let dataURL = serverURL + "/api/insertConditionInformation";
   $.ajax({
    url: dataURL,
    crossDomain: true,
    type: "POST",
    data: postString,
    // call functions in 'sucess' to close the form after the uploading is completed 
    // and get number of reports the user uploaded
    success: function(data){console.log(data); conditionUploaded(data);mymap.closePopup();getNumUserReports();}, 
    error: function(error){console.error(error); alert('Error uploading data. Please try again.');}

}); 
}

// ======================================================================
// function to process the response from the data server and store to the div "conditionResult"
function conditionUploaded(data) {
  document.getElementById("conditionResult").innerHTML = JSON.stringify(data);
}


// ======================================================================
// function to delete a condition assessment record
function deleteConditionRecord() {

  // get the id of the condition record to be deleted from the 'deleteConditionID' input
  let deleteConditionID = document.getElementById("deleteConditionID").value;
  console.log(deleteConditionID)

  // define a postString for updating data on server.
  let deleteString = "id="+deleteConditionID;

  // define the dataUrl to be used in latter request
  let dataURL= serverURL + "/api/deleteConditionReport";
  $.ajax({
      url: dataURL,
      crossDomain: true,
      type: "POST",
      success: function(data){console.log(data); conditionDeleted(data);mymap.closePopup(); setUpPointClick();},
      data: deleteString
}); 
}

// ================================
// funciton to get response of the delete action from the data server and store it in the "deleteConditionResponse" div
function conditionDeleted(data){
    document.getElementById("deleteConditionResponse").innerHTML = JSON.stringify(data);
}



// =================================================================
// FUNCTION TO GET HOW MANY REPORTS THE USER HAVE SUBMITTED
// USING ENDPOINT ./api/userConditionReports/:user_id
function getNumUserReports() {
  let userId;
  $.ajax({
    type: 'GET',
    url: serverURL + '/api/userId',
    success: function(response) {
      userId = response[0].user_id;
      console.log(userId);
      $.ajax({
        type:'GET',
        url: serverURL + '/api/geojson/userConditionReports/' + userId,
        success: function(response){
          const data = response[0].array_to_json[0];
          console.log(data.num_reports)
          alert(`You have submitted ${data.num_reports} reports`);
        },
        error: function(){
          console.error('Failed to get the number of reports submitted.');
          throw new Error('Failed to get the number of reports submitted.');
        }
      }); 
    },
    error: function() {
      console.error('Failed to get user ID');
      throw new Error('Failed to get user ID');
    }
  });
}



/*
// THE FOLLOWING IS THE NON-HARDCODING VERSION OF SAVING CONDITION INFORMATION

// ==============================================
// function to get condition input based on the descriptions 
// which can be retrieved by api endpoint 'api/conditionDetails'
async function createConditionInputs() {
  const response = await fetch(serverURL + '/api/conditionDetails');
  const conditionDetails = await response.json();

  // create html for the conditions retrieved from api
  // to be later put on condition assessement form.
  let conditionHTML = '';
  conditionDetails.forEach(condition => {
    conditionHTML += `
      <input type="radio" name="condition" id="condition${condition.id}" value="${condition.id}">
      ${condition.condition_description}<br>
    `;
  });
  // console.log(conditionHTML);
  
  // put the conditionHTML onto the condition assessment form.
  document.getElementById('conditionInputs').innerHTML = html;
}

// ==============================================
// function to save condition selected on condition assessment form
async function saveConditionInformation() {

  alert ("start saving condition");     

  let currentCondition = "";
  let assetID = document.getElementById("assetID").innerHTML;
  let assetName = document.getElementById("assetName").innerHTML;
  let installationDate = document.getElementById("installationDate").innerHTML;
  let userID = document.getElementById("userID").innerHTML;
  let previousCondition = document.getElementById('previousConditionDescription').innerHTML;

  console.log("previousCondition: " + previousCondition)

  alert("Asset: " + assetName + " installed on "+ installationDate + " is uploaded by "+userID);

  let postString = "asset_id="+assetID+"&asset_name="+assetName;

  // Get the condition details from the API endpoint
  const response = await fetch(serverURL +'/api/conditionDetails');
  const conditionDetails = await response.json();

  // Get the selected condition ID and description from the conditionDetails array
  let selectedCondition = conditionDetails.find(condition => {
    return document.getElementById('condition' + condition.id).checked;
  });

  // If a condition is selected, add its ID and description to the postString
  if (selectedCondition) {
    postString += '&condition_id=' + selectedCondition.id;
    postString += '&condition_description=' + selectedCondition.condition_description;
    currentCondition = selectedCondition.condition_description;
  }

  // Alert the user if the current condition is the same as the previous condition

  getUserAssets().then((geojsonFeatures) => {
    // iterate over all features and add them to the group
    geojsonFeatures.forEach((feature) => {
      if(feature.properties.asset_name === assetName){
        previousCondition = feature.properties.condition_description;
        console.log(previousCondition)
  
        if (previousCondition === currentCondition){
          alert('The current condition you input is the same as the previous condition.');
        } else if (previousCondition != currentCondition) {
          alert('The current condition you input is different from the previous condition.');
        }

        // Process the postString.
        processConditionData(postString);
        setUpPointClick();
      }
    })
  })

  
}

*/


