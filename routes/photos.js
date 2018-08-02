const express = require("express"),
      router = express.Router(),
      Photo = require("../models/photo"),
      middleware = require("../middleware"); //automatically require index.js in this folder


const isLoggedIn = middleware.isLoggedIn,
      checkPhotoOwnership = middleware.checkPhotoOwnership;


// 1.INDEX - show all photos
router.get("/", async(req, res) =>{
    let perPage = 8;
    let pageQuery = parseInt(req.query.page);
    let pageNumber = pageQuery? pageQuery:1;

    try{
        let count = await Photo.countDocuments().exec();
        let allPhotos = await Photo.find({}).skip(perPage*(pageNumber-1)).limit(perPage).exec();

        res.render("photos/index",{
            photos: allPhotos,
            current: pageNumber,
            pages: Math.ceil(count/perPage)
        });

    } catch(err){
        console.log(err);
    }
});


// 2.NEW - Show form to create new photos
router.get("/new", isLoggedIn,(req, res)=>{
    res.render("photos/new");
});


// 3.CREATE - add photo to DB
router.post("/", isLoggedIn, (req, res) =>{
    let newphoto = req.body.photo;
    newphoto.author = {
        id: req.user._id,
        username: req.user.username
    };

    Photo.create(newphoto, (err, newData) =>{
        if(err){
            console.log(err);
        } else{
            console.log("New photo created!");
            console.log(newData);
            req.flash("success", "Successfully uploaded!");
            res.redirect("/photos");
        }
    });
});


// 4.SHOW - Shows info about one photo
router.get("/:id", (req, res) => {
    // find the photo with the provided id
    Photo.findById(req.params.id).populate("comments").exec((err, foundPhoto)=>{
        res.render("photos/show", {photo: foundPhoto});
    });

});


// 5.EDIT
router.get("/:id/edit", checkPhotoOwnership, (req, res)=>{
    Photo.findById(req.params.id, (err, foundPhoto)=>{
        res.render("photos/edit", {photo: foundPhoto});
    });
});


// 6.UPDATE
router.put("/:id", checkPhotoOwnership, (req, res)=>{
    // Find and update the photo
    Photo.findByIdAndUpdate(req.params.id, req.body.photo, (err, updatedPhoto)=>{
        if(err){
            res.send(err.message);
        }
        else{
            res.redirect("/photos/"+ req.params.id); // Redirect back to the show page
        }
    });
});


//7.DESTROY
router.delete("/:id", checkPhotoOwnership, (req, res)=>{
    Photo.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            res.send(err.message);
        }
        else{
            res.redirect("/photos");
        }
    });
});



module.exports = router;