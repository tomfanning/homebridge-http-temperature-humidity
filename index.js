var Service, Characteristic;
var request = require("request");

var temperatureService;
var humidityService;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-HttpTemperatureHumidity", "HttpTempHum", HttpTempHum);
}


function HttpTempHum(log, config) {
    this.log = log;

    // url info
    this.url = config["temp_url"];
    this.http_method = config["http_method"];
    this.sendimmediately = config["sendimmediately"];
    this.name = config["name"];
}

HttpTempHum.prototype = {
   
    httpRequest: function(u, body, method, username, password, sendimmediately, callback) {
        //this.log(u);
        request({
          url: u,
          body: body,
          method: method,
        },
        function(error, response, body) {
          callback(error, response, body)
        })
    },

    getState: function (callback) {
        
        var body;

        this.httpRequest(this.url, body, this.http_method, this.username, this.password, this.sendimmediately, function (error, response, responseBody) {
            if (error) {
                this.log('HTTP temperature request failed: %s', error.message);
                callback(error);
            } else {
                this.log('HTTP temperature request succeeded');
                var info = JSON.parse(responseBody);

                temperatureService.setCharacteristic(Characteristic.CurrentTemperature, info.temperature);
                humiditySensor.setCharacteristic(Characteristic.CurrentRelativeHumidity, info.humidity);

                //this.log(response);
                //this.log(responseBody);

                callback();
            }
        }.bind(this));
    },

    identify: function (callback) {
        this.log("Identify requested!");
        callback(); // success
    },

    getServices: function () {
        var informationService = new Service.AccessoryInformation();

        informationService
                .setCharacteristic(Characteristic.Manufacturer, "Luca Manufacturer")
                .setCharacteristic(Characteristic.Model, "Luca Model")
                .setCharacteristic(Characteristic.SerialNumber, "Luca Serial Number");

        temperatureService = new Service.TemperatureSensor(this.name);
        temperatureService
                .getCharacteristic(Characteristic.CurrentTemperature)
                .on('get', this.getState.bind(this));

        humidityService = new Service.HumiditySensor(this.name);
        humidityService
                .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                .on('get', this.getState.bind(this));

        return [temperatureService, humidityService];
    }
};