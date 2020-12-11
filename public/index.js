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
var aut = firebase.auth();
// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥


var snippet_gyro = "<tr><th scope=\"row\">"+"{{KEY}}"+"</th><td>"+"{{TTTT}}"+"</td><td>"+"{{AXXX}}"+"</td><td>"+"{{AYYY}}"+"</td><td>"+"{{AZZZ}}"+"</td></tr>";
var snippet_power = "<tr><th scope=\"row\">"+"{{KEY}}"+"</th><td>"+"{{TTTT}}"+"</td><td>"+"{{AXXX}}"+"</td><td>"+"{{AYYY}}"+"</td><td>"+"{{AZZZ}}"+"</td><td>"+"{{AGGG}}"+"</td></tr>";
var data_row_array = [];

document.addEventListener("DOMContentLoaded", initial);

function initial(){

}

function add_row_gyro(T,Ax,Ay,Az,key){
  var h = snippet_gyro.replace("{{TTTT}}",T);
  h = h.replace("{{KEY}}",key);
  h = h.replace("{{AXXX}}",Ax);
  h = h.replace("{{AYYY}}",Ay);
  h = h.replace("{{AZZZ}}",Az);
  if(document.getElementById('table-gyro')==null)
  {}else{
    document.getElementById('table-gyro').insertAdjacentHTML("beforeend", h);
  }
  
}

function add_row_power(key,date,AC_p,CD_p,dailyyield,Tot){
  var h = snippet_power.replace("{{KEY}}",key);
  h = h.replace("{{TTTT}}",date);
  h = h.replace("{{AXXX}}",AC_p);
  h = h.replace("{{AYYY}}",CD_p);
  h = h.replace("{{AZZZ}}",dailyyield);
  h = h.replace("{{AGGG}}",Tot);
  if(document.getElementById('table-pp')==null)
  {}else{
    document.getElementById('table-pp').insertAdjacentHTML("beforeend", h);
  }
  
}

function power_chart(arr,id_div){
  google.charts.load('current', {'packages':['scatter']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart () {

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Date & Time');
        data.addColumn('number', 'AC Power');
        data.addColumn('number', 'DC Power');
        data.addColumn('number', 'Daily Yield');


        data.addRows(arr);

        var options = {
          width: 800,
          height: 500,
          chart: {
            title: 'AC & DC Power/Dai;y Yield vs Date and Time',
            subtitle: 'Scatter Plot'
          },
          series: {
            0: {axis: 'AC/DC Power'},
            1: {axis: 'Daily Yield'}
          },
          axes: {
            y: {
              'Power': {label: 'AC/DC'},
              'Daily Yield': {label: 'Yield'}
            }
          }
        };

        var chart = new google.charts.Scatter(document.getElementById(id_div));

        chart.draw(data, google.charts.Scatter.convertOptions(options));
      }
}

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

document.getElementById('top_btn').addEventListener('click',topFunction)

var query = database.ref('Room1').orderByKey();
var querypower = database.ref('power').orderByChild('DATE_TIME');

query.on('value', (snapshot) => {
  snapshot.forEach(function(childSnapshot){
    var key = childSnapshot.key;
    var Acx = childSnapshot.val().Ax;
    var Acy = childSnapshot.val().Ay;
    var Acz = childSnapshot.val().Az;
    var T = childSnapshot.val().Temp;
    
    add_row_gyro(T,Acx,Acy,Acz,key);
  });
});

query.limitToLast(1).on('child_added', (childSnapshot) => {

    var key = childSnapshot.key;
    var Acx = childSnapshot.val().Ax;
    var Acy = childSnapshot.val().Ay;
    var Acz = childSnapshot.val().Az;
    var T = childSnapshot.val().Temp;
    
    add_row_gyro(T,Acx,Acy,Acz,key);
 
});


$(document).ready(function(){
  $("#rm_but").click(function(){
      $("#readmore").modal('toggle')
  });
  
});

$(document).ready(function(){
  $("#login").click(function(){
    $("#loginModal").modal('toggle')
  });

});

$(document).ready(function(){
  $("#show_table_power").click(function(){
    querypower.on('value', (snapshot) => {
      snapshot.forEach(function(childSnapshot){
        var key = childSnapshot.key;
        var AC_p = childSnapshot.val().AC_POWER;
        var CD_p = childSnapshot.val().DC_POWER;
        var dailyyield = childSnapshot.val().DAILY_YIELD;
        var Tot = childSnapshot.val().TOTAL_YIELD;
        var date = childSnapshot.val().DATE_TIME;
        
        add_row_power(key,date,AC_p,CD_p,dailyyield,Tot);
      });
    });
    document.getElementById('show_table_power').innerHTML = "Click to Refresh Data";
  });

});

$(document).ready(function(){
  $("#show_plot_power").click(function(){
    var arr = [];
    querypower.on('value', (snapshot) => {
      snapshot.forEach(function(childSnapshot){
        var AC_p = childSnapshot.val().AC_POWER;
        var CD_p = childSnapshot.val().DC_POWER;
        var dailyyield = childSnapshot.val().DAILY_YIELD;
        var date = childSnapshot.val().DATE_TIME;
        arr[arr.length]=[date,AC_p,CD_p,dailyyield];
      });
    });
    power_chart(arr,'chart_power');
    document.getElementById('show_plot_power').innerHTML = "Click to Refresh Chart";
  });

});