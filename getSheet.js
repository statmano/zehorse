var fs = require('fs')

var Tabletop = require('tabletop')

var cache = require('./cache.json')
var dateLog = require('./datelog.json')

module.exports = function getSheet (key, callback) {
  Tabletop.init({ 
    key: key,
    callback: function gotData (data, tabletop) {
      checkData(data, callback)
    },
    simpleSheet: true 
  })
}

function checkData (data, callback) {
  // if no data, use old data
  if (!data) {
    updateLog(false)
    return callback(cache)
  }
  updateLog(true)
  overwriteData(data)
  callback(data)
}

function updateLog (updatedData) {
  dateLog.lastUpdate.date = new Date()
  dateLog.lastUpdate.newData = updatedData
  fs.writeFileSync('./datelog.json', JSON.stringify(dateLog))
}

function overwriteData (newData) {
  console.log('overwite')
  fs.writeFileSync('./cache.json', JSON.stringify(newData, null, ' '))
}