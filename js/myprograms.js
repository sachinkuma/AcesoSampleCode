var MyPrograms = View.extend({

    id: 'myprograms',
    
    template: 'myprograms.html',
    
    css: 'myprograms.css',
    
    pageSize: 6,
    
    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/

    navigate: function(key)	{
			var $curr = $("#myprograms .major a.selected");			
			this.key = key;						
			var context = this;
			
			if(key == 'ENTER' && $curr.hasClass('back-button')) {
				this.destroy();
				return true;
			}				
			else if(key == 'MENU' || key == 'HOME') {
				this.destroy();
				return true; 			
			}
			else if(key == 'UP' || key == 'DOWN') {
				this.changeFocus(key, '.major','','.selected');   
				return true;
			}
            else if (key == 'CHUP' || key == 'PGUP') {
                this.focusPrevPage('.major', 9, null, 'vertical', '', '.selected');
                return true;
            }
            else if (key == 'CHDN' || key == 'PGDN') {
                this.focusNextPage('.major', 9, null, 'vertical', '', '.selected');
                return true;
            }
			else if(key == 'LEFT') {
				this.destroy();
				return true;
			}	
			else if (key == 'ENTER' && $curr.hasClass('back-button')) {  // default link click             					
				this.destroy();
				return true; 
			}
			else if (key == 'ENTER' || key == 'RIGHT') {  // default link click             					
					this.key = 'ENTER';
					return this.click($curr);
			}
			return false;
    },
    
    // When "ENTER" is pressed on a link, or when link is clicked by mouse or touch screen
    click: function($jqobj) {
    	var linkid = $jqobj.attr('id');
        var parentid = $jqobj.parent().attr('id');
        var type = $jqobj.attr('data-type');
        var itemData = this._getMenuItemData($jqobj);
        	
    	if($jqobj.hasClass('back')) { // back button
    		this.destroy();
    		return true;
    	} 
    	
    	// page up/down
    	if( linkid == 'next' || linkid == 'prev') {
    	    if (linkid=='next')
               this.scrollNext('#selections', 'vertical');
            else
               this.scrollPrev('#selections', 'vertical');
    	    this.pagination('#selections', '#prev', '#next', 'vertical');
    	    return true;
    	}
    	
    	// selecting a video
    	if($jqobj.hasClass('asset') && itemData) {
    	    var breadcrumb = this.$('.page-title').text();
    	    var page = new ProgramDetail({className:'', parent:this, breadcrumb:breadcrumb, data: itemData});
    	    page.render();
    	    return true;
    	}
    	
    	return false;
    },
    
    renderData: function() {
        this.$('.page-title').html(this.breadcrumb);        
        this.label = this.data.label;
		var c = $('<p class="text-large"></p>').html(this.label);
        this.$('#heading2').append(c);

        this.label = this.data.label;
        
        this._buildBookmarks();
    },
    
    shown: function() {
		var $firstObj = this.$('.major a:nth-child(2)');		
        if($firstObj.length == 0) 
            $firstObj = this.$('.major .back-button');		
        
        $firstObj.addClass('selected');
    },
    
    refresh: function() {
        var context = this;
        context.$('.major').empty();
        this._buildBookmarks();
        var $firstObj = this.$('.major a:nth-child(2)');		
        if($firstObj.length == 0) 
            $firstObj = this.$('.major .back-button');		
        
        $firstObj.addClass('selected');
        
    },
    
    /**********************************************************************************
     * Own public functions; Outside can call these functions
     *********************************************************************************/
    
        /**********************************************************************************
     * Private functions; Starts with '_' only used internally in this class
     *********************************************************************************/
    _buildBookmarks: function () {
        var context = this;
        context.$('#selections').empty();
        
        var ewf = ewfObject();
        var poUid = ewf.healthcarePOUID;
        
        var tickets = getListTicket();
        this.$('.major').append('<a class="back-button" href="#" title="back" data-translate="back">< Back</a>');
        if(!tickets || !tickets.DataArea || !$.isArray(tickets.DataArea.ListOfTicket))
            return;
		
        var bookmarks = tickets.DataArea.ListOfTicket;
        // filter only assets under healthcare PO
        bookmarks = $.grep(bookmarks, function(ticket, i){
            var po = $.grep(ticket.ListOfSubEntry, function(sub, j) {
                return sub.tagName == 'ProductOffering';
            });
            return (po && po[0] && po[0].tagAttribute && po[0].tagAttribute.productOfferingID==poUid);
        });
        
        // build up the title list
        this.bookmarks = bookmarks;
        $.each(bookmarks, function(i, ticket){
            $.each(ticket.ListOfSubEntry, function(j, sub){
                if(sub.tagName == 'Asset') {
                    $('<a href="#" class="asset ellipsis"></a>').attr('data-index', i).attr('title', sub.ListOfMetaData.Title)
                        .text(sub.ListOfMetaData.Title).appendTo(context.$('.major'));
                    return false;
                }
            });
        });
            
        // pad some extra lines to fill the last page
        var padNum = this.pageSize - (bookmarks.length % this.pageSize);
        if(padNum == 6) padNum = 0;
        for(var i=0; i<padNum; i++) {
            $('<div class="padding"></div>').appendTo(context.$('.major'));
        }
    },
    
    _getMenuItemData: function ($obj) {
        var itemData = null;
        var itemIndex = $obj.attr('data-index');
        
        if(itemIndex && this.bookmarks && this.bookmarks) {
            itemData = this.bookmarks[itemIndex];
        }
        
        return itemData;
    }
});    