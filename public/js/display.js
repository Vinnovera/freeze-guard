(function() {

	var socket = io();

	var output = document.getElementById('output');
	var alarms = document.getElementById('alarms');

	socket.on('update', function(msg){
		msg = JSON.parse(msg);
		output.style.top = ((1-msg.threatLevel) * 100) + '%';
		alarms.innerHTML = msg.alarms;
	});

	var chart = new Highcharts.Chart({
		chart: {
			type: 'spline',
			renderTo: 'chart'
		},
		xAxis: {
			type: 'datetime'
		},
		series: [{
			name: 'Alarms',
			data: []
		}]
	});

	var dataLen = 0;
	function drawChart() {
		var data = JSON.parse(this.responseText);
		var len = data.length;
		for(var i=dataLen; i<len; i++) {
			chart.series[0].addPoint([data[i].time, data[i].alarms]);
		}
		dataLen = data.length;
	}

	setInterval(function() {
		var request = new XMLHttpRequest();
		request.open('GET', '/history', true);
		request.onload = drawChart;
		request.send();
	}, 1000);

})();
