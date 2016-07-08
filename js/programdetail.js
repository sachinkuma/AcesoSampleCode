var ProgramDetail = View.extend({

    id: 'programdetail',
    
    template: 'programdetail.html',
    
    css: 'programdetail.css',
    
    pageSize: 6,
    
    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/

    navigate: function(key)	{
		var $curr = this.$(".major a.selected");			
		if(key == 'MENU' || key == 'HOME' || key == 'LEFT') {
            this.destroy();
			return true; 			
		}
        else if(key == 'RIGHT') {
            return true;
        }
		else if(key == 'UP' || key == 'DOWN') {
			this.changeFocus(key, '.major','','.selected');   			
			return true;
		}						
		else if (key == 'ENTER' && $curr.hasClass('back-button')) { 
			this.destroy();
			return true; 
		}       
		else if (key == 'ENTER') {  // default link click             					
			return this.click($curr);				
			return true; 
		}       

    	return false;
    },
    
    // When "ENTER" is pressed on a link, or when link is clicked by mouse or touch screen
    click: function($jqobj) {
		msg('programdetail click')
    	var linkid = $jqobj.attr('id');
        var parentid = $jqobj.parent().attr('id');
        var type = $jqobj.attr('data-type');
        	
    	if($jqobj.hasClass('back-button')) { // back button		
    		this.destroy();
    		return true;
    	}
    	
    	if(linkid == 'remove') {   // remove bookmark
    	    var ticketId = '';
    	    if (this.data.tagName == 'Ticket' && this.data.tagAttribute) {
    	        ticketId = this.data.tagAttribute.ticketID;
				ticketPosition = this.data.tagAttribute.suspendPosition
            }
            else if (this.data.tagName == 'Asset' && this.data.tagAttribute) {
                ticketId = this.data.tagAttribute.ticketIDList;				
            }
            
            if(ticketId && ticketId != '') {
                cancelAsset(ticketId);
            }
            
            if(this.parent && this.parent.refresh)
                this.parent.refresh();
                
            this.destroy();
            return true;
    	}
    	else if(linkid == 'add') {  // add bookmark
    	    var entryId = '', poId = '';
    	    if (this.data.tagName == 'Asset' && this.data.tagAttribute) {
                entryId = this.data.tagAttribute.localEntryUID;
                poId = this.data.tagAttribute.productOfferingUID;
            }
            
            if(entryId && ticketId != '' && poId && poId != '') {
                purchaseAsset(poId,entryId);
            }
    	    
    	    if(this.parent && this.parent.refresh)
                this.parent.refresh(entryId);
                
    	    this.destroy();
            return true;
    	}
    	else if(linkid == 'play' || linkid == 'resume') { // play video
    	    var breadcrumb = this.$('.page-title').text();
    	    var page = new VideoPlayer({className:'', parent:this, breadcrumb:breadcrumb, data: this.data, bookmark: true});
            page.render();
            return true;
    	} 
		else if(linkid == 'restart') { // play video
    	    var breadcrumb = this.$('.page-title').text();
    	    var page = new VideoPlayer({className:'', parent:this, breadcrumb:breadcrumb, data: this.data, bookmark: true, restart: true});
            page.render();
            return true;
    	} 


    },
    
    renderData: function() {
		var context = this;
        var isBookmarked = false;
		
		this.$('.page-title').html(this.breadcrumb);        
		var c = $('<p class="text-large"></p>').html(this.label);
        this.$('#heading2').append(c);

        
        // fill in title and duration        
        if (this.data.tagName == 'Ticket' && this.data.ListOfSubEntry) {  // a ticket from MyPrograms
            isBookmarked = true;
            $.each(this.data.ListOfSubEntry, function(j, sub){
                if(sub.tagName == 'Asset' && sub.ListOfMetaData) {
                    var title = sub.ListOfMetaData.Title;
                    var duration = context._calcDuration(sub.tagAttribute.duration);
                    var description = sub.ListOfMetaData.LongDescription;
                    $('<p class="text-large title"></p>').text(title).appendTo(context.$('#heading1'));
                    $('<p class="text-med duration"></p>').text(duration).appendTo(context.$('#heading1'));
                    
                    context.label = title;
                    
                    return false;
                }
            });
        }
        else if (this.data.tagName == 'Asset') { // an asset from AllPrograms
            var sub = this.data;
            if(sub.tagAttribute && sub.tagAttribute.ticketIDList && sub.tagAttribute.ticketIDList != '') {
                isBookmarked = true;
            }
			ticketPosition = this.data.tagAttribute.suspendPosition;
            if(sub.ListOfMetaData) {
                var title = sub.ListOfMetaData.Title;
                var duration = context._calcDuration(sub.tagAttribute.duration);
                var description = sub.ListOfMetaData.LongDescription;
                $('<p class="text-large title"></p>').text(title).appendTo(context.$('#heading1'));
                $('<p class="text-med duration"></p>').text(duration).appendTo(context.$('#heading1'));
                
                context.label = title;
            }
        }
        
		//isBookmarked = true;
        // determine which buttons to show up
        if(isBookmarked) {
            this.$('.major a#play').hide();			
			this.$('.major a#resume').show();
			this.$('.major a#resume').addClass('selected');
			this.$('.major a#restart').show();
            this.$('.major a#add').hide();
			this.$('.major a#remove').show();
        }
        else {
            this.$('.major a#play').show();
			this.$('.major a#play').addClass('selected');
			this.$('.major a#resume').hide();
			this.$('.major a#restart').hide();
            this.$('.major a#add').show();
			this.$('.major a#remove').hide();
        }
    },
    
    refresh: function() {
        var context = this;
        
        var isBookmarked = this._checkBookmarks();
        
        if(isBookmarked) {
            this.$('.major a#play').hide();			
			this.$('.major a#resume').show();
			this.$('.major a#resume').addClass('selected');
			this.$('.major a#restart').removeClass('selected').show();
            this.$('.major a#add').hide();
			this.$('.major a#remove').show();
        }
        else {
            this.$('.major a#play').show();
			this.$('.major a#play').addClass('selected');
			this.$('.major a#resume').hide();
			this.$('.major a#restart').hide();
            this.$('.major a#add').show();
			this.$('.major a#remove').hide();
        }

        // update parent page to reflect possible changes
        if(this.parent && this.parent.refresh) {
            var entryId;
            if (this.data.tagName == 'Asset' && this.data.tagAttribute) {
                entryId = this.data.tagAttribute.localEntryUID;
            }
            this.parent.refresh(entryId);
        }

        return;
    },

    
    /**********************************************************************************
     * Own public functions; Outside can call these functions
     *********************************************************************************/
    
    /**********************************************************************************
     * Private functions; Starts with '_' only used internally in this class
     *********************************************************************************/
    
    _checkBookmarks: function () {
        var context = this;
        context.$('#selections').empty();
        entryId = this.data.tagAttribute.localEntryUID;
    msg(entryId);         
        var ewf = ewfObject();
        var poUid = ewf.healthcarePOUID;
        
        var tickets = getListTicket();
        
        if(!tickets || !tickets.DataArea || !$.isArray(tickets.DataArea.ListOfTicket))
            return;
		
		var bookmarks = tickets.DataArea.ListOfTicket;
        
        // build up the title list
        this.bookmarks = bookmarks;
        var isBookmarked = false;
        $.each(bookmarks, function(i, ticket){
            $.each(ticket.ListOfSubEntry, function(j, sub){
                if(sub.tagName == 'Asset') {
					if (sub.tagAttribute.localEntryUID == entryId){
                        isBookmarked = true;
                        if (context.data.tagName == 'Asset') {
                            // update asset object with ticket ID.  This object will be shared by multiple pages
                            context.data.tagAttribute.ticketIDList = ticket.tagAttribute.ticketID;
                        }
                        else if (context.data.tagName == 'Ticket') {
                            // update ticket
                            context.data = ticket;
                        }
                    }
                }
            });
        });
        return isBookmarked;
    },
            
    _calcDuration: function (duration) {
        if(!duration)
            return '00:00';
        var str = '';
        if(duration>=3600) {
            var h = Math.floor(duration/3600);
            str += h + ':';
            duration = duration%3600;
        }
        if(duration>=60) {
            var mm = Math.floor(duration/60);
            str += (mm<10?'0':'') + mm + ':';
            duration = duration%60;
        }
        var ss = duration;
        str += (ss<10?'0':'') + ss;
        return str;
    }
});    