var express = require("express");
var app = express();
// Use public google sheets parser
const PublicGoogleSheetsParser = require("public-google-sheets-parser");

const spreadsheetId = "1CYDJfcqngatqgVEGLUFgntD62hdlQvPK8rltk2ydfe0";

const parser = new PublicGoogleSheetsParser(spreadsheetId);

app.get("/sheet", function (request, response) {
  parser.parse().then((items) => {
    // items should be [{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6},{"a":7,"b":8,"c":9}]
    response.send(items);
    console.log('data is sent');
  });
});

app.use(express.static("public"));

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
