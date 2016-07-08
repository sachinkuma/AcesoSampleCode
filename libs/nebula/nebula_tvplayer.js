/******************************************************************************/
/** @file 
*
* @brief	Nebula RTSP Client for Javascript
*
* @author
*		Bernie Zhao
*
* @par Environment
*****************************************************************************/

Nebula = Nebula || {};

/**
 * Global function to get TV player singleton instance 
 */
Nebula.getTVPlayer = function() {
    if(Nebula.tvPlayer) {
        return Nebula.tvPlayer;
    }
    Nebula.tvPlayer = new Nebula.TVPlayer();
    return Nebula.tvPlayer;
};

/**
 * TVPlayer constructor 
 */
Nebula.TVPlayer = function() {
    // Create a native tv player object
    try {
        this.obj = EOTVPlayer;
    } catch(e) {
        this.obj = null;
        if(console && console.error)
            console.error('EOTVPlayer object failed to initialize!');
    }
};

Nebula.TVPlayer.prototype.log = function(msg) {
    if(console && console.log)
        console.log(msg);
};

/**
 * Play a TV channel
 * @param {String} type "Analog", "Digital" or "Custom"
 * @param {String} param If type is "Analog", param should be NTSC channel number. Eg: "2"
 * @param {String} label Channel label. Eg: "Discovery"
 */
Nebula.TVPlayer.prototype.play = function (type, param, label) {
    this.log('TVPlayer play call start');
    this.obj.Play(type, param, label);
    this.log('TVPlayer play call complete');
};

/**
 * Stop the TV player
 * @param {Boolean} standby If true the tv tuner will be tuned to an invalid channel for faster future access
 */
Nebula.TVPlayer.prototype.stop = function (standby) {
    this.log('TVPlayer stop call start');
    this.obj.Stop(standby?true:false);
    this.log('TVPlayer stop call complete');
};

/**
 * Get TV player area
 * @return {Object} Object containing x, y, width and height 
 */
Nebula.TVPlayer.prototype.getTVLayerRect = function () {
    return this.obj.GetTVLayerRect();
};

/**
 * Set TV player area 
 * @param {Object} x
 * @param {Object} y
 * @param {Object} w
 * @param {Object} h
 */
Nebula.TVPlayer.prototype.setTVLayerRect = function (x, y, w, h) {
    return this.obj.SetTVLayerRect(x, y, w, h);
};

/**
 * Get TV player layer status 
 */
Nebula.TVPlayer.prototype.getTVLayerEnable = function () {
    return this.obj.GetTVLayerEnable();
};

/**
 * Show or hide the TV player layer 
 * @param {Object} enabled
 */
Nebula.TVPlayer.prototype.setTVLayerEnable = function (enabled) {
    return this.obj.SetTVLayerEnable(enabled?true:false);
};



