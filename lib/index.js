#! /usr/bin/env node
const fs          = require('fs')
const open        = require('open')
const inquirer    = require('inquirer')
const chalk       = require('chalk')
const argv        = require('minimist')(process.argv.slice(2))
const getPromised = require('./getPromised')
const gamesUrl    = 'https://api.twitch.tv/kraken/games/top?limit=25'
const streams     = 'https://api.twitch.tv/kraken/streams?limit=25&game='
const clearScreen = _ => console.log('\033c')

clearScreen()
// Cleaning the screen.



/*
  Options:
  -h --help (Display how to use options)
  -w --watch <alias> (Open alias stream page)
  -f --find <stream|game|channel> <query> (Display options for the search)
*/

console.log(chalk.bold.black.bgWhite('----- TWITCH.TV STREAM FINDER -----'))

const obj = {
  type: 'list',
  name: 'games',
  message: chalk.green('Which game do you want to watch'),
  choices: _ => {
    return getPromised(gamesUrl)
      .then(data => {
        return data.top.map(val => {
          return {
            name: `[${chalk.bold.yellow((val.channels + ' channels'))} | ${chalk.bold.yellow((val.viewers.toLocaleString() + ' viewers'))}] - ${chalk.bold.red(val.game.name)}`,
            short: val.game.name,
            value: val.game.name
          }
        })
      })
  }
}

inquirer
  .prompt(obj)
  .then(answers => {

    const streamsConfig = {
      type: 'list',
      name: 'Streams',
      message: chalk.green('Which stream do you want to watch'),
      choices: _ => {
        return getPromised(streams.concat(answers.games))
          .then(data => {
            return data.streams.map(val => {
              const url = val.channel.url
              const short = `${val.channel.display_name} - ${val.channel.status}`
              const name = `[${val.viewers.toLocaleString().concat(' viewers')}][${val.channel.language.toUpperCase()}] ${val.channel.display_name} - ${val.channel.status}`
              const channelName = val.channel.name

              return { name, short, value: { url, name: short, channelName } }
            })
          })
      }
    }

    inquirer
      .prompt(streamsConfig)
      .then(streamAnswer => {

      })
  })
