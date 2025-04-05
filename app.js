const express = require("express")
const app = express();
const mongoose = require('mongoose');
const path = require("path");
require('dotenv').config();
var methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const Listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync.js")
const {listingSchema} = require("./schema.js")

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))


dbConnect()
.then(() => {
        console.log("database connected!", );
})
.catch((error) => console.log(error));

async function dbConnect(){
        await mongoose.connect(MONGO_URL);
}

app.get("/", (req,res) => {
        res.send("server working");
})

const validateListing = (req,res, next) => {
        let { error } = listingSchema.validate(req.body);
        if(error){
                let errMsg = error.details.map((el) => el.message).join(",");
                throw new ExpressError(400, result.error);
        }else{
                next();
        }
}

app.get("/listings", wrapAsync(async(req,res,next) => {
                const allListing = await Listing.find();
                res.render("listings/index", {allListing});
}))

app.get("/listings/new",wrapAsync( (req,res,next) => {
                res.render("listings/new.ejs")
}))


app.get("/listings/:id", wrapAsync(async(req,res,next)=> {
                let{ id }= req.params;
                const listing =await Listing.findById(id);
                console.log(listing)
                res.render("listings/show.ejs", {listing})
}))


app.post("/listings", wrapAsync(async(req,res,next) => {
        let result = listingSchema.validate(req.body)
        console.log(result)
        let newlisting =new Listing(req.body.listing);
        await newlisting.save();
        res.redirect("/listings");
}))

app.get("/listings/:id/edit", wrapAsync(async(req,res,next) => {
                let { id } = req.params;
                let listing =await Listing.findById(id)
                console.log(listing);
                res.render("listings/edit", {listing})
}))

app.put("/listings/:id",validateListing, wrapAsync(async(req,res,next) => {         
                let { id } = req.params;
                await Listing.findByIdAndUpdate(id, { ...req.body.listing});
                res.redirect("/listings");
}))

app.delete("/listings/:id",validateListing, wrapAsync( async(req,res,next) => {        
                let { id } = req.params;
                await Listing.findByIdAndDelete(id);
                res.redirect("/listings");
}))

app.all("*", (req,res,next) => {
        next(new ExpressError(404, "Page Not Found!"))
})

app.use((err, req, res, next) => {
        let {statusCode=500, message="something went wrong"} = err;
        res.render("error.ejs", {err});
})

app.listen(PORT, () => {
        console.log(`app is listening on the http://localhost:${PORT}`);
})