#! /usr/bin/env node
const open        = require('open')
const inquirer    = require('inquirer')
const chalk       = require('chalk')
const program     = require('commander')
const getPromised = require('./getPromised')

const gamesUrl    = 'https://api.twitch.tv/kraken/games/top?limit=25'
const streams     = 'https://api.twitch.tv/kraken/streams?limit=25&game='

const log         = txt => console.log(txt)
const clearScreen = _ => log('\033c')

var previouslyDefinedAlias = {
  hs: 'https://www.twitch.tv/dreamhackcs'
}
const mountObj = (type, name, message, choices) => {
  return { type, name, message, choices}
}

clearScreen()

log(chalk.bold.black.bgWhite('----- TWITCH.TV STREAM FINDER -----'))

/*
  Options:
  h help (Display how to use options)
  w watch <alias> (Open alias stream page)
  s search <stream|game|channel> [query] (Display options for the search)
  f find
*/

program
  .command('watch <alias>')
  .alias('w')
  .description('Open previously defined alias on the default browser')
  .action(alias => {
    if(previouslyDefinedAlias[alias]){
       open(previouslyDefinedAlias[alias])
       log('Alias is being opened');
       return;
    }
  })

program
  .command('find')
  .alias('f')
  .description('Find a stream based on the top games and top streamers for that game')
  .action(_ => {

    const gamesConfig =
      mountObj('list', 'games', chalk.green('Which game do you want to watch'),  _ => {
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
      })

    inquirer
      .prompt(gamesConfig)
      .then(answers => {

        const streamsConfig =
          mountObj('list', 'Streams', chalk.green('Which stream do you want to watch'), _ => {
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
          })

        inquirer
          .prompt(streamsConfig)
          .then(streamAnswer => {
            log(streamAnswer);
          })
      })
  })

program.parse(process.argv)
