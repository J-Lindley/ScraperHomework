const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
    headline: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    summary: {
        type: String
    },
    section: {
        type: String
    },
    link: {
        type: String,
        required: true
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

const Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;