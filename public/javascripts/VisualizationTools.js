//Using the Chart.js library for chart generation
var visualizationTools = (function() {
	function createNewDataset(label, borderColor, fill) {
		var dataset = {};
		dataset.label = label;
		dataset.borderColor = borderColor;
		dataset.fill = fill;
		dataset.data = [];

		return dataset;
	}

	function initChartDataObj() {
		var chartData = {};
		chartData.labels = [];
		chartData.datasets = [];
		return chartData;
	}

	function prepChartDataForGoldAdvantageOverTime(data) {
		var chartData = initChartDataObj();
		var datasetData = createNewDataset("Team Advantage", "rgba(200,200,200,1)", false);
		var pointBackgroundColors = [];
		datasetData.pointBackgroundColor = pointBackgroundColors;
		datasetData.pointBorderColor = "rgba(0,0,0,1)";

		chartData.datasets.push(datasetData);

		var t1FrameGold, t2FrameGold, time;

		data.timeline.frames.forEach(function(cv) {
			var Obj = {};

			t1FrameGold = 0;
			t2FrameGold = 0;

			Object.keys(cv.participantFrames)
				.forEach(function(v, i) {
					if(i <= 4) {
						t2FrameGold += cv.participantFrames[v].totalGold;
					} else if(i > 4) {
						t1FrameGold += cv.participantFrames[v].totalGold;
					}
			});
			
			//time in minutes
			time = cv.timestamp/1000/60;
			chartData.labels.push(Math.round(time) + ' Mins');

			Obj.y = t2FrameGold - t1FrameGold;
			Obj.x = cv.timestamp;

			datasetData.data.push(Obj);
		});

		datasetData.data.forEach(function(cv) {
			if(cv.y > 0) {
				pointBackgroundColors.push("rgba(75,192,192,1)");
			} else if(cv.y == 0) {
				pointBackgroundColors.push("rgba(255,255,255,1)");
			} else {
				pointBackgroundColors.push("rgba(178,34,34,1)");
			}
		});

		return chartData;
	}

	function prepChartDataForGoldOverTime(data) {
		var chartData = initChartDataObj();
		var team1DatasetData = createNewDataset("Team 1's Gold", "rgba(178,34,34,1)", false);
		var team2DatasetData = createNewDataset("Team 2's Gold", "rgba(75,192,192,1)", false);

		chartData.datasets.push(team1DatasetData);
		chartData.datasets.push(team2DatasetData);

		var t1FrameGold, t2FrameGold, time;

		data.timeline.frames.forEach(function(cv) {
			var team1Obj = {};
			var team2Obj = {};

			t1FrameGold = 0;
			t2FrameGold = 0;

			Object.keys(cv.participantFrames)
				.forEach(function(v, i) {
					if(i <= 4) {
						t2FrameGold += cv.participantFrames[v].totalGold;
					} else if(i > 4) {
						t1FrameGold += cv.participantFrames[v].totalGold;
					}
			});
			
			//time in minutes
			time = cv.timestamp/1000/60;
			chartData.labels.push(Math.round(time) + ' Mins');

			team1Obj.y = t1FrameGold;
			team1Obj.x = cv.timestamp;
			team2Obj.y = t2FrameGold;
			team2Obj.x = cv.timestamp;

			team1DatasetData.data.push(team1Obj);
			team2DatasetData.data.push(team2Obj);
		});

		return chartData;
	}

	function createNewLineCharts(data) {
		var chartData = prepChartDataForGoldOverTime(data);
		var cvs = document.getElementById('cvs');
		var ctx = cvs.getContext('2d');

		var chartData2 = prepChartDataForGoldAdvantageOverTime(data);
		var cvs2 = document.getElementById('cvs2');
		var ctx2 = cvs2.getContext('2d');
		
		var myLineChart = Chart.Line(ctx, {
			data: chartData,
			options: {
				responsive: false
			}
		});

		var myLineChart2 = Chart.Line(ctx2, {
			data: chartData2,
			options: {
				responsive: false
			}
		});
	}

	return {
		createNewLineCharts: createNewLineCharts
	}
})();