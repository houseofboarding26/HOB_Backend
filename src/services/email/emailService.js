const { renderTemplate } = require("../../templates/templateService");
const { transporter } = require("./intiateSMTPConnetion");


const sendEmail = async ({
    to,
    subject,
    template,
    data
}) => {
    const html = renderTemplate(template, data);

    return transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
    });
};

const sendLoginNotificationEmail = async (user) => {
    return sendEmail({
        to: user.email,
        subject: "You signed in to your House of Boarding account",
        template: "account-login",
        data: {
            name: user.name,
            app_url: process.env.APP_URL || 'https://www.houseofboarding.com'
        }
    });
};



module.exports = {
    sendLoginNotificationEmail
};