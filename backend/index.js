const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 3000;
const path = require('path')

// routes
const router = require("./route/index");
const { connectionDB } = require("./config/dataConnection.js");
const { upload } = require("./middleware/multerHandler.js");

connectionDB()
  .then(() => {
    console.log("Databse created");
  })
  .catch((err) => {
    console.log("Error while db connection");
  });

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// main route
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server listen on PORT ${PORT}`);
});
