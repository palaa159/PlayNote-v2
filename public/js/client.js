var socket = io.connect();
socket.on('timer', function(data) {
	GLOBAL.timer = data;
	// piet
	$('#pietimer').pietimer({
		seconds: data,
		color: 'rgba(1,1,1,1)',
		height: 20,
		width: 20
	}, function() {});
});

// global
var GLOBAL = {
	timer: 10,
	countdown: 3,
	currentPage: 'pageLogin',
	w: window.innerWidth,
	h: window.innerHeight,
	load: function() {
		window.addEventListener('load', function() {
			// start
			FastClick.attach(document.body);
			GLOBAL.activate('pageLogin');
		});
	},
	resize: function() { // if change orientation
		window.addEventListener('resize', function() {
			GLOBAL.w = window.innerWidth;
			GLOBAL.h = window.innerHeight;
		});
	},
	navigate: function(pageid) {
		$('.container').fadeOut('fast', function() {
			$('.page').css({
				zIndex: 0,
				opacity: 0
			});
			$('#' + GLOBAL.currentPage)
				.animate({
					left: '-100%'
				}, {
					duration: 500,
					queue: false
				});
			$('#' + pageid).css({
				left: '100%',
				zIndex: 1,
			})
				.animate({
					left: 0,
					opacity: 1
				}, {
					duration: 500,
					queue: false
				});
			$('.container').show(function() {
				GLOBAL.activate(pageid);
			});
		});
	},
	activate: function(pageid) {
		GLOBAL.currentPage = pageid;
		if ($('#' + pageid).css('zIndex') == 1) {
			if (pageid == 'pageLogin') { // page login
				// play sound
				$('h1.pageLogin').addClass('animated rollIn');
				$('#pNameIpt').addClass('animated slideInDown');
				setTimeout(function() {
					$('.turnOnSpeaker').show();
					$('.turnOnSpeaker').addClass('animated bounceInUp');
				}, 1000);
				$('#pNameIpt').on('input', function() {
					if ($('#pNameIpt').val().length < 3) {
						// $('.loginArrow').hide();
					} else {
						$('.loginArrow').show().addClass('animated bounceInLeft');
					}
				});
			} else if (pageid == 'pagePickInstrument') { // page pick inst
				$('h1.pagePickInstrument').addClass('animated flipInX');
				for (var i = 1; i < SOUNDS.length - 1; i++) {
					$('#instTemplate')
						.clone()
						.css({
							width: GLOBAL.w / 3 - 20,
							height: 80
						})
						.removeClass('hidden')
						.attr({
							id: SOUNDS[i]
						})
						.html('<img class="instImg" src="../img/instIcon/' + SOUNDS[i].toLowerCase() + '.png">')
						.prependTo('.listInstruments');
				}
				$('#instTemplate').remove();
				APP.listenForInstTap();
			} else if (pageid == 'pageRecord') { // record
				// remove Listener
				APP.removeInstListener();
				// arrange key
				$('.key').each(function(i) {
					$(this).css({
						background: randHSL(),
						width: GLOBAL.w / 3 - 20,
						height: GLOBAL.h / 4 - 15
					});
				});
				// countdown 3 2 1 .. GO

				// if android then skip stuff
				if(isAndroid()) {
					$('.countdown').hide();
					MEDIA.record();
				} else {
					centerObj('.countdown');
					APP.countdown(GLOBAL.countdown);
				}
			} else if (pageid == 'pageResult') {
				if (USER.compo.length > 0) {
					$('#youRock').html(USER.name);
					// canvas
					var compolength = USER.compo.length;
					APP.canvas = $('#myCanvas')[0],
					APP.ctx = APP.canvas.getContext('2d');
					$('#myCanvas').attr({
						width: GLOBAL.w - 40,
						height: 150
					});
					APP.ctx.font = '8pt Anaheim';
					// plot dot and time only
					for (var i = 0; i < GLOBAL.timer + 1; i++) {
						APP.ctx.fillText(i, (GLOBAL.w - 40) / GLOBAL.timer * i, 146);
					}
					APP.ctx.beginPath();
					for (var j = 0; j < compolength; j++) {
						APP.ctx.beginPath();
						APP.ctx.arc(milliToX(USER.compo[j][0]), noteToY(USER.compo[j][1]), 3, 0, 2 * Math.PI, false);
						APP.ctx.fillStyle = '#282828';
						APP.ctx.fill();
						APP.ctx.closePath();
						// if (j == 0) {
						// 	APP.ctx.moveTo(milliToX(USER.compo[j][0]), noteToY(USER.compo[j][1]));
						// } else if(j < compolength-1){
						// 	APP.ctx.quadraticCurveTo(
						// 		(milliToX(USER.compo[j][0]) + milliToX(USER.compo[j + 1][0])) / 2, 
						// 		(noteToY(USER.compo[j][1]) + noteToY(USER.compo[j + 1][1])) / 2,
						// 		milliToX(USER.compo[j + 1][0]),
						// 		noteToY(USER.compo[j + 1][1])
						// 	);
						// } else {
						// 	APP.ctx.moveTo(milliToX(USER.compo[j][0]), noteToY(USER.compo[j][1]));
						// }
					}
					APP.ctx.stroke();
				} else {
					alert('You have not played any note. Let us start over.');
					GLOBAL.navigate('pagePickInstrument');
				}
			} else if (pageid == 'pageEmail') { // email
				$('#thanksUser').html(USER.name);
			} else if (pageid == 'pageEnd') { // end
				setTimeout(function() {
					$('.startOver').show();
					$('.startOver').addClass('animated bounceInUp');
				}, 2000);
			}
		}
	}
};

var APP = {
	countdown: function(second) {
		var count = new Countdown({
			seconds: second,
			onUpdateStatus: function(sec) {
				$('.countdown').html(sec);
				playSound(instToIndex('metronome'), 1, 1, 1, 1);
			},
			onCounterEnd: function() {
				$('.countdown').fadeOut();
				$('#pietimer').pietimer('start');
				MEDIA.record();
			}
		});
		count.start();
	},
	ctx: null,
	canvas: null,
	listenForInstTap: function() {
		$('.inst').on('click', function() {
			if (USER.instrument == $(this).attr('id')) {
				var result = confirm('PlayNote \n You have chosen ' + USER.instrument + '\n You have ' + GLOBAL.timer + ' seconds to record your composition!');
				if (result == true) {
					GLOBAL.navigate('pageRecord');
				}
			} else {
				// play sample
				MEDIA.playSample($(this).attr('id'));
				$('.inst').removeClass('pulse');
				USER.instrument = $(this).attr('id');
				$('.instChosen').html($(this).attr('id'));
				// visual
				$('.inst').css({
					background: 'white'
				});
				$(this).css({
					// background: 'black'
				});
				$(this).addClass('animated pulse');
			}
		});
	},
	removeInstListener: function() {
		$('.inst').off('click');
	}
};

//button listeners
// debounce
var debounceLogin = _.debounce(function(e) {
	$('.loginArrow').addClass('animated bounceOutRight');
	// playSound(instToIndex('intro'), 1, 1, 1, 1);
	USER.name = $('#pNameIpt').val();
	GLOBAL.navigate('pagePickInstrument');
}, 500);

$('.loginArrow').on('click', debounceLogin);
// key listener
$('.key').on('click', function() {
	// play sound
	var note = $(this).attr('id');
	playSound(instToIndex(USER.instrument), noteToMultiplier(note), 1, 1, 1);
	USER.compo.push([MEDIA.tick, $(this).attr('id')]);
});

$('#resultPlayback').on('click', function() {
	MEDIA.playback();
});
$('#resultRecord').on('click', function() {
	GLOBAL.navigate('pagePickInstrument');
});
$('#resultSubmit').on('click', function() {
	// UPLOAD
	GLOBAL.navigate('pageEmail');
});
$('.endArrow').on('click', function() {
	var email = $('#pEmailIpt').val();
	if (validateEmail(email) == true || email.length == 0) {
		USER.email = email;
		USER.color = randHSL();
		// submit
		MEDIA.upload();
		GLOBAL.navigate('pageEnd');
	} else {
		alert('Make sure you input a valid email address.');
	}
});
$('.startOver').on('click', function() {
	location.reload();
});
// end of button listeners

var USER = {
	name: null,
	email: null,
	instrument: null, // default for piano?
	color: null,
	compo: []
};

var MEDIA = {
	tick: 0,
	timer: null,
	record: function() {
		// clear history
		USER.compo = [];
		MEDIA.timer = setInterval(function() {
			if (MEDIA.tick >= GLOBAL.timer * 100) {
				// stop
				MEDIA.stopRecord();
			} else {
				MEDIA.tick += 1;
				if (MEDIA.tick % 50 == 0) {
					playSound(instToIndex('metronome'), 1, 1, 1, 1);
				}
			}
		}, 9);
	},
	stopRecord: function() {
		console.log(MEDIA.tick);
		clearInterval(MEDIA.timer);
		MEDIA.tick = 0;
		GLOBAL.navigate('pageResult');
	},
	playSample: function(inst) {
		playSound(instToIndex(inst), 1, 1, 1, 1);
	},
	playback: function() {
		$('button').disable(true);
		APP.ctx.clearRect(0, 0, 1000, 1000);
		var time = 0,
			j = USER.compo.length;
		var loop = setInterval(function() {
			for (var i = 0; i < j; i++) {
				if (USER.compo[i][0] == time) {
					// context
					APP.ctx.beginPath();
					APP.ctx.arc(milliToX(USER.compo[i][0]), noteToY(USER.compo[i][1]), 3, 0, 2 * Math.PI, false);
					APP.ctx.fillStyle = 'black';
					APP.ctx.fill();
					APP.ctx.closePath();
					playSound(instToIndex(USER.instrument), noteToMultiplier(USER.compo[i][1]), 1, 1, 1);
				}
			}
			if (time <= GLOBAL.timer * 100) {
				time += 1;
			} else {
				clearInterval(this);
				// enable playback
				$('button').disable(false);
			}
		}, 9);
	},
	upload: function() {
		socket.emit('submit', USER);
	}
};

GLOBAL.load();
GLOBAL.resize();