const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  auth: {
    user: 'nicatmirzoev111@gmail.com',
    pass: 'e.1023456'
  }
}))

module.exports = transporter;