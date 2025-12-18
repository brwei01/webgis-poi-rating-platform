# Important Note
The original deployment relied on university-hosted servers (with VPN access) that have since been discontinued.
As a result, the online WebGIS demo is no longer accessible.
A local/offline version can be deployed on Docker now.
Please refer to the information under [/local-demo](https://github.com/brwei01/webgis-poi-rating-platform/tree/main/local-demo) for details

**!!!OR test out the demo via this [/link](http://54.145.60.127/bootStrap.html) on line!!!**
** now Its 100% ready to play with **

You will likely to get 
`
[object GeolocationPositionError]
`
this is because the api runs on HTTP, which does not support location services because most modern browsers have security restrictions that block the Geolocation API on unencrypted HTTP connections to prevent misuse of location data.

---

# A Demonstration of the app

<img width="75%" alt="cb426485-d566-495f-a34f-21d8582e6912" src="https://github.com/user-attachments/assets/7a7f2fd1-a5c6-47ce-9294-d73b533aac6a" />
# Web GIS Asset Condition Assessment Platform

A Web GIS-based asset management and condition assessment platform that allows users to create, view, and manage assets on a map, and perform condition assessments.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Structure](#database-structure)
- [User Guide](#user-guide)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- 🗺️ **Interactive Map**: Leaflet-based map interface with asset location visualization
- 📍 **Asset Management**: Create, view, and delete asset points
- 📊 **Condition Assessment**: Perform condition assessments and reports on assets
- 📱 **Responsive Design**: Supports both desktop and mobile devices with automatic feature adjustment based on screen size
  - **Desktop/Large Screen (992px-1200px, Bootstrap `lg`)**: Management interface - create POIs (Points of Interest) and view asset information. **View-only mode** for condition assessment (cannot rate POIs). Simulates console panel/management interface behavior.
  - **Mobile/Small Screen (<768px, Bootstrap `xs`/`sm`)**: Assessment-focused interface - **rate existing POIs** and view results. Asset creation is disabled to focus on field assessment tasks.
  - **Extra Large Screen (≥1200px)**: View-only mode with markers disabled
- 📍 **GPS Tracking**: Mobile support for GPS location tracking and nearest asset finding
- 🎨 **Visual Markers**: Color-coded markers based on asset condition status
- 📈 **Data Visualization**: Provides charts and statistics
- 🔐 **User Management**: Multi-user system support

## 🛠️ Tech Stack

### Frontend
- **Leaflet.js** - Mapping library
- **Bootstrap** - UI framework
- **jQuery** - DOM manipulation and AJAX
- **Express** - Static file server

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **PostGIS** - Geospatial database extension

### Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **pgAdmin** - Database management tool

## 📁 Project Structure

```
local-demo/
├── backend/                 # Backend code
│   ├── routes/             # API routes
│   │   ├── crud.js        # CRUD operations
│   │   └── geoJSON.js     # GeoJSON data endpoints
│   ├── dataAPI.js         # API server (backup)
│   └── package.json       # Backend dependencies
│
├── frontend/               # Frontend code
│   ├── js/                # JavaScript files
│   │   ├── basicMapLeaflet.js    # Main map logic
│   │   ├── assetCreation.js       # Asset creation
│   │   ├── trackLocation.js       # GPS tracking
│   │   ├── uploadData.js          # Data upload
│   │   └── ...
│   ├── css/               # Stylesheets
│   ├── bootStrap.html     # Main page
│   ├── dashboard.html     # Dashboard
│   └── app.js            # Express server
│
├── db/                    # Database scripts
│   ├── schema.sql        # Database schema
│   ├── seed_data.sql    # Initial data
│   └── views.sql         # Database views
│
└── docker-compose.yml     # Docker configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- Modern browser (with Geolocation API support)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web-gis-rating-platform/local-demo
   ```

2. **Start database services**
   ```bash
   docker-compose up -d
   ```
   This will start:
   - PostgreSQL + PostGIS database (port 5432)
   - pgAdmin management interface (port 5050)

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Start the frontend server**
   ```bash
   node app.js
   ```
   The server will start at `http://localhost:3000`

5. **Access the application**
   - Main app: `http://localhost:3000/bootStrap.html`
   - Dashboard: `http://localhost:3000/dashboard.html`
   - pgAdmin: `http://localhost:5050`

## ⚙️ Configuration

### Database Configuration

Database configuration is in `docker-compose.yml`:

```yaml
POSTGRES_USER: user101
POSTGRES_PASSWORD: mypassword
POSTGRES_DB: ucfscde
```

### API Configuration

Frontend API URL is configured in `frontend/js/basicMapLeaflet.js`:

```javascript
const serverURL = "http://localhost:3000"
```

### Database Connection

Backend database connection is in `backend/routes/crud.js` and `backend/routes/geoJSON.js`:

```javascript
const pool = new pg.Pool({
    user: "user101",
    host: "localhost",
    database: "ucfscde",
    password: "mypassword",
    port: 5432
});
```

## 📡 API Documentation

### CRUD Endpoints

#### Get User ID
```
GET /api/userId
```
Returns the current user's ID

#### Get Condition Options
```
GET /api/conditionDetails
```
Returns all available asset condition options

#### Create Asset
```
POST /api/insertAssetPoint
Body: {
  asset_name: string,
  installation_date: date,
  longitude: number,
  latitude: number
}
```

#### Delete Asset
```
POST /api/deleteAsset
Body: {
  id: number
}
```

#### Create Condition Report
```
POST /api/insertConditionInformation
Body: {
  asset_name: string,
  condition_description: string
}
```

### GeoJSON Endpoints

#### Get User Assets
```
GET /api/geojson/userAssets/:user_id
```
Returns all assets for the specified user (GeoJSON format)

#### Get Last 5 Condition Reports
```
GET /api/geojson/lastFiveConditionReports/:user_id
```

#### Get 5 Closest Assets to User
```
GET /api/geojson/userFiveClosestAssets/:latitude/:longitude
```

## 🗄️ Database Structure

### Main Tables

- **ucfscde.users** - User table
- **cege0043.asset_information** - Asset information table
- **cege0043.asset_condition_options** - Condition options table
- **cege0043.asset_condition_information** - Condition reports table

### Views

- **asset_with_latest_condition** - Assets with their latest condition
- **condition_reports_with_text_descriptions** - Condition report details
- **report_summary** - Report statistics summary

See `db/schema.sql` and `db/views.sql` for detailed structure

## 📖 User Guide

### Screen Size Behavior

The application automatically adjusts functionality based on screen size:

- **Desktop/Large Screen (992px-1200px, Bootstrap `lg` breakpoint)**
  - ✅ **POI Creation Enabled**: Click anywhere on the map to create new Points of Interest (POIs)
  - ✅ **Asset Management**: Create, view, update, and delete assets
  - 👁️ **View-Only Assessment**: Click on POI markers to view asset information and condition history, but **cannot rate/assess POIs**
  - 🎯 **Use Case**: Simulates console panel/management interface behavior for administrators and managers

- **Mobile/Small Screen (<768px, Bootstrap `xs`/`sm` breakpoint)**
  - ❌ **POI Creation Disabled**: Cannot create new POIs (map click events disabled)
  - ✅ **Condition Assessment Enabled**: **Rate existing POIs** and view results
  - ✅ **GPS Tracking**: Automatic location tracking and nearest asset detection
  - 🎯 **Use Case**: Field assessment workflow for on-site evaluators

- **Extra Large Screen (≥1200px, Bootstrap `xl`)**
  - 👁️ **View-Only Mode**: Markers are disabled, read-only interface

### Desktop (Large Screen, 992px-1200px)

**Note**: This is a management interface. You can create POIs but **cannot rate/assess them** on desktop. Rating is only available on mobile devices.

1. **Create POI/Asset**
   - Click anywhere on the map
   - Fill in asset name and installation date
   - Click save
   - This simulates the management/console panel workflow

2. **View Asset Information**
   - Click on an asset marker on the map
   - View asset details and latest condition
   - **Note**: This is view-only. To rate/assess POIs, use the mobile interface.

### Mobile (Small Screen)

**Note**: POI creation is disabled on mobile devices. This interface is designed for field assessment only.

1. **GPS Tracking**
   - System automatically gets current location
   - Automatically finds 5 nearest assets
   - Automatically opens condition assessment form for the closest asset

2. **Condition Assessment**
   - System automatically displays nearest asset
   - Fill in condition assessment
   - Save report

3. **View Results**
   - Access assessment results and statistics
   - View historical condition reports

### Marker Color Legend

- 🟢 **Green** - Very good condition
- 🔵 **Blue** - Some aesthetic defects, needs minor repair
- 🟠 **Orange** - Functional degradation, needs maintenance
- 🔴 **Red** - Not working, maintenance needed as soon as possible
- 🟣 **Purple** - Not working, needs immediate urgent maintenance
- ⚪ **Gray** - Unknown condition

## 🔧 Troubleshooting

### Database Connection Failed

1. Check if Docker containers are running:
   ```bash
   docker ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs db
   ```

3. Verify database configuration is correct

### API Request Failed

1. Check if server is running:
   ```bash
   lsof -ti:3000
   ```

2. Check server logs

3. Check browser console for error messages

### GPS Location Not Working

1. Ensure browser has location access permission
2. Use HTTPS or localhost (required by some browsers)
3. Check if device supports GPS

### Connecting to Database in pgAdmin

When adding a server in pgAdmin:
- **Host**: `db` (within Docker network) or `localhost` (from host machine)
- **Port**: `5432`
- **Username**: `user101`
- **Password**: `mypassword`
- **Database**: `ucfscde`

## 📝 Development Notes

### Updating Database Views

If you modify `db/views.sql`, you need to manually update the database:

```bash
docker exec -i cege0043_postgis psql -U user101 -d ucfscde < db/views.sql
```

### Resetting Database

If you need to reset the database:

```bash
docker-compose down -v
docker-compose up -d
```

This will delete all data and reinitialize.

<!--
## 📄 License

[Add your license information]

## 👥 Contributing

Issues and Pull Requests are welcome!

## 📧 Contact

[Add your contact information]
-->





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

