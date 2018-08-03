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
    likes :[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like"
    }]
});

module.exports = mongoose.model("Photo", photoSchema);