//socket.emit('handshake', '192.168.100.60:1235', 'xxxxxxx', '101');
//socket.emit('handshake', ipaddress, 'xxxxxxx', '101');
RTSPIOClient = {

    // TODO: we should get the io address from a config file
    proxyServerUrl: null,
    // TODO: we should get the io address from a config file
    clientPort: '1235',
    ip: null,
    url: null,
    roomNumber: null,

    connect: function(){
        var ewf = ewfObject();
        this.proxyServerUrl = ewf.proxyServerUrl;

        debug.log('loading rtsp proxy');
        this.socket = io(this.proxyServerUrl);
        if(!this.socket.connected){
            this.socket.connect(this.proxyServerUrl);
        }
        window.socket = this.socket;
        debug.log('finished proxy client constructor');
    },

    disconnect: function(){
        this.socket.off('message');
        this.socket.off('handshake');
        this.socket.off('ended');
        this.socket.off('loaded');
        this.socket.off('playing');
        this.socket.off('paused');
        this.socket.off('rcvdParams');
        this.socket.off('announced');
        this.socket.off('teardown');
        this.socket.off('disconnect');
    },

    initListeners: function(){
        var self = this;

        this.socket.on('message', function (data) {
            debug.log(data);
        });

        this.socket.on('handshake', function () {
            self._emitLoad(self);
        });

        this.socket.on('ended', function (data) {
            debug.log(data);
            debug.log('video ended');
        });

        this.socket.on('loaded', function (data) {
            debug.log(data);
            debug.log('loaded video');
            self.triggerPlay(1, "0.0-");
        });

        this.socket.on('playing', function (data) {
            debug.log('playing video');
            debug.log(data);
        });

        this.socket.on('paused', function (data) {
            debug.log(data);
        });

        this.socket.on('rcvdParams', function (data) {
            debug.log(data);
        });

        this.socket.on('announced', function (code, data) {
            debug.log(code);
            debug.log(data);
        });

        this.socket.on('teardown', function (code, data) {
            debug.log(code);
            debug.log(data);
        });

        this.socket.on('disconnect', function(){
            //debug.log(code);
            //debug.log(data);
            self.disconnect();
            delete self.socket;
        });
    },

    // EMITTERS
    // we should only call these internally.

    _emitHandshake: function() {
        this.socket.emit('handshake', this.ip, 'xxxxxxx', this.getRoomNumber());
    },

    _emitLoad: function(scope) {
        //var url = 'rtsp://192.168.100.80:554/60010000?assetUid=3b9acb15&transport=MP2T/AVP/UDP&ServiceGroup=100&smartcard-id=0021F80337F2&device-id=0021F80337F2&home-id=100326_1&client_mac=0021F80337F2';
        scope.socket.emit('load', this.getUrl())
    },

    _emitPlay: function(scale, offset) {
        this.socket.emit('play', scale, offset);
    },

    _emitPause: function() {
        this.socket.emit('pause');
    },

    _emitGetCurrentTime: function() {
        this.socket.emit('currentTime');
    },

    _emitTeardown: function() {
        debug.log('emit teardown of proxy video');
        this.socket.emit('teardown');
    },

    // TRIGGERS
    // these will be called externally

    triggerPlay: function(scale, offset) {
        debug.log('!!!!PLAY STREAM!!!');
        this._emitPlay(scale, offset);
    },

    triggerPause: function() {
        this._emitPause();
    },

    triggerTeardown: function() {
        debug.log('trigger teardown of proxy video');
        this._emitTeardown();
    },

    triggerHandshake: function() {
        var ip = this.getIp();
        debug.log("Starting stream and sending to: " + ip);
        this._emitHandshake(ip);
    },

    // SETTERS

    setIp: function(ip){
        this.ip = ip;
    },

    setUrl: function(url){
        this.url = url;
    },

    setRoomNumber: function(num){
        this.roomNumber = num;
    },

    // GETTERS

    getCurrentTime: function() {
        this._emitGetCurrentTime();
    },

    getUrl: function(){
        return this.url;
    },

    getIp: function(){
        return this.ip;
    },

    getRoomNumber: function(){
        return this.roomNumber;
    }
};