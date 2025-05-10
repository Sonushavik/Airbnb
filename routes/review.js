const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const {
	validateReview,
	isLoggedin,
	isReviewAuthor,
} = require("../middleware.js");

const reviewControllers = require("../controllers/reviewControllers.js");

//Reviews

router.post(
	"/",
	isLoggedin,
	validateReview,
	wrapAsync(reviewControllers.postReview)
);

router.delete(
	"/:reviewId",
	isLoggedin,
	isReviewAuthor,
	wrapAsync(reviewControllers.deleteReview)
);

module.exports = router;
