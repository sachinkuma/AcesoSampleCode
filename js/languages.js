var Languages = View.extend({
    
    id: 'languages',
    
    template: 'languages.html',
    
    css: 'languages.css',
    
    language: null,
    
    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/
    navigate: function(key)    {	
		var $curr = $('#languages a.active');
		var $next = $curr.next();
		if($next.length<=0) 
			$next = $curr.prev();

        if(key == 'POWR') {
            return false;
        }
			
		if(key == 'CLOSE' || key == 'CLOSEALL' || key == 'MENU' || key == 'HOME') {            
			this.destroy();
			return true; 			
        }
		else if (key == 'ENTER') {  // default link click             								
			return this.click($curr);
		}
		else if(key == 'UP' || key == 'DOWN') {			
			this.blur($curr);
			this.focus($next);
		}

    },
    
    click: function($jqobj) {
        var linkid = $jqobj.attr('id');
        var parentid = $jqobj.parent().attr('id');
                
        if(linkid == 'en' || linkid == 'es') {          
            var lang = linkid;
                       
            //save it
            window.settings.language = lang;
            // send language back to server
            setLanguage(lang); 
            
            // tracking
            nova.tracker.event('language', 'switch', lang);
            
            // just close, the primary page will detect language change and translate itself
            this.destroy();
            return true;
        }
                
        return false;
    },

    renderData: function() {
        var context = this;
        
        this.$('#body div').hide();
        this.$('#body #instruction').show();        
    }
    
    /**********************************************************************************
     * Own public functions; Outside can call these functions
     *********************************************************************************/
    
    /**********************************************************************************
     * Private functions; Starts with '_' only used internally in this class
     *********************************************************************************/
});



