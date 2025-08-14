// Ініціалізація карти для окремої дислокації
document.addEventListener("DOMContentLoaded", function () {
    // Отримуємо дані з HTML (через data-атрибути)
    const mapElement = document.getElementById("map");
    const lat = parseFloat(mapElement.dataset.lat);
    const lng = parseFloat(mapElement.dataset.lng);
    const problemType = mapElement.dataset.problemType;
    const status = mapElement.dataset.status;
    const address = mapElement.dataset.address;
    const dateCreated = mapElement.dataset.dateCreated;

    // Ініціалізація карти
    const map = L.map("map").setView([lat, lng], 16);

    // Додавання тайлів
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Визначення кольору іконки залежно від типу проблеми
    let iconColor = "blue";
    let badgeClass = "bg-secondary";

    switch (problemType) {
        case "Гілля":
            iconColor = "#ffc107";
            badgeClass = "bg-warning";
            break;
        case "Листя":
            iconColor = "#198754";
            badgeClass = "bg-success";
            break;
        case "Звалища":
            iconColor = "#dc3545";
            badgeClass = "bg-danger";
            break;
    }

    // Створення маркера
    const marker = L.marker([lat, lng]).addTo(map);

    // Popup з інформацією
    const statusText = status === "completed" ? '<span class="text-success">✓ Виконано</span>' : '<span class="text-primary">⏳ В роботі</span>';

    const popupContent = `
        <div class="text-center">
            <h6 class="mb-2">${address}</h6>
            <span class="badge ${badgeClass} mb-2">
                ${problemType}
            </span><br>
            <small class="text-muted">
                Створено: ${dateCreated}<br>
                ${statusText}
            </small>
        </div>
    `;

    marker.bindPopup(popupContent).openPopup();

    // Додавання кола навколо маркера
    L.circle([lat, lng], {
        color: iconColor,
        fillColor: iconColor,
        fillOpacity: 0.1,
        radius: 50,
    }).addTo(map);

    console.log("Карта ініціалізована для дислокації:", lat, lng);
});
