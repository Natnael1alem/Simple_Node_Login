const mongoose = require("mongoose");
const connectionDB = mongoose.connect('mongodb://localhost:27017/LoginDB');

connectionDB.then(() => {
    console.log('DB connected successfully');
})
.catch(() => {
    console.log("DB failed to connect");
})

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const collection = new mongoose.model("User", UserSchema);

module.exports = collection;