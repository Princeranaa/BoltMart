require("dotenv").config();
const app = require("./src/app");

const db = require("../auth/src/config/database");
db.connectDB();



app.listen(3000, () => {
    console.log("Server is running on port 3000");
});