int val=LOW;
void setup() {
  pinMode(4, OUTPUT);
  pinMode(5, INPUT);
}  
  
void loop(){
  val = digitalRead(5);
  digitalWrite(4,val);
  //Digital pin 5 should not be left open otherwise it may read either LOW or HIGH
}
