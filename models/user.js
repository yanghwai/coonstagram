const mongoose = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");

const Profile = require("./profile");

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: {
        type: String,
        default: "/images/default_avatar.png"
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {
        type: Boolean,
        default: false
    },
    profile:{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Profile"
    }
});

UserSchema.plugin(passportLocalMongoose);


UserSchema.pre('save', async function () {
    if (!this.profile){
        this.profile = await Profile.create({});
        console.log("Added profile to the user");
    }
});

module.exports = mongoose.model("User", UserSchema);