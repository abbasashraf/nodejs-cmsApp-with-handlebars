const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const uplaod = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const { mongoDbUrl } = require('./config/database');
const passport = require("passport")

mongoose.Promise = global.Promise;


app.set("port", process.env.PORT || 3000);

mongoose.connect(mongoDbUrl, { useMongoClient: true }).then((db) => {
    console.log("MONGO CONNECTED")
}).catch((err) => {
    console.log("COULD NOT CONNECTED", err)
})

app.use(session({
    secret: "jsiloveu",
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

// passport

app.use(passport.initialize());
app.use(passport.session());

// local variable using MiddleWare

app.use((req, res, next) => {

    
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.form_errors = req.flash('form_errors');
    res.locals.error = req.flash("error")
    next();
})

app.use(express.static(path.join(__dirname, 'public')));

// set View engine
const { select, GenerateDate,paginate } = require("./helpers/handlebars-helpers");



app.engine('handlebars', exphbs({ defaultLayout: 'home', helpers: { select: select, GenerateDate: GenerateDate, paginate: paginate,} }));
app.set("view engine", "handlebars");
// uplad Middlware

app.use(uplaod());
// Body Parser 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Method Override

app.use(methodOverride('_method'))

// Laod Routes

const home = require("./routes/home/index")
const admin = require("./routes/admin/index")
const posts = require("./routes/admin/posts")
const categories = require("./routes/admin/categories")
const comments = require("./routes/admin/comments")



// use Routes

app.use("/", home);
app.use("/admin", admin);
app.use("/admin/posts", posts);
app.use("/admin/categories", categories);
app.use("/admin/comments", comments);

mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ');
});
// If the connection throws an error
mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});
// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

const port = process.env.PORT || 4444 


// app.listen(port, () => {
//     console.log("listening on port 4444")
// })
app.listen(app.get("port"), function () {
    console.log("Server run on port " + app.get("port"))
});
