import { MongoURI } from './config.js';
import { set } from 'mongoose';

async function main() {
	set('strictQuery', true).connect(MongoURI);
	console.log('connected to MongoDB successfully');
}

export default main;
