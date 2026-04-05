require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = 3004;
const fs = require('fs')


// DB CONNECTION //

const DatabaseConnection = require("./app/config/dbcon");

//DATABASE CONNECTION//
DatabaseConnection();

//EJS //
const ejs = require("ejs");
app.set("view engine", "ejs");
app.set("views", "views");


//Define JSON//
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




//Static files //

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use("/uploads", express.static("uploads"));


const authRoute = require('./app/routes/authRoutes')
app.use("/api", authRoute)

app.get("/", (req, res) => {
    res.render("login"); 
});


app.get("/signup", (req, res) => {
    res.render("signup"); 
});


app.get("/dashboard", (req, res) => {
    res.render("dashboard"); 
});


app.get("/verify", (req, res) => {
    res.render("verify"); 
});

app.listen(port, () => {
  console.log("Server is running in this port", port);
});
