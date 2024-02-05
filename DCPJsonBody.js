class DCPJsonBody {
  constructor(rawBody) {
    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (error) {
      throw new Error("Invalid JSON string provided");
    }

    this.DCP = parsedBody && parsedBody.DCP ? parsedBody.DCP : {};

    if (this.DCP.host) {
      this.host = this.DCP.host;

      if (this.host.data) {
        this.data = this.host.data;
      }

      if (this.host.ObjectModel) {
        this.objectModel = this.host.ObjectModel;
      }
    }

    if (this.DCP.version) {
      this.version = this.DCP.version;
    }
  }

  getEvents() {
    let eventsArray = [];

    const findEvents = (obj, hostInfo, objectPath = []) => {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (key === "events") {
            for (let eventKey in obj[key]) {
              // Extract non-object properties of hostInfo
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
    };

    if (this.data) {
      const hostInfo = this.DCP.host;
      findEvents(this.data.objects ? this.data.objects : {}, this.host);
    }

    return eventsArray;
  }
}

module.exports = DCPJsonBody;
