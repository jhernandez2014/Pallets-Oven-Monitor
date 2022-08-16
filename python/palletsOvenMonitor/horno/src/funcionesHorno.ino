int timer(unsigned long initTime, unsigned long retraso) {
  unsigned long milliSec = millis();
  if ((milliSec - initTime) >= (retraso)) {
    Serial.println("timer expired");
    return 1;
  }
  return 0;
}

int guardar_lectura(MAX31865_RTD *sensor, double *array_lecturas){
    if (sensor->status() == 0) {
      double temperature = sensor->temperature();
      *array_lecturas = temperature;
      Serial.println("===========================");
      Serial.print("[RTD]:");
      Serial.print(" T = ");
      Serial.print(temperature, 1);
      Serial.println(" deg C");
    } else {
      Serial.print("[sensor]:");
      Serial.print("RTD fault register: ");
      Serial.print(sensor->status());
      Serial.print(": ");
      if (sensor->status() & MAX31865_FAULT_HIGH_THRESHOLD) {
        Serial.println("RTD high threshold exceeded");
    } else if (sensor->status() & MAX31865_FAULT_LOW_THRESHOLD) {
        Serial.println("RTD low threshold exceeded");
    } else if (sensor->status() & MAX31865_FAULT_REFIN) {
        Serial.println("REFIN- > 0.85 x V_BIAS");
    } else if (sensor->status() & MAX31865_FAULT_REFIN_FORCE) {
        Serial.println("REFIN- < 0.85 x V_BIAS, FORCE- open");
    } else if (sensor->status() & MAX31865_FAULT_RTDIN_FORCE) {
        Serial.println("RTDIN- < 0.85 x V_BIAS, FORCE- open");
    } else if (sensor->status() & MAX31865_FAULT_VOLTAGE) {
        Serial.println("Overvoltage/undervoltage fault");
      } else {
        Serial.println("Unknown fault; check connection");
      }
    }

}
