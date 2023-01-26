const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');
const fs = require('fs');
const util = require('util');
const ejs = require('ejs');


let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

exports.sendEmail = async options => {
    // Read file for email
    const file = __dirname + `/../views/emails/${options.file}.ejs`;

    // Compile
    const compiled = ejs.compile(fs.readFileSync(file, 'utf8'));

    // Create HTML
    const html = compiled({ url: options.url });

    // Config email options
    const emailOptions = {
        from: 'Meeti <noreply@meeti.com>',
        to: options.user.email,
        subject: options.subject,
        html
    };

    // Send email
    const send = util.promisify(transport.sendMail, transport);
    return send.call(transport, emailOptions);
};