function datetime() {
//create the a Formatted Date Time Field

    var d = new Date();
    var dow = d.getDay();
    var hour = d.getHours();
    var minute = d.getMinutes();
    var month = d.getMonth();
    var day = d.getDate();
    var year = d.getFullYear();
    var ampm = 'AM';
    if (day < 10) {
        day = '0' + day;
    }

    if (hour > 12) {
        hour = hour - 12;
        ampm = 'PM';
    }
    if (minute < 10) {
        minute = '0' + minute;
    }

    var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var datetime = hour + ':' + minute + ' ' + ampm + ' ' + weekday[dow] + ', ' + months[month] + ' ' + day + ', ' + year;

    $("p.datetime").html(datetime);


    return;
}


function msg(message) {
	//used for logging messages
	
	var version = $("#K_version").text();
	var client  = $("#K_client").text();
	if (version=='TEST')	{
		//alert(message);
		if(typeof window.console != 'undefined')
			console.log(message);
	}	else
	if (version=='ENSEO')	{
		Nimbus.logMessage('|'+client+'| '+message );
	} else
	if (version=='TCM')	{
//		alert(message);
	}	
}


function dec2hex(id) {

    var returns = '';
    var cha = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
    var temp = '';
    while (id > 0) {
        i = id % 16;
        id = Math.floor(id / 16);
        temp = cha[i] + temp;
    }
    returns = temp.toLowerCase();

    return returns;
}

function getHour() {
    var d = new Date();
    var hour = d.getHours();

    return hour;
}


function checkforReload() {
    var ewf = ewfObject();
    var enabled = ewf['autoReload'];
    var reloadtime = ewf['autoReloadHour'] || 3;
    msg('checkforReload...reloadtime: ' + reloadtime);


    if (!enabled || enabled === 'false')
        return;

    var trigger = reloadtime * 1;
    var d = new Date();
    var hour = d.getHours();

    msg('checkforReload...hour/trigger: ' + hour + '/' + trigger);

    if (hour != trigger)
        return;

    var power = checkPower();
    msg('checkforReload...power: ' + power);

    // Force reload even TV is on
    reloadapp(true);
    /*
     if (power=='OFF')	{
     msg('checkforReload...RELOAD');
     reloadapp(true);
     }

     // special logic for KPNW, reload in discharged room even if TV is on
     else if (window.settings.status == '0') {
     msg('checkforReload...RELOAD in discharged room');
     reloadapp(true);
     }
     */
}

function getSettings() {
    var settings = '';
    var images = $("#K_images").text();
    var contrast = $("#K_contrast").text();
    var audio = $("#K_audio").text();

    if (audio)
        settings = audio;
    if (images)
        settings += ' ' + images;
    if (contrast)
        settings += ' ' + contrast;

    return settings;
}

function applySettings(selector) {
    var settings = getSettings();
    $(selector).removeClass('noimages lightdark darklight hearaudio');
    $(selector).addClass(settings);
}

function cacheSettings(noimages, lightdark, darklight, hearaudio) {
    var images = '';
    var contrast = '';
    var audio = '';

    if (noimages)
        images = 'noimages';
    if (lightdark)
        contrast = 'lightdark';
    if (darklight)
        contrast = 'darklight';
    if (hearaudio)
        audio = 'hearaudio';

    $("#K_audio").text(audio);
    $("#K_contrast").text(contrast);
    $("#K_images").text(images);
}


function formatdateTime(format, date) {
    var d = date || new Date();
    return d.format(format);
}

function compareDates(DateA, DateB) {


    var msDateA = new Date(DateA);
    var msDateB = new Date(DateB);

    if (msDateA <= msDateB)
        return -1;  // lt
    else if (msDateA == msDateB)
        return 0;  // eq
    else if (msDateA >= msDateB)
        return 1;  // gt
    else
        return null;  // error
}

function reloadapp(wait) {
    var version = window.settings.version;
    var noWait = !wait;
    if (version == 'ENSEO') {
        Nimbus.reload(noWait);
    }
    else if (version == 'NEBULA') {
        // kill TV player to prevent left-over
        Nebula.getRtspClient().stop();
        Nebula.getTVPlayer().stop(false);
        Nebula.removeCommandHandler(keyHandler);
        if (window.settings.platformVersion > '1.3') {
            Nebula.closeUserBrowser();
        }

        if (window.settings.platformVersion < '2.0') {
            // 1.x Nebula reload has leaks, use restart instead
            Nebula.restart(false);
        }
        else {
            Nebula.reload(wait);
        }
    }
    else if (version == 'PROCENTRIC') {
        // LG doesn't clear cache between reloads, reboot instead
        hcap.power.reboot({
            "onSuccess":function() {
                debug.log("reboot onSuccess");
            },
            "onFailure":function(f) {
                debug.log("onFailure : errorMessage = " + f.errorMessage);
            }
        });

    }
    else {
        window.location.href = '/ewf/';
    }
}

function reboot() {
    nova.tracker.event('device', 'reboot', window.settings.homeID, '', {'sessionControl': 'end'});
    msg('Rebooting device...');
    var version = window.settings.version;
    if (version == 'ENSEO') {
        Nimbus.reboot();
    }
    else if (version == 'NEBULA') {
        // kill TV player to prevent left-over
        Nebula.getRtspClient().stop();
        Nebula.getTVPlayer().stop(false);
        Nebula.removeCommandHandler(KeyHandler);
        Nebula.restart(true);
    }
    else {
        window.location.href = '/ewf/';
    }
}


function discharged()	{
    var page = window.pages.findPage('discharged');
    if(!page) {
        keypressed('CLOSEALL');
    	var page = new Discharged();
        page.render();
    }  		
}
function getSessionID()	{

	var mac	= getDevice();
	var sessionID = 'SEC'+mac.substr(7,5);

	var d = new Date();
	var day		= d.getDate();
	var month	= d.getMonth() + 1;	
	var hours 	= d.getHours();
	var minutes	= d.getMinutes();
	var seconds	= d.getSeconds();

	var year 	= d.getFullYear() - 2000;
	
	day 	= fixZero(day);
	month 	= fixZero(month);
	hours 	= fixZero(hours);
	minutes = fixZero(minutes);
	seconds = fixZero(seconds);
	
	var sessionDate = day+month+year+hours+minutes+seconds;
	
	sessionID = sessionID+sessionDate;
	
	return sessionID;	
}

function fixZero(val)	{
	val = ''+val;
	if (val.length==1) 
		val = '0'+val;
	return val;
}


function pause( iMilliseconds ) {

 var sDialogScript = 'window.setTimeout( function () { window.close(); }, ' + iMilliseconds + ');';

 }

 
 function setCC()	{
	
	var version = $("#K_version").text();
	msg(version); 
	if (version=='ENSEO' || version =='TEST')	{
		//var cc = Nimbus.getCCMode();
		var cc = Nimbus.GetAnalogCCMode();
		msg('IN SETCC and CC MODE =' + cc );
		
		if (cc!='')	{
			Nimbus.SetAnalogCCMode('CC1');
			msg('Closed Captioning has been turned ON to CC1');
		}	else
			if (cc=='CC1')	{
				Nimbus.SetAnalogCCMode('');
				msg('Closed Captioning has been turned OFF');
		}
	}
/* digital
		if (cc=='Off')	{
			Nimbus.setCCMode('On');
			msg('Closed Captioning has been turned ON');
		}	else
			if (cc=='On')	{
				Nimbus.setCCMode('Off');
				msg('Closed Captioning has been turned OFF');
			}
	}
*/	
	return;	
}

     function isPlayerError() {
        var player = Nimbus.getPlayer();
        var status = player.getErrorStatus();
		msg('isPlayerError ' + status);
        return (status >= 10);
    }
