(function () {
    var Tracker = Class.extend({

        provider: '',

        lastPage: '',

        init: function () {
            var config = ewfObject();

            this.provider = config.analyticsProvider.toLowerCase();
            var url = config.analyticsUrl;
            var siteId = config.analyticsSite;

            switch (this.provider) {
                case 'google':
                    // load GA lib
                    (function (i, s, o, g, r, a, m) {
                        i['GoogleAnalyticsObject'] = r;
                        i[r] = i[r] || function () {
                            (i[r].q = i[r].q || []).push(arguments)
                        }, i[r].l = 1 * new Date();
                        a = s.createElement(o),
                            m = s.getElementsByTagName(o)[0];
                        a.async = 1;
                        a.src = g;
                        m.parentNode.insertBefore(a, m)
                    })(window, document, 'script', '//www.google-analytics.com/analytics.js', '_ga');

                    _ga('create', siteId, {
                        'cookieDomain': 'none',
                        'storage': 'none',
                        'clientId': window.settings.homeID
                    });
                    _ga('set', 'hostname', window.location.host);
                    _ga('set', 'dimension1', window.settings.homeID);
                    break;

                case 'piwik':
                    // load piwik lib
                    window._paq = window._paq || [];
                    (function () {
                        var u = url;
                        _paq.push(["setTrackerUrl", u + "piwik.php"]);
                        _paq.push(["setSiteId", siteId]);
                        _paq.push(['setSessionCookieTimeout', 1800]);
                        _paq.push(['disableCookies']);
                        var d = document, g = d.createElement("script"), s = d.getElementsByTagName("script")[0];
                        g.type = "text/javascript";
                        g.defer = true;
                        g.async = true;
                        g.src = u + "piwik.js";
                        s.parentNode.insertBefore(g, s);
                    })();

                    break;
            }
        },

        pageView: function (url, title, options) {
            if (this.provider == 'google') {
                options = options || {};
                options['hitType'] = 'pageview';
                options['page'] = url;
                this.lastPage = url;
                if (title)
                    options['title'] = title;
                _ga('send', options);
            }
            else if (this.provider == 'piwik') {
                if (url)
                    _paq.push(['setCustomUrl', url]);
                if (title)
                    _paq.push(['setDocumentTitle', title]);
                _paq.push(['trackPageView']);
            }
        },

        customDimension: function (index, name, value, scope) {
            if (this.provider == 'google') {
                _ga('set', 'dimension' + index, value);
            }
            else if (this.provider == 'piwik') {
                _paq.push(['setCustomVariable', index, name, value, scope]);
            }
        },

        event: function (category, action, label, value, options) {
            if (this.provider == 'google') {
                options = options || {};
                options['hitType'] = 'event';
                if (typeof options.nonInteraction === 'undefined')
                    options['nonInteraction'] = false;
                if (typeof options.page === 'undefined' && this.lastPage)
                    options['page'] = this.lastPage;
                options['eventCategory'] = category;
                options['eventAction'] = action;
                if (label)
                    options['eventLabel'] = label;
                if (value)
                    options['eventValue'] = value;
                _ga('send', options);
                /*
                 var options = options || {};
                 action = action || 'undefined';
                 if (label)
                 options['title'] = label;
                 if (value)
                 action += '/' + value;
                 options['page'] = '/event/' + category + '/' + action;
                 _ga('send', 'pageview', options);
                 */
            }
            else if (this.provider == 'piwik') {
                if (action)
                    _paq.push(['setCustomUrl', '/event/' + category + '/' + action]);
                if (label)
                    _paq.push(['setDocumentTitle', label]);
                _paq.push(['trackPageView']);
            }
        },

        heartbeat: function () {
            this.event('heartbeat', 'heartbeat');
        }
    });

    window.nova = window.nova || {};
    window.nova.tracker = window.nova.tracker || new Tracker();
})();



