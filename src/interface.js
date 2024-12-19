import * as $ from "./jquery";

export function setTooltips(el) {
	$(el).tooltipster({
		functionInit: function (instance, helper) {
	    	if(!$(helper.origin).attr('data-tooltip-content')) return;
	    	var crewM = $(helper.origin).attr('data-tooltip-content').split('-');
	    	var selected = pCrew.getCrew(crewM[0], crewM[1]);
			var frag = eldiv('tooltip_content', [
	    		eldiv({id:'crewTooltip'}, [
	    			eldiv('crewBody', [
	    				eldiv('name', {tag:'span'}, [selected.name]),
	    				eldiv('crew '+selected.type),
	    				eldiv('level', ['Level '+selected.level]),
	    				eldiv('stat morale', [selected.morale, eldiv({tag:'span'}, ['Morale:'])]),
						eldiv('stat combat', [selected.combat, eldiv({tag:'span'}, ['Combat:'])]),
						eldiv('stat seafaring', [selected.seafaring, eldiv({tag:'span'}, ['Seafaring:'])]),
						eldiv('stat speed', [selected.speed, eldiv({tag:'span'}, ['Speed:'])]),
						eldiv('traits', {tag:'span'}, [selected.type])
	    			])
	    		])
	    	]);
	    	$(helper.origin).append(frag)
			var content = $(helper.origin).find('.tooltip_content').detach();
	      	if(content.length > 0) {
	      		instance.content(content);
	      	}
	    }, plugins: ["follower"]
	});
}

export function telosInterface() {
	var me = this;
	this.settings = {
		activetab: 		0,
		showAttacks:	1,
		showFreedom: 	1,
		showBeam: 		1,
		showVuln:		1,
		showInsta:		0,
		showP5:			0,
		stepless:		0,
		minified:		0,
		refreshRate:  200,
	}
	var tooltips = {
		showAttacks:	"Show the special attack Telos used last and what attack will come next.",
		showFreedom: 	"Telos is able to freedom from stuns. Telos can only use freedom at certain intervals. This will keep track of the cooldown. The progress bar will turn purple if Telos is temporarly immune for stuns (only on phase 5)",
		showInsta:		"Beta",
		showBeam: 		"A timer which will show you when the beam will change on phase 2, 3 and 5",
		showP5:			"Counts the attacks on phase 5. The bleed is the 10th attack before instakill and the 12th if an instakill has happened.",
		stepless:		"The progress bars will update ones per tick (600ms) if this option is turned off. You can turn this on if you prefer a smooth progress bar",
		refreshRate:  	"Every x milliseconds this tool will check for new chatbox messages and if the phase has changed. For high accuracy of the timers a low refresh rate is recommended. Atleast ones per tick (600ms). If you have a slow pc you can increase this number. Restart the script after changing this value!",
		
	}
	this.init = function() {
		if (localStorage.telos_settings) {
			me.settings = JSON.parse(localStorage.telos_settings);
		} else {
			localStorage.telos_settings = JSON.stringify(me.settings);
		}
		$(".contenttab").click(function() {
			$(".activetab").removeClass("activetab");
			$(this).addClass("activetab");
			me.settings.activetab = $(".contenttab").index(this);

			// Call function that belongs to clicked tab
			me[$(this).attr('id')]();
		});
	}
	this.telosMenu = function() {
		var html = '';
		me.settings['minified'] = 0;
		if (me.settings['showP5'] == 1) {
			html += '<div class="crty-header">Telos attacks: 0</div>';
		} else {
			html += '<div class="crty-header">Telos Helper</div>';
		}
		if (me.settings['showAttacks'] == 1) {
			if (me.settings['minified'] == 1) {

			} else {
				html += '<div class="crty-story" style="z-index: -1; position:relative;">';
				html += '<table><tbody style="font-size:14px;">';
				html += '<tr id="last_attack"><td>Last attack: </td><td>P1 N/A </td>';
				html += '<tr id="next_attack"><td>Next attack: </td><td>P1 Tendril </td>';
				html += '</tbody></table>';
				html += '</div>';
				html += '<div class="nisseperator"></div>';
			}
		}
		if (me.settings['showFreedom'] == 1) {
			if (me.settings['minified'] == 1) {
				html += '<div class="crty-story" style="z-index: -1; position:relative;text-align:center">';
				html += '	<img src="images/Freedom.webp" height="30" width="30"/>';
				html += '	<span id="freedom_timer" style="font-size:16px; font-weight: bold; padding-left: 20px;">0.0s</span>';
				html += '</div>';
				html += '<div class="crty-story" style="z-index: -1; position:relative;">';
				html += '	<div class="myProgress" style="color:black">';
				html += '		<div class="myBar" id="freedomBar">';

				html += '		</div>';
				html += '	</div>';
				html += '</div>';
				html += '<div class="nisseperator"></div>';
			} else {
				html += '<div class="crty-story" style="z-index: -1; position:relative;">';
				html += '	<img src="images/Freedom.webp" height="30" width="30"/>';
				html += '	<span id="freedom_timer" style="font-size:14px">Time until freedom: <br>0.0 seconds.</span>';
				html += '</div>';
				html += '<div class="crty-story" style="z-index: -1; position:relative;">';
				html += '	<div class="myProgress" style="color:black">';
				html += '		<div class="myBar" id="freedomBar">';

				html += '		</div>';
				html += '	</div>';
				html += '</div>';
				html += '<div class="nisseperator"></div>';
			}
		}
		

		if (me.settings['showBeam'] == 1) {
			if (me.settings['minified'] == 1) {
				
			} else {
				html += '<div class="crty-story" style="z-index: -1; position:relative;">';
				html += '	<img src="images/Green_stream_status_icon.webp" height="30" width="30"/>';
				html += '	<span id="beam_timer" style="font-size:14px">Time until change: <br>0.0 seconds.</span>';
				html += '</div>';
				html += '<div class="crty-story" style="z-index: -1; position:relative;">';
				html += '	<div class="myProgress" style="color:black">';
				html += '		<div class="myBar" id="beamBar">';

				html += '		</div>';
				html += '	</div>';
				html += '</div>';
				html += '<div class="nisseperator"></div>';
			}
		}
		if (me.settings['showVuln'] == 1) {
			if (me.settings['minified'] == 1) {
				
			} else {			
				html += '<div class="crty-story" style="z-index: -1; position:relative;">';
				html += '	<img src="images/Vulnerability_icon.webp" height="28" width="24"/>';
				html += '	<span id="vuln_timer" style="font-size:14px">Time until vuln wears off: <br>0.0 seconds.</span>';
				html += '</div>';
				html += '<div class="crty-story" style="z-index: -1; position:relative;">';
				html += '	<div class="myProgress" style="color:black">';
				html += '		<div class="myBar" id="vulnBar">';

				html += '		</div>';
				html += '	</div>';
				html += '</div>';
				html += '<div class="nisseperator"></div>';
			}
		}
		
		if (me.settings['showInsta'] == 1) {
			if (me.settings['minified'] == 1) {
				html += '<div class="crty-story" style="z-index: -1; position:relative;text-align:center">';
				html += '	<img src="images/instakill.webp" height="30" width="30"/>';
				html += '	<span id="insta_timer" style="font-size:16px; font-weight: bold; padding-left: 20px;">0.0s</span>';
				html += '</div>';
				html += '<div class="crty-story" style="z-index: -1; position:relative;">';
				html += '	<div class="myProgress" style="color:black">';
				html += '		<div class="myBar" id="instaBar">';

				html += '		</div>';
				html += '	</div>';
				html += '</div>';
				html += '<div class="nisseperator"></div>';
			} else {
				html += '<div class="crty-story" style="z-index: -1; position:relative;">';
				html += '	<img src="images/instakill.webp" height="30" width="30"/>';
				html += '	<span id="insta_timer" style="font-size:14px">Time until insta kill: <br>0.0 seconds.</span>';
				html += '</div>';
				html += '<div class="crty-story" style="z-index: -1; position:relative;">';
				html += '	<div class="myProgress" style="color:black">';
				html += '		<div class="myBar" id="instaBar">';

				html += '		</div>';
				html += '	</div>';
				html += '</div>';
				html += '<div class="nisseperator"></div>';
			}
		}
		$("#overview").html(html);
	}
	this.infoMenu = function() {
		var html = '';

		html += '<div class="crty-header">Telos attack</div>';
		html += '<div class="crty-story">This tool shows you what the last special attack was based on chatbox messages. The next attack is based of the attack rotation found on ';
		html += '	<a href="https://runescape.wiki/w/Telos,_the_Warden/Strategies#The_Fight">wiki</a>.';
		html += '</div>';

		html += '<div class="crty-header">Freedom timer</div>';
		html += '<div class="crty-story">After you stun Telos he might use the Freedom ability. This will free him from any current stuns and on phase 5 Telos becomes stun immune past 250% enrage. ';
		html += 'Telos will use Freedom more frquently at higher enrages. Below 250% enrage Telos is able to use his stuns every 30 seconds, between 250% and 999% enrage Telos is able to use his stuns every 20 seconds ';
		html += 'and after 1000% enrage Telos is able to use his Freedom every 10 seconds.';
		html += '</div>';
		html += '<div class="crty-story">The progressbar shows you how long it\'ll take before telos can freedom again';
		html += 'If the bar is bright-red (which only happens on phase 5) Telos is immune for stuns for 6 seconds and can\'t be stunned';
		html += '</div>';

		html += '<div class="crty-header">Beam timer</div>';
		html += '<div class="crty-story">';
		html += ' The beam changes on phase 2, 3 and 5 are time-based and are tracked with this tool.';
		html += '</div>';

		html += '<div class="crty-header">Settings</div>';
		html += '<div class="crty-story">';
		html += 'No info yet';
		html += '</div>';

		html += '<div class="crty-header">Debug</div>';
		html += '<div class="crty-story">';
		html += 'Used for debugging.';
		html += '</div>';

		$("#overview").html(html);
	}
	this.settingsMenu = function() {
		function radiobutton(header, name) {
			return $("<tr>")
			.append(
				$("<td>").text(header)
			)
			.append(
				$("<td>")
				.append(
					$("<input>").attr({
						type: 	"radio",
						name: 	name,
						value: 	"1",
					})
				)
				.append("true")
			)
			.append(
				$("<td>")
				.append(
					$("<input>").attr({
						type: 	"radio",
						name: 	name,
						value: 	"0",
					})
				)
				.append("false")
			)
			.attr({
				class: "tooltip tooltipster",
				title: tooltips[name]
			})
		}
		$("#overview")
		.html(
			$("<div>").attr({
				class: "crty-header"
			}).text("Layout")
		)
		.append(
			$("<table>", {
				class: "Settings"
			})
			.append(
				$("<tbody>")
				.append(
					radiobutton("Special Attacks", "showAttacks")
				)
				.append(
					radiobutton("Freedom timer", "showFreedom")
				)
				.append(
					radiobutton("Beam timer", "showBeam")
				)
				.append(
					radiobutton("Vuln timer", "showVuln")
				)
				.append(
					radiobutton("Insta timer", "showInsta")
				)
				.append(
					radiobutton("P5 counter", "showP5")
				)
			)
		)
		.append(
			$("<div>").attr({
				class: "crty-header"
			}).text("Performance")
		)
		.append(
			$("<table>", {
				class: "Settings"
			})
			.append(
				$("<tbody>")
				.append(
					$("<tr>")
					.append(
						$("<td>").text("Check every x milliseconds")
					)
					.append(
						$("<td>", { colspan: 2 })
						.append(
							$("<input>").attr({
								type:	'number',
								min:	'100',
								max:	'5000',
								style:	'width:45px',
								id:		'refreshRate',
								step:	'100',
								value:	me.settings.refreshRate
							})
						)
					)
					.attr({
						class: "tooltip tooltipster",
						title: tooltips['refreshRate']
					})
				)
				.append(
					radiobutton("Stepless timer bars", "stepless")
				)
			)
		)
		/*
		var html = '';
		html += '<div class="crty-header">Layout</div>';
		html += '<table>';
		html += '	<tbody>';
		html += '		<tr style="width:100%">';
		html += '			<td>Special Attacks</td>';
		html += '			<td><input type="radio" name="showAttacks" value="1">true</td>';
		html += '			<td><input type="radio" name="showAttacks" value="0">false</td>';
		html += '		</tr>';
		html += '		<tr>';
		html += '			<td>Freedom timer</td>';
		html += '			<td><input type="radio" name="showFreedom" value="1">true</td>';
		html += '			<td><input type="radio" name="showFreedom" value="0">false</td>';
		html += '		</tr>';
		html += '		<tr>';
		html += '			<td>Beam timer</td>';
		html += '			<td><input type="radio" name="showBeam" value="1">true</td>';
		html += '			<td><input type="radio" name="showBeam" value="0">false</td>';
		html += '		</tr>';
		html += '	</tbody>';
		html += '</table>';
		
		html += '<div class="crty-header">Performance</div>';
		html += '<table>';
		html += '	<tbody>';
		
		html += '		<tr style="width:100%">';
		html += '			<td>Check every x milliseconds</td>';
		html += '			<td colspan="2"><input type="number" min="0" max="1800" style-"width:45px" id="refreshRate" step="100" value="' + me.settings.refreshRate + '"/>';
		html +=	'			</td>';
		html += '		</tr>';
		
		html += '		<tr class="tooltip tooltipster" title="hallo!">';
		html += '			<td>Stepless timer bars</td>';
		html += '			<td><input type="radio" name="stepless" value="1">true</td>';
		html += '			<td>';
		html += '				<input type="radio" name="stepless" value="0">false';
		html +=	'			</td>';
		html += '		</tr>';
		html += '	</tbody>';
		html += '</table>';
		
		$("#overview").html(html);
		*/
		
		$("input[type=radio").each(function () {
			if (this.value == me.settings[this.name]) this.checked = true;
		});
		$("input[type=radio").click(function () {
			me.settings[this.name] = this.value;
			
			localStorage.telos_settings = JSON.stringify(me.settings);
		});
		$("#refreshRate").change(function () {
			var val = Math.max(Math.min(1800, this.value), 10);
			this.value = val;
			me.settings['refreshRate'] = val;
			localStorage.telos_settings = JSON.stringify(me.settings);
			console.log('value: ' + this.value);
		});
		setTooltips('.tooltip');
	}
	this.debugMenu = function() {
		var html = '';
		html += '<style type="text/css">';
		html += '	#eventlog{position:absolute; top:210px; right:5px; bottom:5px; left:5px; white-space:pre; background:rgba(0,0,0,0.5); outline:1px solid gray; padding:5px; font-family:monospace; overflow-x:hidden; overflow-y:auto;}';
		html += '	#capturecnv{position:absolute; top:5px; left:5px; height:200px; width:calc(100% - 130px); background:url(\'transblocks.png\'); outline:1px solid gray;}';
		html += '	#xpdroptoggle{position:absolute; top:0px; right:0px; width:90px;}';
		html += '	#docapturebutton{position:absolute; top:40px; right:0px; width:90px;}';
		html += '	#tooltipbutton{position:absolute; top:80px; right:0px; width:90px;}';
		html += '	#xpcountertoggle{position:absolute; top:120px; right:0px; width:90px;}';
		html += '	#coloroutput{position:absolute; top:165px; height:40px; width:115px; right:5px; outline:1px solid gray; color:white; text-shadow:1px 1px 0px black;}';
		html += '</style>';
		html += '<canvas id="capturecnv"></canvas>';
		html += '<div id="docapturebutton" class="nisbutton" onclick="docapture();">Capture</div>';
		html += '<div id="eventlog" class="nistext"></div>';
		$("#overview").html(html);
	}
}

export function message(str) {
	if (elid("eventlog")) {
		elid("eventlog").innerHTML = str + "\n" + elid("eventlog").innerHTML;
	}
}