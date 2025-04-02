const mongoose = require('mongoose');

const userSchema  = new mongoose.Schema({
    username:{
    type:String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    minlength : [3,"user must be  3 letters"]
},
email:{
    type:String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    minlength : [10,"user must be  10 letters"]
},
password:{
    type:String,
    required: true,
    minlength : [5,"password must be 5 letters"]
    }
})

const user = mongoose.model('user',userSchema)
module.exports = user;

