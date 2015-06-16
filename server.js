var
	express          = require('express'),
	http             = require('http'),
	path             = require('path'),
	socketio         = require('socket.io'),
	config           = require('./config');

var
	TRESHOLD         = 2,
	COLLECTDELAY     = 2000,
	COOLDOWN         = 1000*60*120,
	MAXTHREATLEVEL   = 30,
	HISTORYINTERVAL  = 5000,
	app              = express(),
	server           = http.createServer(app),
	io               = socketio(server),
	alarmHistory     = [],
	totalHistory     = [],
	isCollecting     = false;

app.set('port', process.env.PORT || config.expressPort);

app.use(express.static(path.join(__dirname, 'public')));

server.listen(app.get('port'), function() {
	console.log('Server listening on port ' + app.get('port'));
});

app.get('/history', function(req, res) {
	var send = [];
	if (totalHistory.length > 0) {

		var previousTime = 0;
		var mappedHistory = [];
		for (var i = 0; i<totalHistory.length; i++) {
			if (i === 0) {
				mappedHistory.push({
					alarms: 1,
					time: totalHistory[i].timestamp
				});
			} else {
				if (totalHistory[i].timestamp.getTime() - previousTime < HISTORYINTERVAL) {
					mappedHistory[mappedHistory.length - 1].alarms++;
				} else {
					var previousTime = totalHistory[i].timestamp.getTime();
					mappedHistory.push({
						alarms: 1,
						time: totalHistory[i].timestamp
					});
				}
			}
		}
		res.send(JSON.stringify(mappedHistory));
	} else {
		res.send(JSON.stringify([]));
	}
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});

	socket.on('signal', function(msg) {
		//console.log('Got signal: ' + msg);
		if (parseFloat(msg) > TRESHOLD && !isCollecting) {
			console.log('Got signal: ' + msg);
			isCollecting = true;
			setTimeout(function() {
				var newAlarm = {
					value: msg,
					timestamp: new Date(),
					coolDown: function () {
						var that = this;
						setTimeout(function() {
							alarmHistory.splice(alarmHistory.indexOf(that), 1);
							postUpdate();
						}, COOLDOWN);
					}
				};
				alarmHistory.push(newAlarm);
				totalHistory.push(newAlarm);
				newAlarm.coolDown();
				isCollecting = false;
				postUpdate();
			}, COLLECTDELAY);
		}
	});
});

function postUpdate () {
	var threatLevel = alarmHistory.length / MAXTHREATLEVEL > 1 ? 1 : alarmHistory.length / MAXTHREATLEVEL;
	io.emit('update', JSON.stringify({
		threatLevel: threatLevel,
		alarms: alarmHistory.length
	}));
}
