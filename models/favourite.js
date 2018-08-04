const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema({
    photoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo"
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

});

module.exports = mongoose.model("Favourite", favouriteSchema);