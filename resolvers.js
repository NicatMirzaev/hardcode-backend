const jsonwebtoken = require('jsonwebtoken')
const Op = require('Sequelize').Op;
const settings = require('./lib/settings.js');
const emailValidator = require('email-validator');
const transporter = require('./lib/mail.js');
const handlebars = require('handlebars');
const fs = require('fs');

module.exports = db => {
  return {
    user: ({ id }) => {
      return {id: id}
    },
    me: async (args, req) => {
      if(!req.user) throw new Error("Giriş yapmalısınız.");
      return await db.models.Users.findByPk(req.user.id);
    },
    registerUser: async ({ username, email, password }) => {
      try {
        if(username.length < 3 || username.length > 40) throw new Error("Kullanıcı adı en az 3, en fazla 40 karakterden oluşabilir.");
        if(password.length < 6 || password.length > 255) throw new Error("Şifre en az 6, en fazla 255 karakterden oluşabilir.");

        const checkEmail = emailValidator.validate(email);
        if(!checkEmail) throw new Error("Geçersiz e-mail adresi girdiniz.");

        const isAvailable = await db.models.Users.findOne({where: {[Op.or]: [{username: username}, {email: email}]}})
        if(isAvailable){
          if(isAvailable.username === username) throw new Error("Bu kullanıcı adı kullanılmaktadır.")
          else throw new Error("Bu e-mail adresi kullanılmaktadır.");
        }
        const user = await db.models.Users.create({
          username: username,
          email: email,
          password: password
        })
        const token = jsonwebtoken.sign(
          { id: user.id },
          settings.authSecret,
          { expiresIn: '1y' }
        )
        const confirmationToken = jsonwebtoken.sign(
          { id: user.id },
          settings.signupConfirmSecret,
          { expiresIn: '1d' }
        )
        fs.readFile('./templates/signup-confirmation-template.html', {encoding: 'utf-8'}, function (err, html){
          if(err){
            console.log(err);
          }
          else{
            const template = handlebars.compile(html);
            const replacements = {
              link: 'http://localhost:3000/confirm/' + confirmationToken
            }
            const htmlToSend = template(replacements);
            const mailOptions = {
              from: 'HardCode Community',
              to: email,
              subject: 'HardCode - Hesap Onaylama',
              html: htmlToSend,
            }
            transporter.sendMail(mailOptions);
          }
        })

        return {
          token, user: {id: user.id, username: user.username, email: user.email}
        }
      }
      catch (error){
        throw new Error(error.message)
      }
    },
    loginUser: async ({ email, password }) => {
      try {
        if(email.length < 3 || password.length < 3) throw new Error("Lütfen mail ve şifrenizi eksiksiz doldurun.");
        const user = await db.models.Users.findOne({where: {email: email, password: password}});
        if(!user) throw new Error("Geçersiz email adresi veya şifre.");
        if(user.isConfirmed == false) {
          const confirmationToken = jsonwebtoken.sign(
            { id: user.id },
            settings.signupConfirmSecret,
            { expiresIn: '1d' }
          )
          fs.readFile('./templates/signup-confirmation-template.html', {encoding: 'utf-8'}, function (err, html) {
            if(err) {
              console.log(err);
            }
            else {
              const template = handlebars.compile(html);
              const replacements = {
                link: 'http://localhost:3000/confirm/' + confirmationToken
              }
              const htmlToSend = template(replacements);
              const mailOptions = {
                from: 'HardCode Community',
                to: email,
                subject: 'HardCode - Hesap Onaylama',
                html: htmlToSend,
              }
              transporter.sendMail(mailOptions);
            }
          })
        }
        const token = jsonwebtoken.sign(
          { id: user.id },
          settings.authSecret,
          { expiresIn: '1d'}
        )
        return {
          token, user
        }
      }
      catch (error) {
        throw new Error(error.message)
      }
    },
    confirmUser: async ({ token }) => {
      try {
        if(!token) throw new Error("Geçersiz token.");
        const verifiedToken = jsonwebtoken.verify(token, settings.signupConfirmSecret);
        const user = await db.models.Users.findByPk(verifiedToken.id);
        if(!user) throw new Error("Kullanıcı bulunamadı.");
        user.isConfirmed = true;
        await user.save();
        return user
      }
      catch (error) {
        throw new Error(error.message);
      }
    },
    sendResetPasswordConfirmation: async ({ email }) => {
      try {
        const user = await db.models.Users.findOne({where: {email: email}});
        if(!user) throw new Error("Geçersiz email adresi girdiniz.");
        const token = jsonwebtoken.sign(
          { id: user.id },
          settings.resetPasswordConfirmSecret,
          { expiresIn: 1800000 }
        )
        fs.readFile('./templates/reset-password-confirmation-template.html', {encoding: 'utf-8'}, function (err, html) {
          if(err) {
            console.log(err);
          }
          else {
            const template = handlebars.compile(html);
            const replacements = {
              link: 'http://localhost:3000/reset-password/' + token
            }
            const htmlToSend = template(replacements);
            const mailOptions = {
              from: 'HardCode Community',
              to: email,
              subject: 'HardCode - Şifre Değiştirme',
              html: htmlToSend,
            }
            transporter.sendMail(mailOptions);
          }
        })
        return true;
      }
      catch (error) {
        throw new Error(error.message);
      }
    },
    resetPassword: async ({ token, newPassword, type }) => {
      try {
        if(newPassword.length < 6 || newPassword.length > 255) throw new Error("Şifre en az 6, en fazla 255 karakterden oluşabilir.");
        const verifiedToken = (!type ? jsonwebtoken.verify(token, settings.authSecret) : jsonwebtoken.verify(token, settings.resetPasswordConfirmSecret));
        const user = await db.models.Users.findByPk(verifiedToken.id);
        if(!user) throw new Error("Kullanıcı bulunamadı.");
        user.password = newPassword;
        await user.save();
        return true;
      }
      catch (error) {
        throw new Error(error.message);
      }
    },
    subscribeEmail: async ({ email }) => {
      try {
        if(!emailValidator.validate(email)) throw new Error("Geçersiz e-mail adresi girdiniz.");
        const check = await db.models.Subscribers.findOne({where: {email: email}});
        if(check) throw new Error("Bu e-mail adresi ile zaten abone olunmuş.");
        await db.models.Subscribers.create({email: email});
        return true;
      }
      catch (error) {
        throw new Error(error.message);
      }
    },
    unsubscribeEmail: async ({ email }) => {
      try {
        const check = db.models.Subscribers.findOne({where: {email: email}})
        if(!check) throw new Error("Geçersiz e-mail adresi.");
        await check.destroy();
        return true;
      }
      catch (error) {
        throw new Error(error.message);
      }
    }
  }
}
