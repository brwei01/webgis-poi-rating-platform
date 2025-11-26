"use strict";
function startPage() {
	// autommatically load the Room data
    // for this we use native Javascript AJAX
    getRoomData();

}



// global variable needed for native AJAX
let roomsAJAX;
// make sure the data api server is running before you run this test
function getRoomData() {

  // get the root of the URL from the web page
   let theURL =  document.location.origin + "/api/testCRUD"
   console.log(theURL);
   roomsAJAX = new XMLHttpRequest();

   // this is a GET request as we are retrieving data
   roomsAJAX.open("GET", theURL);

   // the function to run when the result is returned
   roomsAJAX.onreadystatechange = showRoomData;

   // send the request
   roomsAJAX.send();
}  



function showRoomData() {
  // check if the response has been received - if not, keep waiting
  if (roomsAJAX.readyState < 4)         
        // while waiting response from server
        document.getElementById('responseDIV').innerHTML = "Loading...";

    else if (roomsAJAX.readyState === 4) {                 
              // 4 = Response from 
              // server has been completely loaded.
        if (roomsAJAX.status > 199 && roomsAJAX.status < 300)  
            // http status between 200 to 299 are all successful
            document.getElementById('responseDIV').innerHTML = roomsAJAX.responseText;
    }

}


function getData() {
	  // the .text property allows you to get the text that is typed into an input box
    let theURL = document.getElementById("ajaxURL").value;
    console.log(theURL);
    $.ajax({url:theURL,
      // allow requests from other servers
    	crossDomain: true,

      // if the response is succesful then ..
 		success: function(result){
        console.log(result);
        // the result is returned as JSON so we need to convert it to a string
    		document.getElementById("ajaxDIV").innerHTML = JSON.stringify(result);
    }}); //end of the AJAX call

}




function saveNewAsset(){
  

}

function deleteSingleAsset(){

}



