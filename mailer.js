var smtpTransport = require('nodemailer-smtp-transport');
var nodemailer = require('nodemailer');
var parser = require('xml2js').Parser(),
			 util = require('util'),
             fs = require('fs');

var transport = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: 'chichungchan@gmail.com', // my mail
        pass: 'kimo31chan'
    }
}));

// email constructor
var email = function() {
};

// email function

email.prototype.sendEmail =  function sendEmail(subject,msg)
{
	fs.readFile( __dirname + '/user.xml', function (err, data) 
	{
		parser.parseString(data, function(err, result) 
		{
	    console.log('Sending Email alarm_type='+subject+' and result='+msg.toString());
			user=result['config']['user'];
//			debug= ((result['config']['debug'] == 'Y') ? true:false);
			for (i=0;i<user.length;i++)
			{
//				var userDebug =  ((user[i].debug == 'Y') ? true:false);
				
				var useSMS = false;
				var useEmail = false;
				
 				if (user[i].debug.toString() == result['config']['debug'].toString() && subject == "Status" && user[i].sendStatus == 'Y')
				{
					if (user[i].allowSMS =='Y')
						useSMS = true;
					if (user[i].allowEmail =='Y')
						useEmail = true;
				}
				if (user[i].debug.toString() == result['config']['debug'].toString() && subject == "Alarm" && user[i].sendAlarm == 'Y')
				{
// console.log("subject="+subject);					
					if (user[i].allowSMS =='Y')
						useSMS = true;
					if (user[i].allowEmail =='Y')
						useEmail = true;  
				}
				if (useSMS) 
				{
					console.log('sending sms to '+user[i].phone);
					transport.sendMail({
					from: "Home Alarm System", // sender address
					to: "Chan <"+user[i].phone+"@txt.att.net>", // comma separated list of receivers
					text: msg // plaintext body
					}, function(error, response){
					if(error){
						console.log(error);
					}else{
						console.log("Message sent ");
					}
					});					 
				}
				if (useEmail )
				{	
					console.log('sending email to '+user[i].email);	
 					transport.sendMail({
					from: "Home Alarm System", // sender address
					to: "Chan <"+user[i].email+">", // comma separated list of receivers
					subject:   subject, // Subject line
					text: msg // plaintext body
					}, function(error, response){
					if(error){
						console.log(error);
					}else{
						console.log("Message sent ");
					}
					});	 				 
				}
			}
		});
	});
	transport.close(); // close the connection pool
}

// export email from the module
module.exports = email;


