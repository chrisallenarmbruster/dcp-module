function getEvents(jsonString) {
  let jsonObj = JSON.parse(jsonString);
  let eventsArray = [];

  function findEvents(obj, hostInfo, objectPath = []) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === "events") {
          for (let eventKey in obj[key]) {
            // Extract only the direct properties of the host, excluding child objects
            let hostProperties = Object.keys(hostInfo)
              .filter((k) => typeof hostInfo[k] !== "object")
              .reduce((res, key) => ((res[key] = hostInfo[key]), res), {});

            let eventObj = {
              [eventKey]: {
                ...obj[key][eventKey],
                host: hostProperties,
                objectPath: objectPath.join("."),
              },
            };
            eventsArray.push(eventObj);
          }
        } else if (typeof obj[key] === "object" && key !== "objects") {
          let newPath = [...objectPath, key];
          findEvents(obj[key], hostInfo, newPath);
        }
      }
    }
  }

  // Assuming there is always one host under DCP.data
  const hostInfo = jsonObj.DCP.data.host;
  findEvents(hostInfo.objects ? hostInfo.objects : {}, hostInfo);
  return eventsArray;
}

// Usage with a JSON string
const jsonString = `{
"DCP": {
  "version": "1.0",
  "data": {
    "host": {
      "make": "Espressif",
      "model": "ESP32-DevKitC-32",
      "mac": "D4:8A:FC:CE:F9:C8",
      "ip": "192.169.1.110",
      "objects": {
        "bus1":{
          "temperature_sensor_1": {
            "events": {
              "temperature_reading": {
                "floatValue": -32.45161290322581,
                "value": "-32.45",
                "valueUnit": "fahrenheit"
              },
              "humidity_reading": {
                "floatValue": -32.45161290322581,
                "value": "-32.45",
                "valueUnit": "fahrenheit"
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
        "bus2":{
          "temperature_sensor_1": {
            "events": {
              "temperature_reading": {
                "floatValue": -32.45161290322581,
                "value": "-32.45",
                "valueUnit": "fahrenheit"
              },
              "humidity_reading": {
                "floatValue": -32.45161290322581,
                "value": "-32.45",
                "valueUnit": "fahrenheit"
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
    }
  }
}
}`;

const events = getEvents(jsonString);
console.log(JSON.stringify(events, null, 2));
