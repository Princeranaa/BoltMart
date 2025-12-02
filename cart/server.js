require("dotenv").config();
const app = require("./src/app");
const db = require("./src/config/database")
const PORT = process.env.PORT;

db.connectDB()


app.listen(PORT, () => {
  console.log(`cart service running on the ${PORT} number`);
});
