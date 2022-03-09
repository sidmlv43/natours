const express = require('express');
const viewController = require('../controllers/viewsControllers');
const authController = require('../controllers/authControllers');
const bookingControllers = require('../controllers/bookingControllers');

const router = express.Router();

router.use(authController.isLoggedIn);
router.get('/me', authController.protect, viewController.me);

router.get(
  '/',
  bookingControllers.createBookingCheckout,
  viewController.getOverview
);

router.get('/my-tours', authController.protect, viewController.getMyTours);

router.get('/tours/:slug', viewController.getTour);
router.get('/login', viewController.getLoginForm);
router.get('/signup', viewController.getSignupForm);

module.exports = router;
