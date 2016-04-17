const fs = require('fs')

module.exports = {
  get(cb){
    const fileName = './twitchconfig.json'
    try {
       fs.accessSync(fileName, fs.R_OK | fs.W_OK)
    } catch(e){
      fs.writeFileSync(fileName, '{ "alias": {} }', 'utf8')
    }
    return JSON.parse(fs.readFileSync(fileName,'utf8'))
  },
  save(newObj, cb){
    const fileName = './twitchconfig.json'
    fs.writeFile(fileName, JSON.stringify(newObj), 'utf8', cb)
  }
}
