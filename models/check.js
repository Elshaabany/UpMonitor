const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportSchema = require("./schema/report")

const checkSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    protocol: {
        type: String,
        enum: ['HTTP', 'HTTPS', 'TCP'],
        required: true
    },
    path: String,
    port: Number,
    webhook: String,
    timeoutPerSec: {
        type: Number,
        default: 5
    },
    intervalPerMin: {
        type: Number,
        default: 10
    },
    threshold: {
        type: Number,
        default: 1
    },
    authentication: {
        username: String,
        password: String
    },
    httpHeaders: [{
        key: String,
        value: String
    }],
    assert: {
        statusCode: Number
    },
    tags: [String],
    ignoreSSL: Boolean,
    report: reportSchema,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Check', checkSchema);