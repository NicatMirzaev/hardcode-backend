const jsonwebtoken = require('jsonwebtoken')
const Sequelize = require('sequelize');
const settings = require('./lib/settings.js');
const emailValidator = require('email-validator');
const transporter = require('./lib/mail.js');
const handlebars = require('handlebars');
const fetch = require('node-fetch');
const fs = require('fs');

module.exports = db => {
  return {
    user: async ({ id }, req) => {
      if(!req.user) throw new Error("Unauthorized.")
      const user = await db.models.Users.findByPk(id)
      if(!user) throw new Error("User not found.")
      const getLikes = await db.models.Likes.findAll({where: {userId: user.id}})
      const likes = [];
      for(let i = 0; i < getLikes.length; i++) {
        const data = await db.models.Categories.findByPk(getLikes[i].categoryId)
        if(data) {
          const isLiked = await db.models.Likes.findOne({
            where: {
              [Sequelize.Op.and]: [
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
        if(!req.user) throw new Error("Unauthorized.")
        const user = await db.models.Users.findByPk(req.user.id)
        if(!user) throw new Error("User not found.")
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
        if(username.length < 3 || username.length > 40) throw new Error("The username can be a minimum of 3 and a maximum of 40 characters.");
        if(password.length < 6 || password.length > 255) throw new Error("The password can be a minimum of 6 and a maximum of 255 characters.");

        const checkEmail = emailValidator.validate(email);
        if(!checkEmail) throw new Error("You have entered an invalid e-mail address.");

        const isAvailable = await db.models.Users.findOne({where: {[Sequelize.Op.or]: [{username: username}, {email: email}]}})
        if(isAvailable){
          if(isAvailable.username === username) throw new Error("This username is used.")
          else throw new Error("This email address is used.");
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
              link: settings.signupConfirmUri + confirmationToken
            }
            const htmlToSend = template(replacements);
            const mailOptions = {
              from: 'HardCode Community',
              to: email,
              subject: 'HardCode - Account Confirmation',
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
        if(email.length < 3 || password.length < 3) throw new Error("Please enter your email and password correct.");
        const user = await db.models.Users.findOne({where: {email: email, password: password}});
        if(!user) throw new Error("Invalid email address or password.");
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
                link: settings.signupConfirmUri + confirmationToken
              }
              const htmlToSend = template(replacements);
              const mailOptions = {
                from: 'HardCode Community',
                to: email,
                subject: 'HardCode - Account Confirmation',
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
        if(!token) throw new Error("Invalid token.");
        const verifiedToken = jsonwebtoken.verify(token, settings.signupConfirmSecret);
        const user = await db.models.Users.findByPk(verifiedToken.id);
        if(!user) throw new Error("User not found.");
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
        if(!user) throw new Error("You have entered an invalid e-mail address.");
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
              link: settings.resetPasswordUri + token
            }
            const htmlToSend = template(replacements);
            const mailOptions = {
              from: 'HardCode Community',
              to: email,
              subject: 'HardCode - Change Password',
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
        if(newPassword.length < 6 || newPassword.length > 255) throw new Error("The password can consist of at least 6 and maximum 255 characters.");
        const verifiedToken = (!type ? jsonwebtoken.verify(token, settings.authSecret) : jsonwebtoken.verify(token, settings.resetPasswordConfirmSecret));
        const user = await db.models.Users.findByPk(verifiedToken.id);
        if(!user) throw new Error("User not found.");
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
        if(!emailValidator.validate(email)) throw new Error("You have entered an invalid e-mail address.");
        const check = await db.models.Subscribers.findOne({where: {email: email}});
        if(check) throw new Error("This e-mail address already subscribed.");
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
        if(!check) throw new Error("Invalid e-mail address.");
        await check.destroy();
        return true;
      }
      catch (error) {
        throw new Error(error.message);
      }
    },
    updateProfile: async ({currentPassword, newPassword, LinkedinURL, GitHubURL, TwitterURL, ProfileImg, username}, req) => {
      try {
        if(!req.user) throw new Error("Unauthorized.");
        if(!currentPassword.length) throw new Error("You must enter your current password to make changes on your account.");
        if(username.length < 3 || username.length > 40) throw new Error("Username can be at least 3 and at most 40 characters.");
        if(newPassword.length > 0  && (newPassword.length < 6 || newPassword.length > 255)) throw new Error("New password can be at least 3 and at most 40 characters.");
        const user = await db.models.Users.findByPk(req.user.id);
        if(!user) throw new Error("User not found.")
        if(user.password !== currentPassword) throw new Error("You entered your current password incorrectly, please try again.");
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
        if(!req.user) throw new Error("Unauthorized.");
        const getCategories = await db.models.Categories.findAll({order: [['likes', 'DESC']]});
        const categories = getCategories.map(async category => {
          const isLiked = await db.models.Likes.findOne({
            where: {
              [Sequelize.Op.and]: [
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
        if(!req.user) throw new Error("Unauthorized.");
        const user = await db.models.Users.findByPk(req.user.id);
        if(!user) throw new Error("User not found.")
        const category = await db.models.Categories.findByPk(categoryId);
        if(!category) throw new Error("Category not found.")
        let isLiked = false;
        const like = await db.models.Likes.findOne({
          where: {
            [Sequelize.Op.and]: [
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
        if(!req.user) throw new Error("Unauthorized.")
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
        if(!req.user) throw new Error("Unauthorized.");
        const category = await db.models.Categories.findByPk(categoryId);
        if(!category) throw new Error("Category not found.")
        category.views += 1;
        await category.save();
        const isLiked = await db.models.Likes.findOne({
          where: {
            [Sequelize.Op.and]: [
              {userId: req.user.id},
              {categoryId: category.id}
            ]
          }
        })
        if(isLiked) category.isLiked = true;
        else category.isLiked = false;
        const getTasks = await db.models.Tasks.findAll({where: {categoryId: category.id}, order: [['step', 'ASC']]})
        const tasks = getTasks.map(async task => {
          const isSolved = await db.models.SolvedTasks.findOne({
            where: {
              [Sequelize.Op.and]: [
                {userId: req.user.id},
                {taskId: task.id}
              ]
            }
          })
          if(isSolved) task.isSolved = true;
          else task.isSolved = false;
          task.categoryName = category.name;
          return task;
        })
        return {category: category, tasks: tasks}
      }
      catch (error) {
        throw new Error(error.message)
      }
    },
    getAllTasks: async (args, req) => {
      try {
        if(!req.user) throw new Error("Unauthorized.");
        const getTasks = await db.models.Tasks.findAll();
        const tasks = getTasks.map(async task => {
          const isSolved = await db.models.SolvedTasks.findOne({
            where: {
              [Sequelize.Op.and]: [
                {userId: req.user.id},
                {taskId: task.id}
              ]
            }
          })
          if(isSolved) task.isSolved = true;
          else task.isSolved = false;
          const category = await db.models.Categories.findByPk(task.categoryId);
          task.categoryName = category.name;
          return task;
        })
        return tasks;
      }
      catch (error) {
        throw new Error(error.message)
      }
    },
    getAllUsers: async (args, req) => {
      try {
        if(!req.user) throw new Error("Unauthorized.");
        const users = await db.models.Users.findAll({where: {isConfirmed: 1}})
        return users;
      }
      catch (error) {
        throw new Error(error.message)
      }
    },
    getTask: async ({ id }, req) => {
      try {
        if(!req.user) throw new Error("Unauthorized.");
        const task = await db.models.Tasks.findByPk(id);
        if(!task) throw new Error("Invalid task.")
        task.data = await require(`./tasks/${id}.js`);
        return task;
      }
      catch (error) {
        throw new Error(error.message)
      }
    },
    solveTask: async ({ id, language, code }, req) => {
      try {
        if(!req.user) throw new Error("Unauthorized.");
        let task = await db.models.Tasks.findByPk(id);
        if(!task) throw new Error("Invalid task.")
        let user = await db.models.Users.findByPk(req.user.id);
        if(!user) throw new Error("User not found.")

        task.data = await require(`./tasks/${id}.js`);
        const testCases = task.data.testCases;
        let returnObj = [];
        let success_count = 0;
        for(let i = 0; i < testCases.length; i++) {
          var params = new URLSearchParams();
          params.append('LanguageChoice', language);
          params.append('Program', code)
          params.append('Input', testCases[i].input);
          params.append('CompilerArgs', "")
          let response = await fetch("https://rextester.com/rundotnet/api", {
            method: "POST",
            body: params
          })
          response = await response.json();
          if(testCases[i].output === response.Result) response.isSuccess = true, success_count += 1;
          else response.isSuccess = false;
          returnObj.push(response);
          await wait(500);
        }
        if(success_count >= testCases.length) {
          const isSolved = await db.models.SolvedTasks.findOne({
            where: {
              [Sequelize.Op.and]: [
                {userId: req.user.id},
                {taskId: task.id}
              ]
            }
          })
          if(!isSolved) {
            db.models.SolvedTasks.create({ userId: user.id, taskId: task.id })
            user.exp += task.exp;
            user.completedTasks += 1;
            task.solvedCount += 1;
            user.requiredExp = user.level * settings.exp_to_next_level;
            while (user.exp >= user.requiredExp) {
              user.exp -= user.requiredExp
              user.level += 1
            }
            await user.save();
            await task.save();
          }
        }
        return returnObj;
      }
      catch (error) {
        throw new Error(error.message)
      }
    }
  }
}

function wait(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
