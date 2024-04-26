const User = require("../models/user");

module.exports.renderSignup = (req, res, next) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;

        // register a new user
        let newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);

        // auto login after successfull signup
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect("/");
        })
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email === 1) {
            return res.status(400).redirect("/users/signin", {msg: 'Email address is already in use.'});
        } else if (error.message == " A user with the given username is already registered") {
            return res.status(400).redirect("/users/signup", {msg: "A user with the given username is already registered"});
        } else {
            return res.status(500).redirect("/users/signup", {msg: "Internal server error"});
        }
    }
};

module.exports.renderSignin = (req, res, next) => {
    try {
        if (req.user) {
            req.logout((err) => {
                if (err) {
                    return next(err);
                }
                return res.render("users/signin.ejs");
            });
        } else {
            return res.render("users/signin.ejs");
        }
    } catch (err) {
        return next(err);
    }

};

module.exports.signin = (req, res, next) => {
    res.cookie('user', JSON.stringify(req.user));
    res.redirect("/");
};

module.exports.logout = (req, res, next) => {
    try {
        if (req.user) {
            req.logout((err) => {
                if (err) {
                    return next(err);
                }
                return res.redirect("/users/signin");
            });
        } else {
            return res.redirect("/users/signin");
        }
    } catch (err) {
        return next(err);
    }
}
