const express = require("express"),
      router = express.Router(),
      passport = require("passport"),
      User = require("../models/user"),
      Photo = require("../models/photo");


// ROOT route
router.get("/", (req, res) =>{
    res.render("landing");
});


// Show sign up form
router.get("/register", (req, res)=>{
    res.render("register");
});

// Process sign up 
router.post("/register", (req, res)=>{
    let newUser = new User(
        {
            username: req.body.username,
             email: req.body.email
         });

    // eval(require('locus'));
    User.register(newUser, req.body.password, (err, user)=>{
        if(err){
            console.log(err);
            req.flash("warning", err.message);
            res.redirect("/register");
            return;
        }
        passport.authenticate("local")(req, res, ()=>{
            req.flash("success", "Welcome to Coonstagram " + user.username+"!");
            res.redirect("/photos");
        });

    });
});


// Show login page
router.get("/login", (req, res)=>{
    res.render("login");
});


// Process login
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/photos",
        failureRedirect: "/login"
    }), (req, res)=>{

});


router.get("/logout", (req, res)=>{
    req.logout();
    req.flash("success", "You have logged out.");
    res.redirect("back");
});


// SHOW - Display user profile
router.get("/users/:userId", async (req, res)=>{
    try{
        let theUser = await User.findById(req.params.userId).exec();

        let photoList = await Photo.find().where('author.id').equals(theUser._id).exec();

        res.render("users/show", {user: theUser, photoList: photoList});

    }catch(err){
        req.flash("danger", "User not found.");
        res.redirect("back");
    }
    
});





module.exports = router;