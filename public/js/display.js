(function() {

	var socket = io();

	var output = document.getElementById('output');
	var alarms = document.getElementById('alarms');
	var status = document.getElementById('status');

	socket.on('update', function(msg){
		msg = JSON.parse(msg);

		// Keep text on the background
		msg.threatLevel = (msg.threatLevel > 0.94) ? 0.94 : msg.threatLevel;

		output.style.top = ((1-msg.threatLevel) * 100) + '%';
		alarms.innerHTML = msg.alarms;

		updateStatus(+msg.threatLevel);
	});

	function updateStatus(threatLevel) {
		console.log(threatLevel);
		if (threatLevel > 0.66) {
			status.className = 'status critical';
			status.innerHTML = 'Critical';

		} else if (threatLevel > 0.33) {
			status.className = 'status warning';
			status.innerHTML = 'Warning';
			
		} else {
			status.className = 'status';
			status.innerHTML = 'Normal';
		}
	}

	function drawChart() {
		var data = JSON.parse(this.responseText);

		var categories = [];
		var series = [{
			name: 'Alarms',
			data: []
		}];
		data.forEach(function(d) {
			categories.push(d.time);
			series[0].data.push(d.alarms);
		});

		var chart = new Highcharts.Chart({
			chart: {
				type: 'spline',
				renderTo: 'chart'
			},
			xAxis: {
				categories: categories
			},
			series: series
		});

	}

	setInterval(function() {
		var request = new XMLHttpRequest();
		request.open('GET', '/history', true);
		request.onload = drawChart;
		request.send();
	}, 1000);

})();
