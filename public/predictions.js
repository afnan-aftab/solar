// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
var firebaseConfig = {
    apiKey: "AIzaSyBKpj34iA8Slz69O2EdFikdZURdlAPo7RA",
    authDomain: "iot-solar-database.firebaseapp.com",
    databaseURL: "https://iot-solar-database-default-rtdb.firebaseio.com",
    projectId: "iot-solar-database",
    storageBucket: "iot-solar-database.appspot.com",
    messagingSenderId: "804706405547",
    appId: "1:804706405547:web:10a3358b308bc4c891fbee",
    measurementId: "G-Q18KF5TDXH"
  };
  
// Initialize Firebase with a "default" Firebase project
var Project = firebase.initializeApp(firebaseConfig);
console.log(Project.name);
var database = firebase.database();
var storage = firebase.storage();
// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

// VARIABLES -------------------->
var query1 = database.ref('consumption').orderByKey();
var query2 = database.ref('generation').orderByKey();
// END VARIABLES -------------------->


// Initial function ----------------------------->
document.addEventListener("DOMContentLoaded", initial);
//
function initial(){

  load_img('img/solar-house.png','nav-img');

  if(document.querySelector('#jumbo')!= null){
    storage.ref('img/2028.jpg').getDownloadURL().then(function(url){
      document.querySelector('#jumbo').style="background-image: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.6) 100%), url("+url+")";
    });
  }

  if(document.querySelector('#jumboML')!= null){
    storage.ref('img/23148.jpg').getDownloadURL().then(function(url){
      document.querySelector('#jumboML').style="background-image: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.6) 100%), url("+url+")";
    });
  }

  storage.ref('img/solar-house.png').getDownloadURL().then(function(url){
    document.querySelector('#icon').href=url;
  });

  lol();
  lol2();
  //displayChart(arr4,'consumption', 'Predictions vs Actual');
  //displayChart(arr4,'generation', 'Predictions vs Actual');

}
// END Initial function ----------------------------->

function displayChart(arr,div,tit,mean){

  google.charts.load('current', {'packages':['line']});
  google.charts.setOnLoadCallback(drawChart);

function drawChart() {

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Day');
    data.addColumn('number', 'Power Predicted');
    data.addColumn('number', 'Power Actual');

    data.addRows(arr);

    var options = {
      chart: {
        title: tit,
        subtitle: 'Mean Error (kW): '+String(mean)
      },
      width: 900,
      height: 500
    };

    var chart = new google.charts.Line(document.getElementById(div));

    chart.draw(data, google.charts.Line.convertOptions(options));
  }

}

function displayChart1(arr,div,tit,mean){

  google.charts.load('current', {'packages':['line']});
  google.charts.setOnLoadCallback(drawChart);

function drawChart() {

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Reading');
    data.addColumn('number', 'GHI Predicted');
    data.addColumn('number', 'GHI Actual');

    data.addRows(arr);

    var options = {
      chart: {
        title: tit,
        subtitle: 'Mean Error (kW/m2): '+String(mean)
      },
      width: 900,
      height: 500
    };

    var chart = new google.charts.Line(document.getElementById(div));

    chart.draw(data, google.charts.Line.convertOptions(options));
  }

}


// load image in web page ---------------------->
function load_img(path,id_div){
  storage.ref(path).getDownloadURL().then(function(url){
    var test = url;
    document.querySelector('#' + id_div).src = test;
  });
}
//END load image in web page ------------------->


//Smooth Scroll and scroll to top button -------------------------------------------------->
// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    document.getElementById("top_btn").style.display = "block";
  } else {
    document.getElementById("top_btn").style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

document.getElementById('top_btn').addEventListener('click',topFunction);
//Smooth Scroll and scroll to top button -------------------------------------------------->

$(document).ready(function(){
  $("#rm_but").click(function(){
      $("#readmore").modal('toggle')
  });
  
});

function lol(){
  
    var arr2 = [];
    var err = [];
      query1.once('value', (snapshot) => {
          arr2 = [['Sunday',snapshot.val().sun_p,snapshot.val().sun_a],['Monday',snapshot.val().mon_p,snapshot.val().mon_a],['Tuesday',snapshot.val().tue_p,snapshot.val().tue_a],['Wednesday',snapshot.val().wed_p,snapshot.val().wed_a],['Thursday',snapshot.val().wed_p,snapshot.val().wed_a],['Friday',snapshot.val().fri_p,snapshot.val().fri_a],['Saturday',snapshot.val().sat_p,snapshot.val().sat_a]]
          for(var j=0;j<arr2.length;j++){
            err[j]=Math.abs(arr2[j][1]-arr2[j][2]);
          }
          var mean = 0;
          var max = 0;
          var min = 9999999;
          for(j=0;j<err.length;j++){
            mean = mean+err[j];
            if(err[j]>=max){
              max = err[j];
            }
            if(err[j]<=min){
              min = err[j];
            }
          }
          console.log('Consumption');
          console.log("Min: ");
          console.log(min/1000);
          console.log("Max: ");
          console.log(max/1000);
          mean = mean/err.length;

          displayChart(arr2,'consumption', 'Power (Watts) (3 Jan 2010 - 9 Jan 2010)',mean/1000);
      });
      
  
  }

function lol2(){
  var arr2 = [];
  var err = [];
    query2.once('value', (snapshot) => {
      var pre = snapshot.val().predicted;
      var act = snapshot.val().actual;
      for(var j=0;j<168;j++){
        arr2[arr2.length] = [j,pre[j],act[j]];
        err[err.length] = Number([Math.abs(pre[j]-act[j])]);
      }
      var mean = 0;
      var max = 0;
      var min = 9999999;
      for(j=0;j<err.length;j++){
        mean = mean+err[j];
        if(err[j]>=max){
          max = err[j];
        }
        if(err[j]<=min){
          min = err[j];
        }
      }
      console.log('Generation');
      console.log("Min: ");
      console.log(min/1000);
      console.log("Max: ");
      console.log(max/1000);
      mean = mean/err.length;

      displayChart1(arr2,'generation','GHI (W/m2) (24 March 2017 - 30 March 2017)',mean/1000);
    });
}