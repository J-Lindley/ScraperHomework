//modules
const mongoose = require("mongoose");
const express = require("express");
const exphbs = require("express-handlebars");
const routes = require("./controllers/router");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
const PORT = process.env.PORT || 3000;


const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(routes);
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});