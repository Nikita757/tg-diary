'use strict';
import 'dotenv/config';
import callbacks from './middleware/callbacks';

import TelegramBot = require('node-telegram-bot-api');
import { Bot } from 'grammy';

const token = process.env.BOT_TOKEN;

const bot = new Bot(token);

bot.on('message', (msg) => {
  if (msg.text?.toString().indexOf('/start') === 0) {
    callbacks.start(bot, msg);
  }

  if (msg.text?.toString().indexOf('/help') === 0) {
    callbacks.help(bot, msg);
  }

  if (msg.text?.toString().indexOf('/register') === 0) {
    callbacks.register(bot, msg);
  }

  if (msg.text?.toString().indexOf('/login') === 0) {
    callbacks.login(bot, msg);
  }

  if (msg.text?.toString().indexOf('/logout') === 0) {
    callbacks.logout(bot, msg);
  }

  if (msg.text?.toString().indexOf('/getTask') === 0) {
    callbacks.getTask(bot, msg);
  }

  if (msg.text?.toString().indexOf('/addTask') === 0) {
    callbacks.addTask(bot, msg);
  }

  if (msg.text?.toString().indexOf('/delTask') === 0) {
    callbacks.delTask(bot, msg);
  }

  if (msg.text?.toString().indexOf('/title') === 0) {
    callbacks.changeTitle(bot, msg);
  }

  if (msg.text?.toString().indexOf('/desc') === 0) {
    callbacks.changeDescription(bot, msg);
  }

  if (msg.text?.toString().indexOf('/status') === 0) {
    callbacks.changeStatus(bot, msg);
  }

  if (msg.text?.toString().indexOf('/tasks') === 0) {
    callbacks.getAllTasks(bot, msg);
  }
});
