'use strict'

const Client = require('instagram-private-api').V1;

const Users = require('models/users');

const device = new Client.Device('bukagaleri');
const storage = new Client.CookieFileStorage(`${__app}cookies/bukagaleri.json`);

module.exports = (() => {
  return {
    addUser: (teleUser, callback) => {
      const userId = teleUser.id;
      const username = teleUser.username;
      Users.find({teleUserId: userId}, (err, result) => {
        if (err) throw err;
        if (!result.length) {
          const user = Users();
          user.teleUserId = userId;
          user.teleUsername = username;
          user.save((err) => {
            console.log(`teleUser ${teleUser.username} has been added`);
          });
        }
      });
    },
    removeUser: (teleUser, callback) => {
      const userId = teleUser.id;
      Users.find({teleUserId: userId}, (err, result) => {
        if (err) throw err;
        if (result.length) {
          const user = result[0];
          user.remove((err) => {
            if (err) throw err;
            console.log(`teleUser ${teleUser.username} has been removed`);
          });
        }
      });
    },
    registerIg: (teleUser, igUsername, inGroup, callback) => {
      Users.find({teleUserId: teleUser.id}, (err, result) => {
        if (err) throw err;
        if (result.length || inGroup) {
          const user = result.length ? result[0] : Users();
          Client.Session.create(device, storage, process.env.IG_USERNAME, process.env.IG_PASSWORD).then((session) => {
            return [session, Client.Account.searchForUser(session, igUsername)];
          }).spread((session, account) => {
      			const igId = account._params.id;
            const fullName = account._params.fullName;

            user.userId = igId;
            user.username = igUsername;
            user.teleUserId = teleUser.id;
            user.teleUsername = teleUser.username;
            user.fullName = fullName;
            user.save((err) => {
              if (err) throw err;
              console.log(`Instagram account ${igUsername} has been registered`);
              Client.Relationship.create(session, account.id);
              callback({status: 'OK', message_code: 'USER_REGISTERED'});
            });
      		});
        } else {
          callback({status: 'ERROR', message_code: 'USER_NOT_FOUND'});
        }
      });
    }
  }
})();
