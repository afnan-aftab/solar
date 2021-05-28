#include <NTPClient.h>

#include <FirebaseESP8266.h>

#include <ESP8266WiFi.h>

#include <WiFiUdp.h>

const char * ssid = "D-6";
const char * pass = "1304f7e4";
WiFiClient client;

const long utcOffsetInSeconds = 5 * 60 * 60;

String weekDays[7] = {
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
};

// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds);

//======Credentials for the firebase cloud application
#define FIREBASE_HOST "iot-solar-database-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "hcRYoIkH6S9BGguK87PlBfyredO2uFoTmUDubWi9"

//======Variables to format sensor data
FirebaseData fbdo; //firebase data object
FirebaseJson json2;
FirebaseJson json1;
FirebaseJson json0;

unsigned long tim;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  delay(10);

  //======connect to WiFi
  Serial.println("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();
  timeClient.begin();
  //======Initialize the library with the Firebase authen and config.
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);
  tim = millis();
  delay(10);

}

void loop() {

  

  if (millis() - tim > 5000) {

    json1.set("power", 2.36987);
    json1.set("status", 1);
    createTimeJSON();
    json1.set("timestamp", json0);
    json2.set("test", json1);
    

    if (Firebase.pushJSON(fbdo, "/Appl1_data", json1)) {

      Serial.println("Data Updated");

    } else {
      Serial.println(fbdo.errorReason());
    }

    tim = millis();

  }

}

void createTimeJSON() {
  timeClient.update();
  unsigned long epochTime = timeClient.getEpochTime();

  String formattedTime = timeClient.getFormattedTime();
  json0.set("time", formattedTime);

  String weekDay = weekDays[timeClient.getDay()];
  json0.set("day", weekDay);

  //Get a time structure
  struct tm * ptm = gmtime((time_t * ) & epochTime);

  int monthDay = ptm -> tm_mday;
  int currentMonth = ptm -> tm_mon + 1;
  int currentYear = ptm -> tm_year + 1900;
  String currentDate = String(currentYear) + "-" + String(currentMonth) + "-" + String(monthDay);
  json0.set("date", currentDate);
}
