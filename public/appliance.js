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
    if(status==1)
    {
      document.getElementById('status_appl1').innerHTML = "Status<span class=\"badge badge-pill badge-success\">ON</span>";
    }else if(status==0)
    {
      document.getElementById('status_appl1').innerHTML = "Status<span class=\"badge badge-pill badge-danger\">OFF</span>";
    }
  });

  query2.on('value', (snapshot)=>{
    var status = snapshot.val().status;
    console.log(status);
    if(status==1)
    {
      document.getElementById('status_appl2').innerHTML = "Status<span class=\"badge badge-pill badge-success\">ON</span>";
    }else if(status==0)
    {
      document.getElementById('status_appl2').innerHTML = "Status<span class=\"badge badge-pill badge-danger\">OFF</span>";
    }
  });

  

}
// END Initial function ----------------------------->


document.getElementById('appl1_but').addEventListener('click',function(){
  console.log('button pressed 1');

  query1.once('value',(snapshot)=>{
    var status = snapshot.val().status;
    var ref = database.ref('Appl1/status');
    if(status==1)
    {
      ref.set(0);
    }else
    {
      ref.set(1);
    }
  });

});

document.getElementById('appl2_but').addEventListener('click',function(){
  console.log('button pressed 2');

  query2.once('value',(snapshot)=>{
    var status = snapshot.val().status;
    var ref = database.ref('Appl2/status');
    if(status==1)
    {
      ref.set(0);
    }else
    {
      ref.set(1);
    }
  });

});

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