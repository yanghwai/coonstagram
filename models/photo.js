const mongoose = require("mongoose");

// Schema setup
const photoSchema = new mongoose.Schema({
    name: String,
    image: String,
    cloudId: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],

    likeCount:{
        type: Number,
        default: 0
    },

    favourCount:{
        type: Number,
        default: 0
    },

    likes :[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like"
    }],
    favourites :[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Favourite"
    }]
});

module.exports = mongoose.model("Photo", photoSchema);