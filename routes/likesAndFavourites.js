const express = require("express"),
      router = express.Router(),
      middleware = require("../middleware");


const Photo = require("../models/photo"),
      Like = require("../models/like"),
      Favourite = require("../models/favourite"),
      Profile = require("../models/profile");


const isLoggedIn = middleware.isLoggedIn,
      checkPhotoOwnership = middleware.checkPhotoOwnership;



// 1. CREATE Like route
router.post("/photos/:id/like", isLoggedIn, async function createLike(req, res){
    try{
        let [thePhoto, currentUserProfile] = await Promise.all([
            Photo.findById(req.params.id).exec(),
            Profile.findById(req.user.profile._id)
                .populate("likes").exec()
        ]);

        // Haven't liked the photo
        let newLike = await Like.create({
            userId: req.user._id,
            photoId: thePhoto._id
        });


        thePhoto.likes.push(newLike);
        thePhoto.likeCount++;
        thePhoto.save();

        currentUserProfile.likes.push(newLike);
        currentUserProfile.save();
        return res.redirect("back");

    }catch(err){
        console.log(err);
        req.flash("danger", err.message);
        return res.redirect("back");
    }
});


// 2. DELETE Like route
router.delete("/photos/:id/like", isLoggedIn, async function deleteLike(req, res){
    try{
        let [thePhoto, currentUserProfile] = await Promise.all([
            Photo.findById(req.params.id).exec(),
            Profile.findById(req.user.profile._id)
                .populate("likes").exec()
        ]);

        for(let like of currentUserProfile.likes){
            if(like.photoId.equals(req.params.id)){
                thePhoto.likes.pull(like._id);
                thePhoto.likeCount--;
                thePhoto.save();

                currentUserProfile.likes.pull(like._id);
                currentUserProfile.save();

                like.remove();
                break;
            }
        }

        return res.redirect("back");

    }catch(err){
        console.log(err);
        req.flash("danger", err.message);
        return res.redirect("back");
    }    
});


// 1. CREATE - create new favourite
router.post("/photos/:id/favourite", isLoggedIn, async function createFavour(req, res){
    try{
        let [thePhoto, currentUserProfile] = await Promise.all([
            Photo.findById(req.params.id).exec(),
            Profile.findById(req.user.profile._id)
                .populate("favourites").exec()
        ]);

        let newFavour = await Favourite.create({
            userId: req.user._id,
            photoId: req.params.id
        });

        thePhoto.favourites.push(newFavour);
        thePhoto.favourCount++;
        thePhoto.save();

        currentUserProfile.favourites.push(newFavour);
        currentUserProfile.save();
        return res.redirect("back");
    } catch(err){
        console.log(err);
        req.flash(err.message);
        return res.redirect("back");
    }
});



// 2. REMOVE - remove the favourite
router.delete("/photos/:id/favourite", isLoggedIn, async function deleteFavour(req, res){
    try{

        let [thePhoto, currentUserProfile] = await Promise.all([
            Photo.findById(req.params.id).exec(),
            Profile.findById(req.user.profile._id)
                .populate("favourites").exec()
        ]);

        for(let favourite of currentUserProfile.favourites){
            if(favourite.photoId.equals(req.params.id)){
                thePhoto.favourCount--;
                thePhoto.favourites.pull(favourite._id);
                thePhoto.save();

                currentUserProfile.favourites.pull(favourite._id);
                currentUserProfile.save();

                favourite.remove();
                break;
            }
        }

        return res.redirect("back");

    } catch(err){
        console.log(err);
        req.flash(err.message);
        return res.redirect("back");
    }    
});




module.exports = router;