const express = require("express"),
      router = express.Router(),
      passport = require("passport"),
      async = require("async"),
      nodemailer = require("nodemailer"),
      crypto = require("crypto");


const User = require("../models/user"),
      Photo = require("../models/photo");


const mailSetting = require("../setting");



const smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth:{
        user: mailSetting.user,
        pass: mailSetting.pass
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
    try{
        let theUser = await User.findById(req.params.userId).exec();

        let photoList = await Photo.find().where('author.id').equals(theUser._id).exec();

        res.render("users/show", {user: theUser, photoList: photoList});

    }catch(err){
        req.flash("danger", "User not found.");
        res.redirect("back");
    }
    
});


// Show forgot password page
router.get("/forgot", (req, res)=>{
    res.render('forgot');
});


// Process password reset
router.post("/forgot", async(req, res, next) =>{
    let generateToken = function(done){
        crypto.randomBytes(20, (err, buf)=>{
            let token = buf.toString('hex');
            done(err, token);
        });
    };

    let appendUser = function(token, done){
        
        User.findOne({email: req.body.email}, (err, user)=>{
            if(!user){
                req.flash("danger", "No account with that email address exists.");
                return res.redirect('/forgot');                
            }

            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in ms
            
            user.save(err=>{
                done(err, token, user);
            });
        });    
    };

    let sendEmail = function(token, user, done){
        const mailOptions = {
            to: user.email,
            from: mailSetting.user,
            subject: "Coonstagram Password Reset Email",
            text: "You are receiving this email because a password reset request has been made. Please click on the following link or paste it in to your browser to complete the process.\n\n" + "http://" + req.headers.host + "/reset/" + token + "\n\n" + "If you didn't request this, please ignore this email.\n"
        };

        smtpTransport.sendMail(mailOptions, (err)=>{
            console.log("mail sent");
            req.flash('success', "An email has been setn to "+ user.email + " with further instructions.");
            done(err,'done');
        });
    };

    async.waterfall([generateToken, appendUser, sendEmail], (err)=>{
        if(err)
            return next(err);
        res.redirect('/forgot');
    });
});


// Show the page for password reset
router.get("/reset/:token",  (req, res)=>{
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, (err,user)=>{
        if(!user){
            req.flash("danger", "Password reset token is invalid or has expired.");
            return res.redirect('/forgot');
        }
        res.render('reset', {token: req.params.token});
    });
});


// Process the passwrod reset
router.post("/reset/:token", (req, res)=>{

    function checkValidity(done) {
        User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, (err,user)=>{
            if(!user){
                req.flash("danger", "Password reset token is invalid or has expired.");
                return res.redirect('back');
            }
            if(req.params.password !== req.params.confirm){
                req.flash("danger", "Passwords do not match.");
                return res.redirect("back");
            }

            user.setPassword(req.body.password, (err)=>{
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(err=>{
                    req.logIn(user, err=>{
                        done(err, user);
                    });
                });
            });

        });
    }

    function sendConfirmation(user, done){
        const mailOptions = {
            to: user.email,
            from: mailSetting.user,
            subject: "Your password has been changed",
            text: "Hello. This is a confirmation that your password has been changed.\n"
        };

        smtpTransport.sendMail(mailOptions, (err)=>{
            console.log("mail sent");
            req.flash('success', "Your password has been changed.");
            done(err);
        });
    }

    async.waterfall([checkValidity, sendConfirmation], err=> res.redirect('/photos'));
});




module.exports = router;