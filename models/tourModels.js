const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
// const Review = require('./reviewModels');

const tourSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must not exceed 40 characters.'],
        minlength: [10, 'A tour should be atleast 10 characters long.'],
        // validate: [validator.isAlpha, 'Should not contain a number or special character.']

    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration.']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have difficulty level'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: "Difficulty is either easy, medium or difficult."
        }
    },
    ratingsAvg: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Max rating cannot exceed 5'],
        set: val=> Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                // Will not work with update
                return val < this.price;
            },
            message: "Discount price ({VALUE}) should not exceed the actual price of the tour."
        }
    },
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    imageCover: {
        type: String,
        required: true,
    },

    images: [String],

    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date], 
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // GeoJSON;
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        }
      ],
    
    
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


tourSchema.index({ price: 1, ratingsAvg: -1 }) 
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })

tourSchema.virtual('durationWeeks')
    .get(function() {
        return this.duration / 7;
    })

// Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

// DOCUMENT MIDDLEWARE -> RUNS BEFORE .save() command and .create command

tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true})
    next();
})

// tourSchema.pre('save', async function(next) {
//     const guidespromises = this.guides.map(async (id) => await User.findById(id));
//     this.guides = await Promise.all(guidespromises)
//     next();
// })

// Query Hooks(middleware)

// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: {$ne: true} })
    this.start = Date.now();
    next();
})

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v'
    })
    next();
})

tourSchema.post(/^find/, function(docs, next){ 
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    // console.log(docs)
    next();
})


// Aggregation Middleware (Hook)

// tourSchema.pre('aggregate', function(next) {
//     // console.log(this.pipeline())
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
//     next();
// })


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;