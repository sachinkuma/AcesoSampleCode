var WebBrowser = View.extend({

    id: 'webbrowser',

    template: 'webbrowser.html',

    css: 'webbrowser.css',

    webpage: null,

    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/
    navigate: function (key) {
        return false;   // not support keyboard
    },

    click: function ($jqobj) {
        var context = this;
        var linkId = $jqobj.attr('id');
        switch (linkId) {
            case 'accept':
                this._saveTerms();
                this._openBrowser();
                break;
            case 'decline':
                this.destroy();
                break;
        }
        return false;
    },

    renderData: function () {
        var context = this;
        this.webpage = this.webpage || this._getAddress() || 'http://google.com';
        alert(this.webpage); 
    },

    shown: function () {
        if (window.settings.version == 'NEBULA') {
            if (window.settings.platformVersion < '1.3' && window.settings.platformVersion > '0.0.0.0') {
                // user browser not stable prior to 1.3
                this._notAvailable();
            }
        }

        //if (this._hasAcceptedTerms()) {
            this._openBrowser();
        //}
    },

    uninit: function () {
        this._closeBrowser();
    },
    /**********************************************************************************
     * Own public functions; Outside can call these functions
     *********************************************************************************/
    _openBrowser: function () {
        var context = this;
       
        this.$('#agreement').hide();
        this.$('#mask').show();

        if (window.settings.version == 'NEBULA') {
            if (window.settings.platformVersion < '1.3' && window.settings.platformVersion > '0.0.0.0') {
                return;
            }
            Nebula.openUserBrowser(this.webpage);
            $.doTimeout('user browser poll', 2000, function () {
                if (!Nebula.isUserBrowserOpen()) {
                    context.destroy();
                    return false;
                }
                return true;
            });
        }
            
            msg(this.webpage);
        if (window.settings.version == 'ENSEO') {
				this.BrowserWin = Nimbus.getBrowserWindow();
	    		this.BrowserWin.setFocus();
				this.BrowserWin.setRect(65, 1280, 1150, 720);
				this.BrowserWin.openURL(this.webpage);
				this.BrowserWin.setScrollBarEnable(true);
                nova.tracker.pageView('/internet', 'Internet');
                this.$('#mask').hide();
                return true;
        }
    },

    _closeBrowser: function () {
        if (window.settings.version == 'NEBULA') {
            if (window.settings.platformVersion < '1.3' && window.settings.platformVersion > '0.0.0.0') {
                return;
            }
            Nebula.closeUserBrowser();
            $.doTimeout('user browser poll');
        }
    },

    _notAvailable: function () {
        this.$('#mask #text').text("Sorry internet service is not available at this time");
        this.$('#mask #icon').hide();
        this.$('#agreement').hide();
        this.$('#mask').show();
    },

    _getAddress: function () {
        if (!this.data || !this.data.attributes || !this.data.attributes.attribute)
            return null;

        var attrlist = this.data.attributes.attribute;
        var addr = '';

        if ($.isArray(attrlist)) {
            $.each(this.data.attributes.attribute, function (i, attrib) {
                if (attrib['class'] == "address") {
                    addr = attrib['text'];
                    return false;
                }
            });
        }
        else {
            if (attrlist['class'] == "address")
                addr = attrlist['text'];
        }

        this.label = this.data.label;
        return addr;
    },

    _hasAcceptedTerms: function () {
        var url, xml, dataobj;
        this.mrn = getMRNDATA();
        url = window.portalConfig.getclinical + '?type=internet&mrn=' + this.mrn + '&numrec=1&sortorder=dsc';
        dataobj = '';
        xml = getXdXML(url, dataobj);

        var id, value;
        $(xml).find('item').each(function () {
            id = $(this).find('id').text();
            value = decodeURI($(this).find('value').text()).toLowerCase();
        });

        return (value == 'yes' || value == 'y' || value == 1);
    },

    _saveTerms: function () {
        var xmlValue = '';
        xmlValue += '<?xml version="1.0" encoding="ISO-8859-1" ?>';
        xmlValue += '<clinicaldata>';
        xmlValue += '<id></id>';
        xmlValue += '<ptname>' + window.settings.userFullName + '</ptname>';
        xmlValue += '<mrn>' + this.mrn + '</mrn>';
        xmlValue += '<room>' + window.settings.room + '</room>';
        xmlValue += '<bed>' + window.settings.bed + '</bed>';
        xmlValue += '<type>internet</type>';
        xmlValue += '<value>' + encodeURI('yes') + '</value>';
        xmlValue += '</clinicaldata>';

        var url = window.portalConfig.addclinical;
        postXdXML(url, {patronMenu: xmlValue});
    }
});



