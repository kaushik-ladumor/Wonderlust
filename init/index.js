const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main()
    .then((result => {
        console.log("connection Sucessfully");
    }))
    .catch((err) => {
        console.log(err)

    });
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/traveller"); 
}

const initDB = async() => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: '675a6d2ee1fd726f1fbd4404',
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialixzed");
}

initDB();