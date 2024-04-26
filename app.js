require('dotenv').config();

const express = require('express')
const app = express()
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require('body-parser');
const session = require("express-session");
const MongoStore = require('connect-mongo');
const cookieParser = require("cookie-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// middlewares
const { isLoggedIn } = require('./utils/middlewares');

// models
const User = require('./models/user');

// routers
const userRouter = require("./routes/user");

// db connection
async function main() {
    await mongoose.connect(process.env.DB_URL);
}

main()
    .then(() => {
        console.log("connected to database");
    })
    .catch((err) => {
        console.log(err);
    });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "/public")));

// mongo store set up
const store = MongoStore.create({
    mongoUrl: process.env.DB_URL,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 7 * 24 * 60 * 60 * 1000
});

store.on("error", (err) => {
    console.log("error in mongo session store", err)
});

const sessionOPtions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOPtions));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // middleware that will be executed before every route
    next();
});

app.get("/", isLoggedIn, (req, res, next) => {
    res.render("home.ejs", {user: req.user});
});

app.use("/users", userRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`listening to post ${port}`);
});