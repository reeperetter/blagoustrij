// Import Leaflet library
const L = window.L;

let map;
const markers = [];
const currentPopup = null;

function initMap() {
    // Центр на Хортицькому районі Запоріжжя
    map = L.map("map").setView([47.8388, 35.1396], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Отримуємо дані локацій з HTML
    const mapElement = document.getElementById("map");
    const locationsData = JSON.parse(mapElement.dataset.locations);

    // Додаємо маркери на карту
    locationsData.forEach((location) => {
        addMarker(location);
    });

    // Якщо є маркери, підганяємо карту під них, але не занадто близько
    if (markers.length > 0) {
        const group = new L.featureGroup(markers.map((m) => m.marker));
        const bounds = group.getBounds();

        // Якщо маркери занадто близько один до одного, використовуємо фіксований зум
        if (bounds.isValid()) {
            map.fitBounds(bounds, {
                padding: [20, 20],
                maxZoom: 15, // Не наближаємо занадто близько
            });
        }
    }

    // Додаємо обробники подій для списку локацій
    document.querySelectorAll('[data-action="focus-location"]').forEach((item) => {
        item.addEventListener("click", function () {
            const lat = Number.parseFloat(this.dataset.lat);
            const lng = Number.parseFloat(this.dataset.lng);
            const id = Number.parseInt(this.dataset.id);
            focusLocation(lat, lng, id);
        });
    });
}

function addMarker(location) {
    let color;
    switch (location.problemType) {
        case "Гілля":
            color = "#ffc107"; // жовтий
            break;
        case "Листя":
            color = "#28a745"; // зелений
            break;
        case "Звалища":
            color = "#dc3545"; // червоний
            break;
        default:
            color = "#6c757d"; // сірий
    }

    const marker = L.circleMarker([location.lat, location.lng], {
        radius: 8,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
    }).addTo(map);

    const popupContent = `
        <div class="popup-content">
            <h6 class="mb-2">${location.address}</h6>
            <p class="mb-1"><strong>Тип:</strong> ${location.problemType}</p>
            <p class="mb-1"><strong>Створено:</strong> ${location.dateCreated}</p>
            ${location.dateCompleted ? `<p class="mb-0"><strong>Виконано:</strong> ${location.dateCompleted}</p>` : ""}
        </div>
    `;

    marker.bindPopup(popupContent);
    markers.push({ marker: marker, id: location.id });
}

function focusLocation(lat, lng, id) {
    // Центруємо карту на локації
    map.setView([lat, lng], 16);

    // Знаходимо відповідний маркер і відкриваємо popup
    const markerObj = markers.find((m) => m.id === id);
    if (markerObj) {
        markerObj.marker.openPopup();
    }

    // Підсвічуємо елемент у списку
    document.querySelectorAll(".location-item").forEach((item) => {
        item.classList.remove("active");
    });

    const activeItem = document.querySelector(`[data-id="${id}"]`);
    if (activeItem) {
        activeItem.classList.add("active");
    }
}

// Ініціалізуємо карту після завантаження сторінки
document.addEventListener("DOMContentLoaded", initMap);
