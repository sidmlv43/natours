const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIfeatures = require('../utils/apiFeatures');


exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc || doc === null) {
        return next(new AppError('No document find with the id passed', 404))
    }

    res.status(204).json({
        status: 'succsess',
        data: null,
    });
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

exports.createOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.create(req.body);

    if (!doc) {
        return next(new AppError('unable to create document', 404));
    }
    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {

    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    })
})

exports.getAll = Model => catchAsync(async (req, res, next) => {

    // To allow nested Get reviews on tour
    let filter = {}
    if (req.params.tourId) filter = {tour: req.params.tourId}

    const features = new APIfeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();
        
    // const docs = await features.query.explain();
    const docs = await features.query;

    // response;
    res.status(200).json({
        status: 'success',
        results: docs.length,
        data: {
            data: docs
        }
    });

});