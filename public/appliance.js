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
var query1 = database.ref('Appl1');
var query2 = database.ref('Appl2');

var query3 = database.ref('Appl1_data').orderByKey();
var query4 = database.ref('Appl2_data').orderByKey();

var snippet_table = "<tr><th scope=\"row\">{{DATE}}</th><td>{{DAY}}</td><td>{{TIME}}</td><td>{{POWER}}</td></tr>";
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

  query1.on('value', (snapshot)=>{
    var status = snapshot.val().status;
    console.log(status);
    if(status==true)
    {
      document.getElementById('status_appl1').innerHTML = "Status<span class=\"badge badge-pill badge-success\">ON</span>";
    }else if(status==false)
    {
      document.getElementById('status_appl1').innerHTML = "Status<span class=\"badge badge-pill badge-danger\">OFF</span>";
    }
  });

  query2.on('value', (snapshot)=>{
    var status = snapshot.val().status;
    console.log(status);
    if(status==true)
    {
      document.getElementById('status_appl2').innerHTML = "Status<span class=\"badge badge-pill badge-success\">ON</span>";
    }else if(status==false)
    {
      document.getElementById('status_appl2').innerHTML = "Status<span class=\"badge badge-pill badge-danger\">OFF</span>";
    }
  });

  query3.limitToLast(1).on('value', (snapshot) => {
    snapshot.forEach(function(childSnapshot){
      var key = childSnapshot.key;
      var power = childSnapshot.val().power;
      var day = childSnapshot.val().timestamp.day;
      var date = childSnapshot.val().timestamp.date;
      var time = childSnapshot.val().timestamp.time;

      var h = snippet_table.replace("{{DATE}}",date);
      h = h.replace("{{DAY}}",day);
      h = h.replace("{{TIME}}",time);
      h = h.replace("{{POWER}}",power);
      console.log(key);

      document.getElementById('table1').innerHTML = h;

    });
  });

  query4.limitToLast(1).on('value', (snapshot) => {
    snapshot.forEach(function(childSnapshot){
      var key = childSnapshot.key;
      var power = childSnapshot.val().power;
      var day = childSnapshot.val().timestamp.day;
      var date = childSnapshot.val().timestamp.date;
      var time = childSnapshot.val().timestamp.time;

      var h = snippet_table.replace("{{DATE}}",date);
      h = h.replace("{{DAY}}",day);
      h = h.replace("{{TIME}}",time);
      h = h.replace("{{POWER}}",power);
      console.log(key);

      document.getElementById('table2').innerHTML=h;

    });
  });

  var arr2 = [];
  query4.limitToLast(100).once('value', (snapshot) => {
    snapshot.forEach(function(childSnapshot){

      var power = childSnapshot.val().power;
      var day = childSnapshot.val().timestamp.day;
      var date = childSnapshot.val().timestamp.date;
      var time = childSnapshot.val().timestamp.time;
      arr2[arr2.length]=[date+" "+time,power];
    });
    displayChart(arr2,'chart2', 'Appliance 2 Statistics')
  });


  var arr1 = [];
    query3.limitToLast(100).once('value', (snapshot) => {
      snapshot.forEach(function(childSnapshot){

        var power = childSnapshot.val().power;
        var day = childSnapshot.val().timestamp.day;
        var date = childSnapshot.val().timestamp.date;
        var time = childSnapshot.val().timestamp.time;
        arr1[arr1.length]=[date+" "+time,power];
      });
      displayChart(arr1,'chart1', 'Appliance 1 Statistics')
    });


}
// END Initial function ----------------------------->


document.getElementById('appl1_but').addEventListener('click',function(){
  console.log('button pressed 1');

  query1.once('value',(snapshot)=>{
    var status = snapshot.val().status;
    var ref = database.ref('Appl1/status');
    if(status==true)
    {
      ref.set(false);
    }else
    {
      ref.set(true);
    }
  });

});

document.getElementById('appl2_but').addEventListener('click',function(){
  console.log('button pressed 2');

  query2.once('value',(snapshot)=>{
    var status = snapshot.val().status;
    var ref = database.ref('Appl2/status');
    if(status==true)
    {
      ref.set(false);
    }else
    {
      ref.set(true);
    }
  });

});

/*document.getElementById('show_plot1').addEventListener('click',function(){
  
  var arr1 = [];
    query3.limitToLast(100).once('value', (snapshot) => {
      snapshot.forEach(function(childSnapshot){

        var power = childSnapshot.val().power;
        var day = childSnapshot.val().timestamp.day;
        var date = childSnapshot.val().timestamp.date;
        var time = childSnapshot.val().timestamp.time;
        arr1[arr1.length]=[date+" "+time,power];
      });
    });

  displayChart(arr1,'chart1', 'Appliance 1 Statistics')

});


document.getElementById('show_plot2').addEventListener('click',function(){
  
  var arr2 = [];
    query4.limitToLast(100).once('value', (snapshot) => {
      snapshot.forEach(function(childSnapshot){

        var power = childSnapshot.val().power;
        var day = childSnapshot.val().timestamp.day;
        var date = childSnapshot.val().timestamp.date;
        var time = childSnapshot.val().timestamp.time;
        arr2[arr2.length]=[date+" "+time,power];
      });
    });
    displayChart(arr2,'chart2', 'Appliance 2 Statistics')

});*/

function displayChart(arr,div,tit){
  google.charts.load('current', {'packages':['scatter']});
  google.charts.setOnLoadCallback(drawChart);

  function drawChart () {

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Time');
    data.addColumn('number', 'Power');

    data.addRows(arr);

    var options = {
      width: 800,
      height: 500,
      chart: {
        title: tit,
        subtitle: 'Scatter Plot'
      },
      hAxis: {title: 'Date & Time'},
      vAxis: {title: 'Power (Watts)'}
    };

    var chart = new google.charts.Scatter(document.getElementById(div));

    chart.draw(data, google.charts.Scatter.convertOptions(options));
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

$(document).ready(function(){
  $("#login").click(function(){
    $("#loginModal").modal('toggle')
  });

});