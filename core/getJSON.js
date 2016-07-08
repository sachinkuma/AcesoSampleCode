/********************************************************************************
 * @brief                                                                        *
 *        Common JSON call functions                                                *
 *                                                                                *
 * @author                                                                        *
 *        Bill Sears\n                                                            *
 *        Aceso\n                                                                    *
 *        http://www.aceso.com\n                                                    *
 *                                                                                *
 * @modified                                                                    *
 *        Tami Seago, 02/05/2013, add info and error handling                        *
 *                                                                                *
 *        Bernie Zhao, 03/06/2013, delay the movie loadings to when user picks    *
 *         a category.                                                          *
 ********************************************************************************/

// Global JSON object to cache the data received from server.  This is meant to replace old DOM JSON_xxx
window.JSONDATA = window.JSONDATA || {};

function getUserDataDATA() {

    var client = $("#K_client").text();
    var version = $("#K_version").text();
    var ewf = ewfObject();
    var mac = getDevice();

    var arg1 = 'attribute=json_libs_oss_get_user_data';
    var arg2 = 'device_id=' + mac;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2;
	msg(url + ' ' + args); 
    var userdata = ajaxJSON(url, args);

    var userdataString = JSON.stringify(userdata);

    var comma = '';
    var room = '';
    var level = '';
    var wing = '';
    var bed = '';

    var patientString = '{';
    var deviceString = '{';

    // logging. 1.0.13 beta to diagnose white screen issue.
    // After running for a couple hours, the IPC will stop doing handshaking and usually it's after a oss_get_user_data
    msg('...... user data ......');
    msg(userdataString);
    msg('.......................');

    if (!userdata || !userdata.DataArea || !userdata.DataArea[0]) {
        msg('ERROR!! Invalid user data!!');
        return null;
    }

    // new logic, put user data into runtime settings
    // if user data has error, the following block will generate exception and be catched in index.html
    window.settings = window.settings || {}; // runtime settings
    var home = userdata.DataArea[0];
    if (home.tagAttribute) {
        var attr = home.tagAttribute;
        window.settings.status = attr.status;
        window.settings.siteID = attr.siteID;
        window.settings.portalID = attr.portalID;
        window.settings.language = attr.language;
        window.settings.homeID = attr.homeID;
        var pos = attr.homeID.indexOf("_") < 0 ? attr.homeID.length : attr.homeID.indexOf("_");
        window.settings.room = attr.homeID.substr(3, pos - 3);
        window.settings.bed = attr.homeID.substr(pos + 1, 1);
        window.settings.phone = attr.phoneNumber;
    }
    if (home.ListOfSTBUser && home.ListOfSTBUser[0] && home.ListOfSTBUser[0].tagAttribute) {
        var attr = home.ListOfSTBUser[0].tagAttribute;
        window.settings.userName = attr.userName;
        window.settings.userFullName = attr.userFullName;

        // if room is checked-in but user changed, we probably didn't catch the admission, reload it
        if (window.settings.userID && window.settings.userID != attr.userID) {
            reloadapp();
            return;
        }

        window.settings.userID = attr.userID;
    }
    if (home.ListOfDevice && home.ListOfDevice[0] && home.ListOfDevice[0].tagAttribute) {
        var attr = home.ListOfDevice[0].tagAttribute;
        window.settings.tvNumber = attr.TVNumber;
        window.settings.inputNumber = attr.TVInputMode;
    }

    // old logic, put user data into DOM
    $.each(userdata, function (index, DataArea) {
        $.each(DataArea, function (index, Home) {
            $.each(Home.tagAttribute, function (tagName, tagAttribute) {
                if (tagName == 'portalID') $("#K_portal").text(tagAttribute);
                if (tagName == 'status' && tagAttribute == '0')
                    discharged();
                if (tagName == 'homeID') {
                    if (client == 'ACESO' || client == 'SMC') {
                        var pos = tagAttribute.indexOf("_");
                        room = tagAttribute.substr(3, pos - 3);
                        bed = tagAttribute.substr(pos + 1, 1);
                    } else if (client == 'SWEDISH') {
                        // -- swedish only --
                        room = tagAttribute.substr(3, 4);
                        level = tagAttribute.substr(3, 1);
                        bed = tagAttribute.substr(8, 1);
                        if (room >= '2104' && room <= '2108') {
                            wing = 'Cascade North';
                        }
                        if (room >= '2112' && room <= '2293') {
                            wing = 'Cascade South';
                        }
                        if (room >= '2301' && room <= '2422') {
                            wing = 'Olympic';
                        }
                        if (room >= '3103' && room <= '3211') {
                            wing = 'Cascade';
                        }
                        if (room >= '3301' && room <= '3422') {
                            wing = 'Olympic';
                        }
                        if (room >= '4101' && room <= '4223') {
                            wing = 'Cascade';
                        }
                        // -- swedish only --
                    }
                    patientString = patientString + comma + ' "roomWing":"' + wing + '"';
                    comma = ',';
                    patientString = patientString + comma + ' "roomLevel":"' + level + '"';
                    patientString = patientString + comma + ' "roomNumber":"' + room + '"';
                    patientString = patientString + comma + ' "roomBed":"' + bed + '"';
                }
                if (tagName == 'language') {
                    comma = ',';
                    patientString += comma + ' "language":"' + tagAttribute + '"';
                }
                patientString = patientString + comma + ' "' + tagName + '":"' + tagAttribute + '"';
                comma = ',';
            });

            if (typeof Home.ListOfSTBUser != 'undefined') {
                $.each(Home.ListOfSTBUser, function (index, STBUser) {
                    $.each(STBUser.tagAttribute, function (tagName, tagAttribute) {
                        patientString = patientString + comma + ' "' + tagName + '":"' + tagAttribute + '"';
                    });
                });
            }
            comma = '';
            if (typeof Home.ListOfDevice != 'undefined') {
                $.each(Home.ListOfDevice, function (index, Device) {
                    $.each(Device.tagAttribute, function (tagName, tagAttribute) {
                        deviceString = deviceString + comma + ' "' + tagName + '":"' + tagAttribute + '"';
                        comma = ',';
                    });
                });
            }
        });
    });

    patientString = patientString + ' }';
    $("#JSON_patient").text(patientString);
    deviceString = deviceString + ' }';
    $("#JSON_device").text(deviceString);

    var patientDATA = JSON.parse(patientString);

    return patientDATA;
}

function checkDischarge() {

    try {
        var oldStatus = window.settings.status;
        getUserDataDATA();
        var status = window.settings.status;
        if (oldStatus != status) {
            var action = (status == '1') ? 'admission' : 'discharge';
            nova.tracker.event('patient', action, window.settings.homeID, 0, {'sessionControl': 'end'});
            reloadapp();
        }
    }
    catch (e) {
        var err = 'error getting user data - ' + e.message;
        msg(err);
    }
    return 'active';
}

function getMRNDATA() {

    var ewf = ewfObject();
    var patient = loadJSON('patient');

    var arg1 = 'attribute=json_libs_oss_list_guest_data';
    var homeID = window.settings.homeID;
    var arg2 = 'home_id=' + homeID.toUpperCase();

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2;
    var mrnstatus = ajaxJSON(url, args);

    var mrnData = JSON.stringify(mrnstatus);
    var comma = '';
    var DataArea = mrnstatus.DataArea;
    var ListofBill = DataArea.ListOfBill;
    var attr = ListofBill[0].tagAttribute;

    var mrn = attr.accountNumber;

    window.settings.mrn = mrn;
    return mrn;

}

function getProductOfferingDATA() {

    var ewf = ewfObject();
    var patient = loadJSON('patient');

    var arg1 = 'attribute=json_libs_stb_list_entry';
    var arg2 = 'parent_HUID=' + ewf.VODRootHUID;
    var arg3 = 'depth=1';
    var arg4 = 'home_id=' + patient.homeID;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3 + '&' + arg4;

    var productoffering = ajaxJSON(url, args);

    var productofferingString = JSON.stringify(productoffering);

    productofferingString = '{ "ProductOffering": [  ';

    var comma = '';
    var comma2 = '';

    $.each(productoffering, function (index, DataArea) {
        $.each(DataArea.ListOfEntry, function (index, ProductOffering) {
            productofferingString = productofferingString + comma2 + ' {';
            comma2 = ',';
            comma = '';
            $.each(ProductOffering.tagAttribute, function (tagName, tagAttribute) {
                tagAttribute = cleanJSON(tagAttribute);
                if (tagName = 'Title')
                    productofferingString = productofferingString + comma + ' "' + tagName + '":"' + tagAttribute + '"';
                comma = ',';
            });
            productofferingString = productofferingString + ' }';
        });
    });

    productofferingString = productofferingString + ' ] } ';
    $("#JSON_productoffering").html(productofferingString);

    var productofferingDATA = JSON.parse(productofferingString);

    return productofferingDATA;

}


//
// My Programs
//
function getmyprogramsDATA() {

    var ewf = ewfObject();
    var patient = loadJSON('patient');

    var arg1 = 'attribute=json_libs_ote_list_ticket';
    var arg2 = 'product_type=0';
    var arg3 = 'home_id=' + patient.homeID;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3;

    var bookmarks = ajaxJSON(url, args);
    var bookmarksString = JSON.stringify(bookmarks);

    var tags = Array();
    tags['ticketID'] = 'ticketID';
    tags['homeID'] = 'homeID';
    tags['deviceID'] = 'deviceID';
    tags['assetID'] = 'assetID';
    tags['localEntryUID'] = 'tag';
    tags['productOfferingID'] = 'poUID';
    tags['Title'] = 'title';
    //tags['TitleBrief'] 			= 'label';
    tags['Title'] = 'label';
    tags['YearOfRelease'] = 'year';
    tags['Length'] = 'duration';		// not available
    tags['Rating'] = 'rating';
    tags['Description'] = 'description';
    tags['LongDescription'] = 'synopsis';
    tags['PosterBoard'] = 'poster';
    tags['suspendPosition'] = 'position';

    // build myprograms
    myprogramsString = '{ ';
    myprogramsString = myprogramsString + '"type":"menu", ';
    myprogramsString = myprogramsString + '"background":"myprograms", ';
    myprogramsString = myprogramsString + '"comments":"", ';
    myprogramsString = myprogramsString + '"myprograms": [  ';

    var count = 0;
    var comma = '';
    var comma2 = '';
    var titlelength = 0;
    var descrlen = 0;
    var descrpos = 0;
    var descrval = '';

    $.each(bookmarks, function (index, DataArea) {
        $.each(DataArea, function (index, ListOfTicket) {
            $.each(ListOfTicket, function (index1, Ticket) {
                count++;
                myprogramsString = myprogramsString + comma2 + ' { ';
                comma2 = ',';
                comma = '';
                $.each(Ticket.tagAttribute, function (tagName, tagAttribute) {
                    if (tagName == 'ticketID' || tagName == 'homeID' || tagName == 'deviceID' || tagName == 'assetID' || tagName == 'localEntryUID' || tagName == 'suspendPosition') {
                        tagAttribute = cleanJSON(tagAttribute);
                        myprogramsString = myprogramsString + comma + ' "' + tags[tagName] + '":"' + tagAttribute + '"';
                        comma = ',';
                    }
                    ;
                });
                $.each(ListOfTicket[index1].ListOfSubEntry, function (index2, SubEntry) {
                    $.each(SubEntry.tagAttribute, function (tagName, tagAttribute) {
                        if (tagName == 'productOfferingID' || tagName == 'suspendPosition') {
                            tagAttribute = cleanJSON(tagAttribute);
                            myprogramsString = myprogramsString + comma + ' "' + tags[tagName] + '":"' + tagAttribute + '"';
                            myprogramsString = myprogramsString + comma + ' "image":""';
                            myprogramsString = myprogramsString + ' }';
                        }
                        ;
                    });
                    if (ListOfTicket[index1].ListOfSubEntry[index2].ListOfMetaData) {
                        $.each(ListOfTicket[index1].ListOfSubEntry[index2].ListOfMetaData, function (tagName, tagAttribute) {
                            if (tagName == 'Title' || tagName == 'TitleBrief' || tagName == 'YearOfRelease' || tagName == 'Rating' || tagName == 'Description' || tagName == 'LongDescription' || tagName == 'PosterBoard' || tagName == 'suspendPosition') {
                                tagAttribute = cleanJSON(tagAttribute);
                                myprogramsString = myprogramsString + comma + ' "' + tags[tagName] + '":"' + tagAttribute + '"';
                            }
                            ;
                        });
                    }
                });
            });
        });
    });

    if (count == 0)
        myprogramsString = myprogramsString + comma2 + '{ "tag":"notfound", "label":"no bookmarked videos", "image":"", "duration":"10" } ';
    myprogramsString = myprogramsString + ' ] }';
    $("#JSON_bookmarks").html(myprogramsString);		// contains all bookmarks...healthcare and movies

    //
    // filter out the movies
    //

    var myprogramsObject = JSON.parse(myprogramsString);

    comma = '';
    var atleastone = 'N';
//	var assetID	   = '';
//	var asset	   = '';
//	var duration   = '';
    var position = '';

    var filteredString = '{ "type":"menu", "background":"myprograms", "comments":"", "myprograms": [';
    $.each(myprogramsObject['myprograms'], function (i, row) {
        if (row["poUID"] == '3') {
//			assetID = row["tag"];
//			asset = getAsset(assetID);
//			duration = ', "duration":"'+asset['duration']+'"';	
            position = '';
            if (row["position"]) {
                position = ', "position":"' + row["position"] + '"';
            }
            filteredString = filteredString + comma + ' { "ticketID":"' + row["ticketID"] + '", "homeID":"' + row["homeID"] + '", "deviceID":"' + row["deviceID"] + '", "assetID":"' + row["assetID"] + '", "tag":"' + row["tag"] + '", "label":"' + row["label"] + '", "year":"' + row["year"] + '", "rating":"' + row["rating"] + '", "synopsis":"' + row["synopsis"] + '", "description":"' + row["description"] + '", "poUID":"' + row["poUID"] + '", "image":"' + row["image"] + '"' + position + '}';
            comma = ',';
            atleastone = 'Y';
        }
    });
    if (atleastone == 'N') {
        filteredString = filteredString + comma + ' { "ticketID":"", "homeID":"", "deviceID":"", "assetID":"", "tag":"EMPTY1", "label":"no bookmarks", "year":"", "rating":"", "synopsis":"", "poUID":"", "image":"" }';
    }
    filteredString = filteredString + ' ] }';

    $("#JSON_myprograms").html(filteredString);		// contains just healthcare bookmarks
    //
    // build individual programs
    //
    var myprogramsObject = JSON.parse(filteredString);

    var videoString = '';
    var checkexists = '';
    comma = '';

    $.each(myprogramsObject['myprograms'], function (i, row) {
        videoString = ' { ';
        videoString = videoString + '"type":"video", "source":"", "tag":"' + row["tag"] + '", "title":"' + row["label"] + '", "poUID":"' + row["poUID"] + '" ';
        videoString = videoString + ' }';

        checkexists = $("#BOOKMARK_" + row["tag"]).text();
        if (!checkexists)
            $("#json").append('<div id="BOOKMARK_' + row["tag"] + '"></div>');
        $("#BOOKMARK_" + row["tag"]).html(videoString);
        comma = ',';
    });
    //msg(videoString);
    return 'success';
}

function myprogramsCategories() {

    var myprogramsString = $("#JSON_myprograms").text();
    var myprograms = JSON.parse(myprogramsString);

    return myprograms;
}

function myprogramsSELECTION(choice) {

    var selectionString = $("#BOOKMARK_" + choice).text();
    var selection = JSON.parse(selectionString);
    return selection;
}

//
// allprograms BEGIN
//
function getAllProgramsDATA() {

    var ewf = ewfObject();
    var patient = loadJSON('patient');

    var arg1 = 'attribute=json_libs_stb_list_entry';
    var arg2 = 'parent_HUID=' + ewf.allprograms;
    var arg3 = 'depth=1';
    var arg4 = 'home_id=' + patient.homeID;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3 + '&' + arg4;
    var allprograms = ajaxJSON(url, args);

    var allprogramsString = JSON.stringify(allprograms);

    var tags = Array();
    tags['localEntryUID'] = 'tag';
    tags['entryName'] = 'label';
    tags['productOfferingUID'] = 'poUID';

    // build allprograms group

    allprogramsString = '{ ';
    allprogramsString = allprogramsString + ' "type":"menu", ';
    allprogramsString = allprogramsString + ' "background":"allprograms", ';
    allprogramsString = allprogramsString + ' "comments":"", ';
    allprogramsString = allprogramsString + '"allprograms": [  ';

    var comma = '';
    var comma2 = '';
    var atleastone = 'N';

    $.each(allprograms, function (index, DataArea) {
        if (DataArea.ListOfEntry) {
            $.each(DataArea.ListOfEntry, function (index, Folder) {
                allprogramsString = allprogramsString + comma2 + ' {';
                comma2 = ',';
                comma = '';
                if (Folder.tagAttribute) {
                    $.each(Folder.tagAttribute, function (tagName, tagAttribute) {
                        if (tagName == 'localEntryUID' || tagName == 'entryName' || tagName == 'productOfferingUID') {
                            tagAttribute = cleanJSON(tagAttribute);
                            //msg(tagAttribute);
                            allprogramsString = allprogramsString + comma + ' "' + tags[tagName] + '":"' + tagAttribute + '"';
                            comma = ',';
                            atleastone = 'Y';
                        }
                    });
                }
                allprogramsString = allprogramsString + comma + ' "image":""';
                allprogramsString = allprogramsString + ' }';
            });
        }
    });
    if (atleastone == 'N') {
        allprogramsString = allprogramsString + comma + '{ "tag":"EMPTY2", "label":"no programs", "poUID":"", "image":"" }';
    }
    allprogramsString = allprogramsString + ' ] } ';
    $("#JSON_allprograms").html(allprogramsString);

    var allprogramsDATA = buildAllProgramsDATA();


    //
    // build individual programs
    //

    var panelString = '';
    var checkexists = '';

    $.each(allprograms, function (index, DataArea) {
        $.each(DataArea.ListOfEntry, function (index, Folder) {
            $.each(Folder.tagAttribute, function (tagName, tagAttribute) {
                if (tagName == 'localEntryUID') {
                    tagAttribute = cleanJSON(tagAttribute);
                    panelString = '{ "type":"panel", "panel":"' + tagAttribute + '" }';
                    checkexists = $("#SELECTION_" + tagAttribute).text();
                    if (!checkexists)
                        $("#json").append('<div id="SELECTION_' + tagAttribute + '"></div>');
                    $("#SELECTION_" + tagAttribute).html(panelString);
                }
            });
        });
    });

    return 'success';
}

function buildAllProgramsDATA() {

    var allprogramsString = $("#JSON_allprograms").text();
    var allprograms = JSON.parse(allprogramsString);
    var program = '';
    var checkexists = '';

    $.each(allprograms, function (tagName, tagAttribute) {
        if (tagName == 'allprograms') {
            $.each(tagAttribute, function (index, allprograms) {
                $.each(allprograms, function (tagName, tagAttribute) {
                    if (tagName == 'tag') {
                        program = getProgramDATA(tagAttribute);
                        checkexists = $("#PANEL_" + tagAttribute).text();
                        if (!checkexists)
                            $("#json").append('<div id="PANEL_' + tagAttribute + '"></div>');
                        $("#PANEL_" + tagAttribute).html(program);
                    }
                });
            });
        }
    });

    return;
}

function getProgramDATA(theprogram) {

    if (theprogram == 'EMPTY2') {
        var empty = '{ "EMPTY2": [   { "hUID":"EMPTY2", "tag":"EMPTY2", "poUID":"", "label":"no videos", "duration":"", "rating":"", "synopsis":"" } ] }';
        return empty;
    }

    var ewf = ewfObject();
    var patient = loadJSON('patient');

    var arg1 = 'attribute=json_libs_stb_list_entry';
    var arg2 = 'parent_HUID=' + theprogram;
    var arg3 = 'depth=1';
    var arg4 = 'query_mode=1';
    var arg5 = 'home_id=' + patient.homeID;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3 + '&' + arg4 + '&' + arg5;

    var program = ajaxJSON(url, args);

    var programString = JSON.stringify(program);

    var tags = Array();
    tags['hierarchyUID'] = 'hUID';
    tags['localEntryUID'] = 'tag';
    tags['productOfferingUID'] = 'poUID';
    tags['Title'] = 'title';
    tags['Title'] = 'label';
    //tags['TitleBrief'] 			= 'label';
    tags['Length'] = 'duration';
    tags['Rating'] = 'rating';
    tags['Description'] = 'description';
    tags['LongDescription'] = 'synopsis';
    tags['PosterBoard'] = 'poster';

    //
    // build movie group
    //

    programString = '{ ';
    programString = programString + '"' + theprogram + '": [  ';

    var comma = '';
    var comma2 = '';
    var titlelength = 0;
    var descrlen = 0;
    var descrpos = 0;
    var descrval = '';

    $.each(program, function (index, DataArea) {
        $.each(DataArea, function (index, ListOfEntry) {
            $.each(ListOfEntry, function (index, Asset) {
                if (index >= 0 && index <= 999) {
                    programString = programString + comma2 + ' {';
                    comma = '';
                    comma2 = ',';
                    $.each(Asset.tagAttribute, function (tagName, tagAttribute) {
                        if (tagName == 'hierarchyUID' || tagName == 'localEntryUID' || tagName == 'productOfferingUID') {
                            tagAttribute = cleanJSON(tagAttribute);
                            programString = programString + comma + ' "' + tags[tagName] + '":"' + tagAttribute + '"';
                            comma = ',';
                            if (tagName == 'localEntryUID') {
                                var bookmark = checkBOOKMARK(tagAttribute);

                                if (bookmark == tagAttribute)
                                    programString = programString + comma + ' "bookmark":"Y"';
                            }
                        }
                    });
                    $.each(Asset.ListOfMetaData, function (tagName, tagAttribute) {
                        if (tagName == 'Title' || tagName == 'TitleBrief' || tagName == 'Length' || tagName == 'Rating' || tagName == 'Description' || tagName == 'LongDescription' || tagName == 'PosterBoard') {
                            tagAttribute = cleanJSON(tagAttribute);
                            if (tagName == 'PosterBoard') {
                                tagAttribute = parsePoster(tagAttribute);
                            }
                            programString = programString + comma + ' "' + tags[tagName] + '":"' + tagAttribute + '"';
                            comma = ',';
                        }
                    });
                    programString = programString + ' }';

                }
            });
        });
    });

    programString = programString + ' ] } ';
    $("#JSON_program").html(programString);

    //
    // build individual videos
    //
    var programObject = JSON.parse(programString);

    var videoString = '';
    var checkexists = '';
    comma = '';

    $.each(programObject[theprogram], function (i, row) {
        videoString = '{ "type":"video", "hUID":"' + row["hUID"] + '", "tag":"' + row["tag"] + '", "poUID":"' + row["poUID"] + '", "title":"' + row["label"] + '", "duration":"' + row["duration"] + '", "rating":"' + row["rating"] + '", "synopsis":"' + row["synopsis"] + '", "description":"' + row["description"] + '", "poster":"' + row["poster"] + '" }';
        checkexists = $("#SELECTION_" + row["tag"]).text();
        if (!checkexists)
            $("#json").append('<div id="SELECTION_' + row["tag"] + '"></div>');
        $("#SELECTION_" + row["tag"]).html(videoString);
    });

    return programString;
}

function allprogramsCategories() {

    var allprogramsString = $("#JSON_allprograms").text();
    var allprograms = JSON.parse(allprogramsString);

    return allprograms;
}

function allprogramsPANEL(panel) {

    var panelString = $("#PANEL_" + panel).text();

    var panel = JSON.parse(panelString);

    return panel;
}

function allprogramsSELECTION(choice) {

    var selectionString = $("#SELECTION_" + choice).text();
    var selection = JSON.parse(selectionString);

    return selection;
}

function checkBOOKMARK(selection) {

    var bookmarks = myprogramsCategories();
    var bookmark = '';

    $.each(bookmarks['myprograms'], function (i, row) {
        if (selection == row["tag"]) {
            bookmark = row["tag"];
        }
    });

    return bookmark;
}


// allprograms END

function getMovieCategoryDATA(choice) {
//msg('ingetmoviescategoryDATA');
    var ewf = ewfObject();
    var patient = loadJSON('patient');
    var productoffering = loadJSON('productoffering');

    var arg1 = 'attribute=json_libs_stb_list_entry';
    if (choice == 'movies') {
        var arg2 = 'parent_HUID=' + ewf.movies;
    } else {
        var arg2 = 'parent_HUID=' + ewf.scenicTV;
    }
    var arg3 = 'depth=1';
    var arg4 = 'home_id=' + patient.homeID;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3 + '&' + arg4;

    var moviecategory = ajaxJSON(url, args);

    var moviecategoryString = JSON.stringify(moviecategory);

    var tags = Array();
    tags['localEntryUID'] = 'tag';
    tags['entryName'] = 'label';
    tags['productOfferingUID'] = 'poUID';
    tags['suspendPosition'] = 'position';
    // build movie categories group

    moviecategoryString = '{ ';
    moviecategoryString = moviecategoryString + ' "type":"menu", ';
    moviecategoryString = moviecategoryString + ' "background":"movies", ';
    moviecategoryString = moviecategoryString + ' "comments":"", ';
    moviecategoryString = moviecategoryString + '"movies": [  ';

    var comma = '';
    var comma2 = '';
    var atleastone = 'N';
    var checkexists = '';

    $.each(moviecategory, function (index, DataArea) {
        if (DataArea.ListOfEntry) {
            $.each(DataArea.ListOfEntry, function (index, Folder) {
                moviecategoryString = moviecategoryString + comma2 + ' {';
                comma2 = ',';
                comma = '';
                if (Folder.tagAttribute) {
                    $.each(Folder.tagAttribute, function (tagName, tagAttribute) {
                        if (tagName == 'localEntryUID' || tagName == 'entryName' || tagName == 'productOfferingUID' || tagName == 'suspendPosition') {
                            tagAttribute = cleanJSON(tagAttribute);
                            moviecategoryString = moviecategoryString + comma + ' "' + tags[tagName] + '":"' + tagAttribute + '"';
                            comma = ',';
                        }
                    });
                }
                moviecategoryString = moviecategoryString + comma + ' "image":""';
                moviecategoryString = moviecategoryString + ' }';
                atleastone = 'Y';
            });
        }
    });

    if (atleastone == 'N') {
        moviecategoryString = moviecategoryString + comma + '{ "tag":"EMPTY3", "label":"no categories", "poUID":"", "image":"" }';
    }
    moviecategoryString = moviecategoryString + ' ] } ';

    if (choice == 'movies') {
        $("#JSON_moviecategory").html(moviecategoryString);
    } else {
        $("#JSON_sceniccategory").html(moviecategoryString);
    }

    if (atleastone == 'N') {
        var moviesString = '{ "EMPTY3": [ { "hUID":"EMPTY3", "tag":"EMPTY3", "poUID":"", "label":"no categories", "duration":"", "rating":"", "synopsis":"", "poster":"" } ] }';
        checkexists = $("#PANEL_EMPTY3").text();
        if (!checkexists)
            $("#json").append('<div id="PANEL_EMPTY3"></div>');
        $("#PANEL_EMPTY3").html(moviesString);
    } else {
        var moviesDATA = buildMoviesDATA(moviecategoryString, choice);
    }
    //
    // build individual categories
    //

    var moviecarouselString = '';
    checkexists = '';

    $.each(moviecategory, function (index, DataArea) {
        $.each(DataArea.ListOfEntry, function (index, Folder) {
            $.each(Folder.tagAttribute, function (tagName, tagAttribute) {
                if (tagName == 'localEntryUID') {
                    tagAttribute = cleanJSON(tagAttribute);
                    moviecarouselString = '{ "type":"carousel", "panel":"' + tagAttribute + '" }';
                    checkexists = $("#SELECTION_" + tagAttribute).text();
                    if (!checkexists)
                        $("#json").append('<div id="SELECTION_' + tagAttribute + '"></div>');
                    $("#SELECTION_" + tagAttribute).html(moviecarouselString);
                }
            });
        });
    });

    if (atleastone == 'N') {
        moviecarouselString = '{ "type":"carousel", "panel":"EMPTY3" }';
        checkexists = $("#SELECTION_EMPTY3").text();
        if (!checkexists)
            $("#json").append('<div id="SELECTION_EMPTY3"></div>');
        $("#SELECTION_EMPTY3").html(moviecarouselString);
    }
    return 'success';
}

function buildMoviesDATA(moviecategoryString, choice) {

    var moviecategory = JSON.parse(moviecategoryString);

    var checkexists = '';

    $.each(moviecategory, function (tagName, tagAttribute) {

        if (tagName == 'movies') {
            $.each(tagAttribute, function (index, movies) {
                $.each(movies, function (tagName, tagAttribute) {
                    if (tagName == 'tag') {
                        buildMoviesDATAByCategory(tagAttribute, choice);
                    }
                });
            });
        }
    });

    return 'success';
}

function buildMoviesDATAByCategory(categoryHUID, choice) {
    if (categoryHUID != 'EMPTY3') {
        var moviesString = getMoviesDATA(categoryHUID, choice);
        checkexists = $("#PANEL_" + categoryHUID).text();
        if (!checkexists)
            $("#json").append('<div id="PANEL_' + categoryHUID + '"></div>');
        $("#PANEL_" + categoryHUID).html(moviesString);
    }
}

function getMoviesDATA(category, choice) {

    var ewf = ewfObject();
    var patient = loadJSON('patient');

    var arg1 = 'attribute=json_libs_stb_list_entry';
    var arg2 = 'parent_HUID=' + category;
    var arg3 = 'depth=1';
    var arg4 = 'query_mode=1';
    var arg5 = 'home_id=' + patient.homeID;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3 + '&' + arg4 + '&' + arg5;

    var movies = ajaxJSON(url, args);

    var moviesString = JSON.stringify(movies);

    var tags = Array();
    tags['hierarchyUID'] = 'hUID';
    tags['localEntryUID'] = 'tag';
    tags['productOfferingUID'] = 'poUID';
    tags['Title'] = 'label';
    tags['Length'] = 'duration';
    tags['Rating'] = 'rating';
    tags['LongDescription'] = 'synopsis';
    tags['PosterBoard'] = 'poster';
    tags['entryUID'] = 'assetid';
    tags['ticketIDList'] = 'ticket';
    tags['suspendPosition'] = 'position';
    //
    // build movie group
    //

    moviesString = '{ ';
    moviesString = moviesString + '"' + category + '": [  ';

    var comma = '';
    var comma2 = '';

    $.each(movies, function (index, DataArea) {

        $.each(DataArea, function (index, ListOfEntry) {
            $.each(ListOfEntry, function (index, Asset) {

                if (index >= 0 && index <= 999) {
                    moviesString = moviesString + comma2 + ' {';
                    comma = '';
                    comma2 = ',';
                    $.each(Asset.tagAttribute, function (tagName, tagAttribute) {

                        if (tagName == 'hierarchyUID' || tagName == 'localEntryUID' || tagName == 'productOfferingUID' || tagName == 'ticketIDList' || tagName == 'entryUID' || tagName == 'suspendPosition') {
                            tagAttribute = cleanJSON(tagAttribute);
                            moviesString = moviesString + comma + ' "' + tags[tagName] + '":"' + tagAttribute + '"';
                            comma = ',';
                        }
                    });
                    $.each(Asset.ListOfMetaData, function (tagName, tagAttribute) {
                        if (tagName == 'Title' || tagName == 'Length' || tagName == 'Rating' || tagName == 'LongDescription' || tagName == 'PosterBoard') {
                            tagAttribute = cleanJSON(tagAttribute);
                            if (tagName == 'PosterBoard') {
                                tagAttribute = parsePoster(tagAttribute);
                            }
                            moviesString = moviesString + comma + ' "' + tags[tagName] + '":"' + tagAttribute + '"';
                            comma = ',';
                        }
                    });
                    moviesString = moviesString + ' }';

                }
            });
        });
    });

    moviesString = moviesString + ' ] } ';

    //
    // filter out the movies
    //

    var moviesObject = JSON.parse(moviesString);

    comma = '';
    var atleastone = 'N';

    var filteredString = '{ "' + category + '": [';
    $.each(moviesObject[category], function (i, row) {

        if (row["poUID"] == '3') {

            rating = '';
            if (row["rating"])
                rating = getRating(row["rating"]);

            filteredString = filteredString + comma + ' { "hUID":"' + row["hUID"] + '", "tag":"' + row["tag"] + '", "poUID":"' + row["poUID"] + '", "label":"' + row["label"] + '", "duration":"' + row["duration"] + '", "rating":"' + rating + '", "synopsis":"' + row["synopsis"] + '", "ticket":"' + row["ticket"] + '", "assetid":"' + row["assetid"] + '", "poster":"' + row["poster"] + '" }';
            comma = ',';
            atleastone = 'Y';
        }
    });
    if (atleastone == 'N') {
        filteredString = filteredString + comma + ' { "hUID":"", "tag":"EMPTY3", "poUID":"3", "label":"no movies", "duration":"", "rating":"", "synopsis":"", "poster":"" }';
    }
    filteredString = filteredString + ' ] }';

    if (choice == 'movies') {
        $("#JSON_movies").html(filteredString);		// contains just healthcare bookmarks
    } else {
        $("#JSON_scenic").html(filteredString);
    }
    //
    // build individual movies
    //

    if (choice == 'movies') {
        $("#json #MOVIEDATA").text('');
    } else {
        $("#json #SCENICDATA").text('');
    }

    var filteredObject = JSON.parse(filteredString);

    var videoString = '';
    var checkexists = '';
    comma = '';

    $.each(filteredObject[category], function (i, row) {

        videoString = '{ "type":"movie", "hUID":"' + row["hUID"] + '", "tag":"' + row["tag"] + '", "poUID":"' + row["poUID"] + '", "title":"' + row["label"] + '", "duration":"' + row["duration"] + '", "rating":"' + row["rating"] + '", "synopsis":"' + row["synopsis"] + '", "poster":"' + row["poster"] + '" }';

        checkexists = $("#SELECTION_" + row["tag"]).text();
        if (!checkexists)

            if (choice == 'movies') {
                $("#json #MOVIEDATA").append('<div id="SELECTION_' + row["tag"] + '"></div>');
            } else {
                $("#json #SCENICDATA").append('<div id="SELECTION_' + row["tag"] + '"></div>');
            }
        $("#SELECTION_" + row["tag"]).html(videoString);

    });

    return filteredString;
}

function movieCategories() {

    var moviecategoryString = $("#JSON_moviecategory").text();
    var moviecategory = JSON.parse(moviecategoryString);

    return moviecategory;
}

function moviePANEL(panel) {
//msg('panel ' + panel);	
    var panelString = $("#PANEL_" + panel).text();
    var panel = JSON.parse(panelString);

    return panel;
}

function movieSELECTION(choice) {

    var selectionString = $("#SELECTION_" + choice).text();
    var selection = JSON.parse(selectionString);

    return selection;
}

function parsePoster(poster) {

    var postername = poster.substring(0, 52);
    postername = clean4JSON(postername);

    return postername;
}

// play the video

function getAsset(assetID) {			// not used

    var ewf = ewfObject();
    var patient = loadJSON('patient');

    var arg1 = 'attribute=json_libs_stb_get_asset';
    var arg2 = 'local_entry_UID=' + assetID;
    var arg3 = 'home_id=' + patient.homeID;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3;

    var asset = ajaxJSON(url, args);

    var assetString = JSON.stringify(asset);

    var asset = Array();
    asset['duration'] = 0;

    $.each(asset, function (index, DataArea) {
        comma = '';
        //	$.each(DataArea.tagAttribute, function(tagName, tagAttribute) {								
        //tagAttribute = cleanJSON(tagAttribute);			
        //assetString = assetString+comma+' "'+tagName+'":"'+tagAttribute+'"';
        //comma = ',';
        //	});	
        $.each(DataArea.ListOfMetaData, function (tagName, tagAttribute) {
            if (tagName == 'Length') {
                asset['duration'] = tagAttribute;
            }
        });
    });

    return asset;

}

function purchaseAsset(poUID, localEntryUID) {

    var ewf = ewfObject();
    var patient = loadJSON('patient');
    var device = loadJSON('device');

    var arg1 = 'attribute=json_libs_ote_purchase_product';
    var arg2 = 'local_entry_id=' + localEntryUID;
    var arg3 = 'product_offering_id=' + poUID;
    var arg4 = 'home_id=' + patient.homeID;
    var arg5 = 'device_id=' + device.deviceID;
    var arg6 = 'entry_type=6';
    var arg7 = 'ticket_id=1';

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3 + '&' + arg4 + '&' + arg5 + '&' + arg6 + '&' + arg7;
msg(url);
    var purchase = ajaxJSON(url, args);

    var purchaseString = JSON.stringify(purchase);
    //msg(purchaseString);
    return 'success';

}

function positionAsset(homeID, ticketID, suspendPosition) {

    var ewf = ewfObject();

    var arg1 = 'attribute=json_libs_ote_update_ticket_suspend_position';
    //var arg2	= 'device_id='+device.deviceID;
    //var arg3	= 'home_id='+patient.homeID;
    //var arg2	= 'device_id='+deviceID;
    var arg3 = 'home_id=' + homeID;
    var arg4 = 'ticket_id=' + ticketID;
    var arg5 = 'suspend_position=' + suspendPosition;
    //var arg6	= 'product_offering_type='+poUID;
    //var arg7	= 'user_id='+patient.userID;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg3 + '&' + arg4 + '&' + arg5;
    var ignore = true;

    var purchase = ajaxJSON(url, args, ignore);

    if (!purchase) return 'ignore';

    var purchaseString = JSON.stringify(purchase);

    return 'success';
}

function getServerLoadDATA() {

    var ewf = ewfObject();

    var arg1 = 'attribute=json_libs_ote_get_server_load_info';
    var arg2 = 'application_uid=' + ewf.applicationUID;
    var arg3 = 'node_group=' + ewf.nodeGroup;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3;
    var serverload = ajaxJSON(url, args);

    var serverloadString = JSON.stringify(serverload);

    var comma = '';

    var serverloadString = '{';

    $.each(serverload, function (index, DataArea) {
        $.each(DataArea.ListOfServerList, function (index, CMGroup) {
            $.each(CMGroup.tagAttribute, function (tagName, tagAttribute) {
                serverloadString = serverloadString + comma + ' "' + tagName + '":"' + tagAttribute + '"';
                comma = ',';
            });
        });
    });

    serverloadString = serverloadString + ' }';
    $("#JSON_serverload").html(serverloadString);

    var serverloadDATA = JSON.parse(serverloadString);

    return serverloadDATA;
}

function cancelAsset(ticketID) {

    var ewf = ewfObject();
    var patient = loadJSON('patient');
    var device = loadJSON('device');

    var arg1 = 'attribute=json_libs_ote_delete_ticket';
    var arg2 = 'home_id=' + patient.homeID;
    var arg3 = 'device_id=' + device.deviceID;
    var arg4 = 'user_id=' + patient.userID;
    var arg5 = 'ticket_id=' + ticketID;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3 + '&' + arg4 + '&' + arg5;
    //$("#CALL_purchase").html(url+'?'+args);
    //msg(url+'?'+args);
    var cancel = ajaxJSON(url, args);

    var cancelString = JSON.stringify(cancel);
    //msg('cancelString ' + cancelString);
    return cancelString;
}
function getChannelsDATA() {

    var ewf = ewfObject();

    var arg1 = 'attribute=json_libs_clu_get_region_channel_group';
    var arg2 = 'region_id=' + ewf.regionChannelGroup;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2;
    //$("#CALL_channelgroup").html(url+'?'+args);
    msg(url + args);
    var channelgroup = ajaxJSON(url, args);

    var channelgroupString = JSON.stringify(channelgroup);
//msg(channelgroupString);
    //$("#EWF_channelgroup").html(channelgroupString);
    if (channelgroupString.indexOf("errorCode") >= 0) {
        //alert(channelgroupString);	
        return;
    }
    msg('parsing channels');
    var comma = '';
    var comma2 = '';
// CHANGE BEG: 20120215-1130 bsears - change via Dennis: implement use of channel lineup
    var channellineup = '';
// CHANGE END: 20120215-1130 bsears - change via Dennis: implement use of channel lineup

    var channelsString = '{ "Channels": [ ';

    // if ewf has no 'tvLineupID' or 'musicLineupID', we assume the first lineup returned from server is tv, second is music.
    var tvLineupID = ewf.tvLineupID, musicLineupID = ewf.musicLineupID;
    var hasLineupConfig = tvLineupID && musicLineupID;
    var tvLineup, musicLineup;

    $.each(channelgroup, function (index, DataArea) {
        $.each(DataArea.tagAttribute, function (tagName, tagAttribute) {
        });
        $.each(DataArea.ListOfChannel, function (index, Channel) {
            channelsString = channelsString + comma2 + ' {';
            comma2 = ',';
            comma = '';
            $.each(Channel.tagAttribute, function (tagName, tagAttribute) {
                channelsString = channelsString + comma + ' "' + tagName + '":"' + tagAttribute + '"';
                comma = ',';
            });
            channelsString = channelsString + ' }';
        });


        $.each(DataArea.ListOfChannelLineUp, function (index, ChannelLineUp) {
            if (hasLineupConfig) {
                if (ChannelLineUp.channelLineUpID == tvLineupID) {
                    tvLineup = ChannelLineUp.tagAttribute.channels.split(',');
                }
                else if (ChannelLineUp.channelLineUpID == musicLineupID) {
                    musicLineup = ChannelLineUp.tagAttribute.channels.split(',');
                }
            }
            else {
                if (index == 0) {
                    tvLineup = ChannelLineUp.tagAttribute.channels.split(',');
                }
                else if (index == 1) {
                    musicLineup = ChannelLineUp.tagAttribute.channels.split(',');
                }
            }
            /*
             $.each(ChannelLineUp.tagAttribute, function(tagName, tagAttribute) {

             // CHANGE BEG: 20120215-1130 bsears - change via Dennis: implement use of channel lineup														
             if (tagName=='channels') {

             channellineup=tagAttribute;

             }	
             // CHANGE END: 20120215-1130 bsears - change via Dennis: implement use of channel lineup													
             });	
             */
        });

        $("#JSON_tvlineup").text(tvLineup.toString());
        $("#JSON_musiclineup").text(musicLineup.toString());
    });


    channelsString = channelsString + ' ] }';
    $("#JSON_channels").html(channelsString);
    var channelsDATA = JSON.parse(channelsString);
// CHANGE BEG: 20120215-1130 bsears - change via Dennis: implement use of channel lineup
//	$("#JSON_channellineup").text(channellineup);
// CHANGE END: 20120215-1130 bsears - change via Dennis: implement use of channel lineup


    comma = '';
    var frequency = '';
    var pgmnumber = '';
    var scenictv = '';
// CHANGE BEG: 20120215-1130 bsears - change via Dennis: implement use of channel lineup
    var channelID = '';
    var inlineup = '';
// CHANGE END: 20120215-1130 bsears - change via Dennis: implement use of channel lineup

// CHANGE BEG: 20120223-0900 bsears - change via Dennis: load/reload channel group/lineup on access to watchtv, musicradio and scenictv (PENDING)
    $("#json #EPG_PGMDATA").text('');
// CHANGE END: 20120223-0900 bsears - change via Dennis: load/reload channel group/lineup on access to watchtv, musicradio and scenictv (PENDING)

    channelsString = '{ "Channels": [ ';
    $.each(channelsDATA['Channels'], function (i, row) {

// CHANGE BEG: 20120215-1130 bsears - change via Dennis: implement use of channel lineup
        channelID = row["channelID"];
        //inlineup = lineupFILTER(channelID);
        inlineup = 'Y';
        //msg(inlineup);
        if (inlineup == 'Y') {
// CHANGE END: 20120215-1130 bsears - change via Dennis: implement use of channel lineup

            if (row["frequency"])
                frequency = ', "frequency":"' + row["frequency"] + '"';
            else
                frequency = ', "frequency":"' + ewf.EPGChannelFrequency + '"';

            if (row["programNumber"])
                pgmnumber = ', "programNumber":"' + row["programNumber"] + '"';
            else
                pgmnumber = ', "programNumber":""';	// program number could be empty, that means it's analog channel

            channelsString = channelsString + comma + '{ "channelID":"C' + row["channelID"] + '", "channelNumber":"' + row["channelNumber"] + '", "channelName":"' + row["channelShortName"] + '"' + frequency + pgmnumber + ' }';
            comma = ',';
            // build channel div for later use
// CHANGE BEG: 20120223-0900 bsears - change via Dennis: load/reload channel group/lineup on access to watchtv, musicradio and scenictv (PENDING)
//		$("#json").append('<div id="CHANNEL_C'+row["channelID"]+'"></div>');
            $("#json #EPG_PGMDATA").append('<div id="CHANNEL_C' + row["channelID"] + '"></div>');
// CHANGE END: 20120223-0900 bsears - change via Dennis: load/reload channel group/lineup on access to watchtv, musicradio and scenictv (PENDING)

// CHANGE BEG: 20120215-1130 bsears - change via Dennis: implement use of channel lineup		
        }
// CHANGE END: 20120215-1130 bsears - change via Dennis: implement use of channel lineup

    });


    var client = $("#K_client").text();
    if (client == 'ACESO') {
        channelsString = channelsString + comma + '{ "channelID":"C999", "channelNumber":"999", "channelName":"Channel 999"' + frequency + pgmnumber + ' }';
        comma = ',';
// CHANGE BEG: 20120223-0900 bsears - change via Dennis: load/reload channel group/lineup on access to watchtv, musicradio and scenictv (PENDING)		
//		$("#json").append('<div id="CHANNEL_C999"></div>');	
        $("#json #EPG_PGMDATA").append('<div id="CHANNEL_C999"></div>');
// CHANGE END: 20120223-0900 bsears - change via Dennis: load/reload channel group/lineup on access to watchtv, musicradio and scenictv (PENDING)
    }
// mumbo jumbo	

    channelsString = channelsString + ' ] }';
    $("#EPG_channels").html(channelsString);
    var channelsDATA = JSON.parse(channelsString);

    var client = $("#K_client").text();
    //if (client=='SWEDISH' || client=='GARFIELD')	{
    //	var watchtv    = watchtvFILTER(channelsDATA);
    //	var musicradio = musicradioFILTER(channelsDATA);
    //}

    filterChannelsByLineup(channelsDATA, tvLineup, '#EPG_watchtv');
    filterChannelsByLineup(channelsDATA, musicLineup, '#EPG_musicradio');

    return channelsDATA;
}

// New function to organize lineup according to Program Manager return data
function filterChannelsByLineup(channels, lineup, cachediv) {
    var comma = '';
    var channelNumber = 0;
    var channelsString = '{ "Channels": [ ';

    $.each(channels['Channels'], function (i, row) {
        channelNumber = row["channelNumber"] * 1;
        channelID = row['channelID'].substr(1);
        if (lineup.indexOf(channelID) != -1) {
            channelsString = channelsString + comma + '{ "channelID":"' + row["channelID"] + '", "channelNumber":"' + row["channelNumber"] + '", "channelName":"' + row["channelName"] + '", "frequency":"' + row["frequency"] + '", "programNumber":"' + row["programNumber"] + '" }';
            comma = ',';
        }
    });
    channelsString = channelsString + ' ] }';
    $(cachediv).html(channelsString);

    return 'success';
}

// CHANGE BEG: 20120215-1130 bsears - change via Dennis: implement use of channel lineup
function lineupFILTER(channel) {

    var inlineup = 'N';
    var channellineup = $("#JSON_channellineup").text();
    var lineup = channellineup.split(",");
    var l = lineup.length;
    var i = 0;

    for (i = 0; i < l; i++) {
        if (channel == lineup[i]) {
            inlineup = 'Y';
            break;
        }
    }

    return inlineup;
}

function watchtvFILTER(channels) {

    var comma = '';
    var channelNumber = 0;
    var channelsString = '{ "Channels": [ ';

    $.each(channels['Channels'], function (i, row) {
        channelNumber = row["channelNumber"] * 1;
        if (channelNumber < 90) {
            channelsString = channelsString + comma + '{ "channelID":"' + row["channelID"] + '", "channelNumber":"' + row["channelNumber"] + '", "channelName":"' + row["channelName"] + '", "frequency":"' + row["frequency"] + '", "programNumber":"' + row["programNumber"] + '" }';
            comma = ',';
        }
    });
    channelsString = channelsString + ' ] }';
    $("#EPG_watchtv").html(channelsString);

    return 'success';
}

function musicradioFILTER(channels) {

    var comma = '';
// CHANGE BEG: 20120215-0900 bsears - change via Dennis: correct problem that excludes channel 10
    var channelNumber = 0;
// CHANGE END: 20120215-0900 bsears - change via Dennis: correct problem that excludes channel 10
// CHANGE BEG: 20120214-1300 bsears - change via Dennis: implement use of music channels 108,109,110 (music only logic)
    var channelUsage = '';
// CHANGE END: 20120214-1300 bsears - change via Dennis: implement use of music channels 108,109,110 (music only logic)

    var channelsString = '{ "Channels": [ ';

    $.each(channels['Channels'], function (i, row) {
// CHANGE BEG: 20120215-0900 bsears - change via Dennis: correct problem that excludes channel 10
//		if (row["channelNumber"]>='90'||(row["channelNumber"]>='100'&&row["channelNumber"]<='107'))	{	
        channelNumber = row["channelNumber"] * 1;
// CHANGE BEG: 20120214-1300 bsears - change via Dennis: implement use of music channels 108,109,110 (music only logic)
        channelUsage = '';
        if (channelNumber == 108 || channelNumber == 109 || channelNumber == 110)
            channelUsage = ', "channelUsage":"AudioOnly"';
// CHANGE END: 20120214-1300 bsears - change via Dennis: implement use of music channels 108,109,110 (music only logic)
        if (channelNumber >= 101) {
            channelUsage = ', "channelUsage":"AudioOnly"';
            channelsString = channelsString + comma + '{ "channelID":"' + row["channelID"] + '", "channelNumber":"' + row["channelNumber"] + '", "channelName":"' + row["channelName"] + '", "frequency":"' + row["frequency"] + '", "programNumber":"' + row["programNumber"] + '"' + channelUsage + ' }';
            comma = ',';
        }
    });
    channelsString = channelsString + ' ] }';
    $("#EPG_musicradio").html(channelsString);

    return 'success';
}


function epgChannels() {

    var client = $("#K_client").text();
    //if (client=='SWEDISH' || client=='GARFIELD')	{
    var grid = $("#K_grid").attr("class");
    if (grid == 'watchtv')
        var channelsString = $("#EPG_watchtv").text();
    else if (grid == 'musicradio')
        var channelsString = $("#EPG_musicradio").text();
    else
        var channelsString = $("#EPG_channels").text();
    //}	else	{
    //		var channelsString = $("#EPG_channels").text();
    //	}

    var channels = JSON.parse(channelsString);
    return channels;
}

function epgChannel(channel) {

    var channelString = $("#CHANNEL_" + channel).text();
    var channel = JSON.parse(channelString);

    return channel;
}


function emailsurvey() {

    var questions = Array();

    questions[1] = "Have you watched you Patient Videos?",
        questions[2] = "Do you have a copy of your Discharge Instructions",
        questions[4] = "Do you understand the importance of the recommended diet for your condition?",
        questions[6] = "Do you know how to monitor your daily weight and what to do if it goes up?",
        questions[8] = "Do you understand your medical bills and/or Insurance?",
        questions[10] = "Have you scheduled your follow-up appointments with your primary care doctor and physical therapist if required",
        questions[12] = "Do you know how to take you medications?",
        questions[14] = "Do you have all the medications and medical equipment that you will need?",
        questions[16] = "Have you been offered Financial Counselor assistance for your discharge medications and supplies?"

    var subject = 'Survey';
    var emailbody = '';
    var answer = $("#GOINGHOME" + i).text();
    var i = 0;
    for (i = 2; i <= 18; i++) {
        answer = $("#GOINGHOME" + i).text();
        question = questions[i];
        if (question != null) {
            emailbody = emailbody + '<br/>' + question + ' - ' + answer;
        }
    }

    var emailaddress = 'tami.seago@aceso.com';

    email(emailaddress, subject, emailbody);

}
// CHANGE BEG: 20121024 sthummala - change via Tami - get json object object from xml
function getJsonMenuFromXML() {

    var jsonObj = XML2jsobj(getXmlDocument());

    saveJSON("JSON_menu", jsonObj);
    return jsonObj;
}
// CHANGE END: 20121024 sthummala - change via Tami - get json object object from xml

function getrecoveryDATA() {
    var ewf = ewfObject();
    var patient = loadJSON('patient');
    var arg1 = 'attribute=json_libs_stb_list_entry';
    var arg2 = 'parent_HUID=' + ewf.recovery;
    var arg3 = 'depth=1';
    var arg4 = 'home_id=' + patient.homeID;
    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3 + '&' + arg4;
    var recovery = ajaxJSON(url, args);
    var recoveryString = JSON.stringify(recovery);

    var tags = Array();
    tags['hierarchyUID'] = 'hUID';
    tags['localEntryUID'] = 'tag';
    tags['productOfferingUID'] = 'poUID';
    tags['Title'] = 'label';
    tags['Length'] = 'duration';
    tags['Rating'] = 'rating';
    tags['LongDescription'] = 'synopsis';
    tags['PosterBoard'] = 'poster';
    tags['entryUID'] = 'assetid';
    tags['ticketIDList'] = 'ticket';


    recoveryString = '{ "recovery": [  ';
    var comma = '';
    var comma2 = '';
    $.each(recovery, function (index, DataArea) {
        $.each(DataArea.ListOfEntry, function (index, recovery) {
            recoveryString = recoveryString + comma2 + ' {';
            comma2 = ',';
            comma = '';
            $.each(recovery.tagAttribute, function (tagName, tagAttribute) {
                if (tagName == 'ticketID' || tagName == 'homeID' || tagName == 'deviceID' || tagName == 'assetID' || tagName == 'localEntryUID' || tagName == 'suspendPosition' || tagName == 'PosterBoard' || tagName == 'ticketIDList' || tagName == 'entryUID') {
                    tagAttribute = cleanJSON(tagAttribute);
                    recoveryString = recoveryString + comma + ' "' + tags[tagName] + '":"' + tagAttribute + '"';
                    comma = ',';
                }
                ;
            });

            $.each(recovery.ListOfMetaData, function (tagName, tagAttribute) {
                if (tagName == 'Title' || tagName == 'TitleBrief' || tagName == 'Length' || tagName == 'Rating' || tagName == 'Description' || tagName == 'LongDescription' || tagName == 'PosterBoard') {
                    tagAttribute = cleanJSON(tagAttribute);
                    recoveryString = recoveryString + comma + ' "' + tagName + '":"' + tagAttribute + '"';
                    comma = ',';
                }
            });
            recoveryString = recoveryString + ' }';
        });
    });
    recoveryString = recoveryString + ' ] } ';
    $("#JSON_recovery").html(recoveryString);
    var recoveryDATA = JSON.parse(recoveryString);
    return recoveryDATA;
}

function getConfigSelectionsDATA() {

    var ewf = ewfObject();
    var url = ewf.host + ewf.proxy;
    var configselection = ewf.configselection;

    var patientDATA = getUserDataDATA();

    var room = patientDATA.roomNumber;
    var bed = patientDATA.roomBed;


    var args = 'wsdl=' + configselection + '?room=' + room + '&bed=' + bed;

    msg(url + ' ' + args);

    var string = $.ajax({
        type: "GET",
        url: url,
        data: args,
        async: false,
        dataType: "text"
    }).responseText;

    string = string.replace(/(\r\n|\n|\r)/g, "");
    var xmlString = string;
    var noimages = '';
    var contrast = '';
    var audio = '';
    var config_id = '';
    var configs = Array();
    $(xmlString).find('config').each(function () {
        var $config = $(this);
        var config_id = $config.find('config_id').text()
        switch (config_id) {
            case '1':
                noimages = 'noimages';
                break;
            case '2':
                contrast = 'lightdark';
                break;
            case '3':
                contrast = 'darklight';
                break;
            case '4':
                audio = 'hearaudio';
                break;
        }
    });

    $("#K_audio").text(audio);
    $("#K_contrast").text(contrast);
    $("#K_images").text(noimages);

    return configs;

}


function purchasevideoDATANew(poUID, localEntryUID) {

    var ewf = ewfObject();
    var patient = loadJSON('patient');
    var device = loadJSON('device');

    var url = '';

    var arg1 = 'attribute=json_libs_ote_purchase_product';
    var arg2 = 'local_entry_id=' + localEntryUID;
    var arg3 = 'product_offering_id=' + poUID;
    var arg4 = 'home_id=' + patient.homeID;
    var arg5 = 'device_id=' + device.deviceID;
    var arg6 = 'entry_type=6';
    var arg7 = 'ticket_id=1';

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3 + '&' + arg4 + '&' + arg5 + '&' + arg6 + '&' + arg7;


    //msg('purchasevideo ' + url + ' ' + args);

    var videoDATA = ajaxJSON(url, args);
    var videoDATAString = JSON.stringify(videoDATA);

    var tags = Array();
    tags['ticketID'] = 'ticketID';
    tags['homeID'] = 'homeID';
    tags['deviceID'] = 'deviceID';
    tags['assetID'] = 'assetid';
    tags['ticketID'] = 'ticket';

    tags['localEntryUID'] = 'tag';
    tags['productOfferingID'] = 'poUID';
    tags['Title'] = 'title';
    tags['Title'] = 'label';
    tags['YearOfRelease'] = 'year';
    tags['Length'] = 'duration';
    tags['Rating'] = 'rating';
    tags['Description'] = 'description';
    tags['LongDescription'] = 'synopsis';
    tags['PosterBoard'] = 'poster';
    tags['suspendPosition'] = 'position';

    // build myprograms
    var videoString = '{';
    //videoString = videoString+'"type":"menu", ';
    //videoString = videoString+'"background":"video", ';
    //videoString = videoString+'"comments":"", ';
    //videoString = videoString+'"video": [  ';

    var count = 0;
    var comma = '';
    var comma2 = '';
    var titlelength = 0;
    var descrlen = 0;
    var descrpos = 0;
    var descrval = '';

    $.each(videoDATA, function (index, DataArea) {
        msg(DataArea.ListOfTicket);
        if (DataArea.ListOfTicket) {
            $.each(DataArea.ListOfTicket, function (index, Ticket) {
                comma2 = ',';
                comma = '';
                if (Ticket.tagAttribute) {
                    $.each(Ticket.tagAttribute, function (tagName, tagAttribute) {

                        if (tagName == 'localEntryUID' || tagName == 'entryName' || tagName == 'productOfferingUID' || tagName == 'assetID' || tagName == 'ticketID') {
                            tagAttribute = cleanJSON(tagAttribute);
                            //msg('purschase asset new ' + tagName + ' ' + tagAttribute);
                            videoString = videoString + comma + ' "' + tags[tagName] + '":"' + tagAttribute + '"';
                            comma = ',';
                        }
                    });
                }
            });
        }
    });
    videoString = videoString + ' }';
    msg(videoString);
    var videoDATA = JSON.parse(videoString);

    return videoDATA;

}

function reportSTBInfo() {

    var ewf = ewfObject();
    var arg1 = 'attribute=json_libs_oss_stb_info_setting';
    var arg2 = 'device_id=' + window.settings.mac;
    var arg3 = 'firmware=' + window.settings.platformVersion;
    var arg4 = 'stb_ip=' + window.settings.ip;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3 + '&' + arg4;

    if (window.settings.version != 'TEST') {
        msg('reportSTBInfo ' + url + ' ' + args);
        var info = ajaxJSON(url, args, true);
    }
}

function setLanguage(lang) {
    var ewf = ewfObject();
    var arg1 = 'attribute=json_libs_oss_set_language';
    var arg2 = 'home_id=' + window.settings.homeID;
    var arg3 = 'language=' + lang;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3;

    msg('setLanguage ' + url + ' ' + args);
    var info = ajaxJSON(url, args);
}

///////////////////////////////////////////////////////
// some new funcitons that return raw data

function getListTicket() {   // new function return raw bookmarks
    var ewf = ewfObject();
    var arg1 = 'attribute=json_libs_ote_list_ticket';
    var arg2 = 'product_type=0';
    var arg3 = 'home_id=' + window.settings.homeID;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3;

    var bookmarks = ajaxJSON(url, args);
    return bookmarks;
}

function getGetTicket(ticketID) {
    var ewf = ewfObject();
    var arg1 = 'attribute=json_libs_ote_get_ticket';
    var arg2 = 'ticket_id=' + ticketID;
    var arg3 = 'home_id=' + window.settings.homeID;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3;

    var ticket = ajaxJSON(url, args);
    return ticket;
}

function getListEntry(huid) {
    var ewf = ewfObject();
    var arg1 = 'attribute=json_libs_stb_list_entry';
    var arg2 = 'parent_HUID=' + huid;
    var arg3 = 'depth=1';
    var arg4 = 'home_id=' + window.settings.homeID;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3 + '&' + arg4;
    var entries = ajaxJSON(url, args);

    return entries;
}

function getGetAsset(assetId) {
    var ewf = ewfObject();
    var arg1 = 'attribute=json_libs_stb_get_asset';
    var arg2 = 'local_entry_UID=' + assetId;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2;
    var asset = ajaxJSON(url, args);

    return asset;
}

function getPurchaseProduct(poUID, localEntryUID) {
    var ewf = ewfObject();
    var arg1 = 'attribute=json_libs_ote_purchase_product';
    var arg2 = 'local_entry_id=' + localEntryUID;
    var arg3 = 'product_offering_id=' + poUID;
    var arg4 = 'home_id=' + window.settings.homeID;
    var arg5 = 'device_id=' + window.settings.mac;
    var arg6 = 'entry_type=6';
    var arg7 = 'ticket_id=1';

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3 + '&' + arg4 + '&' + arg5 + '&' + arg6 + '&' + arg7;
    var purchase = ajaxJSON(url, args);
    return purchase;
}

function getUpdateSuspendPosition(ticketId, position) {
    var ewf = ewfObject();
    var arg1 = 'attribute=json_libs_ote_update_ticket_suspend_position';
    var arg2 = 'home_id=' + window.settings.homeID;
    var arg3 = 'ticket_id=' + ticketId;
    var arg4 = 'suspend_position=' + position;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2 + '&' + arg3 + '&' + arg4;
    var ignore = true;

    msg('[getUpdateSuspendPosition url]: ' + ewf.host + ewf.method + '?' + args);

    var update = ajaxJSON(url, args, ignore);
}

function prebookmarkvideos() {
    var ewf = ewfObject();

    var movies = ewf.prebookmarkvideos;
    var i = 0;
    //alert(movies.length);
    for (var i = 0; i < movies.length; i++) {
        var movie = movies[i];
        var purchaseDATA = purchaseAsset(ewf.healthcarePOUID, movie);
        msg(purchaseDATA);
    }
}

function preloadChannelLineups() {
    var ewf = ewfObject();
    var arg1 = 'attribute=json_libs_clu_get_region_channel_group';
    var arg2 = 'region_id=' + ewf.regionChannelGroup;

    var url = ewf.host + ewf.method;
    var args = arg1 + '&' + arg2;
	
	msg(url + ' ' + args);
	
    var channelgroup = ajaxJSON(url, args);

    var channelgroupString = JSON.stringify(channelgroup);
    if (channelgroupString.indexOf("errorCode") >= 0) {
        return;
    }
    
    // get all channels and put in a lookup table
    var channels = {};
    $.each(channelgroup.DataArea.ListOfChannel, function(i, c){
        var channel = c.tagAttribute;
        // we prefix a 'C' to form a channelID, which will be used in EPG page
        channel.id = channel.channelID;
        channel.channelID = 'C' + channel.id;
        channels[channel.id] = channel;
    });
    
    var lineups = $.map(channelgroup.DataArea.ListOfChannelLineUp, function(l, i){
        var lineup = l.tagAttribute;
        lineup.channelIds = lineup.channels;
        lineup.channels = [];
        var idList = lineup.channelIds.split(',');
        $.each(idList, function(i, v) {
            if(channels[v])
                lineup.channels.push(channels[v]);
        });
        return lineup;
    });
    
    window.JSONDATA.lineups = lineups;
}
