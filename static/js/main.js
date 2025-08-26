// Безпечна функція для data-атрибутів (видалення дислокацій)
function confirmDeleteSafe(button) {
    const locationId = button.getAttribute("data-location-id");
    const address = button.getAttribute("data-location-address");

    // Заповнюємо модальне вікно
    document.getElementById("deleteAddress").textContent = address;
    document.getElementById("confirmDeleteBtn").href = "/delete/" + locationId;

    // Показуємо модальне вікно
    const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
    deleteModal.show();
}

// Функція для підтвердження закриття завдання
function confirmComplete(button) {
    const locationId = button.getAttribute("data-location-id");
    const address = button.getAttribute("data-location-address");
    const problemType = button.getAttribute("data-problem-type");

    // Заповнюємо модальне вікно
    document.getElementById("completeAddress").textContent = address;
    document.getElementById("completeProblemType").textContent = problemType;

    // Встановлюємо поточну дату
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD формат для input[type="date"]
    document.getElementById("completionDate").value = formattedDate;

    // Налаштовуємо кнопку підтвердження
    document.getElementById("confirmCompleteBtn").onclick = function () {
        const selectedDate = document.getElementById("completionDate").value;
        window.location.href = `/status/${locationId}/completed?date=${selectedDate}`;
    };

    // Показуємо модальне вікно
    const completeModal = new bootstrap.Modal(document.getElementById("completeModal"));
    completeModal.show();
}

// Функція для показу повідомлень
// function showAlert(message, type = "success") {
//     const alertHtml = `
//         <div class="alert alert-${type} alert-dismissible fade show" role="alert">
//             ${message}
//             <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
//         </div>
//     `;

//     const container = document.querySelector(".container-fluid") || document.querySelector(".container");
//     if (container) {
//         container.insertAdjacentHTML("afterbegin", alertHtml);

//         setTimeout(function () {
//             const alert = container.querySelector(".alert");
//             if (alert) {
//                 alert.remove();
//             }
//         }, 5000);
//     }
// }
