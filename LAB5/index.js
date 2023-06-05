const express = require("express");
const app = express();
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs").promises;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const filePath = "comments.json";
let comments = [];

fs.readFile(filePath, "utf8")
  .then((data) => {
    comments = JSON.parse(data);
  })
  .catch((err) => {
    console.error(err);
  });

const db = new sqlite3.Database("product.db", (err) => {
  if (err) {
    console.error(err.message);
  }
});

app.get("/", function (req, res) {
  const sql = "SELECT * FROM products";

  db.all(sql, [], (err, products) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "An error occurred while searching." });
    } else {
      res.render("index", {
        products: products,
      });
    }
  });
});

app.post("/", function (req, res) {
  const { category = "ALL", book_name = "", sort_type = "" } = req.body;

  let sql = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (category !== "ALL") {
    sql += " AND category = ?";
    params.push(category);
  }

  if (book_name) {
    sql += " AND title LIKE ?";
    params.push(`%${book_name}%`);
  }

  if (sort_type === "descending") {
    sql += " ORDER BY price DESC";
  } else if (sort_type === "increasing") {
    sql += " ORDER BY price ASC";
  } else if (sort_type === "alphabetically") {
    sql += " ORDER BY title ASC";
  }

  db.all(sql, params, (err, products) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "An error occurred while searching." });
    } else {
      res.render("index", {
        products: products,
      });
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/product", (req, res) => {
  res.render("product");
});

app.get("/product/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM products WHERE product_id = ?";

  db.all(sql, [id], (err, products) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "An error occurred while searching." });
    } else {
      res.render("product", {
        product: products[0],
        comments: comments.filter((comment) => comment.id === id),
      });
    }
  });
});

app.post("/product/:id", (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (text && text !== "") {
    const obj = { id, text };
    comments.push(obj);
    fs.writeFile(filePath, JSON.stringify(comments), "utf8").catch((err) => {
      console.error(err);
    });
  }

  const sql = "SELECT * FROM products WHERE product_id = ?";

  db.all(sql, [id], (err, products) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "An error occurred while searching." });
    } else {
      res.render("product", {
        product: products[0],
        comments: comments.filter((comment) => comment.id === id),
      });
    }
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
