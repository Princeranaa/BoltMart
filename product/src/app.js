const express = require("express");
const app = express();
const cookieparser = require("cookie-parser");
const productRoutes = require("./routes/product.routes");

app.use(cookieparser());
app.use(express.json());

app.use("/api/products", productRoutes);



module.exports = app;