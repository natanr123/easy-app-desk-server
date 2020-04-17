import mongoose from "mongoose"

const Schema = mongoose.Schema;

const schema = new Schema(
    {
        name: String,
        icon48x48: String,
        createdAt: { type: Date, default: Date.now },
    });

schema.methods.buildOptions = function() {
    let wrongAnswers = this.wrongAnswers;
    let options = wrongAnswers.slice(0);
    options.push(this.correctAnswer);
    let o = shuffle(options);
    return o;
};

const SomeModel = mongoose.model('App', schema );





export default SomeModel;