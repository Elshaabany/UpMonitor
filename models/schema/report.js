import { Schema }  from 'mongoose';
import _ from 'lodash';

const requiredNum = {          
	type: Number,
	min: 0,
	required: true
};

const statusString = {
	type: String,
	enum: ['UP', 'DOWN'],
	required: true
};

const reportSchema = new Schema({
	status: statusString,
	availabilityPercentage: requiredNum,
	outagesTotalNum: requiredNum,
	downtimeTotalSec: requiredNum,
	uptimeTotalSec: requiredNum,
	responseTimeAvgMs: requiredNum,
	history: [{
		timestamp: {
			type: Date,
			required: true
		},
		responseTime: requiredNum,
		status: statusString
	}]
},{
	toJSON: {
		transform: (doc, ret) => _.omit(ret, ['_id'])
	}
});

export default reportSchema;