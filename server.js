const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log(err)
    console.log('uncaught exception... Shutting Down')
    process.exit(1)
})

dotenv.config({ path: './config.env' })

const app = require('./app');


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
    console.log("DB connection success");
})


const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`App Running on Port http://localhost:${process.env.PORT || 3000}`);
});

process.on('unhandledRejection', err => {
    console.log(err.name)
    console.log(err.message)
    console.log('UNHANDLED REJECTION... Shutting Down')
    server.close(() => {
        process.exit(1)
    })
})