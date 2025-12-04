const express = require("express");
const app = express();
const cookieparser = require("cookie-parser");
const paymentRoutes = require("./routes/payment.routes")

app.use(cookieparser());
app.use(express.json())

app.use("/api/payment", paymentRoutes)

module.exports = app;
