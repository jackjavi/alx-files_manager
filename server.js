const express = require("express");

const mainRoute = require("./routes/index");

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(mainRoute);
app.listen(port, "127.0.0.1");

module.exports = app;
