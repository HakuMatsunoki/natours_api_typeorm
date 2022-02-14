const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("./tourModel.js");
const Review = require("./reviewModel.js");
const User = require("./userModel.js");

dotenv.config({ path: "./config.env" });

const DB = process.env.DB || "";

mongoose.connect(DB).then((con) => {
  console.log("Connection OK", con);
});

// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
);

// import data into db
const importData = async function () {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log("Data loaded!");
  } catch (err) {
    console.log(err);
  }
  // exit cmd
  process.exit();
};

// delete all data from db collection
const deleteData = async function () {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log("Data deleted!");
  } catch (err) {
    console.log(err);
  }
  // exit cmd
  process.exit();
};

console.log(process.argv);
if (process.argv[2] === "--import") importData();
else if (process.argv[2] === "--delete") deleteData();
