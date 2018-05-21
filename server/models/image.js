// Image Schema
const mongoose = require('mongoose');

const ImageSchema = mongoose.Schema({
    title: String,
    author: String,
    images: { type: Schema.Types.ObjectId, ref:"fs.files"},
    dataPublished: { type: Date, default: Date.now }
})

let Image = mongoose.model('Image', ImageSchema);