require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    saltRounds: process.env.saltRounds || 12,
    MongoURI: process.env.MongodbURI,
    JWT_Secret: process.env.JWT_Secret,
    sendGrid_api: process.env.sendGrid_api_key,
    senderMail: process.env.senderMail,
    host: process.env.host || 'localhost',
};