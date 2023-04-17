import { sendGrid_api } from './config.js';
import { createTransport } from 'nodemailer';
import nodemailerSendgrid from 'nodemailer-sendgrid';

export const transport = createTransport(
	nodemailerSendgrid({
		apiKey: sendGrid_api
	})
);