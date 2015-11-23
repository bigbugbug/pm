var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://192.168.1.50');
 
client.on('connect', function () {
    client.subscribe('/test');
    client.publish('/test', 'Hello mqtt');
});
 
client.on('message', function (topic, message) {
  // message is Buffer
    console.log(message.toString());
    client.end();
});
