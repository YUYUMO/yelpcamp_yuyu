var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

// INDEX route - show all campgrounds
router.get("/", function(req, res){ 
  if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Campground.find({name: regex}, function(err, allCampgrounds){
      if(err){
        console.log(err);
      } else {
        if(allCampgrounds.length < 1){
          req.flash("error", "No campground matches that query. Please try again!");
          res.redirect("back");
        } else{
        res.render("campgrounds/index", {campgrounds:allCampgrounds, page:'campgrounds'});
        }
      }
    });
  }else{
     //get all campgrounds from database
    Campground.find({}, function(err, allCampgrounds){
      if(err){
        console.log(err);
      } else {
        res.render("campgrounds/index", {campgrounds:allCampgrounds, currentUser: req.user});
      }
    });
  }
});

// CREATE route - add new dog to Database
router.post("/", middleware.isLoggedIn, function(req,res){
  // get data from form and add to campgrounds array (body for parsing)
  var name = req.body.name;
  var price = req.body.price;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  }
  var newCampground = {name: name, price: price, image: image, description: desc, author:author}
  // Create a new campground and save to DB
  Campground.create(newCampground, function(err, newlyCreated){
    if(err){
      console.log(err);
    } else {
        // redirect to campgrounds page
        // console.log(newlyCreated);
        res.redirect("/campgrounds");
    }
  });
});

//NEW route - display form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
  res.render("campgrounds/new");
});

//SHOW route - show info about one campground
router.get("/:id", function(req,res){
  //find the campground with provided id
  Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
    if(err || !foundCampground){
      req.flash("error", "Campground not found");
      res.redirect("back");
    }else {
      // console.log(foundCampground);
      //render show template with that campground
      res.render("campgrounds/show", {campground: foundCampground});
    }
  });
});

// EDIT CAMPGROUND ROUTE (form)
router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
    Campground.findById(req.params.id, function(err,foundCampground){
      if(err){
        res.redirect("/campgrounds");
      } else {
          res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});
    
  
// UPDATE CAMPGROUND ROUTE
router.put("/:id",middleware.checkCampgroundOwnership,function(req,res){
  //find and update the correct campground
  Campground.findByIdAndUpdate(req.params.id,req.body.campground, function(err, updatedCampground){
    if(err){
      res.redirect("/campgrounds");
    } else {
     // redirect somewhere (show page)
       res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership,function(req,res){
  Campground.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds");
    }
  })
});

// isLoggedIn middleware
// function isLoggedIn(req, res, next){
//   if(req.isAuthenticated()){
//       return next();
//   }
//   res.redirect("/login");
// }

// function checkCampgroundOwnership(req,res,next){
//   // is user logged in?
//   if(req.isAuthenticated()){
//     Campground.findById(req.params.id, function(err,foundCampground){
//       if(err){
//         res.redirect("back");
//       } else {
//         //does user own the campground?
//         if(foundCampground.author.id.equals(req.user._id)){
//           next();
//         } else{
//             res.redirect("back");
//         }
//       }
//     });
//   } else{
//     res.redirect("back");
//   }
// }

// for fuzzy search . Match any characters globally
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;