const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    likes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like"
    }],

    favourites:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Favourite"
    }]
});


module.exports = mongoose.model("Profile", profileSchema);