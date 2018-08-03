const express = require("express"),
      router = express.Router(),
      passport = require("passport"),
      nodemailer = require("nodemailer"),
      crypto = require("crypto-promise");


const User = require("../models/user"),
      Photo = require("../models/photo");



require('dotenv').config();



const smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth:{
        user: process.env.nodemailer_user,
        pass: process.env.nodemailer_password
    }
});



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

    let perPage = 9;
    let pageQuery= parseInt(req.query.page);
    let pageNumber = pageQuery? pageQuery: 1;

    try{
        let theUser = await User.findById(req.params.userId).exec();
        let count = await Photo.countDocuments().where('author.id').equals(theUser._id)
                                                .exec();
        let photoList = await Photo.find().where('author.id').equals(theUser._id)
                                          .skip(perPage*(pageNumber-1)).limit(perPage)
                                          .exec();

        res.render("users/show", {
            user: theUser, 
            photoList: photoList,
            pages: Math.ceil(count/perPage),
            current: pageNumber
        });

    }catch(err){
        console.log(err);
        req.flash("danger", "User not found.");
        res.redirect("back");
    }
    
});


// Show forgot password page
router.get("/forgot", (req, res)=>{
    res.render('forgot');
});


// Process password reset
router.post("/forgot", async(req, res) =>{

    const randb = await crypto.randomBytes(20)
    let token = randb.toString("hex");

    // Find user by email and add token with expirary time to it
    try{
        let user = await User.findOne({email: req.body.email}).exec();
        if(!user){
            req.flash("danger", "No account with that email address exists.");
            return res.redirect('/forgot');           
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in ms
        
        await user.save();

        const subject = "Coonstagram Password Reset Email";
        const text =  "You are receiving this email because a password reset request has been made. Please click on the following link or paste it in to your browser to complete the process.\n\n" + "http://" + req.headers.host + "/reset/" + token + "\n\n" + "If you didn't request this, please ignore this email.\n";
        
        await sendEmail(user.email, subject, text);
        console.log("Reset email sent");
        req.flash('success', "An email has been setn to "+ user.email + " with further instructions.");

        res.redirect('/forgot');

    } catch(err){
        console.log(err);
        res.redirect("back");
    }
});


// Show the page for password reset
router.get("/reset/:token",  async(req, res)=>{
    try{
        let user = await User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}).exec();

        if(!user){
            req.flash("danger", "Password reset token is invalid or has expired.");
            return res.redirect('/forgot');
        }

        res.render('reset', {token: req.params.token});
    }catch(err){
        console.log(err);
        res.redirect('back');
    }
    
});


// Process the passwrod reset
router.post("/reset/:token", async(req, res)=>{

    try{
        let user = await User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}).exec();
        if(!user){
            req.flash("danger", "Password reset token is invalid or has expired.");
            return res.redirect('back');            
        }

        // Confirm password
        if(req.body.password !== req.body.confirm){
            req.flash("danger", "Passwords do not match.");
            return res.redirect("back");
        }

        await user.setPassword(req.body.password); 


        // Set token invalid
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        // Automatic login after resetting password
        req.logIn(user, err=> console.log(err));

    
        const subject = "Your password has been changed";
        const text = "Hello. This is a confirmation that your password has been changed.\n";

        await sendEmail(user.email, subject, text);
        console.log("Confirmation email sent");
        req.flash('success', "Your password has been changed.");
        res.redirect('/photos')

    } catch(err){
        console.log(err);
        res.redirect("back");
    }

});


function sendEmail(to, subject, text){
    const mailOptions = {
        to: to,
        from: process.env.nodemailer_user,
        subject: subject,
        text: text
    };

    return new Promise((resolve, reject)=>{
        smtpTransport.sendMail(mailOptions, (err)=>{
            if(err)
                reject(err);
            else
                resolve();
        });            
    });
};

module.exports = router;