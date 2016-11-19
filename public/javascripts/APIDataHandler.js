var APIDataHandler = (function() {
	function handler(params, method) {
		var call = $.post('/APIDataRetrieval', { params: params });
		call.done(function(data) {
			Handlers[method](JSON.parse(data));
		});
	}

	var Handlers = (function() {
		function logAPIData(data) {
			console.log(data);
		}

		function displayStringifiedAPIData(data) {
			var div = document.createElement('div');
			div.innerHTML = JSON.stringify(data);
			document.body.appendChild(div);
		}

		function createNewChart(data) {
			visualizationTools.createNewLineCharts(data);
		}

		/*
		Should create a way to create arrays of each team sorted by role.
		So when you want to see a lane's matchup statistics, they'll always use the same index in the array
		For example:
			teamBlue[0].kills vs teamRed[0].kills (top lane)
			teamBlue[1].kills vs teamRed[1].kills (jungle lane)
			teamBlue[2].kills vs teamRed[2].kills (mid lane)
			and so on...

		Also just a reminder, if you store this stuff in a database...
		BE SURE TO STORE BY SEASON!!!
		*/

		//aggregate champion kills in a lane with assists
		//determine % of lane influence
		//who got first turret
		//CS at first turret
		//focus on one lane first, then see if you can find a pattern you're going to use for each lane.
		function determineLaneWinner(data) {
			var championKillEvent = [];
			data.timeline.frames.forEach(function(cv,i) {
				if(cv.events) {
					/*
					var tmp = cv.events.find(function(cv, i) {
						return cv.eventType == 'BUILDING_KILL' && cv.towerType == 'OUTER_TURRET';
					});
					*/
					var tmp = cv.events.find(function(cv,i) {
						return cv.eventType == 'CHAMPION_KILL';
					});
					if(typeof tmp !== 'undefined') {
						championKillEvent.push(tmp);
					}
				}
			});
			console.log(championKillEvent);
		}

		function createPlayer(data, id) {
			return {
				name: data.participantIdentities[id].player.summonerName,
				kills: 0,
				color: ""
			}
		}

		//data.participantIdentities is summoner names
		//data.participants is champions, highest rank, summoner spells, teamid, runes/masteries
		//data.participants.timeline.lane is which lane player went to
		//data.participants.timeline.role is which role player assigned to
		//killerId is building/champion killer, assistingParticipantIds is building/champion assister
		//laneType is which lane building was killed
		function determineWinnerOfTopLane(data) {
			//should be a constructor for player objects like this
			var topramen = {
				identity: data.participantIdentities[9],
				participant: data.participants[9],
				lane: data.participants[9].timeline.lane,
				role: data.participants[9].timeline.role,
				deaths: [],
				towerKills: []
			};

			//finding deaths of a champion is more efficient than finding everyone's kills 
			//for determining how much other players influence a single lane.
			topramen.deaths = findChampionDeaths(data,10);
			//console.log(topramen.deaths);
			
			var teamBlue = {};
			teamBlue.players = [];
			teamBlue.players.push(createPlayer(data,0));
			teamBlue.players.push(createPlayer(data,1));
			teamBlue.players.push(createPlayer(data,2));
			teamBlue.players.push(createPlayer(data,3));
			teamBlue.players.push(createPlayer(data,4));

			topramen.deaths.forEach(function(cv) {
				teamBlue.players[(cv.killerId-1)].kills++;
			});

			teamBlue.players.sort(function(a,b) {
				if(a.kills < b.kills) {
					return -1;
				}
				if(a.kills > b.kills) {
					return 1;
				}
				return 0;
			});
			teamBlue.players.reverse();
			
			teamBlueColors = ["#435ee8","#5f75e8","#7b8de8","#96a4e8","#a5b4ff"];

			//console.log(teamBlue);

			var cvsBlue = document.getElementById('cvsTeamBlue');
			var ctxBlue = cvsBlue.getContext('2d');
			var data = {
			    labels: [
			        teamBlue.players[0].name,
			        teamBlue.players[1].name,
			        teamBlue.players[2].name,
			        teamBlue.players[3].name,
			        teamBlue.players[4].name
			    ],
			    datasets: [
			        {
			            data: [
				            teamBlue.players[0].kills,
				            teamBlue.players[1].kills,
				            teamBlue.players[2].kills,
				            teamBlue.players[3].kills,
				            teamBlue.players[4].kills
			            ],
			            backgroundColor: teamBlueColors,
			            hoverBackgroundColor: teamBlueColors
			        }]
			};

			var showPercentAndValueOptions = 
				{
					tooltips: {
						callbacks: {
							label: function(tooltipItem, data) {
								var allData = data.datasets[tooltipItem.datasetIndex].data;
								var tooltipLabel = data.labels[tooltipItem.index];
								var tooltipData = allData[tooltipItem.index];
								var total = 0;
								for (var i in allData) {
									total += allData[i];
								}
								var tooltipPercentage = Math.round((tooltipData / total) * 100);
								return tooltipLabel + ': ' + tooltipData + ' (' + tooltipPercentage + '%)';
							}
						}
					}
				};

			var deathByPlayerPieChart = new Chart(ctxBlue, {
				type: 'pie',
				data: data,
				options: showPercentAndValueOptions
			});

			var soloOrAssist = [0,0];

			topramen.deaths.forEach(function(cv) {
				if(cv.killerId == 5) {
					if(cv.assistingParticipantIds) {
						soloOrAssist[0]++;
					} else {
						soloOrAssist[1]++;
					}
					console.log(cv);
				}
			});
			soloOrAssist.sort();

			var cvsTop = document.getElementById('cvsTopLane');
			var ctxTop = cvsTop.getContext('2d');
			var deathByTopLane = new Chart(ctxTop, {
				type: 'pie',
				data: {
					labels: [
						"Solo Kills",
						"Assisted Kills"
					],
					datasets: [
						{
							data: [
								soloOrAssist[0],
								soloOrAssist[1]
							],
							backgroundColor: ["#435ee8", "#a5b4ff"],
			            	hoverBackgroundColor: ["#435ee8", "#a5b4ff"]
			        	}]
					},
				options: showPercentAndValueOptions
			});
		}

		/*team 1
		backgroundColor: [
			"#cb393c",
            "#cb5254",
            "#cb6a6c",
            "#cb8284",
            "#ea9697"
        ],
        hoverBackgroundColor: [
			"#cb393c",
            "#cb5254",
            "#cb6a6c",
            "#cb8284",
            "#ea9697"
        ]
		*/

		function findChampionDeaths(data, id) {
			var championKillEvents = [];
			data.timeline.frames.forEach(function(cv,i) {
				if(cv.events) {
					var tmp = cv.events.filter(function(cv, i) {
						return cv.eventType == 'CHAMPION_KILL';
					});
					if(typeof tmp !== 'undefined') {
						tmp.forEach(function(cv,i) {
							if(cv.victimId == id)
								championKillEvents.push(cv);
						});
					}
				}
			});
			return championKillEvents;
		}


		//findChampionKills could probably be combined with findTurretKills
		//we would make a new function call it findKillerEvent, specify champion/building/ward
		//then the id of the participant (kill or assist)
		function findChampionKills(data, id) {
			var championKillEvents = [];
			data.timeline.frames.forEach(function(cv,i) {
				if(cv.events) {
					var tmp = cv.events.filter(function(cv, i) {
						return cv.eventType == 'CHAMPION_KILL';
					});
					if(typeof tmp !== 'undefined') {
						tmp.forEach(function(cv) {
							if(cv.assistingParticipantIds) {
								if(cv.assistingParticipantIds.includes(id)) {
									championKillEvents.push(cv);
								}
							}
							if(cv.killerId == id)
								championKillEvents.push(cv);
						});
					}
				}
			});
			return championKillEvents;
		}

		function findTurretKills(data, id) {
			var turretKillEvents = [];
			data.timeline.frames.forEach(function(cv,i) {
				if(cv.events) {
					var tmp = cv.events.filter(function(cv, i) {
						return cv.eventType == 'BUILDING_KILL' && 
								cv.towerType == 'OUTER_TURRET';
					});
					if(typeof tmp !== 'undefined') {
						tmp.forEach(function(cv) {
							if(cv.assistingParticipantIds) {
								if(cv.assistingParticipantIds.includes(id)) {
									turretKillEvents.push(cv);
								}
							}
							if(cv.killerId == id)
								turretKillEvents.push(cv);
						});
					}
				}
			});
			return turretKillEvents;
		}

		function test(data) {
			var turretDownEvent = [];
			data.timeline.frames.forEach(function(cv,i) {
				if(cv.events) {
					var tmp = cv.events.find(function(cv, i) {
						return cv.eventType == 'BUILDING_KILL' && cv.towerType == 'OUTER_TURRET';
					});
					if(typeof tmp !== 'undefined') {
						turretDownEvent.push(tmp);
					}
				}
			});
			console.log(turretDownEvent);
		}

		return {
			logAPIData: logAPIData,
			displayStringifiedAPIData: displayStringifiedAPIData,
			createNewChart: createNewChart,
			determineWinnerOfTopLane: determineWinnerOfTopLane,
			test: test
		}
	})();

	return {
		handler: handler
	}
})();