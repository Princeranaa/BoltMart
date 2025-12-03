require("dotenv").config();
const app = require("./src/app");
const PORT = process.env.PORT;
const db = require("./src/config/databse");
db.connectDb();



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
