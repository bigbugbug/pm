var smtpTransport = require('nodemailer-smtp-transport');
var nodemailer = require('nodemailer');


var transport = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: 'chichungchan@gmail.com', // my mail
        pass: 'kimo31chan'
    }
}));

var  emailAddress=new Array ("chichungchan@gmail.com","2064094194@txt.att.net");

// email constructor
var email = function() {
};

// email function

email.prototype.sendEmail =  function sendEmail(subject,msg)
{

console.log('SMTP Configured');

console.log('Sending Mail');

		for (i=0;i<emailAddress.length;i++)
			transport.sendMail({
			   from: "Home Alarm System", // sender address
			   to: "Chan <"+emailAddress[i]+">", // comma separated list of receivers
			   subject:   subject, // Subject line
			   text: msg // plaintext body
			}, function(error, response){
			   if(error){
				   console.log(error);
			   }else{
				   console.log("Message sent ");
			   }
			});
			
  // if you don't want to use this transport object anymore, uncomment following
//  line
  transport.close(); // close the connection pool
}

// export email from the module
module.exports = email;


