// Video player 2 is a player ideal for playing a single internet video, or a playlist.
// It is different from the videoplayer.js because it is not doing SeaChange RTSP orderring
var VideoPlayer2 = View.extend({

    id: 'videoplayer2',
    
    template: 'videoplayer2.html',
    
    css: 'videoplayer2.css',
    
    // below is for single video playing, ideal for playing Multicast, http...etc 
    type: '', // 'Analog', 'Digital', 'UDP', 'HTTP'
    url: '', // '2', '57000:1', 'udp://@239.225.1.100:8000', 'http://sample.com/test.mp4'
    display: '', // 'CBS', 'CBS HD', 'Care Channel', 'Podcast 1'
    
    // below is for playlist playing.  If playlist is present, type and url are ignored
    // playlist is an array, each item has type, url and display
    playlist: null,
    playlistIndex: -1,
    
    delay: 0,
    delayMessage: '',
    
    // progress control
    seconds: 0.0,
    duration: 0.0,
        
    windowMode: false,
    windowModeX: 89,
    windowModeY: 0,
    windowModeWidth: 1188,
    windowModeHeight: 668,
    fullscreenX: 0,
    fullscreenY: 0,
    fullscreenWidth: 1366,
    fullscreenHeight: 768,
    
    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/

    navigate: function(key)	{
    	var handled = true;
        
        switch(key) {
            case 'VIDEO': // toggle between fullscreen and windowed TV mode
                this.toggleWindowMode();
                break;
            case 'STOP':
                this.destroy();
                break;
            case 'CHUP':
                this.prevVideo();
                break;
            case 'CHDN':
                this.nextVideo();
                break;
			case 'MENU':
                this.destroy();
                break;
			case 'HOME':
                this.destroy();
                break;
			case 'POWR':
                this.destroy();
                break;
            default:
                handled = false;
                break;
        }
        
        return handled;
    },
    
    click: function($jqobj) {
    	var linkid = $jqobj.attr('id');
        var parentid = $jqobj.parent().attr('id');
        	
    	if(linkid == 'stop') { // stop button
    		this.destroy();
    		return true;
    	}
    	else if(linkid == 'fullscreen') {   // full screen button
            this.setWindowMode(false);
            return true;
        }

    },
    
    renderData: function() {
        msg('videoplayer2 renderData');
        var context = this;
        
        this.startVideo();
        
        if(this.delay > 0) {
            context.$('#mask #masktext').text(this.delayMessage);
            context.$('#mask').show();
            $.doTimeout('videoplayer2 delay', context.delay, function() {
                context.$('#mask').hide();
                return false;
            });
        }
        else {
            context.$('#mask').hide();
        }
    },
    
    uninit: function() {
        // stop player
        this.stopVideo();
        
        // stop clock
        $.doTimeout('video npt'); 
    },
    
    /**********************************************************************************
     * Own public functions; Outside can call these functions
     *********************************************************************************/
    startVideo: function() {
        msg('videoplayer2 startVideo');
        
        var type = this.type;
        var url = this.url;
        var display = this.display;
        
        if($.isArray(this.playlist)) {
            var item = this.playlist[this.playlistIndex];
            if(item) {
                type = item.type;
                url = item.url;
                display = item.display;
            }
        }
        
        if(!type || !url) {
            msg('videoplayer2 Invalid type or url');
            return;
        }
        
        this.$('#progress p.title').text(display);
                
        var version = window.settings.version;
        if(version == 'NEBULA') {
            var player = Nebula.getTVPlayer();
            player.play(type, url, display);
            player.setTVLayerEnable(true);
            this.setWindowMode(this.windowMode);
        }
		else if(version == 'ENSEO') {
			var player = Nimbus.getPlayer(url, null);		
            player.setChromaKeyColor(0x00000000);
            player.setVideoLayerBlendingMode("colorkey");
            player.setVideoLayerTransparency(1);
            player.setPictureFormat("Native");
            player.setVideoLayerRect(0, 0, 1280, 720);
            player.setVideoLayerEnable(true);

            if (this.seconds>0)
                player.setPosition(this.seconds);

            player.play();
            this.state = 'play';
            pause(3000);
            msg('here');
            var playerOK = setInterval('msg("playvideo.js - isPlayerOK " + isPlayerOK());', 10000);
            window.playerOK = playerOK;
		}
        else if(version == 'PROCENTRIC') {
            // UDP,udp://@234.193.10.240:8001,ScenicTV
            // url = "udp://@192.168.2.3:8001";
            debug.log('[VideoPlayer2.startVideo]: URL: ' + url);
            var addr = url.substr(7).split(':');
            var ip = addr[0];
            var port = Number(addr[1]);
            debug.log('[VideoPlayer2.startVideo]: Capturing video from ip: ' + ip + ' port: ' + port);
            hcap.channel.requestChangeCurrentChannel({
                "channelType":hcap.channel.ChannelType.IP,
                "ip": ip,
                "port": port,
                "ipBroadcastType":hcap.channel.IpBroadcastType.UDP,
                "onSuccess":function() {
                    debug.log("[VideoPlayer2.startVideo]: PLAY VIDEO: onSuccess");
                    $('#videoplayer2').addClass('translucent');
                },
                "onFailure":function(f) {
                    debug.log("[VideoPlayer2.startVideo]: onFailure : errorMessage = " + f.errorMessage);
                }
            });
        }
    },
    
    stopVideo: function() {
        msg('videoplayer2 stopVideo');
        
        var version = window.settings.version;
        if(version == 'NEBULA') {
            var player = Nebula.getTVPlayer();
            player.setTVLayerEnable(false);
            player.stop();
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

        else if(version == 'PROCENTRIC') {
            hcap.mode.setHcapMode({
                mode: hcap.mode.HCAP_MODE_1,
                onSuccess: function() {
                    debug.log("[VideoPlayer2.stopVideo]: onSuccess: STOP PROXY VIDEO");
                    //$('body').show();
                    $('#videoplayer2').removeClass('translucent');
                    LG.stopChannel();
                },
                onFailure: function(f) {
                    console.log("[VideoPlayer2.stopVideo]: onFailure : errorMessage = " + f.errorMessage);
                }
            });
        }
    },
    
    nextVideo: function() {
        if($.isArray(this.playlist)) {
            this.playlistIndex++;
            this.playlistIndex = (this.playlistIndex + this.playlist.length) % this.playlist.length;
            this.startVideo();
        }
    },
    
    prevVideo: function() {
        if($.isArray(this.playlist)) {
            this.playlistIndex--;
            this.playlistIndex = (this.playlistIndex + this.playlist.length) % this.playlist.length;
            this.startVideo();
        }
    },
    
    toggleWindowMode: function() {
        msg('toggleWindowMode');
        if(this.windowMode) { 
            // go fullscreen
            this.setWindowMode(false);
        }
        else {
            // shrink to window mode, and update EPG info
            this.setWindowMode(true);
        }
    },
    
    setWindowMode: function(windowMode) {
        var platform = window.settings.version;
        
        this.windowMode = windowMode;
        if(!this.windowMode) { 
            // fullscreen
            this.$('#videopanel').removeClass('windowmode').addClass('fullscreen');
            
            if(platform == 'NEBULA') {
                var player = Nebula.getTVPlayer();
                if (player)
                    player.setTVLayerRect(this.fullscreenX, this.fullscreenY, this.fullscreenWidth, this.fullscreenHeight);
            }
            else if(platform == 'ENSEO') {
                var player = Nimbus.getPlayer();
                if (player)
                    player.setVideoLayerRect(this.fullscreenX, this.fullscreenY, this.fullscreenWidth, this.fullscreenHeight);
            }
        }
        else {
            // window mode
            this.$('#videopanel').removeClass('fullscreen').addClass('windowmode');
            
            if(platform == 'NEBULA') {
                var player = Nebula.getTVPlayer();
                if (player)
                    player.setTVLayerRect(this.windowModeX, this.windowModeY, this.windowModeWidth, this.windowModeHeight);
            }
            else if(platform == 'ENSEO') {
                var player = Nimbus.getPlayer();
                if (player)
                    player.setVideoLayerRect(this.windowModeX, this.windowModeY, this.windowModeWidth, this.windowModeHeight);
            }
        }
    },
    
    /**********************************************************************************
     * Private functions; Starts with '_' only used internally in this class
     *********************************************************************************/
     _updateCurrent: function() {
        var current = this._calcDuration(this.seconds);
        this.$('#progress p.current').text(current);
    },
    
    _calcDuration: function (duration) {
        if(!duration)
            return '0:00:00';
        
        duration = Math.floor(duration);
        
        var str = '';
        var h = Math.floor(duration/3600);
        str += h + ':';
        duration = duration%3600;
        
        var mm = Math.floor(duration/60);
        str += (mm<10?'0':'') + mm + ':';
        duration = duration%60;
        
        var ss = duration;
        str += (ss<10?'0':'') + ss;
        return str;
    }
});    