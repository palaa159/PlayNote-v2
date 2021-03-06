var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server),
	nodemailer = require("nodemailer"),
	util = require('util'),
	fs = require('fs');

var playnote = {
	timer: 10
};

server.listen(7000);

// routing
app.use(express.static(__dirname + '/public'));
app.get('/i', function(req, res) {
	res.sendfile('public/client.html');
});
app.get('/d', function(req, res) {
	res.sendfile('public/display.html');
});

var filename = 'data.js';
// Socket.io
io.sockets.on('connection', function(socket) {
	console.log('hello');
	socket.emit('timer', playnote.timer);
	// Read file
	fs.readFile(filename, function(err, data) {
		if (err) throw err;
		// console.log(data.toString());
		socket.emit('data', data.toString());
	});

	socket.on('submit', function(data) {
		// save
		fs.appendFile(filename, ',' + JSON.stringify(data), function(err) {
			if (err) console.log(err);
			console.log('data saved');
		});
		fs.readFile(filename, function(err, data) {
			if (err) throw err;
			io.sockets.emit('data', data.toString());
		});
	});
	socket.on('sendEmail', function(data) {
		var mailList = '',
			bandMembers = '';
		for(var i = 0; i < data.length; i++) {
			mailList += data[i].email + ',';
			bandMembers += data[i].instrument + '-' + data[i].name + ' <' + data[i].email + '><br>';
		}
		// remove ,
		mailList = mailList.substring(0, mailList.length-1);
		mailOptions.to = mailList;
		mailOptions.html += bandMembers + '<br><br>Regards,<br><b>PlayNote Collaborate Team.</b>';
		util.log(mailOptions.to);
		util.log(mailOptions.html);
		sendMail();
	});
});

// email stuff
var smtpTransport = nodemailer.createTransport("SMTP", {
	service: "Gmail",
	auth: {
		user: "playnotecosubmissions@gmail.com",
		pass: "playmusic"
	}
});

var mailOptions = {
	from: "Elizabeth Clare <hello@playnoteco.com>", // sender address
	// to: "reach.apon@gmail.com, elizabethc.clare@gmail.com", // list of receivers
	subject: "Thanks for participating PlayNote at SXSW '14", // Subject line
	html: "Thank you for sharing your melody. Our helper elves are working hard to reply with the collaborative song you made <3. Meanwhile you can contact your band members below: <br><br>"
};

function sendMail() {
	smtpTransport.sendMail(mailOptions, function(error, response) {
	if (error) {
		console.log(error);
	} else {
		console.log("Message sent: " + response.message);
	}
});
}