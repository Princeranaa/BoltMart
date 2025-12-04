const express = require("express");
const app = express();
const cookieparser = require("cookie-parser");

app.use(cookieparser());
app.use(express.json());



module.exports = app;