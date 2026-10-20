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

const sendHostApprovedEmail = async (user) => {
    return sendEmail({
        to: user.email,
        subject: "Host Approved",
        template: "host-approved",
        data: {
            name: user.name
        }
    });
};



module.exports = {
    sendHostApprovedEmail
};