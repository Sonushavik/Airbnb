const mongoose = require('mongoose');
require('dotenv').config();
const initData = require("./data.js")
const Listing= require("../models/listing.js");

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

dbConnect()
.then(() => {
        console.log("database connected!", );
})
.catch((error) => console.log(error));

async function dbConnect(){
        await mongoose.connect(MONGO_URL);
}

const    initDB = async() => {
        await  Listing.deleteMany({}),
        await Listing.insertMany(initData.data);
        console.log("data was initialised");
}

initDB();