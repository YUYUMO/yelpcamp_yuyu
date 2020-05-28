var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");

// requiring routes
var commentRoutes = require("./routes/comments");
var campgroundRoutes = require("./routes/campgrounds");
var indexRoutes = require("./routes/index")

mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb+srv://phyllismo:Casamo1984!@cluster0-3tmir.mongodb.net/test?retryWrites=true&w=majority', { 
  useNewUrlParser: true,
  useCreateIndex: true
}).then(()=>{
  console.log("Connected to DB");
}).catch(err => {
  console.log('ERROR:', err.message);
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
//load the files in public directory
app.use(express.static(__dirname + "/public"));
// console.log(__dirname);
app.use(methodOverride("_method"));
app.use(flash());

// seedDB(); // seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret: "Once again Rusty wins cutest dog!",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  // pass currentUser to all templates
  res.locals.currentUser = req.user;
  // pass flash message to all templates
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

// Campground.create(
//   {
//     name: "Salmon Creek",
//     image: "https://farm9.staticflickr.com/8442/7962474612_bf2baf67c0.jpg",
//     description: "This is a huge creek. No bathroom. No water. Beautiful creek!"
//   },
//   function(err, campground){
//     if(err){
//       console.log(err);
//     }else {
//       console.log("NEWLY CREATED CAMPGROUND");
//       console.log(campground);
//     }
//   });

// var campgrounds = [
//   {name: "Sierra National Forest", image: "https://images.unsplash.com/photo-1537565266759-34bbc16be345?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"},
//   {name: "Flaming Gorge Reservoir", image: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"},
//   {name: "Willamette National Forest", image: "https://images.unsplash.com/photo-1567135305474-775f8e317f5a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"},
//   {name: "Arches National Park", image: "https://images.unsplash.com/photo-1496545672447-f699b503d270?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1951&q=80"},
//   {name: "Sierra National Forest", image: "https://images.unsplash.com/photo-1537565266759-34bbc16be345?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"},
//   {name: "Flaming Gorge Reservoir", image: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"},
//   {name: "Willamette National Forest", image: "https://images.unsplash.com/photo-1567135305474-775f8e317f5a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"},
//   {name: "Arches National Park", image: "https://images.unsplash.com/photo-1496545672447-f699b503d270?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1951&q=80"},
//   {name: "Sierra National Forest", image: "https://images.unsplash.com/photo-1537565266759-34bbc16be345?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"},
//   {name: "Flaming Gorge Reservoir", image: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"},
//   {name: "Willamette National Forest", image: "https://images.unsplash.com/photo-1567135305474-775f8e317f5a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"},
//   {name: "Arches National Park", image: "https://images.unsplash.com/photo-1496545672447-f699b503d270?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1951&q=80"}
// ]

app.use("/",indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Our app is running on port ${PORT}");
});