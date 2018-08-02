const express = require("express"),
      router = express.Router({mergeParams: true}),
      Photo = require("../models/photo"),
      Comment = require("../models/comment")
      middleware = require("../middleware"); //automatically require index.js in this folder


const isLoggedIn = middleware.isLoggedIn,
      checkCommentOwnership = middleware.checkCommentOwnership;


// 1.NEW comments
router.get("/photos/:id/comments/new", isLoggedIn, (req, res)=>{
    // find the photo 
    Photo.findById(req.params.id).populate("comments").exec((err, thePhoto)=>{
        if(err){
            console.log(err);
        } 
        else{
            res.render("comments/new", {photo: thePhoto});
        }
    });
    
});

// 2.CREATE comments
router.post("/photos/:id/comments", isLoggedIn, (req, res)=>{
    Photo.findById(req.params.id, (err, photo)=>{
        if(err){
            console.log(err);
            res.redirect("/photos");
        }
        else{
            Comment.create(req.body.comment, (err, comment)=>{
                if(err){
                    console.log(err);
                }
                else{
                    // Add username and id to comment
                    comment.author = {
                        id: req.user._id,
                        username: req.user.username
                    };
                    comment.save(); // save comment
                    
                    // Add comment to photo
                    photo.comments.push(comment); 
                    photo.save(); // savev photo
                    res.redirect("/photos/"+photo._id);
                }
            });
        }
    });
});


// 3.EDIT
router.get("/photos/:id/comments/:commentId/edit", checkCommentOwnership, (req, res)=>{
    Comment.findById(req.params.commentId, (err, theComment)=>{
        res.render("comments/edit", {comment: theComment, photoId: req.params.id});
    });
});


// 4.UPDATE
router.put("/photos/:id/comments/:commentId", checkCommentOwnership, (req, res)=>{
    Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, (err, updatedComment)=>{
        if(err){
            res.redirect("back");
        }
        else{
            res.redirect("/photos/"+ req.params.id);
        }
    });
});


// 5.DESTROY
router.delete("/photos/:id/comments/:commentId", checkCommentOwnership, (req, res)=>{
    Comment.findByIdAndRemove(req.params.commentId, (err)=>{
        if(err){
            res.redirect("back");
        }
        else{
            req.flash("success", "Comment deleted.");
            res.redirect("/photos/"+ req.params.id);
        }
    });
});



module.exports = router;