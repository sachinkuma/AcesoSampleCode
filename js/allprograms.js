var AllPrograms = View.extend({

    id: 'allprograms',

    template: 'allprograms.html',

    css: 'allprograms.css',

    pageSize: 6,

    subPageSize: 6,

    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/


    navigate: function (key, e) {
        window.folderclicked = false;
        var navkeys = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'ENTER', 'CHUP', 'CHDN', 'PGUP', 'PGDN'];
        var keyIndex = navkeys.indexOf(key);
        if (keyIndex == -1)
            return false;

        var processed = false;
        var $focusedFolder = this.$('.selected');
        var $nextFolder = $();
        var $focusedAsset = this.$('.active');
        var $nextAsset = $();

        var assetSelected = ($focusedAsset.length >= 1);

        if (key == 'ENTER' && $focusedFolder.hasClass('back-button')) {
            this.destroy();
            return true;
        }
        else if (!assetSelected) {
            if (key == 'UP' || key == 'DOWN') {
                this.changeFocus(key, '.major', '', '.selected');
                processed = true;
            }
            else if (key == 'CHUP' || key == 'PGUP') {
                this.focusPrevPage('.major', 9, null, 'vertical', '', '.selected');
                processed = true;
            }
            else if (key == 'CHDN' || key == 'PGDN') {
                this.focusNextPage('.major', 9, null, 'vertical', '', '.selected');
                processed = true;
            }
            else if (key == 'RIGHT') {
                this.changeFocus(key, '.minor', '', '.active');
                processed = true;
            }
            else if (key == 'LEFT') {
                this.destroy();
                processed = true;
            }
            else if (key == 'ENTER' && $focusedFolder.hasClass('back-button')) {
                this.destroy();
                processed = true;
            }
            else if (key == 'ENTER') {
                this.changeFocus(key, '.minor', '', '.active');
                $focusedFolder.addClass('selected');
                window.folderclicked = true;
                processed = true;
            }
        }
        else {
            if (key == 'UP' || key == 'DOWN') {
                this.changeFocus(key, '.minor', '', '.active');
                $focusedFolder.addClass('selected');
                processed = true;
            }
            else if (key == 'CHUP' || key == 'PGUP') {
                this.focusPrevPage('.minor .sub-text1', 8, null, 'vertical', '', '.active');
                $focusedFolder.addClass('selected');
                processed = true;
            }
            else if (key == 'CHDN' || key == 'PGDN') {
                this.focusNextPage('.minor .sub-text1', 8, null, 'vertical', '', '.active');
                $focusedFolder.addClass('selected');
                processed = true;
            }
            else if (key == 'LEFT') {
                $focusedAsset.removeClass('active');
                processed = true;
            }
            else if (key == 'ENTER' || key == 'RIGHT') {
                return this.click($focusedAsset);
            }

        }
        return processed;
    },

    // When "ENTER" is pressed on a link, or when link is clicked by mouse or touch screen
    click: function ($jqobj) {
        var linkid = $jqobj.attr('id');
        var parentid = $jqobj.parent().attr('id');
        var type = $jqobj.attr('data-type');
        var itemData = this._getMenuItemData($jqobj);
        var $currFolder = $("#allprograms .major a.selected");
        var $currAsset = $("#allprograms .minor a.active");
        if (window.folderclicked) {
            window.folderclicked = false;
            return true;
        }
        if ($jqobj.hasClass('back-button')) { // back button
            this.destroy();
            return true;
        }

        // selecting a folder
        if ($jqobj.hasClass('folder') && itemData) {
            this.$('#.major a.selected').removeClass('selected');
            $jqobj.addClass('selected');
            this._buildAssets(itemData.tagAttribute.hierarchyUID);
            return true;
        }

        // selecting a video
        if ($jqobj.hasClass('asset') && itemData) {
            var breadcrumb = this.$('.page-title').text();
            var page = new ProgramDetail({className: '', parent: this, breadcrumb: breadcrumb, data: itemData});
            page.render();
            return true;
        }

        return false;
    },


    renderData: function () {
        this.$('.page-title').html(this.breadcrumb);
        this.label = this.data.label;
        var c = $('<p class="text-large"></p>').html(this.label);
        this.$('#heading2').append(c);

        this.label = this.data.label;
        this._buildCategories();

    },

    shown: function () {
        var $firstObj = this.$('.major a:nth-child(2)');
        $firstObj.click();
    },

    refresh: function (entryId) {
        //TODO: refresh status of only one entry without rebuilding the assets
        var $folder = this.$('.major a.selected');
        var itemData = this._getMenuItemData($folder);
        if (itemData && itemData.tagAttribute)
            this._buildAssets(itemData.tagAttribute.hierarchyUID);
    },

    /**********************************************************************************
     * Own public functions; Outside can call these functions
     *********************************************************************************/

    /**********************************************************************************
     * Private functions; Starts with '_' only used internally in this class
     *********************************************************************************/
    _buildCategories: function () {
        var context = this;
        context.$('.major').empty();

        var ewf = ewfObject();
        var folders = this.folders = getListEntry(ewf.allprograms).DataArea;

        if (folders && $.isArray(folders.ListOfEntry)) {
            this.$('.major').append('<a class="back-button" href="#" title="back" data-translate="back">< Back</a>');
            $.each(folders.ListOfEntry, function (i, entry) {
                if (entry.tagName == 'Folder') {
                    $('<a href="#" class="folder ellipsis"></a>').attr('data-index', i).attr('title', entry.tagAttribute.entryName).attr('id', 'menu' + i).addClass('menu-tab-button')
                        .text(entry.tagAttribute.entryName).appendTo(context.$('.major'));
                }
            });

            // pad some extra lines to fill the last page
            var padNum = this.pageSize - (folders.ListOfEntry.length % this.pageSize);
            if (padNum == 6) padNum = 0;
            for (var i = 0; i < padNum; i++) {
                $('<div class="padding"></div>').appendTo(context.$('.major'));
            }
        }

    },

    _buildAssets: function (huid) {
        var context = this;

        context.$('.sub-text1').empty();

        var entries = getListEntry(huid);
        if (!entries)
            return;

        var assets = this.assets = entries.DataArea;

        if (assets && $.isArray(assets.ListOfEntry)) {
            $.each(assets.ListOfEntry, function (i, entry) {
                if (entry.tagName == 'Asset') {
                    var isBookmarked = (entry.tagAttribute.ticketIDList && entry.tagAttribute.ticketIDList != '');
                    var $entry = $('<a href="#" class="asset text-med"></a>').attr('data-index', i).attr('title', entry.ListOfMetaData.Title).text(entry.ListOfMetaData.Title)
                    if (isBookmarked)
                        $entry.addClass('bookmarked');
                    $entry.appendTo(context.$('.sub-text1'));
                }
            });

            // pad some extra lines to fill the last page
            var padNum = this.pageSize - (assets.ListOfEntry.length % this.pageSize);
            if (padNum == 6) padNum = 0;
            for (var i = 0; i < padNum; i++) {
                $('<div class="padding"></div>').appendTo(context.$('.sub-text1'));
            }
        }

        this.$('.major').show();
        this.$('.minor #sub-text1').scrollTop(0);
    },

    _getMenuItemData: function ($obj) {
        var itemData = null;
        var itemIndex = $obj.attr('data-index');
        var entries = null;

        if ($obj.hasClass('folder'))
            entries = this.folders;
        else if ($obj.hasClass('asset'))
            entries = this.assets;

        if (itemIndex && entries && entries.ListOfEntry) {
            itemData = entries.ListOfEntry[itemIndex];
        }
        return itemData;
    }
});    