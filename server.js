var express = require('express')
var app = express()

var getSheet = require('./getSheet.js')

app.use(express.static('public'))

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html')
})

app.get("/sheet", function (request, response) {
  // HEY!
  // Replace this string with your spreadsheet key!
  var key = '1CYDJfcqngatqgVEGLUFgntD62hdlQvPK8rltk2ydfe0'
  getSheet(key, function (data) {
    // TODO do something if tabletop doesn't give anything back
    // because it errored and didn't handle it
    response.send(data)
  })
})

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})
