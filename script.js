const toggleThemeBtn = document.getElementById("toggle-theme");
toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

document.body.classList.toggle("dark", localStorage.getItem("theme") === "dark");

const urlParams = new URLSearchParams(window.location.search);
let chapter = parseInt(urlParams.get("chapter")) || 0;
let loading = false;

function loadNextChapter() {
    if (loading) return;
    loading = true;

    const chapterUrl = `G copy ${chapter}.md`;
    fetch(chapterUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Глава не найдена");
            }
            return response.text();
        })
        .then(markdown => {
            const html = marked.parse(markdown);
            const newChapter = document.createElement("div");
            newChapter.className = "chapter";
            newChapter.id = `chapter-${chapter}`;
            newChapter.innerHTML = `<h2>Глава ${chapter}</h2>${html}`;
            document.getElementById("book-content").appendChild(newChapter);

            localStorage.setItem("currentChapter", chapter);

            history.replaceState(null, "", `?chapter=${chapter}`);
            chapter++;
            loading = false;
            checkAndLoadMore();
        })
        .catch(error => {
            console.warn(error.message);
            loading = false;
        });
}

function checkAndLoadMore() {
    if (document.body.scrollHeight <= window.innerHeight) {
        loadNextChapter();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("book-content").innerHTML = "";
    loadNextChapter();
});

window.addEventListener("scroll", () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
        loadNextChapter();
    }
});

document.getElementById("reset-button").addEventListener("click", () => {
    chapter = 0;
    localStorage.removeItem("currentChapter");
    history.pushState(null, "", "?chapter=0");
    document.getElementById("book-content").innerHTML = "";
    loadNextChapter();
});

checkAndLoadMore();