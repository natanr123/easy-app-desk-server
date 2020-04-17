import mongoose from "mongoose"

const Schema = mongoose.Schema;

const schema = new Schema(
    {
        name: String,
        url: String,
        createdAt: { type: Date, default: Date.now },
    });

const SomeModel = mongoose.model('Upload', schema );





export default SomeModel;