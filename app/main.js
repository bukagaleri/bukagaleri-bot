// --- TODO Modularize response

'use strict'

const TelegramBot = require('node-telegram-bot-api');

const users = require('modules/users');
const arrayHelper = require('helpers/array');

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
const mainGroupId = process.env.GROUP_ID

function tagline() {
  return `\n\n------------------\n\nMari buka indahnya dunia melalui <b>BukaGaleri</b>\n\n\ud83d\ude0a\u263a\ufe0f`;
}

function greeting(opts) {
  return `Halo @${opts.username}, selamat datang di <b>${opts.groupName}</b>.\n\nYuk daftarkan akun Instagram kamu dulu dengan cara japri ke @${process.env.BOT_USERNAME} dengan format \n\n<code>/register username_instagram</code>${tagline()}`
}

function introduction(opts) {
  return `Halo semua,\nAda teman baru nih di <b>BukaGaleri</b>.\n\nInstagramnya ada di https://www.instagram.com/${opts.username}. Silakan follow dan saling berbagi ilmu ya.${tagline()}`
}

function pmIntroduction(opts) {
  return `<b>BukaGaleri</b>\n\nHalo ${opts.firstName},\nAkun kamu <b>sudah terdaftar</b>.\n\nOhya, sudah tahukah kamu tentang BukaGaleri?\n\nBukaGaleri adalah sebuah media untuk <i>sharing</i> karya fotografi kita melalui Instagram. Harapannya, agar kita saling mengenal antar anggota grup, dan dapat belajar serta mau memberi pembelajaran bagi anggota yang lain.

<b>Bagaimana caranya?</b>
Cukup mudah, setiap kamu posting di Instagram, jangan lupa sertakan tagar #${process.env.QUERY_TAG}. Setelah itu, dalam waktu tertentu, BukaGaleri akan melakukan repost postingan kamu, dan tidak lupa meneyertakan nama kamu di sana.

[BukaGaleri] https://www.instagram.com/${process.env.IG_USERNAME}${tagline()}`;
}

function wrongFormat() {
  return `Hai, Bukan begitu ya.\nKamu bisa daftarin Instagram kamu dengan format \n\n<code>/register username_instagram</code>`;
}

bot.on('new_chat_participant', (msg, match) => {
  const chatId = msg.chat.id;
  const user = msg['new_chat_participant'];
  if (chatId == mainGroupId && !/_bot$/gi.test(user.username)) {
    users.addUser(user);
    bot.sendMessage(chatId, greeting({groupName: msg.chat.title, username: user.username}), {parse_mode: 'html'});
  }
});

bot.on('left_chat_participant', (msg) => {
  const chatId = msg.chat.id;
  const user = msg['left_chat_participant'];
  if (chatId == mainGroupId && !/_bot$/gi.test(user.username)) {
    users.removeUser(user);
  }
});

bot.onText(/^\/register (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const teleUser = msg.from;
  const messageId = msg.message_id;
  const igUsername = match[1].replace(/\s+/g, '');

  const inGroup = chatId == mainGroupId;

  users.registerIg(teleUser, igUsername, inGroup, (resp) => {
    if (resp.status == 'OK') {
      bot.sendMessage(mainGroupId, introduction({username: igUsername}), {parse_mode: 'html'});
      bot.sendMessage(teleUser.id, pmIntroduction({firstName: msg.from.first_name}), {parse_mode: 'html'});
    } else {
      bot.sendMessage(chatId, 'Maaf, akun Instagram kamu tidak bisa ditemukan \ud83d\ude14\n\nCoba periksa lagi ya \ud83d\ude09', {parse_mode: 'html', reply_to_message_id: messageId});
    }
  });
});

bot.onText(/^\/register$/, (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  bot.sendMessage(chatId, wrongFormat(), {parse_mode: 'html', reply_to_message_id: messageId})
});
