// helpers

function isAndroid() {
	var ua = navigator.userAgent.toLowerCase();
	var isItAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
	if(isItAndroid) {
		console.log('you are android');
		return true;
	} else {
		console.log('you are not android');
		return false;
	}
}

function centerObj(obj) {
	$(obj).css({
		position: 'absolute',
		top: window.innerHeight / 2 - $(obj).height() / 2,
		left: window.innerWidth / 2 - $(obj).width() / 2
	});
	$(obj).fadeIn('fast');
}

function Countdown(options) {
	var timer,
		instance = this,
		seconds = options.seconds || 10,
		updateStatus = options.onUpdateStatus || function() {},
		counterEnd = options.onCounterEnd || function() {};

	function decrementCounter() {
		updateStatus(seconds);
		if (seconds === 0) {
			counterEnd();
			instance.stop();
		}
		seconds--;
	}

	this.start = function() {
		clearInterval(timer);
		timer = GLOBAL.countdown;
		seconds = options.seconds;
		timer = setInterval(decrementCounter, 1000);
	};

	this.stop = function() {
		clearInterval(timer);
	};
}

function randHSL() { // hsl(x,y,z)
	var h = Math.floor(Math.random() * 360) + 1;
	var s = Math.floor(Math.random() * 75) + 50;
	var color = 'hsl(' + h + ', ' + s +  '%, 50%)';
	return color;
}

function validateEmail(email) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

function instToIndex(inst) {
	return SOUNDS.indexOf(inst);
}

function noteToMultiplier(note) { // but is pentatonic now
	switch (note) {
		case 'key_c': //c
		case 0:
			return 1;
		case 'key_cs': //d
		case 1:
			return 1.122; 
		case 'key_d': //e
		case 2:
			return 1.2599;
		case 'key_ds': //g
		case 3:
			return 1.587;
		case 'key_e': //a
		case 4:
			return 1.6817;
		case 'key_f': // c
		case 5:
			return 1.9999;
		case 'key_fs': // d
		case 6:
			return 2.2448;
		case 'key_g': // e
		case 7:
			return 2.5197;
		case 'key_gs': // g
		case 8:
			return 2.9965;
		case 'key_a': // a
		case 9:
			return 3.3635;
		case 'key_as': // c
		case 10:
			return 3.9999;
		case 'key_b': // d
		case 11:
			return 4.4897;
	}
}

// function noteToMultiplier(note) {
// 	switch (note) {
// 		case 'key_c':
// 		case 0:
// 			return 1;
// 		case 'key_cs':
// 		case 1:
// 			return 1.059435;
// 		case 'key_d':
// 		case 2:
// 			return 1.122;
// 		case 'key_ds':
// 		case 3:
// 			return 1.1891;
// 		case 'key_e':
// 		case 4:
// 			return 1.2599;
// 		case 'key_f':
// 		case 5:
// 			return 1.3348;
// 		case 'key_fs':
// 		case 6:
// 			return 1.4141;
// 		case 'key_g':
// 		case 7:
// 			return 1.4982;
// 		case 'key_gs':
// 		case 8:
// 			return 1.587;
// 		case 'key_a':
// 		case 9:
// 			return 1.6817;
// 		case 'key_as':
// 		case 10:
// 			return 1.7817;
// 		case 'key_b':
// 		case 11:
// 			return 1.8877;
// 	}
// }

function milliToX(milli) {
	// 1000
	var fullWidth = $('#myCanvas').attr('width'),
		x = milli / (GLOBAL.timer * 100) * fullWidth - 5;
	return x;
}

function noteToY(note) {
	var fullHeight = $('#myCanvas').attr('height'),
		y = (noteToMultiplier(note) / 1.4 * fullHeight - 80);
	console.log(fullHeight - y);
	return fullHeight - y;
}

jQuery.fn.extend({
	disable: function(state) {
		return this.each(function() {
			var $this = $(this);
			if ($this.is('input, button'))
				this.disabled = state;
			else
				$this.toggleClass('disabled', state);
		});
	}
});