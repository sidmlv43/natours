const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModels');
const User = require('../../models/userModels');
const Review = require('../../models/reviewModels');

dotenv.config({ path: './config.env' })

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
    );

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    // console.log(connection.connections)
    console.log("DB connection success");
})

// Read JSON file

const tours=  JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users=  JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews=  JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// import data
const importData = async () => {
    try {
        await Tour.create(tours)
        await User.create(users, { validateBeforeSave: false })
        await Review.create(reviews)
        console.log('Data Successfully loaded.')
        process.exit();
    }catch(err) {
        console.log(err)
    }
}

// Delete all data from collection

const deleteData = async () => {
    try {
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('deleted all existing Data');
        process.exit();
    }catch(err) {
        console.log(err);
    };
} ;


if(process.argv[2] === '--import') {
    importData();
}
else if (process.argv[2] === '--delete') {
    deleteData();
}
console.log(process.argv);