/**
 * @fileOverview Enseo Nimbus Scroller Javascript API
 * <p><b>Copyright (c) Enseo, Inc. 2008-2010
 *
 * This material contains trade secrets and proprietary information
 * and	may not	 be used, copied, disclosed or	distributed	 except
 * pursuant to	a license from Enseo, Inc. Use of copyright notice
 * does not imply publication or disclosure.</b>
 */

////////////////////////////////////////////////////////////////////////
//
// Reference   : $Source: /cvsroot/calica/apps/rootfs_common/root/usr/bin/data/html/js/enseo_scroller.js,v $
//
// Revision	   : $Revision: 1.5.4.1 $
//
// Date		   : $Date: 2011-03-25 16:06:47 $
//
// Description : Nimbus Scroller javascript API.
//
////////////////////////////////////////////////////////////////////////

/**
 * Gets an interface for creating and control of a Scroller object.
 * 
 * @return {Nimbus.Scroller} Instance of the Nimbus.Scroller
 * interface, or null if the object could not be created
 *
 * @param {String}  type    Scroller type, must be one of: rtf, text, or image
 */

Nimbus.getScroller = function(type){

	// Create a new browser window class
	var win = new Nimbus.Scroller(type);
	if (win != null) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getScroller");
	}
	return win;
};

/**
 * Interface for creating and controlling a Scroller.  A scrolling
 * surface can be created to scroll Rich Test Format (RTF), Text, 
 * or image files
 *
 * @param {String}  type    Scroller type, must be one of: rtf, text, or image
 * 
 * @class
 */

Nimbus.Scroller = function(type){
	// Create a browser window object
	this.ScrollerObj = new EONimbusScroller(type);
	this.ID = this.ScrollerObj.GetID();
	Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.Scroller constructor, ID= " + this.ID);
};

/**
 * Get the Scroller ID.
 * 
 * @return {Number} ID
 * 
 */

Nimbus.Scroller.prototype.getID = function(){
	if (this.ScrollerObj == null) {
		return 0;
	}
	return this.ID;
};

/**
* Set Scroller parameters common to RTF, Text and Image types.
* 
* @param {Number}  x        Window x position
* @param {Number}  y        Window y position
* @param {Number}  width    Window width
* @param {Number}  height   Window height
* @param {Number}  Opacity (0-255)
* @param {Number}  HorizontalStep (see below)
* @param {Number}  VerticalStep (see below)
* @param {Number}  TimingStep (see below)
* @param {Number}  ColorKeyRed
* @param {Number}  ColorKeyGreen
* @param {Number}  ColorKeyBlue
* @param {Boolean} EnableColorKey
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.setCommonParameters =  function(   
        x, y, width, height,
        Opacity,
        HorizontalStep, VerticalStep, TimingStep,
        ColorKeyRed, ColorKeyGreen, ColorKeyBlue, 
        bEnableColorKey
    )
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.SetCommonParameters(
        x, y, width, height,
        Opacity,
        HorizontalStep, VerticalStep, TimingStep,
        ColorKeyRed, ColorKeyGreen, ColorKeyBlue, 
        bEnableColorKey);
};

/**
* Set Scroller window position and size.
* 
* @param {Number}  x        Window x position
* @param {Number}  y        Window y position
* @param {Number}  width    Window width
* @param {Number}  height   Window height
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.setRect = function(x, y, width, height)
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.SetRect(x, y, width, height);
};

/**
* Set Scroller opacity.
* 
* @param {Number}  Opacity (0-255)
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.setOpacity = function(Opacity)
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.SetOpacity(Opacity);
};

/**
* Sets Scroller step in terms of the number of horizontal pixels to
* move per scroller step.  A positive value indicates that scroller
* movement is left-ward, a negative value indicates right-ward.  This
* value should be zero if the scroller is moving vertically.
* 
* @param {Number}  HorizontalStep
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.setHorizontalStep = function(HorizontalStep)
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.SetHorizontalStep(HorizontalStep);
};

/**
* Sets Scroller step in terms of the number of vertical lines to move
* per scroller step.  A positive value indicates that scroller
* movement is upward, a negative value indicates downward.  This value
* should be zero if the scroller is moving horizontally.
* 
* @param {Number}  VerticalStep
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.setVerticalStep = function(VerticalStep)
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.SetVerticalStep(VerticalStep);
};

/**
* Set Scroller update/step frequency as a multiple of a nominal unit of time.
* This value should be set to 0 for stationary - i.e. no ticker updates.
* 1 indicates the greatest step frequency (roughly once every 1/35 seconds).
* 2 indicates half the greatest frequency.
* 3 indicates 1/3 greatest frequency.
* etc
* 
* @param {Number}  TimingStep
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.setTimingStep = function(TimingStep)
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.SetTimingStep(TimingStep);
};

/**
* Set Scroller ColorKey value.
* 
* @param {Number}  ColorKeyRed
* @param {Number}  ColorKeyGreen
* @param {Number}  ColorKeyBlue
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.setColorKey = function(ColorKeyRed, ColorKeyGreen, ColorKeyBlue)
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.SetColorKey(ColorKeyRed, ColorKeyGreen, ColorKeyBlue);
};

/**
* Set Scroller ColorKey enable.
* 
* @param {Boolean} bEnableColorKey
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.enableColorKey = function(bEnableColorKey)
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.EnableColorKey(bEnableColorKey);
};

/**
* Sets Scroller Text parameters
* 
* @param {String}  FontName (see note below regarding font name)
* @param {Number}  FontSize (see below)
* @param {Number}  TextColorRed
* @param {Number}  TextColorGreen
* @param {Number}  TextColorBlue
* @param {Number}  MarginLeft
* @param {Number}  MarginRight
* @param {Number}  MarginTop
* @param {Number}  MarginBottom
* @param {Number}  BGColorRed
* @param {Number}  BGColorGreen
* @param {Number}  BGColorBlue
* @param {String}  Content
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.setTextParameters = function(
        FontName, FontSize,
        TextColorRed, TextColorGreen, TextColorBlue,
        MarginLeft, MarginRight, MarginTop, MarginBottom,
        BGColorRed, BGColorGreen, BGColorBlue,
        Content
    )
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.SetTextParameters(
            FontName, FontSize,
            TextColorRed, TextColorGreen, TextColorBlue,
            MarginLeft, MarginRight, MarginTop, MarginBottom,
            BGColorRed, BGColorGreen, BGColorBlue,
            Content);
};

/**
* Sets Scroller font name.
*
* Allowable values: Arial, Times New Roman and Courier.
*
* These names are used for 'historical' reasons - the actual font used
* will be a approximate substitute for the requested font (e.g. "Times
* New Roman" selects a variable width serif font, "Courier" selects a
* monospace serif font, "Arial" selects a variable width sans serif
* font).
*
* @param {String}  FontName
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.setTextFontName = function(FontName)
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.SetTextFontName(FontName);
};

/**
* Set Scroller Text font size.  This size is the approximate font
* height in pixels.
* 
* @param {Number}  FontSize
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.setTextFontSize = function(FontSize)
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.SetTextFontSize(FontSize);
};

/**
* Set Scroller Text color.
* 
* @param {Number}  TextColorRed (0-255)
* @param {Number}  TextColorGreen (0-255)
* @param {Number}  TextColorBlue (0-255)
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.setTextColor = function(TextColorRed, TextColorGreen, TextColorBlue)
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.SetTextColor(TextColorRed, TextColorGreen, TextColorBlue);
};

/**
* Set Scroller Rich Text Format (RTF) parameters
* 
* @param {Number}  MarginLeft
* @param {Number}  MarginRight
* @param {Number}  MarginTop
* @param {Number}  MarginBottom
* @param {Number}  BGColorRed (0-255)
* @param {Number}  BGColorGreen (0-255)
* @param {Number}  BGColorBlue (0-255)
* @param {String}  Content (RTF String)
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.setRtfParameters = function(
        MarginLeft, MarginRight, MarginTop, MarginBottom,
        BGColorRed, BGColorGreen, BGColorBlue,
        Content
    )
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.SetRtfParameters(
            MarginLeft, MarginRight, MarginTop, MarginBottom,
            BGColorRed, BGColorGreen, BGColorBlue,
            Content);
};

/**
* Set Scroller margin (size of margin around Content)
* 
* @param {Number}  MarginLeft
* @param {Number}  MarginRight
* @param {Number}  MarginTop
* @param {Number}  MarginBottom
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.setMargin = function(MarginLeft, MarginRight, MarginTop, MarginBottom)
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.SetMargin(MarginLeft, MarginRight, MarginTop, MarginBottom);
};

/**
* Set Scroller background color.
* 
* @param {Number}  BGColorRed (0-255)
* @param {Number}  BGColorGreen (0-255)
* @param {Number}  BGColorBlue (0-255)
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.setBGColor = function(BGColorRed, BGColorGreen, BGColorBlue)
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.SetBGColor(BGColorRed, BGColorGreen, BGColorBlue);
};

/**
* Set Scroller content.  This method can be used to initialize the
* Content (RTF, Text or image) or can be used subsequently to update
* the Content 'on the fly'.  The Content should either be a RTF
* string, a simple Text string or the full path of a jpg image file.
* If updating, any pending text font or color parameter changes (see
* setFontName(), setFontSize(), setTextColor(), setBgColor()) will be
* applied in the case of a Text scroller and any pending background
* color changes will be applied in the case of an RTF scroller.
* SetContent() will cause the old content to scroll off whilst the new
* content scrolls on.  Note that the 'type' (RTF, Text or image) of
* the scroller content cannot be changed once set initially.
* 
* @param {String}  Content (RTF string, Text string, Image path)
*
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.setContent = function(Content)
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.SetContent(Content);
};

/**
* Start Scroller
* 
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.start = function()
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.Start();
};

/**
* Stop Scroller
* 
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.stop = function()
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    return this.ScrollerObj.Stop();
};

/**
* Close and delete a Scroller object.
* 
* @return {Boolean} True if successful
* 
*/

Nimbus.Scroller.prototype.close = function()
{
    if (this.ScrollerObj == null)
    {
        return false;
    }
    this.ScrollerObj.Close();
    delete this.ScrollerObj;
    this.ScrollerObj = null;

    return true;
};

/**********************************************************************************************
***********************************************************************************************
**********************************************************************************************/
