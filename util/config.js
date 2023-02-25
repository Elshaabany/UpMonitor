import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

export const port = process.env.PORT || 3000;
export const saltRounds = process.env.saltRounds || 12;
export const MongoURI = process.env.MongodbURI;
export const JWT_Secret = process.env.JWT_Secret;
export const sendGrid_api = process.env.sendGrid_api_key;
export const senderMail = process.env.senderMail;
export const host = process.env.host || 'localhost';