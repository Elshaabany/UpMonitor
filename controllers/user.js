import User from '../models/user.js';
import CustomError from '../helpers/CustomError.js';
import mailer from '../util/mail.js';
import { senderMail } from '../util/config.js';

const { sendMail } = mailer;

export async function postSignup(req, res) {

	const code = Math.floor(100000 + Math.random() * 900000);

	const user = await User.create({
		username: req.body.username,
		email: req.body.email,
		password: req.body.password,
		verificationCode: code
	});

	const token = await user.generateToken();

	sendMail({
		to: req.body.email,
		from: senderMail,
		subject: 'verification code',
		html:
            `
            <h1> you successfully signed up!</h1>
            <p> your verification code is: ${code} </p>
        `
	})
		.then(console.log)
		.catch(console.error);

	res.json({
		message: 'user created successfully',
		user,
		token,
		redirectPath: '/user/verify'
	});

}

export async function postVerify(req, res) {

	const code = req.body.code;
	const user = req.user;

	if (user.isVerified) {
		res.status(400).json({
			message: 'this email is verified already'
		});
	} else if (code === user.verificationCode) {
		user.isVerified = true;
		await user.save();
		res.json({
			message: 'email verified successfully'
		});
	} else {
		res.status(400).json({
			message: 'wrong verification code!'
		});
	}

}

export async function postSignin(req, res) {

	const user = await User.findOne({ email: req.body.email });
	if (!user) throw new CustomError('email or password is not correct', 401);
	const isMatch = await user.checkPassword(req.body.password);
	if (!isMatch) throw new CustomError('email or password is not correct', 401);

	const token = await user.generateToken();

	res.json({
		message: 'loged in successfully',
		user,
		token
	});

}
