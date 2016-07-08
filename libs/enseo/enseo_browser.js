/**
 * @fileOverview Enseo Nimbus Browser Widget Javascript API
 * <p><b>Copyright (c) Enseo, Inc. 2008-2010
 *
 * This material contains trade secrets and proprietary information
 * and	may not	 be used, copied, disclosed or	distributed	 except
 * pursuant to	a license from Enseo, Inc. Use of copyright notice
 * does not imply publication or disclosure.</b>
 */

////////////////////////////////////////////////////////////////////////
//
// Reference   : $Source: /cvsroot/calica/apps/rootfs_common/root/usr/bin/data/html/js/enseo_browser.js,v $
//
// Revision	   : $Revision: 1.17 $
//
// Date		   : $Date: 2011-02-22 20:32:08 $
//
// Description : Nimbus Browser Widget javascript API.
//
////////////////////////////////////////////////////////////////////////

/**
 * Gets an interface for creating and controlling a browser window.
 * 
 * @return {Nimbus.BrowserWindow} Instance of the Nimbus.BrowserWindow interface, or null if the object could not be created
 */
 
Nimbus.getBrowserWindow = function(){

	// Create a new browser window class
	var win = new Nimbus.BrowserWindow(false);
	if (win != null) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getBrowserWindow");
	}
	return win;
};

/**
 * Gets an interface for controlling the main browser window where the Nimbus application is hosted.
 * 
 * @return {Nimbus.BrowserWindow} Instance of the Nimbus.BrowserWindow interface, or null if the object could not be created
 */
 
Nimbus.getNimbusBrowserWindow = function(){

	// Create a new browser window class
	var win = new Nimbus.BrowserWindow(true);
	if (win != null) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getBrowserWindow (main)");
	}
	return win;
};


/**
 * Class providing an interface for creating and controlling a browser window - use Nimbus.getNimbusBrowserWindow 
 * to obtain an instance.
 * 
 * @class
 */

Nimbus.BrowserWindow = function(bNimbusWindow){
	// Create a browser window object
	this.BrowserWinObj = new EONimbusWindow(bNimbusWindow);
	this.ID = this.BrowserWinObj.GetWindowID();
	Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.BrowserWindow constructor, ID= " + this.ID);
};

/**
 * Get Window ID.
 * 
 * @return {Number} Window ID
 */

Nimbus.BrowserWindow.prototype.getID = function(){
	if (this.BrowserWinObj == null) {
		return 0;
	}
	return this.ID;
};

/**
 * Destroys the underlying browser window.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.destroy = function(){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.Destroy();
};

/**
 * Opens the URL in the browser window.
 * 
 * @param {String}  URL The URL to open in the window.
 *
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.openURL = function(URL){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.OpenURL(URL);
};

/**
 * Gets the current URL of the browser window.
 * 
 * @return {String} URL
 */

Nimbus.BrowserWindow.prototype.getCurrentURL = function(){
	if (this.BrowserWinObj == null) {
		return null;
	}
	return this.BrowserWinObj.GetCurrentURL();
};


/**
 * Sets the screen position and size of the browser window.
 * 
 * @param {Number} x  Number of pixels from the left edge of the screen to the left edge of the browser window
 * @param {Number} y  Number of pixels from the top edge of the screen to the top edge of the browser window
 * @param {Number} w  Width of the browser window in pixels
 * @param {Number} h  Height of the browser window in pixels
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.setRect = function(x, y, w, h){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.SetRect(x, y, w, h);
};

/**
 * Gets the screen position and size of the browser window.
 * 
 * @return {Object} The position and size of the browser window on the screen.<br>
 * 	{Number} x       - Number of pixels from the left edge of the screen to the left edge of the browser window<br>
 * 	{Number} y       - Number of pixels from the top edge of the screen to the top edge of the browser window<br>
 *  {Number} width   - Width of the browser window in pixels<br>
 *  {Number} height  - Height of the browser window in pixels
 */

Nimbus.BrowserWindow.prototype.getRect = function(){
	if (this.BrowserWinObj == null) {
		return null;
	}
	var rect = new Array();
	rect.x = this.BrowserWinObj.GetRectX();
	rect.y = this.BrowserWinObj.GetRectY();
	rect.width = this.BrowserWinObj.GetRectWidth();
	rect.height = this.BrowserWinObj.GetRectHeight();
	return rect;
};

/**
 * Sets the visibility of the browser window.
 * 
 * @param {Boolean} bShow  True to show window, otherwise hide window.
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.setVisibility = function(bShow){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.SetVisibility(bShow);
};

/**
 * Gets the visibility of the browser window.
 * 
 * @return {Boolean} True if window is visible
 */

Nimbus.BrowserWindow.prototype.getVisibility = function(){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.GetVisibility();
};

/**
 * Sets the enable state of the scrollbars.
 * 
 * @param {Boolean} bEnable  True to enable scrollbars.
 *
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.setScrollBarEnable = function(bEnable){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.SetScrollBarEnable(bEnable);
};

/**
 * Gets the enable state of the scrollbars.
 * 
 * @return {Boolean} True if scrollbars enabled
 */

Nimbus.BrowserWindow.prototype.getScrollBarEnable = function(){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.GetScrollBarEnable();
};

/**
 * Raises window to the top of the window stack.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.raiseToTop = function(){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.RaiseToTop();
};

/**
 * Lowers window to the bottom of the window stack.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.lowerToBottom = function(){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.LowerToBottom();
};

/**
 * Stop loading the page.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.stop = function(){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.Stop();
};

/**
 * Reload the page.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.reload = function(){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.Reload();
};

/**
 * Set focus to the window.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.setFocus = function(){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.SetFocus();
};

/**
 * Remove focus from the window.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.removeFocus = function(){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.RemoveFocus();
};

/**
 * Move to previous page in the history.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.prevPage = function(){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.PrevPage();
};

/**
 * Move to next page in the history.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.nextPage = function(){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.NextPage();
};

/**
 * Clear history.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.clearHistory = function(){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.ClearHistory();
};

/**
 * Sets the scroll position of the window.
 * 
 * @param {Number} x  Scroll position in the X direction (pixels).
 * @param {Number} y  Scroll position in the Y direction (pixels).
 *
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.setScrollPosition = function(x, y){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.SetScrollPosition(x, y);
};

/**
 * Gets the security mode of the browser.
 * 
 * @return {String} Security mode:<br>
 *  "None"   - No encryption (example, plain HTTP)<br>
 *  "Low"    - Weak encryption (40 and 56 bit symmetric methods), weak keys 
 *             (less than 900 bits RSA/DH/DSA), certificate errors, authentication only.<br>
 *  "Medium" - One, and only one, of these: medium strength keys (900-999 bit RSA/DH/DSA) or 
 *             failure to get a valid OCSP response. A combination of both results in "Low" 
 *             security mode.<br>
 *  "High"   - Only when using 128 bit encryption, 1000 bit or more RSA/DH/DSA keys, no certificate 
 *             validation problems.<br>
 *  "Unknown"
 */

Nimbus.BrowserWindow.prototype.getSecurityMode = function(){
	if (this.BrowserWinObj == null) {
		return "Unknown";
	}
	return this.BrowserWinObj.GetSecurityMode();
};

/**
 * Sets the state of highliting for the spatial navigation mode.
 * 
 * @param {Boolean} state  True to enable highlighting by auto spatial navigation mode.
 *
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.setAutoSpatialNavigationHighlighting = function(state){
	if (this.BrowserWinObj == null) {
		return false;
	}
	this.BrowserWinObj.SetAutoSpatialNavigationHighlighting(state);
	return true;
};

/**
 * Gets the state of highliting for spatial navigation mode.
 * 
 * @return {Boolean} True if highlighting is enabled for auto spatial navigation.
 */

Nimbus.BrowserWindow.prototype.getAutoSpatialNavigationHighlighting = function(){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.GetAutoSpatialNavigationHighlighting();
};

/**
 * Performs the specified spatial navigation action.  These actions
 * allow for relative navigation between the page elements and 
 * activation of the selected element.  Call setAutoSpatialNavigationHighlighting(true)
 * to make the highlighting visible.
 *
 * Spatial navigation is only recommended for external (non-Nimbus) pages
 * where specific navigation logic cannot be implemented via JS.
 * 
 * @param {String} action  Action to be performed: "Left", "Right", "Up", "Down", "Activate"
 *
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWindow.prototype.setSpatialNavigationAction = function(action){
	if (this.BrowserWinObj == null) {
		return false;
	}
	return this.BrowserWinObj.SetSpatialNavigationAction(action);
};

/**
 * Gets an interface for creating and controlling a browser widget.
 * 
 * @param {String} WidgetPath  The relative path to the packed widget file.
 *
 * @return {Nimbus.BrowserWidget} Instance of the Nimbus.BrowserWidget interface, or null if the object could not be created
 */

Nimbus.getBrowserWidget = function(WidgetPath, x, y, bShow){
	// Create a new browser widget class
	var widget = new Nimbus.BrowserWidget();
	if (widget != null) {
		// Init the object by creating a new widget
		if (!widget.initNew(WidgetPath, x, y, bShow)) {
			Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getBrowserWidget: failed, " + WidgetPath);
			return null;
		}
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getBrowserWidget: " + WidgetPath);
	}
	return widget;
};

/**
 * Gets an interface for controlling an existing browser widget (for use by another window such as the main Nimbus app).
 * 
 * @param {String} name  The name of the widget.
 *
 * @return {Nimbus.BrowserWidget} Instance of the Nimbus.BrowserWidget interface, or null if the object could not be created
 */

Nimbus.getBrowserWidgetExisting = function(name){
	// Create a new browser widget class
	var widget = new Nimbus.BrowserWidget();
	if (widget != null) {
		// Init the object by trying to find an existing widget by name
		if (!widget.initReference(name)) {
			Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getBrowserWidgetExisting: failed, " + name);
			return null;
		}
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getBrowserWidgetExisting: " + name);
	}
	return widget;
};

/**
 * Gets an interface for controlling an existing browser widget (for use by the widget, ie. a 'self' object).
 *
 * @param {String} name  Widget name used to register the widget when creating a Self object.  By specifying a name,
 *                       other widgets or the main Nimbus application can obtain a reference to this widget via 
 *                       Nimbus.getBrowserWidgetExisting.
 *
 * @return {Nimbus.BrowserWidget} Instance of the Nimbus.BrowserWidget interface, or null if the object could not be created
 */
 
Nimbus.getBrowserWidgetSelf = function(name){
	// Create a new browser widget class
	var widget = new Nimbus.BrowserWidget();
	if (widget != null) {
		// Init the object by getting a Self object
		if (!widget.initSelf(name)) {
			Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getBrowserWidgetSelf: failed, " + name);
			return null;
		}
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getBrowserWidgetSelf: " + name);
	}
	return widget;
};

/**
 * Gets a list of active widgets.
 * 
 * @return {Object} Array of objects describing the active widgets.  Each object contains:<br>
 * 	{String} Name      - Name of the widget<br>
 * 	{String} url       - URL of the widget<br>
 *  {Number} id        - Widget ID<br>
 *  {Boolean} bNimbus  - True if Widget uses Nimbus
 */
 
Nimbus.getWidgetList = function(){
	var str = Nimbus.NimbusObj.GetWidgetList();
	if (str != null) {
		var list = eval(str);
		return list;
	}
	return null;
};

/**
 * Class providing an interface for creating and controlling a browser widget - use 
 * Nimbus.getBrowserWidget, Nimbus.getBrowserWidgetExisting, or Nimbus.getBrowserWidgetSelf
 * to obtain an instance.
 *
 * @class
 */

Nimbus.BrowserWidget = function(){
};

/**
 * @ignore
 * Initialize a browser widget object by creating a new widget from the specified URL.
 * 
 * @param {String} WidgetPath  The relative path to the packed widget file.
 * @param {Number} x           Number of pixels from the left edge of the screen to the left edge of the browser window
 * @param {Number} y           Number of pixels from the top edge of the screen to the top edge of the browser window
 * @param {Boolean} bShow      True to show the widget.
 *
 * @return {Boolean} True if widget created successfully
 * 
 */

Nimbus.BrowserWidget.prototype.initNew = function(WidgetPath, x, y, bShow){
	try {
		this.BrowserWidgetObj = new EONimbusWidget(WidgetPath, x, y, bShow);
		if (this.BrowserWidgetObj == null) {
			return false;
		}
		this.ID = this.BrowserWidgetObj.GetWidgetID();
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.BrowserWidget initialized from URL, ID= " + this.ID);
		return true;
	} catch (err) {
		return false;
	}		
};

/**
 * @ignore
 * Initialize a browser widget object by obtaining a Self object that can be used by the actual widget
 * for controlling itself.
 *
 * @param {String} name  Widget name used to register the widget when creating a Self object.
 *
 * @return {Boolean} True if self object was created successfully
 * 
 */

Nimbus.BrowserWidget.prototype.initSelf = function(name){
	try {
		this.BrowserWidgetObj = new EONimbusWidgetSelf(name);
		if (this.BrowserWidgetObj == null) {
			return false;
		}
		this.ID = this.BrowserWidgetObj.GetWidgetID();
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.BrowserWidget initialized Self object, ID= " + this.ID);
		return true;
	} catch (err) {
		return false;
	}		
};

/**
 * @ignore
 * Initialize a browser widget object by looking-up an existing widget using the widget name.
 *
 * @param {String} name  Widget name used to register the widget.
 *
 * @return {Boolean} True if the specified widget was found and an object representing it was created successfully
 */

Nimbus.BrowserWidget.prototype.initReference = function(name){
	try {
		this.BrowserWidgetObj = new EONimbusWidgetRef(name);
		if (this.BrowserWidgetObj == null) {
			return false;
		}
		this.ID = this.BrowserWidgetObj.GetWidgetID();
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.BrowserWidget initialized by lookup, ID= " + this.ID);
		return true;
	} catch (err){
		return false;	
	}	
};

/**
 * Get Widget ID.
 * 
 * @return {Number} Widget ID
 * 
 */

Nimbus.BrowserWidget.prototype.getID = function(){
	if (this.BrowserWidgetObj == null) {
		return 0;
	}
	return this.ID;
};

/**
 * Destroys the underlying browser widget.
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.BrowserWidget.prototype.destroy = function(){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.Destroy();
};

/**
 * Sets the screen position of the browser widget.
 * 
 * @param {Number} x  Number of pixels from the left edge of the screen to the left edge of the browser window
 * @param {Number} y  Number of pixels from the top edge of the screen to the top edge of the browser window
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWidget.prototype.setPosition = function(x, y){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.SetPosition(x, y);
};

/**
 * Sets the screen position and size of the browser widget.
 * 
 * @param {Number} x  Number of pixels from the left edge of the screen to the left edge of the browser widget
 * @param {Number} y  Number of pixels from the top edge of the screen to the top edge of the browser widget
 * @param {Number} w  Width of the browser widget in pixels
 * @param {Number} h  Height of the browser widget in pixels
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWidget.prototype.setRect = function(x, y, w, h){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.SetRect(x, y, w, h);
};

/**
 * Gets the screen position of the browser widget.
 * 
 * @return {Object} The position of the browser window on the screen.<br>
 * 	{Number} x - Number of pixels from the left edge of the screen to the left edge of the browser window<br>
 * 	{Number} y - Number of pixels from the top edge of the screen to the top edge of the browser window<br>
 */

Nimbus.BrowserWidget.prototype.getPosition = function(){
	if (this.BrowserWidgetObj == null) {
		return null;
	}
	var pos = new Array();
	pos.x = this.BrowserWidgetObj.GetPositionX();
	pos.y = this.BrowserWidgetObj.GetPositionY();
	return pos;
};

/**
 * Gets the native size of the widget.
 * 
 * @return {Object} The native size the widget.<br>
 *  {Number} width  - Width of the widget in pixels<br>
 *  {Number} height - Height of the widget window in pixels
 */

Nimbus.BrowserWidget.prototype.getSize = function(){
	if (this.BrowserWidgetObj == null) {
		return null;
	}
	var size = new Object();
	size.width = this.BrowserWidgetObj.GetSizeWidth();
	size.height = this.BrowserWidgetObj.GetSizeHeight();
	return size;
};

/**
 * Sets the visibility of the browser widget.
 * 
 * @param {Boolean} bShow  True to show widget, otherwise hide widget.
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWidget.prototype.setVisibility = function(bShow){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.SetVisibility(bShow);
};

/**
 * Gets the visibility of the browser widget.
 * 
 * @return {Boolean} True if widget is visible
 */

Nimbus.BrowserWidget.prototype.getVisibility = function(){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.GetVisibility();
};

/**
 * Raises widget to the top of the window stack.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWidget.prototype.raiseToTop = function(){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.RaiseToTop();
};

/**
 * Lowers widget to the bottom of the window stack.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWidget.prototype.lowerToBottom = function(){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.LowerToBottom();
};

/**
 * Set focus to the widget.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWidget.prototype.setFocus = function(){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.SetFocus();
};

/**
 * Remove focus from the widget.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWidget.prototype.removeFocus = function(){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.RemoveFocus();
};

/**
 * Send a message to the widget (if called by the owner window or by
 * a window that obtained a reference to the widget via the
 * getBrowserWidgetExisting method).  If called by
 * the widget, then send the message to owner window (if any) and to 
 * all windows holding a BrowserWidget object obtained via the
 * getBrowserWidgetExisting method.
 * 
 * @param {String} Message  The Message to send to the widget.
 *
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWidget.prototype.sendMessage = function(message){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.SendMessage(message);
};

/**
 * Returns whether the widget is Nimbus-enabled.
 *
 * @return {Boolean} True if widget is Nimbus-enabled.
 */

Nimbus.BrowserWidget.prototype.isNimbusEnabled = function(){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.IsNimbusEnabled();
};

/**
 * Sends a request to the Nimbus handler of the widget to show itself 
 * in an active state.  When active, the Widget will receive key focus.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWidget.prototype.Show = function(){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.SendMessage("Enseo.Show");
};

/**
 * Sends a request to the Nimbus handler of the widget to hide itself 
 * and go to an inactive state.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWidget.prototype.Hide = function(){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.SendMessage("Enseo.Hide");
}


/**
 * Sends a request to the Nimbus handler of the widget to toggle between
 * its hidden and visible states
 * 
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWidget.prototype.ToggleShowHide = function(){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.SendMessage("Enseo.Toggle");
}

/**
 * Set a field in the widget from the owner window or by
 * a window that obtained a reference to the widget via the
 * getBrowserWidgetExisting method. 
 * 
 * @param {String} Field  The name of the variable to set
 * @param {String} Value  The value to assign to the variable
 *
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWidget.prototype.SetField = function(Field, Value){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.SendMessage("Enseo.SetField,"+Field+","+Value);
}

/**
 * Sets the state of highliting for the automatic spatial navigation mode.
 * 
 * @param {Boolean} state True to enable highlighting by auto spatial navigation mode.
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWidget.prototype.setAutoSpatialNavigationHighlighting = function(state){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	this.BrowserWidgetObj.SetAutoSpatialNavigationHighlighting(state);
	return true;
};

/**
 * Gets the state of highliting for automatic spatial navigation mode.
 * 
 * @return {Boolean} True if highlighting is enabled for auto spatial navigation.
 */

Nimbus.BrowserWidget.prototype.getAutoSpatialNavigationHighlighting = function(){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.GetAutoSpatialNavigationHighlighting();
};

/**
 * Performs the specified spatial navigation action.  These actions
 * allow for relative navigation between the page elements and 
 * activation of the selected element.  Call setAutoSpatialNavigationHighlighting(true)
 * to make the highlighting visible.
 *
 * Spatial navigation is only recommended for external (non-Nimbus) pages
 * where specific navigation logic cannot be implemented via JS.
 * 
 * @param {String} action  Action to be performed: "Left", "Right", "Up", "Down", "Activate"
 * @return {Boolean} True if successful
 */

Nimbus.BrowserWidget.prototype.setSpatialNavigationAction = function(action){
	if (this.BrowserWidgetObj == null) {
		return false;
	}
	return this.BrowserWidgetObj.SetSpatialNavigationAction(action);
};

/**********************************************************************************************
***********************************************************************************************
**********************************************************************************************/
