import axios from 'axios';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51KaHVzSDqwWVy43NBxhDbTVe84LQr01cCGVTVcA1ed1F34aDc9GXmiRH8Bb4h8t4YSIMuFXY6B2L6hgP42ofQXNo004lX1x5di'
  );
  // 1> get the checkout session from the server;
  try {
    const session = await axios.get(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);
    // 2> Create checkout form + charge credit card;
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log('error', error);
  }
};
