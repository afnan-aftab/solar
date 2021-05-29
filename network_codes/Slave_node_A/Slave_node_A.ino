// Slave Node A
// By: Muhammad Afnan Aftab
#include <SPI.h>

#include <nRF24L01.h>

#include <RF24.h>

#include "ACS712.h"

ACS712 sensor(ACS712_05B, A1);

RF24 radio(7, 8); // CE, CSN

uint64_t addresses[6] = {0x7878787878LL,
                       0xB3B4B5B6F1LL,
                      };

/*const byte addresses[][6] = {
  "00001",
  "00002"
}; //Setting the two addresses. One for transmitting and one for receiving
*/


/*struct appl_sensor_data
{
  bool state;
  float data;
} appl_data;*/

float appl_data[3] = {
  0,
  0,
  0
}; //{node, state, data}
bool switch_packet[3] = {
  0,
  0,
  0
}; //{node, purpose, state}

/*struct appl_switch_data
{
  int node;
  bool purpose;
  bool state;
} switch_packet;*/

int appl_control = 6;
bool incoming = LOW;
bool appl_state = LOW;

float j = 0;

bool report;

void setup() {
  Serial.begin(9600);
  delay(10);

  sensor.setZeroPoint(511);

  pinMode(appl_control, OUTPUT);

  if (!radio.begin()) {
    Serial.println(F("radio hardware is not responding!!"));
    while (1) {} // hold in infinite loop
  }
  radio.maskIRQ(1, 1, 0);
  radio.openWritingPipe(addresses[0]); //send the data to 00001
  radio.openReadingPipe(0, addresses[0]); //receive the data from 00001
  radio.setPALevel(RF24_PA_MIN); //You can set it as minimum or maximum depending on the distance between the transmitter and receiver.
  //radio.stopListening();
  radio.startListening();
  attachInterrupt(1, RadioTransmissionHandling, FALLING);
  //sleep_enable();
  //set_sleep_mode(SLEEP_MODE_PWR_DOWN);

  delay(500);
  //sleep_cpu();
}

void loop() {

}

void RadioTransmissionHandling() {
  Serial.println("Interrupt fired! Slave Node A");
  uint8_t pipe;
  while (!radio.available( & pipe)) {}
  radio.read( & switch_packet, sizeof(switch_packet));
  Serial.println(" -> Reception Successful");
  Serial.print("Node: ");
  Serial.println(switch_packet[0]);
  Serial.print("Purpose:");
  Serial.println(switch_packet[1]);
  Serial.print("State:");
  Serial.println(switch_packet[2]);

  if (switch_packet[0] == LOW) {
    if (switch_packet[1] == HIGH) //switch node
    {
      Serial.println("Switching Appliance");
      bool temp = switch_packet[2];
      digitalWrite(appl_control, temp);
      appl_state = digitalRead(appl_control);
      Serial.print("Appliance status: ");
      Serial.println(appl_state);
    } else if (switch_packet[1] == LOW) {
      Serial.println("Sending Data");
      radio.stopListening();

      appl_data[0] = LOW;
      appl_data[1] = digitalRead(appl_control);
      if(appl_data[1]==HIGH){
        float sum = 0;
        int samples = 100;
        for(int t = 0;t<samples;t++){
          float x = getPower();
          sum = sum + x;         
        }
        j = sum/samples;
      }else{
        j = 0;
      }
      appl_data[2] = j;

      radio.setRetries(2,3);
      report = radio.write( & appl_data, sizeof(appl_data));
      if (!report) {
        //report = radio.write(&appl_data, sizeof(appl_data));
        Serial.println("Failed! Try Again.");
      } else {
        Serial.println("Transmission Successful: ");
        Serial.print("Node:");
        Serial.println(appl_data[0]);
        Serial.print("State:");
        Serial.println(appl_data[1]);
        Serial.print("Power:");
        Serial.println(appl_data[2]);
      }
      radio.startListening();
    } else {
      Serial.println("Corrupt Packet Recieved");
    }
  }

}

float getPower(){
  // We use 230V because it is the common standard in European countries
  // Change to your local, if necessary
  float U = 230;

  // To measure current we need to know the frequency of current
  // By default 50Hz is used, but you can specify own, if necessary
  float I = sensor.getCurrentAC();

  // To calculate the power we need voltage multiplied by current
  float P = U * I;
  return P;
}
