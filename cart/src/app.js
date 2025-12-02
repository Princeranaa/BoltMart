const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cartRoutes = require("../src/routes/cart.routes");
app.use(express.json());
app.use(cookieParser());




app.use('/api/cart', cartRoutes);

module.exports = app;
