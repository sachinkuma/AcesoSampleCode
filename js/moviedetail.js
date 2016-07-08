var MovieDetail = View.extend({

    id: 'moviedetail',

    template: 'moviedetail.html',

    css: 'moviedetail.css',

    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/

    navigate: function (key) {
	
			var $curr = this.$(".major a.selected");			
			if(key == 'MENU' || key == 'HOME' || key == 'LEFT') {
				this.destroy();
				return true; 			
			}
			else if(key == 'UP' || key == 'DOWN') {
				this.changeFocus(key, '.major','','.selected');   			
				return true;
			}			
			else if (key == 'ENTER') {  // default link click             									
				this.click($curr);
				return true;
			}

        return false;
    },

    // When "ENTER" is pressed on a link, or when link is clicked by mouse or touch screen
    click: function ($jqobj) {
        var linkid = $jqobj.attr('id');
        var parentid = $jqobj.parent().attr('id');
        var type = $jqobj.attr('data-type');

        if ($jqobj.hasClass('back-button')) { // back button
            this.destroy();
            return true;
        }

    	else if(linkid == 'play' || linkid == 'resume') { // play video
    	    var breadcrumb = this.$('.page-title').text();
    	    var page = new VideoPlayer({className:'', type: 'movie', parent:this, breadcrumb:breadcrumb, data: this.data, bookmark: true});
            page.render();
            return true;
    	} 
		else if(linkid == 'restart') { // play video
    	    var breadcrumb = this.$('.page-title').text();
    	    var page = new VideoPlayer({className:'', type: 'movie', parent:this, breadcrumb:breadcrumb, data: this.data, bookmark: true, restart: true});
            page.render();
            return true;
    	} 

    },

    
    renderData: function () {
        var context = this;
        var isBookmarked = false;

        // fill in title and duration
        this.$('.page-title').html(this.breadcrumb);        
		var c = $('<p class="text-large"></p>').html(this.label);
        this.$('#heading2').append(c);

        if (this.data.tagName == 'Asset') { // an asset from AllPrograms
            var sub = this.data;
            if (sub.tagAttribute && sub.tagAttribute.ticketIDList && sub.tagAttribute.ticketIDList != '') {
                isBookmarked = true;
            }
            if (sub.ListOfMetaData) {
                var title = sub.ListOfMetaData.Title;
                var year = sub.ListOfMetaData.YearOfRelease;
                var duration = context._calcDuration(sub.tagAttribute.duration);
                var rating = context._calcRating(sub.ListOfMetaData.Rating);
                var description = sub.ListOfMetaData.LongDescription;
                this.$('.minor p.title').text(title);
                this.$('.minor p.year').text(year);
                this.$('.minor p.length').text(duration);
                this.$('.minor p.rating').text(rating);
                this.$('.minor p.description').text(description);

                var poster = sub.ListOfMetaData.PosterBoard;
                poster = poster.split(',')[0];
                $('<img></img>').attr('src', poster).appendTo(this.$('#heading1'));
                context.label = title;
    }
}

        // determine which buttons to show up
        if (isBookmarked) {
            this.$('.major a#play').hide();			
			this.$('.major a#resume').show();
			this.$('.major a#resume').addClass('selected');
			this.$('.major a#restart').show();
        }
        else {
            this.$('.major a#play').show();
			this.$('.major a#play').addClass('selected');
			this.$('.major a#resume').hide();
			this.$('.major a#restart').hide();
        }
    },
    
    refresh: function() {
        var context = this;
        
        var isBookmarked = this._checkBookmarks();
        
        if (isBookmarked) {
            this.$('.major a#play').hide();			
			this.$('.major a#resume').show();
			this.$('.major a#resume').addClass('selected');
			this.$('.major a#restart').removeClass('selected').show();
        }
        else {
            this.$('.major a#play').show();
			this.$('.major a#play').addClass('selected');
			this.$('.major a#resume').hide();
			this.$('.major a#restart').hide();
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
					if (sub.tagAttribute.localEntryUID == entryId) {
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
        if (!duration)
            return '00:00';
        var str = '';
        if (duration >= 3600) {
            var h = Math.floor(duration / 3600);
            str += h + 'hr ';
            duration = duration % 3600;
        }
        if (duration >= 60) {
            var mm = Math.floor(duration / 60);
            str += (mm < 10 ? '0' : '') + mm + 'm';
            duration = duration % 60;
        }
        //var ss = duration;
        //str += (ss<10?'0':'') + ss;
        return str;
    },

    _calcRating: function (code) {
        var rating = 'NR';
        var ratingA = ['NR', 'G', 'PG', 'PG-13', 'R', 'NC-17', 'Adult', 'NR', 'NR', 'NR'];
        rating = ratingA[code - 1];
        return rating;
    }

});    