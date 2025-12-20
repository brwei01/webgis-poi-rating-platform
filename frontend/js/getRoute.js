"use strict";

let routeDestination = null;
let routeWaypoints = [];
let routingControl = null; // To hold the routing control instance

function setAsDestination(assetId, lat, lng, name){
    // get the marked destination point on map
    routeDestination = {
        id: assetId,
        latlng: L.latLng(lat, lng),
        name: name
    };
    
    console.log('Destination set: ', routeDestination);
    
    featureGroup.eachLayer(layer => {
        if (layer.options.assetId === assetId) {  // ← 用 assetId 匹配
            layer.setIcon(L.AwesomeMarkers.icon({
                icon: 'star',
                markerColor: 'red'
            }));
            // refresh popup content
            layer.setPopupContent( getPopupHTMLRouting(
                layer.options.assetName,
                '', // installationDate
                '', // userId
                assetId,
                layer.options.coords
            ));
        }
    });

    alert(`Destination set to: ${name}`);

    updateRoutePanel();
}

function addToRoute(assetId, lat, lng, name){
    if (routeWaypoints.some(wp => wp.id === assetId)) {
        alert('This point is already in the route waypoints.');
        return;
    }

    let waypoint = {
        id: assetId,
        latlng: L.latLng(lat, lng),
        name: name
    };

    routeWaypoints.push(waypoint);
    console.log('Waypoint added: ', waypoint);

    featureGroup.eachLayer(function(layer) {
        if (layer.options.asset_id === assetId) {
            layer.setIcon(L.AwesomeMarkers.icon({
                icon: 'flag',
                markerColor: 'blue'
            }));
            // refresh popup content
            layer.setPopupContent(getPopupHTMLRouting(
                layer.options.assetName,
                '',
                '',
                assetId,
                layer.options.coords
            ));
        }
    });

    alert(`Added: ${name}\nTotal waypoints: ${routeWaypoints.length}`);
    
    updateRoutePanel();

    refreshAllPopups();

}

function removeWaypoint(index) {
    if (index < 0 || index >= routeWaypoints.length) {
        alert('Invalid waypoint index.');
        return;
    }

    let removed = routeWaypoints.splice(index, 1)[0];
    console.log('Waypoint removed: ', removed);

    featureGroup.eachLayer(layer => {
        if (layer.options.assetId === removed.id) {  // ← 用 assetId 匹配
            // reset icon
            setMarkerColours(featureGroup);
            // refresh popup content
            layer.setPopupContent( getPopupHTMLRouting(
                layer.options.assetName,
                '', // installationDate
                '', // userId
                removed.id,
                layer.options.coords
            ));    
        }
    });
}

function clearDestination() {
    if (!routeDestination) {
        alert('No destination set.');
        return;
    }

    let removed = routeDestination;
    routeDestination = null;
    console.log('Destination cleared: ', removed);

    
    featureGroup.eachLayer(layer => {
        if (layer.options.assetId === removed.id) {  // ← 用 assetId 匹配
            // reset marker icon
            setMarkerColours(featureGroup);
            // refresh popup content
            layer.setPopupContent( getPopupHTMLRouting(
                layer.options.assetName,
                '', // installationDate
                '', // userId
                removed.id,
                layer.options.coords
            ));    
        }
    });

    alert(`Destination cleared: ${removed.name}`);

    updateRoutePanel();

    refreshAllPopups();
}

function refreshAllPopups() {
    featureGroup.eachLayer(function(layer) {
        if (layer.getPopup()) {
            layer.setPopupContent( getPopupHTMLRouting(
                layer.options.assetName,
                '', // installationDate
                '', // userId
                layer.options.assetId,
                layer.options.coords
            ));
        }
    });
}

function updateRoutePanel(){
    let routeInfoDiv = document.getElementById('routeInfo');
    
    if (!routeInfoDiv) {
        console.error('routeInfo div not found!');
        return;
    }

    if (!routeDestination && routeWaypoints.length === 0) {
        routeInfoDiv.innerHTML =`
            <div class="text-muted small">
                <i class="fa fa-info-circle me-1"></i>
                Click on assets to plan your route
            </div>
        `;
        return;
    }

    let waypointsHTML = ``;
    if ( routeWaypoints.length > 0) {
        waypointsHTML = `
            <div class="mb-2">
                <strong><i class="fa fa-flag me-1"></i>Waypoints:</strong>
                <ul class="small mb-0 ps-3">
                    ${routeWaypoints.map((wp, idx) => `
                        <li>${idx + 1}. ${wp.name}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    let destinationHTML = ``;
    if (routeDestination) {
        destinationHTML = `
            <div class="mb-2">
                <strong><i class="fa fa-star me-1"></i>Destination:</strong><br>
                <small>${routeDestination.name}</small>
            </div>
        `;
    }

    routeInfoDiv.innerHTML = `
        ${waypointsHTML}
        ${destinationHTML}
        <button class="btn btn-sm btn-primary w-100 mb-2" onclick="calculateRoute()">
            <i class="fa fa-route me-1"></i>Calculate Route
        </button>
        <button class="btn btn-sm btn-secondary w-100" onclick="clearRoute()">
            <i class="fa fa-times me-1"></i>Clear All
        </button>    
    `;
}

// using OSM road network to calculate the route (Dijkstra)
function calculateRoute(){
    if (routeWaypoints.length === 0  &&! routeDestination) {
        alert('Please add waypoints or set a destination first.');
        return;
    }

    // create waypoints array
    let waypoints = [...routeWaypoints.map( wp => wp.latlng )];
    if (routeDestination) {
        waypoints.push( routeDestination.latlng );
    }

    // remove old routing control if exists
    if (routingControl) {
        mymap.removeControl(routingControl);
    }

    document.getElementById('routeInfo').innerHTML = `
            <div class="text-center">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="small mt-2">Calculating route...</div>
        </div>
    `;

    // create new routing control (using OSM, Dijkstra)
    routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        showAlternatives: true,
        show: true, // show the itinerary pane,
        collapsible: true, 
        altLineOptions: {
            styles: [
                {color: 'gray', opacity: 0.5, weight: 4, dashArray: '10, 10'},
            ]
        },
        lineOptions: {
            styles:[{color : 'blue', opacity: 0.8, weight: 6}]
        },
        createMarker: function(){return null;},
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving', // 'driving', 'walking', 'cycling'
        }),
    }).addTo(mymap);

    // listen for route to be calculated
    routingControl.on('routesfound', function(e) {
        let routes = e.routes;
        let summary = routes[0].summary;
        console.log('Route found: ', routes[0]);
        console.log('Distance: ' + (summary.totalDistance / 1000).toFixed(2) + ' km');
        console.log('Time: ' + (summary.totalTime / 60).toFixed(2) + ' mins');

        // // 更新面板
        // document.getElementById('routeInfo').innerHTML = `
        //     <strong>Route Calculated!</strong><br>
        //     📏 Distance: ${(summary.totalDistance / 1000).toFixed(2)} km<br>
        //     ⏱️ Time: ${(summary.totalTime / 60).toFixed(0)} min<br>
        //     📍 Waypoints: ${waypoints.length}<br>
        //     <button class="btn btn-sm btn-danger mt-2 w-100" onclick="clearRoute()">Clear Route</button>
        // `;
        // ✅ 显示所有路线信息
        let routesInfo = routes.map((route, idx) => {
            let dist = (route.summary.totalDistance / 1000).toFixed(2);
            let time = (route.summary.totalTime / 60).toFixed(0);
            let isBest = idx === 0 ? ' ⭐' : '';
            return `<li>Route ${idx + 1}${isBest}: ${dist} km, ${time} min</li>`;
        }).join('');
        
        // 构建途经点列表
        let waypointsHTML = '';
        if (routeWaypoints.length > 0) {
            waypointsHTML = `
                <div class="mb-2">
                    <strong>Waypoints:</strong>
                    <ul class="small mb-0 ps-3">
                        ${routeWaypoints.map((wp, idx) => `<li>${idx + 1}. ${wp.name}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        // 更新面板
        document.getElementById('routeInfo').innerHTML = `
            <div class="alert alert-success small mb-2 p-2">
                <strong>✅ Route Calculated!</strong>
            </div>
            
            ${waypointsHTML}
            
            ${routeDestination ? `
                <div class="mb-2">
                    <strong>Destination:</strong> ${routeDestination.name}
                </div>
            ` : ''}
            
            <div class="mb-2">
                <strong>Best Route:</strong><br>
                📏 Distance: ${(summary.totalDistance / 1000).toFixed(2)} km<br>
                ⏱️ Time: ${(summary.totalTime / 60).toFixed(0)} min
            </div>
            
            ${routes.length > 1 ? `
                <div class="mb-2">
                    <strong>All Routes:</strong>
                    <ul class="small mb-0 ps-3">${routesInfo}</ul>
                </div>
            ` : ''}
            
            <button class="btn btn-sm btn-danger w-100" onclick="clearRoute()">
                <i class="fa fa-times me-1"></i>Clear Route
            </button>
        `;
        
        // alert(
        //     `Route calculated!\n` +
        //     `Distance: ${(summary.totalDistance / 1000).toFixed(2)} km\n` +
        //     `Time: ${(summary.totalTime / 60).toFixed(2)} mins\n` +
        //     `Waypoints: ${waypoints.length}`
        // );

    });

    // 监听路线计算错误
    routingControl.on('routingerror', function(e) {
        console.error('❌ Routing error:', e);
        document.getElementById('routeInfo').innerHTML = `
            <div class="alert alert-danger small mb-2 p-2">
                <strong>❌ Route calculation failed</strong><br>
                <small>${e.error?.message || 'Please check your network'}</small>
            </div>
            <button class="btn btn-sm btn-secondary w-100" onclick="updateRoutePanel()">
                <i class="fa fa-redo me-1"></i>Back
            </button>
        `;
    });

    // routingControl.on('routingerror', function(e) {
    //     document.getElementById('routeInfo').innerHTML = `
    //         <span class="text-danger">❌ Route calculation failed</span>
    //     `;
    // });



}

// clear route
function clearRoute(){
    routeDestination = null;
    routeWaypoints = [];

    if(routingControl){
        mymap.removeControl(routingControl);
        routingControl = null;
    }

    // 重置面板
    document.getElementById('routeInfo').innerHTML = `
        <div class="text-muted small">
            <i class="fa fa-info-circle me-1"></i>
            Click on assets to plan your route
        </div>
    `;
    
    document.getElementById('routeInfo').innerHTML = `Click on assets to plan your route`;

    setMarkerColours(featureGroup);
    // alert('Route cleared.');
}