var TVGuide = View.extend({

    id: 'tvguide',

    template: 'tvguide.html',

    css: 'tvguide.css',

    channels: null,
    channelIndex: -1,
    dateBeg: null,
    dateEnd: null,
    dateNow: null,

    windowMode: true,
    windowModeX: 985,
    windowModeY: 25,
    windowModeWidth: 328,
    windowModeHeight: 185,
    fullscreenX: 0,
    fullscreenY: 0,
    fullscreenWidth: 1366,
    fullscreenHeight: 768,

    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/

    navigate: function (key, e) {
msg('TVGUIDE ' + key);
        var version = window.settings.version;

		if(key == 'POWR') {			
			this.destroy();
            return false;
        }
		
		if(key == 'CC') {
		    //this._setCC();
			return false;
		}
        if(key == 'PLAY' || key == 'PAUS' || key == 'RWND' || key == 'FFWD' || key == 'STOP') {
            return true;
        }

        if (key == 'MENU' || key == 'HOME' || key == 'EXIT' || key == 'BACK') {
            if ($('#tvguide').hasClass('translucent')) {
                this._buildEpg();
                $('#tvguide').removeClass('translucent');				
				msg('TVGUIDE chLI ' + this.chLi);
                this._scrollToChannel(this.chLi);
                if (version == 'PROCENTRIC') {
                    LG.stopChannel();
                } 
                if (version == 'ENSEO') {
                    this.stopChannel();
                }                
                return true;
            } else {
                this.destroy();
                $('#tvguide').removeClass('translucent');
                return true;
            }
        }

        if (key == '0' || key == '1' || key == '2' || key == '3' || key == '4' || key == '5' || key == '6' || key == '7' || key == '8' || key == '9') {
            msg('in key');
            var keyed = this.keyChannel(key);
            if ($("#tvguide").hasClass('translucent')) {
                $("#channel-label").show();
                $("#channel-label #loadinginfo").html(keyed);

            } else {
                this.$('#gridinfo #current p.channel').html(keyed);
                this.$('#gridinfo #current p.channel').show(50);
            }

            return true;
        }

        var navkeys = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'ENTER', 'CHUP', 'CHDN'];
        var keyIndex = navkeys.indexOf(key);
		msg(keyIndex);
        if (keyIndex == -1)
            return false;


        var $focusedProgram = this.$('div.program.active');
        var $nextProgram = $();

        if (keyIndex < 2) { // UP and DOWN
            var $candidates = $();
            if (key == 'UP') {
                $candidates = $focusedProgram.closest('li').prev().children('div.channel').children('div.program');
                if ($candidates.length <= 0) {
                    $candidates = this.$('#program li:last').children('div.channel').children('div.program');
                }
            } else if (key == 'DOWN') {
                $candidates = $focusedProgram.closest('li').next().children('div.channel').children('div.program');
                if ($candidates.length <= 0) {
                    $candidates = this.$('#program li:first').children('div.channel').children('div.program');
                }
            }
            // if the current program contains "now", move UP/DOWN should focus on closest program to "now"
            var begin = new Date($focusedProgram.attr('data-begin') * 1);
            var end = new Date($focusedProgram.attr('data-end') * 1);
            var now = new Date();
            var compare = begin;
            if (!begin.getTime() || (now.getTime() >= begin.getTime() && now.getTime() < end.getTime()))
                compare = now;
            $nextProgram = this._cloestProgram($candidates, compare);
            // focus on the new program and update info
            this.blur($focusedProgram);
            this._focusProgram($nextProgram);

            return true;
        } else if (keyIndex < 4) {
            if (key == 'RIGHT') {
                $nextProgram = $focusedProgram.next();
                if ($nextProgram.length <= 0) {
                    this.blur($focusedProgram);
                    this._stepEpg('next');
                    msg(this.channelIndex);
                    this._focusProgram();
                    return true;
                }
            }
            if (key == 'LEFT') {
                $nextProgram = $focusedProgram.prev();
                if ($nextProgram.length <= 0) {
                    this.blur($focusedProgram);
                    this._stepEpg('prev');
                    msg(this.channelIndex);
                    this._focusProgram();
                    return true;
                }
            }
            this.blur($focusedProgram);
            this._updateInfo($nextProgram);
            this.focus($nextProgram);
            return true;
        }

        // when TV is playing, we allow CH +/-
        if ($("#tvguide").hasClass('translucent')) {
            msg('[tvguide.js navigate]: navigating channel up/down');
            if (key == 'CHDN') {
                msg('[tvguide.js navigate]: changing channel down');
                this.switchChannel(-1);
                this.playChannelByIdx(this.channelIndex);
                return true;
            }

            if (key == 'CHUP') {
                msg('[tvguide.js navigate]: changing channel up');
                this.switchChannel(1);
                this.playChannelByIdx(this.channelIndex);
                return true;
            }
        }
        else {
            if (key == 'CHUP' || key == 'CHDN') {
                // do nothing if not playing fullscreen TV
                return true;
            }
        }

        if (key == 'ENTER') {  // default link click
            //return this.click($focusedProgram);
            // PLAY the channel
            this.playChannelByIdx(this.channelIndex);
            return true;
        }

        return false;
    },

    // When "ENTER" is pressed on a link, or when link is clicked by mouse or touch screen
    click: function ($jqobj) {
        var linkid = $jqobj.attr('id');
        msg('click: id=' + linkid);
        if ($jqobj.hasClass('back')) { // back button
            this.destroy();
            return true;
        }

        if ($jqobj.hasClass('program')) { // clicking a program updates the info section
            this._updateInfo($jqobj);
            return true;
        }

        if ($jqobj.hasClass('channelname')) { // clicking a channel tunes to the channel
            this._updateChannelInfo($jqobj);
            return true;
        }

        if (linkid == 'tvpanel') {  // just in case the native TV player window is gone, we fallback to the containing HTML div            
            return true;
        }

        return false;
    },

    focus: function ($jqobj) {

        if ($jqobj.hasClass('program')) {
            $jqobj.addClass('active');
            var chId = $jqobj.parent().attr('id');
            this.$('div#ch-' + chId).addClass('active');
        }
        else if ($jqobj.hasClass('channelname')) {
            this._super($jqobj);
        }

    },

    blur: function ($jqobj) {
        if ($jqobj && $jqobj.length > 0) {
            $jqobj.removeClass('active');
        }
        else {
            this.$('div.program,div.channelname').removeClass('active');
        }
        //this._super($jqobj);
    },

    renderData: function () {
        var self = this;
        //self.$('#mask').show();

        // delay a little so we can show the spinning first
        $.doTimeout('tv tuner init', 100, function () {
            self._buildEpg();
            self.$('#content').delegate('.program,.channelname', 'tap', function (e) {
                self.blur($(self));
                self.focus($(self));
                self.click($(self));
            });
            return false;
        });

        $.doTimeout('tv tuner finish', 1000, function () {
            self.$('#mask').hide();
            return false;
        });
    },

    shown: function () {
        //window.setTimeout(function () {
        //    this.iScroll = new IScroll(this.$('#gridpanel #content')[0], {
        //        mouseWheel: true,
        //        scrollbars: 'custom',
        //        interactiveScrollbars: true,
        //        tap: true,
        //        momentum: false,
        //        shrinkScrollbars: 'clip'
        //    });
        //}, 500);

        // a timer to keep analytics session from timing out
        $.doTimeout('tv keep alive', 280000, function () {
            nova.tracker.heartbeat();
            return true;
        });
    },

    uninit: function () {
        var version = window.settings.version;

        // remove EPG clicking events
        this.$('#content').undelegate('.program,.channelname', 'tap');
        // stop clock
        $.doTimeout('tvguide clock');
        // stop keep alive
        $.doTimeout('tv keep alive');

        // stop player
        this.stopChannel();
    },

    /**********************************************************************************
     * Own public functions; Outside can call these functions
     *********************************************************************************/
    playChannelByIdx: function (idx) {
        idx = idx || this.channelIndex;
        if (!this.channels || this.channels.length < 1) {
            msg('Channel list is empty, nothing to play.');
            return;
        }

        if (idx < 0 || idx >= this.channels.length) {
            msg('Channel index ' + idx + ' out of bound.');
            return;
        }

        var platform = $("#K_version").text();
        var ch = this.channels[idx];
        var chId = ch.channelID, chNum = ch.channelNumber, chName = ch.channelShortName, freq = ch.frequency,
            major = ch.majorChannelNumber, pn = ch.programNumber, ip = ch.ipAddress, port = ch.port;
        var pnInt = parseInt(pn);

        var isDigital = true;
        var isIP = (ch['regionGroupChannelType'] === 'IP');

        if (isNaN(pnInt) || pnInt <= 0) {
            isDigital = false;
        }
        $("#channel-label").show();
        $("#tvguide").addClass('translucent');
        $("#channel-label #loadinginfo").html(chNum + ' - ' + chName);
        $.doTimeout('tv tuner init', 2000, function () {
            $('#channel-label').hide();
            return false;
        });
        msg('Play channel num=' + chNum + ', freq=' + freq + ', pn=' + pn + ', major=' + major + ', name=' + chName + ', ip?' + isIP + ', digital?' + isDigital);
        platform = 'ENSEO'
        if (platform == 'ENSEO') {
            var parm1 = 'PhysicalChannelIDType=Freq';
            var parm2 = 'PhysicalChannelID="' + freq + '"';
            var parm3 = 'DemodMode="QAMAuto"';
            var parm4 = 'ProgramSelectionMode="PATProgram"';
            var parm5 = 'ProgramID="' + pn + '"';
            var url = '';
            if (isDigital) {
                var parms = ' ' + parm1 + ' ' + parm2 + ' ' + parm3 + ' ' + parm4 + ' ' + parm5 + ' ';
                url = '<ChannelParams ChannelType="Digital"><DigitalChannelParams' + parms + '></DigitalChannelParams></ChannelParams>';
            }
            else {
                var parms = ' ' + parm1 + ' ' + parm2 + ' ';
                url = '<ChannelParams ChannelType="Analog"><AnalogChannelParams' + parms + '></AnalogChannelParams></ChannelParams>';
            }
            var sessionID = getSessionID();
            var player = Nimbus.getPlayer();
            if (player) {
                player.stop();
                player.close();
            }
            var player = Nimbus.getPlayer(url, null, sessionID);
            if (player) {
                player.setChromaKeyColor(0x00000000);
                player.setVideoLayerBlendingMode("colorkey");
                player.setVideoLayerTransparency(1);
                player.setPictureFormat("Widescreen");
                player.setVideoLayerEnable(true);
                player.play();
            }
        }

        else if (platform == 'PROCENTRIC') {
            msg('Changing channel in EPG UI from Procentric');
            if(isIP) {
                msg('IP: ' + ip + ' Port: ' + port);
                Procentric.playChannel({
                    type: 'IP',
                    ip: ip,
                    port: parseInt(port),
                    onSuccess: function () {
                        debug.log('Changing Channel');
                    },
                    onFailure: function () {
                        debug.log('YOU HAVE FAILED TO CHANGE CHANNEL');
                    }
                })
            }
            else {
                var min = (isDigital == false) ? 0 : pn;
                msg('Major: ' + major + ' Minor: ' + min + ' Frequency: ' + freq);
                Procentric.playChannel({
                    type: 'RF',
                    major: parseInt(major),
                    minor: parseInt(min),
                    onSuccess: function () {
                        msg('Changing Channel');
                    },
                    onFailure: function () {
                        msg('YOU HAVE FAILED TO CHANGE CHANNEL');
                    }
                });
            }
        }
    },

    stopChannel: function () {
        msg('in stop channel');
        var platform = $("#K_version").text();
        if (platform == 'ENSEO') {
            var player = Nimbus.getPlayer();
            if (player) {
                player.stop();
                player.close();
                player.setVideoLayerEnable(false);
            }
        }

        else if (platform == 'PROCENTRIC') {
            LG.stopChannel();
        }

    },

    switchChannel: function (offset) {
        var len = this.channels.length;
        this.channelIndex += offset;
        this.channelIndex = this.channelIndex < 0 ? this.channelIndex + len : this.channelIndex;
        this.channelIndex = this.channelIndex % len;

        msg('[TVGUide.switchChannel] this.channelIndex: ' + this.channelIndex);
    },

    gotoChannel: function (chNum) {
        msg('requested direct tuning to channel ' + chNum);
        var self = this;
        var channelID;
        $.each(this.channels, function (i, ch) {
            if (ch.channelNumber == chNum) {
                channelID = ch.channelID;
                self.channelIndex = i;
                return false;
            }
        });

        if (!channelID) {
            var overlay = chNum + ' not available';
            if ($("#tvguide").hasClass('translucent')) {
                $("#channel-label").show();
                $("#channel-label #loadinginfo").html(overlay);
                $('#channel-label').show(50).delay(1000).hide(50);
                return;
            } else {
                this.$('#gridinfo #current p.channel').html(overlay);
                this.$('#gridinfo #current p.channel').show(50).delay(1000).hide(50);
                return;
            }
        }

        if ($("#tvguide").hasClass('translucent')) {
            this.playChannelByIdx(this.channelIndex);
            return;
        }
        else {
            var $focusedProgram = this.$('.program.active');
            var $candidates = this.$('#' + channelID + '.channel').children('.program')

            if ($candidates.length <= 0) {
                return false;
            }
            var begin = new Date($focusedProgram.attr('data-begin') * 1);
            $nextProgram = this._cloestProgram($candidates, begin);

            this.blur($focusedProgram);
            this._updateInfo($nextProgram);
            this.focus($nextProgram);
			//this._focusProgram($nextProgram);
            var $ch = $nextProgram.parent().parent();
  /*
			var $container = this.$('#gridpanel #content');
            var scrollTop = $container.scrollTop();
            var baseTop = $container.offset().top;
            var baseBottom = $container.height() + baseTop - 5;
            var chTop = $ch.offset().top;			
            if ($ch.is(':first-child')) { // first channel, always scroll to top
                $container.scrollTop(0);
            }
            else if ($ch.is(':last-child')) {
                $container.scrollTop($container.height());
            }
            else if (chTop < baseTop) { // need to scroll up
                $container.scrollTop(scrollTop - $ch.height() * 7);
            }
            else if (chTop >= baseBottom) { // need to scroll down
                $container.scrollTop(scrollTop + $ch.height() * 7);
				msg('scrollTop ' + scrollTop + ' baseTop ' + baseTop + ' baseBottom ' + baseBottom + ' chTop '+ chTop);
            }
*/
			this._scrollToChannel($ch);
            this.$('#gridinfo #current p.channel').hide();
        }
    },


    /**********************************************************************************
     * Private functions; Starts with '_' only used internally in this class
     *********************************************************************************/
	 	 
	
	_setCC: function () {		
		var version = window.settings.version;
	

		if (version=='ENSEO1')	{
			var cc = Nimbus.getCCMode();			
			msg('IN SETCC and CC MODE =' + cc );					
			var ccset = false;
			if(cc=='On') {
				ccset = Nimbus.setCCMode('Off');
				msg('Closed Captioning has been turned Off + ccset =' + ccset );
			} else {	
				ccset = Nimbus.setCCMode('On');
				msg('Closed Captioning has been turned On + ccset =' + ccset);
			}
		}

	
		if (version=='ENSEO1')	{
			var ccmode = Nimbus.getCCMode();
			msg(ccmode);
			Nimbus.setAnalogCCMode('');									
			var cc = Nimbus.getAnalogCCMode();
			msg('IN SETCC and CC MODE =' + cc );
			var ccset =  false;			
			if(cc=='CC1' || cc=='CC 1') {
				ccset = Nimbus.setAnalogCCMode('');							
				msg('Closed Captioning has been turned OFF');
			} else {	
				ccset = Nimbus.setAnalogCCMode('CC 1');							
				msg('Closed Captioning has been turned ON to CC 1');
			}			
			msg(ccset);
		}
		return ;	
	},
    _buildEpg: function () {
        this._resetTimes();
        this._cleanAll();
        this._buildHeaders();
        this._buildChannels();
        this._buildPrograms();
        this._buildInfo();
        this._focusProgram();
    },

    _stepEpg: function (direction) {
        if (direction == 'next')
            this._stepTimes(2);
        else if (direction == 'prev')
            this._stepTimes(-2);
        else
            return;

        this._cleanPrograms();
        this._buildHeaders();
        this._buildPrograms();

    },

    _buildHeaders: function () {
        this.$('#gridpanel #header #today').text(this.dateNow.format('dddd', false, window.settings.language));
        this.$('#gridpanel #header div.header1').text(this.dateBeg.format('h:MM TT'));
        this.$('#gridpanel #header div.header2').text(this.dateBeg.addMinutes(30).format('h:MM TT'));
        this.$('#gridpanel #header div.header3').text(this.dateBeg.addMinutes(60).format('h:MM TT'));
        this.$('#gridpanel #header div.header4').text(this.dateBeg.addMinutes(90).format('h:MM TT'));
    },

    _buildChannels: function () {
        var context = this;
        //this.channels = epgChannels().Channels;
        this.channels = window.JSONDATA.lineups[0].channels;
        $.each(this.channels, function (i, ch) {
            var $li = $('<li></li>');
            var $channel = $('<div></div>').addClass('channelstation');
            var $name = $('<div class="channelname"></div>').attr('id', 'ch-' + ch.channelID).html('<span>' + ch.channelNumber + ' ' + ch.channelShortName + '</span>');
            $li.append($channel.append($name)).appendTo(context.$('#gridpanel #program'));
        });
    },

    _buildPrograms: function () {
        var context = this;
        var filename = this.dateBeg.format('yyyymmddHHMM') + '.txt';
        var epgfile = this._getProgramFile(filename);

        $.each(this.channels, function (i, ch) {
            var $c = $('<div class="channel"></div>').attr('id', ch.channelID);
            var hasData = false;
            if (epgfile && epgfile.ListOfChannel && epgfile.ListOfChannel[ch.channelID]) {
                $.each(epgfile.ListOfChannel[ch.channelID], function (i, row) {
                    if (row["programName"]) {
                        hasData = true;
                        var d = context._calcDuration(row["startTime"], row["endTime"]);
                        if (d.duration > 0) {
                            var $pname = $('<span></span>').text(row.programName);
                            $('<div class="program"></div>').attr('id', row.programID).attr('title', row.programName).append($pname)
                                .attr('data-begin', d.begdate.getTime()).attr('data-end', d.enddate.getTime()).attr('data-duration', d.duration)
                                .addClass('D' + d.duration).appendTo($c);
                        }
                    }
                });
            }

            if (!hasData) {  // if no program, by default just fill in the channel name
                var $pname = $('<span></span>').text(ch.channelName);
                $('<div id="na" class="program D120"></div>').attr('title', ch.channelName).append($pname).appendTo($c);
            }

            context.$('#gridpanel #program #ch-' + ch.channelID).parent().parent().append($c);
        });
    },

    _buildInfo: function () {
        // start clock
        var context = this;
        $.doTimeout('tvguide clock', 60000, function () {
            var d = new Date();
            var format = 'dddd, mmm d | h:MM TT';
            var locale = window.settings.language;
            context.$('#gridinfo #current p.date').text(d.format(format, false, locale));
            return true;
        });
        $.doTimeout('tvguide clock', true); // do it now
    },

    _updateInfo: function ($obj) {
        msg($obj);
        if (!$obj) {
            this.$('#gridinfo #current p.channel').empty();
            this.$('#gridinfo #current p.title').empty();
            this.$('#gridinfo #current p.time').empty();
            return;
        }

        // update channel info
        var chId = $obj.parent().attr('id');
        var $ch = this.$('div#ch-' + chId);
        this._updateChannelInfo($ch);

        // update program info
        var name = $obj.text();
        var id = $obj.attr('id');
        var beg = new Date($obj.attr('data-begin') * 1);
        var end = new Date($obj.attr('data-end') * 1);
        var duration = $obj.attr('data-duration');

        if (id == 'na') {
            this.$('#gridinfo #current p.title').text(name);
            this.$('#gridinfo #current p.time').empty();
        }
        else {
            this.$('#gridinfo #current p.title').text(name);
            this.$('#gridinfo #current p.time').text(beg.format('h:MMtt') + ' - ' + end.format('h:MMtt'));
        }
    },

    _updateChannelInfo: function ($obj) {
        if (!$obj || $obj.length < 1)
            return;

        this.$('#gridinfo #current p.title').empty();
        this.$('#gridinfo #current p.time').empty();

        // changed structure. Now we look for the index of entire <li> in ul#program
        this.channelIndex = $obj.parent().parent().index();
        var chName = $obj.find('span').text();
        //this.$('#gridinfo #current p.channel').text(chName);
    },

    _focusProgram: function ($program) {
        var context = this;
        this.channelIndex = this.channelIndex < 0 ? 0 : this.channelIndex;
        if (this.channelIndex < 0 || this.channelIndex >= this.channels.length)
            return;

        var $chLi;

        if (!$program || $program.length <= 0) {
            // find current channel and program
            var ch = this.channels[this.channelIndex];
            var $ch = context.$('div#' + ch.channelID);
            $program = this._cloestProgram($ch.find('.program'), this.dateNow);
            $chLi = $ch.parent();
        }
        else {
            $chLi = $program.parent().parent();
        }
		msg('TVGUIDE focuschannel ' + $chLi);
		this.chLi = $chLi;
        this._updateInfo($program);
        this.focus($program);

        // scroll if needed
        this._scrollToChannel($chLi);
    },

    _scrollToChannel: function($chLi) {
        var context = this;
        if (!$chLi || $chLi.length <= 0) {
            // find current channel
            if (this.channelIndex < 0 || this.channelIndex >= this.channels.length)
                return;
            var ch = this.channels[this.channelIndex];
            $chLi = this.$('div#' + ch.channelID).parent();
        }
        var $container = this.$('#gridpanel #content');
        var scrollTop = $container.scrollTop();
        var baseTop = $container.offset().top;
        var baseBottom = $container.height() + baseTop - 5;
        var chTop = $chLi.offset().top;
msg('scrollTop ' + scrollTop + ' baseTop ' + baseTop + ' baseBottom ' + baseBottom + ' chTop ' + chTop + ' chLi height ' +$chLi.height() );
        if ($chLi.is(':first-child')) { // first channel, always scroll to top
            $container.scrollTop(0);
        }
        else if ($chLi.is(':last-child')) {
            $container.scrollTop(Math.floor($container[0].scrollHeight)+10);
        }
          while (chTop < baseTop) { // need to scroll down
            $container.scrollTop(Math.floor(scrollTop - $chLi.height() * 7));
            chTop = $chLi.offset().top;
            scrollTop = $container.scrollTop();
        }

        while (chTop >= baseBottom) { // need to scroll down
            $container.scrollTop(Math.floor(scrollTop + $chLi.height() * 7));


            chTop = $chLi.offset().top;
            scrollTop = $container.scrollTop();
        }
		
    },

    _getProgramFile: function (filename) {
        var epgname = this.cachedEpgName;
        var epgfile = this.cachedEpgFile;
        if (!epgname || !epgfile || epgname != filename) {
            var ewf = ewfObject();
            var url = ewf.epgFilePath + filename;
            var args = '';
            epgfile = ajaxJSON(url, args);
            if (epgfile) {
                this.cachedEpgName = filename;
                this.cachedEpgFile = epgfile;
            }
        }
        else {
            msg('Using cached epg file ' + filename);
        }
        return epgfile;
    },

    _cleanAll: function () {
        this.$('#gridinfo #current p.channel').empty();
        this.$('#gridinfo #current p.title').empty();
        this.$('#gridinfo #current p.time').empty();
        this.$("#gridpanel #header div").empty();
        this.$("#gridpanel #program").empty();
    },

    _cleanPrograms: function () {
        this.$("#gridpanel #program .channel").remove();
        this.$('#gridinfo #current p.title').empty();
        this.$('#gridinfo #current p.time').empty();
    },

    // set EPG window to current
    _resetTimes: function () {
        this.dateNow = new Date();
        var d = new Date(this.dateNow);
        d.setMilliseconds(0);
        d.setSeconds(0);
        d.setMinutes(0);
        this.dateBeg = new Date(d);
        this.dateEnd = new Date(d);

        var h = this.dateNow.getHours();
        this.dateBeg.setHours(Math.floor(h / 2) * 2);
        this.dateEnd.setHours(Math.floor(h / 2) * 2 + 2);
    },

    // step begin and end time of the EPG window
    _stepTimes: function (hours) {
        this.dateBeg = this.dateBeg.addHours(hours);
        this.dateEnd = this.dateEnd.addHours(hours);
    },

    // parse EPG time format '2013-05-30 13:14:00.0'
    _parseEpgTime: function (str) {
        var dateTime = str.split(" ");

        var date = dateTime[0].split("-");
        var yyyy = date[0];
        var mm = date[1] - 1;
        var dd = date[2];

        var time = dateTime[1].split(":");
        var h = time[0];
        var m = time[1];
        var s = parseInt(time[2]); //get rid of that 00.0;

        return new Date(yyyy, mm, dd, h, m, s);
    },

    // adjust time to nearest 30min slot
    _roundUpTime: function (datetime) {
        var d = new Date(datetime);
        var m = (Math.round(d.getMinutes() / 30) * 30) % 60;
        var h = (d.getMinutes() >= 45) ? d.getHours() + 1 : d.getHours();
        d.setMilliseconds(0);
        d.setSeconds(0);
        d.setMinutes(m);
        d.setHours(h);
        return d;
    },

    // calculate begin, time and duration for specific program
    _calcDuration: function (startTime, endTime) {
        var duration = 0;
        var beg = this._parseEpgTime(startTime);
        var end = this._parseEpgTime(endTime);

        beg = this._roundUpTime(beg);
        end = this._roundUpTime(end);

        // adjust program if it begins earlier or end later than current epg window
        if (beg.getTime() < this.dateBeg.getTime())
            beg = this.dateBeg;
        if (end.getTime() > this.dateEnd.getTime())
            end = this.dateEnd;

        var diff = (end.getTime() - beg.getTime()) / 1000 / 60;
        diff = Math.floor(diff / 30) * 30;
        duration = diff > 0 ? diff : 0;

        var ret = Array();
        ret['duration'] = duration;
        ret['begdate'] = beg;
        ret['enddate'] = end;
        return ret;
    },

    // Pick a program from candidates that is currently showing based on the provided time.
    // If no one is showing, pick one that is closest to the start time
    _cloestProgram: function ($candidates, time) {
        if ($candidates.length < 1)
            return $();
        if ($candidates.length == 1)
            return $candidates;

        if (!time.getTime()) {
            // begin time not valid, just pick the first candidate
            return $candidates.first();
        }

        var $ret = $();
        var min = -1;
        $candidates.each(function () {
            var begin = new Date($(this).attr('data-begin') * 1);
            var end = new Date($(this).attr('data-end') * 1);

            // on air?
            if (time.getTime() >= begin.getTime() && time.getTime() < end.getTime()) {
                $ret = $(this);
                return false;
            }

            // calculate difference
            var diff = begin.getTime() - time.getTime();
            diff = (diff < 0) ? -diff : diff;
            if (min == -1 || diff < min) {
                min = diff;
                $ret = $(this);
            }
        });
        return $ret;
    }
});    