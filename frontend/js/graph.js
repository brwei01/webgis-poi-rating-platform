"use strict"

// ======================================================================
// function to close the graph (called at the toggle button "Show List of Asset in Best Condition")
function closeAssetData(){

  // set the map and graph container collapse behaviour
  // so that when graph loads, the map can slide into a hidden status.

  // set the outer map container collapse behaviour
	let mapCollapse = document.getElementById('mapWrapper');
	let bsMapCollapse = new bootstrap.Collapse(mapCollapse,{
		toggle:false, show:false
	});
	bsMapCollapse.show();

  // set the graph container collapse behaviour
	let adwCollapse = document.getElementById('assetDataWrapperWrapper');
	let bsAdwCollapse = new bootstrap.Collapse(adwCollapse,{
		toggle:false, show:true
	});
	bsAdwCollapse.hide();
}

// ======================================================================
// set a status to control the on/off of the toggle button
let graphVisible = false;
// function called at the toggle button: to show the graph
function showDailyReportingRatesGraph(){

  // if the graph is set to not showing, close the graph;
  if (graphVisible){
    closeAssetData();
    toggleButton2.textContent = "Daily Reporting Rates Graph – All Users"
    graphVisible = false;
  } 
  // if the graph is set to show, open up the graph 
  // and change the button content to 'hide graph' to prompt closing graph action.
  else {
    let mapCollapse = document.getElementById('mapWrapper');
    let bsMapCollapse = new bootstrap.Collapse(mapCollapse,{
      toggle:false, show:true
    });
    bsMapCollapse.hide();

    let adwCollapse = document.getElementById('assetDataWrapperWrapper');
    let bsAdwCollapse = new bootstrap.Collapse(adwCollapse,{
      toggle:false, show:false
    });
    bsAdwCollapse.show();

    createGraph()
    toggleButton2.textContent = "Hide Graph";

    graphVisible = true;
  }
	
}

// =======================================
// function to create the graph
function createGraph() {

  // get the width and height of the graph container
  // adapted from the class
  let widtha = document.getElementById("assetDataWrapper").clientWidth*2;
  let heighta = document.getElementById("assetDataWrapper").offsetHeight;
  console.log(widtha+" "+heighta);

  // add the close button and SVG container for the graph
  document.getElementById("assetDataWrapper").innerHTML = 
  `<div class='h=100 w-100'>
  <button type="button" class="btn-close float-end" aria-label="Close" onclick="closeAssetData()"></button>
   <svg fill="blue" width="`+widtha+`" height="`+heighta+`" id="svg1"></svg>
   </div>`

    // get the margins between svg element and graph container
    let marginTop = 20;
    let marginBottom = 30;
    let marginLeft = 50;
    let marginRight = 60;


// define the data url
let dataURL = serverURL + "/api/geojson/dailyParticipationRates"

// download the data and create the graph by d3.json() method
d3.json(dataURL).then(data => {
  data = data[0].array_to_json;
  console.log(data);

  // loop through the data and get the length of the x axis titles
  let xLen = 0;
  data.forEach(feature =>{
      if (xLen < feature.day.length) {
        xLen = feature.day.length;
      }
      console.log(xLen);
        });

  // adjust the space available for the x-axis titles, depending on the length of the text
  if (xLen > 100) {
    marginBottom = Math.round(xLen/3,0);
  }
  else {
    marginBottom = xLen + 20;  // this 20 allows for the close button 
  } //rough approximation for now
  console.log(marginBottom);
  const svg   = d3.select("#svg1"),
      margin  = {top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft},
      width   = +svg.attr("width") - marginLeft - marginRight,
      height  = +svg.attr("height") - marginTop - marginBottom,
      x       = d3.scaleBand().rangeRound([0, width]).padding(0.2),
      y       = d3.scaleLinear().rangeRound([height, 0]),
      // set g as a grouping element
      g       = svg.append("g")
                   .attr("transform", `translate(${margin.left},${margin.top})`);


 x.domain(data.map(d => d.day));
 y.domain([0, d3.max(data, d => d.reports_submitted)]);


// adapted from: https://bl.ocks.org/mbostock/7555321 10th March 2021/
 g.append("g")
    .attr("class", "axis axis-x")
    .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll(".tick text")
      .call(wrap,x.bandwidth());


  g.append("g")
      .attr("class", "axis axis-y")
      .call(d3.axisLeft(y).ticks(10).tickSize(8));

  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.day))
      .attr("y", d => y(d.reports_submitted))
      .attr("width", x.bandwidth())
      .attr("fill", "lightgreen")
      .attr("height", d => height - y(d.reports_submitted));

  // add second group of bars
  g.selectAll(".bar-not-working")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar-not-working")
      .attr("x", d => x(d.day))
      .attr("y", d => y(d.reports_not_working))
      .attr("width", x.bandwidth()*0.7)
      .attr("fill", "blue")
      .attr("height", d => height - y(d.reports_not_working))
    
      // add a legend for the graph
g.append("rect")
        .attr("class", "legend")
        .attr("x", width - 150) // moved to the left by 24 pixels
        .attr("y", 0)
        .attr("width", 19)
        .attr("height", 19)
        .style("fill", "lightgreen");


      g.append("text")
        .attr("class", "legend")
        .attr("x", width - 120)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text("Reports Submitted");

      g.append("rect")
        .attr("class", "legend-not-working")
        .attr("x", width - 150)
        .attr("y", 25)
        .attr("width", 19)
        .attr("height", 19)
        .style("fill", "blue");

      g.append("text")
        .attr("class", "legend-not-working")
        .attr("x", width - 120)
        .attr("y", 34.5)
        .attr("dy", "0.32em")
        .text("Reports Not Working");






})
// print the error message on the graph if error caught.
.catch(err => {
   svg.append("text")         
        .attr("y", 20)
        .attr("text-anchor", "left")  
        .style("font-size", "10px") 
        .style("font-weight", "bold")  
        .text(`Couldn't open the data file: "${err}".`);
});
}


// separate function to wrap the legend entries
// in particular if the place name where the earthquake happened is long
function wrap(text, width) {
  text.each(function() {
    let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}




























