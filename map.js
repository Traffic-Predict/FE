var map = L.map('map', {
    zoomControl: false
}).setView([36.332165597, 127.434310227], 13);  // 대전의 중심 좌표
var mode = "";
let modes = ["road", "predict"];
map.addControl(L.control.zoom({ position: 'bottomright' }));

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

function changeMode(modeName) {
    if (modeName === mode) return;
    mode = modeName;
    for (let m of modes) {
        for (let e of document.getElementsByClassName(m)) {
            e.style.display = m === mode ? "block" : "none";
        }
    }
    fetchTrafficData();
}

function clearMap() {
    for (i in map._layers) {
        if (map._layers[i]._path != undefined) {
            try {
                map.removeLayer(map._layers[i]);
            }
            catch (e) {
                console.log("problem with " + e + map._layers[i]);
            }
        }
    }
}

function fetchTrafficData() {
    let bound = map.getBounds()
    let x0 = bound.getSouthWest().lng;
    let y0 = bound.getSouthWest().lat;
    let x1 = bound.getNorthEast().lng;
    let y1 = bound.getNorthEast().lat;
    let zoomLevel = map.getZoom();
    if (x0 > x1) [x0, x1] = [x1, x0];
    if (y0 > y1) [y0, y1] = [y1, y0];
    url = 'https://carboncongestion.store/main';
    query = {
        minX: x0,
        maxX: x1,
        minY: y0,
        maxY: y1,
        zoom: zoomLevel
    }
    if (mode === "predict") {
        query["time"] = document.getElementById("date").value + "T" + document.getElementById("time").value + ":00";
        url = 'https://carboncongestion.store/predict/area';
    }
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
    };


    fetch(url, requestOptions)
        .then(response => response.json())
        .then(data => {
            clearMap();
            displayTrafficData(data.items);
        })
        .catch(error => {
            console.error('Error fetching traffic data:', error);
        });
}

// 지도에 도로 혼잡 정보를 표시
function displayTrafficData(trafficData) {
    trafficData.forEach(item => {
        try {
            var color = determineColorByStatus(item.road_status);
            polyline = JSON.parse(item.geometry);
            polyline = polyline.map(coord => [coord[1], coord[0]]);
            date = new Date(item.date);
            dateString = date.toLocaleString();
            L.polyline(polyline, { color: color, weight: 4 }).bindPopup(`${item.road_name}<br />${item.speed}km/h<br />${dateString}`).addTo(map);
        } catch (error) {
            console.error('Error parsing geometry:', error);
        }
    });
}

// 도로 상태에 따른 색상 결정
function determineColorByStatus(status) {
    return status === 3 ? 'red' : status === 2 ? 'yellow' : 'green';
}

map.on("load", fetchTrafficData);
map.on("moveend", fetchTrafficData);

window.onload = function () {
    changeMode("road");

}