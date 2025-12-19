#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Pin definitions
#define TDS_PIN 34
#define TURBIDITY_PIN 35
#define FLOW_PIN 25
#define ONE_WIRE_BUS 4  // DS18B20 temperature sensor

// Sensor objects
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

volatile int pulseCount = 0;
float totalLitersToday = 0.0;

// Replace with your computer's IP address
String serverURL = "http://192.168.1.100:5000/api/sensor-data";  // Change IP to your PC's IP

const char* ssid = "moto g32_4790";
const char* password = "mukundha";

void IRAM_ATTR pulseCounter() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);
  Serial.println("Smart Water Monitoring System Starting...");

  // Initialize sensors
  pinMode(TDS_PIN, INPUT);
  pinMode(TURBIDITY_PIN, INPUT);
  pinMode(FLOW_PIN, INPUT_PULLUP);

  // Initialize temperature sensor
  sensors.begin();

  // Attach interrupt for flow sensor
  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), pulseCounter, RISING);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Configure NTP for accurate time
  configTime(19800, 0, "pool.ntp.org", "time.nist.gov");  // IST offset (5.5 hours)
  Serial.println("NTP configured for accurate time synchronization");
}

void loop() {
  // Read TDS sensor
  int tdsRaw = analogRead(TDS_PIN);
  float tdsValue = (tdsRaw / 4095.0) * 1000.0;  // Convert to ppm

  // Read turbidity sensor - adjust formula based on your sensor
  int turbidityRaw = analogRead(TURBIDITY_PIN);
  // Try different formulas - uncomment the one that works for your sensor
  // float turbidityValue = (turbidityRaw / 4095.0) * 100.0;  // Simple percentage
  float turbidityValue = map(turbidityRaw, 0, 4095, 3000, 0) / 100.0;  // Inverted scale
  // float turbidityValue = turbidityRaw / 40.95;  // Direct conversion

  // Read temperature sensor
  sensors.requestTemperatures();
  float temperatureValue = sensors.getTempCByIndex(0);
  if (temperatureValue == DEVICE_DISCONNECTED_C || temperatureValue < -50 || temperatureValue > 100) {
    temperatureValue = 25.0;  // Default temperature if sensor fails
    Serial.println("Temperature sensor error - using default value");
  }

  // Read flow sensor
  pulseCount = 0;
  delay(1000);  // Measure for 1 second
  float flowRate = pulseCount * 7.5;  // YF-S201 formula: pulses per second * 7.5 = L/min

  // Accumulate total liters
  totalLitersToday += (flowRate / 60.0);  // Convert L/min to L/sec and accumulate

  // Improved daily reset logic - reset at midnight based on actual time
  static int lastResetDay = -1;
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    int currentDay = timeinfo.tm_mday;
    if (lastResetDay != currentDay && timeinfo.tm_hour == 0 && timeinfo.tm_min == 0) {
      // Reset at midnight (00:00)
      totalLitersToday = 0.0;
      lastResetDay = currentDay;
      Serial.println("Daily usage reset at midnight");
    }
  } else {
    // Fallback to millis-based reset if NTP time is not available
    static unsigned long lastResetMillis = 0;
    if (millis() - lastResetMillis > 86400000UL) {  // 24 hours
      totalLitersToday = 0.0;
      lastResetMillis = millis();
      Serial.println("Daily usage reset (fallback method)");
    }
  }

  // Print raw and calculated readings to Serial for debugging
  Serial.println("=== Sensor Readings (Raw + Calculated) ===");
  Serial.print("TDS Raw: "); Serial.print(tdsRaw); Serial.print(" -> "); Serial.print(tdsValue); Serial.println(" ppm");
  Serial.print("Turbidity Raw: "); Serial.print(turbidityRaw); Serial.print(" -> "); Serial.print(turbidityValue); Serial.println(" NTU");
  Serial.print("Temperature: "); Serial.print(temperatureValue); Serial.println(" °C");
  Serial.print("Flow Pulses: "); Serial.print(pulseCount); Serial.print(" -> "); Serial.print(flowRate); Serial.println(" L/min");
  Serial.print("Total Today: "); Serial.print(totalLitersToday); Serial.println(" L");
  Serial.println();

  // Send data to server
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    // Create JSON payload matching backend API
    String payload = "{";
    payload += "\"device_id\":\"esp32_real_01\",";
    payload += "\"flow_lpm\":" + String(flowRate, 2) + ",";
    payload += "\"tds_ppm\":" + String(tdsValue, 1) + ",";
    payload += "\"turbidity\":" + String(turbidityValue, 1) + ",";
    payload += "\"temperature_c\":" + String(temperatureValue, 1) + ",";
    payload += "\"total_liters_today\":" + String(totalLitersToday, 2);
    payload += "}";

    Serial.print("Sending payload: ");
    Serial.println(payload);

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("WiFi Disconnected!");
  }

  delay(2000);  // Send data every 2 seconds
}
