import { Schema, model } from 'mongoose';
import _ from 'lodash';

import reportSchema from './schema/report.js';

const checkSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		url: {
			type: String,
			required: true,
		},
		protocol: {
			type: String,
			enum: ['http', 'https', 'tcp'],
			required: true,
		},
		path: String,
		port: Number,
		webhook: String,
		timeoutPerSec: {
			type: Number,
			default: 5,
		},
		intervalPerMin: {
			type: Number,
			default: 10,
		},
		threshold: {
			type: Number,
			default: 1,
		},
		authentication: {
			username: String,
			password: String,
		},
		httpHeaders: {},
		assert: {
			statusCode: Number,
		},
		tags: [String],
		ignoreSSL: Boolean,
		report: reportSchema,
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		toJSON: {
			transform: (doc, ret) => _.omit(ret, ['__v', 'report']),
		},
	}
);

export default model('Check', checkSchema);
