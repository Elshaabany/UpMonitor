const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { sendGrid_api } = require('./config');

module.exports = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: sendGrid_api
    }
}));