var Discharged = View.extend({

    id: 'discharged',

    template: 'discharged.html',

    css: 'discharged.css',

    trackOptions: {'nonInteraction': true, 'sessionControl': 'end'},

    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/

    navigate: function (key) {
    
        if(key == 'POWR') {			
            return false;
        }

        //discharged page never closes
        var ignoredKeys = ['MENU', 'HOME', 'EXIT', 'BACK', 'POWR', 'CLOSE', 'CLOSEALL'];
        if (ignoredKeys.indexOf(key) >= 0) {
            return true;
        }

        else if (key == 'CHUP' || key == 'CHDN') {
            this.watchTV('discharged');
            return true;
        }
        return false;
    },

    click: function ($jqobj) {
        return false;
    },

    uninit: function () {
        $.doTimeout('discharged clock');    // stop clock
    },

    renderData: function () {
        var context = this;
        var room = '';
        if(window.settings.room) 
            room = window.settings.room.toUpperCase();
        this.$('#room').text("Room: " + room);
        this.$('#phone').text(window.settings.phone);

        // start clock
        $.doTimeout('discharged clock', 60000, function () {
            var d = new Date();
            var format = 'h:MM TT dddd, mmmm d, yyyy';
            var locale = window.settings.language;
            context.$('#datetime').text(d.format(format, false, locale));
            return true;
        });
        $.doTimeout('discharged clock', true); // do it now
        this.$('#revision').html('UpCare ' + window.package.version + '<br>' + window.settings.version.replace('PROCENTRIC', 'LG') + ' ' + window.settings.platformVersion);
    },

    /**********************************************************************************
     * Own public functions; Outside can call these functions
     *********************************************************************************/
    watchTV: function (className) {
        var linkId = 'tv';
        var pagePath = this.pagePath + '/' + linkId;
        var page = new TVGuide({className: className, pagePath: pagePath});
        page.render();
    }
    /**********************************************************************************
     * Private functions; Starts with '_' only used internally in this class
     *********************************************************************************/

});    