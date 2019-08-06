//// DB
// Table: article
// Headline
// Summary
// URL
// extra content?
// comments (hasMany)
//
// Table: comments
// comment
// article (belongsTo)
//
// Table: users (maybe)
// username
// comments (hasMany)

module.exports = {
    Article: require("./Article"),
    Comment: require("./Comment")
};