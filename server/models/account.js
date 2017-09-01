const Sequelize = require("sequelize");
const faker = require("faker");

let Account = null;

module.exports = sequelize => {
  if (!Account) {
    const User = require("./user")(sequelize);
    Account = sequelize.define(
      "account",
      {
        userId: {
          type: Sequelize.INTEGER,
          references: {
            model: "users",
            key: "id"
          },
          allowNull: false
        },
        name: {
          type: Sequelize.STRING,
          validate: {
            len: [3, 4096]
          },
          allowNull: false,
          defaultValue: null
        },
        number: {
          type: Sequelize.STRING,
          validate: {
            len: [3, 255]
          },
          allowNull: false,
          defaultValue() {
            return faker.finance.iban();
          }
        },
        balance: {
          type: Sequelize.DOUBLE,
          validate: {
            min: 0
          },
          allowNull: false,
          defaultValue() {
            return parseFloat(faker.finance.amount());
          }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE
      },
      {
        getterMethods: {
          maskedAccountNumber() {
            return `XXXXX${this.number.substring(this.number.length - 5)}`;
          }
        },
        indexes: [
          {
            unique: true,
            fields: ["number"]
          }
        ]
      }
    );
    User.hasMany(Account);
    Account.belongsTo(User);
    Account.sync();
  }

  return Account;
};
