const express = require('express');
const router = express.Router();
const tourControllers = require(`${__dirname}/../controllers/tourControllers`);
const authControllers = require('../controllers/authControllers');

const reviewRouter = require('../routes/reviewRoutes');
router.use('/:tourId/reviews', reviewRouter);

router.route(
    '/top-5-cheap'
    )
    .get(
        tourControllers.aliasTopTours, 
        tourControllers.getAllTours
        )

router.route(
    '/tour-stats'
    ).get(
        authControllers.protect, 
        tourControllers.getTourStats
        )
router.route('/monthly-plan/:year')
    .get(
        authControllers.protect, 
        authControllers.restrictTo('admin', 'lead-guide', 'guide'),
        tourControllers.getMonthlyPlan
        )

router.route(
    '/tours-within/:distance/center/:latlng/unit/:unit'
    )
    .get(tourControllers.getToursWithin)

router.route(
    '/distances/:latlng/unit/:unit'
    )
    .get(tourControllers.getDistances)


router.route('/')
    .get(tourControllers.getAllTours)
    .post(
        authControllers.protect,
        authControllers.restrictTo('admin', 'lead-guide'),
        tourControllers.uploadTourImages,
        tourControllers.createTour
        );

router.route('/:id')
    .get(tourControllers.getTourById)
    .patch(
        authControllers.protect, 
        authControllers.restrictTo('admin', 'lead-guide'),
        tourControllers.uploadTourImages,
        tourControllers.resizeTourImages,
        tourControllers.updateTour
        )
    .delete(
            authControllers.protect, 
            authControllers.restrictTo('admin', 'lead-guide'),
            tourControllers.deleteTour
            );



module.exports = router;
