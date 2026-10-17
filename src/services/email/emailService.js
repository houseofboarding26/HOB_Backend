const { renderTemplate } = require("../../templates/templateService");
const { transporter } = require("./intiateSMTPConnetion");


const sendEmail = async ({
    to,
    subject,
    template,
    data
}) => {
    try {
        const html = renderTemplate(template, data);

        const response = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html
        }, (err, info) => {
            if (info) console.log(info);
            if (err) console.error(err)
        });
        return response
    } catch (error) {
        return error
    }


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