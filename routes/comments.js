const express = require("express"),
      router = express.Router({mergeParams: true}),
      Photo = require("../models/photo"),
      Comment = require("../models/comment")
      middleware = require("../middleware"); //automatically require index.js in this folder


const isLoggedIn = middleware.isLoggedIn,
      checkCommentOwnership = middleware.checkCommentOwnership;


// 1.NEW comments
router.get("/photos/:id/comments/new", isLoggedIn, async(req, res)=>{
    // find the photo 
    try{
        let thePhoto = await Photo.findById(req.params.id).populate("comments").exec();
        res.render("comments/new", {photo: thePhoto});
    } catch(err){
        console.log(err);
    }
});

// 2.CREATE comments
router.post("/photos/:id/comments", isLoggedIn, async(req, res)=>{
    
    try{
        let photo = await Photo.findById(req.params.id).exec();
        let comment = await Comment.create(req.body.comment);
        comment.author = {
            id: req.user._id,
            username: req.user.username
        };

        await comment.save(); // save comment
        
        // Add comment to photo
        photo.comments.push(comment); 
        await photo.save(); // savev photo
        res.redirect("/photos/"+photo._id);       

    } catch(err){
        console.log(err);
        res.redirect("/photos");       
    }
    
});


// 3.EDIT
router.get("/photos/:id/comments/:commentId/edit", checkCommentOwnership, async(req, res)=>{
    let theComment = await Comment.findById(req.params.commentId).exec();
    res.render("comments/edit", {comment: theComment, photoId: req.params.id});
});


// 4.UPDATE
router.put("/photos/:id/comments/:commentId", checkCommentOwnership, async(req, res)=>{
    try{
        let updatedComment = await Comment.findByIdAndUpdate(req.params.commentId, req.body.comment).exec();
        res.redirect("/photos/"+ req.params.id);
    } catch(err){
        console.log(err);
        res.redirect("back");
    }
});


// 5.DESTROY
router.delete("/photos/:id/comments/:commentId", checkCommentOwnership, async(req, res)=>{
    try{
        let thePhoto = await Photo.findById(req.params.id).exec();
        let theComment = await Comment.findById(req.params.commentId).exec();

        thePhoto.comments.pull(theComment._id);
        thePhoto.save();

        theComment.remove();
        req.flash("success", "Comment deleted.");
        res.redirect("/photos/"+ req.params.id);    

    } catch(err){
        console.log(err);
        res.redirect("back");
    }

});



module.exports = router;