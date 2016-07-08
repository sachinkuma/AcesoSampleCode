var Intro2 = View.extend({

    id: 'intro2',

    template: 'intro2.html',

    css: 'intro2.css',

    className: 'agreement',

    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/
    navigate: function (key) {
        var $curr = $('#intro2 a.active');
        var $next = $curr.next();
        if ($next.length <= 0)
            $next = $curr.prev();

        var ignoredKeys = ['MENU', 'HOME', 'EXIT', 'BACK', 'POWR', 'CLOSE', 'CLOSEALL'];
        if(ignoredKeys.indexOf(key) >= 0) {
            return true;
        }

        else if (key == 'ENTER') {  // default link click
            return this.click($curr);
        }
        else if (key == 'UP' || key == 'DOWN') {
            this.blur($curr);
            this.focus($next);
            return true;
        }

        return false;
    },

    click: function ($jqobj) {
        var linkid = $jqobj.attr('id');

        if (linkid == 'accept') {
            // tracking
            nova.tracker.event('terms', 'accept');

            // close both intro page and intro2 page
            window.pages.closePage('intro');
            this.destroy();

            // build primary page
            var page = new Primary({});
            page.render();
            return true;
        }
        else if (linkid == 'decline') {

            nova.tracker.event('terms', 'decline');

            // Reset language
            setLanguage('');

            // Close primary page
            window.pages.closePage('primary');
            this.destroy();

            // Open TV guide
            this.watchTV(linkid);
            return true;
        }

        return false;
    },

    renderData: function () {
        var context = this;
    },

    /**********************************************************************************
     * Own public functions; Outside can call these functions
     *********************************************************************************/
    watchTV: function (className) {
        //var context = this;
        //
        //this.tvChannels = [];
        // var channels = epgChannels().Channels;
        // $.each(channels, function(i, ch) {
        //     context.tvChannels.push({type: 'Analog', url: ch.channelNumber, display: ch.channelName});
        // });
        // var page = new VideoPlayer2({viewId: 'tvonly', className:className, playlist: this.tvChannels, playlistIndex: 0, delay: 10000, delayMessage: 'One moment while we are loading the television channels...'});
        // page.render();
        setLanguage(''); 
        var linkId = 'tv';
        var pagePath = this.pagePath + '/' + linkId;
        var page = new TVGuide({className: className, pagePath: pagePath});
        page.render();
    }
    /**********************************************************************************
     * Private functions; Starts with '_' only used internally in this class
     *********************************************************************************/

});

