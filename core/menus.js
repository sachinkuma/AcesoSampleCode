/********************************************************************************
 * @brief																		*
 * 		JSON Menu Data Functions			               						*
 *																				*
 * @author																		*
 *		Bill Sears\n															*
 *		Aceso\n																	*
 *		http://www.aceso.com\n													*
 *																				*
 * @modified																	*
 * 		Tami Seago, 02/05/2013, add info and error handling						*
 ********************************************************************************/
var tag = "";
var label = "";
var image = "";
function Menu(tag,label,image)
{
this.tag=tag;
this.label=label;
this.image=image;
};
function getConfig()	{
    var jsonObj = getJSONMenu("JSON_menu");
    var configurations = new Object();
    var configList = new Array();
    var config = jsonObj.response.CONFIGSELECTIONS.CONFIGS.CONFIG;
    
    if(typeof (config) != 'undefined') {
    var configLength = jsonObj.response.CONFIGSELECTIONS.CONFIGS.CONFIG.length;
    
    //msg('configlength ' +  configLength);
        
    
    for(var i = 0; i < configLength; i++) {		 
        msg(jsonObj.response.CONFIGSELECTIONS.CONFIGS);
        configList[i] = jsonObj.response.CONFIGSELECTIONS.CONFIGS.CONFIG[i].value;
    } 
    }
    
    return;
}
function getMenubar()	{
    var jsonObj = getJSONMenu("JSON_menu");
    var menuBar = new Object();
    var menuList = new Array();
    var menuLength = jsonObj.response.menuBar.menu.length;
    menuBar.type = "menu";
    menuBar.menufirst= jsonObj.response.menuBar.menu[0].tag;
    menuBar.menulast= jsonObj.response.menuBar.menu[menuLength-1].tag;
    menuBar.background = jsonObj.response.menuBar.background;
    for(var i = 0; i < menuLength; i++) {		 
        menuList[i] = new Menu(jsonObj.response.menuBar.menu[i].tag,jsonObj.response.menuBar.menu[i].label,jsonObj.response.menuBar.menu[i].image);
    } 
    
    menuBar.menu= menuList;
    
    var menuListAttr = new Array();
    var objtype = checkObj(jsonObj.response.menuBar.attributes,"menu");
    if(objtype != 'undefined') {				
        var menuattributes = getattributes(jsonObj.response.menuBar.attributes.attribute,"menu");
        menuBar.attr = menuattributes.info;
    }
    menuBar.text1 = jsonObj.response.menuBar.text1;
     
    var jsonText = JSON.stringify(menuBar);
    var menubarJson= JSON.parse(jsonText);
    return menubarJson;
}

function getMenu(menu)	{
    var jsonObj = getJSONMenu("JSON_menu");
    var menuItem = new Object();
    var menuItemList = new Array();
    var menuLength = JSON.parse(jsonObj.response.menuBar.menu.length);
    
    for(var i = 0; i < menuLength; i++) {			 
         if(jsonObj.response.menuBar.menu[i].tag == menu){			 
             var menuObj = jsonObj.response.menuBar.menu[i];
             var menuItemObj = menuObj[menu]; 							 
             var menuItemType = jsonObj.response.menuBar.menu[i].type;
             var menuListAttr = new Array();
            menuItem.type = menuItemType;	 
            var objtype = checkObj(menuItemObj);
    
            if(objtype=='array') {
                var menuItemObjLength = menuItemObj.length;			
                menuItem.menufirst = menuItemObj[0].tag;			
                menuItem.menulast = menuItemObj[menuItemObjLength-1].tag;						
             } else {
                menuItem.menufirst = menuItemObj.tag;
                menuItem.menulast = menuItemObj.tag;
             }					
            menuItem[menu] = menuItemObj;		
            
            var objtype = checkObj(jsonObj.response.menuBar.menu[i].attributes);
            if(objtype != 'undefined') {				
                var menuListAttr = new Array();
                menuItemAttrObj = jsonObj.response.menuBar.menu[i].attributes.attribute;				
                var menuattributes = getattributes(menuItemAttrObj,menuItemType);
                menuItem.attr = menuattributes.info;
            } else {
                menuItem.attr = [];
            }
            break;			
        }
    }
    
    var jsonText = JSON.stringify(menuItem);
//msg(jsonText);
    var submenu = JSON.parse(jsonText);
    
    return submenu;
} 
function getLevelOne(amenu,submenu)	{
    if (submenu=='movies')	{
        var options = movieCategories();
        return options;
    }	else
        if (submenu=='allprograms')	{
            var options = allprogramsCategories();
            return options;
        }	else
            if (submenu=='myprograms')	{
                var options = myprogramsCategories();
                return options;
            }	else 
                
                if (submenu=='secondary')	{
                    var options = myprogramsCategories();
    
                    return options;
            }	
            
    var jsonObj = getJSONMenu("JSON_menu");
    var choicesItemList = new Array();
    var menuItem = new Object();
    var objtype = checkObj(jsonObj.response.menuBar.menu);
    if(objtype=='array') {
        var menuLength = JSON.parse(jsonObj.response.menuBar.menu.length);
        var menuItemChoice = new Object();	
        
        for (var i=0; i<menuLength; i++) {
            if(jsonObj.response.menuBar.menu[i].tag == amenu){		 
                var menuItem = jsonObj.response.menuBar.menu[i][amenu];			
                break;
            }
        }
    } else {
        if(jsonObj.response.menuBar.menu.tag == amenu){		 	
            var menuItem = jsonObj.response.menuBar.menu[amenu];
        }
    }
    
    var menuItemChoices = new Object();
    var menuItemType = menuItem.type;
    var menuListAttr = new Array();
    var objtype = checkObj(menuItem);
    
    if(objtype=='array') {
        var menuItemLength = menuItem.length;
        for (var i=0; i<menuItemLength; i++) {
        if(menuItem[i].tag == submenu){		 
            menuItemChoices = menuItem[i];				
            break;
        }
    }
    } else {
        if(menuItem.tag == submenu){		 
            menuItemChoices = menuItem;			
        }
    }
    var objtype = checkObj(menuItemChoices.attributes);
    if(objtype != 'undefined') {				
        var menuItemChoicesListAttr = new Array();
        menuItemChoicesListAttr = menuItemChoices.attributes.attribute;
        var menuattributes = getattributes(menuItemChoicesListAttr,menuItemType);			
        menuItemChoices.attr = menuattributes.info;
    } else {
        menuItemChoices.attr = [];
    }
    
    var jsonText = JSON.stringify(menuItemChoices);
    
    //replace all empty objects with empty strings ""
    jsonText = jsonText.replace(/{}/g,"\"\"");
    var options = JSON.parse(jsonText);
    return options;
}
function getLevelTwo(choice)	{
    if(choice == 'back') 
        return;
    var amenu = $("#K_menu").attr("class");
    var submenu = $("#K_submenu").attr("class");
    if(submenu=='movies')	{
        var options = movieSELECTION(choice);
        return options;		
    }	
    var jsonObj = getJSONMenu("JSON_menu");
    var choicesItemList = new Array();
    var menuItem = new Object();
    var menuItemChoice = new Object();
    
    var objtype = checkObj(jsonObj.response.menuBar.menu);
    if(objtype=='array') {
        var menuLength = JSON.parse(jsonObj.response.menuBar.menu.length);
        for (var i=0; i<menuLength; i++) {
            if(jsonObj.response.menuBar.menu[i].tag == amenu){		 
                var menuItem = jsonObj.response.menuBar.menu[i][amenu];
                break;
            }
        }
    } else {
        if(jsonObj.response.menuBar.menu.tag == amenu){		 	
            var menuItem = jsonObj.response.menuBar.menu[amenu];
        }
    }
    
    var menuItemChoices = new Object();
    var objtype = checkObj(menuItem);	
    if(objtype=='array') {
        var menuItemLength = menuItem.length;	
        for (var i=0; i<menuItemLength; i++) {
            if(menuItem[i].tag == submenu){		
                var menuItemChoices = menuItem[i][submenu];
                break;
            }	
        }
    } else {	
        if(menuItem.tag == submenu){		 
            var menuItemChoices = menuItem[submenu];	
    }
    }
    
    var menuItemChoice = new Object();
    var objtype = checkObj(menuItemChoices);	
    msg(' choice ' + choice + ' objtype ' + objtype);
    if(objtype=='array') {
        var menuItemChoicesLength = menuItemChoices.length;
        for (var i=0; i<menuItemChoicesLength; i++) {
            if(menuItemChoices[i].tag == choice){
                var menuItemChoice = menuItemChoices[i];
                var menuItemChoiceType = menuItemChoices[i].type;
                break;				
            }
        }
    } else {
        if(menuItemChoices.tag == choice){	
            var menuItemChoice = menuItemChoices;
            var menuItemChoiceType = menuItemChoices.type;
        }
    }
    var objtype = checkObj(menuItemChoice.attributes);
    //msg(objtype);
    if(objtype != 'undefined') {				
        var menuItemChoiceListAttr = new Array();
        menuItemChoiceListAttr = menuItemChoice.attributes.attribute;
        var menuattributes = getattributes(menuItemChoiceListAttr,menuItemChoiceType);
        menuItemChoice.attr = menuattributes.info;			
        menuItemChoice.count = menuattributes.count;
        menuItemChoice.active = menuattributes.active;
    } else {
        menuItemChoice.attr = [];
        menuItemChoice.count = '';
        menuItemChoice.active = '';
    }
    
    
    var jsonText = JSON.stringify(menuItemChoice);
    jsonText = jsonText.replace(/{}/g,"\"\"");
    var selections = JSON.parse(jsonText);	
    return selections;
}
function getSelections(panel)	{
        //msg('panel ' + panel);
    var submenu = $("#K_submenu").attr("class");
    if(submenu=='movies')	{
        var options = moviePANEL(panel);
        return options;		
    }
    }
function getattributes(attrsobj,type) {
                var count = 0;
                //msg(type);
                var objtype = checkObj(attrsobj);
                var ListAttr = "";
                if (objtype == 'array') {
                    var AttrsLength = attrsobj.length;					
                    for(var i = 0; i < AttrsLength; i++) {		
                        var aclass = attrsobj[i].class;
                        var pos = aclass.indexOf("slide");
                        
                        if(type=='slider'&&pos != -1){
                            if(aclass=='slide1') {
                                count = 1;
                                info = '<div id="slide" class="slide1" style="display: block" ;="">';
                            } else  {
                                count = count + 1; 
                                info =  '</div><div id="slide" class="' + aclass + '" style="display: none" ;="">';
                            }
                        } else 
                        if(typeof (attrsobj[i].image) != 'undefined') {
                            var image = attrsobj[i].image;
                            var info = "<img class=\"" + aclass + "\" src=\"./images/" + image + "\" />";					
                        } else 
                            if(typeof (attrsobj[i].text) != 'undefined') {
                                var text = attrsobj[i].text;
                                var info = "<p class=\"" + aclass + "\">" + text + "</p>";
                        }  						
                        //msg(info + ' aclass ' + aclass + ' pos ' +  pos + ' count ' + count);
                        ListAttr = ListAttr + info;						
                        }									
                } else 	{
                    
                        var aclass = attrsobj.class;
                        var pos = aclass.indexOf("slide");
                        if(type=='slider'&&pos != -1){
                        //msg(type + ' ' + pos + ' ' + count + ' ' + ListAttry)
                            if(aclass=='slide1') {
                                count = 1;
                                ListAttr = ListAttr + '<div id="slide" class="slide1" style="display: block" ;="">';
                            } else  {
                                count = count + 1; 
                                ListAttr = ListAttr + '</div><div id="slide" class="' + aclass + '" style="display: none" ;="">';
                            }
                        } else 
                        if(typeof (attrsobj.image) != 'undefined') {
                            var aclass = attrsobj.class;
                            var image = attrsobj.image;
                            var info = "<img class=\"" + aclass + "\" src=\"./images/" + image + "\" />";					
                        } else 
                            if(typeof (attrsobj.text) != 'undefined') {
                                var aclass = attrsobj.class;
                                var text = attrsobj.text;
                                var info = "<p class=\"" + aclass + "\">" + text + "</p>";
                            }  
                        ListAttr = ListAttr + info;																				
                }
                if(type=='slider') {
                    ListAttr = ListAttr + '</div>';
                }
var attributes = Array();				
attributes['active'] = "1";
attributes['count'] = count;
attributes['info'] = ListAttr;
//msg(ListAttr);
return attributes;
}