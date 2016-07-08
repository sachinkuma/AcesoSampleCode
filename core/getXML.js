/********************************************************************************
 * @brief																		*
 * 		XML call, parse functions			               						*
 *																				*
 * @author																		*
 *		Bill Sears\n															*
 *		Aceso\n																	*
 *		http://www.aceso.com\n													*
 *																				*
 * @modified																	*
 * 		Tami Seago, 02/05/2013, add info and error handling						*
 ********************************************************************************/

 function postXML(type, url, args) {
    $("#XMLCALL_error").text('');
    if (type=='SAVECONFIGS') {
        var ewf	 = ewfObject();
        var url	 = ewf.host+ewf.proxy+'?wsdl='+url;
        args = args;

        $("#XMLCALL_lastcall").text(args);
        var string = $.ajax({
            type: "POST", 
            url: url, 
            data: args,
            async: false,
            dataType: "XML",
            complete: function(){
                // Handle the complete event
            }
        }).responseText;
        $("#XMLCALL_laststring").text(string);
    }
    xmlString = string.replace(/(\r\n|\n|\r)/g,"");
    var success = '', error   = '', errorT  = '';
    
    $(xmlString).find('STATUS').each(function(){
        success = $(this).attr('success');
        if (success!='1')	{
            $(xmlString).find('ERROR').each(function(){
                error  = $(this).attr('number');	
                errorT = $(this).attr('text');
                msg('ERROR: '+error+': '+errorT);
                $("#XMLCALL_error").text('ERROR: '+error+': '+errorT);
            });	
        }
    });	
    return xmlString;
}

function ajaxXML(type,args)	{
    //msg('type ' + type + ' args ' + args);
    $("#XMLCALL_error").text('');
    
    if (type=='CHANGEUI' || type=='EMAIL') {
        var ewf	 = ewfObject();
        var url	 = ewf.host+ewf.proxy;
        var blackbox = ewf.blackbox;		
        args = 'wsdl='+blackbox+args;
        
        $("#XMLCALL_lastcall").text(args);

        var string = $.ajax({
            type: "GET", 
            url: url, 
            data: args,
            async: false,
            dataType: "script"
            }).responseText;

        $("#XMLCALL_laststring").text(string);
    
    }
    
    
    if (string.indexOf('<html>') != -1)	{
        $("#XMLCALL_error").text('ERROR: '+string);
        msg(string);
        return string;
    }

    xmlString = string.replace(/(\r\n|\n|\r)/g,"");

    //msg('xmlString ' + xmlString);
                            
    // check for errors
    
    var success = '';
    var error   = '';
    var errorT  = '';
    
    $(xmlString).find('STATUS').each(function(){
        success = $(this).attr('success');
        if (success!='1')	{
            $(xmlString).find('ERROR').each(function(){
                error  = $(this).attr('number');	
                errorT = $(this).attr('text');
                msg('ERROR: '+error+': '+errorT);
                $("#XMLCALL_error").text('ERROR: '+error+': '+errorT);
            });	
        }
    });	
    return xmlString;
}

function getXML(string)	{
    
    var xmlString = $("#XML_"+string).text();
    //var parser = new DOMParser(),
    //var xmlObject = parser.parseFromString(xmlString , "text/xml");
    var xmlObject = xmlString;
    
    return xmlObject;	
}
// CHANGE BEG: 20121024 sthummala - change via Tami - get menu xml/document from Middleware service
function getMenuXML(){

    var ewf	 = ewfObject();
    
    var url	 = ewf.host+ewf.proxy;
    var menu= ewf.menuhost;
    
    var patientDATA = loadJSON('patient');
    if(!patientDATA)
        patientDATA = getUserDataDATA();
        
    var room =  patientDATA.roomNumber;
    var bed = patientDATA.roomBed;
    
    var args = 'wsdl='+menu + '&room=' + room +'&bed='+bed;
    
    var localeMap = ewf.languageMap;
    var locale = localeMap[window.settings.language];
    if(locale)
        args += '&locale=' + locale;

    $("#XMLCALL_error").text('');
    $("#XMLCALL_error").text('');
    msg(args);
    var string = $.ajax({
            type: "GET", 
            url: url, 
            data: args,
            async: false,
            dataType: "text"			
            }).responseText;
              
    string = string.replace(/(\r\n|\n|\r)/g,"");	        
    
    if (string.indexOf('<response>') < 0)	{
        $("#XMLCALL_error").text("ERROR");		
    }else {
        $("#XML_menu").text(string);
    }
           
    return;
}
function getXmlDocument() {     
    var xmlString = $("#XML_menu").text();
    var xmlObj;
    var theBrowser= navigator.appName;	 
    if (theBrowser== "Microsoft Internet Explorer")     { // Internet Explorer    
        xmlObj = new ActiveXObject("Microsoft.XMLDOM");         
        xmlObj.async = "false";         
        xmlObj.loadXML(xmlString); 	
    } else  
    {         
        xmlObj = new DOMParser();  	
        xmlObj = xmlObj.parseFromString(xmlString, "text/xml");	         
    }		 
    return xmlObj; 
}
    

function email(emailaddress,subject,body) {
    
    var ewf 	= ewfObject();
    
    var portal 	= ewf.kpgarfield
    var patient = loadJSON('patient');
    var device  = loadJSON('device');
    var ewf 	= ewfObject();

    var type 	= 'EMAIL';
    var request = ':'+ewf.email+'/email';
    var room 	= 'room='+patient.roomNumber;
    var bed  	= 'bed='+patient.roomBed.toLowerCase();
    var mac  	= 'mac='+device.deviceID;
    var emailaddress  = 'emailaddress='+emailaddress;
    var subject  = 'subject='+subject;
    var body	 = 'body='+body;
    
    var args 	= request+'?'+room+'&'+bed+'&'+mac+'&'+emailaddress+'&'+subject+'&'+body;

    $("#XMLCALL_changeui").text(args);
    
    var xmlString = ajaxXML(type,args);
    //msg(xmlstring);
    return;
}


function tempsubmitORDER() {

    var ewf 		= ewfObject();
    var d 			= new Date();
    var hour 		= d.getHours();
    var minute		= d.getMinutes();
    if (hour<10) 
        hour = '0'+hour;
    if (minute<10) 
        minute = '0'+minute;
    var time 		= hour+''+minute;
    // BUILD ORDER
    
    var patroninfo 	= getXML('patroninfo');
    var patronmenu 	= getXML('patronmenu');
    var orderDATA   = getXML('order');
    
    var mrn			= '';
    var roomid		= '';
    var menuid		= '';
    var mealid		= '';
    var mealdate	= '';
    var uniquehash	= '';
    var id			= '';
    var numservings	= '';
    
    $(patroninfo).find('PATRON').each(function(){
        mrn 		= $(this).attr('mrn');
    });
    
    $(patroninfo).find('ROOM').each(function(){
        roomid 		= $(this).attr('id');
    });
    
    $(patroninfo).find('MEAL').each(function(){
        mealid 		= $(this).attr('id');
        mealdate 	= $(this).attr('date');
    });
    
    $(patronmenu).find('MEAL').each(function(){
        menuid 		= $(this).attr('menuid');
        uniquehash 	= $(this).attr('uniquehash');
    });
    
    var selectionsXML   = '';
    
    selectionsXML = selectionsXML+'<?xml version="1.0" encoding="ISO-8859-1" ?>';	
    selectionsXML = selectionsXML+'<PATRONSELECTIONS>';
    selectionsXML = selectionsXML+'<MRN>'+mrn+'</MRN>';
    selectionsXML = selectionsXML+'<ROOMID>'+roomid+'</ROOMID>';
    selectionsXML = selectionsXML+'<MENUID>'+menuid+'</MENUID>';
    selectionsXML = selectionsXML+'<MEALID>'+mealid+'</MEALID>';
    selectionsXML = selectionsXML+'<MEALDATE>'+mealdate+'</MEALDATE>';
    selectionsXML = selectionsXML+'<UNIQUEHASH>'+uniquehash+'</UNIQUEHASH>';
    selectionsXML = selectionsXML+'<SELECTIONS>';
    
    $(orderDATA).find('orderitem').each(function(){									   													 
        id 			= $(this).attr('recipe');
        numservings = $(this).attr('quantity');
        selectionsXML = selectionsXML+'<RECIPE id="'+id+'" numservings="'+numservings+'" ></RECIPE>';
    });	
    
    selectionsXML = selectionsXML+'</SELECTIONS>';
    selectionsXML = selectionsXML+'</PATRONSELECTIONS>';	
    
    $("#XML_selections").text(selectionsXML);

    var subject = 'Menu Order';
    var body = selectionsXML;
    var emailaddress = 'tami.seago@aceso.com';
    
    email(emailaddress,subject,body);			
    
}





function submitConfigs(noimages, lightdark, darklight, audio)	{
    
    var ewf 		= ewfObject();
    var patient = loadJSON('patient');
    var room 	= patient.roomNumber;
    var bed  	= patient.roomBed;		
    
    var configsXML   = '';
    
    configsXML += '<?xml version="1.0" encoding="ISO-8859-1" ?>';	
    configsXML += '<configselections>';
    configsXML += '<room>'+room+'</room>';
    configsXML += '<bed>'+bed+'</bed>';
    configsXML += '<configs>';		
    if(noimages) 
            configsXML += '<config><config_id>1</config_id></config>' ;
    if(lightdark) 
            configsXML += '<config><config_id>2</config_id></config>' ;
    if(darklight) 
            configsXML += '<config><config_id>3</config_id></config>' ;
    if(audio) 
            configsXML += '<config><config_id>4</config_id></config>' ;
    
    configsXML = configsXML+'</configs></configselections>';
    
    var url = ewf.addconfigs;
    var args = configsXML;
    msg('args: ' + args);
    var xmlString = postXML('SAVECONFIGS', url, {patronMenu:args});
msg('save config ' + url + ' ' + xmlString);
    return;	
}

// cross-domain XML ajax call
function getXdXML(xdurl, dataobj) {
    var ewf  = ewfObject();
//msg('dataobj ' + dataobj);
    var url  = ewf.host+ewf.proxy;
    var dataString = 'wsdl=' + xdurl;
    if(dataobj && dataobj!='') 
        dataString += '?' + $.param(dataobj);
    //msg('getxdxml ' + url);
    var xmlString = $.ajax({
        type: "GET", 
        url: url, 
        data: dataString,
        async: false,
        dataType: "text"            
    }).responseText;
    
    var xmlObj = new DOMParser();   
    xmlObj = xmlObj.parseFromString(xmlString, "text/xml");     
    
    return xmlObj;
}

function postXdXML(xdurl, dataobj) {
    var ewf  = ewfObject();

    var url  = ewf.host+ewf.proxy+'?wsdl='+xdurl;
    var jqxhr = $.ajax({
        type: "POST", 
        url: url, 
        data: dataobj,
        async: false,
        dataType: "text"            
    });
    
    var xmlString = jqxhr.responseText;
    
    if (jqxhr.status >= 200 && jqxhr.status < 300 || jqxhr.status === 304 ) {
        // good HTTP response
        var xmlObj = new DOMParser();   
        xmlObj = xmlObj.parseFromString(xmlString, "text/xml");     
        return xmlObj;
    }
    
    return null;
}

function getXMLFile(url)	{
    $("#XMLCALL_error").text('');
    

        var string = $.ajax({
            type: "GET", 
            url: url, 
            async: false,
            dataType: "xml"
            }).responseText;

        $("#XMLCALL_laststring").text(string);
        
    xmlString = string.replace(/(\r\n|\n|\r)/g,"");

    return xmlString;
}


function getXML(url)	{

    var xmlString = $.ajax({
        type: "GET", 
        url: url, 
        data: "",
        async: false,
        dataType: "text"            
    }).responseText;
    
    var xmlObj = new DOMParser();   
    xmlObj = xmlObj.parseFromString(xmlString, "text/xml");     
    
    return xmlObj;
}

