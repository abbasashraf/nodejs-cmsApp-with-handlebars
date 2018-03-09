const express = require("express");
const router = express.Router();
const Post = require('../../models/Post');
const Comments = require('../../models/Comments');
const { userAuthenticated } = require("../../helpers/authentication");


router.all('/*',  (req, res, next) => {

    req.app.locals.layout = 'admin';
    next();

});

router.get('/', (req, res) => {

    Comments.find({ user: req.user.id })
        .populate('user')
        .then(comments => {

            res.render('admin/comments', { comments: comments })
        })
})

router.post('/', (req, res) => {

    Post.findOne({ _id: req.body.id }).then(post => {
        const newComment = new Comments({
            user: req.user.id,
            body: req.body.body
        });

        post.comments.push(newComment);
        post.save().then(savedPost => {
            newComment.save().then(savedComment => {
                // console.log(post)
                req.flash('success_message', 'Your comment will reviewed in a second')
                res.redirect(`/post/${post.slug}`)
            })
        })
    })
    //    res.send("It works")
})

router.delete('/:id', (req, res) => {
    Comments.remove({ _id: req.params.id })
        .then(deleteItem => {
            Post.findOneAndUpdate({ comments: req.params.id }, { $pull: { comments: req.params.id } }, (err, data) => {
                if (err) console.log(err);
                res.redirect('/admin/comments')
            })
        })
})

router.post('/approve-comment', (req, res) => {

    Comments.findByIdAndUpdate(req.body.id, {
        $set: {
            approveComment: req.body.approveComment
        }
    },
        (err, result) => {
            if (err) return err;
            res.send(result)
        })


    console.log(req.body.approveComment)
})


module.exports = router;