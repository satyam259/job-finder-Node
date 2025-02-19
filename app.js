const express= require("express")
const app= express()
const Database = require("./database")
const dotenv = require('dotenv');
const user = require("./routes/userRoutes.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const ErrorMiddleware= require("./middleware/error.js")
const cors = require("cors");
const path = require('path');
dotenv.config();
const port = 5000
Database()
app.use(cors())
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
let corsOption = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOption));
app.use("/api/v1", user);

app.use(ErrorMiddleware);
app.get('/', (req, res)=>{
  res.send("Congrats, server is running now")
})
// const router = require("./src/routes")
// app.use('/api', router)
app.listen(port,()=>{
console.log(`i am server, ${port}`)
})
