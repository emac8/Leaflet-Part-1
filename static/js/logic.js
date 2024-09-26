// URL for earthquake data for previous 7 days
const Url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch data
d3.json(Url).then(function(data) {
    // Process data to be able to map
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Create popups for features
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    // Function for marker size according to magnitude
    function markerSize(magnitude) {
        return magnitude * 4;
    }

    // Set marker colors according to depth
    function markerColor(depth) {
        return depth > 90 ? "#FF0000" :
               depth > 70 ? "#FF8C00" :
               depth > 50 ? "#FFD700" :
               depth > 30 ? "#ADFF2F" :
               depth > 10 ? "#9ACD32" :
                            "#00FF00";
    }

    // GeoJSON layer with features included
    const earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.65 
            });
        },
        onEachFeature: onEachFeature // Bind popups
    });

    // Create map
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Set tile layer for map
    const earthquake_map = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
    });

    // Define map layers
    const baseMaps = {
        "Earthquake Map": earthquake_map
    };

    const overlayMaps = {
        Earthquakes: earthquakes
    };

    // Add layers to map
    const myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [earthquake_map, earthquakes]
    });

    // Add layer control to map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create and add legend to map
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
        const div = L.DomUtil.create("div", "info legend");
        div.style.backgroundColor = "white"; 
        div.style.padding = "6px 8px";
        div.style.fontSize = "12px";
        const depths = [-10, 10, 30, 50, 70, 90];
        const colors = ["#00FF00", "#9ACD32", "#ADFF2F", "#FFD700", "#FF8C00", "#FF0000"];
    
        // Add loop to retrieve corresponding color on legend
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                `<i style="background:${colors[i]}; width: 12px; height: 12px; display: inline-block;"></i> ${depths[i]}${(depths[i + 1] ? '&ndash;' + depths[i + 1] : '+')}<br>`;
        }
        return div;
    };
    legend.addTo(myMap);
}

