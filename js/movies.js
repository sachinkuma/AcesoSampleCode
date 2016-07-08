var Movies = View.extend({

    id: 'movies',
    
    template: 'movies.html',
    
    css: 'movies.css',
    
    pageSize: 6,
    
    subPageSize: 5,
    
    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/

    navigate: function(key) {
			var $currButton = this.$(".major a.selected");
			var $currPoster = this.$('.carouselPosters img.active')
						
			if(key == 'MENU' || key == 'HOME') {
				this.destroy();
				return true; 			
			}
			else if(key == 'UP' || key == 'DOWN') {
				this.changeFocus(key, '.major','','.selected');                   
				return true;
			}
			else if(key == 'LEFT' || key == 'RIGHT') {				
				this._switchPoster(key,'.minor .menu-tab','.img');
				return true;
			}			
			else if (key == 'ENTER' && $currButton.hasClass('back-button')) {  // default link click             					
					this.key = 'ENTER';
					this.click($currButton);
					return true;
			} 
			else if (key == 'ENTER') {  // default link click             									
				this.click($currPoster);
				return true;
			}

			return false;
    },
	 
    // When "ENTER" is pressed on a link, or when link is clicked by mouse or touch screen
    click: function($jqobj) {
        var linkid = $jqobj.attr('id');
        var parentid = $jqobj.parent().attr('id');
        var type = $jqobj.attr('data-type');
        var itemData = this._getMenuItemData($jqobj);
            
        if($jqobj.hasClass('back-button')) { // back button
            this.destroy();
            return true;
        }
        
        // folder page up/down
        if(linkid == 'next' || linkid == 'prev') {
            if (linkid=='next')
               this.scrollNext('.major', 'vertical');
            else
               this.scrollPrev('.major', 'vertical');
            this.$('.major a.selected').removeClass('selected');
            this.$('.major').hide();
            this.pagination('.major', '#prev', '#next', 'vertical');
            return true;
        }
        
        // asset page up/down
        if(linkid == 'subnext' || linkid == 'subprev') {
            if(linkid=='subnext')
                this.focusNextPage('#subselections', this.subPageSize, this.assets.ListOfEntry.length, 'horizontal');
            else
                this.focusPrevPage('#subselections', this.subPageSize, this.assets.ListOfEntry.length, 'horizontal');
            return true;
        }
        
        // selecting a folder
        if($jqobj.hasClass('folder') && itemData) {
            this.$('.major a.selected').removeClass('selected');
            $jqobj.addClass('selected');
            this._buildAssets(itemData.tagAttribute.hierarchyUID);
            var $poster = this.$('.carouselPosters img:first').removeClass('inactive');
            $poster.addClass('active');
			
			if(typeof $poster.attr('title')=='undefined') {
				this.$('.carouselTitle').html('<p>No Movies in this Category</p>');
				this.$('.sub-footer').hide();
			} else
				this.$('.carouselTitle').html('<p>'+$poster.attr('title')+'</p>');				            
            return true;
        }
        
        // selecting a video
        if($jqobj.hasClass('playbutton')) {
            var $asset = $jqobj.parent();
            itemData = this._getMenuItemData($asset);
            var breadcrumb = this.$('.page-title').text();
            var label = this.$('.major a.selected').text();
            var page = new MovieDetail({parent:this, breadcrumb:breadcrumb, label:label, data: itemData});
            page.render();
            return true;
        }
        
		// selecting a video
        if($jqobj.hasClass('poster')) {
            var $asset = $jqobj.parent();
            itemData = this._getMenuItemData($jqobj);
            var breadcrumb = this.$('.page-title').text();
            var label = this.$('.major a.selected').text();
            var page = new MovieDetail({parent:this, breadcrumb:breadcrumb, label:label, data: itemData});
            page.render();
            return true;
        }
        return false;
    },
    
    blur: function($jqobj) {
        if(!$jqobj.hasClass('pagebutton')) {
            this._super($jqobj);
        }
        this._updateTitle('');
    },
    
    renderData: function() {
        this.$('.page-title').html(this.breadcrumb);        
        this.label = this.data.label;
		var c = $('<p class="text-large"></p>').html(this.label);
        this.$('#heading2').append(c);

        var context = this;
        this.$el.delegate('span.playbutton', 'click', function(e){
            context.click($(this));
            e.preventDefaul();
        });
        
        this._buildCategories();
    },
    
    shown: function() {
	
		var $firstObj = this.$('.major a:nth-child(2)');		
        $firstObj.click();		
		
    },
    
    refresh: function() {
        var $folder = this.$('.major a.selected');
        $folder.click();        
        //var itemData = this._getMenuItemData($folder);
        //if(itemData && itemData.tagAttribute)
        //    this._buildAssets(itemData.tagAttribute.hierarchyUID);
    },
    
    uninit: function() {
        this.$el.undelegate('span.playbutton', 'click');
    },
    
    /**********************************************************************************
     * Own public functions; Outside can call these functions     *********************************************************************************/
    
    /**********************************************************************************
     * Private functions; Starts with '_' only used internally in this class
     *********************************************************************************/
    _buildCategories: function () {
        var context = this;
        context.$('.major').empty();
        
        var ewf = ewfObject();
        var folders = this.folders = getListEntry(ewf.movies).DataArea;
        var footer = $('<div class="sub-footer"><img class="leftarrow" src="./images/arrow_left-ltblue.png"><img class="rightarrow" src="./images/arrow_right-ltblue.png"></div>');
		
        if(folders && $.isArray(folders.ListOfEntry)) {
			this.$('.major').append('<a class="back-button" href="#" title="back" data-translate="back">< Back</a>');
            $.each(folders.ListOfEntry, function(i, entry){
                if(entry.tagName == 'Folder') {
                    $('<a href="#" class="folder ellipsis"></a>').attr('data-index', i).attr('title', entry.tagAttribute.entryName).attr('id','menu' + i).addClass('menu-tab-button')
                        .text(entry.tagAttribute.entryName).appendTo(context.$('.major'));					
                }
            });
            
            // pad some extra lines to fill the last page
            var padNum = this.pageSize - (folders.ListOfEntry.length % this.pageSize);
            if(padNum == 6) padNum = 0;
            for(var i=0; i<padNum; i++) {
                $('<div class="padding"></div>').appendTo(context.$('.major'));
            }
        }
return;        
    },
    
    _buildAssets: function (huid) {
        var context = this;
        context.$('.carouselPosters').empty();
        
        context.$('#subprev').hide();
        context.$('#subnext').hide();
        
        var assets = this.assets = getListEntry(huid).DataArea;
        //var $subfooter = $('<div class="sub-footer"><img class="leftarrow" src="./images/arrow_left-ltblue.png"><img class="rightarrow" src="./images/arrow_right-ltblue.png">	</div>');
        if(assets && $.isArray(assets.ListOfEntry)) {
            $.each(assets.ListOfEntry, function(i, entry){
                if(entry.tagName == 'Asset') {
                    var isBookmarked = (entry.tagAttribute.ticketIDList && entry.tagAttribute.ticketIDList != '');
					var poster = entry.ListOfMetaData.PosterBoard;
					if(typeof poster != 'undefined')
						poster = poster.split(',')[0];					
					
					var $entry = $('<img class="poster">').attr('data-index', i).addClass('inactive').attr('id', i).attr('title', entry.ListOfMetaData.Title).attr('src', poster);										
					if(typeof $entry !='undefined') 
						$entry.appendTo(context.$('.minor .carouselPosters'));
                }
            });
            //$subfooter.appendTo('.minor .carousel');	
            // pad some extra lines to fill the last page
            var padNum = this.subPageSize - (assets.ListOfEntry.length % this.subPageSize);
            if(padNum == 6) padNum = 0;
            for(var i=0; i<padNum; i++) {
                $('<div class="padding"></div>').appendTo(context.$('.minor #subselections'));
            }
        }
        
        this.$('.minor').show();
        this.$('.minor .carouselPosters').scrollTop(0);
    },
    
    _updateTitle: function(val) {
		msg(val);
        var title = '';
        if(!val)
            title = val;
        else if(val instanceof jQuery)
            title = val.attr('title');
            
        this.$('.carouselTitle').text(title);
    },
    
    _getMenuItemData: function ($obj) {
        var itemData = null;
        var itemIndex = $obj.attr('data-index');
        var entries = null;
        
        if($obj.hasClass('folder'))
            entries = this.folders;
        else if($obj.hasClass('poster'))
            entries = this.assets;
            
        if(itemIndex && entries && entries.ListOfEntry) {
            itemData = entries.ListOfEntry[itemIndex];
        }
        
        return itemData;
    }
});    