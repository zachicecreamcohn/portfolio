export async function POST(request: Request) {

    const { name, email, message } = await request.json();

    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    });



    async function sendMail() {
        await transporter.sendMail({
            from: "PORTFOLIO CONTACT FORM <zachcohnportfolio@gmail.com>",
            to: "zcohn@wustl.edu, zwc1223@gmail.com",
            subject: "Portfolio Contact Form Submission",
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        });
        }

        try {

            await sendMail();
return Response.json({
    status: 200,
    body: {
        message: "Email sent successfully",
    }
})
        } catch (e) {
            return Response.json({
                status: 500,
                body: {
                    message: "Error sending email",
                }
            })
        }


}