// Головна функція налаштування пошуку
function setupTableSearch() {
    const searchInput = document.getElementById("searchInput");
    const clearButton = document.getElementById("clearSearch");
    const searchResults = document.getElementById("searchResults");
    const locationRows = document.querySelectorAll(".data-table__row");

    // Перевіряємо наявність елементів
    if (!searchInput || !clearButton || !searchResults) {
        console.warn("Search elements not found");
        return;
    }

    // Функція фільтрації рядків таблиці
    function filterTableRows(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        let visibleCount = 0;
        let totalCount = locationRows.length;

        locationRows.forEach((row) => {
            const address = row.getAttribute("data-address");
            if (!address) return;

            const addressLower = address.toLowerCase();
            const addressCell = row.querySelector(".data-table__cell--left");
            if (!addressCell) return;

            const originalText = addressCell.getAttribute("data-original") || addressCell.textContent;

            // Зберігаємо оригінальний текст при першому запуску
            if (!addressCell.getAttribute("data-original")) {
                addressCell.setAttribute("data-original", addressCell.textContent);
            }

            if (term === "" || addressLower.includes(term)) {
                row.classList.remove("hidden");
                visibleCount++;

                // Підсвічування знайденого тексту в адресі
                if (term !== "") {
                    const regex = new RegExp(`(${escapeRegExp(term)})`, "gi");
                    const highlightedText = originalText.replace(regex, '<span class="highlight">$1</span>');
                    addressCell.innerHTML = highlightedText;
                } else {
                    addressCell.innerHTML = originalText;
                }
            } else {
                row.classList.add("hidden");
            }
        });

        // Оновлення інформації про результати
        updateSearchResults(term, visibleCount, totalCount, searchTerm);
    }

    // Функція для екранування спецсимволів в регексі
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    // Оновлення інформації про результати пошуку
    function updateSearchResults(term, visibleCount, totalCount, originalTerm) {
        if (term === "") {
            searchResults.textContent = `Показано ${totalCount} локацій`;
            searchResults.className = "search-results-info";
        } else {
            if (visibleCount === 0) {
                searchResults.textContent = `Нічого не знайдено за запитом "${originalTerm}"`;
                searchResults.className = "search-results-info text-danger";
            } else {
                searchResults.textContent = `Знайдено ${visibleCount} з ${totalCount} локацій за запитом "${originalTerm}"`;
                searchResults.className = "search-results-info text-success";
            }
        }
    }

    // Подія введення тексту з оптимізацією (debouncing)
    let searchTimeout;
    searchInput.addEventListener("input", function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterTableRows(this.value);
        }, 200);
    });

    // Кнопка очищення пошуку
    clearButton.addEventListener("click", function () {
        searchInput.value = "";
        filterTableRows("");
        searchInput.focus();
    });

    // Очищення пошуку клавішею Escape
    searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            this.value = "";
            filterTableRows("");
        }
    });

    // Початкове відображення
    filterTableRows("");

    console.log(`Search initialized for ${locationRows.length} locations`);
}

// Функція для налаштування гарячих клавіш
function setupSearchHotkeys() {
    document.addEventListener("keydown", function (e) {
        // Ctrl+F для фокусу на пошук
        if (e.ctrlKey && e.key === "f") {
            const searchInput = document.getElementById("searchInput");
            if (searchInput) {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
        }

        // Ctrl+K як альтернатива (як в GitHub)
        if (e.ctrlKey && e.key === "k") {
            const searchInput = document.getElementById("searchInput");
            if (searchInput) {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
        }
    });
}

// Розширена функція пошуку (по типу проблеми теж)
function enableExtendedSearch() {
    // Можна викликати цю функцію, якщо потрібен пошук не тільки по адресі
    console.log("Extended search mode enabled");

    // Тут можна додати логіку пошуку по інших колонках
    // Наприклад, по типу проблеми, статусу, тощо
}

// Ініціалізація при завантаженні сторінки
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("searchInput")) {
        setupTableSearch();
        setupSearchHotkeys();

        // Фокус на поле пошуку при завантаженні
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            searchInput.focus();
        }
    }
});

// Експорт функцій для використання в інших місцях
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        setupTableSearch,
        setupSearchHotkeys,
        enableExtendedSearch,
    };
}
