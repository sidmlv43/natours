const bookingControllers = require('../controllers/bookingControllers');
const authControllers = require('../controllers/authControllers');
const router = require('express').Router();

router.use(authControllers.protect);
router.get('/checkout-session/:tourId', bookingControllers.getCheckoutSession);

router.use(authControllers.restrictTo('lead-guide', 'admin'));
router
  .route('/')
  .get(bookingControllers.getAllBookings)
  .post(bookingControllers.createBooking);

router
  .route('/:id')
  .get(bookingControllers.getBooking)
  .patch(bookingControllers.updateBooking)
  .delete(bookingControllers.deleteBooking);
module.exports = router;
