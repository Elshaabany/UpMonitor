const { MongoURI } = require('./config');
const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(MongoURI);
    console.log('connected to MongoDB successfully');
}

module.exports = main;