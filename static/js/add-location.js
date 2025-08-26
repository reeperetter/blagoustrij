// Скрипт для додавання/редагування дислокації
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM завантажено, ініціалізуємо карту...");

    // Перевіряємо чи завантажився Leaflet
    if (typeof L === "undefined") {
        console.error("Leaflet не завантажився!");
        return;
    }

    // Отримуємо координати з data-атрибутів або використовуємо за замовчуванням
    const mapElement = document.getElementById("map");
    const defaultLat = parseFloat(mapElement.dataset.defaultLat) || 47.82085887156977;
    const defaultLng = parseFloat(mapElement.dataset.defaultLng) || 35.0326454729596;

    // Ініціалізація карти
    const map = L.map("map").setView([defaultLat, defaultLng], 14);
    console.log("Карта створена");

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    console.log("Тайли додані");

    let marker = null;

    // Функція для отримання адреси за координатами
    function getAddressFromCoordinates(lat, lng) {
        console.log("Отримуємо адресу для:", lat, lng);

        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=uk,ru,en`;

        fetch(url)
            .then((response) => {
                console.log("Відповідь від Nominatim:", response.status);
                return response.json();
            })
            .then((data) => {
                console.log("Дані адреси:", data);

                if (data && data.display_name) {
                    let address = "";
                    const addr = data.address;

                    if (addr) {
                        const parts = [];

                        if (addr.road) {
                            let roadType = "";
                            let roadName = addr.road;

                            if (roadName.includes("вулиця") || roadName.includes("улица")) {
                                roadType = "вул. ";
                                roadName = roadName.replace(/^(вулиця|улица)\s*/i, "").trim();
                            } else if (roadName.includes("проспект")) {
                                roadType = "просп. ";
                                roadName = roadName.replace(/^проспект\s*/i, "").trim();
                            } else if (roadName.includes("площа") || roadName.includes("площадь")) {
                                roadType = "пл. ";
                                roadName = roadName.replace(/^(площа|площадь)\s*/i, "").trim();
                            } else if (roadName.includes("бульвар")) {
                                roadType = "бул. ";
                                roadName = roadName.replace(/^бульвар\s*/i, "").trim();
                            } else {
                                roadType = "вул. ";
                            }

                            parts.push(roadType + roadName);
                        }

                        if (addr.house_number) {
                            if (parts.length > 0) {
                                parts[parts.length - 1] += ", " + addr.house_number;
                            } else {
                                parts.push(addr.house_number);
                            }
                        }

                        address = parts.join(", ");
                    }

                    if (!address && data.display_name) {
                        const parts = data.display_name.split(",");
                        if (parts.length >= 2) {
                            address = parts[0].trim() + ", " + parts[1].trim();
                        } else {
                            address = parts[0].trim();
                        }
                    }

                    const addressField = document.getElementById("address");
                    if (address && addressField) {
                        addressField.value = address;
                        console.log("Адресу встановлено:", address);
                        showNotification("Адресу автоматично визначено. Ви можете її відредагувати.", "success");
                    } else {
                        console.log("Не вдалося сформувати адресу");
                        showNotification("Не вдалося визначити адресу. Введіть її вручну.", "warning");
                    }
                } else {
                    console.log("Немає даних адреси");
                    showNotification("Не вдалося визначити адресу. Введіть її вручну.", "warning");
                }
            })
            .catch((error) => {
                console.error("Помилка при отриманні адреси:", error);
                showNotification("Помилка при визначенні адреси. Введіть її вручну.", "danger");
            });
    }

    // Функція для показу повідомлень
    // function showNotification(message, type = "success") {
    //     const existingAlert = document.querySelector(".address-notification");
    //     if (existingAlert) {
    //         existingAlert.remove();
    //     }

    //     const alertClass = "alert-" + type;
    //     const alertHtml = `
    //         <div class="alert ${alertClass} alert-dismissible fade show address-notification mt-2">
    //             <small>${message}</small>
    //             <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    //         </div>
    //     `;

    //     const addressField = document.getElementById("address");
    //     if (addressField) {
    //         addressField.insertAdjacentHTML("afterend", alertHtml);

    //         setTimeout(function () {
    //             const alert = document.querySelector(".address-notification");
    //             if (alert) {
    //                 alert.remove();
    //             }
    //         }, 5000);
    //     }
    // }

    // Обробник кліку по карті
    map.on("click", function (e) {
        console.log("Клік по карті:", e.latlng);
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (marker) {
            map.removeLayer(marker);
        }

        marker = L.marker([lat, lng]).addTo(map);

        document.getElementById("latitude").value = lat.toFixed(6);
        document.getElementById("longitude").value = lng.toFixed(6);

        console.log("Координати оновлені:", lat, lng);
        getAddressFromCoordinates(lat, lng);
    });

    // Кнопка геолокації
    const locationButton = L.control({ position: "topright" });
    locationButton.onAdd = function (map) {
        const div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
        div.style.backgroundColor = "white";
        div.style.width = "30px";
        div.style.height = "30px";
        div.style.cursor = "pointer";
        div.innerHTML = "📍";
        div.title = "Моє місцезнаходження";

        div.onclick = function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;

                        console.log("Геолокація:", lat, lng);

                        map.setView([lat, lng], 16);

                        if (marker) {
                            map.removeLayer(marker);
                        }

                        marker = L.marker([lat, lng]).addTo(map);

                        document.getElementById("latitude").value = lat.toFixed(6);
                        document.getElementById("longitude").value = lng.toFixed(6);

                        getAddressFromCoordinates(lat, lng);
                    },
                    function (error) {
                        console.error("Помилка геолокації:", error);
                        alert("Не вдалося отримати ваше місцезнаходження");
                    }
                );
            } else {
                alert("Геолокація не підтримується вашим браузером");
            }
        };

        return div;
    };
    locationButton.addTo(map);

    // Для редагування існуючої дислокації
    const latField = document.getElementById("latitude");
    const lngField = document.getElementById("longitude");

    if (latField && lngField && latField.value && lngField.value) {
        const lat = parseFloat(latField.value);
        const lng = parseFloat(lngField.value);
        console.log("Існуючі координати:", lat, lng);

        map.setView([lat, lng], 15);
        marker = L.marker([lat, lng]).addTo(map);
    }

    console.log("Карта повністю ініціалізована");
});
