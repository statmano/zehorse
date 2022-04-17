// This loads up the correct number of input fields depending on the number of horses
$("#numH").change(function(){
      var h = $(this).val();
      $("#s_inputs").empty();
      for (var j = 0; j < h; j++){
      var htizzle = '<label for="Search' + (j+1) + '">Horse Name</label><input type="text" id="Search' + (j+1) + '" name="Search' + (j+1) + '"><br>';
      $("#s_inputs").append(htizzle);
      }
    });

// This variable will contain all of the Google Sheet data
var zeData;

// Setup blank object for horse stats to be stored into
var horseObject = {};
var chartPace = {};

// The data from the Google Sheet is loaded once the page loads and is stored in the variable zeData
$(function() {
  console.log("hello world :o");
  $("#predictions").hide();
  $("#thisChart").hide();
  $.get("/sheet", function(data) {
    var mit = parseInt(data[0].TST);
    var mat = mit + 2;

    console.log("Back with <b>" + data.length + "</b> rows from the spreadsheet! ");
       zeData = data;
  });
});

    var Tavg, Pavg, PHavg, Davg, TMx, PMx, PHMx;

    // Main function for getting data
    var f_search = function(searchVal) {
      var results = [];
      var searchField = "Horse";
      //new code
      var pAv = [];
      var phAv = [];
      var TAv = [];
      var dAv = [];

      // Gets the master data for each horse
      for (var i = 0; i < zeData.length; i++) {
        if (zeData[i][searchField] == searchVal) {
          results.push(zeData[i]);
          pAv.push(parseFloat(zeData[i]["Pace"]));
          phAv.push(parseFloat(zeData[i]["PHE"]));
          TAv.push(parseFloat(zeData[i]["TST"]));
          dAv.push(parseFloat(zeData[i]["Distance"]));
          }
        }
      
      // Max values for each stat
      PMx = Math.max(...pAv);
      PHMx = Math.max(...phAv);
      TMx = Math.max(...TAv);
      
      // Average values for each stat functions - this could be turned into another loop, just lazy right now
      var aTotal = 0;
      for(var i = 0; i < pAv.length; i++) {
        aTotal += pAv[i];
        }
      Pavg = aTotal / pAv.length;
      
      var bTotal = 0;
      for(var i = 0; i < phAv.length; i++) {
        bTotal += phAv[i];
        }
      PHavg = bTotal / phAv.length;
      
      var cTotal = 0;
      for(var i = 0; i < TAv.length; i++) {
        cTotal += TAv[i];
        }
      Tavg = cTotal / TAv.length;
      
      var dTotal = 0;
      for(var i = 0; i < dAv.length; i++) {
        dTotal += dAv[i];
        }
      Davg = dTotal / dAv.length;
    };
      
// Takes in the horses entered then loops through them calling the f_search function
    $("#yea").click(function() {
      var vRace = $("#rName").val();
      var beladj = $("#track").val();
      $("#pred__Track").html(`${beladj}`);
      $("#pred__Race").html(`<u>${vRace}</u>`);
      for (var x = 0; x < $("#numH").val(); x++){
  var finder = "#Search" + (x+1);
  var searchValT = $(finder).val();

      f_search(searchValT);
      
      // Inserts information into object that can be used to calculate predictions
      horseObject["P" + (x + 1) + "aPace"] = Pavg;
      horseObject["P" + (x + 1) + "aPHE"] = PHavg;
      horseObject["P" + (x + 1) + "aTST"] = Tavg;
      horseObject["P" + (x + 1) + "MPace"] = PMx;
      horseObject["P" + (x + 1) + "MPHE"] = PHMx;
      horseObject["P" + (x + 1) + "MTST"] = TMx;
      horseObject["P" + (x + 1) + "aDist"] = Davg;  
      console.table(horseObject);
      
      //Put time into minute format function
      var minFunction = function(raw){
        switch(true){ 
          case (raw < 120):
            return "1:" + (raw - 60).toFixed(2);
            break;case (raw < 120):
            return "1:" + (raw - 60).toFixed(2);
            break;
          case (raw >= 120 && raw < 130): 
            return "2:0" + (raw - 120).toFixed(2);
            break;
          case (raw >= 130):
            return "2:" + (raw-120).toFixed(2);
        }
      };
        
      $("#fSearch").hide();
      // Prediction Code Below v.2 - no comparison to field yet, does take in part post position
      var rlength = $("#rlength").val();
      switch(rlength){
        case "8f":
          var pHalfTime = 56 - (.1205 * horseObject["P" + (x +1) + "aPace"]);
          horseObject["P" + (x + 1) + "cP"] = pHalfTime.toFixed(2);
          //var FTP = pHalfTime + (2640 / ((.495 * pHalfTime) + 33.4));
          //console.log("FTP equals: " + FTP);
          
          //distance adjuster as horses tend to perform worse over greater distances
          var dadjPHav = (((((Davg - 8) * .165)+1)) * PHavg) / 100;
          //predicted first half speed in fps
          var HFPS = 2660 / pHalfTime;
          //calculation based on the predicted first half on what the best time possible is (orig line below)
          //var FPHEthun = (2660 / ((-.48 * HFPS)+84.5)) + pHalfTime;
          
          //----- changes start here ------
          //Calc the speed that will be equal to 100 for the 2nd half
          var PHEhundred = ((-.48 * HFPS)+84.5);
          //Calculate BOOSTED fastest speed, so record breakers won't break a 100
          var PHEhunBoost = (((56 - pHalfTime)/11.75) * 1.49) + PHEhundred;
          //Get the difference between a 100 speed and a 0 speed
          var hundif = PHEhunBoost - 47.5;
          var finalSpeed = ((dadjPHav) * hundif) + 47.5;
          var finalP1 = (2660 / finalSpeed) + pHalfTime;
          //post position adjuster - based on adding 6 ft to the radius of a turn per post 8+, but not as big as once thought (country house)
          if(x+1 > 7){
            pHalfTime = pHalfTime * ((((x+1) - 7) * 0.0016) + 1);
          }
          //Max Performance calculations
          //Distance adjuster, just swapping in the horse's MAX PHE instead of the AVERAGE
          var dadjPHMx = (((((Davg - 8) * .165)+1)) * PHMx) / 100;
          var finalSpeedMax = ((dadjPHMx) * hundif) + 47.5;
          var tMAX = (2660 / finalSpeedMax) + pHalfTime;
          //Remaining portion post position adjuster - Not as significant as first half as horse can come in some paths usually during the remaining distance
          if(x+1 > 7){
            finalP1 = finalP1 * ((((x+1) - 7) * 0.001) + 1);
            tMAX = tMAX * ((((x+1) - 7) * 0.001) + 1);
          }
          //Belmont Adjuster (the one-turn config and wide turn typically drops times by 2 sec)
          if(beladj = "Belmont Park"){
            pHalfTime = pHalfTime * .99;
            finalP1 = finalP1 * .99;
            tMAX = tMAX * .99;
          }
          //turns any time that is above 60 seconds into mm:ss format
          var minForm = minFunction(finalP1);
          var FPHEmx = minFunction(tMAX);
          
          $("#predictions").append("<div class='hName'>" + (x+1) + " " + searchValT +"</div><div class='stat'>:" + pHalfTime.toFixed(2) + "</div><div class='stat'>" + minForm + "</div><div class='stat'>" + FPHEmx + "</div>");
          $("#predictions").show();
          break;
        case "16f":
          var pHalfTime = 56 - (.1187 * horseObject["P" + (x +1) + "aPace"]);
          horseObject["P" + (x + 1) + "cP"] = pHalfTime.toFixed(2);
          //var FTP = pHalfTime + (2970 / ((.549 * pHalfTime) + 29.9));
          //console.log("FTP equals: " + FTP);
          var dadjPHav = (((((Davg - 8.5) * .165)+1)) * PHavg) / 100;
          var HFPS = 2660 / pHalfTime;
          
          var PHEhundred = ((-.655 * HFPS)+92.5);
          var PHEhunBoost = (((56 - pHalfTime)/11.65) * 1.49) + PHEhundred;
          //Get the difference between a 100 speed and a 0 speed
          var hundif = PHEhunBoost - 47.5;
          var finalSpeed = ((dadjPHav) * hundif) + 47.5;
          var finalP1 = (2992.5 / finalSpeed) + pHalfTime;
          //Max Performance calculations
          var dadjPHMx = (((((Davg - 8.5) * .165)+1)) * PHMx) / 100;
          var finalSpeedMax = ((dadjPHMx) * hundif) + 47.5;
          var tMAX = (2992.5 / finalSpeedMax) + pHalfTime;
          //post position adjuster - based on adding 6 ft to the radius of a turn per post 8+, but not as big as once thought (country house)
          if(x+1 > 7){
            pHalfTime = pHalfTime * ((((x+1) - 7) * 0.0016) + 1);
            tMAX = tMAX * ((((x+1) - 7) * 0.001) + 1);
          }
          if(x+1 > 7){
            finalP1 = finalP1 * ((((x+1) - 7) * 0.001) + 1);
          }
          //Belmont Adjuster (the one-turn config and wide turn typically drops times by 2 sec)
          if(beladj = "Belmont Park"){
            pHalfTime = pHalfTime * .9866;
            finalP1 = finalP1 * .9866;
            tMAX = tMAX * .9866;
          }
          var minForm = minFunction(finalP1);
          var FPHEmx = minFunction(tMAX);
          $("#predictions").append("<div class='hName'>" + (x+1) + " " + searchValT +"</div><div class='stat'>:" + pHalfTime.toFixed(2) + "</div><div class='stat'>" + minForm + "</div><div class='stat'>" + FPHEmx + "</div>");
          $("#predictions").show();
          break; 
          
          case "9f":
          var pHalfTime = 56 - (.1168 * horseObject["P" + (x +1) + "aPace"]);
          horseObject["P" + (x + 1) + "cP"] = pHalfTime.toFixed(2);
          //var FTP = pHalfTime + (3300 / ((.515 * pHalfTime) + 30.9));
          //console.log("FTP equals: " + FTP);
          var dadjPHav = (((((Davg - 9) * .165)+1)) * PHavg) / 100;
          var HFPS = 2660 / pHalfTime;
          
          //----- changes start here ------
          var PHEhundred = ((-.468 * HFPS)+82.3);
          var PHEhunBoost = (((56 - pHalfTime)/11.45) * 1.49) + PHEhundred;
          //Get the difference between a 100 speed and a 0 speed
          var hundif = PHEhunBoost - 47.5;
          var finalSpeed = ((dadjPHav) * hundif) + 47.5;
          var finalP1 = (3325 / finalSpeed) + pHalfTime;
          //Max Performance calculations
          var dadjPHMx = (((((Davg - 9) * .165)+1)) * PHMx) / 100;
          var finalSpeedMax = ((dadjPHMx) * hundif) + 47.5;
          var tMAX = (3325 / finalSpeedMax) + pHalfTime;
          //post position adjuster - based on adding 6 ft to the radius of a turn per post 8+, but not as big as once thought (country house)
          if(x+1 > 7){
            pHalfTime = pHalfTime * ((((x+1) - 7) * 0.0016) + 1);
          }
          if(x+1 > 7){
            finalP1 = finalP1 * ((((x+1) - 7) * 0.001) + 1);
            tMAX = tMAX * ((((x+1) - 7) * 0.001) + 1);
          }
          //Belmont Adjuster (the one-turn config and wide turn typically drops times by 2 sec)
          if(beladj = "Belmont Park"){
            pHalfTime = pHalfTime * .9815;
            finalP1 = finalP1 * .9815;
            tMAX = tMAX * .9815;
          }
          var minForm = minFunction(finalP1);
          var FPHEmx = minFunction(tMAX);
          $("#predictions").append("<div class='hName'>" + (x+1) + " " + searchValT +"</div><div class='stat'>:" + pHalfTime.toFixed(2) + "</div><div class='stat'>" + minForm + "</div><div class='stat'>" + FPHEmx + "</div><div id='hStats'>PHavg</div>");
          $("#predictions").show();
          break; 
          
          case "10f":
          var pHalfTime = 56 - (.1130 * horseObject["P" + (x +1) + "aPace"]);
          horseObject["P" + (x + 1) + "cP"] = pHalfTime.toFixed(2);
          //var FTP = pHalfTime + (3960 / ((.385 * pHalfTime) + 38));
          //console.log("FTP equals: " + FTP);
          var dadjPHav = (((((Davg - 10) * .165)+1)) * PHavg) / 100;
          var HFPS = 2660 / pHalfTime;
          
          var PHEhundred = ((-.554 * HFPS)+86.6);
          var PHEhunBoost = (((56 - pHalfTime)/11.15) * 1.49) + PHEhundred;
          //Get the difference between a 100 speed and a 0 speed
          var hundif = PHEhunBoost - 47.5;
          var finalSpeed = ((dadjPHav) * hundif) + 47.5;
          var finalP1 = (3990 / finalSpeed) + pHalfTime;
          
          //Max Performance calculations
          var dadjPHMx = (((((Davg - 10) * .165)+1)) * PHMx) / 100;
          var finalSpeedMax = ((dadjPHMx) * hundif) + 47.5;
          var tMAX = (3990 / finalSpeedMax) + pHalfTime;
          //post position adjuster - based on adding 6 ft to the radius of a turn per post 8+, but not as big as once thought (country house)
          if(x+1 > 7){
            pHalfTime = pHalfTime * ((((x+1) - 7) * 0.0016) + 1);
          }
          if(x+1 > 7){
            finalP1 = finalP1 * ((((x+1) - 7) * 0.001) + 1);
            tMAX = tMAX * ((((x+1) - 7) * 0.001) + 1);
          }
          //Belmont Adjuster (the one-turn config and wide turn typically drops times by 2 sec)
          if(beladj = "Belmont Park"){
            pHalfTime = pHalfTime * .98;
            finalP1 = finalP1 * .98;
            tMAX = tMAX * .98;
          }
          var minForm = minFunction(finalP1);
          var FPHEmx = minFunction(tMAX);
          $("#predictions").append("<div class='hName'>" + (x+1) + " " + searchValT +"</div><div class='stat'>:" + pHalfTime.toFixed(2) + "</div><div class='stat'>" + minForm + "</div><div class='stat'>" + FPHEmx + "</div>");
          $("#predictions").show();
          break; 
      }
        //Change color of chart to be in line with the track  
        var track = $("#track").val();
        switch(track){
        case "Churchill Downs":
          $("#predictions").css("background-color", "#00614C");
          $(".hName").css("background-color", "white");
          $(".hName").css("color", "#595959");
          $("#pred__Race").css("color", "white");
          $("#pred__Track").css({
            "color" : "white",
            "-webkit-text-stroke-width" : "1px",
            "-webkit-text-stroke-color" : "#595959"
          });  
          break;
        case "Keeneland":
          $("#predictions").css("background-color", "#115740");
          $(".hName").css("background-color", "white");
          $(".hName").css("color", "#866d4b");
          $("#pred__Race").css("color", "white");
          $("#pred__Track").css({
            "color" : "white",
            "-webkit-text-stroke-width" : "1px",
            "-webkit-text-stroke-color" : "#595959"
          });  
          break;    
        case "Belmont Park":
          $("#predictions").css("background-image", "url(https://cdn.glitch.com/cbbaf302-0438-4cec-ba9b-7ca89d280a8c%2Fold_map.png?v=1593902524776)");
          $("#predictions").css("background-repeat", "repeat");
          $("#predictions").css("border", "25px solid #006600")
          $("#predictions").css("border-style", "ridge")
          $(".hName").css("background", "-webkit-linear-gradient(top, #990000 0%,#800000 100%)");
          $(".hName").css("color", "white");
          $("#pred__Race").css("color", "#990000");
          $(".stat").css("color", "#990000");
          $(".pTitles").css("color", "#990000");  
          $("#pred__Track").css({
            "color" : "#006600",
            "-webkit-text-stroke-width" : "1px",
            "-webkit-text-stroke-color" : "white"
          });
          break;   
        case "Santa Anita":
          $("#predictions").css("background-color", "black");
          $(".hName").css("background", "-webkit-linear-gradient(top, #e3bc74 0%,#bc8f3c 100%)");
          $(".hName").css("color", "#44423B");
          $("#pred__Race").css("color", "#e3bc74");
          $("#pred__Track").css({
            "color" : "#e3bc74",
            "-webkit-text-stroke-width" : "1px",
            "-webkit-text-stroke-color" : "#bc8f3c"
          });
          break;    
        case "Delaware Park":
          $("#predictions").css("background-color", "black");
          $(".hName").css("background", "-webkit-linear-gradient(top, #b80018 0%,#4d000a 100%)");
          $(".hName").css("color", "white");
          $(".pTitles").css("color", "#ffe066"); 
          $(".stat").css("color", "#ffe066");
          $("#pred__Race").css("color", "white");
          $("#pred__Track").css({
            "color" : "#b80018",
            "-webkit-text-stroke-width" : "1px",
            "-webkit-text-stroke-color" : "#ffe066"
          });  
          break; 
        case "JACK Thistledown":
          $("#predictions").css("background-color", "black");
          $(".hName").css("background-color", "#b30003");
          $(".hName").css("color", "white");
          $("#pred__Race").css("color", "white");
          $("#pred__Track").css({
            "color" : "white",
            "-webkit-text-stroke-width" : "1px",
            "-webkit-text-stroke-color" : "#b30003"
          }); 
          break;    
        case "Indiana Grand":
          $("#predictions").css("background-color", "#0E3A7C");
          $(".hName").css("background-color", "white");
          $(".hName").css("color", "#0E3A7C");
          $("#pred__Race").css("color", "white");
          $("#pred__Track").css({
            "color" : "white",
            "-webkit-text-stroke-width" : "1px",
            "-webkit-text-stroke-color" : "#0E3A7C"
          });  
          break;
         case "Monmouth Park":
          $("#predictions").css(
            {"background-image":"url(https://cdn.glitch.com/cbbaf302-0438-4cec-ba9b-7ca89d280a8c%2Fsandy.jpg?v=1593906172224)",
            "background-position":"center",
            "background-size":"100% 100%",
            "border":"5px solid teal",
            "border-radius":"10px"});
          $(".hName").css({"color":"white","background-image":"url(https://cdn.glitch.com/cbbaf302-0438-4cec-ba9b-7ca89d280a8c%2Ftoo-distressed2.jpg?v=1593905674789)","clip-path":"ellipse(86% 81% at 98% 51%)","background-position":"center","background-size":"100% 100%"});  
          $("#pred__Race").css("color", "white");
          $("#pred__Track").css({
            "color" : "white",
            "-webkit-text-stroke-width" : "1px",
            "-webkit-text-stroke-color" : "teal"
          }); 
          break;
          case "Saratoga":
          $("#predictions").css("background-color", "red");
          $(".hName").css("background-color", "white");
          $(".hName").css("color", "red");
          $("#pred__Race").css("color", "white");
          $("#pred__Track").css({
            "color" : "white",
            "-webkit-text-stroke-width" : "0px",
            "-webkit-text-stroke-color" : "gray"
          });  
          break;
          case "Del Mar":
          $("#predictions").css("background", "-webkit-linear-gradient(top, #1586c9 0%,#0b486d 100%)");
          $(".hName").css("background-color", "#c4e0f0");
          $(".hName").css("color", "#0b486d");
          $("#pred__Race").css("color", "#c4e0f0");
          $("#pred__Track").css({
            "color" : "white",
            "-webkit-text-stroke-width" : "0px",
            "-webkit-text-stroke-color" : "#c4e0f0"
          });  
          break;  
          case "Ellis Park":
          $("#predictions").css("background", "-webkit-linear-gradient(top, #FFF8D5 0%,#FFF2B2 100%)");
          $(".hName").css("background-color", "rgb(140, 36, 50)");
          $(".hName").css("color", "#FFF8D5");
          $("#pred__Race").css("color", "gray");
          $(".stat").css("color", "gray");
          $(".pTitles").css("color", "rgb(140, 36, 50)");
          $("#pred__Track").css({
            "color" : "rgb(140, 36, 50)",
            "-webkit-text-stroke-width" : "0px",
            "-webkit-text-stroke-color" : "gray"
          });  
          break;   
      }
        
        $("#thisChart").show();
      }
      

// Pace Projections using chart.js      
var ctx = document.getElementById("myChart").getContext("2d");
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: "horizontalBar",

    // The data for our dataset
    data: {
      labels: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12", "P13", "P14"],
      datasets: [
        {
          label: "hidden",
          backgroundColor: "rgb(255,147,38,0)",
          borderColor: "rgb(17, 82, 77,0.0)",
          data: [horseObject.P1aPace-10, horseObject.P2aPace-10, horseObject.P3aPace-10, horseObject.P4aPace-10, horseObject.P5aPace-10, horseObject.P6aPace-10, horseObject.P7aPace-10, horseObject.P8aPace-10, horseObject.P9aPace-10, horseObject.P10aPace-10, horseObject.P11aPace-10, horseObject.P12aPace-10, horseObject.P13aPace-10, horseObject.P14aPace-10],
          borderWidth: 1
        },
        {
          backgroundColor: ["red", "rgb(235, 235, 235)", "blue", "yellow", "green", "black", "orange", "pink", "teal", "purple", "rgb(194, 194, 214)", "rgb(51, 153, 51)", "brown", "rgb(128, 0, 0)"],
          data: [(horseObject.P1aPace-horseObject.P1aPace+10),(horseObject.P2aPace-horseObject.P2aPace+10),(horseObject.P3aPace-horseObject.P3aPace+10),(horseObject.P4aPace-horseObject.P4aPace+10),(horseObject.P5aPace-horseObject.P5aPace+10),(horseObject.P6aPace-horseObject.P6aPace+10),(horseObject.P7aPace-horseObject.P7aPace+10),(horseObject.P8aPace-horseObject.P8aPace+10),(horseObject.P9aPace-horseObject.P9aPace+10),(horseObject.P10aPace-horseObject.P10aPace+10),(horseObject.P11aPace-horseObject.P11aPace+10),(horseObject.P12aPace-horseObject.P12aPace+10),(horseObject.P13aPace-horseObject.P13aPace+10),(horseObject.P14aPace-horseObject.P14aPace+10),],
          borderWidth: 1
        }
      ]
    },

    // Configuration options go here
    options: {
      scales: {
        xAxes: [
          { stacked: true,
            ticks: {
              suggestedMin: 0,
              suggestedMax: 100
            }
          }
        ],
        yAxes: [
          { stacked: true,
            barPercentage: 1,
            categoryPercentage: .95
          }
        ]
      },
      legend: {
        display: false
      }
    }
  });

      return false;
    });

$(".hName").mouseover(function() {
    //$(this).children("#hStats").show();
    alert('yooo');
}).mouseout(function() {
    $(this).children("#hStats").hide();
});

var fObject = {
  turnup: function(text){
    console.log("yo yo big daddy is: " + text + "!!!");
  }
};

fObject.turnup("Seven Feet Tall");