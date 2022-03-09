const express = require('express');
const authControllers = require('../controllers/authControllers');
const reviewControllers = require('../controllers/reviewControllers');
const router = express.Router({ mergeParams: true }); 
//merge-params helps to gain access to the parent routes specially if the current route is nested



router.route('/')
    .get(
        authControllers.protect, 
        reviewControllers.getAllReviews
        )
    .post(
        authControllers.protect, 
        authControllers.restrictTo('user'),
        reviewControllers.setTourUserIds, 
        reviewControllers.createReview
        );

router.route('/:id')
        .get(
            reviewControllers.getReview
        )
        .patch(
            reviewControllers.updateReview
        )
        .delete(
            authControllers.protect, 
            authControllers.restrictTo('admin'),
            reviewControllers.deleteReview
        )

module.exports = router;