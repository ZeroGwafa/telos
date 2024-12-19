import * as A1lib from "@alt1/base";


var imgs = A1lib.ImageDetect.webpackImages(
    {
        "phaseImg": require("./images/phase.data.png"),
        "enrageImg": require("./images/enrage.data.png"),
	}
);

function coldiff(r1, g1, b1, r2, g2, b2) {
	return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
}

export function TelosReader() {
	var me = this;
	
	this.phase = 1;
	this.enrage = -1;

	this.lastAttack = ["1", "N/A"];
	this.nextAttack = "tendril";
	this.P5count = 0;

	// Beam changes in 1/10th of a second. First value is on phase start. The second value is every other beam after that
	// Maybe changing this to time until first beam
	this.beamchange = {
		"2": [320, 210],
		"3": [320, 210],
		"5": [331, 372]
	}
	
	// First number is last phase. Second number the current phase
	this.specialAttacks = {
		"1": {
			"N/A": {
				"1": "tendril",
				"2": "tendril",
				"3": "uppercut",
				"4": "uppercut",
				"5": "virus"
			},
			"tendril": {
				"1": "uppercut",
				"2": "stun",
				"3": "stun or virus",
				"4": "stun",
				"5": "virus"
			},
			"uppercut": {
				"1": "stun",
				"2": "stun",
				"3": "uppercut", 
				"4": "uppercut",
				"5": "virus"
			},
			"stun": {
				"1": "tendril",
				"2": "tendril",
				"3": "virus", 
				"4": "anima",
				"5": "virus"
			}
		},
		"2": {
			"tendril": {
				"2": "stun",
				"3": "stun or virus", 
				"4": "anima",
				"5": "virus"
			},
			"stun": {
				"2": "virus",
				"3": "uppercut", 
				"4": "stun",
				"5": "virus"
			},
			"virus": {
				"2": "uppercut",
				"3": "uppercut", 
				"4": "stun",
				"5": "virus"
			},
			"uppercut": {
				"2": "tendril",
				"3": "uppercut", 
				"4": "stun",
				"5": "virus"
			}
		},
		"3": {
			"uppercut": {
				"3": "stun", 
				"4": "uppercut",
				"5": "virus"
			},
			"stun": {
				"3": "virus", 
				"4": "anima",
				"5": "virus"
			},
			"virus": {
				"3": "uppercut", 
				"4": "stun",
				"5": "virus"
			}
		},
		"4": {
			"uppercut": {
				"4": "anima",
				"5": "virus"
			},
			"anima": {
				"4": "stun",
				"5": "virus"
			},
			"stun": {
				"4": "uppercut",
				"5": "virus"
			}
		},
		"5": {
			"virus": {
				"5": "Insta kill"
			},
			"N/A": {
				"1": "tendril",
				"5": "tendril"
			}
		}
	}


	// Freedom cooldown after freeing - Telos breaks free from its bindings.
	// Telos will be immune for 6 seconds after freeing on phase 5 at 250% enrage and above
	// Values are in 1/10th seconds (seconds * 10)
	this.freedomCooldown = function() {
		if (this.enrage < 250) {
			return 300;
		}
		if (this.enrage <= 999) {
			return 186; 
		}
		if (this.enrage >= 1000) {
			return 96;
		}
	}

	// Still unsure how this works but these values seem to work on different resolutions
	this.enrage_pos = null;
	this.phase_pos = null;
	this.find = function(img) {
		if (!img) img = A1lib.captureHoldFullRs();
		if (!img) return null;
		
		var phaseImg = img.findSubimage(imgs.phaseImg);
		if (phaseImg.length != 0) {
			this.phase_pos = {
				x: phaseImg[0].x - 5,
				y: phaseImg[0].y - 5,
				w: 60,
				h: 24,
				xos: 10,
				yos: 12
			}
			console.log(this.phase_pos);
		}

		var enrageImg = img.findSubimage(imgs.enrageImg);
		if (enrageImg.length != 0) {
			this.enrage_pos = {
				x: enrageImg[0].x + 5,
				y: enrageImg[0].y + 1,
				w: 100,
				h: 40,
				xos: 11,
				yos: 13
			}
			console.log(this.enrage_pos);
		}
	}
	
	this.updateNextAttack = function() {
		if (!this.phase_pos) {
			this.find();
		}
		if (!this.phase_pos) {
			return null;
		}
		me.readPhase();
		var lastPhase = me.lastAttack[0];
		var lastAttack = me.lastAttack[1];
		console.log("last phase: " + lastPhase + " Lastattack: " + lastAttack);
		if (lastPhase && lastAttack) {
			if (me.specialAttacks[lastPhase][lastAttack]) {
				me.nextAttack = me.specialAttacks[lastPhase][lastAttack][me.phase];
			} else {
				console.log("last phase: " + lastPhase + " Lastattack: " + lastAttack);
			}

		}
	}
	this.countP5 = function () {
		if (!this.phase_pos) {
			return null;
		}
		var pos = this.phase_pos;
		
		if (this.phase == 5) {
			var width = 160
			var buffer = A1lib.capture(pos.x + pos.w + 30, pos.y - 4, 200, 5);
			var b;
			for (b = 0; b < 200; b++) {
				var i = buffer.pixelOffset(b + 7, 2);
				if (coldiff(buffer.data[i], buffer.data[i + 1], buffer.data[i + 2], 18, 22, 22) < 20) {
					break;
				}
			}

			// Removing minion spawn
			var atk = [0,4,10,/*17,*/ 23,30,36,42,49,55,62,68,74,81,87,94,100,106,113,119,126,132,138,145,151,158].indexOf(b);
			if (atk != -1) {
				this.P5count = atk;
				return this.P5count;
			}
			
		}
		return null;
	}

	this.readPhase = function() {
		if (!this.phase_pos) {
			return null;
		}
		var pos = this.phase_pos;
		var img = A1lib.captureHold(pos.x, pos.y, pos.w, pos.h);

		// Find the string in the region
		var str = alt1.bindReadColorString(img.handle, "chat", A1lib.mixColor(255, 255, 255), pos.xos, pos.yos);
		var m = str.match(/Phase: (\d{1})/);
		
		if (!m) {
			return null;
		}
		this.phase = +m[1];
		
		return this.phase;
	}

	this.readEnrage = function() {
		if (!this.enrage_pos && !this.phase_pos) {
			this.find();
		}
		if (!this.enrage_pos) {
			return null;
		};
		var pos = this.enrage_pos;
		var img = A1lib.captureHold(pos.x, pos.y, pos.w, pos.h);
		//drawImg(A1lib.getregion(x, y, w, h)); // Debug info

		// Find the string in the region
		var str = alt1.bindReadColorString(img.handle, "chat", A1lib.mixColor(255, 255, 255), pos.xos, pos.yos);
		console.log(str);
		var m = str.match(/Enrage: (\d{1,4})%/);
		if (!m) {
			m = str.match(/Rage: (\d{1,4})/);
		}
		if (!m) {
			return null;
		}
		this.enrage = +m[1];
		
		return this.enrage;
	}
}