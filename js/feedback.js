var Feedback = View.extend({

    id: 'feedback',

    template: 'feedback.html',

    css: 'feedback.css',


    /**********************************************************************************
     * Overwrite functions; from base class
     *********************************************************************************/

    navigate: function (key) {
        var $curr = $("#feedback .major a.selected");
        var $currButton = $("#feedback .minor a.active");
        var type = $currButton.attr('type');
        this.key = key;
        var context = this;

        if (key == 'UP' || key == 'DOWN') {
            this.changeFocus(key, '.major', '', '.selected');
            this.currsel = this.$('.major a.selected');
            return true;
        }

        else if (key == 'LEFT' || key == 'RIGHT') {
            this.changeFocus(key, '.sub-text1', '.button');
            return true;
        }
        else if (key == 'ENTER' && $curr.hasClass('back-button')) {  // default link click
            this.destroy();
            return true;
        }

        else if (key == 'ENTER' && type != 'answer') {  // default link click
            this.changeFocus(key, '.sub-text1', '.button');
            return true;
        }


        return false;
    },

    // When "ENTER" is pressed on a link, or when link is clicked by mouse or touch screen
    click: function ($jqobj) {
        msg('in click feedback');
        var linkid = $jqobj.attr('id');
        var type = $jqobj.attr('type');
        this.linkid = linkid;

        if (type == 'answer') {
            this._renderResponse();
            return true;
        }

        if ($jqobj.hasClass('back')) { // back button
            if (this.closeall == true) {
                keypressed('CLOSEALL');
                keypressed(216);    //force going back to main menu
            }

            this.destroy();
            return true;
        }
        if ($jqobj.hasClass('menu-tab-button') && this.key != 'ENTER') {
            this._focusMajor($jqobj);
            this.currsel = this.$('.major a.selected');
            this.key = '';
            return true;
        }
        return false;
    },

    focus: function ($jqobj) {
        this._super($jqobj);
        var $curr = $("#feedback .major a.selected");

        if ($jqobj.hasClass('button')) {
            $jqobj.addClass('active');
            $curr.removeClass('selected');
        }

        else if (!$jqobj.hasClass('back-button')) {
            this._renderSubData($jqobj);
            this.$('.menu-tab').show();
        }

    },

    blur: function ($jqobj) {
        this._super($jqobj);

    },


    renderData: function () {
        var ewf = ewfObject();
        var langMap = ewf.languageMap2;
        var lang = langMap[window.settings.language];
        var context = this;

        this.$('.page-title').html(this.breadcrumb);
        this.label = this.data.label;
        var c = $('<p class="text-large"></p>').html(this.label);
        this.$('#heading2').append(c);

        var main_url = ewf.getsurvey + '?'; //"http://10.54.10.104:9080/survey/getSurveyXML?"

        // Get Patient Preferred Name
        url = main_url + "surveyId=" + ewf.surveyID + "&lang=" + lang;
        msg(url);
        var dataobj = '';

        //var url = './survey.xml';
        var xml = getXdXML(url);
        this.xmlsub = xml;

        var surveyname = ""
        var surveyid = ""
        //msg($(xml).survey);

        $(xml).find("survey").each(function (index) {
            surveyname = $(this).find("name").first().text();
            surveyid = $(this).find("id").first().text();
        });

        this.$('.major').append('<a class="back-button" href="#" title="back" data-translate="back">< Back</a>');
        var c = $('<p></p>').html(surveyname);
        this.$('#label').append(c);
        $(xml).find("question").each(function () {
            var question = $(this).find("title").text();
            var id = $(this).find("id:last").text();
            var text = $(this).find("text:last").text();
            var o = $('<a href="#"></a>').html(question).attr('id', 'm' + id).attr('title', question).addClass('menu-tab-button');
            context.$('.major').append(o);
        });

        this.surveyname = surveyname;
        this.surveyid = surveyid;
        msg('finished render');

    },

    shown: function () {

        var $firstObj = this.$('.major a:nth-child(2)');
        $firstObj.click();

    },

    /**********************************************************************************
     * Own public functions; Outside can call these functions
     *********************************************************************************/

    /**********************************************************************************
     * Privatfe functions; Starts with '_' only used internally in this class
     *********************************************************************************/

    _renderResponse: function () {

        var context = this;
        var $curr = $("#feedback .minor a.active");

        var currsel = this.currsel;
        var surveyid = this.surveyid;
        var surveyname = this.surveyname;
        var curranswerid = this.linkid;
        var currid = this.currid;
        msg('currsel ' + currsel);
        var xmlsub = this.xmlsub;
        var ewf = ewfObject();
        var room = window.settings.room;
        var bed = window.settings.bed;

        // Get Patient MRN
        var mrn = this.mrn;
        if (!mrn)
            mrn = getMRNDATA();


        $(xmlsub).find("question").each(function () {
            var questionid = $(this).find("id:last").text();
            var quesid = 'm' + questionid;
            var questiontext = $(this).find("text:last").text();
            var questiontitle = $(this).find("title:last").text();
            if (quesid == currid) {
                var question = $(this);
                var o = "";
                $(question).find("answer").each(function () {
                    var answer = $(this);
                    var answerid = $(answer).find("id:first").text();
                    var ansid = 'm' + answerid;
                    var answertext = $(answer).find("text:last").text();
                    var answervalue = $(answer).find("value").text();

                    if (curranswerid == ansid) {
                        msg('ans ' + ansid);
                        var answer = $(this);
                        $(answer).find("response").each(function () {

                            var response = $(this);

                            var responseid = $(response).find("id:first").text();
                            var responsetext = $(response).find("text:first").text();
                            context.$(".minor .sub-content").html('<p class="sub-text1 active">' + responsetext + '</p>');
                            msg(responsetext);
                            //* Handle response
                            var main_url = ewf.savesurvey; // "http://10.54.10.104:9980/Surveys"

                            var dataobj = "";
                            var resultnotifid = "";
                            var resultstatus = "";
                            $(response).find("notifications").each(function () {
                                dataobj = {};
                                dataobj['mrn'] = mrn;
                                var uri = $(this).find("uri").text();
                                dataobj['uri'] = uri;
                                dataobj['room'] = room;
                                dataobj['bed'] = bed;
                                dataobj['param'] = $(this).find("param").text();
                                dataobj['subject'] = $(this).find("subject").text();
                                var body = $(this).find("body").text();
                                body = body.replace('%answer%', answertext);
                                dataobj['body'] = body;
                                dataobj['payload'] = $(this).find("payload").text()
                                dataobj['surveyid'] = surveyid;

                                var subject = $(this).find("subject").text();
                                //msg(subject);
                                //msg(subject.indexOf("%servicegroup%") );
                                msg('subject ' + subject);
                                var xml = getXdXML(main_url, dataobj);

                                resultnotifid = resultnotifid + $(this).find("id").text() + ";";
                                resultstatus = resultstatus + $(this).find("type").text() + " - " + uri + " - " + body + ";";

                            });

                            //*Save Results
                            var result_url = ewf.surveyresults;//"http://10.54.10.104:9985/Results"
                            msg(result_url);
                            var resultdataobj = "";
                            resultdataobj = {};
                            resultdataobj['mrn'] = mrn;
                            resultdataobj['roombed'] = room + "_" + bed;
                            resultdataobj['surveyid'] = surveyid;
                            resultdataobj['surveyname'] = surveyname;
                            resultdataobj['questionid'] = questionid;
                            resultdataobj['questiontext'] = questiontext;
                            resultdataobj['answerid'] = answerid;
                            resultdataobj['answertext'] = answertext;
                            resultdataobj['answervalue'] = answervalue;
                            resultdataobj['responseid'] = responseid;
                            resultdataobj['responsetext'] = responsetext;
                            resultdataobj['resultnotifid'] = resultnotifid;
                            resultdataobj['resultstatus'] = resultstatus;
                            var d = new Date();
                            var format = 'yyyy-mm-dd HH:MM:ss';
                            d = d.format(format, false);
                            resultdataobj['datestamp'] = d;
                            msg(d);

                            nova.tracker.event('feedback', questiontitle, answertext);
                            var xml = getXdXML(result_url, resultdataobj);
                            msg(currsel);
                            currsel.addClass('selected');
                            return true;
                        });

                    }
                });

            }
        });
        return true;

    },


    _renderSubData: function (subdata, dataidx) {

        var currsel = this.$('a.selected');
        this.currid = currsel.attr("id");

        var currid = currsel.attr("id");
        var xmlsub = this.xmlsub;
        var context = this;

        $(xmlsub).find("question").each(function () {

            var question = this;
            var ques_id = 'm' + $(question).find("id:last").text();
            var ques_text = $(question).find("text:last").text();
            msg(ques_id + ' ' + currid);
            if (ques_id == currid) {
                context.$(".sub-content .sub-text1").html(ques_text + "<br/><br/>");

                var xmlsub2 = $(this);
                var o = "";
                $(xmlsub2).find("answer").each(function () {
                    var answer = this;
                    var id = $(answer).find("id:first").text();
                    var text = $(answer).find("text:last").text();
                    var o = $('<a href="#"></a>').html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + text + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;').attr('id', 'm' + id).attr('type', 'answer').addClass('button');
                    context.$('.sub-content .sub-text1').append(o);
                    context.$('..sub-content .sub-text1').append('&nbsp;&nbsp;&nbsp;');

                });
            }
        });

    },
});    
