const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // role: req.body.role,
    // passwordChangedAt: req.body.passwordChangedAt, 
  });
  
  const url=  `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })
  res.status(200).json({
    status: "success"
  })
}

exports.protect = catchAsync(async (req, res, next) => {
  // 1> Getting the token and if it exits
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to get access.', 401)
    );
  }

  // 2> Verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3> Check if user still exists
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(new AppError('User belong to the token no longer exist', 401));
  }

  // 4> Check if the user changed password the JWT was issued?
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password, Please login again', 401)
    );
  }

  // Grant excess to Protected route
  req.user = freshUser;
  next();
});

// Only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
    // 1> Getting the token and if it exits
 
    // 2> Verification
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

    // 3> Check if user still exists
    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
      return next();
    }

    // 4> Check if the user changed password the JWT was issued?
    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }
    // res.locals will provide template access to user
    res.locals.user = freshUser; 
    return next();
  }catch(err) {
    return next()
  }
}
next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array of strings
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not authorized to perform this action.', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1> Get User based on Posted email

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('There is no user with the email address provided')
    );
  }
  // 2> Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3> Send it to the user email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Please rest your password using the URL below\n ${resetURL}\n Please ignore if you remember your password`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your Password Reset token (Valid for 10 min)',
    //   message,
    // });
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'Success',
      message: 'Token send to email',
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined),
      await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending an email. Try again later')
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1> Get User based on the token;
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // console.log(hashedToken);
  // const user = await User.findOne({passwordResetToken: hashedToken, passwordResetToken: {$gt: Date.now()}});
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //   console.log(hashedToken === user.passwordResetToken);

  // 2> if the token has not expired and there is a user, set the new password;

  if (!user) {
    return next(new AppError('Token invalid or expired', 400));
  }
  // 3> Update changed Password At property for the current user

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //  1> get the user from the collection
  const user = req.user;

  // 2> check if the posted current password is correct
  const { currentPassword, newPassword, passwordConfirm } = req.body;

  if (!user.correctPassword(currentPassword, user.password)) {
    return next(new AppError('You have entered old password incorrectly'));
  }

  // if so, update the password

  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  // log the user in
  createSendToken(user, 201, res);
});
