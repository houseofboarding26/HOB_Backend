const { initiateSMTP, transporter } = require('./src/services/email/intiateSMTPConnetion');

const recipient = 'ripudamanpratap786@gmail.com';

const sendTestEmail = async () => {
    if (!recipient) {
        throw new Error('Provide a recipient address: node test-email.js recipient@example.com');
    }

    if (!process.env.EMAIL_FROM) {
        throw new Error('Set EMAIL_FROM to a sender address verified in Azure Communication Email.');
    }

    await initiateSMTP();

    const result = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: recipient,
        subject: 'Azure Communication Services SMTP test',
        text: 'This is a test email sent using Azure Communication Services SMTP.'
    });

    console.log('Test email sent.');
    console.log(`Message ID: ${result.messageId}`);
    console.log(`Accepted recipients: ${result.accepted.join(', ')}`);
};

sendTestEmail().catch((error) => {
    console.error('Test email failed:', error.message);
    process.exitCode = 1;
});
