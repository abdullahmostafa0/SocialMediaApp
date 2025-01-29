import nodemailer from "nodemailer"



// async..await is not allowed in global scope, must use a wrapper
export const sendEmail = async ({ to = "", cc = "", bcc = "", subject = "Confirm-Email", text = "", html = "", attachments = "" } = {}) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
        },
    });
    // send mail with defined transport object
    const info = transporter.sendMail({
        from: `"Social Media App" <${process.env.EMAIL}>`, // sender address
        to, // list of receivers
        cc,
        bcc,
        subject, // Subject line
        text, // plain text body
        html,
        attachments // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

