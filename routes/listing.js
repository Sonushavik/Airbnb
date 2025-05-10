const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedin, isOwner, validateListing } = require("../middleware.js");
const listingControllers = require("../controllers/listingsController.js");
const multer  = require('multer')
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage })

router.get("/", wrapAsync(listingControllers.index));

router.get("/new", isLoggedin, wrapAsync(listingControllers.newFrom));

router.get("/:id", wrapAsync(listingControllers.showListing));

router.post(
	"/",
	isLoggedin,
	// validateListing,
	upload.single("listing[image]"),
	wrapAsync(listingControllers.postNewListing)
);

router.get(
	"/:id/edit",
	isLoggedin,
	isOwner,
	wrapAsync(listingControllers.editForm)
);

router.put(
	"/:id",
	// validateListing,
	isLoggedin,
	upload.single("listing[image]"),
	isOwner,
	wrapAsync(listingControllers.updateListing)
);

router.delete(
	"/:id",
	isLoggedin,
	isOwner,
	wrapAsync(listingControllers.deleteListing)
);

module.exports = router;
