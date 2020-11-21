const jsonwebtoken = require('jsonwebtoken')
const Op = require('Sequelize').Op;
const { secret } = require('./settings.js');
const emailValidator = require('email-validator');

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
          { id: user.id, email: user.email},
          secret,
          { expiresIn: '1y' }
        )
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
        const user = await db.models.Users.findOne({where: {email: email, password: password}});
        if(!user) throw new Error("Geçersiz email adresi veya şifre.");
        const token = jsonwebtoken.sign(
          { id: user.id, email: user.email},
          secret,
          { expiresIn: '1d'}
        )
        return {
          token, user
        }
      }
      catch (error) {
        throw new Error(error.message)
      }
    }
  }
}
