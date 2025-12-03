const express = require("express");
const app = express();
const cookieparser = require("cookie-parser");
const orderRoutes = require("./routes/order.routes");

app.use(cookieparser());
app.use(express.json())


app.use("/api/orders", orderRoutes)

module.exports = app;