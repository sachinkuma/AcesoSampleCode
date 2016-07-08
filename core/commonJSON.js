/**
 * @brief
 * Basic JSON file handling
 * key mapping
 */

function loadPackageJson() {
    var packageJson = ajaxJSON('package.json');
    window.package = packageJson || {};
    window.package.version = (packageJson.version || '0.0.0.0').replace('$(COMMIT)', '0').replace('$(BUILD)', '0');
    return packageJson;
}

function loadConfigJson() {
    var config = ajaxJSON('portalconfig.json') || ajaxJSON('portalconfig.prod.json');
    window.portalConfig = config || {};
    window.settings = window.settings || {}; // runtime settings
    window.pages = window.pages || []; // page stack
    return config;
}

function loadConfigOverride() {
    // in portalConfig.json we allow a special section "overrideByTVNumber" to hold specific config for each
    // TV location.  Eg: TV A will have regular Ed library while TV B will have a Mother/Baby ED library.
    var config = ewfObject();
    var override = config.overrideByTvNumber;
    var tvNumber = window.settings.tvNumber;

    if (!tvNumber || !override || !override[tvNumber])
        return;

    $.extend(config, override[tvNumber]);
    window.portalConfig = config;
}

function ewfObject() {
    var client = 'SMC';
    $("#K_client").text(client);

    // Portal config has been extracted to a seperated file portalconfig.json in the same folder as index.html'
    // By default the SVN package should include a portalconfig.template.json file.
    // When deploying copy this file and rename to portalconfig.json.
    // Developer should NOT check in the local portalconfig.json file
    return window.portalConfig;
}


function getRating(code) {

    var rating = '';
    var ratingA = Array();

    ratingA['0'] = 'Not Rated';
    ratingA['1'] = 'G';
    ratingA['2'] = 'PG';
    ratingA['3'] = 'PG-13';
    ratingA['4'] = 'R';
    ratingA['5'] = 'NC-17';
    ratingA['6'] = 'Adult';
    ratingA['7'] = 'Unknown';
    ratingA['8'] = 'Unknown';
    ratingA['9'] = 'Unknown';

    rating = ratingA[code - 1];

    return rating;
}

function getDevice() {

    var currentURL = location.href;
    var search = location.search;
    var version = $("#K_version").text();
    var mac = $("#K_mac").text();
    var ip = 'Unknown';
    var platformversion = 'Unknown';
    if (typeof window['EONimbus'] != 'undefined') {
        var device_list = Nimbus.getNetworkDeviceList();
        var name = device_list[0];
        var device = Nimbus.getNetworkDevice(name);
        mac = device.getMAC().replace(/:/gi, '');
        ip = device.getIP() || 'Unknown';
        platformversion = Nimbus.getFirmwareRevision() || 'Unkown';
        version = 'ENSEO';
    }

    else if (typeof window['EONebula'] != 'undefined') {
        var device_list = Nebula.getNetworkDeviceList();
        var name = device_list[0];
        var device = Nebula.getNetworkDevice(name);
        mac = device.getMAC().replace(/:/gi, '');
        if (device.getIP)
            ip = device.getIP() || 'Unknown';
        if (Nebula.getNativeRevision)
            platformversion = Nebula.getNativeRevision() || 'Unkown';
        version = 'NEBULA';

    }

    // check if this is LG
    else if (typeof window.LG != "undefined") {
        debug.log('[commonJSON] getDevice()');
        try {
            var device = window.LG.getNetworkDevice(0);
        } catch (e) {
            debug.log('[getNetworkDevice error] ' + e.message);
        }
        mac = device.getMac().replace(/:/gi, '');
        debug.log('[commonJSON: device.getMac()]: ' + mac);
        ip = device.getIp() || 'Unknown';
        platformversion = window.LG.getPlatformVersion() || 'Unkown';
        version = 'PROCENTRIC';
        debug.log('[commonJSON: version]:' + version);
    }


    else {
        if (!version || !mac) {
            if (currentURL.indexOf("https:\/\/") != -1) var obj = currentURL.replace("https:\/\/", "");
            else var obj = currentURL.replace("http:\/\/", "");
            obj = obj.split("\/");
            var currentDomain = obj[0];
            var currentPortal = obj[1];
            paramArray = obj[2].replace("index.html?", "").split("\&");
            var i;
            for (var i = 0; i < paramArray.length; i++) {
                if (unescape(paramArray[i].split("\=")[0]) == "device-id")  mac = paramArray[i].split("\=")[1];
                if (unescape(paramArray[i].split("\=")[0]) == "PollingIP")  var PollingIP = paramArray[i].split("\=")[1] || "";
                if (unescape(paramArray[i].split("\=")[0]) == "PollingPort")  var PollingPort = paramArray[i].split("\=")[1] || "";
                if (unescape(paramArray[i].split("\=")[0]) == "pageName")  var pageName = paramArray[i].split("\=")[1] || "";
                if (unescape(paramArray[i].split("\=")[0]) == "assetLocalEntryUID")   var assetLocalEntryUID = paramArray[i].split("\=")[1] || "";
                if (unescape(paramArray[i].split("\=")[0]) == "ticketID")  var ticketID = paramArray[i].split("\=")[1] || "";
                if (unescape(paramArray[i].split("\=")[0]) == "guestName")  var guestName = paramArray[i].split("\=")[1] || "";
            }
            version = 'TCM';
        }
    }

    var ewf = ewfObject();

    if (!mac || mac == 'test') {
        var tmac = (typeof ewf.browser != 'undefined' && typeof ewf.browser.mac != 'undefined') ? ewf.browser.mac : "0021F80484B1";
        //mac = "3CCD938785A0"
        mac = tmac;
        //mac = "0021F80484B1";

        version = 'TEST'
    } else if (mac == 'test2') {
        mac = "00045F905DC4";
        version = 'TEST'
    }
    $("#K_mac").text(mac);
    $("#K_version").text(version);
    $('#K_ip').text(ip);
    
    window.settings.mac = mac;
	
    window.settings.version = version;
    window.settings.ip = ip;
    window.settings.platformVersion = platformversion;
    return mac;
}

function cleanJSON(data) {

    data = clean2JSON(data);
    data = clean5JSON(data);

    return data;
}

function clean1JSON(data) {

    check1 = data.indexOf('/');
    if (check1 != -1) {
        while (data != (data = data.replace('/', '&#47;')));
    }

    return data;
}

function clean2JSON(data) {


    data = data.replace(/\\/g, '&#47;');    // convert all backslashes to slashes in SeaChange response
    data = data.replace(/&#47;"/g, '\\"'); // convert actual double quotation back

    return data;
}

function clean3JSON(data) {

    check3 = data.indexOf(',http');
    if (check3 != -1) {
        while (data != (data = data.replace(',http', ' http')));
    }

    return data;
}

function clean4JSON(data) {

    check4 = data.indexOf('http://192.168.200.60:9090/Poster/');
    if (check4 != -1) {
        while (data != (data = data.replace('http://192.168.200.60:9090/Poster/', '')));
    }
    check4 = data.indexOf('http://192.168.100.60:9090/PICTURE/FOLDER/');
    if (check4 != -1) {
        while (data != (data = data.replace('http://192.168.100.60:9090/PICTURE/FOLDER/', '')));

    }
    return data;
}

function clean5JSON(data) {


    data = data.replace(/[\r\n]/g, '');
    return data;
}

function clean6JSON(data) {

    while (data != (data = data.replace(null + ',', '')));

    return data;
}


function ajaxJSON(url, args, ignore) {


    try {
        var data = $.ajax({
            url: url,
            data: args,
            async: false,
            dataType: "json",
            cache: false
        }).responseText;

        msg('XHR finished loading: ' + url + '?' + args);

        if (ignore) {
            msg('Ignoring JSON Returned Data: ' + url + '?' + args);
            return;
        }
        ;
        if (!data) {
            msg('FATAL ERROR!! JSON Data Not Found:  ' + url + '?' + args + '  resulted in: NO DATA');
            return;
        }
        ;
        if (data == '' || data == ' ') {
            msg('FATAL ERROR!! JSON Data Incomplete: ' + url + '?' + args + '  resulted in: ' + data);
            return;
        }
        ;
        if (data.indexOf('{0}') != -1) {
            msg('FATAL ERROR!! JSON Data Incomplete: ' + url + '?' + args + '  resulted in: ' + data);
            return;
        }
        ;
        if (data.indexOf('<?xml') != -1) {
            msg('FATAL ERROR!! JSON Data is XML: ' + url + '?' + args + '  resulted in: ' + data);
            return;
        }
        ;
        if (data.indexOf('<html>') != -1) {
            msg('FATAL ERROR!! JSON Data is HTML: ' + url + '?' + args + '  resulted in: ' + data);
            return;
        }
        ;
        if (data.indexOf('errorCode') != -1) {
        } //msg('FATAL ERROR!! Error Code Received in JSON: '+url+'?'+args+'  resulted in: '+data);


    }
    catch (e) {
        msg(e.message);
        //gotomainmenu();
    }

    if (url.indexOf('stbservlet') != -1)   // clean up SeaChange JSON garbage
        data = cleanJSON(data);


    var jsondata;

    try {
        jsondata = eval('(' + data + ')');
    }
    catch(e)
    {
        var err = 'error - ' + e.message;
        msg(err);
    }
    return jsondata;
}


function loadJSON(type) {

    var jsonString = $("#JSON_" + type).text();
    if (!jsonString) {
        msg('#JSON_' + type + ' is empty');
        return null;
    }

    jsonString = cleanJSON(jsonString);
    var jsonObject = JSON.parse(jsonString);

    return jsonObject;
}

function saveJSON(type, jsonObject) {

    var jsonString = JSON.stringify(jsonObject);
    $("#X_" + type).text(jsonString);

    return true;
}

function getJSON(type) {

    var jsonString = $("#X_" + type).text();
    jsonString = cleanJSON(jsonString);
    var jsonObject = JSON.parse(jsonString);

    return jsonObject;
}
// CHANGE BEG: 20121024 sthummala - change via Tami - convert menu xml to js/json object
function getJSONMenu(type) {
    var jsonString = $("#X_JSON_menu").text();
    jsonString = clean6JSON(jsonString);

    var jsonObject = JSON.parse(jsonString);
    return jsonObject;
}

function XML2jsobj(node) {

    var data = {};

    // append a value
    function Add(name, value) {
        if (data[name]) {
            if (data[name].constructor != Array) {
                data[name] = [data[name]];
            }
            data[name][data[name].length] = value;
        }
        else {
            data[name] = value;
        }
    };

    // element attributes
    var c, cn;
    /* Shirisha Thummala - Since no attributes commented the below part of the code */
    //for (c = 0; cn = node.attributes[c]; c++) {
    //	Add(cn.name, cn.value);
    //}

    // child elements
    for (c = 0; cn = node.childNodes[c]; c++) {
        if (cn.nodeType == 1) {
            if (cn.childNodes.length == 1 && cn.firstChild.nodeType == 3) {
                // text value
                Add(cn.nodeName, cn.firstChild.nodeValue);
            }
            else {
                // sub-object
                Add(cn.nodeName, XML2jsobj(cn));
            }
        }
    }


    return data;

}

function keypressed(keyCode) {
    if (typeof keyCode == 'string') {
        msg('keypress not processed... Actual Value: ' + keyCode);
        return true;
    }
    var key = getkeys(keyCode);

    if (!key) {
        msg('keypress not interested... Actual Value: ' + keyCode + ' Translated Value: ' + key);
        return false;
    }

    msg('keypress not processed... Actual Value: ' + keyCode + ' Translated Value: ' + key);
    debug.log('keypress not processed... Actual Value: ' + keyCode + ' Translated Value: ' + key);
    return false;
}

function getkeys(keycode) {
    // notifications
    if (typeof keycode == 'string') {        
        
        var notipos = keycode.indexOf('notification.');
        if (notipos != -1) {
            return keycode.substr(notipos + 13);
        }
    }

    // button commands
    var keys = Array();

    keys[13] = 'ENTER';

    keys[19] = 'PAUS';  // Pause/Break

    keys[27] = 'VIDEO';    // ESC - video fullscreen toggle
	
	keys[106] = 'POWR'

    keys[33] = 'PGUP';
    keys[34] = 'PGDN';

    keys[37] = 'LEFT';
    keys[38] = 'UP';
    keys[39] = 'RIGHT';
    keys[40] = 'DOWN';


    keys[48] = '0';
    keys[49] = '1';
    keys[50] = '2';
    keys[51] = '3';
    keys[52] = '4';
    keys[53] = '5';
    keys[54] = '6';
    keys[55] = '7';
    keys[56] = '8';
    keys[57] = '9';
    keys[90] = 'CC';
    keys[67] = 'CHDN';     // C key maps to channel-
    keys[88] = 'CHUP';     // X key maps to channel+

    keys[112] = 'MENU';     // F1

    keys[120] = 'RWND';     // F9
    keys[121] = 'PLAY';     // F10
    keys[122] = 'FFWD';     // F11
    keys[123] = 'STOP';     // F12

    keys[174] = 'VOLD';     // vol- on laptop FN keyboard
    keys[175] = 'VOLU';     // vol+ on laptop FN keyboard

    keys[216] = 'MENU';

    // ******************************************************
    // Enseo codes
    keys[61441] = 'POWR';

    keys[61442] = 'UP';
    keys[61443] = 'DOWN';
    keys[61444] = 'LEFT';
    keys[61445] = 'RIGHT';
    keys[61446] = 'ENTER';

    keys[61447] = 'MENU';
    keys[61448] = 'VOLD';
    keys[61449] = 'VOLU';

    keys[61454] = '1';
    keys[61455] = '2';
    keys[61456] = '3';
    keys[61457] = '4';
    keys[61458] = '5';
    keys[61459] = '6';
    keys[61460] = '7';
    keys[61461] = '8';
    keys[61462] = '9';
    keys[61463] = '0';

    keys[61464] = 'PLAY';   // play/pause
    keys[61465] = 'STOP';   // stop
    keys[61464] = 'PAUS';   // pause
    keys[61467] = 'RWND';   // rewind
    keys[61468] = 'FFWD';   // fast forward
    keys[61483] = 'CHUP';   // channel+
    keys[61484] = 'CHDN';   // channel-
    keys[61507] = 'POWR';
    keys[61508] = 'OFF';
    keys[61521] = 'CC';		// closed caption
	keys[61525] = 'CC';		// closed caption
	
    // ******************************************************
    // Barco terminal codes
    keys[16777220] = 'ENTER';   // 0x01000004  RETURN
    keys[16777221] = 'ENTER';   // 0x01000005  ENTER
    keys[16777234] = 'LEFT';    // 0x01000012
    keys[16777235] = 'UP';      // 0x01000013
    keys[16777236] = 'RIGHT';   // 0x01000014
    keys[16777237] = 'DOWN';    // 0x01000015

    keys[16777328] = 'VOLD';    // Volume- on terminal panel maps to 0x01000070
    keys[16777329] = 'MUTE';    // Mute on Barco USB keyboard maps to 0x01000071
    keys[16777330] = 'VOLU';    // Volume+ on terminal panel maps to 0x01000072

    keys[16777345] = 'STOP';    // 0x01000081
    keys[16777346] = 'RWND';    // 0x01000082
    keys[16777347] = 'FFWD';    // 0x01000083
    keys[16777350] = 'PLAY';    // 0x01000086

    keys[16777399] = 'POWR';    // Power button on terminal panel maps to 0x010000b7

    keys[17825796] = 'CALL';    // Handset pick up event maps to 0x01100004
    keys[17825797] = 'HANG';    // Handset hang up event maps to 0x01100005

    keys[16777216] = 'VIDEO';   // ESC on terminal keyboard

    keys[16777272] = 'RWND';    // F9 on terminal keyboard
    keys[16777273] = 'PLAY';    // F10 on terminal keyboard
    keys[16777274] = 'FFWD';    // F11 on terminal keyboard
    keys[16777275] = 'STOP';    // F12 on terminal keyboard

    keys[16777459] = 'VIDEO';   // toggle fullscreen video player window 0x010000f3

    // ******************************************************
    // LG TV codes
    /*keys[hcap.key.Code.ENTER] = 'ENTER';
     keys[hcap.key.Code.LEFT] = 'LEFT';
     keys[hcap.key.Code.PAGE_UP] = 'PGUP';
     keys[hcap.key.Code.PAGE_DOWN] = 'PGDN';
     keys[hcap.key.Code.UP] = 'UP';
     keys[hcap.key.Code.RIGHT] = 'RIGHT';
     keys[hcap.key.Code.DOWN] = 'DOWN';
     keys[hcap.key.Code.BACK] = 'BACK';
     keys[hcap.key.Code.PORTAL] = 'MENU';
     keys[hcap.key.Code.RED] = 'RED';
     keys[hcap.key.Code.GREEN] = 'GREEN';
     keys[hcap.key.Code.YELLOW] = 'YELLOW';
     keys[hcap.key.Code.BLUE] = 'HOME';
     keys[hcap.key.Code.GUIDE] = 'GUIDE';
     keys[hcap.key.Code.EXIT] = 'BACK';
     keys[hcap.key.Code.PORTAL] = 'MENU';
     keys[hcap.key.Code.PLAY] = 'PLAY';
     keys[hcap.key.Code.STOP] = 'STOP';
     keys[hcap.key.Code.PAUSE] = 'PAUS';
     keys[hcap.key.Code.FAST_FORWARD] = 'FFWD';
     keys[hcap.key.Code.REWIND] = 'RWND';
     keys[hcap.key.Code.CH_UP] = 'CHUP';
     keys[hcap.key.Code.CH_DOWN] = 'CHDN';

     keys[hcap.key.Code.NUM_0] = '0';
     keys[hcap.key.Code.NUM_1] = '1';
     keys[hcap.key.Code.NUM_2] = '2';
     keys[hcap.key.Code.NUM_3] = '3';
     keys[hcap.key.Code.NUM_4] = '4';
     keys[hcap.key.Code.NUM_5] = '5';
     keys[hcap.key.Code.NUM_6] = '6';
     keys[hcap.key.Code.NUM_7] = '7';
     keys[hcap.key.Code.NUM_8] = '8';
     keys[hcap.key.Code.NUM_9] = '9'; */

    keys[461] = 'BACK';
    keys[457] = 'STOP';
    keys[403] = 'RED';
    keys[404] = 'GREEN';
    keys[405] = 'YELLOW';
    keys[406] = 'HOME';
    keys[458] = 'PLAY';
    keys[1001] = 'BACK';
    keys[602] = 'MENU';
    keys[415] = 'PLAY';
    keys[413] = 'STOP';
    keys[19] = 'PAUS';
    keys[417] = 'FFWD';
    keys[412] = 'RWND';
    keys[427] = 'CHUP';
    keys[428] = 'CHDN';

    // ******************************************************
    // special events
    keys['CLOSE'] = 'CLOSE';
    keys['CLOSEALL'] = 'CLOSEALL';
   
    var key = keys[keycode];
    return key;

}
