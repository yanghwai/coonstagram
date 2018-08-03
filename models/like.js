const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
    byWhom: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        username: String
    }
});

module.exports = mongoose.model("Like", likeSchema);