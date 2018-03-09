const express = require("express");
const router = express.Router();
const Post = require('../../models/Post')
const { isEmpty, uploadDir } = require('../../helpers/upload-helper');
const fs = require('fs');
const Category = require("../../models/Category");
const { userAuthenticated } = require("../../helpers/authentication");



router.all('/*',userAuthenticated, (req, res, next) => {

    req.app.locals.layout = 'admin';
    next();

});


router.get('/', (req, res) => {

    Post.find({})
        .populate('category')
        .then(posts => {
            res.render("admin/posts", { posts: posts });
        }).catch(err => {
            console.log(err)
        })

});

router.get('/my-posts', (req, res) => {
    Post.find({ user: req.user.id })
        .populate('category')
        .then(posts => {
            res.render("admin/posts/my-posts", { posts: posts });
        }).catch(err => {
            console.log(err)
        })
})

router.get('/create', (req, res) => {
    Category.find({}).then(categories => {
        res.render("admin/posts/create", { categories: categories });
    })
})


router.post('/create', (req, res) => {
    let errors = [];
    if (!req.body.title) {
        errors.push({ message: 'please add a title' });
    }

    if (!req.body.body) {
        errors.push({ message: 'please add a description' });
    }

    if (errors.length > 0) {
        res.render('admin/posts/create', {
            errors: errors
        })

    } else {
        let filename = 'BMW-Z4.jpg';
        if (!isEmpty(req.files)) {
            let file = req.files.file;
            filename = Date.now() + '-' + file.name;
            file.mv('./public/uploads/' + filename, (err) => {
                if (err) throw err;
            });
        }

        let allowComments = true;

        if (req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }

        const newPost = new Post({

            user: req.user.id,
            title: req.body.title,
            status: req.body.status,
            allowComments: allowComments,
            body: req.body.body,
            category: req.body.category,
            file: filename,
            category: req.body.category

        });

        newPost.save().then(savedPost => {

            req.flash('success_message', `POST ${savedPost.title} was created successfully `);
            res.redirect('/admin/posts');


        });

    }


    // console.log(req.body.allowComments);


});


router.get('/edit/:id', (req, res) => {

    Post.findOne({ _id: req.params.id }).then(post => {

        Category.find({}).then(categories => {

            res.render("admin/posts/edit", { post: post, categories: categories });
        })

    }).catch(err => {
        console.log(err)
    })
})


router.put('/edit/:id', (req, res) => {

    Post.findOne({ _id: req.params.id })
        .then(post => {
            console.log(post, "pooooosssssttttt")
            if (req.body.allowComments) {
                allowComments = true;
            }
            else {
                allowComments = false;
            }
            post.user = req.user.id,
                post.title = req.body.title,
                post.status = req.body.status,
                post.allowComments = allowComments,
                post.body = req.body.body
            post.category = req.body.category


            const oldFile = post.file

            if (!isEmpty(req.files)) {

                let file = req.files.file;
                filename = Date.now() + '-' + file.name;
                post.file = filename;
                file.mv('./public/uploads/' + filename, (err) => {

                    if (err) throw err;

                });
                fs.unlink(uploadDir + oldFile, (err) => {
                    // console.log("while updating old picture deleted ?",err)
                })

            }

            post.save().then(updatesPost => {
                req.flash('success_message', 'Post was successfuly updates')

                res.redirect('/admin/posts/my-posts')
            })

        }).catch(err => {
            console.log(err)
        })

});

router.delete('/:id', (req, res) => {

    Post.findOne({ _id: req.params.id })
        .populate('comments')
        .then(post => {
            fs.unlink(uploadDir + post.file, (err) => {
                if (!post.comments.length < 1) {
                    post.comments.forEach(comment => {
                        comment.remove();
                    });
                }

                post.remove().then(postRemoved => {
                    req.flash('success_message', 'Post was successfuly deleted')
                    res.redirect('/admin/posts/my-posts')

                })
            })
        })
})


module.exports = router;