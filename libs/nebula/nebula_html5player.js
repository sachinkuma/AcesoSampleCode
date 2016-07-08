/******************************************************************************/
/** @file 
*
* @brief    Nebula HTML5 player
*
* @author
*       Bernie Zhao
*
* @par Environment
*****************************************************************************/

Nebula = Nebula || {};

/**
 * Global function to get TV player singleton instance 
 */
Nebula.getHtml5Player = function() {
    if(Nebula.html5Player) {
        return Nebula.html5Player;
    }
    Nebula.html5Player = new Nebula.Html5Player();
    return Nebula.html5Player;
};

/**
 * Html5Player constructor 
 */
Nebula.Html5Player = function() {
    this.id = 'html5player';
    this.obj = null;
    this.$el = null;
    this.$container = null;
};

Nebula.Html5Player.prototype.log = function(msg) {
    if(console && console.log)
        console.log(msg);
};

/**
 * Play a channel
 * @param {Object} url This can be a url string or an array [{src:'file.mp4',type:'video/mp4'},{src:'file.webm',type:'video/webm'}]
 * @param {String} poster Poster url.
 * @param {String} [controls] If this parameter is specified it will be copied to video tag "controls" property
 */
Nebula.Html5Player.prototype.play = function (container, url, poster, controls) {
    var context = this;
    
    this.stop();
    
    if(!container) {
        this.log('Invalid container for HTML5 player!');
        return;
    }
    this.$container = (container instanceof jQuery)? container : $(container);
    
    this.log('Html5Player play call start');
    var $el = $('<video autoplay="autoplay" preload="none"></video>').attr('id', this.id);
    if(poster)
        $el.attr('poster', poster);
    if(controls)
        $el.attr('controls', controls);
    if($.isArray(url)) {    // a list of url
        $.each(url, function(i,source){
            if(source.src) {
                var $source = $('<source></source>').attr('src', source.src);
                if(source.type)
                    $source.attr('type', source.type);
                $source.appendTo($el);
            }
            
        });
    }
    else if(typeof(url) == 'string') {  // just src url
        $('<source></source>').attr('src', url).appendTo($el);
    }

    this.$container.append($el);
    this.$el = $el;
    
    this.obj = new MediaElement(this.id, {
        plugins: ['youtube','vimeo'],
        enableAutosize: true,
        iPadUseNativeControls: true,
        iPhoneUseNativeControls: true, 
        AndroidUseNativeControls: true, 
        success: function(media, domNode) {
            media.play();
            
            // add HTML5 events to the YouTube API media object
            media.addEventListener('play', function() {
                context.log('Html5Player playing...');
            }, false);
     
            media.addEventListener('timeupdate', function() {
                
            }, false);
     
            // add other events such as mute button click events
        }
    });
    
    /*
    this.obj = new MediaElementPlayer('#'+this.id, {
        plugins: ['youtube','vimeo'],
        enableAutosize: true,
        iPadUseNativeControls: true,
        iPhoneUseNativeControls: true, 
        AndroidUseNativeControls: true
    });
    */
    
    this.$container.children('iframe,video,object,embed').css({'position':'absolute', 'top':'0', 'left':'0', 'width':'100%', 'height':'100%'});
    this.log('Html5Player play call complete');
};

/**
 * Stop the player
 * @param {Boolean} standby If true the tv tuner will be tuned to an invalid channel for faster future access
 */
Nebula.Html5Player.prototype.stop = function () {
    this.log('Html5Player stop call start');
    if(this.obj && this.obj.stop) {
        this.obj.pause();
        this.obj.stop();
        this.obj = null;
    }
    if(this.$container) {
        this.$container.remove();
        this.$container = null;
    }
    this.log('Html5Player stop call complete');
};

/**
 * Get player area
 * @return {Object} Object containing x, y, width and height 
 */
Nebula.Html5Player.prototype.getVideoLayerRect = function () {
    var offset = this.$container.offset(), width = this.$container.width(), height = this.$container.height();
    var rect = {x:offset.left, y:offset.top, width:width, height:height};
    return rect;
};

/**
 * Set player area 
 * @param {Object} x
 * @param {Object} y
 * @param {Object} w
 * @param {Object} h
 */
Nebula.Html5Player.prototype.setVideoLayerRect = function (x, y, w, h) {
    this.$container.offset({left:x, top:y});
    this.$container.width(w);
    this.$container.height(h);
};

