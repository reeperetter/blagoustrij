// Функція для показу модального вікна
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("modal--show");
    }
}

// Функція для приховування модального вікна
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("modal--show");
    }
}

// Функція для підтвердження видалення
function confirmDeleteSafe(button) {
    const locationId = button.getAttribute("data-location-id");
    const address = button.getAttribute("data-location-address");

    // Заповнюємо модальне вікно
    document.getElementById("deleteAddress").textContent = address;
    document.getElementById("confirmDeleteBtn").href = "/delete_location/" + locationId;

    // Показуємо модальне вікно
    showModal("deleteModal");
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
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("completionDate").value = today;

    // Налаштовуємо посилання для кнопки підтвердження
    const confirmBtn = document.getElementById("confirmCompleteBtn");
    confirmBtn.href = `/complete_location/${locationId}/completed?date=${today}`;

    // Показуємо модальне вікно
    showModal("completeModal");
}

// Оновлення посилання при зміні дати
document.addEventListener("DOMContentLoaded", function () {
    const dateInput = document.getElementById("completionDate");
    if (dateInput) {
        dateInput.addEventListener("change", function () {
            const confirmBtn = document.getElementById("confirmCompleteBtn");
            const currentHref = confirmBtn.href;
            const baseHref = currentHref.split("?date=")[0];
            confirmBtn.href = baseHref + "?date=" + this.value;
        });
    }
});

// Закриття модального вікна при кліку поза ним
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) {
        const modalId = e.target.id;
        hideModal(modalId);
    }
});

// Закриття модального вікна через кнопку закриття
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal__close")) {
        const modal = e.target.closest(".modal");
        if (modal) {
            hideModal(modal.id);
        }
    }
});
