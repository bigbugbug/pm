var Email = require ('./mailer.js');

module.exports = {

	
	parseA5Status : function ( inString, cb)
	{
	var pmSysStatus_t = [
	   "Disarmed", "Home Exit Delay", "Away Exit Delay", "Entry Delay", "Armed Home", "Armed Away", "User Test",
	   "Downloading", "Programming", "Installer", "Home Bypass", "Away Bypass", "Ready", "Not Ready", "??", "??", 
	   "Disarmed Instant", "Home Instant Exit Delay", "Away Instant Exit Delay", "Entry Delay Instant", "Armed Home Instant", 
	   "Armed Away Instant"];

	var  pmEventType_t = [
	   "None", "Tamper Alarm", "Tamper Restore", "Open", "Closed", "Violated (Motion)", "Panic Alarm", "RF Jamming",
	   "Tamper Open", "Communication Failure", "Line Failure", "Fuse", "Not Active", "Low Battery", "AC Failure", 
	   "Fire Alarm", "Emergency", "Siren Tamper", "Siren Tamper Restore", "Siren Low Battery", "Siren AC Fail"];
	   
	var pmSysStatusFlags_t = [ 
	   "Ready", "Alert in memory", "Trouble", "Bypass on", "Last 10 seconds", "Zone event", "Status changed", "Alarm event"
	];
	   
	console.log('in parseA5Status in='+inString);
	var outMsg = "";
	var byteCode = inString.split(" "); // split to byte code with space as deliminter
	var eventType = byteCode[3];
//   d a5 0 4 0 26 13 5 0 0 0 0 43 d4 a 23
	// parse a5 04 status
	// Byte 3 indicates the system status (See appendix A)
	// Byte 4 contains the system state flags (See appendix B)
	//  Byte 5 indicates the zone triggering the event (only when bit 5 of Byte 4 is set)
	//  Byte 6 indicates the type of zone event (only when bit 5 of Byte 4 is set). A complete list can be found in appendix D.

		if ( eventType== '4')   // 
		{
			var pmSysStatus = pmSysStatus_t[parseInt(byteCode[4])]; // 0
			var sysFlags = parseInt(byteCode[5]);  // 010,0110
			var eventZone = parseInt(byteCode[6]); // 0b0001,0011
			var zoneTypeMsg = pmEventType_t[parseInt(byteCode[7])];  // 5
			var X10Stat1 = parseInt(byteCode[10]); // 
			var X10Stat2 = parseInt(byteCode[11]);
	// parse byte 4		
			var pmSysStatusFlags = "";
			for (i = 0 ; i < 7; ++i)
			{
				if (sysFlags  & (0x1 << i)) {
					pmSysStatusFlags += pmSysStatusFlags_t[i]+ ",";
				}
			}
	// parse byte 5
	/* luu code
	  if (zoneEType ~= 0x00) then
			 debug(string.format("Event %s in Zone %02d", (pmEventType_t[pmLang][zoneEType+1] or "UNKNOWN"), eventZone))
			 local sensor = pmSensorDev_t[eventZone]
			 if (sensor == nil) then
				debug(string.format("unable to locate zone device %02d", eventZone))
			 else
				--pmMessage(sensor['zname'] .. " tripped", 2)
				local child = sensor['id']
				if (zoneEType == 0x03) then
				   updateIfNeeded(SECURITY_SID, "Tripped", 1, child) -- prevent updating twice; status msg comes before event msg
				   luup.variable_set(SECURITY_SID, "LastTrip", os.time(), child)
				elseif (zoneEType == 0x04) then
				   updateIfNeeded(SECURITY_SID, "Tripped", 0, child)
				elseif (zoneEType == 0x05) then
				   if (updateIfNeeded(SECURITY_SID, "Tripped", 1, child) == true) then
					  luup.variable_set(SECURITY_SID, "LastTrip", os.time(), child)
				   end
				end
			 end                    
		  end
	*/	  
			if ((sysFlags & 0x10) > 0)
			{
				pmSysStatusFlags += " triggered by "+ eventZone;
			}
		
	/*
		  -- update status of PGM & X10 devices
		  local s
		  local x10Status = x10Stat1 + (x10Stat2 ^ 8)
		  for i = 0, 15 do
			 if (i == 0) then
				s = "PGM"
			 else
				s = string.format("X%02d", i)
			 end
			 child = findChild(pmPanelDev, s)
			 if (child ~= nil) then
				local status = bitw.band(x10Status, 2 ^ i) > 0 and 1 or 0
				if (updateIfNeeded(X10DEVICE_SID, "Status", status, child) == true) then
				   debug("Updating status of X10 device " .. s .. " (status = " .. status .. ")")
				end
			 end
		  end	
	*/
	//		console.log('pmSysStatus ='+pmSysStatus + ', pmSysStatusFlags='+pmSysStatusFlags + ", zone="+zoneTypeMsg);
			outMsg ='STA:'+pmSysStatus + ', pmSysStatusFlags='+pmSysStatusFlags + ", zone="+zoneTypeMsg;
//			var em = new Email();
//			em.sendEmail("Alarm Status",outMsg);
		}
		else		
			outMsg = 'LOG:'+inString;
		cb(outMsg);
	}
};