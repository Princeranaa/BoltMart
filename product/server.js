require("dotenv").config();
const app = require("./src/app");
const db = require("./src/config/databse");
db.connectDB();

const PORT = process.env.PORT

app.listen(PORT, ()=>{
    console.log(`Product service is running on port 3001`);
    
})