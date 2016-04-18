#! /usr/bin/env node

// Libs
const open        = require('open')
const inquirer    = require('inquirer')
const chalk       = require('chalk')
const program     = require('commander')
// Modules
const getPromised = require('./getPromised')
const alias       = require('./alias')
// Constants
const gamesUrl    = 'https://api.twitch.tv/kraken/games/top?limit=25'
const streams     = 'https://api.twitch.tv/kraken/streams?limit=25&game='
const log         = txt => console.log(txt)
const clearScreen = _ => log('\033c')

var configAlias   = alias.get()

const mountObj = (type, name, message, choices) => {
  return { type, name, message, choices}
}

clearScreen()

log(chalk.bold.black.bgWhite('----- TWITCH.TV STREAM FINDER -----'))


program
  .command('search <type> [query...]')
  .description('Search for a stream/game/channel on twitch.tv')
  .action((type, query) => {
    const reg = new RegExp(/^(stream|game|channel)$/)
    if(!reg.test(type)){
      log('The type must satisfy the one of the followings: stream, game or channel.')
      return
    }
  })


program
  .command('watch [alias...]')
  .description('Open previously defined alias on the default browser')
  .action(alias => {
    alias = alias.join(' ')
    if(configAlias[alias]){
       open(configAlias[alias].url)
       log('Alias is being opened');
       return;
    }
    log(`Haven't found ${alias}!`)
  })

program
  .command('find')
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
            inquirer
              .prompt({ type: 'confirm', name: 'AliasOrNo', message: 'Do you want to add this stream as an alias?', default: false })
              .then(aliasAnswer => {
                if(!aliasAnswer.AliasOrNo){
                  open(streamAnswer.Streams.url)
                  log('Thank you for using cli-twitch =)')
                  return
                }

                inquirer
                  .prompt({
                      type: 'input',
                      name: 'Alias',
                      message: 'Which alias do you want to use?'
                    })
                  .then(userDefinedAlias => {
                    configAlias.alias[userDefinedAlias.Alias] = streamAnswer.Streams
                    alias.save(configAlias.alias, (err, data) => {
                      if(!err){
                        log(`Next time you'd like to open ${streamAnswer.Streams.channelName}'s stream, just type "twitch watch ${userDefinedAlias.Alias}"`)
                        open(streamAnswer.Streams.url)
                      } else {
                        console.log(err);
                      }
                    })
                  })
              })
          })
      })
  })

program.parse(process.argv)
