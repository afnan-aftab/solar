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
var snippet_gyro = "<tr><th scope=\"row\">"+"{{KEY}}"+"</th><td>"+"{{TTTT}}"+"</td><td>"+"{{AXXX}}"+"</td><td>"+"{{AYYY}}"+"</td><td>"+"{{AZZZ}}"+"</td></tr>";
var snippet_power = "<tr><th scope=\"row\">"+"{{KEY}}"+"</th><td>"+"{{TTTT}}"+"</td><td>"+"{{AXXX}}"+"</td><td>"+"{{AYYY}}"+"</td><td>"+"{{AZZZ}}"+"</td><td>"+"{{AGGG}}"+"</td></tr>";
var data_row_array = [];
// END VARIABLES -------------------->


// Initial function ----------------------------->
document.addEventListener("DOMContentLoaded", initial);

function initial(){

  load_img('img/solar-house.png','nav-img');

  if(document.querySelector('#jumbo')!= null){
    storage.ref('img/2028.jpg').getDownloadURL().then(function(url){
      document.querySelector('#jumbo').style="background-image: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.6) 100%), url("+url+")";
    });
  }

  storage.ref('img/solar-house.png').getDownloadURL().then(function(url){
    document.querySelector('#icon').href=url;
  });

}
// END Initial function ----------------------------->

//Function to download file to computer------>
function download_file(path){
  storage.ref(path).getDownloadURL().then(function (url) {
    var link = document.createElement("a");
    if (link.download !== undefined) {
        link.setAttribute("href", url);
        link.setAttribute("target", "_blank");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
})
}
//END Function to download file to computer------>

// load image in web page ---------------------->
function load_img(path,id_div){
  storage.ref(path).getDownloadURL().then(function(url){
    var test = url;
    document.querySelector('#' + id_div).src = test;
  });
}
//END load image in web page ------------------->

//ADD row to power table ------------------->
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
//END ADD row to power table ------------------->

//ADD row to gyro page table  ------------>
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
//END ADD row to gyro page table  ------------>

//calculate average of an array -------->
function avg_array(arr){
  if(arr.length == 0){
    return 0;
  }
  else{
    var sum = 0;
    for (i=0;i<arr.length;i++){
      sum += arr[i];
    }
  return sum/arr.length;
  }
}
//ENDcalculate average of an array -------->

//draw chart POWER page ----------------------->

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
//END draw chart POWER page ----------------------->


// draw chart to GYRO page --------------------------->
function gyro_chart(arr,id_div){
  google.charts.load('current', {'packages':['scatter']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart () {

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Time');
        data.addColumn('number', 'Ax');
        data.addColumn('number', 'Ay');
        data.addColumn('number', 'Ay');


        data.addRows(arr);

        var options = {
          width: 800,
          height: 500,
          chart: {
            title: 'Gyro Chart',
            subtitle: 'Scatter Plot'
          },
          axes: {
            y: {
              'Ax': {label: 'Ax/Ay/Az'},
            }
          }
        };

        var chart = new google.charts.Scatter(document.getElementById(id_div));

        chart.draw(data, google.charts.Scatter.convertOptions(options));
      }
}

//END draw chart to GYRO page --------------------------->

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

document.getElementById('top_btn').addEventListener('click',topFunction)
//Smooth Scroll and scroll to top button -------------------------------------------------->


var query = database.ref('Room1').orderByKey();
var querypower = database.ref('power').orderByKey();


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
  $("#show_table_gyro").click(function(){
    showLoading('table-gyro');
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
    document.getElementById('loading').remove();
    document.getElementById('show_table_gyro').innerHTML = "Click to Refresh Data";
  });
});

$(document).ready(function(){
  $("#show_plot_gyro").click(function(){
    var arr = [];
    showLoading('chart_gyro');
    query.on('value', (snapshot) => {
      snapshot.forEach(function(childSnapshot){
        var key = childSnapshot.key;
        var Acx = childSnapshot.val().Ax;
        var Acy = childSnapshot.val().Ay;
        var Acz = childSnapshot.val().Az;
        arr[arr.length]=[key,Acx,Acy,Acz];
      });
    });
    gyro_chart(arr,'chart_gyro');
    document.getElementById('show_plot_gyro').innerHTML = "Click to Refresh Chart";
  });
});

$(document).ready(function(){
  $("#show_table_power").click(function(){
    showLoading('table-pp');
    var querypowerlimit = querypower.limitToLast(300);
    querypowerlimit.on('value', (snapshot) => {
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
    document.getElementById('loading').remove();
    document.getElementById('show_table_power').innerHTML = "Click to Refresh Data";
  });

});

$(document).ready(function(){
  $("#show_plot_power").click(function(){
    var arr = [];
    showLoading('chart_power');
    var querypowerlimit = querypower.limitToLast(300);
    querypowerlimit.on('value', (snapshot) => {
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

/*$(document).ready(function(){
  $("#show_plot_power").click(function(){
    var arr = [];
    var AC = [];
    var CD = [];
    var ye = [];
    showLoading('chart_power');
    var querypowerlimit = querypower.limitToLast(300);
    querypower.on('value', (snapshot) => {
      snapshot.forEach(function(childSnapshot){
        var AC_p = childSnapshot.val().AC_POWER;
        var CD_p = childSnapshot.val().DC_POWER;
        var dailyyield = childSnapshot.val().DAILY_YIELD;
        var date = childSnapshot.val().DATE_TIME;
        var time = date[date.length-5]+date[date.length-4]+date[date.length-3]+date[date.length-2]+date[date.length-1];
        if(time<'12:45'){
          AC[AC.length] = AC_p;
          CD[CD.length] = CD_p;
          ye[ye.length] = dailyyield;
        }else{
          var aAC = avg_array(AC);
          var aCD = avg_array(CD);
          var aYe = avg_array(ye);
          if (AC.length != 0){
            arr[arr.length] = [date,(aAC+AC_p)/2,(aCD+CD_p)/2,(aYe+dailyyield)/2];
          }
          AC = [];
          CD = [];
          ye = [];
        }
      });
      snapshot.forEach(function(childSnapshot){
        var AC_p = childSnapshot.val().AC_POWER;
        var CD_p = childSnapshot.val().DC_POWER;
        var dailyyield = childSnapshot.val().DAILY_YIELD;
        var date = childSnapshot.val().DATE_TIME;
        var a = '';
        var b = 0;
        var time = date[date.length-5]+date[date.length-4]+date[date.length-3]+date[date.length-2]+date[date.length-1];
        if(time>'12:45'){
          b = AC.length;
          AC[AC.length] = AC_p;
          CD[CD.length] = CD_p;
          ye[ye.length] = dailyyield;
          a = date;
        }
        
        if(AC.length != 0){
          var aAC = avg_array(AC);
          var aCD = avg_array(CD);
          var aYe = avg_array(ye);
          arr[arr.length] = [a,aAC*2-AC_p,aCD*2-CD_p,aYe*2-dailyyield];
          AC = [];
          CD = [];
          ye = [];
        }
        
      });
    });
    console.log(arr);
    power_chart(arr,'chart_power');
    document.getElementById('show_plot_power').innerHTML = "Click to Refresh Chart";
  });

});*/