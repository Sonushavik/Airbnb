if(process.env.NODE_ENV != "production"){
        require('dotenv').config();
}

const express = require("express")
const app = express();
const mongoose = require('mongoose');
const path = require("path");
var methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require("./utils/ExpressError.js")
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")


const  listingRouter = require("./routes/listing.js")
const reviewRouter  =require("./routes/review.js")
const userRouter = require("./routes/user.js")

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))

const sessoinOptions = {
        secret: "mysecretCode",
        resave: false,
        saveUninitialized: true,
        cookie: {
                expires: Date.now() + 7*24*60*60*1000,
                maxAge: 7*24*60*60*1000,
                httpOnly: true,
        }
}



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

app.use(session(sessoinOptions))
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware to create global variable
app.use((req,res,next) => {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error")
        res.locals.currUser = req.user;
        next();
})

app.get("/demouser", async(req,res) => {
        let fakeUser  = new User({
                email: "apnacollege@gmail.com",
                username: "full-stack",
        });

        let registerUser  = await User.register(fakeUser, "helloword");
        res.send(registerUser);
})

app.use("/listings", listingRouter)
app.use("/listings/:id/reviews",reviewRouter)
app.use("/",userRouter )

app.all("*", (req,res,next) => {
        next(new ExpressError(404, "Page Not Found!"))
})

app.use((err, req, res, next) => {
        const statusCode = err.status || 500;
        const message = err.message || "Something went wrong";
        res.status(statusCode).render("error", { err });
    });
    

app.listen(parseInt(PORT), () => {
        console.log(`app is listening on the http://localhost:${PORT}`);
})