const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');

let User = null;

function hashPassword(password) {
  return bcrypt.hashSync(password, 8);
}

module.exports = sequelize => {
  if (!User) {
    User = sequelize.define('user', {
      username: {
        type: Sequelize.STRING,
        validate: {
          isEmail: true,
          len: [3, 128],
        },
        allowNull: false,
        defaultValue: null
      },
      password: {
        type: Sequelize.VIRTUAL,
        set: function (val) {
           // Remember to set the data value, otherwise it won't be validated
           this.setDataValue('password', val);
           this.setDataValue('passwordHash', hashPassword(val));
         },
         validate: {
           len: {
             args: [8, 50],
             msg: 'Password is not long enough'
           },
           isComplexEnough(val) {
             if (!/[a-z]+/g.test(val)) {
               throw new Error("Password must include a lowercase letter");
             }
             if (!/[A-Z]+/g.test(val)) {
              throw new Error("Password must include an uppercase letter");
            }
            if (!/[0-9]+/g.test(val)) {
              throw new Error("Password must include a number");
            }
           }
         }
      },
      passwordHash: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: null
      },
      // Timestamps
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    }, {
       indexes: [{
        unique: true,
        fields: ['username']
      }]
    });
    User.sync();
  }
  User.findByCredentials = function ({username, password}) {
    return User.findOne({
      where: { username },
      attributes: ['id', 'username', 'passwordHash']
    }).then(user => {
      if (!user) throw new Error("No user found");
      if (bcrypt.compareSync(password, user.passwordHash)) {
        return user;
      }
      throw new Error("Incorrect password");
    })
  }
  return User;
}
