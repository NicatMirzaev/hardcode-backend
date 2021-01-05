const jsonwebtoken = require('jsonwebtoken')
const Op = require('Sequelize').Op;
const settings = require('./lib/settings.js');
const emailValidator = require('email-validator');
const transporter = require('./lib/mail.js');
const handlebars = require('handlebars');
const fs = require('fs');

module.exports = db => {
  return {
    user: async ({ id }, req) => {
      if(!req.user) throw new Error("Giriş yapmalısınız.")
      const user = await db.models.Users.findByPk(id)
      if(!user) throw new Error("Kullanıcı bulunamadı.")
      const getLikes = await db.models.Likes.findAll({where: {userId: user.id}})
      const likes = [];
      for(let i = 0; i < getLikes.length; i++) {
        const data = await db.models.Categories.findByPk(getLikes[i].categoryId)
        if(data) {
          const isLiked = await db.models.Likes.findOne({
            where: {
              [Op.and]: [
                {userId: req.user.id},
                {categoryId: getLikes[i].categoryId}
              ]
            }
          })
          if(isLiked) data.isLiked = true;
          else data.isLiked = false;
          likes.push(data);
        }
      }
      user.likes = likes;
      user.requiredExp = user.level * settings.exp_to_next_level;
      return user;
    },
    me: async (args, req) => {
      try {
        if(!req.user) throw new Error("Giriş yapmalısınız.");
        const user = await db.models.Users.findByPk(req.user.id)
        if(!user) throw new Error("Kullanıcı bulunamadı.")
        const getLikes = await db.models.Likes.findAll({where: {userId: user.id}})
        const likes = [];
        for(let i = 0; i < getLikes.length; i++) {
          const data = await db.models.Categories.findByPk(getLikes[i].categoryId)
          if(data) {
            data.isLiked = true;
            likes.push(data);
          }
        }
        user.likes = likes;
        user.requiredExp = user.level * settings.exp_to_next_level;
        return user;
      }
      catch (error) {
        throw new Error(error.message)
      }
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
            { expiresIn: '1y' }
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
        const getLikes = await db.models.Likes.findAll({where: {userId: user.id}})
        const likes = [];
        for(let i = 0; i < getLikes.length; i++) {
          const data = await db.models.Categories.findByPk(getLikes[i].categoryId)
          if(data) {
            data.isLiked = true;
            likes.push(data);
          }
        }
        user.likes = likes;
        user.requiredExp = user.level * settings.exp_to_next_level;
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
    },
    updateProfile: async ({currentPassword, newPassword, LinkedinURL, GitHubURL, TwitterURL, ProfileImg, username}, req) => {
      try {
        if(!req.user) throw new Error("Giriş yapmalısınız.");
        if(!currentPassword.length) throw new Error("Hesabınızda değişiklik yapabilmek için şu anki şifrenizi girmelisiniz.");
        if(username.length < 3 || username.length > 40) throw new Error("Kullanıcı adı en az 3, en fazla 40 karakterden oluşabilir.");
        if(newPassword.length > 0  && (newPassword.length < 6 || newPassword.length > 255)) throw new Error("Yeni şifre en az 6, en fazla 255 karakterden oluşabilir.");
        const user = await db.models.Users.findByPk(req.user.id);
        if(!user) throw new Error("Kullanıcı bulunamadı.")
        if(user.password !== currentPassword) throw new Error("Mevcut şifrenizi yanlış girdiniz, lütfen tekrar deneyin.");
        user.username = username;
        if(newPassword.length > 0) user.password = newPassword;
        user.profileImg = ProfileImg;
        user.twitterURL = TwitterURL;
        user.GitHubURL = GitHubURL;
        user.LinkedinURL = LinkedinURL;
        await user.save();
        const getLikes = await db.models.Likes.findAll({where: {userId: user.id}})
        const likes = [];
        for(let i = 0; i < getLikes.length; i++) {
          const data = await db.models.Categories.findByPk(getLikes[i].categoryId)
          if(data) {
            data.isLiked = true;
            likes.push(data);
          }
        }
        user.likes = likes;
        user.requiredExp = user.level * settings.exp_to_next_level;
        return user
      }
      catch (error) {
        throw new Error(error.message);
      }
    },
    getCategories: async (args, req) => {
      try {
        if(!req.user) throw new Error("Giriş yapmalısınız.");
        const getCategories = await db.models.Categories.findAll({order: [['likes', 'DESC']]});
        const categories = getCategories.map(async category => {
          const isLiked = await db.models.Likes.findOne({
            where: {
              [Op.and]: [
                {userId: req.user.id},
                {categoryId: category.id}
              ]
            }
          })
          if(isLiked) category.isLiked = true;
          else category.isLiked = false;

          return category;
        })
        return categories;
      }
      catch (error) {
        throw new Error(error.message);
      }
    },
    likeCategory: async ({ categoryId }, req) => {
      try {
        if(!req.user) throw new Error("Giriş yapmalısınız.");
        const user = await db.models.Users.findByPk(req.user.id);
        if(!user) throw new Error("Kullanıcı bulunamadı.")
        const category = await db.models.Categories.findByPk(categoryId);
        if(!category) throw new Error("Kategori bulunamadı.")
        let isLiked = false;
        const like = await db.models.Likes.findOne({
          where: {
            [Op.and]: [
              {userId: user.id},
              {categoryId: category.id}
            ]
          }
        })
        if(like) {
          await like.destroy();
          category.likes -= 1;
          await category.save();
          isLiked = false;
        }
        else {
          await db.models.Likes.create({userId: user.id, categoryId: category.id});
          category.likes += 1;
          await category.save();
          isLiked = true;
        }
        category.isLiked = isLiked;
        return category;
      }
      catch (error) {
        throw new Error(error.message)
      }
    },
    getLeaderboard: async (args, req) => {
      try {
        if(!req.user) throw new Error("Giriş yapmalısınız.")
        const users = await db.models.Users.findAll({ limit: 20 })
        users.sort((a,b) => {
          if(a.level > b.level) return -1;
          if(a.level < b.level) return 1;
          if(a.level === b.level && a.exp > b.exp) return -1;
          if(a.level === b.level && a.exp < b.exp) return 1;
          return 0;
        });

        return users;
      }
      catch (error) {
        throw new Error(error.message)
      }
    },
    getTasks: async ({ categoryId }, req) => {
      try {
        if(!req.user) throw new Error("Giriş yapmalısınız.");
        const category = await db.models.Categories.findByPk(categoryId);
        if(!category) throw new Error("Geçersiz kategori girdiniz.")
        const isLiked = await db.models.Likes.findOne({
          where: {
            [Op.and]: [
              {userId: req.user.id},
              {categoryId: category.id}
            ]
          }
        })
        if(isLiked) category.isLiked = true;
        else category.isLiked = false;
        const tasks = await db.models.Tasks.findAll({where: {categoryId: category.id}, order: [['step', 'ASC']]})
        return {category: category, tasks: tasks}
      }
      catch (error) {
        throw new Error(error.message)
      }
    }
  }
}
