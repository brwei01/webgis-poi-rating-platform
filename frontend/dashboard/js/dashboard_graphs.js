"use strict"

// ==================================
// function to create the bar graph
// adapted from https://github.com/ucl-geospatial/cege0043-app-examples.git by Ellul C.
function createBarGraph() {

    // get the outer container element and its dimensions
    var outerDiv = document.getElementById("userAssetWrapper");
    var outerWidth = outerDiv.offsetWidth;
    var outerHeight = outerDiv.offsetHeight;

    // add SVG element for the graph
    outerDiv.innerHTML = 
    `
     <svg fill="steelblue" width="`+outerWidth+`" height="`+outerHeight+`" id="svg1"></svg>
    `

    // define margins between svg element and its outer container
    let marginTop = 10;
    let marginBottom = 60;
    let marginLeft = 60;
    let marginRight = 60;


    // get data from api '/api/geojson/userAssets/:user_id'
    let serverURL = document.location.origin;
    let userId;
    fetch(serverURL + "/api/userId")
      .then(response => response.json())
      .then(data => {
        userId = data[0].user_id;
        console.log(userId);
        let dataURL = serverURL +'/api/geojson/userAssets/'+ userId;
        console.log(dataURL)
        d3.json(dataURL)
          .then(function(data) {
            data = data[0].features;
            console.log(data);

        // loop through the data and get the length of the x axis titles
        let xLen = 0;
        data.forEach(data =>{
            if (xLen < data.properties.asset_name.length) {
              xLen = data.properties.asset_name.length;
            }
            console.log(xLen);
              });

        // adjust the space available for the x-axis titles, depending on the length of the text
        if (xLen > 100) {
          marginBottom = Math.round(xLen/3,0);
        }
        else {
          marginBottom = xLen + 20;  // the 20 allows for the close button 
        }
        console.log(marginBottom);
        const svg   = d3.select("#svg1"),
            margin  = {top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft},
            width   = +svg.attr("width") - marginLeft - marginRight,
            height  = +svg.attr("height") - marginTop - marginBottom,
            x       = d3.scaleBand().rangeRound([0, width]).padding(0.2),
            y       = d3.scaleLinear().rangeRound([height, 0]),
            g       = svg.append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);

        
        x.domain(data.map(function(d) { return d.properties.asset_name; }));
        y.domain([0, d3.max(data, function(d) { return d.properties.condition_id; })]);


        // create y-axis
        g.append("g")
            .attr("class", "axis axis-y")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end");
        // adapted from: https://bl.ocks.org/mbostock/7555321 10th March 2021/
        g.append("g")
            .attr("class", "axis axis-x")
            .attr("transform", `translate(0,${height})`)
              .call(d3.axisBottom(x))
              .selectAll(".tick text")
              .call(wrap,x.bandwidth());

        /*
        // rotate the text to vertical
        g.select(".axis-x")
            .selectAll("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("dx", "-.8em")
            .attr("dy", "-.10em");
        */
          
        // select the bars and add interacitivity e.g. mouseover, mouseout, clicking etc.
        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
              .attr("class", "bar")
              .attr("asset_name", d => d.properties.asset_name)
              .attr("x", d => x(d.properties.asset_name))
              .attr("y", d => y(d.properties.condition_id))
              .attr("width", x.bandwidth())
              .attr("height", d => height - y(d.properties.condition_id))
              .on('mouseover', function(d) {
                // set bar colour to green to highlight.
                d3.select(this).style('fill', 'green');
                // Add tooltip or other interactivity here
                let assetName = d.properties.asset_name;
                // add a prompt on the mouse, with text "click to fly to assetName"
                d3.select("body").append("div")
                  .attr("class", "tooltip")
                  .html("Click to fly to " + assetName)
                  .style("left", (d3.event.pageX + 10) + "px")
                  .style("top", (d3.event.pageY - 10) + "px");
              })
              .on('mouseout', function(d) {
                // set bar colour back
                d3.select(this).style('fill', 'steelblue');
                // Remove tooltip or other interactivities
                d3.select(".tooltip").remove();
              })
              .on('click', function(d){
                // set bar colour back by clicking again
                d3.selectAll(".bar").style("fill", "steelblue");
                

                // ==================================================
                // bar graph - cesium interacitivity
                // Extract the asset name from the data object
                let assetName = d.properties.asset_name;
                console.log(assetName);
                // fly to the asset in cesium view according to its asset name
                loadVectorLayer(assetName);


                // ==================================================
                // bar graph - pie chart interactivity
                // highlight where the asset is located in the pie chart
                const slices = d3.selectAll("path");
                // set slice style back before selection
                slices.style("fill", slices.attr("fill"))
                .style("stroke", "none");
                // select the slice from pie chart 
                // if the asset_name of the clicked bar is included 
                // in the asset_names list of the corresponding slice.
                const selectedSlice = slices.filter(function(){
                  let assetNames = d3.select(this).attr("asset_names");
                  assetNames = assetNamesToArray(assetNames);
                  return assetNames.includes(assetName);
                })
                // highlight the selected slice.
                selectedSlice.style("fill", "white")
                          .style("stroke", "black")
                          .style("stroke-width", "2px");
              });
         
      }).catch(err => {
        let svg = d3.select('#svg1')
        svg.append("text")         
             .attr("y", 20)
             .attr("text-anchor", "left")  
             .style("font-size", "10px") 
             .style("font-weight", "bold")  
             .text(`Couldn't open the data file: "${err}".`);
      });


    });
}


// =============================================================
// function to wrap the legend entries
// adapted from https://github.com/ucl-geospatial/cege0043-app-examples.git by Ellul C.
// in particular if the place name where the user asset is long
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this);
    var words = text.text().split(/\s+/).reverse();
    var lineHeight = 1.1; // ems
    var y = text.attr("y");
    var dy = parseFloat(text.attr("dy"));
    var tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    var line = [];
    var word = words.pop();
    while (word) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
      }
      word = words.pop();
    }
  });
}


// ===================================================================================
// function to create a d3 pie chart to illustrate the proportion of assets with different condition values
// adapted from https://github.com/ucl-geospatial/cege0043-app-examples.git by Ellul C.
function createPieGraph(){
  // get the outer container element and its dimensions
  var outerDiv = document.getElementById("PieWrapper");
  var outerWidth = outerDiv.offsetWidth;
  var outerHeight = outerDiv.offsetHeight;

  // create an SVG container for the graph
  outerDiv.innerHTML = `<svg width="${outerWidth}" height="${outerHeight}" id="svg2"></svg>`

  
  let marginTop = 10;
  let marginBottom = 30;
  let marginLeft = 50;
  let marginRight = 60;


  let serverURL = document.location.origin;
  let userId;
  fetch(serverURL + "/api/userId")
    .then(response => response.json())
    .then(data => {;
      userId = data[0].user_id;
      console.log(userId);
      let dataURL = serverURL +'/api/geojson/userAssets/'+ userId;
      console.log(dataURL) 
        // Get the data from the API endpoint
          d3.json(dataURL)
          .then(data => {
              // Initialize an empty object to store the counts
              const counts = {}

              // Loop through each object in the data and count the number of occurrences of each condition_id value
              data[0].features.forEach(feature => {
                  const conditionId = feature.properties.condition_id
                  if (counts[conditionId]) {
                      counts[conditionId] += 1
                  } else {
                      counts[conditionId] = 1
                  }
              })

                // Convert the counts object to an array of objects with "condition_id", "count", and "asset_names" properties
                const pieChartData = Object.entries(counts).map(([conditionId, count]) => {
                const assetNames = data[0].features.filter(feature => feature.properties.condition_id === parseInt(conditionId)).map(feature => feature.properties.asset_name);
                return {
                    condition_id: parseInt(conditionId),
                    count,
                    asset_names: assetNames
                }
              })


              console.log(pieChartData);
              // Use the pieChartData to create a pie chart using D3.js
              // Define the size and position of the chart
              const svg = d3.select("#svg2"),
              margin = {top:marginTop, right:marginRight,bottom:marginBottom, left:marginLeft},
              width = +svg.attr("width"),
              height = +svg.attr("height"),
              centerX = width / 2, 
              centerY = height / 2,
              radius = Math.min(width, height)/2,
              g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);


              // Define the color scale for the chart
              const color = d3.scaleOrdinal()
                  //.domain(pieChartData.map(d => d.condition_id))
                  //.range(d3.schemeCategory10);
                  .domain([1,2,3,4,5,6])
                  .range(['green', 'blue', 'orange', 'red', 'purple', 'gray']);

              // Create the arc generator for the pie chart
              const arc = d3.arc()
                  .innerRadius(0)
                  .outerRadius(radius);

              // Create the pie generator for the pie chart
              const pie = d3.pie()
                  .sort(null)
                  .value(d => d.count);

              // Create the pie slices
              const slices = g.selectAll("path")
                  .data(pie(pieChartData))
                  .enter()
                  .append("path")
                  .attr("asset_names", d => d.data.asset_names)
                  .attr("d", arc)
                  .attr("fill", d => color(d.data.condition_id))
                  .on("mouseover", function(d) {
                    // add interactivity: mouseover a slice to change colour to white
                    // and prompt the condition id it represents
                    d3.select(this).style("fill", "white");
                    g.append("text")
                        .attr("class", "label")
                        .attr("transform", function() {
                            return "translate(" + arc.centroid(d) + ")";
                        })
                        .text("Condition" + d.data.condition_id + ": " + d.data.count + " Assets");
                  })
                  .on("mouseout", function(d) {
                    // mouseout to set colour back and hide prompt text.
                        d3.select(this).style("fill", color(d.data.condition_id)).style("stroke", "none");
                        d3.selectAll(".label").remove();
                      })
                  .on("click", function(d){
                    // set colour back to original(according to condition values of the asset) by clicking on a slice
                    d3.select(this).style("fill", color(d.data.condition_id)).style("stroke", "none");

                    // create interactivity with the bar graph
                    // when clicking on a slice, the corresponding bars in d3 bargraph will be hightlighted
                    let assetNames = d3.select(this).attr("asset_names");
                    assetNames = assetNamesToArray(assetNames);
                    
                    const bars = d3.selectAll("rect");
                    // loop over the bars in bar graph to check 
                    // if the bar's asset_name is included in the asset names list of the selected pie slice
                    const selectedBars = bars.filter(function(){
                      const assetName = d3.select(this).attr("asset_name");
                      return assetNames.includes(assetName);
                    })
                    // highlight the corresponding bars.
                    selectedBars.style("fill","green")
                   
                    //console.log(assetNames);
                  });


              // Add labels to the pie slices
              slices
                  .filter(d => d.endAngle - d.startAngle > 0.1) // only label slices where the angle is greater than 0.1 radians
                  .append("text")
                  .attr("transform", d => `translate(${arc.centroid(d)})`)
                  .attr("dy", "0.35em")
                  .text(d => d.data.condition_id);

          })   
    
    })

}



// ==========================================
// setting up click behaviour on cesium view and interactivity with the d3 charts
viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
  
  // Get the clicked object from the Cesium view
  var pickedObject = viewer.scene.pick(movement.position);
  console.log(pickedObject)

  // Check if the clicked object is a valid entity in Cesium
  if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id._name) {
      // Get the asset name of the clicked object
      var assetNameC = pickedObject.id._name;
      console.log(assetNameC);
      
      // ================================================================
      // interactivity with the bar graph
      // Get the corresponding bar in D3 and set the bars with a different colour
      d3.select("rect[asset_name='" + assetNameC + "']").style("fill", "green");
      // Update the fill color of the bar or add a stroke to highlight it
        
      // ================================================================
      // interacitivity with the pie chart
      // Get all the slices in D3
      const slices = d3.selectAll("path");
      // Filter the slices to find the one that contains the clicked asset name
      const selectedSlice = slices.filter(function() {
        let assetNames = d3.select(this).attr("asset_names");
        assetNames = assetNamesToArray(assetNames);
        return assetNames.includes(assetNameC);
      });
        // set the pie slices with the same asset_name as the clicked Cesium entity to a different colour
        selectedSlice.style("fill", "white")
        .style("stroke", "black")
        .style("stroke-width", "2px");
      
        // fly to the clicked entity in Cesium view
        loadVectorLayer(assetNameC);
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);        

// ================================
// function to change the 'assetNames' from a string to an array
function assetNamesToArray(assetNames){  
        if (assetNames) {
          assetNames = assetNames.split(",");
        } else {
          assetNames = [];
        }
        //console.log(assetNames);
        return assetNames;      
}