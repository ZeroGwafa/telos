// alt1 base libs, provides all the commonly used methods for image matching and capture
// also gives your editor info about the window.alt1 api
import * as A1lib from "@alt1/base";
import * as ChatboxReader from "@alt1/chatbox";

import { TelosReader } from "./TelosReader";
import { _timer } from "./timer.js";
import { telosInterface } from "./interface.js";

import * as $ from "./jquery";

// tell webpack to add index.html and appconfig.json to output
require("!file-loader?name=[name].[ext]!./index.html");
require("!file-loader?name=[name].[ext]!./appconfig.json");


let attack_messages = {
	"uppercut": 	"Gielinor, give me strength",
	"tendril": 		"Your anima will return to the source",
	"stun": 		"Hold still, invader",
	"virus":		"The anima stream cleanses you",
	"anima":		"the anima consume you"
}

/* =======================
 * Read telos						
 */
let readTelos = new TelosReader();


/* =======================
 * Timers					
 */
var UI = new telosInterface();
var oldphase, newphase, beam_time;

function showOverlay(image, text) {
	// The overay is roughly 84px width
	const offset = -84 / 2;

	alt1.overLaySetGroup("Telos");
	alt1.overLayFreezeGroup("Telos");
	alt1.overLayClearGroup("Telos");
	alt1.overLayImage(
		Math.floor(alt1.rsWidth / 2) + offset, 
		Math.floor(alt1.rsHeight / 2), 
		A1lib.encodeImageString(image), 
		image.width, 
		700
	);
	alt1.overLayTextEx(
		text, 
		A1lib.mixColor(255,255,255),
		74,
		Math.floor(alt1.rsWidth / 2), 
		Math.floor(alt1.rsHeight / 2), 
		700,
		"",
		true,
		true
	)
	alt1.overLayContinueGroup("Telos");
}

function getColor(value) {
	var hue = (value * 1.2).toString(10);
	return "hsl(" + hue + ",75%,50%)";
}

function sanitisePercentage(i){
    return Math.min(100,Math.max(0,i));   
}

var beamTimer = new _timer(function(time) {
	var secs_left = (Math.floor(time / 600) * 0.6 );
	$("#beam_timer").html("Time until change: <br>" + secs_left.toFixed(1) + " seconds.");
	
	var percent = sanitisePercentage(secs_left / beam_time * 1000);
	if (UI.settings['stepless'] == 1) percent = sanitisePercentage(time / beam_time);
	
	$("#beamBar").width(percent + "%");
	$("#beamBar").css('background-color', getColor(percent));
	
	if (secs_left <= 0) {
		if (oldphase in readTelos.beamchange) {
			beamTimer.reset(beam_time = readTelos.beamchange[oldphase][1]);
		}
	}
});

var vulnTimer = new _timer(function(time) {
	var vuln_time = 600; // 60 seconds
	var secs_left = (Math.floor(time / 600) * 0.6 );
	$("#vuln_timer").html("Time until vuln wears off: <br>" + secs_left.toFixed(1) + " seconds.");
	
	var percent = sanitisePercentage(secs_left / vuln_time * 1000);
	if (UI.settings['stepless'] == 1) percent = sanitisePercentage(time / vuln_time);
	
	$("#vulnBar").width(percent + "%");
	$("#vulnBar").css('background-color', getColor(percent));
	
	if (time <= 0) {
		vulnTimer.stop();
	}
});

var FreedomTimer = new _timer(function(time) {
	// Why was this here?
	// if (readTelos.enrage == -1) return;
	
	var secs_left = (Math.floor(time / 600) * 0.6 );
	var telos_cd = readTelos.freedomCooldown();
	
	var percent = sanitisePercentage(secs_left / telos_cd * 1000);
	if (UI.settings['stepless'] == 1) percent = sanitisePercentage(time / telos_cd);
	
	$("#freedom_timer").html("Time until freedom: <br>" + secs_left.toFixed(1) + " seconds.");
	$("#freedomBar").width(percent + "%");
	
	// Telos is immune for 6 seconds on p5 after getting stunned
	if (readTelos.phase == 5 && ((telos_cd / 10) - secs_left) <= 6) {
		$("#freedomBar").css('background-color', '#6600cc'); 	
	} else {
		$("#freedomBar").css('background-color', getColor(percent));
	}
	
	if (time <= 0) {
		FreedomTimer.stop();
		return;
	}
});


var instaTimer = new _timer(function(time) {
	var insta_time = 126; // 60 seconds
	var secs_left = (Math.floor(time / 600) * 0.6 );
	$("#insta_timer").html("Time until insta kill: <br>" + secs_left.toFixed(1) + " seconds.");
	
	var percent = sanitisePercentage(secs_left / insta_time * 1000);
	if (UI.settings['stepless'] == 1) percent = sanitisePercentage(time / insta_time);
	
	$("#instaBar").width(percent + "%");
	$("#instaBar").css('background-color', getColor(percent));
	
	if (time <= 0) {
		instaTimer.stop();
	}
});


/* =======================
 * Chatbox reader
*/
var last_timestamp = 0;
function compare(str1: string, str2: string) {
    // Compare all languages with the input string
    let isMatch = str1.toLowerCase().includes(str2.toLowerCase());
	let timestamp = str1.match(/^\[(\d{2}):(\d{2}):(\d{2})\]/);
	
	// Verify that it is not a duplicate message
	if (timestamp && isMatch) {
		let time = parseInt(timestamp[1]) * 3600 + parseInt(timestamp[2]) * 60 + parseInt(timestamp[3]);
		if (time <= last_timestamp) {
			// Duplicate message
			return false;
		}
		last_timestamp = time;
	}

	return isMatch;
}

let reader = new ChatboxReader.default();
reader.readargs = {
    colors: [
        A1lib.mixColor(255,255,255),    // White (Timestamp)
        A1lib.mixColor(127,169,255),    // Blue (Timestamp)

		A1lib.mixColor(132,212,119),	// green
		A1lib.mixColor(195,16,16),		// red
		A1lib.mixColor(0,255,0),		// green
		A1lib.mixColor(255,0,0),		// red

		// For testing
		A1lib.mixColor(250,180,2),	
		A1lib.mixColor(127,169,255),

	]
};

function showSelectedChat(pos) {
    // Attempt to show a temporary rectangle around the chatbox.  skip if overlay is not enabled.
    try {
		alt1.overLayRect(
			A1lib.mixColor(0,255,0),
			pos.mainbox.rect.x,
			pos.mainbox.rect.y,
			pos.mainbox.rect.width,
			pos.mainbox.rect.height,
			2000,
			5
		);
    } catch { }
}


function readChatbox() {
    var opts = reader.read() || [];
	let phase = readTelos.readPhase() || readTelos.phase;

	// Loop through all the messages	
	for (const idx in opts) {
		console.log(opts[idx].text);

		// Instance made
		if (compare(opts[idx].text, "Telos, the Warden")) {
			readTelos.phase = 1;
			readTelos.lastAttack = ["1", "N/A"];
			readTelos.nextAttack = "tendril";
			beamTimer.reset(0);
			beamTimer.stop();
			continue;
		}
		
		// Telos enrage message when using custom enrage
		var m = opts[idx].text.match(/(\d{1,4})% enrage/);
		if (m) {
			readTelos.enrage = +m[1];
			console.log("Enrage: " + readTelos.enrage);
			continue;
		}

		// Look for Telos attack messages
		for (const attack in attack_messages) {
			if (compare(opts[idx].text, attack_messages[attack])) {
				console.log(attack);
				readTelos.lastAttack = [phase.toString(), attack];
				readTelos.updateNextAttack();
				break;
			}
		}

		// Timers
		if (compare(opts[idx].text, "Telos breaks free")) {
			readTelos.readEnrage(); // Update enrage
			FreedomTimer.reset(readTelos.freedomCooldown());
			FreedomTimer.start(UI.settings['stepless'] == 1 ? 10 : 100);
			continue;
		}
		if (compare(opts[idx].text, "hex to your target")) { // TODO: why do we support this?
			vulnTimer.reset(600);
			vulnTimer.start(UI.settings['stepless'] == 1 ? 10 : 100);
			continue;
		}
		if (compare(opts[idx].text, "font to interrupt")) {
			instaTimer.reset(132);
			instaTimer.start(UI.settings['stepless'] == 1 ? 10 : 100);
			continue;
		}
	}
}

// Check if we are running inside alt1 by checking if the alt1 global exists
if (window.alt1) {
	// "Add app" button when openend in alt1 browser
    alt1.identifyAppUrl("./appconfig.json");

	localStorage.removeItem('settings'); // TODO: Wait what? Who the fuck wrote this

	UI.init();
	UI.telosMenu();

	let findChat = setInterval(function () {
		if (reader.pos === null)
			reader.find();
		else {
			console.log("Found chatbox");
			clearInterval(findChat);
	
			if (localStorage.ccChat) {
				reader.pos.mainbox = reader.pos.boxes[localStorage.ccChat];
			} else {
				//If multiple boxes are found, this will select the first, which should be the top-most chat box on the screen.
				reader.pos.mainbox = reader.pos.boxes[0];
			}
	
			showSelectedChat(reader.pos);
			setInterval(function () {
				readChatbox();

				// Check for phase transitions.
				newphase = readTelos.readPhase();
				if (newphase != null && newphase != oldphase) {
					oldphase = newphase;
					if (newphase in readTelos.beamchange) {
						beamTimer.reset(beam_time = readTelos.beamchange[newphase][0]);
						beamTimer.start(UI.settings['stepless'] == 1 ? 10 : 100);
					} else {
						beamTimer.reset(0);
						beamTimer.stop();
					}
					readTelos.updateNextAttack();
					//$("#last_attack").html("Last attack: P" + readTelos.lastAttack[0] + " " + readTelos.lastAttack[1]);
					//$("#next_attack").html("Next attack: P" + readTelos.phase + " " + readTelos.nextAttack);
					$("#last_attack > td:first").html("Last attack: ");
					$("#last_attack > td:last").html("P" + readTelos.lastAttack[0] + " " + readTelos.lastAttack[1].replace(/^\w/, c => c.toUpperCase()));
					$("#next_attack > td:first").html("Next attack: ");
					$("#next_attack > td:last").html("P" + readTelos.phase + " " + readTelos.nextAttack.replace(/^\w/, c => c.toUpperCase()));
				}
				if (readTelos.phase == 5 && UI.settings['showP5'] == 1) {
					var atk = readTelos.countP5() || readTelos.P5count;
					$(".crty-header").text("Telos attacks: " + atk);
				}
			}, 600);
		}
	}, 1000);
}