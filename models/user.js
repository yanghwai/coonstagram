const mongoose = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: {type: String, default: "/images/default_avatar.png"},
    email: {type: String, unique: true, required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {type: Boolean, default: false},
    profile:{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Profile"
    }

});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);