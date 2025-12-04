require("dotenv").config();
const app  = require("./src/app");



app.listen(3006, ()=>{
    console.log(`ai buddy service start on the 3006 port`)
})