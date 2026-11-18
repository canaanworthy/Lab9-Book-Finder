
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const bookResults = document.getElementById("book-results");
const bookshelf = document.getElementById("bookshelf");
const message = document.getElementById("message");

// Load saved books from local storage.
let savedBooks = [];

try {
    savedBooks = JSON.parse(localStorage.getItem("myBookshelf")) || [];
    if (!Array.isArray(savedBooks)) savedBooks = [];
} catch (error) {
    savedBooks = [];
}

// Search for books using the Open Library API.
searchForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const query = searchInput.value.trim();

    if (!query) {
        message.textContent = "Please enter a book title or author.";
        return;
    }

    message.textContent = "Searching for books...";
    bookResults.replaceChildren();

    try {
        const url = "https://openlibrary.org/search.json?q=" +
            encodeURIComponent(query) + "&limit=12";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to retrieve books.");
        }

        const data = await response.json();
        const books = data.docs || [];

        if (books.length === 0) {
            message.textContent = "No books found. Try another search.";
            return;
        }

        message.textContent = "";
        displayBooks(books, bookResults, false);

    } catch (error) {
        message.textContent = "Something went wrong. Please try again.";
        console.error(error);
    }
});

// Display book cards and their buttons.
function displayBooks(books, container, isSaved) {
    container.replaceChildren();

    books.forEach(function(book) {
        const card = document.createElement("article");
        card.className = "book-card";

        const title = document.createElement("h3");
        title.textContent = book.title || "Unknown Title";

        const author = document.createElement("p");
        author.textContent = "Author: " +
            (book.author_name?.join(", ") || "Unknown");

        const cover = document.createElement("img");
        cover.alt = "Cover of " + title.textContent;

        if (book.cover_i) {
            cover.src = "https://covers.openlibrary.org/b/id/" +
                book.cover_i + "-M.jpg";
        } else {
            cover.alt = "No cover available";
            cover.style.display = "none";
        }

        const detailsButton = document.createElement("button");
        detailsButton.textContent = "Show Details";

        const details = document.createElement("div");
        details.className = "book-details";
        details.hidden = true;

        const year = document.createElement("p");
        year.textContent = "First Published: " +
            (book.first_publish_year || "Unknown");

        const edition = document.createElement("p");
        edition.textContent = "Editions: " +
            (book.edition_count || "Unknown");

        details.append(year, edition);

        detailsButton.addEventListener("click", function() {
            details.hidden = !details.hidden;
            detailsButton.textContent = details.hidden
                ? "Show Details" : "Hide Details";
        });

        const saveButton = document.createElement("button");

        if (isSaved) {
            saveButton.textContent = "Remove Book";
            saveButton.addEventListener("click", function() {
                savedBooks = savedBooks.filter(
                    item => item.key !== book.key
                );
                updateBookshelf();
            });
        } else {
            saveButton.textContent = "Save Book";
            saveButton.addEventListener("click", function() {
                if (savedBooks.some(item => item.key === book.key)) {
                    message.textContent = "Book already saved!";
                    return;
                }

                savedBooks.push(book);
                updateBookshelf();
                message.textContent = "Book saved to your bookshelf!";
            });
        }

        card.append(
            cover, title, author, detailsButton,
            saveButton, details
        );

        container.appendChild(card);
    });
}

// Save books so they remain after refreshing.
function updateBookshelf() {
    localStorage.setItem("myBookshelf", JSON.stringify(savedBooks));
    displayBooks(savedBooks, bookshelf, true);
}

// Show saved books when the page loads.
displayBooks(savedBooks, bookshelf, true);
