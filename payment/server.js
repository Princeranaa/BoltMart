require("dotenv").config();
const app = require("./src/app");

const db = require("./src/config/databse");
db.connectDb();
const PORT = process.env.PORT || 3005;




app.listen(PORT, ()=>{
    console.log("payment server is running on port 3004");
})