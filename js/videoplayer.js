var VideoPlayer = View.extend({

    id: 'videoplayer',

    template: 'videoplayer.html',

    css: 'videoplayer.css',

    type: 'education',

    bookmark: true,
    restart: false,
    allowTrickMode: true,

    asset: null,
    ticket: null,

    state: '',
    scale: '1.0',
    seconds: 0.0,
    noPosition: true,

    windowMode: false,
    windowModeX: 89,
    windowModeY: 0,
    windowModeWidth: 1188,
    windowModeHeight: 668,
    fullscreenX: 0,
    fullscreenY: 0,
    fullscreenWidth: 1366,
    fullscreenHeight: 768,

    html5VideoType: '',

    // listeners
    lstEndOfStream: null,
    lstAnnounced: null,
    lstError: null,
    lstLoaded: null,
    lstPlaying: null,
    lstTeardown: null,
    lstDisconnect: null,

    ip: null,
    rtspPort: 1235,
    rtspClient: null,
    rtspUrl: '"rtsp://%serverIp%:%serverPort%/%appId%" OpenParams="assetUid=%assetUid%&amp;transport=%transport%&amp;ServiceGroup=%serviceGroup%&amp;smartcard-id=%deviceId%&amp;device-id=%deviceId%&amp;home-id=%homeId%&amp;client_mac=%deviceId%&amp;purchase-id=%ticketId%"',
    
    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/

    init: function(){
        var self = this;
        var version = $("#K_version").text();
        debug.log('initiating video player');
        if(version == 'PROCENTRIC' || version == 'TEST') {
            var ewf = ewfObject();
            var psu = ewf.proxyServerUrl;
            if(version == 'TEST')
                this.ip = '127.0.0.1:1235';
            else
                this.ip = LG.getNetworkDevice(0).getIp();

            self.lstEndOfStream = self._endOfStream.bind(self);
            self.lstAnnounced = self._announced.bind(self);
            self.lstError = self._error.bind(self);
            self.lstLoaded = self._loaded.bind(self);
            self.lstPlaying = self._playing.bind(self);
            self.lstTeardown = self._teardown.bind(self);
            self.lstDisconnect = self._disconnect.bind(self);

            document.addEventListener('rtspio.endOfStream', self.lstEndOfStream, false);
            document.addEventListener('rtspio.announced', self.lstAnnounced, false);
            document.addEventListener('rtspio.error', self.lstError, false);
            document.addEventListener('rtspio.loaded', self.lstLoaded, false);
            document.addEventListener('rtspio.playing', self.lstPlaying, false);
            document.addEventListener('rtspio.teardown', self.lstTeardown, false);
            document.addEventListener('rtspio.disconnect', self.lstDisconnect, false);
        }

    },

    /*destroy: function(){
        this.rtspClient.socket.disconnect();
        this._super();
    },*/

    kill: function(){
        var version = window.settings.version;
        var self = this;

        if(version == "PROCENTRIC") {
            RTSPIOClient.kill();
            LG.stopChannel();
            $.doTimeout( 'ProcentricKeepAlive' );
            debug.log('[VideoPlayer.kill]: Kill keepAlive and sever socket connection. Destroying VideoPlayer.');
        }

        self.destroy();
    },

    keepAlive: function() {
        debug.log('[VideoPlayer.keepAlive]: Initializing keep alive routine');
        var version = window.settings.version;

        if(version == "PROCENTRIC") {
            $.doTimeout('ProcentricKeepAlive', 120000, function () {
                RTSPIOClient.getCurrentTime();
                debug.log('[VideoPlayer.keepAlive]: rtsp.io handshake');
                return true;
            });
        }
    },

    navigate: function (key) {
        var handled = true;
		if(key == 'CC') {
		    //this._setCC();
			return false;
		}
		
		var player = Nimbus.getPlayer();
		
		msg('VIDEOPLAYER.JS - NAVIGATE - ' + key)
		
		if(key == 'PlayerStatusChange') {
			this.checkPlayerStatus();
			return false;
		}
		
		if(key == 'RTSPAnnouncementWaiting') {			
			var announcement = player.getRTSPAnnouncement();
			msg('VIDEOPLAYER.JS - Player Announcement: '+announcement);	
			//this.videoResponse(announcement);
			//return false;
		}
        switch (key) {
            case 'PLAY':
            case 'PAUS':
                if (this.state == 'play') {
                    this._trackEvent('pause');
                    this.pauseVideo();
                }
                else {
                    this.normalVideo();
                    this._trackEvent('resume');
                }
                break;
            case 'LEFT':
            case 'RWND':
                if (this.allowTrickMode) {
                    this.rewindVideo();
                    this._trackEvent('rewind');
                }
                break;
            case 'RIGHT':
            case 'FFWD':
                if (this.allowTrickMode) {
                    this.forwardVideo();
                    this._trackEvent('forward');
                }
                break;
            case 'VIDEO': // toggle between fullscreen and windowed TV mode
                this.toggleWindowMode();
                break;
            case 'MENU':
            case 'STOP':
            case 'EXIT':
            case 'HOME':
            case 'BACK':
                if (!this.stopped) {
                 this.stopVideo();
                }

                this.destroy();
                debug.log('VIDEO PLAYER: we are trying to stop a  movie!');
                break;
            case 'VIDEO': // toggle between fullscreen and windowed TV mode
                this.toggleWindowMode();
                break;
            default:
                handled = false;
        }

        return handled;
    },

    // When "ENTER" is pressed on a link, or when link is clicked by mouse or touch screen
    click: function ($jqobj) {
        var linkid = $jqobj.attr('id');
        var parentid = $jqobj.parent().attr('id');

        if (linkid == 'stop') { // stop button
            this.destroy();
            return true;
        }
        else if (linkid == 'fullscreen') {   // full screen button
            this.setWindowMode(false);
            return true;
        }
        else if (linkid == 'exitfullscreen') { // exit full screen
            this.setWindowMode(true);
            return true;
        }

    },

    focus: function ($jqobj) {
        this._super($jqobj);
    },

    blur: function ($jqobj) {
        this._super($jqobj);
    },

    renderData: function () {
        msg('videoplayer renderData');
        var context = this;

        var title = '';
        var duration = '00:00:00';

        this._getAsset();   // get asset info

        if (this.bookmark) { // get ticket info if requires bookmarking
            this._getTicket();
        }

        if (!this.asset) {
            // something is wrong, give up
            this.videoError(1, '', 'Unable to retrieve video information');
            return;
        }

        var asset = this.asset;

        if (asset.ListOfMetaData) {
            title = asset.ListOfMetaData.Title;
            this.$('#progress p.title').text(title);
            this.label = title;
        }
        if (asset.tagAttribute) {
            duration = this._calcDuration(asset.tagAttribute.duration);
            this.$('#progress p.duration').text(duration);
        }

        this._updateCurrent();
    },

    uninit: function () {
        var self = this;

        // stop player
        if (!this.stopped)
            this.stopVideo();

        debug.log('[VideoPlayer.uninit] Start removing event listeners');

        document.removeEventListener('rtspio.endOfStream', self.lstEndOfStream, false);
        document.removeEventListener('rtspio.announced', self.lstAnnounced, false);
        document.removeEventListener('rtspio.error', self.lstError, false);
        document.removeEventListener('rtspio.loaded', self.lstLoaded, false);
        document.removeEventListener('rtspio.playing', self.lstPlaying, false);
        document.removeEventListener('rtspio.teardown', self.lstTeardown, false);
        document.removeEventListener('rtspio.disconnect', self.lstDisconnect, false);

        debug.log('[VideoPlayer.kill]: We have removed the rtsp.io event listeners.');

        // stop clock
        $.doTimeout('video npt');

        // stop keep alive
        $.doTimeout('video keep alive');
    },

    shown: function () {

        var context = this;

        this.startVideo();

        // a timer to track play progress
        $.doTimeout('video npt', 1000, function () {
            if (context.state == 'play') {
                context.seconds = context.seconds + Number(context.scale);
                if (context.seconds < 0.0)
                    context.seconds = 0.0;
            }
            context._updateCurrent();
            return true;
        });

        // a timer to keep analytics session from timing out
        $.doTimeout('video keep alive', 280000, function () {
            nova.tracker.heartbeat();
            return true;
        });
    },

    /**********************************************************************************
     * Own public functions; Outside can call these functions
     *********************************************************************************/
    startVideo: function () {
        msg('videoplayer startVideo');
        msg('LG TV VERSION FROM VIDEO PLAYER: ' + $("#K_version").text());
        var version = $("#K_version").text();
        var ewf = ewfObject();
        var serverload = getServerLoadDATA();

        var serverIp = serverload.IPAddress || '192.168.100.80';
        var serverPort = serverload.Port || '554';
        var appId = this.bookmark ? '60010001' : '60010000';
        var transport = ewf.RTSPTransport_Enseo;
        var serviceGroup = ewf.ServiceGroup;
        var deviceId = window.settings.mac;
        var homeId = window.settings.homeID;
        var assetUid = dec2hex(this.asset.tagAttribute.entryUID);

        this.scale = 1.0;

        var ticketId = '';
        if (this.ticket && this.ticket.tagAttribute && this.ticket.tagAttribute.ticketID)
            ticketId = this.ticket.tagAttribute.ticketID;

        var npt = ['0.00', ''];
		
        if (this.bookmark && !this.restart) {    // we want to resume from suspend position
            if (this.ticket && this.ticket.tagAttribute && this.ticket.tagAttribute.suspendPosition) {
                npt[0] = this.ticket.tagAttribute.suspendPosition;
                this.seconds = Number(npt[0]);
            }
        }

        msg('[VideoPlayer.startVideo seconds]: ' + this.seconds);
		
        var videoUrl = this.asset.ListOfMetaData.ContentUrl;
        var poster = this.asset.ListOfMetaData.PosterBoard;

        if (!videoUrl)
            this.html5VideoType = null;
        else if (videoUrl.indexOf('youtube.com') > 0)
            this.html5VideoType = 'youtube';
        else if (videoUrl.indexOf('vimeo.com') > 0)
            this.html5VideoType = 'vimeo';
        else
            this.html5VideoType = 'mp4';

        var version = $("#K_version").text();
        if (this.html5VideoType) {
            var player = Nebula.getHtml5Player();
            player.play(this.$('#videopanel'), [{src: videoUrl, type: 'video/' + this.html5VideoType}], poster);
            this.setWindowMode(this.windowMode);
            this.state = 'play';
        } 
		else if (version == 'NEBULA') {
                var url = this.rtspUrl;

                url = url.replace('%serverIp%', serverIp).replace('%serverPort%', serverPort)
                    .replace('%appId%', appId).replace('%assetUid%', assetUid)
                    .replace('%transport%', transport).replace('%serviceGroup%', serviceGroup)
                    .replace(/%deviceId%/g, deviceId).replace('%homeId%', homeId)
                    .replace('%ticketId%', ticketId);

                var player = Nebula.getRtspClient();
                player.setup(url, this.videoError, this.videoResponse, this.videoAnnounce, this);
                player.play(this.scale, npt);
                player.setTVLayerEnable(true);
                this.setWindowMode(this.windowMode);
                this.state = 'play';
            }			
        else if (version == 'ENSEO') {
			msg('playing video');
                var url = this.rtspUrl;

                url = url.replace('%serverIp%', serverIp).replace('%serverPort%', serverPort)
                    .replace('%appId%', appId).replace('%assetUid%', assetUid)
                    .replace('%transport%', transport).replace('%serviceGroup%', serviceGroup)
                    .replace(/%deviceId%/g, deviceId).replace('%homeId%', homeId)
                    .replace('%ticketId%', ticketId);
		
			url = '<ChannelParams ChannelType="RTSP" Encryption=""><RTSPChannelParams URL='+url+'></RTSPChannelParams></ChannelParams>';
            var player = Nimbus.getPlayer();
            if (player) {
                player.stop();
                player.close();
            }

			msg(url);
			var player = Nimbus.getPlayer( url, null);		
            player.setChromaKeyColor(0x00000000);
            player.setVideoLayerBlendingMode("colorkey");
            player.setVideoLayerTransparency(1);
            player.setPictureFormat("Widescreen");
            player.setVideoLayerRect(0, 0, 1280, 720);
            player.setVideoLayerEnable(true);

            if (this.seconds>0)
                player.setPosition(this.seconds);
msg('[VideoPlayer seconds]: ' + this.seconds);
            player.play();
            pause(3000);
            var self = this;
            var playerOK = setInterval(function(){
                msg("playvideo.js - isPlayerOK " + self.isPlayerOK());
            }, 60000);
            window.playerOK = playerOK;
            this.state = 'play';
        }
        else if (version =='PROCENTRIC'){
            var self = this;
            var url = self.rtspUrl;
            var mac = window.LG.getNetworkDevice(0).getMac().replace(/:/gi, '');
            msg('PLAYING VIDEO FOR LG TV');
            msg('LG IP: ' + window.LG.getNetworkDevice(0).getIp());

            //60010000?assetUid=3b9acb15&transport=MP2T/AVP/UDP&ServiceGroup=100&smartcard-id=0021F80337F2&device-id=0021F80337F2&home-id=100326_1&client_mac=0021F80337F2

            url = url.replace('%serverIp%', serverIp).replace('%serverPort%', serverPort)
                .replace('%appId%', appId).replace('%assetUid%', assetUid)
                .replace('%transport%', transport).replace('%serviceGroup%', serviceGroup)
                .replace(/%deviceId%/g, deviceId).replace('%homeId%', homeId)
                .replace('%ticketId%', ticketId);

            // url = 'rtsp://192.168.100.80:554/60010000?assetUid=3b9acb15&transport=MP2T/AVP/UDP&ServiceGroup=100&smartcard-id=0021F80337F2&device-id=0021F80337F2&home-id=100326_1&client_mac=0021F80337F2';

            msg('LG RTSP URL:');
            msg(url);

            RTSPIOClient.setRoomNumber(homeId);
            RTSPIOClient.setIp(this.ip);
            RTSPIOClient.load(url);

            hcap.channel.requestChangeCurrentChannel({
                "channelType":hcap.channel.ChannelType.IP,
                "ip": self.ip,
                "port": 1235,
                "ipBroadcastType":hcap.channel.IpBroadcastType.UDP,
                "onSuccess":function() {
                    msg("PLAY VIDEO: onSuccess");
                    self.stopped = false;
                    //$('body').hide();
                    $('#videoplayer').addClass('translucent');
                },
                "onFailure":function(f) {
                    debug.log("onFailure : errorMessage = " + f.errorMessage);
                }
            });

            this.state = 'play';
        }

        else if(version == 'TEST') {

            var url = this.rtspUrl;
            url = url.replace('%serverIp%', serverIp)
                .replace('%serverPort%', serverPort)
                .replace('%appId%', appId)
                .replace('%assetUid%', assetUid)
                .replace('%transport%', transport)
                .replace('%serviceGroup%', serviceGroup)
                .replace(/%deviceId%/g, deviceId)
                .replace('%homeId%', homeId)
                .replace('%ticketId%', ticketId);

            msg('LG RTSP URL:');
            msg(url);

            RTSPIOClient.setRoomNumber(homeId);
            RTSPIOClient.setIp(this.ip);
            RTSPIOClient.load(url);
        }
        

        // analytics tracking
        if (this.state == 'play') {
            this._trackEvent('play');
        }
    },
	
	checkPlayerStatus: function () {               
        var player = Nimbus.getPlayer();

        var suspendPosition = player.getPosition();
		var status = player.getErrorStatus();
		
		msg('VIDEOPLAYER.JS - view.js - checkPlayerStatus - ' + status);

        if(status==10) {		
            this.stopVideo();        	
            player.close();
            this.destroy();
            return false;
	    }
        return true;
    },

    stopVideo: function () {    

		var version = $("#K_version").text()	
        msg('videoplayer stopVideo');
        var self = this;

        if (this.bookmark) { // update suspend position
            var position = '0.000';
			if (version=='ENSEO')	{
				var player = Nimbus.getPlayer();
				if (player)	{
					position = player.getPosition();
				}	
			}
			//msg('HERE HERE HERE ' + position);
            var ticketId = '';
            if (this.ticket && this.ticket.tagAttribute && this.ticket.tagAttribute.ticketID)
                ticketId = this.ticket.tagAttribute.ticketID;

				
            getUpdateSuspendPosition(ticketId, position);

            if(this.parent && this.parent.refresh)
                this.parent.refresh();

            // check if it's close to end of video; if yes report complete
            // we assume if you are less than 15 minutes to the end of the movie, you completed;
            // for healthcare video, this period is 30 seconds.
            var creditLength = this.type == 'movie' ? 15 * 60 : 30;
            var totalLength = 40;
            if (this.asset && this.asset.tagAttribute && this.asset.tagAttribute.duration) {
                totalLength = Math.floor(this.asset.tagAttribute.duration);
            }
            if (Math.floor(this.seconds) + creditLength > totalLength) {
                this._trackEvent('complete');
            }
msg('[VideoPlayer.startVideo seconds]: ' + this.seconds);
        }
       
        if (this.html5VideoType) {
            var player = Nebula.getHtml5Player();
            player.stop();
            this.state = "stop";
        }

        else if (version == 'NEBULA') {
            var player = Nebula.getRtspClient();
            player.setTVLayerEnable(false);
            player.stop();
            this.state = "stop";
        }

        else if (version=='ENSEO')	{
            var player = Nimbus.getPlayer();
            clearInterval(window.playerOK);
            if (player)	{
                player.setVideoLayerEnable(false);
                player.lowerVideoLayerToBottom();
                player.stop();
                player.close();
                this.state = "stop";
            }
        }

        else if(version == 'PROCENTRIC'){
            RTSPIOClient.teardown();
            this.state = "stop";
            hcap.mode.setHcapMode({
                 mode: hcap.mode.HCAP_MODE_1,
                 onSuccess: function() {
                     console.log("onSuccess: STOP PROXY VIDEO");
                     //$('body').show();
                     $('#videoplayer').removeClass('translucent');
                     self.state = "stop";
                     self._trackEvent('stop');
                 },
                 onFailure: function(f) {
                     console.log("onFailure : errorMessage = " + f.errorMessage);
                 }
            });
            this.state = "stop";
        }

        else if(version == 'TEST') {
        }
		

        if (this.state == 'stop') {
            this._trackEvent('stop');
        }
        this.stopped = true;
    },

    pauseVideo: function () {
        msg('pauseVideo');
        var version = $("#K_version").text();
        this.scale = 0;
        if (version == 'NEBULA') {
            var player = Nebula.getRtspClient();
            player.pause();
            player.setTVLayerEnable(true);
            this.setWindowMode(this.windowMode);
        } else if (version == 'ENSEO') {
            var player = Nimbus.getPlayer();
            player.pause();
            this.state = 'pause';        
			this.seconds = player.getPosition();			
        } else if(version == 'PROCENTRIC') {
            RTSPIOClient.pause();
            this.state = 'pause';
        }

    },

     normalVideo: function (restart) {
        msg('normalVideo');
        var version = $("#K_version").text();
        if (version == 'NEBULA') {
            var range = restart ? ['0.0', ''] : '';
            if (this.seconds < 5.0) {    // beginning
                range = ['0.0', ''];
            }
			msg('[VideoPlayer.startVideo seconds]: ' + this.seconds);
            this.scale = 1.0;
            var player = Nebula.getRtspClient();
            player.play(this.scale, range);
            player.setTVLayerEnable(true);
            this.setWindowMode(this.windowMode);
        } else if (version == 'ENSEO') {
            var player = Nimbus.getPlayer();
            this.scale = 1.0;            
			player.play();	
            this.state = 'play';						
			this.seconds = player.getPosition();			

		} else if(version == 'PROCENTRIC') {
            var range = restart ? ['0.0', ''] : '';
            if (this.seconds < 5.0) {    // beginning
                this.seconds = 0;
                range = ['0.0', ''];
            }
            this.scale = 1.0;
            RTSPIOClient.play(this.scale, this.seconds);
            this.state = 'play';
        }
    },

    forwardVideo: function () {
        var version = $("#K_version").text();
        if (version == 'NEBULA') {
            var player = Nebula.getRtspClient();
            this.scale = 7.5;
            player.play(this.scale);
            player.setTVLayerEnable(true);
            this.setWindowMode(this.windowMode);
        } else if (version == 'ENSEO') {
			var player = Nimbus.getPlayer();
			if (player)	{
                this.scale = 7;
				player.setSpeed(this.scale);				
			}            
			
			
		} else if(version == 'PROCENTRIC') {
            this.scale = 7.5;
            RTSPIOClient.play(this.scale);
        }
    },

    rewindVideo: function () {
        var version = $("#K_version").text();
        if (version == 'NEBULA') {
            var player = Nebula.getRtspClient();
            this.scale = -7.5;
            player.play(this.scale);
            player.setTVLayerEnable(true);
            this.setWindowMode(this.windowMode);
        } else if (version == 'ENSEO') {
			var player = Nimbus.getPlayer();
			if (player)	{
                this.scale = -7;
				player.setSpeed(this.scale);
			}            
			if (player)	{
				this.seconds = player.getPosition();
			}	

        } else if(version == 'PROCENTRIC') {
            this.scale = -7.5;
            RTSPIOClient.play(this.scale);
        }
    },

    videoError: function (error, code, message) {
        msg('videoplayer error ' + error + ' (' + code + ' ' + message + ')');
        switch (error) {
            case 1:
            case 9:
            case 20:
            case 21:
            case 22:
            case 23:
                this.stopVideo();
                this.$('#popup').text('Error ' + error + ' (' + code + ' ' + message + ')').show();
                break;
        }
    },

    videoResponse: function (resp) {		
        var respstr = JSON.stringify(resp);
        msg('videoplayer response ' + respstr);
        resp = JSON.parse(respstr);

		
		msg('VIDEOPLAYER.JS - videoResponse - ' + ' ' + resp + ' ' + resp['Code'] + ' ' + resp['Method'] + ' ' + resp['Scale:'] + ' '+ resp['Range:']);
        var scale, range, npt;
        if (resp['Code'] != '200') {
            msg('RTSP request failed with error code ' + resp['Code']);

            if (resp['Method'] == 'SETUP') {
                // track setup failure
                this._trackEvent('fail');
            }
            return;
        }

        switch (resp['Method']) {
            case 'SETUP':
                break;

            case 'PLAY':
                scale = resp['Scale:'];
                range = resp['Range:'];
                if (range)
                    npt = parseFloat(range.split('=')[1]);

                if (scale)
                    this.scale = Number(scale);
                if (npt)
                    this.seconds = Number(npt);

                this.state = 'play';
                break;

            case 'PAUSE':
                this.state = 'pause';
                break;

            default:
                break;
        }
    },

    videoAnnounce: function (annc) {
        annc = JSON.parse(JSON.stringify(annc));
        var notice = annc['TianShan-Notice:'];
        msg('[videoplayer announce JSON]: ' + JSON.stringify(annc));
        msg('videoplayer announce ' + ' (' + notice + ')');
        if (!notice)
            return;

        if (notice.indexOf('State Changed') >= 0) {
            // state changed
            this.noPosition = false;

            var state = annc['presentation_state'];
            if (state)
                this.state = state;

            var npt = annc['npt'];
            if (npt) {
                this.seconds = Number(npt);
            }
        }
        else if (notice.indexOf('End-of-Stream') >= 0) {
            // reaches end, stop video
			this.stopVideo();
            this.noPosition = true;
            this.scale = 0.0;
            this.destroy();
        }
        else if (notice.indexOf('Beginning-of-Stream') >= 0) {
            // reaches beginning, play again
            this.normalVideo(true);
        }
        else if (notice.indexOf('Scale Changed') >= 0) {
            var scale = annc['Scale'];
            if (scale)
                this.scale = scale;

            var npt = annc['npt'];
            if (npt) {
                this.seconds = Number(npt);
            }
        }
    },

    toggleWindowMode: function () {
        msg('toggleWindowMode');
        if (this.windowMode) {
            // go fullscreen
            this.setWindowMode(false);
        }
        else {
            // shrink to window mode, and update EPG info
            this.setWindowMode(true);
        }
    },

    setWindowMode: function (windowMode) {
        var platform = $("#K_version").text();

        this.windowMode = windowMode;
        if (!this.windowMode) {
            // fullscreen
            this.$('#videopanel').removeClass('windowmode').addClass('fullscreen');
            this.$('#exitfullscreen').show();
            if (this.html5VideoType) {
                var player = Nebula.getHtml5Player();
                if (player) {
                    player.setVideoLayerRect(this.fullscreenX, this.fullscreenY, this.fullscreenWidth, this.fullscreenHeight);
                }
            }
            else {
                if (platform == 'NEBULA') {
                    var player = Nebula.getRtspClient();
                    if (player)
                        player.setTVLayerRect(this.fullscreenX, this.fullscreenY, this.fullscreenWidth, this.fullscreenHeight);
                }
                else if (platform == 'ENSEO') {
                    var player = Nimbus.getPlayer();
                    if (player)
                        player.setVideoLayerRect(this.fullscreenX, this.fullscreenY, this.fullscreenWidth, this.fullscreenHeight);
                }
            }
        }
        else {
            // window mode
            this.$('#videopanel').removeClass('fullscreen').addClass('windowmode');
            this.$('#exitfullscreen').hide();
            if (this.html5VideoType) {
                var player = Nebula.getHtml5Player();
                if (player) {
                    player.setVideoLayerRect(this.windowModeX, this.windowModeY, this.windowModeWidth, this.windowModeHeight);
                }
            }
            else {
                if (platform == 'NEBULA') {
                    var player = Nebula.getRtspClient();
                    if (player)
                        player.setTVLayerRect(this.windowModeX, this.windowModeY, this.windowModeWidth, this.windowModeHeight);
                }
                else if (platform == 'ENSEO') {
                    var player = Nimbus.getPlayer();
                    if (player)
                        player.setVideoLayerRect(this.windowModeX, this.windowModeY, this.windowModeWidth, this.windowModeHeight);
                }
            }
        }
    },

    /**********************************************************************************
     * Private functions; Starts with '_' only used internally in this class
     *********************************************************************************/

	 _setCC: function () {		
		var version = window.settings.version;
	
		if (version=='ENSEO')	{
			var cc = Nimbus.getCCMode();			
			msg('IN SETCC and CC MODE =' + cc );					
			if(cc=='On') {
				Nimbus.setCCMode('Off');
				msg('Closed Captioning has been turned Off');
			} else {	
				Nimbus.setCCMode('On');
				msg('Closed Captioning has been turned On');
			}
		}
		},

	 
	 
    _endOfStream: function(e){
        var self = this;
        self.stopVideo();
        self.destroy();
        self.kill();
        debug.log('VideoPlayer.init (rtspio.endOfStream) ]:we have reached end of the stream');
    },

    _announced: function(e) {
        var self = this;

        debug.log('[VideoPlayer.init (rtspio.announced) ]: Announcement: ' + e.notice);
        debug.log('[VideoPlayer.init (rtspio.announced) ]: Announcement Parameters: ' + e.param);
        var req = { "TianShan-Notice:": e.notice };
        var params = e.param.split(';');
        for(var p in params){
            debug.log('rtspio.announced [params[p]]]: ' + params[p]);
            var parts = params[p].split('=');
            req[parts[0]] = parts[1];
        }

        self.videoAnnounce(req);
    },

    _error: function(e){
        var self = this;

        if(e.code == 500) {
            debug.log('Proxy Error: ');
            for(var p in e.param) {
                debug.log('[VideoPlayer.init (rtspio.error) ]: Proxy Error [' + p + ']: ' + e.param[p]);
            }
        }
    },

    _loaded: function(e){
        var self = this;
        debug.log("[VideoPlayer.init (rtspio.loaded) ]: PLAYING LISTENER: Scale: " + self.scale + " Seconds: " + self.seconds);
        RTSPIOClient.play(self.scale, self.seconds);
    },

    _playing: function (e) {
        var self = this;
        debug.log('[VideoPlayer.init (rtspio.playing) ]: we are playing now');
        self.keepAlive();
    },

    _teardown: function(e){
        var self = this;

        debug.log('[VideoPlayer.init (rtspio.teardown) ]: we are tearing down the stream');
        self.kill();
    },

    _disconnect: function(e){
        var self = this;

        debug.log('[VideoPlayer.init (rtspio.disconnect) ]: we are disconnecting the socket');
        self.stopVideo();
        self.kill();
    },

    _getAsset: function () {


        var asset;
        if (this.data.tagName == 'Ticket' && this.data.ListOfSubEntry) {  // a ticket
            $.each(this.data.ListOfSubEntry, function (j, sub) {
                if (sub.tagName == 'Asset') {
                    asset = sub;
                    return false;
                }
            });
        }
        else if (this.data.tagName == 'Asset') { // an asset
            asset = this.data;
        }
        else if (typeof this.data == 'string') { // asset ID
            var assetData = getGetAsset(this.data);
            if (!assetData || !assetData.DataArea || assetData.DataArea.tagName != 'Asset') {
                msg('get asset ' + this.data + ' failed');
                return false;
            }
            asset = assetData.DataArea;
            this.bookmark = false;
        }

        this.asset = asset;
        return true;
    },

    _getTicket: function (ticketId) {
        if (this.data.tagName == 'Asset') {
            var ticketId = this.asset.tagAttribute.ticketIDList;
            if (!ticketId || ticketId == '' || ticketId == 'null')
                this._getTicketByPurchase();
            else
                this._getTicketByTicketId();
        }
        else if (this.data.tagName == 'Ticket') {
            this.ticket = this.data;
        }
    },

    _getTicketByTicketId: function () {
        var ticket = getGetTicket(this.asset.tagAttribute.ticketIDList);
        if (!ticket || !ticket.DataArea || ticket.DataArea.tagName != 'Ticket') {
            msg('get ticket for asset ' + this.asset.tagAttribute.productOfferingUID + ' ticket ' + this.asset.tagAttribute.ticketIDList + ' failed');
            return false;
        }
        this.ticket = ticket.DataArea;
        return true;
    },

    _getTicketByPurchase: function () {
        var transaction = getPurchaseProduct(this.asset.tagAttribute.productOfferingUID, this.asset.tagAttribute.localEntryUID);
        if (!transaction || !transaction.DataArea || transaction.DataArea.tagName != 'Transaction') {
            msg('purchase asset ' + this.asset.tagAttribute.productOfferingUID + ' failed');
            return false;
        }
        var t = transaction.DataArea;
        if (t && t.ListOfTicket && t.ListOfTicket[0]) {
            this.ticket = t.ListOfTicket[0];
            this._trackEvent('bookmark');
        }
        if(this.parent && this.parent.refresh)
            this.parent.refresh();

        return true;
    },

    _updateCurrent: function () {
        var current = this._calcDuration(this.seconds);
        this.$('#progress p.current').text(current);
    },

    _calcDuration: function (duration) {
        if (!duration)
            return '0:00:00';

        duration = Math.floor(duration);

        var str = '';
        var h = Math.floor(duration / 3600);
        str += h + ':';
        duration = duration % 3600;

        var mm = Math.floor(duration / 60);
        str += (mm < 10 ? '0' : '') + mm + ':';
        duration = duration % 60;

        var ss = duration;
        str += (ss < 10 ? '0' : '') + ss;
        return str;
    },

    _trackEvent: function (action) {
        var label = this.asset.tagAttribute.localEntryUID;
        if (this.asset.ListOfMetaData) {
            label += '|' + this.asset.ListOfMetaData.Title;
        }
        var options = {};
        options['nonInteraction'] = true;
        nova.tracker.event(this.type, action, label, 0, options);
    },
      
});