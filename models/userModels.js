const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A user must have a name."],
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email address.']   
    },
    role: {
       type: String,
       enum: ['user', 'guide', 'lead-guide', 'admin'],
       default: 'user' 
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        minlength: 8,
        validate: {
            // will only work on create or save
            validator: function(el) {
                return this.password === el;
            },
            message: 'Password does not match'
        }
    }, 
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with the cost of 12
    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined;
    next();
})

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
})


userSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne : false } }).select('-passwordChangedAt -passwordResetToken -passwordResetExpires');
    return next();
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000, 10)
        // console.log(changedTimeStamp, JWTTimestamp)
        return JWTTimestamp < changedTimeStamp;
    }
    return false; // False means not changed
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
    this.passwordResetExpires = Date.now() + (600000+ (19800 * 1000));
    return resetToken;
}

const User = mongoose.model('User',userSchema);

module.exports = User;