var WebSite = View.extend({
    
    id: 'website',
    
    template: 'website.html',
    
    css: 'website.css',
    
    webpage: null,
    
    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/
	navigate: function(key) {
		var context = this;		
		if(key == 'DOWN') {
			$('#webpage').contents().scrollTop($('#webpage').contents().scrollTop()+250);			
			return true;
		}
		if(key == 'UP') {
			$('#webpage').contents().scrollTop($('#webpage').contents().scrollTop()-250);			
			return true;
		}
		else if (key == 'LEFT' || key == 'ENTER' || key == 'MENU' || key == 'HOME') {  // default link click             					
			this.destroy();
			return true; 
		}
		return false;
    },
	    
    click: function($jqobj) {
        return false;
    },

    renderData: function() {
        var context = this;
        
        this.query = 'link=' + encodeURI(this.webpage);
        this.webpage = this.webpage || this._getAddress();
        
        this.$('#close').click(function(e){
            this.destroy();
            e.preventDefault();
        });
        
        if(this.webpage) {
            this.$('#mask').show();
            this.$('#webpage').attr('src', this.webpage);
            
            this.$('#webpage').load(function() {
                context.$('#mask').hide();
            });
            
            // a timer just in case the loading takes forever
            $.doTimeout('iframe loading timer', 10000, function() {
                context.$('#mask').hide();
                return false;
            });
			var iframe = $("body")[0];
			iframe.focus();
			$('#webpage').contents().focus();
        }

    },
    
    /**********************************************************************************
     * Own public functions; Outside can call these functions
     *********************************************************************************/
    
    _getAddress: function() {
        if(!this.data || !this.data.attributes || !this.data.attributes.attribute)
            return null;	
            
        var attrlist = this.data.attributes.attribute;
        var addr = '';
        
        if($.isArray(attrlist)) {            
            $.each(this.data.attributes.attribute, function(i,attrib){
                if(attrib['class'] == "address") {
                    addr = attrib['text'];
                    return false;
                }
            });
        }
        else {
            if(attrlist['class'] == "address")
                addr = attrlist['text'];
        }
        
        this.query = 'tag=' + this.data.tag;
        this.label = this.data.label;
        return addr;
    }
});



