const express = require("express");
const router = express.Router();
const faker = require('faker')
const Post = require('../../models/Post')
const { userAuthenticated } = require("../../helpers/authentication");
const Category = require('../../models/Category')
const Comment = require('../../models/Comments')

router.all('/*', userAuthenticated,(req, res, next) => {

    req.app.locals.layout = 'admin';
    next();

});



router.get('/', (req, res) => {

    const promise = [
        Post.count().exec(),
        Category.count().exec(),
        Comment.count().exec()
    ];

    Promise.all(promise).then(([postCount, categoryCount, commentCount]) => {
        
        res.render("admin/index", { postCount, categoryCount, commentCount })

    })

    // Post.count().then(postCount => {
    //     res.render("admin/index", { postCount: postCount })
    // })

})

router.post('/generate-fake-posts', (req, res) => {
    // res.send("it works")
    for (let i = 0; i < req.body.amount; i++) {
        let post = new Post();
        post.title = faker.name.title()
        post.status = i % 2 === 0 ? "public" : "private";
        post.allowComments = faker.random.boolean();
        post.body = faker.lorem.sentence();
        post.slug = faker.name.title()

        post.save()
            .then(savedPost => {
            })
    }
    res.redirect('/admin/posts')

})



module.exports = router;