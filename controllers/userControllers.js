const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModels');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');



// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) =>{
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         // user-user.id-currentTimeStamp.jpeg
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// })

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    }else{
        cb(new AppError('Invalid file type, Please upload image file', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
        .resize(500, 500, {
            // kernel: sharp.kernel,
            fit: 'contain',
            // position: 'right top',
            background: { r: 255, g: 255, b: 255, alpha: 0.5}
        })
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

        next();
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    })
    return newObj;
}

exports.fitlerUpdateRequest = (req, res, next) => {
    console.log(req.body);
    console.log(req.file);
    
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not meant for updating password', 400))
    }

    const filteredBody = filterObj(req.body, 'name', 'email');
    if(req.file) filteredBody.photo = req.file.filename;
    req.body =  filteredBody;
    req.params.id = req.user._id;

    next();
}

exports.setDeleteMeReqObj = (req, res, next) => {
    req.body.active = false;
    req.params.id = req.user.id;
    next();
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.createUser = factory.createOne(User);
exports.updateUser = factory.updateOne(User);
exports.updateMe = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getUser = factory.getOne(User);
exports.deleteMe = factory.updateOne(User) //Since user is not deleted 