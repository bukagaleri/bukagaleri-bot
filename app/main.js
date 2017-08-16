const TelegramBot = require('node-telegram-bot-api');

const users = require('modules/users');
const arrayHelper = require('helpers/array');

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
const mainGroup = process.env.GROUP_ID

function greeting(opts) {
  const talking = [
    'Halo @{{name}}, Selamat datang di <b>Bukalapak Fotovideografi Club</b>.\n\nMari berkarya bersama \ud83d\ude0a\u263a\ufe0f'
  ]
  return arrayHelper.random(talking).replace(/{{name}}/gi, opts.name)
}

bot.on('new_chat_participant', (msg, match) => {
  const chatId = msg.chat.id;
  if (chatId == mainGroup) {
    const user = msg['new_chat_participant'];
    users.addUser(user);
  }
});


bot.on('left_chat_participant', (msg) => {
  const chatId = msg.chat.id;
  if (chatId == mainGroup) {
    const user = msg['left_chat_participant'];
    users.removeUser(user);
  }
});

const messages = {
  'USER_REGISTERED': 'Sudah terdaftar',
  'USER_NOT_FOUND': 'Anda belum terdaftar',
  'WAIT_REGISTER': 'Tunggu sebentar ya'
}

bot.onText(/\/register (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const teleUserId = msg.from.id;
  const messageId = msg.message_id;
  const igUsername = match[1].replace(/\s+/g, '');

  bot.sendMessage(chatId, messages['WAIT_REGISTER'], {reply_to_message_id: messageId});
  users.registerIg(teleUserId, igUsername, (resp) => {
    bot.sendMessage(chatId, messages[resp.message_code], {reply_to_message_id: messageId});
  });
});
