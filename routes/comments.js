var express = require("express");
var router = express.Router({mergeParams:true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//comments routes
// comment new route - display a new form to create a new comment
router.get("/new",middleware.isLoggedIn, function(req,res){
  //find campground by ID
  Campground.findById(req.params.id, function(err, campground){
    if(err){
      console.log(err);
    } else{
      res.render("comments/new", {campground: campground});
    }
  })
})

// comment CREATE route - add new comment to campground
router.post("/",middleware.isLoggedIn,function(req,res){
  //lookup campground using ID
  Campground.findById(req.params.id, function(err,campground){
    if(err){
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      // console.log(req.body.comment);
      //create new comment
      Comment.create(req.body.comment, function(err, comment){
        if(err){
          req.flash("error", "Something went wrong");
          console.log(err);
        } else {
          // add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          // save comment
          comment.save();
          //connect new comment to campground
          campground.comments.push(comment);
          campground.save();
          // redirect campground show page
          req.flash("success", "Successfully added comment");
          res.redirect("/campgrounds/" + campground._id);
        }
      })
    }
  })
})

//comments EDIT route - /campgrounds/:id/comments/comment_id/edit
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req,res){
  Campground.findById(req.params.id, function(err, foundCampground){
    if(err || !foundCampground ){
      req.flash("error", "Campground not found");
      return res.redirect("back");
    }
    Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
        res.redirect("back");
      } else{
        res.render("comments/edit", {campground_id: req.params.id, comment:foundComment});
      }
    })
  })
});

//comments UPDATE route - put request /campgrounds/:id/comments/:comment_id
router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updatedComment){
    if(err){
      res.redirect("back");
    } else{
      res.redirect("/campgrounds/" + req.params.id);
    }
  })
})

//comments destroy route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
    if(err){
      res.redirect("back");
    } else{
      req.flash("success", "Comment deleted");
      res.redirect("/campgrounds/" + req.params.id);
    }
  })
})

// // isLoggedIn middleware
// function isLoggedIn(req, res, next){
//   if(req.isAuthenticated()){
//       return next();
//   }
//   res.redirect("/login");
// }

// function checkCommentOwnership(req,res,next){
//   // is user logged in?
//   if(req.isAuthenticated()){
//     Comment.findById(req.params.comment_id, function(err,foundComment){
//       if(err){
//         res.redirect("back");
//       } else {
//         //does user write the comment?
//         if(foundComment.author.id.equals(req.user._id)){
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

module.exports = router;