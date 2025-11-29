const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")


const db = require("../src/config/database");
db.connectDB();

app.use(cookieParser());
app.use(express.json());


module.exports = app;