/* Pusher.js
Server side node.js script that services real-time websocket requests
Allows websocket connections to subscribe and publish to MQTT topics
*/
 
var sys = require('sys');
var net = require('net');
var mqtt = require('mqtt');
var a5Parser = require('./A5Parser');
var a7Parser = require('./A7Parser');

var ReceiveEvent_t = [
   [0x02, "Acknolowdge"],
   [0x06, "Timeout"],
   [0x08, "Denied"],
   [0x0B, "Stop"],
   [0x25, "DownloadRetry"],
   [0x33, "Settings"],
   [0x3C, "Info"],
   [0x3F, "SettingsItem"],
   [0xA0, "Eventlog"],
   [0xA3, "ZoneName"],
   [0xA5, "Status"],
   [0xA6, "ZoneType"],
   [0xA7, "Panel"],
   [0xAB, "Powerlink"],
   [0xB0, "PowerMaster"]];

var pmPanelType_t = [
   [1, "PowerMax"], [2, "PowerMax+"], [3, "PowerMax Pro"], [4, "PowerMax Complete"], [5, "PowerMax Pro Part"],
   [6, "PowerMax Complete Part"], [7, "PowerMax Express"], [8, "PowerMaster10"], [9, "PowerMaster30"]];
   
// create a socket object that listens on port 5000
var io = require('socket.io').listen(5000);
 
// create an mqtt client object and connect to the mqtt broker
var client = mqtt.connect('mqtt://192.168.1.50');
 
 function toHex(str) {
	var hex = '\r\n';
	for(var i=0;i<str.length;i++) {
	hex += '0x'+str.charCodeAtAt(i).toString(16)+' ';
	}
	console.log('2nd char is ='+str.charCodeAt(1));
	return hex;
}

 // set ping every ten seconds 
  var interval = setInterval(function(str1) {
	 client.publish('powerMaxIn','PNG')
//	console.log(str1);
}, 10000, "Ping.");  


io.sockets.on('connection', function (socket) {
    // socket connection indicates what mqtt topic to subscribe to in data.topic
    socket.on('subscribe', function (data) {
        console.log('Subscribing to '+data.topic);
        socket.join(data.topic);
        client.subscribe(data.topic);
    });
    // when socket connection publishes a message, forward that message
    // the the mqtt broker
    socket.on('publish', function (data) {
        console.log('Publishing to '+data.topic);
        client.publish(data.topic,data.payload);
    });
});
 

// listen to messages coming from the mqtt broker
client.on('message', function (topic, payload, packet) {
    console.log(topic+'='+payload);
// console.log(payload.toString().substring(0,3));	
	var alarmCode = "";
	var msg;
	if (payload.toString().substring(0,1) == "d" && topic == "powerMaxOut")
		alarmCode = payload.toString().substring(2,4);
	if (alarmCode == "a5")
	{
		a5Parser.parseA5Status(String(payload), function(msg1) { msg = msg1} );
//		console.log(msg);
		io.sockets.emit('mqtt',{'topic':String(topic),
                            'payload':String(msg)});
	}
	else if (alarmCode == "a7")
	{
		a7Parser.parseA7Status(String(payload), function(msg1) { msg = msg1} );
//		console.log(msg);
		io.sockets.emit('mqtt',{'topic':String(topic),
                            'payload':String(msg)});
	}
 	else if (payload.toString().substring(0,3) == "PNG")
	{
		io.sockets.emit('mqtt',{'topic':String(topic),
                            'text':'ACK:'});
	} 
	else
	{
		io.sockets.emit('mqtt',{'topic':String(topic),
                            'payload':String(payload)});

	}
});
