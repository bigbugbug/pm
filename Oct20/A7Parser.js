var Email = require ('./mailer.js');

module.exports = {

	parseA7Status : function ( inString, cb)
	{
	var pmLogEvent_t = [ 
   "None", "Interior Alarm", "Perimeter Alarm", "Delay Alarm", "24h Silent Alarm", "24h Audible Alarm",
   "Tamper", "Control Panel Tamper", "Tamper Alarm", "Tamper Alarm", "Communication Loss", "Panic From Keyfob",
   "Panic From Control Panel", "Duress", "Confirm Alarm", "General Trouble", "General Trouble Restore", 
   "Interior Restore", "Perimeter Restore", "Delay Restore", "24h Silent Restore", "24h Audible Restore",
   "Tamper Restore", "Control Panel Tamper Restore", "Tamper Restore", "Tamper Restore", "Communication Restore",
   "Cancel Alarm", "General Restore", "Trouble Restore", "Not used", "Recent Close", "Fire", "Fire Restore", 
   "No Active", "Emergency", "No used", "Disarm Latchkey", "Panic Restore", "Supervision (Inactive)",
   "Supervision Restore (Active)", "Low Battery", "Low Battery Restore", "AC Fail", "AC Restore",
   "Control Panel Low Battery", "Control Panel Low Battery Restore", "RF Jamming", "RF Jamming Restore",
   "Communications Failure", "Communications Restore", "Telephone Line Failure", "Telephone Line Restore",
   "Auto Test", "Fuse Failure", "Fuse Restore", "Keyfob Low Battery", "Keyfob Low Battery Restore", "Engineer Reset",
   "Battery Disconnect", "1-Way Keypad Low Battery", "1-Way Keypad Low Battery Restore", "1-Way Keypad Inactive",
   "1-Way Keypad Restore Active", "Low Battery", "Clean Me", "Fire Trouble", "Low Battery", "Battery Restore",
   "AC Fail", "AC Restore", "Supervision (Inactive)", "Supervision Restore (Active)", "Gas Alert", "Gas Alert Restore",
   "Gas Trouble", "Gas Trouble Restore", "Flood Alert", "Flood Alert Restore", "X-10 Trouble", "X-10 Trouble Restore",
   "Arm Home", "Arm Away", "Quick Arm Home", "Quick Arm Away", "Disarm", "Fail To Auto-Arm", "Enter To Test Mode",
   "Exit From Test Mode", "Force Arm", "Auto Arm", "Instant Arm", "Bypass", "Fail To Arm", "Door Open",
   "Communication Established By Control Panel", "System Reset", "Installer Programming", "Wrong Password",
   "Not Sys Event", "Not Sys Event", "Extreme Hot Alert", "Extreme Hot Alert Restore", "Freeze Alert", 
   "Freeze Alert Restore", "Human Cold Alert", "Human Cold Alert Restore", "Human Hot Alert",
   "Human Hot Alert Restore", "Temperature Sensor Trouble", "Temperature Sensor Trouble Restore",
   "PIR Mask", "PIR Mask Restore", "", "", "", "", "", "", "", "", "", "",
   "Alarmed", "Restore", "Alarmed", "Restore", "", "", "", "", "", "", "", "", "", "",
   "", "", "", "", "", "Exit Installer", "Enter Installer", "", "", "", "", ""
	];
	
	var pmLogUser_t = [
   "System ", "Front Door", "Garage", "Garage Door", "Back Door", "Zone 05", "Zone 06", "Zone 07", "Zone 08",
   "Zone 09", "Living Room", "Zone 11", "Zone 12", "Zone 13", "Zone 14", "Zone 15", "Zone 16", "Zone 17", "Zone 18",
   "Basement", "Zone 20", "Zone 21", "Zone 22", "Zone 23", "Zone 24", "Zone 25", "Zone 26", "Zone 27", "Zone 28", 
   "Zone 29", "Zone 30", "Fob  01", "Fob  02", "Fob  03", "Fob  04", "Fob  05", "Fob  06", "Fob  07", "Fob  08", 
   "User 01", "User 02", "User 03", "User 04", "User 05", "User 06", "User 07", "User 08", "Pad  01", "Pad  02",
   "Pad  03", "Pad  04", "Pad  05", "Pad  06", "Pad  07", "Pad  08", "Sir  01", "Sir  02", "2Pad 01", "2Pad 02",
   "2Pad 03", "2Pad 04", "X10  01", "X10  02", "X10  03", "X10  04", "X10  05", "X10  06", "X10  07", "X10  08",
   "X10  09", "X10  10", "X10  11", "X10  12", "X10  13", "X10  14", "X10  15", "PGM    ", "GSM    ", "P-LINK ",
   "PTag 01", "PTag 02", "PTag 03", "PTag 04", "PTag 05", "PTag 06", "PTag 07", "PTag 08" 
	];
	
	var pmPanelAlarmType_t = { 0x01: "Intruder", 0x02: "Intruder",  0x03:"Intruder" ,  0x04: "Intruder" ,  
	0x05: "Intruder" ,  0x06: "Tamper" , 0x07: "Tamper" ,  0x08: "Tamper" ,  0x09: "Tamper" ,  
	0x0B: "Panic" ,  0x0C: "Panic" ,  0x20: "Fire" , 0x23: "Emergency" ,  0x49: "Gas" ,  0x4D: "Flood",
	0x0A: "Communication",  0x0F: "General",  0x29: "Battery",  0x2B: "Power",  0x2D: "Battery",  0x2F: "Jamming", 
    0x31: "Communication",  0x33: "Telephone",  0x36: "Power",  0x38: "Battery",  0x3B: "Battery",  0x3C: "Battery",
    0x40: "Battery",  0x43: "Battery" };
	
// d a7 2 0 27 1f 13 2 10 0 0 0 43 a7 a 23	
	var byteCode = inString.split(" "); // split to byte code with space as deliminter	   
//   local i
	var i;
//   local msgCnt = string.byte(pmIncomingPdu, 3)
//console.log("inString="+inString);
	var msgCnt = parseInt(byteCode[2]);
//console.log("msgCnt="+msgCnt);
//    for i = 1, msgCnt do
	for (i=0;i<msgCnt;++i)
		{
	//      local eventZone = string.byte(pmIncomingPdu, 3 + 2 * i)
			var eventZone = parseInt(byteCode[4+i*2],16);
//console.log("eventZone="+eventZone);			
	//      local logEvent  = string.byte(pmIncomingPdu, 4 + 2 * i)
			var logEvent = parseInt(byteCode[ 5+i*2],16);
//console.log("logEvent="+logEvent);			
	//      local eventType = bitw.band(logEvent, 0x7F)
			var eventType = parseInt(logEvent) & 0x7f;
//console.log("eventType="+eventType);			
	//      local s = pmLogEvent_t[eventType + 1] + " / " + (pmLogUser_t[eventZone + 1];
			var s = pmLogEvent_t[eventType + 1] + " / " + pmLogUser_t[eventZone ];
	//      debug("System message: " .. s)
			console.log("System message "+s);
	//      local alarmStatus = pmPanelAlarmType_t[eventType] or "None"
			var alarmStatus = pmPanelAlarmType_t[eventType];
		}	
	   	outMsg ='STA:'+s + ', alarmStatus='+alarmStatus;
//			var em = new Email();
//			em.sendEmail("Alarm Status",outMsg);
		cb(outMsg);
	}
};