/********************************************************************************
 * @brief                                                                       *
 *      HTML build functions...                                                 *
 *                                                                              *
 * @author                                                                      *
 *      Bill Sears\n                                                            *
 *      Aceso\n                                                                 *
 *      http://www.aceso.com\n                                                  *
 *                                                                              *
 * @modified                                                                    *
 *      Tami Seago, 02/05/2013, add info and error handling                     *
 ********************************************************************************/
function initIndexHTML()    {
    
    var kookies     = '';
    var secondary   = '';
    var tertiary    = '';
    var watchtv     = '';
 
    kookies = kookies+' <!-- panel cookies -->';
    kookies = kookies+' <div id="K_panel"></div>';
    kookies = kookies+' <div id="K_subpanel"></div>';
    kookies = kookies+' <!-- secondary choice cookies -->';
    kookies = kookies+' <div id="K_choice"></div>';
    kookies = kookies+' <div id="K_choicefirst"></div>';
    kookies = kookies+' <!-- secondary selection cookies -->';
    kookies = kookies+' <div id="K_selection"></div>';
    kookies = kookies+' <div id="K_selectionfirst"></div>';
    kookies = kookies+' <!-- tertiary controls cookies -->';
    kookies = kookies+' <div id="K_control"></div>';
    kookies = kookies+' <div id="K_controlfirst"></div>';   
    kookies = kookies+' <!-- slider cookies -->';   
    kookies = kookies+' <div id="K_slider"></div>';
    kookies = kookies+' <div id="K_movie"></div>';
    kookies = kookies+' <div id="K_carousel"></div>';
    kookies = kookies+' <div id="K_carouseltotal"></div>';  
    kookies = kookies+' <div id="K_carouselpages"></div>';  
    kookies = kookies+' <div id="K_carouselcurrentpage"></div>';    
    kookies = kookies+' <!-- json object cookies -->';
    kookies = kookies+' <div id="X_choices"></div>';    
    kookies = kookies+' <div id="X_selections"></div>';
    kookies = kookies+' <!-- panel cookies -->';
    kookies = kookies+' <div id="K_tomorrow"></div>';
    kookies = kookies+' <div id="K_today"></div>';
    kookies = kookies+' <div id="K_ymd"></div>';
    kookies = kookies+' <div id="K_firstchannel"></div>';
    kookies = kookies+' <div id="K_lastchannel"></div>';
    kookies = kookies+' <div id="K_grid"></div>';
    kookies = kookies+' <div id="K_gridactive"></div>';
    kookies = kookies+' <div id="K_gridpos"></div>';
    kookies = kookies+' <div id="K_handshake"></div>';
    kookies = kookies+' <div id="K_channel1"></div>';
    kookies = kookies+' <div id="K_channel2"></div>';
    kookies = kookies+' <div id="K_channel3"></div>';
    kookies = kookies+' <div id="K_channel4"></div>';           
    kookies = kookies+' <div id="K_channel5"></div>';
    kookies = kookies+' <div id="K_channel6"></div>';           
    kookies = kookies+' <div id="K_channel7"></div>';           
    kookies = kookies+' <div id="K_timebeg"></div>';
    kookies = kookies+' <div id="K_timeend"></div>';
    kookies = kookies+' <!-- power cookies -->';
    kookies = kookies+' <div id="K_power"></div>';
    kookies = kookies+' <!-- digit keys cookies -->';
    kookies = kookies+' <div id="K_key"></div>';
    kookies = kookies+' <div id="K_keycheck"></div>';
    kookies = kookies+' <div id="K_inactivity"></div>';
    
    var indexHTML = Array();
    indexHTML['kookies']    = kookies;
    
    return indexHTML;
}

function getSubmenuHTML(menu)   {
    var submenu = getMenu(menu);
    var menuitems = '';
    var submenufirst = '';
    var submenulabel = '';
    var submenuimage = '';
    var submenucurr  = '';
    var submenucurrl = '';
    var submenucurrp = '';
    var submenunext  = 'back';
    var submenuprev  = 'back';
    var data;
    var menucount = 0;
    data = submenu[menu];
    
    if (!jQuery.isArray(data))  { data = [data];}
    
    $.each(data, function(i,row) {
        if(typeof (row) != 'undefined') {
            if (i==0)   {
                submenucurr  = row["tag"];
                submenucurrl = row["label"];
                submenucurrp = row["image"];
            }   else    {
                menuitems = menuitems+'<a id="submenuitem" class="'+submenucurr+'" rev="'+submenuprev+'" rel="'+row["tag"]+'" title="'+submenucurrp+'" ><span class="">'+submenucurrl+'</span></a>';
                submenuprev  = submenucurr;
                submenucurr  = row["tag"];
                submenucurrl = row["label"];
                submenucurrp = row["image"];
            }   
            if (submenufirst=='')   {
                submenufirst = row["tag"];
                submenulabel = row["label"];
            }
        }
        menucount=i;
    });
    if (typeof (submenucurr) != 'undefined') {
        menuitems = menuitems+'<a id="submenuitem" class="'+submenucurr+'" rev="'+submenuprev+'" rel="'+submenunext+'" title="'+submenucurrp+'" ><span class="">'+submenucurrl+'</span></a>';
    }
    //alert(menucount);
    for (var id=menucount; id<5; id++)
    {
        menuitems = menuitems+'<a id="submenuitem" class="" rev="" rel="" title="" ></a>';
    }
    menuitems = menuitems+'<a id="submenuitem" class="back" style="display:none" rev="'+submenucurr+'" rel="'+submenufirst+'" title="" ><span class="back">< BACK</span></a>';
    
    var submenuimage = '';
    submenuimage = submenuimage+'<div id="mainpanel">';
    data = submenu.attr;
    if (!jQuery.isArray(data))  {data = [data];}
    $.each(data, function(i,row){
            submenuimage  = submenuimage + row;
            
    });
    submenuimage = submenuimage+'</div><!-- #mainpanel -->';
    
    var submenuHTML = Array();
    submenuHTML['submenu']      = menu;
    submenuHTML['menuitems']    = menuitems;
    submenuHTML['submenufirst'] = submenufirst;
    submenuHTML['submenulabel'] = submenulabel;
    submenuHTML['submenuimage'] = submenuimage;
    if(menu=='childrenshospital') {
        submenuHTML['background'] = 'childrenshospital';
    }
    
    return submenuHTML; 
}
function getLevelOneHTML(choice,choicelast) {
    //msg('choice ' + choice);
    var submenu = $("#K_submenu").attr("class");
    var amenu = $("#K_menu").attr("class");
    var choicestart     = 0;
    var choicetotal     = 0;
    var choicecapacity  = 6;
    var data;
msg('getlevelonehtml ' +amenu + ' ' + submenu);
    if (choicelast) {
        var options = getLevelOne(amenu,choice);
        data = options[choice];
        if (!jQuery.isArray(data))  { data = [data];}
        $.each(data, function(i,row){
            if(choicelast==row["tag"])  {
                choicestart = i+1;
            }
            choicetotal++;
        });
        if(choicestart==choicetotal)    {
            choicestart = 0;
        }
        if (choicetotal > choicecapacity)
            var scrolling = true;       
    }   else    {
    
            var options = getLevelOne(amenu,choice);
                saveJSON('JSON_choices',options);
                var jsonText = JSON.stringify(options);
            // if no menu to process, run nomenu function and return
            if (options.type=='nomenu') {
                var choicesHTML = getNOMENU(options);   
                return choicesHTML;
            }   else
            // if grid, retrieve grid and return
            if (options.type=='grid')   {
                var choicesHTML = getGRID(options);
                return choicesHTML;
            }   
            
            //------
            data = options[choice];
            if (!jQuery.isArray(data))  { data = [data];}
            $.each(data, function(i,row){
                choicetotal++;
            }); 
            if (choicetotal > choicecapacity)
                var scrolling = true;   
            //saveJSON('JSON_choices',options);
        }
    
    var choicetype  = options.type;
    var choices     = '';
    var choicecount = choicecapacity;
    var choicefirst = '';
    var choicelabel = '';
    var choiceimage = '';
    var choicecurr  = '';       // current tag
    var choicecurrl = '';       // current label
    var choicecurrp = '';       // current image
    var choicenext  = 'back';
    if (scrolling)
        choicenext  = 'more';
    var choiceprev  = 'back';
    if(amenu=='childrenshospital') {
        background = 'childrenshospital';
    } else {
        background  = options.background;
    }
    data = options[choice];
    
    if (!jQuery.isArray(data))  { data = [data];}
    $.each(data, function(i,row){    
        if (i >= choicestart && choicecount > 0)    {
            
            if (i==choicestart) {
                choicecurr  = row["tag"];
                choicecurrp = row["image"];
                    var objtype = checkObj(row["label"]);
                
                if(objtype != 'undefined') {                
                    choicecurrl = row["label"];
                } else {
                        choicecurrl = ' ';
                }
            }   else    {
                
                    choices = choices+'<a id="choice" class="'+choicecurr+'" rev="'+choiceprev+'" rel="'+row["tag"]+'" title="'+choicecurrp+'" ><span class="'+choicecurr+'">'+choicecurrl+'</span></a>';
                    choiceprev  = choicecurr;
                    choicecurr  = row["tag"];
                    
                    choicecurrp = row["image"];
                                    var objtype = checkObj(row["label"]);
                if(objtype != 'undefined') {                
                    choicecurrl = row["label"];
                } else {
                        choicecurrl = ' ';
                }
                }
            choicecount--;
            if (choicefirst=='')    {
                choicefirst = row["tag"];
                if (row["image"]>'')
                    choiceimage = '<img src="images/'+row["image"]+'" />';
                choicelabel = row["label"];
            }
        }
        
    });
    
    choices = choices+'<a id="choice" class="'+choicecurr+'" rev="'+choiceprev+'" rel="'+choicenext+'" title="'+choicecurrp+'" ><span class="'+choicecurr+'">'+choicecurrl+'</span></a>';
    choiceimage = choiceimage+'<div id="comments">';
    var attr = '';
    data = options.attr;
    if (!jQuery.isArray(data))  {data = [data];}
    $.each(data, function(i,row){
            attr  = attr + row;
    });
    
        
    var i=0;
    
    if (scrolling)  {
        choices = '<a id="choice" class="more" rev="'+choicecurr+'" rel="back" title="" ><span class="more">More &gt;</span></a>'+choices;
        choices = '<a id="choice" class="back" rev="more" rel="'+choicefirst+'" title="" ><span class="back">BACK</span></a>'+choices;
    }   else    {
        if(choice=="goinghome") {
            choices = '<a id="choice" class="back" rev="no" rel="'+choicefirst+'" title="" ><span class="back">BACK</span></a>'+choices;
        } else {
            choices = '<a id="choice" class="back" rev="'+choicecurr+'" rel="'+choicefirst+'" title="" ><span class="back">BACK</span></a>'+choices;
        }
        }
    
    choices = '<div id="choices">'+choices+'</div><!-- #choicepanel -->';
    
    var choicesHTML = Array();
    
    choicesHTML['choice']      = choice;
    choicesHTML['choicetype']  = choicetype;
    choicesHTML['choices']     = choices;
    choicesHTML['choicefirst'] = choicefirst;
    choicesHTML['choicelabel'] = choicelabel;
    choicesHTML['choiceimage'] = choiceimage;
    choicesHTML['background']  = background;
    choicesHTML['choicepanel'] = choicefirst;
    choicesHTML['attr'] = attr;
    return choicesHTML; 
}
function getNOMENU(options) {
    
    var choices     = '';
    choices = choices+'<p>'+options.message+'</p>';
    choices = choices+'<a id="choice" class="back" rev="back" rel="back" title="" ><span class="back">BACK</span></a>';
    
    var choicesHTML = Array();
    
    choicesHTML['choicetype']  = options.type;
    choicesHTML['choices']     = choices;
    choicesHTML['choicefirst'] = 'back';
    choicesHTML['choicelabel'] = '';
    choicesHTML['background']  = options.background;
    choicesHTML['choicepanel'] = options.tag;
    return choicesHTML;     
}
function getGRID(options)   {
    
    var choices     = '';
    choices = choices+'<p>&nbsp;</p>';
    choices = choices+'<a id="choice" class="back" rev="back" rel="back" title="" ><span class="back">BACK</span></a>';
    
    var choicesHTML = Array();
    
    choicesHTML['choicetype']  = options.type;
    choicesHTML['choices']     = choices;
    choicesHTML['choicefirst'] = 'back';
    choicesHTML['choicelabel'] = '';
    choicesHTML['background']  = options.background;
    choicesHTML['choicepanel'] = options.tag;
    return choicesHTML;     
}
function getLevelTwoHTML(choice)    {
    
    var selections = getSelections(choice);
    
    var bookmark = '<img class="checkmark" src="images/checkmark_dkblue.png" />';
    var bm       = '';
    var data;
    
    var choicecount = 6;
    var choicelist = '';
    //choicelist = choicelist+' <div id="choicepanel4">';
    
    data = selections[choice];
    
    if (!jQuery.isArray(data))  { data = [data];}
    $.each(data, function(i,row){   
        //alert(row["label"]);
        if (row["bookmark"]) 
            bm = bookmark;
            if (choicecount > 0)    {
            choicelist = choicelist+'       <p>'+bm+row["label"]+'</p>';
            choicecount--;
        }
        bm = '';
    }); 
    choicelist = choicelist+'   </div><!-- #choicelist -->';
    //choicelist = choicelist+' <div id="choicepanel3">&nbsp;</div><!-- #choicepanel3 -->'; 
    //choicelist = choicelist+' <div id="choicepanel3">&nbsp;</div><!-- #choicepanel3 -->';
    //choicelist = choicelist+' <div id="choicepanel4"></div><!-- #choicepanel4 -->';
    
    choicelist = '<div id="choicepanel4">'+choicelist+'</div><!-- #choicepanel -->';
            
    var choiceHTML = Array();
    choiceHTML['choice']      = choice;
    choiceHTML['choicelist']  = choicelist;
    return choiceHTML;  
}
function getInfoHTML(options)   {
    
    var info    = '';
    info = info+'<p class="panelinfo">'+options.content+'</p>';
    
    info = '<div id="choicepanel">'+info+'</div><!-- #choicepanel -->';
    
    var infoHTML = Array();
    
    infoHTML['background']  = options.background;
    infoHTML['choicepanel'] = info;
    return infoHTML;            
    
}
function getInfoHTML(options)   {
    
    var info    = '';
    info = info+'<p class="panelinfo">'+options.content+'</p>';
    
    info = '<div id="choicepanel">'+info+'</div><!-- #choicepanel -->';
    
    var infoHTML = Array();
    
    infoHTML['background']  = options.background;
    infoHTML['choicepanel'] = info;
    return infoHTML;            
    
}
function getPageHTML(options)   {
    //msg(options.type);
    var info    = '';
    var type = options.type;
    //msg(options.count);
    if(type=='page') {
    info = '<div id="pagepanel">'+options.attr+'</div><!-- #pagepanel -->';
    } else {
    info = '<div id="slides">'+options.attr+'</div><!-- #slides -->';
    
    }
    var pageHTML = Array();
    
    pageHTML['choicepanel'] = info;
    pageHTML['count'] = options.count;
    pageHTML['active'] = options.active;
    
    return pageHTML;            
    
}
function getCommentsHTML()  {
    var submenu = $("#K_submenu").attr("class");
    comments = '<div id="pagepanel">'
    
    if(submenu == 'myprograms') {
        comments = comments + '<p class = "title">Learn about your health</p>';
        comments = comments + '<p class = "text4">These videos have been been prescribed <br/>specifically for you by your Care Team.<br/><br/>Press SELECT to play this video.  Use your<br/>Remote Control to Play/Pause/Stop the Video</p>'  ;
        comments = comments + '<img class="image3" src="./images/fa_img_educ_myvids.jpg"></div>'
    }
    if(submenu == 'secondary') {
        comments = comments + '<p class = "title">Learn about your health</p>';
        comments = comments + '<p class = "text4">These videos have been been prescribed <br/>specifically for you by your Care Team.<br/><br/>Press SELECT to play this video.  Use your<br/>Remote Control to Play/Pause/Stop the Video</p>'  ;
        comments = comments + '<img class="image3" src="./images/fa_img_educ_myvids.jpg"></div>'
    }
    
    if(submenu == 'allprograms') {
        comments = comments + '<p class = "title5">Press SELECT to play this Video,<br/>Down for More, Left to go Back</p>'
        comments = comments + '<img class="image23" src="./images/fa_img_educ_myvids.jpg"></div>'
    }
    
    
    var commentsHTML = Array();
    commentsHTML['choicepanel'] = comments;
    return commentsHTML;            
}
function getImageHTML(choice,options)   {
    
    var image   = '';
    var headtab     = '';
    
    if (choice=='campusmap'||choice=='firstfloor')  {
        var youarein = $("#primary #header #patient p.youarein").text();
        image = image+'<p class="panelimage">'+youarein+'<br />';
        image = image+'<img src="./images/'+options.source+'" />';
        image = image+'</p>';       
    }   
    var imageHTML = Array();
    
    imageHTML['choicepanel'] = image;
    
    return imageHTML;           
    
}
function getCarouselHTML(choice)    {
//msg('choice ' + choice);
    var ewf = ewfObject();
    var carouseltotal = 0;
    
    var selections = getSelections(choice);
    var data;
    data = selections[choice];
    if (!jQuery.isArray(data))  { data = [data];}
    $.each(data, function(i,row){
        carouseltotal++;
    }); 
    
    var carouselPOS = Array();
    carouselPOS[0] = 'currentx';
    carouselPOS[1] = 'currentx';
    carouselPOS[2] = 'currentx';
    var carouselSTYLE = Array();
    carouselSTYLE[0] = 'height: 310px; width: 225px; margin: 45px 15px 15px 15px; display: block; padding: 15px 15px 1px 15px; ';
    carouselSTYLE[1] = 'height: 310px; width: 225px; margin: 45px 15px 15px 15px; display: block; padding: 15px 15px 1px 15px; ';
    carouselSTYLE[2] = 'height: 310px; width: 225px; margin: 45px 15px 15px 15px; display: block; padding: 15px 15px 1px 15px; ';
    
    var carousellimit = 3;
    var id            = 0;
    var x             = 0;
    var carousel      = '';
    var page          = 1;
    var pagetotal = 0;
    var panelD  = 'block';
    
    carousel = carousel+'   <div id="carousel">';
    carousel = carousel + '<p class = "title">Use Up/Down to Select a Category and Left/Right to scroll the Movies.</p>'
    carousel = carousel +'<div id="leftarrow"></div>';
    carousel = carousel +'<div id="rightarrow"></div>';
    carousel = carousel+'       <div id="carouselTitle"><p>title goes here</p></div>';
    carousel = carousel+'       <div id="carouselOverlay"></div>';  
    carousel = carousel+'       <div id="carouselPosters" class="page'+page+'" style="display: '+panelD+'";>';
    data = selections[choice];
    if (!jQuery.isArray(data))  { data = [data];}
    if(carouseltotal > 0) {
        $.each(data, function(i,row){                                           
            id++
            
            var img = new Image();      
            //var posterimage = ewf.Poster + row["poster"];
            var posterimage = row["poster"];
            if(i%3 == 0) {
                x = 0; 
            } else {
                x++
            }   
            //carousel = carousel+' <img id="'+id+'" class="'+carouselPOS[x]+'" style="'+carouselSTYLE[x]+'" title="'+row["label"]+'" alt="'+row["tag"]+'" src="'+posterimage + '" />';
            carousel = carousel+'   <img id="'+id+'" class="'+carouselPOS[x]+'" title="'+row["label"]+'" alt="'+row["tag"]+'" src="'+posterimage + '" />';
            if (id%carousellimit == 0) {
                carousel = carousel+'       </div>';
                page++
                if(page > 1) {
                    panelD  = 'none';
                    }
                
                if(id != carouseltotal) { 
                    carousel = carousel+'       <div id="carouselPosters" class="page'+page+'" style="display: '+panelD+'";>';
                    pagetotal = page;
                }
                x = 0;              
            }       
        
        });
    }
    
    carousel = carousel+'       </div>';
                 
    
    var carouselHTML = Array();
    carouselHTML['choice']          = choice;
    carouselHTML['carousel']        = carousel;
    carouselHTML['total']           = carouseltotal;
    carouselHTML['pages']           = pagetotal;
    
    
    return carouselHTML;    
}
function getSlidesHTML(options) {
var jsonText = JSON.stringify(options);
    var count   = options.panels;
    
    var active  = 1;
    var sliders = '';
    var headtab = '';
    var image   = '';
    var columns = 0;
    var slide   = 0;
    var panelD  = 'block';
    var dischargelist = '';
    var data;
    
    sliders = sliders+'<div id="slides">';
    
    if (count>0)    {
        
        data = options.slides;
        if (!jQuery.isArray(data))  { data = [data];}
        $.each(data, function(i,row){
            slide = i+1;
            columns = row["columns"];
            sliders = sliders+' <div id="slide" class="slide'+slide+'" style="display: '+panelD+'";>';
            if (row["title"]>'') {
                        sliders = sliders+'     <p class="title">'+row["title"]+'</p>';         
            }
            if (columns==2) {
                sliders = sliders+'     <p class="column1">'+row["column1"]+'</p>';
                sliders = sliders+'     <p class="column2">'+row["column2"]+'</p>';
            }   else
            if (columns==1) {
                    sliders = sliders+'     <p class="column">'+row["column"]+'</p>';
            }   else
            if (columns==0) {
                image   = '';
                if (row["image"]>'')                    
                    image   = '<img src="./images/'+row["image"]+'" />';                
                    sliders = sliders+'     <p class="shops">'+image+row["column"]+'</p>';
            }       
            sliders = sliders+' </div>';
            panelD = 'none';
        }); 
        
            
    }   else
    if (count==0)   {
        data = options.slides;
        if (!jQuery.isArray(data))  { data = [data];}
        
        $.each(data, function(i,row){
            sliders = sliders+' <div id="slide">';
            if (row["title"]>'')
                sliders = sliders+'     <p class="title">'+row["title"]+'</p>';
            sliders = sliders+'     <p class="panel">'+row["column"]+'</p>';
            sliders = sliders+' </div>';    
        }); 
    }   else    {
    
    }
    
    sliders = sliders+'</div>';
    
    var slidesHTML = Array();
    
    slidesHTML['count']   = count;
    slidesHTML['active']  = active;
    slidesHTML['sliders'] = sliders;
    
    return slidesHTML;
}
function getVideoHTML(options)  {
    
    var submenu      = $("#K_submenu").attr("class");
    var menulabel    = '<p class="menu">'+$("#K_menu").text()+'</p>';
    var submenulabel = '<p class="submenu">'+$("#K_submenu").text()+'</p>';
    var choicelabel  = $("#K_choice").text();
    var controls     = '';
    var controlfirst = 'play';
    var controllabel = 'PLAY VIDEO';
    if (submenu=='allprograms') {
        var controlfirst = 'bookmark';
        var controllabel = 'BOOKMARK';
        var duration     = options.duration;
    }   else
    if (submenu=='myprograms')  {
        var selection = allprogramsSELECTION(options.tag);
        var duration  = selection.duration;
        var controlfirst = 'play';
        var controllabel = 'PLAY';      
    }       
    var controlimage = '<div id="pagepanel"> <p class = "title2">Use your remote control<br/>to pause/rewind</p>';
    controlimage = controlimage + '<img class="image3" src="./images/fa_img_educ_myvids.jpg"></div> '
    controlimage = controlimage + '<div id="comments"><p>' + options.synopsis + ' </p></div>';
    
    controls = controls+'<p id="control" class="title">'+options.title+'</p>';
    controls = controls+'<p id="control" class="duration">'+duration+' minutes</p>';
    controls = controls+'<p id="control" >&nbsp;</p>';
    if (submenu=='allprograms') {
        controls = controls+'<a id="control" class="bookmark" rev="back" rel="play" title="" ><span class="bookmark">BOOKMARK</span></a>';
        controls = controls+'<a id="control" class="play" rev="bookmark" rel="back" title="" ><span class="play">PLAY VIDEO</span></a>';
        controls = controls+'<a id="control" class="back" rev="play" rel="bookmark" title="" ><span class="back">BACK</span></a>';
    }   else
    if (submenu=='myprograms')  {
        controls = controls+'<p id="control" >&nbsp;</p>';
        controls = controls+'<a id="control" class="play" rev="remove" rel="back" title="" ><span class="play">PLAY VIDEO</span></a>';
        controls = controls+'<a id="control" class="back" rev="play" rel="remove" title="" ><span class="back">BACK</span></a>';
    }   
    
    var videoHTML = Array();
    videoHTML['source']         = options.source;
    videoHTML['menulabel']      = menulabel;    
    videoHTML['submenulabel']   = submenulabel; 
    videoHTML['controlfirst']   = controlfirst; 
    videoHTML['controllabel']   = controllabel;     
    videoHTML['controls']       = controls;
    videoHTML['controlimage']   = controlimage;
    
    return videoHTML;       
}
function getMovieHTML() {
    
    var ewf = ewfObject();
    
    var choice      = $("#K_choice").attr("class");
    var choicelabel = $("#K_choice").text();
    
    var selection   = $("#K_selection").attr("class");
    
    var controls     = '';
    var controlfirst = 'play';
    var controllabel = 'WATCH NOW';
    var data;
    
    controls = controls+'<p id="control" class="choice">'+choicelabel+'</p>';
    controls = controls+'<p id="control" >&nbsp;</p>';
    controls = controls+'<p id="control" >&nbsp;</p>';
    controls = controls+'<p id="control" >&nbsp;</p>';
    controls = controls+'<a id="control" class="play" rev="back" rel="back" title="panel.png" ><span class="play">WATCH NOW</span></a>';
    controls = controls+'<a id="control" class="back" rev="play" rel="play" title="panel.png" ><span class="back">BACK</span></a>';
    var count  = 0;                 //number of movies
    var movies = Array();
        
    var selections = getSelections(choice);
    data = selections[choice];
    if (!jQuery.isArray(data))  { data = [data];}
    $.each(data, function(i,row){
        movies[i] = row["tag"];
        count++;
    }); 
    count--;
    
    var movieprev = '';     // first movie
    var movienext  = '';    // last movie
    
    var movie   = '';
    movie = movie+'<p class="title">Use Left/Right to scroll the Movies</p>'
    movie = movie+'<p class="border"> </p>';
    
    var shrink  = 'display: none;';
    var normal  = 'display: block;';
    var style   = shrink;
    var y = 0;                      // loop
    for (y=0; y<=count; y++)    {
        var options  = getLevelTwo(movies[y]);
        
        if (movies[y]==selection)   {
            style = normal;
        }
            
        // determine position of prev movie 
        p = y; p--;
        if (p < 0)
            p = 0;
        // determine position of next movie
        n = y; n++;
        if (n > count)
            n = y;
    
        
        movie = movie+' <div id="movie" class="'+movies[y]+'" style="'+style+'">';
        //movie = movie+'<hr size="10" color="516984" width="400" >';
        movie = movie+' <p id="prev" class="'+movies[y]+'" title="'+movies[p]+'" style="display: none; ">';
        movie = movie+' <p id="next" class="'+movies[y]+'" title="'+movies[n]+'" style="display: none; ">';
        //var posterimage = ewf.Poster + options.poster;    
        var posterimage =  options.poster;  
        
        movie = movie+' <p class="poster"><img alt="'+options.title+'" src="'+posterimage + '"/></p>';
        movie = movie+' <p class="title">'+options.title+'</p>';
        movie = movie+' <p class="rating">Rated '+options.rating+'</p>';
        movie = movie+' <p class="duration">'+options.duration+' minutes</p>';
        movie = movie+' <p class="synop">'+options.synopsis+'</p>';
        movie = movie+' </div><!-- #movie -->'; 
        
        style = shrink;
    }
    movie = movie+'<img class="leftarrow"  src="./images/arrow_left-green.png"/>';
    movie = movie+'<img class="rightarrow"  src="./images/arrow_right-green.png"/>';
    
    var title = '   <div id="pagepanel"><p>Use Left/Right right arrows keys</p><p>to scroll the movies</p></div>';
    var movieHTML = Array();
    movieHTML['source']         = options.source;   
    movieHTML['controlfirst']   = controlfirst; 
    movieHTML['controllabel']   = controllabel;     
    movieHTML['controls']       = controls;
    movieHTML['selection']      = selection;
    movieHTML['movie']          = movie;    
    movieHTML['title']          = title;    
    return movieHTML;   
}
function getSelectionsHTML(selection,selectionlast,direction)   {
    var selectionstart = 0;
    var selectiontotal = 0;
    
    var panels = getSelections(selection);
    var data;
    if (selectionlast)  {
        data = panels[selection];
        if (!jQuery.isArray(data))  { data = [data];}
        if(direction=='UP') {
        $.each(data, function(i,row){
            if(selectionlast==row["tag"])   {
                selectionstart = i-6;
            }
            selectiontotal++;
        }); 
        } else {
                $.each(data, function(i,row){
                if(selectionlast==row["tag"])   {
                    selectionstart = i+1;
                }
                selectiontotal++;
        }); 
        }
        if(selectionstart==selectiontotal)  {
            selectionstart = 0;
        }
        
        if(selectionstart==selectiontotal)  {
            selectionstart = 0;
        }
        
    }
    
    var choicelist     = '';
    var selections     = '';
    
    var selectioncount = 6;
    var selectionfirst = '';
    var selectionlabel = '';
    var selectioncurr  = '';
    var selectioncurrl = '';
    var selectioncurrb = '';
    var selectionnext  = 'more';
    var selectionprev  = 'prev';
    var bookmark       = '<img class="checkmark" src="images/checkmark_dkblue.png" />';
    var bm             = '';
    
    
    data = panels[selection];
    if (!jQuery.isArray(data))  { data = [data];}
    $.each(data, function(i,row){
        if (row["bookmark"]) 
            bm = bookmark;      
            
        if (i >= selectionstart && selectioncount > 0)  {
            if (i==selectionstart)  {
                selectioncurr  = row["tag"];
                selectioncurrl = row["label"];
                selectioncurrb = bm;
            }   else    {
                    choicelist = choicelist+'       <p>'+selectioncurrb+selectioncurrl+'</p>';
                    selections = selections+'<a id="selection" class="'+selectioncurr+'" rev="'+selectionprev+'" rel="'+row["tag"]+'" ><span class="'+selectioncurr+'">'+selectioncurrb+selectioncurrl+'</span></a>';
                    selectionprev  = selectioncurr;
                    selectioncurr  = row["tag"];
                    selectioncurrl = row["label"];
                    selectioncurrb = bm;
                }
            selectioncount--;
            if (selectionfirst=='') {
                selectionfirst = row["tag"];
                selectionlabel = row["label"];
            }
        }
        bm = '';
    }); 
    choicelist = choicelist+'       <p>'+selectioncurrl+'</p>';
    
    selections = selections+'<a id="selection" class="'+selectioncurr+'" rev="'+selectionprev+'" rel="'+selectionnext+'" ><span class="'+selectioncurr+'">'+selectioncurrb+selectioncurrl+'</span></a>'
    
    var i=0;
//  for (i=1;i<=selectioncount;i++) {
//      selections = selections+'<a id="selection" class="filler" rev="" rel="" ><span class="filler">&nbsp;</span></a>';
//  }   
    selections = '<div id="choicepanel"><div id="choicepanel4">'+selections+'</div></div><!-- #choicepanel -->';
    
    var selectionsHTML = Array();
    
    selectionsHTML['choicelist']     = choicelist;
    selectionsHTML['selection']      = selection;
    selectionsHTML['selections']     = selections;
    selectionsHTML['selectionfirst'] = selectionfirst;
    selectionsHTML['selectionlabel'] = selectionlabel;
    return selectionsHTML;
}