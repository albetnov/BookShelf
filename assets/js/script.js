const checkForStorage = () => {
  if (typeof Storage === "undefined") {
    alert("Storage tidak tersedia. Data tidak dapat disimpan.");
    return false;
  }
  return true;
};

let books = [];
const STORAGE_KEY = "Bookshelf_KEY";
const RENDER_PAGE = "Bookshelf_RENDER_PAGE";

document.addEventListener(RENDER_PAGE, () => {
  console.log("Rendering Page...");
  renderPage();
});

const findBook = (id) => {
  for (const book of books) {
    if (book.id === id) {
      return book;
    }
  }
  return null;
};

const findBookIndex = (id) => {
  for (let index in books) {
    if (books[index].id === id) {
      return index;
    }
  }
  return -1;
};

const changeToUnread = (id) => {
  const book = findBook(id);
  if (book === null) return;

  book.isCompleted = false;
  saveBook();
  document.dispatchEvent(new Event(RENDER_PAGE));
};

const changeToRead = (id) => {
  const book = findBook(id);
  if (book === null) return;

  book.isCompleted = true;
  saveBook();
  document.dispatchEvent(new Event(RENDER_PAGE));
};

const deleteBook = (id) => {
  const book = findBookIndex(id);
  if (book === -1) return;

  books.splice(book, 1);
  saveBook();
  document.dispatchEvent(new Event(RENDER_PAGE));
};

const performEditBook = () => {
  const id = document.querySelector("#id-hidden").value;
  const title = document.querySelector("#judul").value;
  const author = document.querySelector("#penulis").value;
  const year = document.querySelector("#tahun").value;
  const isCompleted = document.querySelector("#selesaiDiBaca").checked;

  const book = findBook(parseInt(id));
  if (book == null) return;

  book.title = title;
  book.author = author;
  book.year = year;
  book.isCompleted = isCompleted;

  clearInput();
  saveBook();

  const form = document.querySelector("#insert-book");
  const button = form.children[8];
  restoreForm(button, form);
  document.dispatchEvent(new Event(RENDER_PAGE));
};

const editBookAction = (e) => {
  e.preventDefault();
  performEditBook();
};

const addBookAction = (e) => {
  e.preventDefault();
  addBook();
};

const restoreForm = (buttonRef, formRef) => {
  formRef.removeEventListener("submit", editBookAction);
  formRef.addEventListener("submit", addBookAction);
  buttonRef.innerHTML = `<i class="fa-solid fa-box-archive"></i> Masukkan Buku`;
  clearInput();
  const findCancel = document.querySelector("#cancel-btn");
  if (findCancel !== null) {
    formRef.removeChild(findCancel);
  }

  const findHiddenId = document.querySelector("#id-hidden");
  if (findHiddenId !== null) {
    formRef.removeChild(findHiddenId);
  }
};

const editBook = (id) => {
  const book = findBook(id);
  if (book === null) return;

  const form = document.querySelector("#insert-book");
  const button = form.children[8];
  restoreForm(button, form);
  button.innerHTML = `<i class="fa-solid fa-pen"></i> Edit Buku`;

  document.querySelector("#judul").value = book.title;
  document.querySelector("#penulis").value = book.author;
  document.querySelector("#tahun").value = book.year;
  document.querySelector("#selesaiDiBaca").checked = book.isCompleted;

  const cancelButton = document.createElement("button");
  cancelButton.classList.add("cancel-btn");
  cancelButton.innerHTML = `<i class="fa-solid fa-times"></i> Batal`;
  cancelButton.type = "button";
  cancelButton.id = "cancel-btn";
  cancelButton.addEventListener("click", () => {
    restoreForm(button, form);
  });

  const idHidden = document.createElement("input");
  idHidden.type = "hidden";
  idHidden.value = book.id;
  idHidden.id = "id-hidden";

  const findCancel =
    document.querySelector("#cancel-btn") == null ? true : false;
  if (findCancel) {
    form.append(cancelButton);
  }

  form.removeEventListener("submit", addBookAction);
  form.addEventListener("submit", editBookAction);

  const findHiddenId =
    document.querySelector("#id-hidden") == null ? true : false;
  if (findHiddenId) {
    form.append(idHidden);
  } else {
    findHiddenId.value = id;
  }
};

const createCard = (id, title, writer, year, isFinished = false) => {
  const button = document.createElement("button");
  button.classList.add("check-btn");
  button.innerHTML =
    `<i class="fa-solid fa-check"></i> ` +
    (isFinished ? "Belum Selesai Dibaca" : "Selesai Dibaca");
  button.addEventListener("click", () => {
    if (isFinished) {
      changeToUnread(id);
    } else {
      changeToRead(id);
    }
  });

  const trashButton = document.createElement("button");
  trashButton.classList.add("trash-btn");
  trashButton.innerHTML = `<i class="fa-solid fa-trash"></i> Hapus Buku`;
  trashButton.addEventListener("click", () => {
    deleteBook(id);
  });

  const editButton = document.createElement("button");
  editButton.classList.add("edit-btn");
  editButton.innerHTML = `<i class="fa-solid fa-pen"></i> Edit Buku`;
  editButton.addEventListener("click", () => {
    editBook(id);
  });

  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <h1 class="card-title">${title}</h1>
        <p class="card-text">Penulis: ${writer}</p>
        <p class="card-text">Tahun: ${year}</p>
        `;
  card.append(button, editButton, trashButton);
  return card;
};

const renderBook = (book) => {
  const card = createCard(
    book.id,
    book.title,
    book.author,
    book.year,
    book.isCompleted
  );
  if (book.isCompleted) {
    const unreadBooks = document.querySelector("#readed-books");
    unreadBooks.appendChild(card);
  } else {
    const readedBooks = document.querySelector("#unread-books");
    readedBooks.appendChild(card);
  }
};

const cleanView = () => {
  const unreadBooks = document.querySelector("#unread-books");
  const readedBooks = document.querySelector("#readed-books");
  unreadBooks.innerHTML = `<h2 class="card-header">
  <i class="fa-solid fa-list"></i> Belum selesai dibaca
</h2>`;
  readedBooks.innerHTML = `<h2 class="card-header">
  <i class="fa-solid fa-list-check"></i> Selesai dibaca
</h2>`;
};

const saveBook = () => {
  if (checkForStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }
};

const loadDataFromStorage = () => {
  if (!checkForStorage() && !books) {
    renderPage();
  }

  if (localStorage.getItem(STORAGE_KEY) === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }

  const localBooks = localStorage.getItem(STORAGE_KEY)
    ? JSON.parse(localStorage.getItem(STORAGE_KEY))
    : [];

  if (localBooks) {
    for (const book of localBooks) {
      books.push(book);
    }
  }
};

const renderPage = () => {
  cleanView();
  for (const book of books) {
    renderBook(book);
  }
};

const Validator = {
  type: {
    string: "String",
    number: "Number",
  },
  validate(text, type = this.type.string) {
    if (type == this.type.number) {
      if (isNaN(parseInt(text))) {
        return false;
      }
      return true;
    }
    if (!text || text === "") {
      return false;
    }
    return true;
  },
};

const showErrorAlert = (msg) => {
  const errorContainer = document.querySelector("#validation-alert");
  errorContainer.classList.remove("hidden");

  errorContainer.innerHTML = msg;

  setTimeout(() => {
    removeErrorAlert();
  }, 2000);
};

const removeErrorAlert = (msg) => {
  const errorContainer = document.querySelector("#validation-alert");
  errorContainer.classList.add("hidden");
};

const clearInput = () => {
  document.querySelector("#judul").value = "";
  document.querySelector("#penulis").value = "";
  document.querySelector("#tahun").value = "";
  document.querySelector("#selesaiDiBaca").checked = false;
};

const addBook = () => {
  const title = document.querySelector("#judul").value;
  const author = document.querySelector("#penulis").value;
  const year = document.querySelector("#tahun").value;
  const isCompleted = document.querySelector("#selesaiDiBaca").checked;

  if (!Validator.validate(title)) {
    showErrorAlert("Judul tidak boleh kosong");
    return;
  }
  if (!Validator.validate(author)) {
    showErrorAlert("Penulis tidak boleh kosong");
    return;
  }
  if (!Validator.validate(year, Validator.type.number)) {
    showErrorAlert("Tahun tidak boleh kosong");
    return;
  }

  books.push({
    id: +new Date(),
    title,
    author,
    year,
    isCompleted,
  });
  clearInput();
  saveBook();
  document.dispatchEvent(new Event(RENDER_PAGE));
};

const searchBooks = () => {
  const search = document.querySelector("#search");

  const previousState = books;

  if (search.value !== "") {
    const filteredBooks = books.filter((book) => {
      return (
        book.title.toLowerCase().search(`${search.value.toLowerCase()}`) !== -1
      );
    });
    books = filteredBooks;
  }

  document.dispatchEvent(new Event(RENDER_PAGE));
  books = previousState;
};

const liveValidator = () => {
  const title = document.querySelector("#judul");
  const writer = document.querySelector("#penulis");
  const tahun = document.querySelector("#tahun");

  title.addEventListener("input", () => {
    if (!Validator.validate(title.value)) {
      showErrorAlert("Judul tidak boleh kosong");
    }
  });
  writer.addEventListener("input", () => {
    if (!Validator.validate(writer.value)) {
      showErrorAlert("Penulis tidak boleh kosong");
    }
  });
  tahun.addEventListener("input", () => {
    if (!Validator.validate(tahun.value, Validator.type.number)) {
      showErrorAlert("Tahun tidak boleh kosong");
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  loadDataFromStorage();
  document.dispatchEvent(new Event(RENDER_PAGE));
  liveValidator();

  const insertBook = document.querySelector("#insert-book");
  insertBook.addEventListener("submit", addBookAction);

  const searchForm = document.querySelector("#search-form");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    searchBooks();
  });
});
