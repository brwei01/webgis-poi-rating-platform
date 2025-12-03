# Important Note
The original deployment relied on university-hosted servers (with VPN access) that have since been discontinued.
As a result, the online WebGIS demo is no longer accessible.
A local/offline version can be deployed on Docker now.
Please refer to the information under [/local-demo](https://github.com/brwei01/webgis-poi-rating-platform/tree/main/local-demo) for details

**!!!OR test out the demo via this [/link](http://54.89.155.104/bootStrap.html) on line!!!**
You will likely to get 
`
[object GeolocationPositionError]
`
this is because the api runs on HTTP, which does not support location services because most modern browsers have security restrictions that block the Geolocation API on unencrypted HTTP connections to prevent misuse of location data.

---

# A Demonstration of the app

<img width="75%" alt="cb426485-d566-495f-a34f-21d8582e6912" src="https://github.com/user-attachments/assets/7a7f2fd1-a5c6-47ce-9294-d73b533aac6a" />

## 1. system requirement: 

>> ### Browser: 
- the App does not have specific browser requirement. However, the browser is expected to support geolocation access via http connection. The App was mainly tested on Google Chrome (Version 112.0.5615.137 (Official Build) (x86_64)) and it may work best on Chrome. 

>> ### Softwares:
- the system need to have Node.js and PostgreSQL installed. The Node.js v18.12.1 and pgAdmin version 4.2 are tested in this project.

>> ### External libraries used in API: 
- express: to create the router object;
- pg: connect to pgAdmin database;
- fs: read file content, certificate 'postGISConnection' in this case;
- os: get information of the current user;
- body-parser: to parse request bodies;

>> ### External libraries used in APP:
CSS:
- Font Awesome (https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css)
- Bootstrap Icons (https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css)
- Owl Carousel (lib/owlcarousel/assets/owl.carousel.min.css)
- Tempus Dominus (lib/tempusdominus/css/tempusdominus-bootstrap-4.min.css)
- Leaflet (https://unpkg.com/leaflet@1.9.3/dist/leaflet.css)
- Ionicons (css/ionicons.min.css)
- Leaflet Awesome Markers (css/leaflet.awesome-markers.css)
JQUREY:
- jQuery (https://code.jquery.com/jquery-3.4.1.min.js) 
JS FILES FROM LOCAL:
- basicMapLeaflet.js (js/basicMapLeaflet.js)
- getLocation.js (js/getLocation.js)
- getDistance.js (js/getDistance.js)
- trackLocation.js (js/trackLocation.js)
- menuFunctions.js (js/menuFunctions.js)
- centennial.js (js/centennial.js)
- graph.js (js/graph.js)
- utilities.js (js/utilities.js)
- D3.js (https://d3js.org/d3.v5.min.js)
- assetCreation.js (js/assetCreation.js)
- uploadData.js (js/uploadData.js)


## 2. Deployment and Testing:

>> ### deployment
- Clone the source code of this locational asset condition assessment app and data api from github onto Ubuntu machine:
  git clone https://github.com/ucl-geospatial-22-23/cege0043-apps-22-23-brwei01.git;
  git clone https://github.com/ucl-geospatial-22-23/cege0043-api-22-23-brwei01.git;
- Go to apps and api folders and start Node JS server apps (app.js and dataAPI.js)
  pm2 start apps.js;
  pm2 start api.js;
- type in the addresses in a browser. 
  For using the app: https://cege0043-14.cs.ucl.ac.uk/app/bootStrap.html; For accessing the dashboard: https://cege0043-14.cs.ucl.ac.uk/app/dashboard.html; For test the api: https://cege0043-00.cs.ucl.ac.uk/api/ + ENDPOINT.

>> ### Testing
- Make sure the device is connected to UCL Wifi or UCL VPN. https://www.ucl.ac.uk/isd/services/get-connected/ucl-virtual-private-network-vpn
- Make sure the Node JS server and server apps (app.js and dataAPI.js) are active. These can be started via 'pm2 start' command in terminal. 
- In a browser that supports geolocation access via http connect (e.g. Chrome), type in the api URLs to be tested. e.g. https://cege0043-14.cs.ucl.ac.uk/api/testCRUD.
- the get request can be tested by hard coding the api endpoint parameters and check the response from server. e.g. replace :user_id with 000 in endpoint /api/geojson/userAssets/:user_id. A response of  'CANNOT GET' can refer to errors in getting access to this endpoint. Starting the server app by running it by node command (e.g. node dataAPI.js) can be useful in targeting these errors.
- the post requests can be tested 


## 3. introduction to api endpoints
>> ### CRUD
The crud.js file employs the pg module to establish a connection (router) with a PostgreSQL database (pgAdmi) and execute CRUD (Create, Read, Update, Delete) operations. To make these CRUD operations available as HTTP endpoints, the express module is used to create a RESTful API.  The HTTP endpoints that perform CRUD operations on a database include:

- /testCRUD: A test endpoint that can be called with either a GET or POST request. It returns a JSON object with a message that includes the original URL and the request type.
- /userId: An endpoint that returns the user ID of the current user. It performs a SELECT query on the ucfscde.users table to retrieve the user ID of the user.
- /conditionDetails: An endpoint that returns the details of the asset condition values and descriptions. It performs a SELECT query on the cege0043.asset_condition_options table to retrieve the details of the asset conditions.
- /insertAssetPoint: An endpoint that inserts a new asset point into the cege0043.asset_information table. It performs an INSERT query on the table with the asset name, installation date, longitude, and latitude from the request body.

>> ### geoJSON
the geoJSON.js file creates a geoJSON router has several. Endpoints defined in this file include:
- /testGeoJSON: responds to GET and POST requests. returns a JSON object with a message that includes the original URL and the request type.
- /userAssets/:user_id: retrieves an array of asset locations in GeoJSON format for a specific user ID. 
- /userConditionReports/:user_id: returns the number of condition reports saved by a specific user ID.
- /userRanking/:user_id: returns the ranking of a specific user ID based on the number of condition reports they have saved in comparison to all other users. 
- /assetsInGreatCondition: returns a list of all assets with at least one report indicating that they are in the best condition. 
- /dailyParticipationRates: returns a JSON object containing the daily reporting rates for the past week. 
- /userFiveClosestAssets/:latitude/:longitude: returns GeoJSON objects containing the five assets (uploaded by all users) closest to the user's current location. 
- /lastFiveConditionReports/:user_id: returns GeoJSON objects containing the last five condition reports created by a specific user ID. 
- /conditionReportMissing/:user_id: returns GeoJSON objects containing the assets where a specific user ID has not submitted a condition report in the last three days.


## 4. sources
- The code for this api is adapted from https://github.com/ucl-geospatial/cege0043-api-examples.git by Ellul C. [Last acessed on 26/04/2023]
- A large proportion of the codes for the app are adapted from the example code for CEGE0043 Web Mobile and GIS by Ellul, C. including functions related to location tracking, getting data from server, data processing, map layer displaying and manipulating, d3 graph creation, Map click eventing setting up, and etc.  https://github.com/ucl-geospatial/cege0043-app-examples.git. [last acessed on 26/04/2023]
- This app has made the dashboard by adapting the bootStrap template 'CoolAdmin' from: https://github.com/puikinsh/CoolAdmin. [last acessed on 26/04/2023]

---

# Technical guide for the API 
## 1. system requirement: 

>> ### Browser: 
- the App does not have specific browser requirement. However, the browser is expected to support geolocation access via http connection. The App was mainly tested on Google Chrome (Version 112.0.5615.137 (Official Build) (x86_64)) and it may work best on Chrome. 

>> ### Softwares:
- the system need to have Node.js and PostgreSQL installed. The Node.js v18.12.1 and pgAdmin version 4.2 are tested in this project.

>> ### External libraries used in API: 
- express: to create the router object;
- pg: connect to pgAdmin database;
- fs: read file content, certificate 'postGISConnection' in this case;
- os: get information of the current user;
- body-parser: to parse request bodies;

>> ### External libraries used in APP:
CSS:
- Font Awesome (https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css)
- Bootstrap Icons (https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css)
- Owl Carousel (lib/owlcarousel/assets/owl.carousel.min.css)
- Tempus Dominus (lib/tempusdominus/css/tempusdominus-bootstrap-4.min.css)
- Leaflet (https://unpkg.com/leaflet@1.9.3/dist/leaflet.css)
- Ionicons (css/ionicons.min.css)
- Leaflet Awesome Markers (css/leaflet.awesome-markers.css)
JQUREY:
- jQuery (https://code.jquery.com/jquery-3.4.1.min.js) 
JS FILES FROM LOCAL:
- basicMapLeaflet.js (js/basicMapLeaflet.js)
- getLocation.js (js/getLocation.js)
- getDistance.js (js/getDistance.js)
- trackLocation.js (js/trackLocation.js)
- menuFunctions.js (js/menuFunctions.js)
- centennial.js (js/centennial.js)
- graph.js (js/graph.js)
- utilities.js (js/utilities.js)
- D3.js (https://d3js.org/d3.v5.min.js)
- assetCreation.js (js/assetCreation.js)
- uploadData.js (js/uploadData.js)


## 2. Deployment and Testing:

>> ### deployment
- Clone the source code of this locational asset condition assessment app and data api from github onto Ubuntu machine:
  git clone https://github.com/ucl-geospatial-22-23/cege0043-apps-22-23-brwei01.git;
  git clone https://github.com/ucl-geospatial-22-23/cege0043-api-22-23-brwei01.git;
- Go to apps and api folders and start Node JS server apps (app.js and dataAPI.js)
  pm2 start apps.js;
  pm2 start api.js;
- type in the addresses in a browser. 
  For using the app: https://cege0043-14.cs.ucl.ac.uk/app/bootStrap.html; For accessing the dashboard: https://cege0043-14.cs.ucl.ac.uk/app/dashboard.html; For test the api: https://cege0043-00.cs.ucl.ac.uk/api/ + ENDPOINT.

>> ### Testing
- Make sure the device is connected to UCL Wifi or UCL VPN. https://www.ucl.ac.uk/isd/services/get-connected/ucl-virtual-private-network-vpn
- Make sure the Node JS server and server apps (app.js and dataAPI.js) are active. These can be started via 'pm2 start' command in terminal. 
- In a browser that supports geolocation access via http connect (e.g. Chrome), type in the api URLs to be tested. e.g. https://cege0043-14.cs.ucl.ac.uk/api/testCRUD.
- the get request can be tested by hard coding the api endpoint parameters and check the response from server. e.g. replace :user_id with 000 in endpoint /api/geojson/userAssets/:user_id. A response of  'CANNOT GET' can refer to errors in getting access to this endpoint. Starting the server app by running it by node command (e.g. node dataAPI.js) can be useful in targeting these errors.
- the post requests can be tested 


## 3. introduction to api endpoints
>> ### CRUD
The crud.js file employs the pg module to establish a connection (router) with a PostgreSQL database (pgAdmi) and execute CRUD (Create, Read, Update, Delete) operations. To make these CRUD operations available as HTTP endpoints, the express module is used to create a RESTful API.  The HTTP endpoints that perform CRUD operations on a database include:

- /testCRUD: A test endpoint that can be called with either a GET or POST request. It returns a JSON object with a message that includes the original URL and the request type.
- /userId: An endpoint that returns the user ID of the current user. It performs a SELECT query on the ucfscde.users table to retrieve the user ID of the user.
- /conditionDetails: An endpoint that returns the details of the asset condition values and descriptions. It performs a SELECT query on the cege0043.asset_condition_options table to retrieve the details of the asset conditions.
- /insertAssetPoint: An endpoint that inserts a new asset point into the cege0043.asset_information table. It performs an INSERT query on the table with the asset name, installation date, longitude, and latitude from the request body.

>> ### geoJSON
the geoJSON.js file creates a geoJSON router has several. Endpoints defined in this file include:
- /testGeoJSON: responds to GET and POST requests. returns a JSON object with a message that includes the original URL and the request type.
- /userAssets/:user_id: retrieves an array of asset locations in GeoJSON format for a specific user ID. 
- /userConditionReports/:user_id: returns the number of condition reports saved by a specific user ID.
- /userRanking/:user_id: returns the ranking of a specific user ID based on the number of condition reports they have saved in comparison to all other users. 
- /assetsInGreatCondition: returns a list of all assets with at least one report indicating that they are in the best condition. 
- /dailyParticipationRates: returns a JSON object containing the daily reporting rates for the past week. 
- /userFiveClosestAssets/:latitude/:longitude: returns GeoJSON objects containing the five assets (uploaded by all users) closest to the user's current location. 
- /lastFiveConditionReports/:user_id: returns GeoJSON objects containing the last five condition reports created by a specific user ID. 
- /conditionReportMissing/:user_id: returns GeoJSON objects containing the assets where a specific user ID has not submitted a condition report in the last three days.


## 4. sources
- The code for this api is adapted from https://github.com/ucl-geospatial/cege0043-api-examples.git by Ellul C. [Last acessed on 26/04/2023]
- A large proportion of the codes for the app are adapted from the example code for CEGE0043 Web Mobile and GIS by Ellul, C. including functions related to location tracking, getting data from server, data processing, map layer displaying and manipulating, d3 graph creation, Map click eventing setting up, and etc.  https://github.com/ucl-geospatial/cege0043-app-examples.git. [last acessed on 26/04/2023]
- This app has made the dashboard by adapting the bootStrap template 'CoolAdmin' from: https://github.com/puikinsh/CoolAdmin. [last acessed on 26/04/2023]

