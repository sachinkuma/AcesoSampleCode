var Secondary = View.extend({

    id: 'secondary',
    
    template: 'secondary.html',
    
    css: 'secondary.css',
    
    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/
    navigate: function(key) {
			var $curr = $("#secondary .major a.selected");
			var $currButton = $("#secondary .minor a.active");
			this.key = key;						
			var context = this;
			if(key == 'POWR') {			
				this.destroy();
				return false;
			}			
			if(key == 'MENU' || key == 'HOME') {
				this.destroy();
				return true; 			
			}
			else if(key == 'UP' || key == 'DOWN') {
				this.changeFocus(key, '.major','','.selected');   
				return true;
			}
			else if($curr.attr('data-type') != 'pagelist' && key == 'LEFT') {
				this.destroy();
				return true; 			
			}
			else if(key == 'LEFT' || key == 'RIGHT') {
				this._switchPage(key);
				return true;
			}	
			else if (key == 'ENTER' && $curr.hasClass('back-button')) {  // default link click             					
				this.destroy();
				return true; 
			}

			else if (key == 'ENTER') {  // default link click             					
					this.key = 'ENTER';
					return this.click($curr);
			}
			return false;
    },
	
    // When "ENTER" is pressed on a link, or when link is clicked by mouse or touch screen
    click: function($jqobj) {
		msg('in click')
		var currLabel = this.data.label;
        var linkid = $jqobj.attr('id');	
        var type = $jqobj.attr('data-type');
        var dataenter = $jqobj.attr('data-enter');
        var videolink = $jqobj.attr('data-video');      
                
        //msg('datalink ' + datalink + ' dataenter ' + dataenter + ' type  ' +type + ' datapage ' + datapage + ' link ' + linkid);
        var itemData;       
        var menuId = this.$('.major').find('.selected').attr('id');
		//msg($jqobj);
        var path;

		 // track link clicks as a pageview
        if($jqobj.parent().attr('id')=='.major') { // is link on the left
            var path = this.pagePath + '/' + $jqobj.attr('id');
            var title = $jqobj.text();
            nova.tracker.pageView(path, title);
        }

		if($jqobj.hasClass('back-button')) { // back button            
			this.destroy();
            return true;
        }             
		
		if($jqobj.hasClass('menu-tab-button') && this.key != 'ENTER') {
            this._focusMajor($jqobj);
			this.key = '';
            return true;
        }
		
        var context = this;       
        if(dataenter) {
            $activemenu = this.$('.major .'+dataenter);            
            itemData = this._getMenuItemData($activemenu);            
            linkid = dataenter;            
        } else {			
            itemData = this._getMenuItemData($jqobj);
        }
		
        if(videolink) {            
            path = this.pagePath + '/' + menuId + '/' + linkid;
            var page = new VideoPlayer({className:'', parent:this, breadcrumb:currLabel, data: videolink, bookmark: false, type: 'information', allowTrickMode: false, pagePath: path});
            page.render();
            var $firstObj = this.$('#major a:first');
            this.focus($firstObj);
            return true;
        }
        
        if(dataenter && (itemData.type != 'link' && itemData.type != 'page-link')) {
            var page = new Secondary({viewId: 'secondary2', css: null, className:linkid, breadcrumb:currLabel, data: itemData});
            page.render();
            return true;
        }


        // menu item is a link
        if(itemData && (itemData.type == 'link' || itemData.type == 'page-link')) {

            var page;
            if($jqobj.parent().attr('id')=='.major')  {
                page = new WebSite({className:linkid, breadcrumb:currLabel, data: itemData});								
            }
            else { // link inside content needs to deep link path
                path = this.pagePath + '/' + menuId + '/' + linkid;
                page = new WebSite({className:linkid, breadcrumb:currLabel, data: itemData, pagePath: path});
            }
			this.key = '';
            page.render();			            
            return true;
        }
        
		
		// menu item is a link
        if(itemData && type == 'page-link' && this.key == 'ENTER') {

            var page;
            if($jqobj.parent().attr('id')=='.major')  {
                page = new WebSite({className:linkid, breadcrumb:currLabel, data: itemData});
            }
            else { // link inside content needs to deep link path
                path = this.pagePath + '/' + menuId + '/' + linkid;
                page = new WebSite({className:linkid, breadcrumb:currLabel, data: itemData, pagePath: path});
            }
            page.render();

            this.currsel =  this.$('.major a.active');
            this.currsel.removeClass('active');
            var $firstObj = this.$('.major a:first');
            this.focus($firstObj);
            return true;
        }
        
        // menu item is a shortcut
        if(itemData && itemData.type == 'shortcut') {
            this.destroy();
            if(itemData.attributes && itemData.attributes.attribute) {
                var attr = itemData.attributes.attribute[0] || itemData.attributes.attribute;
                var tagName = attr.text;
                var primary = window.pages.findPage('primary');
                if(primary && primary.open) {
                    primary.open.call(primary, tagName);
                }
            }
            return true;
        }
              
		if((type == 'pagelist' || type=='page') && this.key == 'ENTER') {
			return true;		
		}
			
        return false;
    },
    
    
		renderData: function() {
		
        var data = this.data;
        this.$('.page-title').html(this.breadcrumb);
        
        for(var key in data) {
            if (key=='tag') {   // tag
                this.query = 'tag=' + escape(data[key]);
            }
            else if(key=='label') { // label			
                var c = $('<p class="text-large"></p>').html(data[key]);
                this.$('#heading2').append(c);
                this.label = data[key];
            }
            
            else if(key=='attributes') { // attributes (title and label icon

                var attrlist = data.attributes.attribute;
                var len = attrlist.length;
                for(var i=0; i<len; i++) {
					//msg('text' + attr.text);
                    var 	attr = attrlist[i];
                    if (attr.class == 'banner1') {					
                        this.$('#heading2').html('<p class="headings2">' + attr.text + '</p>');              
                    } 
                    else if (attr.class == 'instructions') {
                        this.$('#heading1').html('<p class="i">' + attr.text + '</p>');             
                    } 
                    else if (attr.class == 'banner2') {
                        var c = $('<span></span>').html('<br/>' + attr.text);
                        this.$('#banner p').append(c);              
                    }
                    else if (attr.class == 'icon') {
                        this.$('img#labelicon').attr('src', './images/'+attr.image);
                    }           
                }
            }
            else if(key==data.tag) { // sub menu or children
                
                this.subdata = data[key];
                var sub = this.data[key];           
				msg(sub);
                var context = this;
                var style = '';
				this.$('.major').append('<a class="back-button" href="#" title="back" data-translate="back">< Back</a>');
                if(typeof data[key].label !='undefined') {                  
                    if(data[key].label == 'nobutton') {
                        style ='display:none';
                    } else {
                        style ='display:block';
                    }
					var o = $('<a href="#"></a>').attr('id','menu0').addClass('menu-tab-button').html(data[key].label).attr('title',data[key].tag).attr('data-type', data[key].type);
					
                    this.$('.major').append(o);					
					context._renderSubData(data[key],'0');							
					if(data[key].tag == 'mycareteam') {
						context._updateCareTeamData('0');	
					}

                } 
                else {
                    $.each(data[key], function(i, v) {
                        if(v.label == 'nobutton') {
                            style ='display:none';
                        } else {
                            style ='display:block';
                        }
							var o = $('<a href="#"></a>').attr('id','menu' + i).addClass('menu-tab-button').html(v.label).attr('title',v.tag).attr('data-type', v.type);                                                   					

                            context.$('.major').append(o);   
							context._renderSubData(v,i);
							if(v.tag == 'mycareteam') {
								context._updateCareTeamData(i);	
							}

                    });
                }
                				                
            }
        }        
    },
    
    shown: function() {
        var $firstObj = this.$('.major a:nth-child(2)');		
        $firstObj.click();		
    },
    
    /**********************************************************************************
     * Own public functions; Outside can call these functions
     *********************************************************************************/
    
    /**********************************************************************************
     * Private functions; Starts with '_' only used internally in this class
     *********************************************************************************/
    
     _renderSubData: function($jqobj,dataidx) {
	    if(dataidx>=0 && this.subdata[dataidx]) {
           var sub = this.subdata[dataidx];
        } else {
           var sub = this.subdata;
        }
        if(!sub)
           return;
           
        if(sub['type']=='page' || sub['type']=='menu' || sub['type']=='page-link' || sub['type']=='page-video') {
            this._renderPage(sub,dataidx);
        }
        else if(sub['type']=='pagelist') {
           this._renderPageList(sub,dataidx);
        }
		return true;
    },
    
    _renderPage: function(subdata,dataidx) {	
		var subcontent = '<div class="sub-content"><div class="sub-text1"></div><div class="sub-text2"></div><div class="sub-image1"></div><div class="sub-image2"></div></div>'
		var $menu = $('<div class="menu-tab" id="menu'+dataidx+'-tab"><div class="sub-header"></div><div class="sub-tabimg"></div>'+subcontent+'<div class="sub-footer"></div></div>').appendTo(this.$('.minor'));
										
		var sub = subdata;
		var subtag = sub['tag'];
		
		var lang = window.settings.language;
        if(sub && sub['attributes'] && sub.attributes.attribute) {
            var attrlist = sub.attributes.attribute;			
            var len = attrlist.length;    			
            if(typeof attrlist.class !='undefined') {
				this._renderAttr(attrlist, lang, subtag, '0', dataidx);
            } else
            for(var i=0; i<len; i++) {
                var attr = attrlist[i];
                this._renderAttr(attr, lang, subtag, i, dataidx);
            }
        }
		return true;
    },


    _renderPageList: function(subdata,dataidx) {
		var $menu = $('<div class="menu-tab" id="menu'+dataidx+'-tab"><div class="sub-header"></div><div class="sub-tabimg"></div><div class="sub-content layout5"></div><div class="sub-footer">Use Right/Left Arrow keys to scroll pages</div></div>').appendTo(this.$('.minor'));

		var sub = subdata;
		
        if(sub && sub['attributes'] && sub.attributes.attribute) {
            var attrlist = sub.attributes.attribute;
			
            var len = attrlist.length;
            var isPage1 = true;
            var pagebody = this.$('#menu'+dataidx+'-tab .sub-content').html('');
            
            var page = 0;
            for(var i=0; i<len; i++) {					
                var attr = attrlist[i];
				msg(attr);
                if(attr.class=='sub-text1') { // text in pagelist
                if(isPage1) {
                    isPage1 = false;
                    attrstr = ' class="submenu active"';
                }
                else {
                    attrstr=' class="submenu"'; 
                }
				var subpage = $('<div class="sub-page" id=sub-page'+page+'"><div class="sub-text1"><p>'+attr.text+'</p></div><div class="sub-image1"></div></div>');
				pagebody.append(subpage);							
				
                page ++;                            				
                }
                else if(attr.class=='sub-image1') {
					var subimage = $('<img src="./images/' +attr.image +'">');
					this.$('#menu'+dataidx+'-tab .sub-content .sub-image1').append(subimage);										
				}                
            }            
			
        }
        return;
    },


	_renderAttr: function(attr, lang, subtag, i, dataidx) {	
			//msg('renderattr ' + lang + subtag + i + dataidx);			
			//msg('attr.text' + attr.text);			
			switch(attr.class) {
					case 'body':
						this.$('#menu'+dataidx+'-tab .sub-content .sub-text1').html('<p>'+attr.text+'</p>');
						break;
					case 'sub-text1':
						msg(attr.text);
						this.$('#menu'+dataidx+'-tab .sub-content layout5 .sub-text1').html('<p>'+attr.text+'</p>');
						break;
					case 'sub-text2':                        
						this.$('#menu'+dataidx+'-tab .sub-content .sub-text2').html('<p>'+attr.text+'</p>');
						break;
					case 'sub-image1':
						this.$('#menu'+dataidx+'-tab .sub-content .sub-image1').html('<img src="./images/' +attr.image +'">');						
						break;
					case 'sub-image2':
						this.$('#menu'+dataidx+'-tab .sub-content .sub-image2').html('<img src="' +attr.image +'">');
						break;
					case 'sub-tabimg':
						this.$('#menu'+dataidx+'-tab .sub-tabimg').html('<img src="' +attr.image +'">');
						break;
					case 'sub-header':
						this.$('#menu'+dataidx+'-tab .sub-header').html(attr.text);
						break;
					case 'sub-footer':
						this.$('#menu'+dataidx+'-tab .sub-footer').html(attr.text);
						break;
					case 'assetid':
						this.$('#menu'+dataidx).attr('data-video',(attr.text));
					case 'layout1':					
					case 'layout2':
					case 'layout3':
					case 'layout4':
					case 'layout5':
					case 'layout6':
					case 'layout7':
					case 'layout8':
						this.$('#menu'+dataidx+'-tab .sub-content').addClass(attr.class);						
						break;
			}		
		return true;
	},
    
    _getMenuItemData: function ($obj) {
	
        var itemData = null;
        var itemTag = $obj.attr('title');
        var parentTag = $obj.parent().attr('id');
        msg(itemTag);
        var items = this.data[this.data.tag];
        if($.isArray(items)){ // an array of items
            
            $.each(items, function(i,item){
                if(item.tag == itemTag) {
                    itemData = item;
                    return false;   // break
                }
            });
            
        }
        else { // only one item
            if(items.tag == itemTag)
                itemData = items;
        }
        
        return itemData;
    },
	
	
	_updateCareTeamData: function (dataidx) {
        var ewf = ewfObject();
        // Get Patient MRN
        var mrn = this.mrn;
        if (!mrn)
            mrn = getMRNDATA();

        msg(mrn);
        this.mrn = mrn;

        var dataobj = {};
        dataobj['room'] = window.settings.room;
        dataobj['bed'] = window.settings.bed;
        dataobj['name'] = window.settings.userFullName;
        var preferredname = '';

        var main_url = ewf.getclinical + '?'; //"http://10.54.10.104:9080/ams/aceso/getClinicalData?"


        // Get Careteam Data
        url = main_url + "type=careteam&mrn=" + mrn + "&numrec=200&sortorder=asc"
        var dataobj = '';
        var enddate = '';
        var careteam = 'My Care Team:<br><br>';	
        cnt = 0;
        var xml = getXdXML(url, dataobj);
        $(xml).find("item").each(function () {
            if (cnt <= 10) {
                desc = ($(this).find("codedescription").text());
                value = ($(this).find("value").text());
                enddate = ($(this).find("enddate").text());
                if (enddate.length >= 1)
                    var edate = parseDateTime(enddate);
                var now = Date();
                var datecompare = 0;
                if (enddate.length >= 1)
                    datecompare = compareDates(edate, now);
				teammember = '';
				if (desc != '' && desc.length >= 1) {
                    teammember =  value + ", " + desc;
                } else {
                    teammember =  value;
                }
                if (datecompare >= 0) {
					if (cnt%2 == 1)
						careteam = careteam + teammember + '<br>'
					else 
						careteam = careteam + '<span class="text-color-5">' + teammember + '</span><br>'
                    cnt = cnt + 1;
                }
            }
        });
		
		this.$('#menu'+dataidx+'-tab .sub-content .sub-text1').html('<p>'+careteam+'</p>');
    },
	
});    
