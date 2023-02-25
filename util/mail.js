import { createTransport } from 'nodemailer';
import sendgridTransport from 'nodemailer-sendgrid-transport';
import { sendGrid_api } from './config.js';

export default createTransport(sendgridTransport({
	auth: {
		api_key: sendGrid_api
	}
}));