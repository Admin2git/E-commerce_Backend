const express = require("express");
const app = express("");
app.use(express.json());

const cors = require("cors");
const Category = require("./models/categories.model");
const { initializeDatabase } = require("./db/db.connect");
const Product = require("./models/product.model");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
initializeDatabase();

async function createCategory(newCategory) {
  try {
    const categorie = new Category(newCategory);
    const savedCategories = await categorie.save();
    return savedCategories;
  } catch (error) {
    console.error(error);
  }
}

app.post("/categories", async (req, res) => {
  try {
    const savedCategories = await createCategory(req.body);
    if (savedCategories) {
      res.status(201).json(savedCategories);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch categories" });
  }
});

async function readAllCategories() {
  try {
    const category = await Category.find();
    return category;
  } catch (error) {
    console.error(error);
  }
}

app.get("/categories", async (req, res) => {
  try {
    const category = await readAllCategories();
    if (category.length != 0) {
      res.status(201).json(category);
    } else {
      res.status(404).json({ error: "No category found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch categories." });
  }
});

async function createProduct(newProduct) {
  try {
    const product = new Product(newProduct);
    const savedProduct = await product.save();
    return savedProduct;
  } catch (error) {
    console.error(error);
  }
}

app.post("/products", async (req, res) => {
  try {
    const savedProduct = await createProduct(req.body);
    if (savedProduct) {
      res.status(201).json(savedProduct);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch product" });
  }
});

async function readAllProduct(categoryId) {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const products = await Product.find({ category: categoryId });
    return products;
  } catch (error) {
    console.error(error);
  }
}

app.get("/products/:categoryId", async (req, res) => {
  try {
    const products = await readAllProduct(req.params.categoryId);
    if (products.length != 0) {
      res.status(200).json(products); // Return products related to the category
    } else {
      res.status(404).json({ error: "No product found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch categories." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
