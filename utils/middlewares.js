module.exports.isLoggedIn = (req, res, next) => {
    if (req.user) {
        return next();
    }
    return res.redirect("/users/signin");
};
