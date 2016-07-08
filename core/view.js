// Global page stack
window.pages = window.pages || new Array();

window.pages.topPage = function () {
    return this[this.length - 1];
};

window.pages.findPage = function (viewId) {
    var page = null;
    for (var i = 0; i < window.pages.length; i++) {
        if (window.pages[i].viewId == viewId) {
            page = window.pages[i];
            break;
        }
    }
    return page;
};

window.pages.closePage = function (viewId) {
    var page = window.pages.findPage(viewId);
    if (page && page.destroy)
        page.destroy.call(page);
};

// Base view class
var View = Class.extend({

    // public properties
    id: 'view',  //eg: secondary

    viewId: null,  // In case we need multiple instances of same view. By default viewId = id

    wrapper: null, //eg: secondary-wrapper

    className: null,//eg: aboutus

    template: null, //eg: secondary.html

    css: null,      //eg: secondary.css

    data: null,     //eg: JSON object 

    breadcrumb: '',     //eg: Care|My Program

    label: '',          //eg: My Program

    query: '',          //eg: tag=hospitalmap&mapid=1

    oncreate: null,     // callback when page is shown

    ondestroy: null,    // callback when page is destroyed

    parent: null,   // parent page

    $el: null,  // cached jquery object

    itemSelector: 'a',

    trackPageView: true,    // wether we should track pageview

    trackOptions: {},   // additional tracking options

    pagePath: null, //eg: /home/aboutus/leadership; if not provided we will guess by parent path + current className or viewId

    isOverlay: false, // whether this page should be displayed as an overlay page (eg: popup dialog)

    // overwrite functions

    /**
     * Overwrite to put constructor code.
     */
    init: function (options) {
    },

    /**
     * Overwrite to put destructor code.
     */
    uninit: function () {
    },

    /**
     * Overwrite to include render content logic.
     */
    renderData: function () {
    },

    /**
     * Overwrite to process keys
     */
    navigate: function (key) {

        var navkeys = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        var keyIndex = navkeys.indexOf(key);
        if (keyIndex == -1)
            return false;

        var processed = false;
        var $focusedGroup = this.$('.selected');
        var $nextGroup = $();
        var $focusedLink = this.$('.active');
        var $nextLink = $();
        if (keyIndex < 2) { // UP and DOWN
            if ($focusedLink.length < 1) {
                var groupId = '#' + $focusedGroup.attr('id') + '-group';
                $nextLink = this.$(groupId).find(this.itemSelector).first();
            }
            else if (key == 'UP') {
                if ($focusedLink.is(':first-child'))
                    $nextLink = $focusedLink.siblings(':last');
                else
                    $nextLink = $focusedLink.prev();
            }
            else if (key == 'DOWN') {
                if ($focusedLink.is(':last-child'))
                    $nextLink = $focusedLink.siblings(':first');
                else
                    $nextLink = $focusedLink.next();
            }
            this.blur();
            this.focus($nextLink);
            processed = true;
        }
        else { // LEFT and RIGHT
            if (key == 'LEFT') {
                if ($focusedGroup.is(':first-child'))
                    $nextGroup = $focusedGroup.siblings(':last');
                else
                    $nextGroup = $focusedGroup.prev();
            }
            else if (key == 'RIGHT') {
                if ($focusedGroup.is(':last-child'))
                    $nextGroup = $focusedGroup.siblings(':first');
                else
                    $nextGroup = $focusedGroup.next();
            }
            this.blur(true);
            this.focus($nextGroup);
            this.click($nextGroup);
            processed = true;
        }
        return processed;
    },


    /**
     * Overwrite to process link blur
     */
    blur: function ($jqobj) {
        if ($jqobj)
            this.$(this.itemSelector).removeClass('selected active');
        else
        //this.$('*').not('.lazy').find(this.itemSelector).removeClass('selected active');
            this.$(this.itemSelector).filter('.active').removeClass('active');
        $(':focus').blur();
    },

    /**
     * Overwrite to process link focus
     */
    focus: function ($jqobj) {
        if ($jqobj && $jqobj.length > 0) {
            //anything in lazy group will be "selected" instead of "active"
            if ($jqobj.parent().hasClass('lazy'))
                $jqobj.addClass('selected');
            else
                $jqobj.addClass('active');
            $jqobj.focus();
        }
    },
    /**
     * Overwrite to process clicks
     */
    click: function ($obj) {
        return false;
    },

    /**
     * Overwrite to do something after page is shown
     */
    shown: function () {
    },

    // public functions

    $: function (selector) {
        return this.$el.find(selector);
    },

    render: function (data, success) {

        var context = this;
        if (this.css && $('link[href="css/' + this.css + '"]').length < 1) {
            $("<link/>", {rel: "stylesheet", type: "text/css", href: "css/" + this.css}).appendTo("head");
        }
        else {
            this.css = null;
        }

        // $wrapper is not in DOM yet.  We will append to DOM when everything is done    
        var $wrapper = $('<div id="' + this.wrapper + '"></div>');

        if (this.template) { // load template
            $wrapper.load('templates/' + this.template + ' #' + this.id, function (responseText, textStatus, XMLHttpRequest) {
                context._ready($wrapper);
            });
        }
        else {
            $wrapper.append('<div id="' + this.id + '"></div>');
            this._ready($wrapper);
        }
        return true;
    },

    refresh: function () {
    },

    initialize: function (options) {
        $.extend(this, options);

        this.viewId = this.viewId || this.id;
        this.wrapper = this.wrapper || (this.viewId + '-wrapper');

        this.init();

        if (!this.parent) {
            this.parent = window.pages.topPage();
        }

        if (!this.pagePath) {
            var path = this.className || this.viewId;
            var parentPath = this.parent ? this.parent.pagePath : '';
            this.pagePath = parentPath + '/' + path;
        }
    },

    destroy: function (noParentTracking) {
        this.uninit();

        // restore key handler
        this._removeKeyListener();
        this._removeMouseListener();

        if (this.css) {
            $('link[href="css/' + this.css + '"]').remove();
        }

        if (this.wrapper != 'primary-wrapper')
            $('#' + this.wrapper).remove();

        // Remove current page from stack
        for (var i = 0; i < window.pages.length; i++) {
            if (window.pages[i].viewId == this.viewId) {
                delete window.pages[i];
                window.pages.splice(i, 1);
                break;
            }
        }

        // We will show previous pages one by one until we find the topmost non-overlay page.
        if (!this.isOverlay) {
            for (var i = window.pages.length - 1; i >= 0; i--) {
                var page = window.pages[i];
                if (page) {
                    page.$el.show();
                    if (!page.isOverlay)
                        break;
                }
            }
        }

        if (!noParentTracking && this.parent) {
            this.parent._track();
        }

        this.parent = null;

        // callback to outside so they can bring up other UI
        if (this.ondestroy)
            this.ondestroy();
    },

    // handy helper functions

    // get the position of an item (usually an '<a>') inside a list
    getIndex: function (container, selector, focusSelector) {
        if (!container)
            container = '*';

        selector = selector || this.itemSelector;
        focusSelector = focusSelector || '.active';

        var $container = (container instanceof jQuery) ? container : this.$(container);
        var $items = $container.find(selector);
        var $curr = $items.filter(focusSelector);
        var pos = $items.index($curr);
        return pos;
    },

    // move focus to previous or next item in the list
    changeFocus: function (key, container, selector, focusSelector) {
        if (!container)
            container = '*';

        selector = selector || this.itemSelector;
        focusSelector = focusSelector || '.active';

        var $container = (container instanceof jQuery) ? container : this.$(container);
        var $items = $container.find(selector).filter(':visible');
        var $curr = $items.filter(focusSelector);
        var pos = $items.index($curr);
        var $next = $curr;

        if (pos < 0) {
            $next = $($items.get(0));
            this.focus($next);
            return;
        }

        switch (key) {
            case 'UP':
            case 'LEFT':
                $next = $($items.get(pos - 1));
                if ($next.length <= 0)
                    $next = $($items.get(-1));
                break;
            case 'DOWN':
            case 'RIGHT':
                $next = $($items.get(pos + 1));
                if ($next.length <= 0)
                    $next = $($items.get(0));
                break;
        }
        this.blur($curr);
        this.focus($next);
        if ($next.hasClass('menu-tab-button') && !$next.hasClass('back-button'))
            this.click($next);
        return true;

    },

    focusNextPage: function (container, pageSize, totalSize, orientation, selector, focusSelector) {
        if (!container)
            return;
        if (!orientation)
            orientation = 'vertical';
        selector = selector || this.itemSelector;

        var $container = (container instanceof jQuery) ? container : this.$(container);
        var idx = this.getIndex($container, selector, focusSelector);
        var total = totalSize || $container.find(selector).length;
        var page = Math.floor(idx / pageSize);

        page += 1;
        idx = page * pageSize;
        if (idx >= total)
            idx = total - 1;

        var $obj = $($container.find(selector).get(idx));
        this.blur($obj);
        this.focus($obj);
        this.scrollTo($obj, $container, orientation, true);
        if ($obj.hasClass('menu-tab-button') && !$obj.hasClass('back-button'))
            this.click($obj);
        return $obj;
    },

    focusPrevPage: function (container, pageSize, totalSize, orientation, selector, focusSelector) {
        if (!container)
            return;
        if (!orientation)
            orientation = 'vertical';
        selector = selector || this.itemSelector;

        var $container = (container instanceof jQuery) ? container : this.$(container);
        var idx = this.getIndex($container, selector, focusSelector);
        var total = totalSize || $container.find(selector).length;
        var page = Math.floor(idx / pageSize);

        page -= 1;
        idx = page * pageSize;
        if (idx < 0)
            idx = 0;

        var $obj = $($container.find(selector).get(idx));
        this.blur($obj);
        this.focus($obj);
        this.scrollTo($obj, $container, orientation, true);
        if ($obj.hasClass('menu-tab-button') && !$obj.hasClass('back-button'))
            this.click($obj);
        return $obj;
    },

    // move scrollbar to next screen
    scrollNext: function (container, orientation) {
        if (!container)
            return;
        if (!orientation)
            orientation = 'vertical';

        var $container = (container instanceof jQuery) ? container : this.$(container);
        if (orientation == 'horizontal') {
            $container.scrollLeft($container.scrollLeft() + $container.width());
        }
        else {
            $container.scrollTop($container.scrollTop() + $container.height());
        }
    },

    // move scrollbar to previous screen
    scrollPrev: function (container, orientation, autoFocus) {
        if (!container)
            return;
        if (!orientation)
            orientation = 'vertical';

        var $container = (container instanceof jQuery) ? container : this.$(container);
        if (orientation == 'horizontal') {
            $container.scrollLeft($container.scrollLeft() - $container.width());
        }
        else {
            $container.scrollTop($container.scrollTop() - $container.height());
        }
    },

    // move scrollbar to the exact position of an item
    scrollTo: function ($obj, container, orientation, autoFocus) {
        if (!$obj)
            return;

        if (!container)
            container = $obj.parent();
        if (!orientation)
            orientation = 'vertical';

        var $container = (container instanceof jQuery) ? container : this.$(container);
        var margin = 0;
        if (orientation == 'horizontal') {
            margin = parseInt($obj.css('marginLeft'));
            $container.scrollLeft($obj.offset().left - $container.offset().left + $container.scrollLeft() - margin);
        }
        else {
            margin = parseInt($obj.css('marginTop'));
            $container.scrollTop($obj.offset().top - $container.offset().top + $container.scrollTop() - margin);
        }

        if (autoFocus) {
            this.blur($obj);
            this.focus($obj);
        }
    },


    // show/hide the next and prev buttons based on the pagination
    pagination: function (container, prevbutton, nextbutton, orientation, selector) {
        selector = selector || this.itemSelector;
        orientation = orientation || 'vertical';
        var $container = (container instanceof jQuery) ? container : this.$(container);
        var $prev = (prevbutton instanceof jQuery) ? prevbutton : this.$(prevbutton);
        var $next = (nextbutton instanceof jQuery) ? nextbutton : this.$(nextbutton);
        var $items = $container.find(selector);
        if ($items.length < 1)   // empty list
            return;
        var $first = $($items.get(0));
        var $last = $($items.get(-1));
        var pos = 0, pageFirst = false, pageLast = false;
        if (orientation == 'horizontal') {
            pos = $container.scrollLeft();
            pageFirst = ($first.position().left + $first.width()) > 0;
            pageLast = ($last.position().left + $last.width()) <= $container.width();
        }
        else {
            pos = $container.scrollTop();
            pageFirst = ($first.position().top + $first.height()) > 0;
            pageLast = ($last.position().top + $last.height()) <= $container.height();
        }
        if (pageFirst)
            $prev.hide();
        else
            $prev.show();

        if (pageLast)
            $next.hide();
        else
            $next.show();
    },

    translate: function (lang, key) {
        var context = this;
        var dict = this._getDictionary(lang);
        if (!dict)
            return null; // no dictionary, do nothing

        if (key) {
            // translate just a string
            if (dict[key])
                return dict[key];
        }
        else {
            // translate the entire page
            this.$('[data-translate]').each(function (i) {
                var key = $(this).attr('data-translate');
                var text = context.translate(lang, key);
                if (text) {
                    $(this).contents().filter(function () {
                        return (this.nodeType == 3);
                    }).replaceWith(text);
                }
            });
        }
    },

    gotoChannel: function (chNum) {
        return false;
    },

    keyChannel: function (key) {
        var cLength = 1;
        var keycheck = window.settings.keycheck;
        if (keycheck) {
            clearTimeout(keycheck);
            window.settings.keycheck = '';
        }

        var pKey = window.settings.key;

        if (pKey) {
            window.settings.key = '';
            pKey = pKey + key;

            cLength = pKey.length;
            if (cLength == 3) {
                this.key3Channel(pKey);
                return;
            }
            key = pKey;
        }

        if (cLength == 1 && key == '0')
            return;

        var _this = this;
        window.settings.key = key;
        var keycheck = setTimeout(function () {
            _this.key2Channel()
        }, 2000, window.settings.channelID);
        window.settings.keycheck = keycheck;
        return key;
    },


    key2Channel: function (key) {
        msg('in key2Channel ' + key)
        var keycheck = window.settings.keycheck;
        clearInterval(keycheck);
        window.settings.keycheck = '';

        var pKey = window.settings.key;
        window.settings.key = '';

        this.key3Channel(pKey);
        return pKey;
    },

    key3Channel: function (key) {
        msg('in key3Channel ' + key);
        this.gotoChannel(key);
        return;
    },

    
     isPlayerError: function () {
        var player = Nimbus.getPlayer();
        var status = player.getErrorStatus();
		msg(status);
        return (status >= 10);
    },

    isPlayerOK: function () {
        msg('view.js - isPlayerOK');
        
        var player = Nimbus.getPlayer();
        if(!player) {
            clearInterval(window.playerOK);
            return false;
        }
        var suspendPosition = player.getPosition();
        if(isPlayerError() || suspendPosition == 0) {		
            clearInterval(window.playerOK);
            this.stopVideo();        	
            player.close();
            window.playerOK = '';
            this.destroy();
            msg('VIDEO PLAYER: we are trying to stop a  movie!');
            return false;
	    }
        return true;
    },
    // private functions

    _track: function () {
        // Analytics
        if (this.trackPageView) {
            var title = this.pagePath;
            if (this.label) {
                title = this.label;
            }
            document.title = title;

            nova.tracker.pageView(this.pagePath, title, this.trackOptions);
        }
        return true;
    },

    _ready: function ($wrapper) {
        $wrapper.addClass('view-wrapper');

        this.$el = $wrapper.find('#' + this.id);
        if (this.$el.length <= 0) {
            $('#' + this.wrapper).append('<div id="' + this.id + '"></div>');
            this.$el = $('#' + this.wrapper + ' #' + this.id);
        }

        if (this.className)
            this.$el.addClass(this.className);

        // callback to overwritten
        this.renderData();

        // translation happens after renderData()?    
        var lang = window.settings.language;
		
		this.$el.addClass(lang);
		
        if (lang && lang != 'en') {
            this.translate(lang);
        }

        this.$el.show();

        this.isOverlay = this.$el.hasClass('page-overlay');
        // We will hide all previous pages unless the new page has a special CSS class "page-overlay".
        if (!this.isOverlay) {
            $('.view-wrapper > div').hide();
        }

        // add into DOM
        var $container = $('#' + this.wrapper);
        if ($container.length <= 0) {
            $wrapper.hide();
            $('body').append($wrapper);
            //$wrapper.show(200);  // change this if running on low-end device. We animate to reduce the paint effect.
            $wrapper.show();  // change this if running on low-end device. We animate to reduce the paint effect.
        }
        else {
            $container.html($wrapper.html());
        }

        // add to global stack
        window.pages.push(this);

        // track page view
        this._track();

        // update cache
        this.$el = $('#' + this.wrapper + ' #' + this.id);

        this._addKeyListener();
        this._addMouseListener();

        // callback to overwritten
        this.shown();

        if (this.oncreate)
            this.oncreate();

    },

    // Hijack the global keypressed() function
    _addKeyListener: function () {
        this.original_keypressed = window.keypressed;
        var context = this;
        window.keypressed = function (keyCode) {
            var event = {};
            var processed = context._keypressed(keyCode, event);
            if (!processed && context.original_keypressed && !event.stopBubble)
                return context.original_keypressed(keyCode, event);
            return processed;
        };
    },

    // Restore the key handler
    _removeKeyListener: function () {
        window.keypressed = this.original_keypressed;
    },

    _keypressed: function (keyCode, e) {

        var akey = getkeys(keyCode);
        this.key = akey;
        var $curr = this.$('a.active');
        var handled = this.navigate(akey, e);
        if (window['msg'])
            msg('( #' + this.id + ' ) keypress: code = ' + keyCode + ' - ' + akey + ' handled:' + handled);

        if (handled && e && e.preventDefault) {
            e.preventDefault();
        }

        var nonBubbleKeys = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'CHUP', 'CHDN'];

        // let's handle some special keys
        if (!handled) {
            if (nonBubbleKeys.indexOf(akey) >= 0) { // prevent nav keys to fallback to underneath pages
                return true;
            }
            if (akey == 'CLOSE' || akey == 'BACK') {   // just close this page
                this.destroy();
                return true;
            }
            else if (akey == 'CLOSEALL' || akey == 'MENU' || akey == 'HOME' || akey == 'POWRold') {   // close page and bubble up
                this.destroy(true);
                return false;
            }
            else if (akey == 'ENTER' && $curr.length > 0) {  // default link click
                return this.click($($curr));
            }
            else if (akey == 'ENTER' && $curr.length <= 0) {  // page don't handle ENTER and nothing is on focus, don't fallback to underneath pages
                return true;
            }

            return false;
        }
        else {
            return handled;
        }

        return false;
    },

    _addMouseListener: function () {
        var context = this;
        this.$el.delegate(this.itemSelector, 'click', function (e) {
            //context.blur($(this));
            //context.focus($(this));			
            var processed = context.click($(this));
            e.preventDefault();
        });
    },

    _removeMouseListener: function () {
        this.$el.undelegate(this.itemSelector, 'click');
    },

    _getDictionary: function (lang) {
        window.settings.dictionaries = window.settings.dictionaries || {};
        var dict = window.settings.dictionaries[lang];

        if (!dict) {
            var url = 'translation/' + lang + '.json';
            //msg('get dictionary ' + lang + '.json');
            var file = ajaxJSON(url, '');
            if (file.dictionary) {
                window.settings.dictionaries[lang] = dict = file.dictionary;
            }
        }
        return dict;
    },

    _focusMajor: function ($menu) {

        if (!$menu || !($menu instanceof jQuery))
            return;
        this.blur(true);
        this.focus($menu);
        var groupId = '#' + $menu.attr('id') + '-group';
        this.$('.menu-group').hide();
        this.$(groupId).show();
        var tabId = '#' + $menu.attr('id') + '-tab';
        //msg('focusmajor' + tabId);  
        this._focusTab(this.$(tabId));
        var $nextLink = $();
        $nextLink = this.$(groupId).find('a').first();
        this.focus($nextLink);

        return true;

    },

    _focusTab: function ($tab) {
        this.$('.menu-tab').hide();
        $tab.show();

        if ($tab.find('.sub-page').length < 1) {
            this.$('.arrow-button').hide();
            this._focusButton($tab.find('a').first());
        }
        else {
            this.$('.arrow-button').show();
            this._focusPage($tab.find('.sub-page').first());
        }
    },

    _focusPage: function ($page) {
        if (!$page || !($page instanceof jQuery))
            return;
        if ($page.length < 1)
            return;

        this.$('.sub-page').hide();
        $page.show();
        this._focusButton($page.find('a').first());

    },

    _focusButton: function ($button) {
        if (!$button || !($button instanceof jQuery))
            return;
        if ($button.length < 1)
            return;

        this.$('a.active').removeClass('active');
        $button.addClass('active');
    },

    _focusPoster: function ($poster) {

        if (!$poster || !($poster instanceof jQuery))
            return;
        if ($poster.length < 1)
            return;

        var title = $poster.attr("title");

        var $focusedTab = this.$('.minor .menu-tab').filter(':visible');
        $focusedTab.find('img.active').removeClass('active').addClass('inactive');
        $poster.removeClass('inactive').addClass('active');
        $focusedTab.find('.carouselTitle').html('<p style="display:block">' + title + '</p>');

    },


    _switchPage: function (key) {
        var $focusedTab = this.$('.minor .menu-tab').filter(':visible');

        if ($focusedTab.length < 1 || $focusedTab.find('.sub-page').length <= 1) { // nothing to slide to
            return false;
        }
        else {
            var $focusedPage = $focusedTab.find('.sub-page').filter(':visible').first();
            var $nextPage = $();
            if (key == 'LEFT') {
                if ($focusedPage.is(':first-child'))
                    $nextPage = $focusedPage.siblings(':last');
                else
                    $nextPage = $focusedPage.prev();
            }
            else if (key == 'RIGHT') {
                if ($focusedPage.is(':last-child'))
                    $nextPage = $focusedPage.siblings(':first');
                else
                    $nextPage = $focusedPage.next();
            }
            this._focusPage($nextPage);
        }
        return true;
    },


    _switchPoster: function (key, container, selector, focusSelector) {

        if (!container)
            container = '*';

        selector = selector || this.itemSelector;
        focusSelector = focusSelector || '.active';

        var $container = (container instanceof jQuery) ? container : this.$(container);
        var $items = $container.find(selector).filter(':visible');
        var $curr = $items.filter(focusSelector);
        var pos = $items.index($curr);
        var $next = $curr;


        var $focusedTab = this.$('.minor .menu-tab').filter(':visible');
        var $focusedPoster = $focusedTab.find('img.active').first();

        var $container = ($focusedPoster.length > 0) ? $focusedPoster : $focusedTab;
        //alert($focusedPoster.length + ' ' + $container.length)

        if ($container.length < 1) {
            return false;
        }


        var $nextPoster = $();

        if ($focusedPoster.length < 1) {
            $nextPoster = $container.find('img.active').first();

            if ($nextPoster.length < 1) {
                return false;
            }
        }
        else {

            if (key == 'LEFT') {
                if ($focusedPoster.is(':first-child'))
                    $nextPoster = $focusedPoster.siblings(':last');
                else
                    $nextPoster = $focusedPoster.prev();
            }
            else if (key == 'RIGHT') {
                if ($focusedPoster.is(':last-child'))
                    $nextPoster = $focusedPoster.siblings(':first');
                else
                    $nextPoster = $focusedPoster.next();
            }
        }
        this._focusPoster($nextPoster);
        this.scrollTo($nextPoster, '.carouselPosters', 'vertical', false);
        return true;
    },
    
});

