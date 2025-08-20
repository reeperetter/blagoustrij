// Загальні функції для всього сайту

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

// Функція для показу повідомлень
function showAlert(message, type = "success") {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    const container = document.querySelector(".container-fluid") || document.querySelector(".container");
    if (container) {
        container.insertAdjacentHTML("afterbegin", alertHtml);

        setTimeout(function () {
            const alert = container.querySelector(".alert");
            if (alert) {
                alert.remove();
            }
        }, 5000);
    }
}

// Модальне вікно вводу дати при виконанні завдання
