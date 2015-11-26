var Email = require ('./mailer.js');
global.psStatusID=0;

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
	
	var pmZone_t = [
   "System ", "Front Door", "Garage", "Garage Door", "Back Door", "Child Room", "Office", "Dining Room", "Dining Room",
   "Kitchen", "Living Room1", "Living Room2", "Bed Room1", "Bed Room2", "Guest Room", "Master Bedroom", "Master Bedroom", 
   "Laundry Room", "Master Bedroom",
   "Basement", "Fire", "Fire", "Emergency", "Emergency", "Basement", "Office", "Attic", "Den", "Yard", 
   "Hall", "Utility Room"]
	   
	console.log('in parseA5Status in='+inString);
	var outMsg = "";
	var byteCode = inString.split(" "); // split to byte code with space as deliminter
	var eventType = byteCode[3];
	var em = new Email();	
//   d a5 0 4 0 26 13 5 0 0 0 0 43 d4 a 23
	// parse a5 04 status
	// Byte 3 indicates the system status (See appendix A)
	// Byte 4 contains the system state flags (See appendix B)
	//  Byte 5 indicates the zone triggering the event (only when bit 5 of Byte 4 is set)
	//  Byte 6 indicates the type of zone event (only when bit 5 of Byte 4 is set). A complete list can be found in appendix D.
		if ( eventType == '2' && (byteCode[4] != '0' || byteCode[5] != '0'|| byteCode[6] != '0'|| byteCode[7] != '0'))
		{
			outMsg = "Alarm Sounded. A5";
			
			for (j = 0; j < 3; ++j)
			{
				var code = parseInt(byteCode[j+4]);
				for (i = 0 ; i < 7; ++i)
				{
					if (code  & (0x1 << i)) {
					outMsg += pmZone_t[i+j*8+1]+ ",";
					}
				}
			}
			if (psStatusID == 4 || psStatusID == 5) // only send if it is armed
				em.sendEmail("Alarm",outMsg);	
			
		}
		if ( eventType== '4')   // 
		{
			var psStatus = parseInt(byteCode[4],16);
			var pmSysStatus = pmSysStatus_t[psStatus]; // 0
			var sysFlags = parseInt(byteCode[5],16);  // 010,0110
			var eventZone = parseInt(byteCode[6],16); // 0b0001,0011
			var zoneTypeMsg = pmEventType_t[parseInt(byteCode[7],16)];  // 5
			var X10Stat1 = parseInt(byteCode[10],16); // 
			var X10Stat2 = parseInt(byteCode[11],16);
			if (psStatus != psStatusID)
			{
				psStatusID = psStatus;
console.log("psStatusID="+psStatusID);				
				if (psStatusID == 4 || psStatusID == 5) // arm
				{
					em.sendEmail("Status","Alarm is armed");	
				}
				else if (psStatusID == 0) // disarm
				{
					em.sendEmail("Status","Alarm is disarmed.");	
				}
			}
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
		else if ( eventType== '6')   
		{
			
//			 debug("Received zone bypass message")
			console.log('Received zone bypass message');
//      local zoneEnrolled = pmString2Dword(pmIncomingPdu, 5)
			var zoneEnrolled=0;
			var zoneBypassed=0;
			var zoneNum=0;
			for (i=0; i<4; ++i)
			{
				zoneEnrolled= parseInt(byteCode[i+4],16);
				zoneBypassed= parseInt(byteCode[i+8],16);
//console.log('zoneEnrolled = '+	zoneEnrolled);
				for (j=0; j<8; ++j)
				{
					if (zoneEnrolled  & (0x1 << j))
					{
						zoneNum=j+8*i+1;
//console.log( 'zoneEnrolled = '+	zoneEnrolled + ' zoneNum='+	zoneNum);				
						console.log("Zone "+pmZone_t[zoneNum]+" is enrolled");
					}
					if (zoneBypassed  & (0x1 << j))
					{
						zoneNum=j+8*i+1;
						console.log("Zone "+pmZone_t[zoneNum]+" is bypassed");
					}
				}
			}
			outMsg = 'LOG:'+inString;
//      local zoneBypass = pmString2Dword(pmIncomingPdu, 9)
//      for i = 1, 30 do
//         local enrolled = (bitw.band(zoneEnrolled, 2 ^ (i - 1)) > 0)
//         local bypass = (bitw.band(zoneBypass, 2 ^ (i - 1)) > 0)
//         local sensor = pmSensorDev_t[i]
//         if (sensor ~= nil) then
//            sensor['enrolled'] = enrolled
//            sensor['bypass'] = bypass
//            displaySensorBypass(sensor)
//         elseif (enrolled == true) then
//            debug("Found zone " .. i .. " to be enrolled while not registered.")
//            pmSensorDev_t[i] = {}
//            pmSensorDev_t[i].enrolled = enrolled
//            pmSensorDev_t[i].bypass = bypass
//         end
//      end
		}
		else		
			outMsg = 'LOG:'+inString;
		cb(outMsg);
	}
};