var socket = io.connect();
socket.on('timer', function(data) {
	GLOBAL.timer = data;
});

socket.on('data', function(data) {
	var temp = data.replace(/\n/g,'');
	var tempArray = '[' + temp + ']';
	// console.log(JSON.parse(tempArray));
	GLOBAL.data = JSON.parse(tempArray);
	// get the last x
	var length = GLOBAL.data.length;
	if(length % 5 == 0) {
		// send email
		if(!GLOBAL.isEmailSent) {
			socket.emit('sendEmail', GLOBAL.data);
			GLOBAL.isEmailSent = true;
		}
		GLOBAL.data = GLOBAL.data.slice(length - 5, length);// get last five
	} else if(length % 5 == 1) {
		GLOBAL.isEmailSent = false;
		GLOBAL.data = GLOBAL.data.slice(length - 1, length);// get last one
	} else if(length % 5 == 2) {
		GLOBAL.data = GLOBAL.data.slice(length - 2, length);// get last one
	} else if(length % 5 == 3) {
		GLOBAL.data = GLOBAL.data.slice(length - 3, length);// get last one
	} else if(length % 5 == 4) {
		GLOBAL.data = GLOBAL.data.slice(length - 4, length);// get last one
	} else {
		GLOBAL.data = GLOBAL.data;
	}
});

// DEMO
$('#playerLegend').click(function() {
	GLOBAL.isDemo = !GLOBAL.isDemo;
});

/////////////
var GLOBAL = {
	isDemo: false,
	isEmailSent: false,
	maxJammers: 5,
	data: [],
	timer: 4,
	w: window.innerWidth,
	h: window.innerHeight,
	load: function() {
		window.addEventListener('load', function() {
			console.log('display loaded');
			APP.start();
		});
	},
	fullscreen: function(element) {
		GLOBAL.w = window.innerWidth;
		GLOBAL.h = window.innerHeight;
		$('svg').attr({
			width: GLOBAL.w,
			height: GLOBAL.h
		});
		if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		} else if (element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
	}
},

	APP = {
		svgEl: null,
		playerSvg: [],
		isPlaying: false,
		start: function() {
			// center invite
			centerObj('#inviteContainer');
			// D3
			this.svgEl = d3.select('body').append('svg').attr({
				width: GLOBAL.w,
				height: GLOBAL.h
			});

			APP.startTimer();
		},
		play: function() {
			// play real stuff
			APP.deployPlayers(GLOBAL.data);
		},
		interval: null,
		timer: null,
		time: 0,
		startTimer: function() {
			$('#inviteContainer').hide();
			// check data
			var currentData = GLOBAL.data;
			console.log('current jammers: ' + currentData.length);
			APP.time = 0;

			if(GLOBAL.isDemo) {
				console.log('running DEMO');
				// Be the first
				APP.deployPlayers(APP.randomPlayer()); // return playerArray
				APP.advertise();
			}
			else {
				APP.play();
				if(random(1,10) > 2) {
					APP.advertise();
				}
			}

			APP.interval = setInterval(function() {
				APP.time++;
				// console.log(APP.time);
				// $('#debug').html(APP.time/(GLOBAL.timer*60));
				$('#playerBar').css({
					left: GLOBAL.w * APP.time / (GLOBAL.timer * 60)
				});
				// looping
				var pLength = APP.playerSvg.length;
				for (var i = 0; i < pLength; i++) {
					// console.log(APP.playerSvg[i][0][0].attributes.cx.value, parseInt(GLOBAL.w * APP.time/(GLOBAL.timer*60)));
					if (Math.abs(Math.round(APP.playerSvg[i][0][0].attributes.cx.value / GLOBAL.w * (GLOBAL.timer * 60))) == APP.time) {
						APP.playerSvg[i]
							.transition()
							.duration(random(200, 300))
							.attr({
								r: random(120, 200)
							});
						APP.playerSvg[i]
							.transition()
							.delay(150)
							.duration(random(500, 1000))
							.attr({
								// r: random(10, 20)
								r: random(3,7)
							})
							.ease('bounce');
						// play sound
						// $('#debug').html(Math.round(parseInt(APP.playerSvg[i][0][0].attributes.cy.value) / GLOBAL.h * 12));
						playSound(SOUNDS.indexOf(APP.playerSvg[i][0][0].attributes.title.value), noteToMultiplier(Math.round(parseInt(APP.playerSvg[i][0][0].attributes.cy.value) / GLOBAL.h * 12)), 1, parseInt(APP.playerSvg[i][0][0].attributes.cx.value) / GLOBAL.w - 0.5, parseInt(APP.playerSvg[i][0][0].attributes.cy.value) / GLOBAL.h - 0.5);
					}

				}
				if(GLOBAL.w * APP.time / (GLOBAL.timer * 60) >= GLOBAL.w) {
					APP.time = 0;
					window.clearInterval(APP.interval);
					APP.startTimer();
				}
			}, 1000 / 60);
			// LOOPING INFINITELY
			// APP.timer = setTimeout(function() {
			// 	timer = 0;
			// 	window.clearInterval(APP.interval);
			// 	APP.startTimer();
			// }, GLOBAL.timer * 1000 + 2000);
		},
		stopTimer: function() {
			clearTimeout(APP.timer);
		},
		advertise: function() {
			var fade = null;
			clearTimeout(fade);
			$('#inviteContainer')
				.removeClass()
				.addClass('animated');
			var words = ['Hi friends.', 'Be the music jammer.', 'PlayNote is collaborative.', 'PlayNote is music to your ears.', 'Wanna feel a little jazzy?'],
				randWord = Math.floor(Math.random() * words.length),
				animation = ['flipInX', 'swing', 'fadeInRightBig', 'rotateInDownRight'],
				randAnimation = Math.floor(Math.random() * animation.length);
			$('#inviteText')
				.html(words[randWord]);
			$('#inviteContainer')
				.fadeIn()
				.addClass(animation[randAnimation]);
			fade = setTimeout(function() {
				$('#inviteContainer')
					.removeClass()
					.addClass('animated fadeOutDownBig');
			}, GLOBAL.timer*1000 - 1000);
		},
		randomPlayer: function() {
			// GENERATE RANDOM NUMBER 2-5
			// GENERATE RANDOM INSTRUMENTS 0-8
			// GENERATE RANDOM TONES
			// X: 0 - GLOBAL.TIMER*100
			// Y: 0 - 11
			var numPlayer = random(2, 5),
				playerArray = []; // [[instnum, [[x,y],[x,y],[x,y], ...]], [instnum, [[x,y],[x,y],[x,y], ...], [instnum, [[x,y],[x,y],[x,y], ...]]

			for (var i = 0; i < numPlayer; i++) {
				playerArray.push({
					name: 'Apon',
					email: 'apon@apon.io',
					color: randHSL(),
					instrument: SOUNDS[1+(random(0, 8))],
					compo: []
				});
				var tonesNum = random(3, 12),
					time = [],
					tones = [],
					group = [];
				for (var j = 0; j < tonesNum; j++) {
					playerArray[i].compo.push([random(10, GLOBAL.timer * 100), getRandKey(random(0, 11))]);
				}
				playerArray[i].compo.push(group);
			}
			// console.log(playerArray);
			return playerArray;
		},
		deployPlayers: function(playerarray) {
			// console.log(playerarray);
			APP.playerSvg = [];
			$('.playerEach').remove();
			$('svg').empty();
			// console.log(playerarray);
			var allPlayers = playerarray;
			// console.log(allPlayers);
			for (var i = 0; i < allPlayers.length; i++) {
				var colorEach = allPlayers[i].color;
				// deploy legend
				$('#temp')
				.clone()
				.appendTo('#playerLegend')
				.removeClass('hidden')
				.addClass('playerEach')
				.attr({
					display: 'block',
					id: 'playerTarget'
				})
				.find('#playerRect').css({
					background: colorEach
				})
				.parent()
				.find('#playerName').html(allPlayers[i].name)
				.parent()
				.find('#playerInst').html(allPlayers[i].instrument);

				for (var j = 0; j < allPlayers[i].compo.length; j++) {
					this.playerSvg.push(this.svgEl.append('circle').attr({
						title: allPlayers[i].instrument,
						cx: Math.round(50 + (allPlayers[i].compo[j][0] / (GLOBAL.timer * 100)) * GLOBAL.w) - 70, // 0 - 800
						cy: Math.round(50 + (getKeyPos(allPlayers[i].compo[j][1])/12) * GLOBAL.h) - 10, // 0 - 12
						r: 1,
						fill: editFill(colorEach),
						stroke: editStroke(colorEach),
						'stroke-width': random(1, 10)
					}));
					// sort
				}
			}
			console.log(APP.playerSvg);
			var k = 0;

			function scaleOverTime() {
				setTimeout(function() {
					APP.playerSvg[k]
						.transition()
						.attr({
							r: random(3,7)
						})
						.ease('elastic');
					k++;
					if (k < APP.playerSvg.length) {
						scaleOverTime();
					}
				}, 100);
			}
			scaleOverTime();
		}
	};

GLOBAL.load();
window.addEventListener('click', function() {
	GLOBAL.fullscreen(document.documentElement);
});
window.addEventListener('resize', function() {
	GLOBAL.w = window.innerWidth;
	GLOBAL.h = window.innerHeight;
	$('svg').attr({
		width: GLOBAL.w,
		height: GLOBAL.h
	});
});
// helpers

function random(min, max) {
	return _.random(min, max);
}

function randomPathString() {
	var path = '';

	function generatePath(w) {
		// random 50%
		var surpass = Math.floor(Math.random() * 10);
		// console.log(surpass);
		if (surpass >= 4) { // vibrate
			return 'T' + w + ',' + Math.round(_.random(GLOBAL.h / 4, 3 * (GLOBAL.h / 4)));
		} else { // straight
			return 'L' + w + ',' + Math.round(_.random(GLOBAL.h * 2 / 5, GLOBAL.h * 3 / 5));
		}

	}
	for (var i = 0; i < GLOBAL.w; i += 50) {
		if (i == 0) {
			// begin at center
			path += 'M0,' + GLOBAL.h / 2;
		} else if (i == GLOBAL.w - 1) {
			// if end
			path += 'L' + GLOBAL.w + ',' + GLOBAL.h / 2;
		} else {
			// progressively draw
			path += generatePath(i);
		}
	}
	// console.log(path);
	return path;
}

function randDuration() {
	return _.random(3, GLOBAL.timer - 2) * 1000;
}

function timeToX(time) {
	// console.log('percent: ' + time/GLOBAL.timer);
	var x = (GLOBAL.w - 40) * time / GLOBAL.timer / 100;
	return x + 20;
}

function keyToY(key) {
	var y = (GLOBAL.h - 200) * (getKeyPos(key) / 12);
	return y + 100;
}

function editFill(color) { 'hsl(100, 10%, 10%)'
	return color.replace('hsl', 'hsla').replace('%)', '%, 0.5)');
}

function editStroke(color) {
	return color.replace('hsl', 'hsla').replace('%)', '%, 0.9)');
}

function randHSLWithStroke() { // hsl(x,y,z)
	var h = Math.floor(Math.random() * 360) + 1;
	var color = {
		fill: 'hsla(' + h + ', 75%, 50%, 0.5)',
		stroke: 'hsla(' + h + ', 75%, 50%, 0.9)'
	}
	return color;
}

function getRandKey(num) {
	var keys = [
		'key_c',
		'key_cs',
		'key_d',
		'key_ds',
		'key_e',
		'key_f',
		'key_fs',
		'key_g',
		'key_gs',
		'key_a',
		'key_as',
		'key_b'
	];
	return keys[num];
}

function getKeyPos(key) {
	switch (key) {
		case 'key_c':
			return 0;
		case 'key_cs':
			return 1;
		case 'key_d':
			return 2;
		case 'key_ds':
			return 3;
		case 'key_e':
			return 4;
		case 'key_f':
			return 5;
		case 'key_fs':
			return 6;
		case 'key_g':
			return 7;
		case 'key_gs':
			return 8;
		case 'key_a':
			return 9;
		case 'key_as':
			return 10;
		case 'key_b':
			return 11;
	}

}