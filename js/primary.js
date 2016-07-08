var Primary = View.extend({

    id: 'primary',

    template: 'primary.html',

    css: null, // we preload css for primary to eliminate the paint effect

    className: 'home',

    pagePath: '/home',

    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/
    navigate: function (key, e) {

        // home page will ignore these keys so it doesn't close itself
        
        if(key == 'POWR') {
            return false;
        }
        
        var ignoredKeys = ['MENU', 'HOME', 'EXIT', 'BACK', 'POWR', 'CLOSE', 'CLOSEALL'];
        if(ignoredKeys.indexOf(key) >= 0) {
            return true;
        }

        //* uncomment if we want to allow chup and down on primary page
        //if(key == 'CHUP' || key == 'CHDN') {
        //    this.$('a[data-type="grid"]').first().click();
        //    return true;
        //}

        // fallback to super because it handles drop-down menu
        return this._super(key, e);
    },

    click: function ($jqobj) {
		msg('in click');
        var ret = false;
        var context = this;
        var patientDATA = loadJSON('patient');
        var room = patientDATA.roomNumber;

        var linkid = $jqobj.attr('id');
        // stupid legacy code
        $("#K_submenu").removeClass().addClass(linkid);
        $("#K_submenu").text(linkid);		
		
		if($jqobj.hasClass('menu-group-button')) {
                this._focusMajor($jqobj);
                return true;
        }

		if ($jqobj.parent().parent().attr('class') == 'minor') { // menu items
            var parent = $jqobj.parent().attr('title');
            var pagePath = this.pagePath + '/' + $jqobj.parent().attr('name') + '/' + linkid;
            var type = $jqobj.attr('data-type');
            var itemData = this._getMenuItemData($jqobj);
			var processed = false;
            msg(itemData);

			msg('primary.js - click ' + linkid);

            switch (linkid) {
                case 'movies':    // movie
                    this.openMovies(linkid, parent, itemData, pagePath);
                    return true;
                case 'myeducation':
                    this.openMyPrograms(linkid, parent, itemData, pagePath);
                    return true;
                case 'feedback':
                    this.openFeedback(linkid, parent, itemData, pagePath);
                    return true;                   
                case 'allprograms':
                    this.openAllPrograms(linkid, parent, itemData, pagePath);
                    return true;
				case 'languages':
                    this.openLanguages(linkid, parent, itemData, pagePath);
                    return true;
				case 'welcomevideo':
                case 'scenictv':
                    this.openVideoPlayer2(linkid, parent, itemData, pagePath);
                    return true;
            }
			
			switch (type) {
                case 'link':    // website
                    this.openWebpage(linkid, parent, itemData, pagePath);
                    break;
                case 'menu':    // next level menu
                    this.openSecondary(linkid, parent, itemData, pagePath);
                    break;
                case 'grid':    // guide
                    this.openGuide(linkid, parent, itemData, pagePath);
                    break;
            }

            ret = true;
        }		
        else if ($jqobj.parent().parent().attr('id') == 'menubar' || $jqobj.parent().parent().attr('id') == 'menu') { // menu bar drop down click
            ret = true;
        }

        return ret;
    },

    renderData: function () {
        this.label = "Home";
        this._buildPage();
        this._buildMenu();


        this.$el.show();

        var context = this;

        // start clock
        $.doTimeout('primary clock', 60000, function () {
            var d = new Date();
            var format = 'h:MM TT dddd, mmmm d, yyyy';
            var locale = window.settings.language;
            context.$('p.datetime').text(d.format(format, false, locale));
            return true;
        });
        $.doTimeout('primary clock', true); // do it now

		
		// start slideshow
        this.$('#slideshow img:gt(0)').hide();
        $.doTimeout('primary slideshow', 5000, function () {
            context.$('#slideshow :first-child').fadeOut(1200)
                .next('img').fadeIn(1200)
                .end().appendTo(context.$('#slideshow'));
            return true;
        });
        
        this.$('#revision').html('UpCare ' + window.package.version + '<br>' + window.settings.version.replace('PROCENTRIC', 'LG') + ' ' + window.settings.platformVersion);
    },

    uninit: function () {
        $.doTimeout('primary clock'); // stop clock
        $.doTimeout('primary slideshow'); // stop slideshow
    },

    refresh: function () {
        this._buildPage();
        this._buildMenu();
        $.doTimeout('primary clock', true);
    },

    /**********************************************************************************
     * Own public functions; Outside can call these functions
     *********************************************************************************/
    
    open: function (tagName) {
        var $obj = this.$('#menus a#' + tagName);
        if ($obj.length == 1) {
            this.click($obj);
        }
    },

    openSecondary: function (linkid, breadcrumb, data, pagePath) {
        var context = this;
        var page = new Secondary({
            className: linkid, breadcrumb: breadcrumb, data: data, pagePath: pagePath,
            oncreate: function () {                
            },
            ondestroy: function () {                
            }
        });
        page.render();
    },

   
   
    openGuide: function (linkid, breadcrumb, data, pagePath) {
        var context = this;
        var page = new TVGuide({
            className: linkid, breadcrumb: breadcrumb, data: data, pagePath: pagePath,
            oncreate: function () {
            },
            ondestroy: function () {
            }
        });
        page.render();
    },

    openMovies: function (linkid, breadcrumb, data, pagePath) {
        var context = this;
        var page = new Movies({
            className: linkid, breadcrumb: breadcrumb, data: data, pagePath: pagePath,
            oncreate: function () {                
            },
            ondestroy: function () {
            }
        });
        page.render();
    },

    openMyPrograms: function (linkid, breadcrumb, data, pagePath) {
        var context = this;
        var page = new MyPrograms({
            className: linkid, breadcrumb: breadcrumb, data: data, pagePath: pagePath,
            oncreate: function () {
            },
            ondestroy: function () {
            }
        });
        page.render();
    },

    openAllPrograms: function (linkid, breadcrumb, data, pagePath) {
        var context = this;
        var page = new AllPrograms({
            className: linkid, breadcrumb: breadcrumb, data: data, pagePath: pagePath,
            oncreate: function () {
            },
            ondestroy: function () {
            }
        });
        page.render();
    },

    openFeedback: function (linkid, breadcrumb, data, pagePath) {
        var context = this;
        var page = new Feedback({
            className: linkid, breadcrumb: breadcrumb, data: data, pagePath: pagePath,
            oncreate: function () {
            },
            ondestroy: function () {
            }
        });
        page.render();
    },
    
    openComingSoon: function (linkid, breadcrumb, data, pagePath) {
        var context = this;
        var page = new Dialog({
            className: linkid, breadcrumb: breadcrumb, data: data, message: 'Coming Soon...', pagePath: pagePath,
            oncreate: function () {
            },
            ondestroy: function () {
            }
        });
        page.render();
    },

    openVideoPlayer2: function (linkid, breadcrumb, data, pagePath) {
        var context = this;
        var type, url, display;
        if (data && data.attributes && data.attributes.attribute && data.attributes.attribute.text) {
            var params = data.attributes.attribute.text.split(',');
            type = params[0];
            url = params[1];
            display = params[2] || '';

            var page = new VideoPlayer2({
                className: linkid,
                breadcrumb: breadcrumb,
                data: data,
                type: type,
                url: url,
                display: display,
                pagePath: pagePath,
                oncreate: function () {
                },
                ondestroy: function () {
                }
            });
            page.render();
        }
    },

    openLanguages: function (linkid, breadcrumb, data, pagePath) {
        var context = this;
		var oldLang = window.settings.language;
        var page = new Languages({
            className: linkid, breadcrumb: breadcrumb, data: data, pagePath: pagePath,
            oncreate: function () {
            },
            ondestroy: function () {
                var newLang = window.settings.language;
                // when closed, determine if we need to translate primary page.
                if (newLang != oldLang) {          
                    context.translate(newLang);
                    context.refresh();
                }
            }
        });
        
        page.render();
    },


    /**********************************************************************************
     * Private functions; Starts with '_' only used internally in this class
     *********************************************************************************/

    _buildPage: function () {

        var patientDATA = loadJSON('patient');
        var patientstatus = patientDATA.status;
        var patientname = patientDATA.userFullName;
        var firstnames = ""; // <- forgot to initialize to an empty string
		var preferredname = this._updatePreferredName();
		if(preferredname)
			patientname = preferredname;
        /*if (typeof patientname != 'undefined') {
            var splitName = patientname.split(" ");
            var surname = splitName[splitName.length - 1]; //The last one
            for (var i = 0; i < splitName.length - 1; i++) {
                firstnames += splitName[i] + " ";
            }
        }*/
        var room = patientDATA.roomNumber.toUpperCase();
		msg(room);
        this.$('#header #patient p.welcome span#name').text(patientname);
        this.$('#header #patient p.location span#room').text(room);
		msg(patientDATA.phoneNumber);
        this.$('#header #patient p.phone').text("Phone: "+patientDATA.phoneNumber);
    },

    _buildMenu: function() {
        this.$('#navigation #menubar').empty();
        this.$('#navigation #menus').empty();
        var ewf = ewfObject();

        getMenuXML();
        if($("#XMLCALL_error").text().indexOf("ERROR") >= 0){
            msg('### Unable to get MENU data!!');
            this.$('#navigation #menubar').text('Oops! Unable to get MENU data!!');
            return;
        }
        

        this.data = getJsonMenuFromXML().response.menuBar;
        var menuObj = this.data.menu;
        

        var $menu = $('<div id="menu"></div>');
        var $menutabs = $('<div id="major lazy"></div>');
        var $menus = $('<div id="minor"></div>');
        var cnt = 0;

        var context = this;
		var style = '';
		var hrefclass = '';		
		
        $.each(menuObj, function(i,row){
			cnt = cnt + 1;
            //set the menu that will be active at startup this is special for Sunnyside
			if (cnt==ewf.activemajormenu) {
				style = "display:block";
				hrefclass = "menu-group-button selected";				
			} else {
				style = "";
				hrefclass = "menu-group-button";
			}			
			
            $('<a href="#"></a>').attr('class', hrefclass).attr('id', 'menu'+cnt).attr('name', row['tag']).text(row['label']).appendTo($menu);
            $('<div class="major lazy"></div>').attr('id', row['tag']).text(row['label']).appendTo($menutabs);
            var $submenu = context._buildSubMenu(row, row["tag"],cnt);
				
            var o = $('<div class="menu-group"></div>').attr('id','menu'+cnt+'-group').attr('name',row['tag']).attr('title', row['label']).attr('audio',row['image']||'').attr('data-index',i).attr('style',style).append($submenu.html()).appendTo($menus);																			
        });		

        this.$('#content #menu .major.lazy').html($menu.html());
        this.$('#content #menu .minor').html($menus.html());	
    },
    

    _buildSubMenu: function (menu, tagName, menucnt)   {
		var cnt = 1;
        var $submenu = $('<div"></div>');
        var items = menu[tagName];
		var hrefclass = '';
		var ewf = ewfObject();
			
        if(items.label) { // single object
            var item = items;
            $('<a href="#"></a>').attr('name', item.tag).attr('class', 'active').attr('id', item.tag).attr('audio', item.image||'').attr('title', item.label).attr('data-type', item.type).attr('data-index',-1).text(item.label).appendTo($submenu);
        } 

        else { // array			
            $.each(items, function(i,item){          				
				if(menucnt == ewf.activemajormenu && cnt == ewf.activeminormenu) 
					hrefclass = 'active'
				else 
					hrefclass = '';		
                $('<a href="#"></a>').attr('name', item.tag).attr('class', hrefclass).attr('id', item.tag).attr('audio', item.image||'').attr('title', item.label).attr('data-type', item.type).attr('data-index',i).text(item.label).appendTo($submenu);
				cnt = cnt + 1;
            });
        }
        

        return $submenu;
    },
    
    _getMenuItemData: function ($obj) {
        var itemData = null;
        var itemTag = $obj.attr('id');
        var parentTag = $obj.parent().attr('name');
        $.each(this.data.menu, function(i,menu){		
            if(menu.tag == parentTag) {
                var items = menu[menu.tag];				
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
                return false; // break
            }
        });

        return itemData;
    },
	
	_updatePreferredName: function (dataidx) {
        var ewf = ewfObject();
        // Get Patient MRN
        var mrn = window.settings.mrn;
        if (!mrn)
            mrn = getMRNDATA();
        
        this.mrn = mrn;

        var preferredname = '';

        var main_url = ewf.getclinical + '?'; //"http://10.54.10.104:9080/ams/aceso/getClinicalData?"

        // Get Patient Preferred Name
        url = main_url + "type=patient&mrn=" + mrn + "&numrec=1&sortorder=asc"
        var dataobj = '';
        var xml = getXdXML(url, dataobj);

        $(xml).find("item").each(function () {
            preferredname = ($(this).find("value").text());
        });
		return preferredname;
    }


});