/**
 * Власні модальні вікна без Bootstrap
 * Заміна для bootstrap.Modal
 * 
 * НЕ ПРАВИЛЬНО ПРАЦЮЄ
 * 
 */

class CustomModal {
    constructor(element) {
        this.element = typeof element === "string" ? document.getElementById(element) : element;
        this.isOpen = false;
        this.init();
    }

    init() {
        if (!this.element) return;

        // Додаємо обробники подій
        this.bindEvents();
    }

    bindEvents() {
        // Закриття на хрестик або кнопки з data-dismiss
        const closeButtons = this.element.querySelectorAll('[data-dismiss="modal"], .btn-close');
        closeButtons.forEach((btn) => {
            btn.addEventListener("click", () => this.hide());
        });

        // Закриття на клік по overlay
        this.element.addEventListener("click", (e) => {
            if (e.target === this.element) {
                this.hide();
            }
        });

        // Закриття на Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.isOpen) {
                this.hide();
            }
        });
    }

    show() {
        if (this.isOpen) return;

        this.element.style.display = "block";
        this.element.classList.add("show");
        document.body.style.overflow = "hidden"; // Блокуємо скрол

        // Додаємо backdrop
        this.createBackdrop();

        this.isOpen = true;

        // Фокус на модальне вікно
        setTimeout(() => {
            this.element.focus();
        }, 100);

        // Подія відкриття
        this.element.dispatchEvent(new CustomEvent("modal:show"));
    }

    hide() {
        if (!this.isOpen) return;

        this.element.style.display = "none";
        this.element.classList.remove("show");
        document.body.style.overflow = ""; // Відновлюємо скрол

        // Видаляємо backdrop
        this.removeBackdrop();

        this.isOpen = false;

        // Подія закриття
        this.element.dispatchEvent(new CustomEvent("modal:hide"));
    }

    createBackdrop() {
        const backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop show";
        backdrop.id = `backdrop-${this.element.id}`;
        document.body.appendChild(backdrop);

        // Закриття на клік по backdrop
        backdrop.addEventListener("click", () => this.hide());
    }

    removeBackdrop() {
        const backdrop = document.getElementById(`backdrop-${this.element.id}`);
        if (backdrop) {
            backdrop.remove();
        }
    }
}

// Функції для роботи з модальними вікнами (заміна Bootstrap функцій)
const Modal = {
    instances: new Map(),

    // Отримати або створити екземпляр модального вікна
    getOrCreateInstance(element) {
        const id = typeof element === "string" ? element : element.id;

        if (!this.instances.has(id)) {
            this.instances.set(id, new CustomModal(element));
        }

        return this.instances.get(id);
    },
};

// Функції для вашого проекту (заміна існуючого main.js коду)
function confirmComplete(button) {
    const locationAddress = button.getAttribute("data-location-address");
    const problemType = button.getAttribute("data-problem-type");
    const locationId = button.getAttribute("data-location-id");

    // Заповнюємо дані в модальному вікні
    const modal = document.getElementById("completeModal");
    const addressSpan = modal.querySelector("#modal-location-address");
    const problemSpan = modal.querySelector("#modal-problem-type");
    const confirmBtn = modal.querySelector("#confirmCompleteBtn");

    if (addressSpan) addressSpan.textContent = locationAddress || "Не вказано";
    if (problemSpan) problemSpan.textContent = problemType || "Не вказано";

    // Встановлюємо ID для кнопки підтвердження
    if (confirmBtn) {
        confirmBtn.onclick = () => completeLocation(locationId);
    }

    // Показуємо модальне вікно
    const modalInstance = Modal.getOrCreateInstance("completeModal");
    modalInstance.show();
}

function confirmDeleteSafe(button) {
    const locationAddress = button.getAttribute("data-location-address");
    const locationId = button.getAttribute("data-location-id");

    // Заповнюємо дані в модальному вікні
    const modal = document.getElementById("deleteModal");
    const addressSpan = modal.querySelector("#delete-location-address");
    const confirmBtn = modal.querySelector("#confirmDeleteBtn");

    if (addressSpan) addressSpan.textContent = locationAddress || "Не вказано";

    // Встановлюємо ID для кнопки підтвердження
    if (confirmBtn) {
        confirmBtn.onclick = () => deleteLocation(locationId);
    }

    // Показуємо модальне вікно
    const modalInstance = Modal.getOrCreateInstance("deleteModal");
    modalInstance.show();
}

// Функції для виконання дій
function completeLocation(locationId) {
    if (!locationId) {
        console.error("Location ID not provided");
        return;
    }

    // Тут ваша логіка завершення завдання
    fetch(`/complete_location/${locationId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // Додайте CSRF token якщо потрібно
        },
    })
        .then((response) => {
            if (response.ok) {
                // Перезавантажуємо сторінку або оновлюємо UI
                location.reload();
            } else {
                throw new Error("Failed to complete location");
            }
        })
        .catch((error) => {
            console.error("Error completing location:", error);
            alert("Помилка при виконанні операції");
        })
        .finally(() => {
            // Закриваємо модальне вікно
            Modal.getOrCreateInstance("completeModal").hide();
        });
}

function deleteLocation(locationId) {
    if (!locationId) {
        console.error("Location ID not provided");
        return;
    }

    // Тут ваша логіка видалення
    fetch(`/delete_location/${locationId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            // Додайте CSRF token якщо потрібно
        },
    })
        .then((response) => {
            if (response.ok) {
                // Перезавантажуємо сторінку або видаляємо рядок з таблиці
                location.reload();
            } else {
                throw new Error("Failed to delete location");
            }
        })
        .catch((error) => {
            console.error("Error deleting location:", error);
            alert("Помилка при видаленні");
        })
        .finally(() => {
            // Закриваємо модальне вікно
            Modal.getOrCreateInstance("deleteModal").hide();
        });
}

// Ініціалізація при завантаженні сторінки
document.addEventListener("DOMContentLoaded", function () {
    console.log("Custom modal system initialized");

    // Можна попередньо створити екземпляри модальних вікон
    if (document.getElementById("completeModal")) {
        Modal.getOrCreateInstance("completeModal");
    }

    if (document.getElementById("deleteModal")) {
        Modal.getOrCreateInstance("deleteModal");
    }
});
