const Photo = require("../models/photo"),
      Comment = require("../models/comment");


// all the middleware goes here
let middlewareObj = {};


middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("warning", "Please Login First!");
    res.redirect("/login");    
}


middlewareObj.checkPhotoOwnership = function(req, res, next){
    // is logged in?
    if(req.isAuthenticated()){
        Photo.findById(req.params.id, (err, foundPhoto)=>{
            if(err){
                req.flash("danger", "Photo not found.");
                res.redirect("back");
            }
            else{
                // does user own the photo?
                if(foundPhoto.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    req.flash("danger", "You don't have the permission to do that.");
                    res.redirect("back");
                }
            }
        });
    }
    else{
        req.flash("warning", "You need to be logged in to do that.");
        res.redirect("back");
    }    
}

middlewareObj.checkCommentOwnership = function(req, res, next){
    // is logged in?
    if(req.isAuthenticated()){
        Comment.findById(req.params.commentId, (err, theComment)=>{
            if(err){
                req.flash("danger", "Comment not found.");
                res.redirect("back");
            }
            else{
                // does user own the comment?
                if(theComment.author.id.equals(req.user._id)){
                    next();
                }
                else{
                    req.flash("danger", "You don't have the permission to do that.");
                    res.redirect("back");
                }
            }
        });
    }
    else{
        req.flash("warning", "You need to be logged in to do that.");
        res.redirect("back");
    }    
}


module.exports = middlewareObj;