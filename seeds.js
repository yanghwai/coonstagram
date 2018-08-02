const mongoose = require("mongoose"),
      passport = require("passport"),
      Photo = require("./models/photo"),
      Comment   = require("./models/comment"),
      User = require("./models/user");


let data = [
    {
        name: "Cloud's Rest", 
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        author: {
            id: "5b600819ed2d5540c7bcac89",
            username: "gd"
        },
        description: "consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Desert Mesa", 
        image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
        author: {
            id: "5b60078d9ea39a40839fc445",
            username: "huai"
        },
        description: "Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Canyon Floor", 
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        author: {
            id: "5b60078d9ea39a40839fc445",
            username: "huai"
        },
        description: "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    }
]


let comment = {
    text: "This place is great, but I wish there was internet",
    author: {
        id: "5b5e9a2e382a56122a7a1009",
        username: "gd"
    }
};


function createUser(username, password, isAdmin){
    let newUser = new User({username: username, isAdmin: isAdmin});
    return new Promise((resolve, reject) => {
        User.register(newUser, password, (err, user)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(user);
            }
        });
    });
}

async function seedDB(){
    await Photo.remove({}).exec();
    console.log("Photos removed");
    
    await Comment.remove({}).exec();
    console.log("Comments removed");

    await User.remove({}).exec();
    console.log("Users removed");

    let user = null;

    try{
        user = await createUser("root", "root", true);
        console.log("Root user created");
    } catch(err){
        console.log(err);
        return;
    }

    comment.author.id = user._id;
    comment.author.username = user.username;

    data.forEach(async seed=>{
        seed.author.id = user._id;
        seed.author.username = user.username;

        let thePhoto = await Photo.create(seed);

        console.log("Photos created");

        let theComment = await Comment.create(comment);
        console.log("Comments created");

        thePhoto.comments.push(theComment);

        thePhoto = await thePhoto.save();
        console.log("Added comments to photos");
    });

}
 
module.exports = seedDB;