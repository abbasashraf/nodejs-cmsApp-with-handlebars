module.exports = {

    userAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect("/login");
    }

    ,
    auth: function (req, res, next) {
        if (req.isAuthenticated()) {
          
            return `<div>truesdfs sdfsdfsdfsdfsdfs</div>`
        }
        return `   `
    }

};