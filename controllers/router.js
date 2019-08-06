const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const db = require("../models");
const router = express.Router();

//routes

router.get("/", (req, res) => {
    res.render("index");
});
// scraper
router.get("/scrape", (req, res) => {
    const scrapeArray = [];

    axios.get("https://www.theregister.co.uk/").then((response) => {

        const $ = cheerio.load(response.data);

        $("article").each((i, element) => {

            const stubLink = $(element).find("a").attr("href");

            if (stubLink.match(/^http/u)) {
                return;
            }
            let summary = null;

            if ($(element).find(".standfirst").length) {
                summary = $(element).find(".standfirst").html().trim();
            }
            const link = `https://www.theregister.co.uk${stubLink}`;

            const section = $(element).find(".section_name").text().trim();
            const $image = $(element).find("img");
            const imageURL = $image.data("src") || $image.attr("src");
            const title = $(element).find("h4").text().trim();
            const article = {
                image: imageURL,
                headline: title,
                summary: summary,
                section: section,
                link: link
            };
            const articleExists = scrapeArray.find((elem, idx) => {
                if (elem.headline === article.headline) {
                    scrapeArray[idx].image = scrapeArray[idx].image || article.image;
                    scrapeArray[idx].summary = scrapeArray[idx].summary || article.summary;
                    scrapeArray[idx].section = scrapeArray[idx].section || article.section;
                    Reflect.deleteProperty(scrapeArray[idx], "stringObj");
                    scrapeArray[idx].stringObj = JSON.stringify(scrapeArray[idx]);

                    return true;
                }

                return false;
            });

            if (!articleExists) {
                article.stringObj = JSON.stringify(article);
                scrapeArray.push(article);
            }
        });
        const hbrs = { data: scrapeArray };

        res.render("index", hbrs);
    }).catch((error) => { console.log(error) });
});


router.get("/saved", (req, res) => {
    db.Article.find((err, articles) => {
        let hbrs = {};

        if (err) {
            hbrs = { data: err };
            res.render("error", hbrs);
        }
        else {
            hbrs = { data: articles };
            res.render("saved", hbrs);
        }
    });
});
//one article
router.get("/saved/:id", (req, res) => {
    db.Article.findOne({ _id: req.params.id }).populate("comments")
        .then((article) => {
            res.send(article);
        });
});

//post route
router.post("/api/save", (req, res) => {
    const article = req.body;

    db.Article.findOne({ headline: article.headline }, (err, doc) => {
        if (err) {
            res.send(err);
        }
        else if (doc) {
            res.send("article already saved");
        }
        else {
            db.Article.create(article, (err, doc) => {
                if (err) {
                    res.send(err);
                }
                else {
                    res.send(doc);
                }
            });
        }
    });
});

router.post("/saved/:id", (req, res) => {
    console.log(req.body);
    db.Comment.create(req.body).then((doc) => {
        db.Article.findOne({ _id: req.params.id }).then((article) => {
            article.comments.push(doc);
            article.save();
            res.json(doc)
        });
    });
});

//put route
router.put("/saved/:id", (req, res) => {
    const cID = req.body.commentID
    console.log(req.body);
    db.Article.updateOne({ _id: req.params.id }, { $pull: { comments: cID } }).
        then((doc) => {
            console.log(doc)
        });
    db.Comment.deleteOne({ _id: cID }).then((qRes) => {
        console.log(qRes);
        res.send(qRes);
    })
});

// delete route
router.delete("/saved/:id", (req, res) => {
    db.Article.findOne({ _id: req.params.id }).then((article) => {
        if (article.comments.length) {
            db.Comment.deleteMany({ _id: { $in: article.comments } }).then((qRes) => {
                console.log(qRes);
            });
        }
        article.remove((err, doc) => {
            if (err) {
                res.send(err);
            }
            console.log(doc);
            res.send(doc);
        });
    });
});

module.exports = router;