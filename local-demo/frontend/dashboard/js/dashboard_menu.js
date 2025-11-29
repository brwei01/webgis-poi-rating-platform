"user strict"


// functions to scroll to locations of the dashboard 
function scrollToCesiumViewer() {
  const cesiumViewerSection = document.getElementById("cesiumViewerBox");
  cesiumViewerSection.scrollIntoView({ behavior: "smooth" });
}

function scrollToBarGraph(){
  const barGraphSection = document.getElementById("barGraphBox");
  barGraphSection.scrollIntoView({behavior:"smooth"});
}

function scrollToPieGraph(){
  const pieGraphSection = document.getElementById("pieGraphBox");
  pieGraphSection.scrollIntoView({behavior:"smooth"});
}