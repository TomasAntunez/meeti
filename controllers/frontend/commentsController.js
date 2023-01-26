const Comments = require('../../models/Comments');
const Meeti = require('../../models/Meeti');


exports.addComment = async (req, res, next) => {

    // Get comment
    const { comment } = req.body;

    // Create comment in the db
    await Comments.create({
        message: comment,
        userId: req.user.id,
        meetiId: req.params.id
    });

    // Redirect to the same page
    res.redirect('back');
    next();
};


// Delete a comment from the database
exports.deleteComment = async (req, res, next) => {
    
    // Take commentId
    const { commentId } = req.body;

    // Query comment
    const comment = await Comments.findOne({
        where: {id: commentId},
        include: [
            {
                model: Meeti,
                attributes: ['userId']
            }
        ]
    });

    // Check if comment exists
    if(!comment) {
        res.status(404).send('Invalid action');
        return next();
    }

    // Verify that whoever deletes it is the creator of it
    if( comment.userId !== req.user.id && comment.meeti.userId !== req.user.id ) {
        res.status(403).send('Invalid action');
        return next();
    }

    await Comments.destroy({ where: {
        id: comment.id
    }});
    res.status(200).send('Successfully deleted');
    return next();
};