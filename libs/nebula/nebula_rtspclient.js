/******************************************************************************/
/** @file 
 *
 * @brief   Nebula RTSP Client for Javascript
 *
 * @author
 *      Michael K. Jones\n
 *      Stone Hill Consulting\n
 *      http://www.stonehill.com\n
 *
 * @par Environment
 *****************************************************************************/


/******************************************************************************/
/**
 * Create a "name space" object to contain the RTSP Client
 *
 * @return
 *      Creates global "Nebula" object (if it doesn't already exist)
 *
 ******************************************************************************/
Nebula = Nebula || {};

/**
 * Global function to get TV player singleton instance 
 */
Nebula.getRtspClient = function() {
    if(Nebula.rtspClient) {
        return Nebula.rtspClient;
    }
    Nebula.rtspClient = new Nebula.RtspClient();
    return Nebula.rtspClient;
};


/**
 * RtspClient constructor 
 */
Nebula.RtspClient = function () {
    // Create a native rtsp client object
    try {
        this.obj = EORtspClient;
        this.player = EOTVPlayer;

        this.error = null;
        this.response = null;
        this.announce = null;
        this.callbackcontext = window;

        this.ready = false;

    } catch (e) {
        this.obj = null;
        this.error('EORtspClient object failed to initialize!');
    }
};

Nebula.RtspClient.prototype.log = function(msg) {
    if(console && console.log)
        console.log(msg);
};

// error codes to match Nimbus codes
Nebula.RtspClient.prototype.Status_OK = 0;    // Playback opened successfully or last player command successful.
Nebula.RtspClient.prototype.Status_Error = 1;    // Normally should not occur.
Nebula.RtspClient.prototype.Status_Reacquiring = 2;    // Obsolete.  Replaced with more specific error status codes.
Nebula.RtspClient.prototype.Status_NoRFHW = 3;    // Playback failed.  R/F channel type specified but no R/F front end hardware.
Nebula.RtspClient.prototype.Status_PowerOff = 4;    // Playback failed.  Board power state is OFF.
Nebula.RtspClient.prototype.Status_DemodLockFailed = 5;    // Playback failed.  Cannot lock to signal.  Open retries will occur.
Nebula.RtspClient.prototype.Status_NotAuthorized = 6;    // Enseo Proidiom authorization in progress.
Nebula.RtspClient.prototype.Status_Authorizing = 7;    // Not used.
Nebula.RtspClient.prototype.Status_Pending = 8;    // Playback is in the process of opening a new channel.
Nebula.RtspClient.prototype.Status_Closed = 9;    // Playback is closed.
Nebula.RtspClient.prototype.Status_EndOfStream = 10,   // Playback reached the end of the stream (RTSP only).
Nebula.RtspClient.prototype.Status_NotAvailable = 11,   // Playback failed.  Required resource is busy (Tuner/demod for RF channel).
Nebula.RtspClient.prototype.Status_OutputProtectionRequired = 12;   // Playback failed.  The content is protected but output protection is not enabled.
Nebula.RtspClient.prototype.Status_RTSP_TCPOpenFailed = 20;   //      TCP open failure
Nebula.RtspClient.prototype.Status_RTSP_OptionsReqFailed = 21;   //      Options request failed
Nebula.RtspClient.prototype.Status_RTSP_DescribeReqFailed = 22;   //      Describe request failed
Nebula.RtspClient.prototype.Status_RTSP_SetupReqFailed = 23;   //      Setup request failed
Nebula.RtspClient.prototype.Status_RTSP_PlayReqFailed = 24;   //      Play request failed
Nebula.RtspClient.prototype.Status_RTSP_PauseReqFailed = 25;   //      Pause request failed



Nebula.RtspClient.prototype.onSocketError = function (code, message) {
    var context = Nebula.rtspClient;
    context.log('Socket error: ' + code + ' - ' + message);
    if (context.error)
        context.error.call(context.callbackcontext, context.Status_RTSP_TCPOpenFailed, code, message);
};

Nebula.RtspClient.prototype.onSocketConnect = function () {
    var context = Nebula.rtspClient;
    context.log('Socket connected');
    
    if(!context.ready) {
        context.log('Stream not setup, can not play.');
        return;
    }
    
    if(!context.obj.Setup()) {
        context.log('setup failed.');
        return;
    }
};

Nebula.RtspClient.prototype.onSocketDisconnect = function () {
    var context = Nebula.rtspClient;
    context.log('Socket disconnected');
    context.ready = false;
    if(context.error)
        context.error.call(context.callbackcontext, context.Status_Closed);
};


Nebula.RtspClient.prototype.onResponse = function (resp) {
    var context = Nebula.rtspClient;
    context.log('RTSP response: ' + JSON.stringify(resp));
    if (context.response)
        context.response.call(context.callbackcontext, resp);

    var method = resp['Method'];
    var code = resp['Code'];
    var message = resp['Message'];
    switch (method) {
        case 'SETUP':
            if (code == '200') {
                context.obj.Play(context.scale, context.range);
            }
            else if (context.error) {
                context.error.call(context.callbackcontext, context.Status_RTSP_SetupReqFailed, code, message);
            }
            break;
        case 'PLAY':
            if (code != '200' && context.error) {
                context.error.call(context.callbackcontext, context.Status_RTSP_PlayReqFailed, code, message);
            }
            else {
                // start player
                var osd = 'Play';
                if(context.scale*1 < 0.0)
                    osd = 'Rewind';
                else if(context.scale*1 > 1.0)
                    osd = 'Forward';
                context.log('PLAY success, starting VLC player...');
                context.player.Play('UDP', 'udp://@:1235', osd);
                context.player.SetTVLayerEnable(true);
            }
            break;
        case 'PAUSE':
            if (code != '200' && context.error) {
                context.error.call(context.callbackcontext, context.Status_RTSP_PauseReqFailed, code, message);
            }
            break;
        case 'GET_PARAMETER':
            if (code == '200' && resp['Position']) {
                var npt = resp['Position'].split('-');
                context.position = npt[0] || '0.0';
            }
            break;
        case 'TEARDOWN':
            break;
        default:
            break;
    }
};


Nebula.RtspClient.prototype.onAnnounce = function (req) {
    var context = Nebula.rtspClient;
    context.log('RTSP announce: ' + JSON.stringify(req));
    if (context.announce)
        context.announce.call(context.callbackcontext, req);
};

Nebula.RtspClient.prototype.init = function() {
    this.obj.SocketError.connect(this.onSocketError);
    this.obj.Connected.connect(this.onSocketConnect);
    this.obj.Disconnected.connect(this.onSocketDisconnect);
    this.obj.RtspResponse.connect(this.onResponse);
    this.obj.RtspAnnounce.connect(this.onAnnounce);
    this.scale = '1.0';
    this.range = 'npt=0.0-';
    this.position = '0.0';
};

Nebula.RtspClient.prototype.reset = function() {
    this.obj.SocketError.disconnect(this.onSocketError);
    this.obj.Connected.disconnect(this.onSocketConnect);
    this.obj.Disconnected.disconnect(this.onSocketDisconnect);
    this.obj.RtspResponse.disconnect(this.onResponse);
    this.obj.RtspAnnounce.disconnect(this.onAnnounce);
};

Nebula.RtspClient.prototype.setup = function (url, error, response, announce, callbackcontext) {
    if (!this.obj.SetUrl(url)) {
        this.log('setUrl failed.');
        return;
    }

    this.ready = true;
    this.error = error;
    this.response = response;
    this.announce = announce;
    this.callbackcontext = callbackcontext;
    return true;
};

Nebula.RtspClient.prototype.play = function (scale, range) {

    if (!this.ready) {
        this.log('Stream not setup, can not play.');
        return false;
    }
    
    if (!this.obj.IsConnected()) {
        this.init();    //setup all signals if not connected yet
    }
    
    range = range || '';
    this.scale = scale;
    if($.isArray(range))
        this.range = 'npt=' + (range[0] ? range[0] : '0.0') + '-' + (range[1] ? range[1] : '');
    else
        this.range = '';

    if (this.obj.IsConnected()) {
        // already connected or playing, send the play directly
        this.obj.Play(this.scale, this.range);
    }
    else {
        // first time, not connected yet
        if (!this.obj.Connect() && this.error) {
            this.error(this.Status_RTSP_TCPOpenFailed);
            return false;
        }
    }
    return true;
};

Nebula.RtspClient.prototype.pause = function () {
    if (!this.obj.Pause() && this.error) {
        this.error(this.Status_RTSP_PauseReqFailed);
        return false;
    }
    return true;
};

Nebula.RtspClient.prototype.stop = function () {
    this.ready = false;

    this.player.Stop(false);
    this.player.SetTVLayerEnable(false);
    
    this.obj.Teardown();
    var context = this;
    
    context.error = context.response = context.announce = null;
    window.setTimeout(function () {
        context.obj.Disconnect();
        context.reset(); // close all signals
    }, 250);
    return true;
};

Nebula.RtspClient.prototype.getPosition = function(callback) {
    var context = this;
    if (!this.obj.GetPosition()) {
        this.position = '0.0';
        return false;
    }
    window.setTimeout(function () {
        if(callback)
            callback(context.position);
    }, 1000);
};

Nebula.RtspClient.prototype.connected = function () {
    return (this.obj.IsConnected());
};

Nebula.RtspClient.prototype.getTVLayerRect = function () {
    return this.player.GetTVLayerRect();
};

/**
 * Set TV player area 
 * @param {Object} x
 * @param {Object} y
 * @param {Object} w
 * @param {Object} h
 */
Nebula.RtspClient.prototype.setTVLayerRect = function (x, y, w, h) {
    return this.player.SetTVLayerRect(x, y, w, h);
};

/**
 * Get TV player layer status 
 */
Nebula.RtspClient.prototype.getTVLayerEnable = function () {
    return this.player.GetTVLayerEnable();
};

/**
 * Show or hide the TV player layer 
 * @param {Object} enabled
 */
Nebula.RtspClient.prototype.setTVLayerEnable = function (enabled) {
    return this.player.SetTVLayerEnable(enabled?true:false);
};


