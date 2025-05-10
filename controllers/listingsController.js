const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = 
        async(req,res,next) => {
                const allListing = await Listing.find();
                res.render("listings/index", {allListing});
        };

module.exports.newFrom = (req,res,next) => {
        console.log(req.user);
        res.render("listings/new.ejs")
};

module.exports.showListing = async(req,res,next)=> {
        let{ id }= req.params;
        const listing =await Listing.findById(id)
        .populate({
                path:"reviews",
                populate: {
                        path:"author",
                },
        })
        .populate("owner");
        if(!listing){
                req.flash("error", "Listing you requested for does not exist!");
                res.redirect("/listings")
        }
        console.log(listing)
        res.render("listings/show.ejs", {listing})
};

module.exports.postNewListing = async(req,res,next) => {

let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
        })
        .send();
console.log(response.body.features[0].geometry);
res.send("done!");

let url = req.file.path;
let filename = req.file.filename;
let newlisting =new Listing(req.body.listing);
newlisting.owner = req.user._id;
newlisting.image = {url, filename};
await newlisting.save();
req.flash("success", "new Listings Created!");
res.redirect("/listings");
};

module.exports.editForm = async(req,res,next) => {
        let { id } = req.params;
        let listing =await Listing.findById(id)
        if(!listing){
                req.flash("error", "Listing you requested for does not exist!");
                res.redirect("/listings")
        }

        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/upload","/upload/h_250,w_400");
        res.render("listings/edit", {listing,originalImageUrl })
}

module.exports.updateListing = async(req,res,next) => {         
        let { id } = req.params;
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing});
        if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        // let newlisting =new Listing(req.body.listing);
        listing.image = { url, filename };
        await listing.save();
        }

        req.flash("success", "Listing updated!")
        res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async(req,res,next) => {        
        let { id } = req.params;
        await Listing.findByIdAndDelete(id)
        req.flash("success", "Listing deleted!")
        res.redirect("/listings");
}