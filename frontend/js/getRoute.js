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
        }
    });

    alert(`Destination set to: ${name}`);
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
        }
    });

    alert(`Added: ${name}\nTotal waypoints: ${routeWaypoints.length}`);


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

        // 更新面板
        document.getElementById('routeInfo').innerHTML = `
            <strong>Route Calculated!</strong><br>
            📏 Distance: ${(summary.totalDistance / 1000).toFixed(2)} km<br>
            ⏱️ Time: ${(summary.totalTime / 60).toFixed(0)} min<br>
            📍 Waypoints: ${waypoints.length}<br>
            <button class="btn btn-sm btn-danger mt-2 w-100" onclick="clearRoute()">Clear Route</button>
        `;
        
        // alert(
        //     `Route calculated!\n` +
        //     `Distance: ${(summary.totalDistance / 1000).toFixed(2)} km\n` +
        //     `Time: ${(summary.totalTime / 60).toFixed(2)} mins\n` +
        //     `Waypoints: ${waypoints.length}`
        // );

    });

    routingControl.on('routingerror', function(e) {
        document.getElementById('routeInfo').innerHTML = `
            <span class="text-danger">❌ Route calculation failed</span>
        `;
    });

    // routingControl.on('routingerror', function(e) {
    //     console.error('Routing error: ', e);
    //     alert('Error calculating route. Please try again.');
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
    
    document.getElementById('routeInfo').innerHTML = `Click on assets to plan your route`;

    setMarkerColours(featureGroup);
    // alert('Route cleared.');
}