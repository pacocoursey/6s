#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const Table = require('cli-table3');
const termSize = require('term-size');
const Discord = require('discord.js');
const toMilliseconds = require('@sindresorhus/to-milliseconds');
const discrims = require('./discriminators.json');

const args = process.argv.splice(2);
const tooFast = 'Invalid Form Body\nusername: You are changing your username or Discord Tag too fast. Try again later.';
const badPwd = 'Invalid Form Body\npassword: Password does not match.';
const tooMany = 'Invalid Form Body\nusername: Too many users have this username, please try another.';

const messages = Array(args.length).fill('');

function render() {
  const width = parseInt(termSize().columns / args.length, 10) - 2;
  const widths = Array(args.length).fill(width);
  const header = [];
  const values = [];

  messages.forEach((msg) => {
    values.push({ content: msg });
  });

  if (!messages || messages.length === 0 || messages.length !== args.length) {
    throw new Error('Cannot render empty content');
  }

  args.forEach((name) => {
    header.push({ hAlign: 'center', content: path.basename(name) });
  });

  const table = new Table({
    head: header,
    colWidths: widths,
    wordWrap: true,
  });

  table.push(values);

  console.clear();
  console.log(table.toString());
}

function log(msg, index) {
  messages[index] += `- ${msg}\n`;
  render();
}

async function test(config, index) {
  const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

  const client = new Discord.Client({
    fetchAllMembers: true,
  });

  const set = async (users) => {
    const user = users.random();
    log(`Trying with username: ${user.username}.`, index);
    try {
      await client.user.setUsername(user.username, config.password);
      log(`Succesfully set username to ${user.username}.`, index);
      return true;
    } catch (err) {
      if (err.message === badPwd) {
        log('Password or token is incorrect. Check your config.json file.', index);
        process.exit(1);
      } else if (err.message === tooFast) {
        log('Hit set limit. Waiting 30 minutes to retry.', index);
        await timeout(toMilliseconds({ minutes: 30, seconds: 2 }));
      } else if (err.message === tooMany) {
        log(`Cannot set username to ${user.username}. Re-trying in 10 seconds.`, index);
        await timeout(toMilliseconds({ seconds: 10 }));
        users.delete(user.id);
      } else {
        log(err, index);
      }

      return false;
    }
  };

  const seek = async () => {
    const users = client.users.filter(u => u.discriminator === client.user.discriminator);
    const self = users.find('username', client.user.username).id;

    // Remove self from possibilities
    users.delete(self);

    if (users.size < 1) {
      log('No matching discrims found. Join more servers.', index);
      process.exit(1);
    }

    let successFlag = false;

    // loop until username succesfully
    successFlag = await set(users);
    while (!successFlag) {
      successFlag = await set(users);
    }

    if (discrims.list.includes(client.user.discriminator)) {
      log(`\nMatched discrim: ${client.user.discriminator}`, index);
      log('You should now change your name back to your preferred name.', index);
      log(`WARNING: The user with your preffered name and discrim #${client.user.discriminator} may already exist. Try adding this user as a friend before changing your name back.`, index);
      log(`If that user already exists, you will LOSE THE ${client.user.discriminator} DISCRIMINATOR.`, index);
    } else {
      log(`Bad discriminator: ${client.user.discriminator}.`, index);
      log('Waiting 30 minutes to retry.', index);
      await timeout(toMilliseconds({ minutes: 30, seconds: 2 }));
      seek();
    }

    process.exit(1);
  };

  // Client has loaded
  client.on('ready', () => {
    log('Starting in 10 seconds', index);

    client.setTimeout(() => {
      log(`Started: ${client.user.username}#${client.user.discriminator}`, index);
      seek();
    }, toMilliseconds({ seconds: 10 }));
  });

  client.login(config.token);
}

if (!args || args.length === 0) {
  console.log('No configuration files specified.');
  process.exit(1);
} else if (Array.isArray(args)) {
  args.forEach((file) => {
    if (!fs.existsSync(file)) {
      console.log(`File '${file}' does not exist.`);
      process.exit(1);
    }
  });
} else if (!fs.existsSync(args)) {
  console.log(`File '${args}' does not exist.`);
  process.exit(1);
}

// Spawn an async function for each config file
let i = 0;
args.forEach((name) => {
  const config = fs.readJSONSync(name);
  test(config, i);
  i += 1;
});
