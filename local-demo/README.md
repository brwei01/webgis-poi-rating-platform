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

### Desktop (Large Screen)

1. **Create Asset**
   - Click anywhere on the map
   - Fill in asset name and installation date
   - Click save

2. **View Asset Information**
   - Click on an asset marker on the map
   - View asset details and latest condition

3. **Condition Assessment**
   - Click on an asset marker
   - Select condition status
   - Save assessment

### Mobile (Small Screen)

1. **GPS Tracking**
   - System automatically gets current location
   - Automatically finds 5 nearest assets
   - Automatically opens condition assessment form for the closest asset

2. **Condition Assessment**
   - System automatically displays nearest asset
   - Fill in condition assessment
   - Save report

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

