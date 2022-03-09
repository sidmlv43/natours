const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControllers');
const toureRouter = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

// Start express Application
const app = express();

// Setting View Engine
app.set('view engine', 'pug');

//setting views folder
app.set('views', path.join(__dirname, 'views'));

// Serving Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Set Security Http headers
app.use(helmet());

// Global Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same IP address
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour',
});

app.use('/api', limiter);

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAvg',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Body parser, reading data from the body into req.body
app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(cookieParser());

// Data sanitize against NoSql query injection
app.use(mongoSanitize());

// Data sanitization against malicious code injection
app.use(xss());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString('en-US', {
    timeZone: 'Asia/Calcutta',
  });
  // console.log(req.cookies)
  next();
});

// Routes

app.use('/', viewRouter);
app.use('/api/v1/tours', toureRouter);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
