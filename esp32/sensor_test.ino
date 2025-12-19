// Basic Sensor Test Sketch - No external libraries required
// Test TDS, Turbidity, and Flow sensors

#define TDS_PIN 34
#define TURBIDITY_PIN 35
#define FLOW_PIN 25

volatile int pulseCount = 0;

void IRAM_ATTR pulseCounter() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);
  Serial.println("=== Basic Sensor Test Starting ===");
  Serial.println("Testing: TDS (Pin 34), Turbidity (Pin 35), Flow (Pin 25)");

  pinMode(TDS_PIN, INPUT);
  pinMode(TURBIDITY_PIN, INPUT);
  pinMode(FLOW_PIN, INPUT_PULLUP);

  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), pulseCounter, RISING);

  Serial.println("Pins configured. Starting sensor readings...");
  Serial.println("Expected ranges:");
  Serial.println("- TDS: 0-4095 (higher in conductive water)");
  Serial.println("- Turbidity: 0-4095 (higher in cloudy water)");
  Serial.println("- Flow: pulse count when water flows");
}

void loop() {
  Serial.println("\n=== Sensor Readings ===");

  // Test TDS sensor
  int tdsRaw = analogRead(TDS_PIN);
  Serial.print("TDS Raw: ");
  Serial.print(tdsRaw);
  if (tdsRaw == 0) {
    Serial.println(" ⚠️  Check TDS sensor wiring!");
  } else {
    Serial.println(" ✓ Connected");
  }

  // Test Turbidity sensor
  int turbidityRaw = analogRead(TURBIDITY_PIN);
  Serial.print("Turbidity Raw: ");
  Serial.print(turbidityRaw);
  if (turbidityRaw == 0) {
    Serial.println(" ⚠️  Check turbidity sensor wiring!");
  } else {
    Serial.println(" ✓ Connected");
  }

  // Test Flow sensor (count pulses for 1 second)
  pulseCount = 0;
  delay(1000);
  Serial.print("Flow Pulses (1 sec): ");
  Serial.print(pulseCount);
  if (pulseCount == 0) {
    Serial.println(" ⚠️  No pulses - check flow sensor or run water through it");
  } else {
    Serial.println(" ✓ Flow detected");
  }

  Serial.println("Note: Temperature sensor (DS18B20) requires OneWire library");
  Serial.println("Install it via: Sketch > Include Library > Manage Libraries > Search 'OneWire'");

  delay(3000);
}
