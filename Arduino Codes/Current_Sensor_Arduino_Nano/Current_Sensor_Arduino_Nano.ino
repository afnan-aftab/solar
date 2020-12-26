float  Sensitivity = 0.195 ;  // sensitivity in Volts / Amp for 5A sensor

void  setup ( )  {
  
  Serial . begin ( 9600 ) ; 
}

void  loop ( )  {
  float  I = ((getVpp()/sqrt(2))-2.5)/Sensitivity;
  Serial. print ( "Current:" ) ; 
  Serial . println ( I , 3 ) ;     
}

float get_voltage(int n_samples){
  float voltagesensor;
  float current = 0;
  for(int i=0;i<n_samples;i++)
  {
    voltagesensor = analogRead(A0);
    current += voltagesensor;
    }
    return (current/n_samples);
  }
float getVpp(){
  float result;
  int readValue;             //value read from the sensor
  int maxValue = 0;          // store max value here
  int minValue = 1024;          // store min value here
  
   uint32_t start_time = millis();
   while((millis()-start_time) < 3000) //sample for 1 Sec
   {
       readValue = get_voltage(200);
       // see if you have a new maxValue
       if (readValue > maxValue) 
       {
           /*record the maximum sensor value*/
           maxValue = readValue;
       }
       if (readValue < minValue) 
       {
           /*record the minimum sensor value*/
           minValue = readValue;
       }
   }
   
   // Subtract min from max
   result = ((maxValue - minValue) * 5.0)/1023.0;
      
   return result;
 }
