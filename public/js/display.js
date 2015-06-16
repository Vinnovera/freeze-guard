(function() {

	var socket = io();

	var output = document.getElementById('output');
	var alarms = document.getElementById('alarms');

	socket.on('update', function(msg){
		msg = JSON.parse(msg);
		output.style.top = ((1-msg.threatLevel) * 100) + '%';
		alarms.innerHTML = msg.alarms;
	});

	

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
