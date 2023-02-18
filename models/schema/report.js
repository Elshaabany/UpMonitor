const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportSchema = new Schema({
    status: {
        type: String,
        enum: ['UP', 'DOWN'],
        required: true
    },
    availabilityPercentage: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    outagesTotal: {          
        type: Number,
        min: 0,
        required: true
    },
    downtimeTotal: {
        type: Number,
        min: 0,         // seconds
        required: true
    },
    uptimeTotal: {
        type: Number,
        min: 0,         // seconds
        required: true
    },
    responseTimeAvg: {
        type: Number,
        min: 0,         // ms
        required: true
    },
    history: [{
        timestamp: {
            type: Date,
            required: true
        },
        responseTime: {
            type: Number,
            min: 0,
            required: true
        },
        status: {
            type: String,
            enum: ['UP', 'DOWN'],
            required: true
        }
    }]
});

module.exports = reportSchema;