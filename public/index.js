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
// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥


var snippet = "<tr><th scope=\"row\">"+"{{KEY}}"+"</th><td>"+"{{TTTT}}"+"</td><td>"+"{{AXXX}}"+"</td><td>"+"{{AYYY}}"+"</td><td>"+"{{AZZZ}}"+"</td></tr>";

document.addEventListener("DOMContentLoaded", initial);

function initial(){

}

function add_row(T,Ax,Ay,Az,key){
  var h = snippet.replace("{{TTTT}}",T);
  h = h.replace("{{KEY}}",key);
  h = h.replace("{{AXXX}}",Ax);
  h = h.replace("{{AYYY}}",Ay);
  h = h.replace("{{AZZZ}}",Az);
  if(document.getElementById('test')==null)
  {}else{
    document.getElementById('test').insertAdjacentHTML("beforeend", h);
  }
  
}

var query = database.ref('Room1').orderByKey();

query.on('value', (snapshot) => {
  snapshot.forEach(function(childSnapshot){
    var key = childSnapshot.key;
    var Acx = childSnapshot.val().Ax;
    var Acy = childSnapshot.val().Ay;
    var Acz = childSnapshot.val().Az;
    var T = childSnapshot.val().Temp;
    
    add_row(T,Acx,Acy,Acz,key);
  });
});

query.limitToLast(1).on('child_added', (childSnapshot) => {

    var key = childSnapshot.key;
    var Acx = childSnapshot.val().Ax;
    var Acy = childSnapshot.val().Ay;
    var Acz = childSnapshot.val().Az;
    var T = childSnapshot.val().Temp;
    
    add_row(T,Acx,Acy,Acz,key);
 
 });
  

