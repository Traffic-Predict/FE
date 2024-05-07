var map = L.map('map').setView([36.355, 127.766], 13);  // 대전의 중심 좌표

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 실시간 도로 혼잡 정보를 가져오는 함수
function fetchTrafficData() {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            minX: 127.369182,
            maxX: 127.530568,
            minY: 36.192478,
            maxY: 36.297312
        })
    };

    fetch('https://carboncongestion.store/main', requestOptions)
        .then(response => response.json())
        .then(data => {
            displayTrafficData(data.items);  // 응답에서 'items' 배열을 정확히 참조
        })
        .catch(error => {
            console.error('Error fetching traffic data:', error);
        });
}

// 지도에 도로 혼잡 정보를 표시
function displayTrafficData(trafficData) {
    trafficData.forEach(item => {
        var color = determineColorByStatus(item.road_status);
        L.polyline([
            [item.minY, item.minX],
            [item.maxY, item.maxX]
        ], { color: color }).bindPopup(`${item.road_name} 현재 속도: ${item.speed}km/h`).addTo(map);
    });
}

// 도로 상태에 따른 색상 결정
function determineColorByStatus(status) {
    return status === 3 ? 'red' : status === 2 ? 'yellow' : 'green';
}

fetchTrafficData();
