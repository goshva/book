const BOOK_URL = "https://goshva.github.io/book/document.xml";
const container = document.getElementById('book');
const progressIndicator = document.querySelector('.progress-indicator');
const backToTopButton = document.querySelector('.back-to-top');

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Индикатор прогресса
function updateProgressIndicator() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.scrollY;

    const progress = scrolled / documentHeight;
    progressIndicator.style.transform = `scaleX(${progress})`;
}

// Кнопка "Наверх"
function toggleBackToTopButton() {
    if (window.scrollY > window.innerHeight * 0.4) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
}

// Обработчики событий
window.addEventListener('scroll', () => {
    updateProgressIndicator();
    toggleBackToTopButton();
});

// Загрузка контента
fetch(BOOK_URL)
    .then(r => {
        if (!r.ok) throw new Error("Связь с архивом прервана");
        return r.text();
    })
    .then(xmlText => {
        container.innerHTML = "";
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "application/xml");

        const paragraphs = xml.querySelectorAll("w\\:p, p");
        let previousElement = null;

        paragraphs.forEach((p, index) => {
            const texts = p.querySelectorAll("w\\:t, t");
            let content = "";
            texts.forEach(t => content += (t.textContent || ""));
            content = content.trim();
            if (!content) return;

            let el;

            // Заголовки
            if (/^[A-ZА-ЯЁ0-9\s«».,!?—–-]+$/.test(content) && content.length < 140 && content === content.toUpperCase()) {
                if (content === "***" || content === "888" || content.includes("✶")) {
                    el = document.createElement("h6");
                } else {
                    el = document.createElement("h1");

                }
                el.textContent = content;
                container.appendChild(el);
                previousElement = el;
                return;
            }

            // Цитаты
            if (content.startsWith("«") && content.endsWith("»")) {
                el = document.createElement("div");
                el.className = "blockquote";
                el.textContent = content;
                container.appendChild(el);
                previousElement = el;
                return;
            }

            // Разделители
            if (content === "***" || content === "888" || content.includes("✶")) {
                el = document.createElement("div");
                el.className = "divider";
                el.textContent = "···";
                container.appendChild(el);
                previousElement = el;
                return;
            }

            // Стихи
            if (content.split("\n").length > 2) {
                el = document.createElement("div");
                el.className = "poem-block";
                el.textContent = content;
                container.appendChild(el);
                previousElement = el;
                return;
            }

            // Проверяем, является ли текущий абзац автором предыдущей цитаты
            // Имя автора обычно короткое (до 40 символов) и содержит тире, точки или инициалы
            if (previousElement && previousElement.className === "blockquote" &&
                content.length < 40 &&
                (/[А-ЯЁ]\.[А-ЯЁ]\./.test(content) || /[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+/.test(content) || content.includes("-"))) {

                // Создаём элемент для автора цитаты
                const authorEl = document.createElement("div");
                authorEl.className = "quote-author";
                authorEl.textContent = content;
                authorEl.style.textAlign = "right";
                authorEl.style.fontStyle = "italic";
                authorEl.style.marginTop = "-1.5rem";
                authorEl.style.marginBottom = "2.5rem";
                authorEl.style.color = "var(--muted)";
                authorEl.style.fontSize = "0.95rem";
                authorEl.style.paddingRight = "2rem";

                container.appendChild(authorEl);
                previousElement = authorEl;
                return;
            }

            // Обычные абзацы
            el = document.createElement("p");
            el.textContent = content;
            container.appendChild(el);
            previousElement = el;
        });

        // Инициализация после загрузки
        updateProgressIndicator();
        toggleBackToTopButton();
    })
    .catch(err => {
        container.innerHTML = `<p class="muted">Архив повреждён: ${err.message}</p>`;
    });