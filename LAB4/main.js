let search_form = document.querySelector(".search_form");
let items = document.querySelector(".items");
let footer = document.querySelector(".footer");

let books = null;
let filtered_books = null;
let counter = 0;

document.addEventListener("DOMContentLoaded", () => {
  fetch("product.json")
    .then((response) => response.json())
    .then((data) => {
      books = data;
      filtered_books = data;
      LoadBook();
    })
    .catch((e) => {
      console.log(e);
    });
});

window.onscroll = () => {
  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - footer.getBoundingClientRect().height
  ) {
    if (books) LoadBook();
  }
};

search_form.addEventListener("submit", (e) => {
  e.preventDefault();
  items.innerHTML = "";

  let formData = new FormData(search_form);
  let category = formData.get("category");
  let name = formData.get("book_name");
  let sort_type = formData.get("sort_type");

  filtered_books = books
    .filter((book) => {
      if (category === "ALL") return true;
      return book.type === category;
    })
    .filter((book) => {
      if (!name) return true;
      return book.name.toLowerCase().includes(name.toLowerCase());
    })
    .sort((book1, book2) => {
      if (sort_type === "none") return 0;
      else if (sort_type === "descending") return book1.price - book2.price;
      else if (sort_type === "increasing") return book2.price - book1.price;
      else {
        if (book1.name < book2.name) return -1;
        if (book1.name > book2.name) return 1;
        return 0;
      }
    });

  counter = 0;
  LoadBook();
});

function LoadBook() {
  if (counter == filtered_books.length) return;

  let end = Math.min(counter + 4, filtered_books.length);
  for (; counter < end; counter++)
    items.appendChild(createBook(filtered_books[counter]));
}

function createBook(book) {
  let title = document.createElement("span");
  title.setAttribute("class", "img-text");
  title.innerText = book.name;

  let price = document.createElement("span");
  price.setAttribute("class", "img-price");
  price.innerText = `$${book.price}`;

  let image = document.createElement("img");
  image.setAttribute("src", `img/${book.image}`);

  let item = document.createElement("div");
  item.setAttribute("class", "item");
  item.append(title);
  item.append(price);
  item.append(image);

  return item;
}
