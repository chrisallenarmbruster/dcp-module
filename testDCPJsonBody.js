const DCPJsonBody = require("./DCPJsonBody");

const jsonString = `{
  "DCP": {
    "version": "1.0",
    "host": {
      "make": "Espressif",
      "model": "ESP32-DevKitC-32",
      "mac": "D4:8A:FC:CE:F9:C8",
      "ip": "192.169.1.110",
      "data": {
        "objects": {
          "bus1": {
            "temperature_sensor_1": {
              "events": {
                "temperature_reading": {
                  "floatValue": -32.45161290322581,
                  "value": "-32.45",
                  "valueUnit": "fahrenheit"
                },
                "humidity_reading": {
                  "floatValue": 50.0,
                  "value": "50%",
                  "valueUnit": "percent"
                }
              }
            },
            "temperature_sensor_2": {
              "events": {
                "temperature_reading": {
                  "floatValue": -32.45161290322581,
                  "value": "-32.45",
                  "valueUnit": "fahrenheit"
                }
              }
            }
          },
          "bus2": {
            "temperature_sensor_1": {
              "events": {
                "temperature_reading": {
                  "floatValue": -32.45161290322581,
                  "value": "-32.45",
                  "valueUnit": "fahrenheit"
                },
                "humidity_reading": {
                  "floatValue": 50.0,
                  "value": "50%",
                  "valueUnit": "percent"
                }
              }
            },
            "temperature_sensor_2": {
              "events": {
                "temperature_reading": {
                  "floatValue": -32.45161290322581,
                  "value": "-32.45",
                  "valueUnit": "fahrenheit"
                }
              }
            }
          }
        }
      },
      "objectModel": {}
    }
  }
}`;

try {
  let dcpJsonBody = new DCPJsonBody(jsonString);
  let events = dcpJsonBody.getEvents();
  console.log(JSON.stringify(events, null, 2));
  console.log(dcpJsonBody.host);
} catch (error) {
  console.error("Error: " + error.message);
}
