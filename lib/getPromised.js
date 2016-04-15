const https     = require('https')
const Promise   = require('promise')

const getPromised = url => {
  const promise = new Promise((resolve, reject) => {
    https.get(url, res => {
      const body = []
      res
        .on('data', chunk => body.push(chunk))
        .on('end', _ => resolve(JSON.parse(body.join(''))))
        .on('error', err => reject(err))
    })
  })
  return promise
}

module.exports = getPromised
