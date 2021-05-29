// Master Node
// By: Muhammad Afnan Aftab
#include <ESP8266WiFi.h>

#include <FirebaseESP8266.h>

#include <SPI.h>

#include <nRF24L01.h>

#include <RF24.h>

#include <NTPClient.h>

#include <WiFiUdp.h>

RF24 radio(D4, D2); // CE, CSN

uint64_t addresses[6] = {0x7878787878LL,
                       0xB3B4B5B6F1LL,
                      };

/*const byte addresses[][6] = {
  "00001",
  "00002"
}; //Setting the two addresses. One for transmitting and one for receiving
*/
//======WiFi Credentials
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

float appl_data[3] = {
  0,
  0,
  0
}; //{node, state, data}

bool switch_packet[3] = {
  LOW,
  LOW,
  HIGH
}; //{node, purpose, state}

bool report;
unsigned long tim;
unsigned long period = 5000*4;
bool nodeTurn = LOW;
bool newData = LOW;
bool nodeState[2] = {
  LOW,
  LOW
};

void setup() {
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

  delay(10);

  if (!radio.begin()) {
    Serial.println(F("radio hardware is not responding!!"));
    while (1) {} // hold in infinite loop
  }
  radio.maskIRQ(1, 1, 0);
  //radio.openWritingPipe(addresses[1]);      //send the data to 00001 & 00004
  //radio.openWritingPipe(addresses[0]);
  radio.openReadingPipe(1, addresses[1]); //receive the data from 00002
  radio.openReadingPipe(0, addresses[0]); //receive the data from 00001
  radio.setPALevel(RF24_PA_MIN); //You can set it as minimum or maximum depending on the distance between the transmitter and receiver.
  radio.startListening();
  attachInterrupt(digitalPinToInterrupt(5), DataRecieve, FALLING);
  tim = millis();
  delay(10);

}

void loop() {

  statusCheck();
  updateDatabase();
  dataCheck(period);

}

ICACHE_RAM_ATTR void DataRecieve() {
  Serial.print("Interrupt fired! Master Node");
  uint8_t pipe;
  while (!radio.available( & pipe)) {}
  radio.read( & appl_data, sizeof(appl_data));
  Serial.println(" -> Reception Successful");
  Serial.print("Node: ");
  Serial.println(appl_data[0]);
  Serial.print("State:");
  Serial.println(appl_data[1]);
  Serial.print("Data:");
  Serial.println(appl_data[2]);

  newData = HIGH;

  

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

void updateDatabase() {

  if (newData == HIGH) {

    json1.set("power", appl_data[2]);
    json1.set("status", appl_data[1]);
    createTimeJSON();
    json1.set("timestamp", json0);

    if (appl_data[0] == LOW) {
      if (Firebase.pushJSON(fbdo, "/Appl1_data", json1)) {

        Serial.println("Appliance 1 Updated");

      } else {
        Serial.println(fbdo.errorReason());
      }
    } else if (appl_data[0] == HIGH) {
      if (Firebase.pushJSON(fbdo, "/Appl2_data", json1)) {

        Serial.println("Appliance 2 Updated");

      } else {
        Serial.println(fbdo.errorReason());
      }
    }

    newData = LOW;
  }

}

void dataCheck(unsigned long a) {

  if (millis() - tim > a) {
    radio.stopListening();
      if(nodeTurn==LOW){
        radio.openWritingPipe(addresses[0]);
      }else{
        radio.openWritingPipe(addresses[1]);
      }
      
      switch_packet[0] = nodeTurn;
      switch_packet[1] = LOW;
      radio.setRetries(2,3);
      report = radio.write( & switch_packet, sizeof(switch_packet));
      if (!report) {
        Serial.println("Failed! Transmission");
      } else {
        Serial.println(" -> Transmission Successful");
        Serial.print("Node: ");
        Serial.println(switch_packet[0]);
        Serial.print("Purpose:");
        Serial.println(switch_packet[1]);
        Serial.print("State:");
        Serial.println("LOL XD");
      }
    nodeTurn=!nodeTurn;
    radio.startListening();
    tim = millis();
  }

}

void statusCheck() {
  for (int n = 0; n < 2; n++) {

    String path = "/Appl" + String(n + 1) + "/status";
    if (Firebase.getBool(fbdo, path)) {
      bool data = fbdo.boolData();
      Serial.println(data);
      if (data != nodeState[n]) {
        radio.stopListening();
        radio.openWritingPipe(addresses[n]);
        switch_packet[0] = n;
        switch_packet[1] = HIGH;
        switch_packet[2] = data;
        radio.setRetries(2,3);
        report = radio.write( & switch_packet, sizeof(switch_packet));
        if (!report) {
          Serial.println("Failed! Transmission");
        } else {

          nodeState[n] = data;
          Serial.print("Node: ");
          Serial.println(switch_packet[0]);
          Serial.print("State:");
          Serial.println(nodeState[n]);
          Serial.println("Switched!");
        }

        radio.startListening();
      }
    } else {
      Serial.println(fbdo.errorReason());
    }
  }
}
