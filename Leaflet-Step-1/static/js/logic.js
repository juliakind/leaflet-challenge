var plates;
var myMap;
var static_plates = "/static/plates/PB2002_plates.json";
var data_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var map_url = "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}"
//todo: move to config file
var aT ="pk.eyJ1IjoieXVsaWFraW5kIiwiYSI6ImNrN3ducnp3NjA0NDkzbHI4cGxpaXlkcTkifQ.jHYmYm7SccLOCmcVil3jpw"

d3.json(static_plates,function(response){
        plates = L.geoJSON(response,{  
        style: function(feature){
            return {
                color:"orange",
                fillColor: "white",
                fillOpacity:0
            }
        },      
        onEachFeature: function(feature,layer){
            console.log(feature.coordinates);
            layer.bindPopup("Plate Name: "+feature.properties.PlateName);
        }       
    })
   
    d3.json(data_url,function(data){
    //Load circle markers
    function createCircleMarker(feature,latlng){
        let options = {
            radius:feature.properties.mag*4,
            fillColor: loadColor(feature.properties.mag),
            color: "black",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
        }
        return L.circleMarker( latlng, options );
    }

    //Load popups with data
    var earthQuakes = L.geoJSON(data,{
        onEachFeature: function(feature,layer){
            layer.bindPopup("Place: "+feature.properties.place + "<br> Magnitude: "+feature.properties.mag+"<br> Time: "+new Date(feature.properties.time));
        },
        pointToLayer: createCircleMarker
    });
    createMap(plates,earthQuakes);
    });    
});


  function createMap(plates,earthQuakes) {
    // Define Satellite view
    var satellite = L.tileLayer(map_url, {
      maxZoom: 15,
      id: "mapbox.satellite",
      accessToken: aT
    });
    // Define Grayscale view
    var grayscale = L.tileLayer(map_url, {
      maxZoom: 15,
      id: "mapbox.light",
      accessToken: aT
    });
    // Define Otdoors view
    var outdoors = L.tileLayer(map_url, {
      maxZoom: 15,
      id: "mapbox.outdoors",
      accessToken: aT
    });
  
    // Define map layers
    var baseMaps = {
      "Satellite": satellite,
      "Grayscale": grayscale,
      "Outdoors": outdoors
    };
  
    // Define overlays
    var overlayMaps = {
      "Fault Lines": plates,
      "Earthquakes": earthQuakes
    };
  
    // Create map
    var myMap = L.map("map", {
      center: [
        35,-95
      ],
      zoom: 4,
      layers: [satellite, plates, earthQuakes]
    });
  
    
    // Load layers into the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    var info = L.control({
        position: "bottomright"
    });

    info.onAdd = function(){
        var div = L.DomUtil.create("div","legend");
        return div;

    }
    info.addTo(myMap);

    //Load HTML with Choropleth overlay
    document.querySelector(".legend").innerHTML=loadChoropleth();

    }

    // Define Choropleth colors
    function loadChoropleth(){
        var grades = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
        var color = ["#C4F069","#E5F86A","#EFDA66","#EABB61","#E5A975","#E0736F"];
      
        var strng = "";
       
        for (i = 0; i < color.length; i++){
            strng += "<p style = \"background-color: "+color[i]+"\">"+grades[i]+"</p> ";
        }        
        return strng;
}

  // Define Circle's colors
  function loadColor(magnitude){
    switch(true){
        case (magnitude<1):
            return "#C4F069";
        case (magnitude<2):
            return "#E5F86A";
        case (magnitude<3):
            return "#EFDA66";
        case (magnitude<4):
            return "#EABB61";
        case (magnitude<5):
            return "#E5A975";
        default:
            return "#E0736F";
    };
}

