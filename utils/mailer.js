const nodemailer = require("nodemailer");

const sendEmail = async (payload) => {
    try {
        
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port:587,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
            tls: {
                rejectUnauthorized: false, 
              },
        });

        const res = await transporter.sendMail({
            from: process.env.USER,
            to: payload.email,
            subject: payload.subject,
            text: payload.message,
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendEmail;