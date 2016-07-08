var Intro = View.extend({
    
    id: 'intro',
    
    template: 'intro.html',
    
    css: 'intro.css',
    
    className: 'languages',
    
    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/
    navigate: function(key)    {
		var $curr = $('#intro a.active');
		var $next = $curr.next();
		if($next.length<=0) 
			$next = $curr.prev();
			
        if(key == 'POWR') {
            return false;
        }
		else if (key == 'ENTER') {  // default link click             								
			return this.click($curr);
		}
		else if(key == 'UP' || key == 'DOWN') {			
			this.blur($curr);
			this.focus($next);
		}
        
        return false;
    },
    
    click: function($jqobj) {
        var linkid = $jqobj.attr('id');
        window.settings = window.settings || {};
        window.settings.language = linkid;
        this.destroy();
        if(linkid == 'en' || linkid == 'es' || linkid == 'vi') {
		    // tracking
            nova.tracker.event('language', 'introset', linkid);
			
			// send language back to server
            setLanguage(linkid); 
            var intro2 = new Intro2({});
            intro2.render();
            return true;			
        }
        
        return false;
    },
    
    renderData: function() {
        var context = this;
    },
    
    /**********************************************************************************
     * Own public functions; Outside can call these functions
     *********************************************************************************/
    
    /**********************************************************************************
     * Private functions; Starts with '_' only used internally in this class
     *********************************************************************************/
});

