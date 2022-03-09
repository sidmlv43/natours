const express = require('express');
const multer = require('multer');
const userControllers = require('../controllers/userControllers');
const authControllers = require('../controllers/authControllers');



const router = express.Router();

router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);
router.get('/logout', authControllers.logout);
router.post('/forgotPassword', authControllers.forgotPassword);
router.patch('/resetPassword/:token', authControllers.resetPassword);


// protect middle ware will be applied to all the url pattern below;
router.use(authControllers.protect);

router.patch(
    '/update-password', 
    authControllers.updatePassword
    );
router.patch(
    '/update-me', 
    userControllers.uploadUserPhoto,
    userControllers.resizeUserPhoto,
    userControllers.fitlerUpdateRequest, 
    userControllers.updateMe
    );
router.delete(
    '/delete-me', 
    userControllers.setDeleteMeReqObj,
    userControllers.deleteMe
    );

router.get(
    '/me', 
    userControllers.getMe, 
    userControllers.getUser
    )

router.use(authControllers.restrictTo('admin', 'super-admin'));


router.route('/')
    .get( 
        userControllers.getAllUsers
        )
    .post(userControllers.createUser);


router.route('/:id')
        .get(userControllers.getUser)
        .patch(userControllers.updateUser)
        .delete(userControllers.deleteUser)


module.exports = router;