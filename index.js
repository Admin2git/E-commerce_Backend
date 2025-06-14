const express = require("express");
const app = express("");
app.use(express.json());

const cors = require("cors");
const Category = require("./models/categories.model");
const { initializeDatabase } = require("./db/db.connect");
const Product = require("./models/product.model");
const Address = require("./models/address");
const User = require("./models/User.model");
const Order = require("./models/Order.model");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
initializeDatabase();

app.get("/", (req, res) => {
  res.json({ message: "this is e-commerce api" });
});

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

app.get("/products/category/:categoryId", async (req, res) => {
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

async function getProductById(productId) {
  try {
    const product = await Product.findById(productId);
    return product;
  } catch (error) {
    console.error(error);
  }
}

app.get("/products/:productId", async (req, res) => {
  try {
    const product = await getProductById(req.params.productId);
    if (product) {
      res.status(200).json(product); // Return products related to the category
    } else {
      res.status(404).json({ error: "No product found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch products." });
  }
});

//add user

app.post("/user", async (req, res) => {
  const user = new User(req.body);
  const savedUser = await user.save();
  if (savedUser) {
    res.status(201).json(savedUser);
  }
});

// Dummy user middleware (simulate logged-in user)
app.use((req, res, next) => {
  req.user = { id: "6849315540bff452c746b05e" }; // hardcoded user ID for testing
  next();
});

// add new address

async function addNewAddress(newAddress, userId) {
  try {
    const address = new Address({ ...newAddress, userId });
    const savedAddress = await address.save();
    return savedAddress;
  } catch (error) {
    console.error(error);
  }
}

app.post("/user/addresses", async (req, res) => {
  try {
    const userId = req.user.id;
    const savedAddress = await addNewAddress(req.body, userId);
    if (savedAddress) {
      res.status(201).json(savedAddress);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch address." });
  }
});

//update address by id

async function updateAddressById(updateById, dataToUpdate) {
  try {
    const updatedAddress = await Address.findByIdAndUpdate(
      updateById,
      dataToUpdate,
      { new: true }
    );
    return updatedAddress;
  } catch (error) {
    console.error(error);
  }
}

app.post("/user/addresses/:id", async (req, res) => {
  try {
    const updatedAddress = await updateAddressById(req.params.id, req.body);
    if (updatedAddress) {
      res.status(201).json(updatedAddress);
    } else {
      res.status(404).json({ message: "address not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch address." });
  }
});

//get address by user id

app.get("/user/addresses", async (req, res) => {
  const userId = req.user.id;
  const addresses = await Address.find({ userId: userId });
  res.json(addresses);
});

//delete address by id

app.delete("/user/addresses/:id", async (req, res) => {
  const deletedAddress = await Address.findByIdAndDelete(req.params.id);
  res.json({ message: "Address deleted", deletedAddress });
});

// new order place

app.post("/orders/place", async (req, res) => {
  const userId = req.user.id;
  const { addressId, items, totalPrice } = req.body;

  if (!addressId || !items || items.length === 0) {
    return res.status(400).json({ error: "Invalid order data" });
  }

  const newOrder = new Order({ userId, addressId, items, totalPrice });
  await newOrder.save();
  res.status(201).json({ message: "Order placed", orderId: newOrder._id });
});

async function getOrderPlace(userId) {
  try {
    const orders = await Order.find({ userId: userId })
      .populate("addressId")
      .populate("items.productId");
    return orders;
  } catch (error) {
    console.error(error);
  }
}

app.get("/order/place", async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await getOrderPlace(userId);
    if (orders.length != 0) {
      res.status(201).json(orders);
    } else {
      res.status(404).json({ message: "order not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fatch order place." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
