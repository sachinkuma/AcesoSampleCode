/**
 * @fileOverview Enseo Nimbus Javascript API
 * <p><b>Copyright (c) Enseo, Inc. 2008-2010
 *
 * This material contains trade secrets and proprietary information
 * and	may not	 be used, copied, disclosed or	distributed	 except
 * pursuant to	a license from Enseo, Inc. Use of copyright notice
 * does not imply publication or disclosure.</b>
 */

////////////////////////////////////////////////////////////////////////
//
// Reference   : $Source: /cvsroot/calica/apps/rootfs_common/root/usr/bin/data/html/js/enseo_nimbus.js,v $
//
// Revision	   : $Revision: 1.177 $
//
// Date		   : $Date: 2011-03-18 23:08:59 $
//
// Description : Nimbus javascript API.
//
////////////////////////////////////////////////////////////////////////

/**
 * Namespace for the Nimbus JavaScript API
 * @name Nimbus
 */

if(typeof this["Nimbus"] == "undefined") {
	// Create a new object called Nimbus that will serve as our top-level object
	// that will expose the Nimbus API functionality.
	this["Nimbus"] = {};
	try {
		Nimbus.NimbusObj = new EONimbus;
		Nimbus.EventListeners = new Array();

		var VerStrings = new Array();
		VerStrings = Nimbus.NimbusObj.NimbusAPIRevision.split(".");
		var hi = parseInt(VerStrings[0]);
		var lo = parseInt(VerStrings[1]);
		if (hi > 3 || (hi == 3 && lo >= 11)) {
			Nimbus.NimbusObj.RegisterObject(window.location);
		}		
	} catch (e) {

	}
}	

////////////////////////////////////////////////////////////////////////
//
// General functionality
//
////////////////////////////////////////////////////////////////////////

/**
 * @ignore
 * Log message types.  Not intended for use by javascript application.
 *
 */
Nimbus.LOG_MSG_TYPE_APP = 0;			// From JS application
Nimbus.LOG_MSG_TYPE_API_DISABLED = 1; 	// From API layer, logging disabled for this message
Nimbus.LOG_MSG_TYPE_API_ALWAYS = 2; 	// From API layer, always log message
Nimbus.LOG_MSG_TYPE_API_ERROR = 3;		// From API layer, log message as an error
Nimbus.LOG_MSG_TYPE_API_DEBUG = 4;		// From API layer, debug message

var gLogDispatchEvents = true;			//Set to false to suppress log traces on events and dispatches

 /**
 * Gets the hardware model number.
 * 
 * @return {String} Hardware model number
 */

Nimbus.getHardwareModel = function(){
	return Nimbus.NimbusObj.HardwareModel;
};

/**
 * Gets the hardware ID.  This value is the board Identifier that the native code uses to determine
 * the hardware capabilities of the board.
 * 
 * @return {String} Hardware ID
 */

Nimbus.getHardwareID = function(){
	return Nimbus.NimbusObj.HardwareID;
};

/**
 * Gets the EPLD revision number.
 * 
 * @return {String} EPLD revision number
 */

Nimbus.getEPLDRevision = function(){
	return Nimbus.NimbusObj.EPLDRevision;
};

/**
 * Gets the firmware revision number.
 * 
 * @return {String} Firmware revision number
 */

Nimbus.getFirmwareRevision = function(){
	return Nimbus.NimbusObj.FirmwareRevision;
};

/**
 * Gets the firmware build information.
 * 
 * @return {Object} Firmware build information <br>
 * 	{String}  platform 	- Indicates the processor platform of the unit <br>
 * 	{String}  target 	- Indicates the build target for the firmware: "prod" for production or "qa_prod" for test <br>
 *  {String}  options 	- Ither options used in the firmware build setup <br>
 *  {String}  version 	- Firmware build version <br>
 *  {String}  dev 		- Develper name, if private build <br>
 *  {String}  date 		- Time and date the build was made
 * 
 */

Nimbus.getFirmwareBuildInfo = function(){
	var json = Nimbus.NimbusObj.FirmwareBuildInfo ();
	if (json == null) {
		return null;
	}
	return eval('(' + json + ')');
};

/**
 * Gets the Nimbus API revision number.
 * 
 * @return {String} Nimbus revision number
 */

Nimbus.getNimbusAPIRevision = function(){
	return Nimbus.NimbusObj.NimbusAPIRevision;
};

/**
 * Gets the serial number of the STB/IMP.  This is either the media processor serial number, or the 
 * MAC address depending upon platform.
 * 
 * @return {String} Serial number
 */

Nimbus.getSerialNumber = function(){
	return Nimbus.NimbusObj.SerialNumber;
};

/**
 * Gets the STB state.  The notification Nimbus.Event.MESSAGE_STB_STATUS_CHANGE is sent whenever the
 * state changes.
 * 
 * @return {String} STB State: "Initializing", "Normal", "Updating", "Closing"
 */

Nimbus.getSTBState = function(){
	return Nimbus.NimbusObj.GetSTBState();
};

/**
 * Handshakes with the native code to indicate the JS code is running.  This
 * must be done at least once every 30 seconds to ensure the STB remains in the JS-controlled
 * state.  If handshaking does not occur, the native code will first load the local startup page,
 * and then attempt to reload the external Nimbus application specified by DHCP.  The handshake
 * timeout can be set using Nimbus.setHandshakeTimeout.
 * 
 * @param {String}  AppName	Name of the running application.
 * @return {Boolean} True if successful.
 */

Nimbus.handshake = function(AppName){
	if (AppName == null) {
		AppName = "unspecified";
	}	
	return Nimbus.NimbusObj.Handshake(AppName);
};

/**
 * Gets the current handshake timeout.
 *
 * @return {Number} Number of seconds
 */

Nimbus.getHandshakeTimeout = function(){
	return Nimbus.NimbusObj.GetHandshakeTimeout();
};

/**
 * Sets the handshake timeout.  The handshake method must be called at least this often.
 *
 * @param {Number} secTime  Number of seconds; 0 to disable, 30s or larger otherwise.
 *
 * @return {Boolean} True if successful
 */

Nimbus.setHandshakeTimeout = function(secTime){
	return Nimbus.NimbusObj.SetHandshakeTimeout(secTime);
};

/**
 * Reboots the unit.  An orderly shut-down is used to ensure that any pending
 * non-volatile memory updates have been completed.
 */

Nimbus.reboot = function(){
	return Nimbus.NimbusObj.Reboot();
};

/**
 * Reloads the Nimbus application by flushing the cache, loading the local startup page, and then attempting
 * to reload the application using the URL provided by DHCP.
 *
 * @param {Boolean} bWait  If true, then reload the page immediately.  Otherwise, honor
 *                         the page load delay settings specified by Nimbus.setMainPageLoadingParameters.
 *
 * @return {Boolean} True if successful.
 */

Nimbus.reload = function(bNoWait){
    return Nimbus.NimbusObj.Reload(bNoWait);
};

/**
 * Clears all cookies.  Clears all browser cookies.
 *
 * @return {Boolean} True if successful.
 */

Nimbus.clearCookies = function(){
	return Nimbus.NimbusObj.ClearCookies();
};

/**
 * Resets the specified widget state.
 *
 * @param {String} widget Name of the widget.
 * @return {Boolean} True if successful.
 */

Nimbus.resetWidget = function(widget){
	return Nimbus.NimbusObj.ResetWidget(widget);
};

/**
 * Reloads all auto loading widgets
 *
 * @return {Boolean} True if successful.
 */

Nimbus.reloadAutoWidgets = function(){
	return Nimbus.NimbusObj.ReloadAutoWidgets();
};

/**
 * Clears the browser memory cache.
 *
 * @return {Boolean} True if successful.
 */
Nimbus.clearMemoryCache = function()
{
    return Nimbus.NimbusObj.ClearMemoryCache();
}; 

/**
 * Sets the parameters which configure automatic updating via the RF stream push method.
 *
 * @param {Number}  RFChannel  	The RF channel (cable channel plan) checked for updates.  Specify
 *								RFChannel=0 and bSearch=false to disable checking of RF channels
 *                              during auto updating.
 * @param {Boolean} bSearch		True to enable searching for an update if an update is not found
 *								on RFChannel.  When False, RFChannel is repeatedly checked.
 * @param {Booleam} bDenyIR		Set true to deny the ability to interrupt Idle RF interrupts with 
 *								IR input from a remote.  Default is false, IR will interrupt.
 * 
 * @return {Boolean} True if parameters successfully set
 */

Nimbus.setRFAutoUpdateParameters = function(RFChannel, bSearch, bDenyIR){
	return Nimbus.NimbusObj.SetRFAutoUpdateParameters(RFChannel, bSearch, bDenyIR);
};

/**
 * Sets the parameters which configure checking of an IP channel during automatic updating.
 *
 * @param {Boolean} bEnable		True to enable checking of a specified IP Update Channel during
 *                              auto update.
 *								False disables IP update channel checking.
 * @param {String}  IPAddress  	The IP address checked for updates if IP auto update is enabled
 *                              (in the form xxx.xxx.xxx.xxx).
 * @param {Number}  IPPort  	The IP port part of the address checked for updates if IP auto
 *                              update checking is enabled.
 * 
 * @return {Boolean} True if parameters successfully set
 */

Nimbus.setIPAutoUpdateParameters = function(bEnable, IPAddress, IPPort){
	if (IPAddress == null) {
		return Nimbus.NimbusObj.SetIPAutoUpdateParameters(bEnable);
	} else {
		return Nimbus.NimbusObj.SetIPAutoUpdateParameters(bEnable, IPAddress, IPPort);
	}
};

/**
 * Sets the enable state for update searching while in the Power On state.  Normally the firmware
 * only checks for updates when the STB is in the standby power state.  Use this method to
 * also enable checking during the Power On state.
 *
 * @param {Boolean} bSearch  True to enable searching for an update when the power is On
 * 
 * @return {Boolean} True if parameters successfully set
 */

Nimbus.setPowerOnModeAutoUpdateEnable = function(bEnable){
	return Nimbus.NimbusObj.SetPowerOnModeAutoUpdateEnable(bEnable);
};

/**
 * Gets the enable state for update searching while in the Power On state.
 *
 * @return {Boolean} True if enabled
 */

Nimbus.getPowerOnModeAutoUpdateEnable = function(){
	return Nimbus.NimbusObj.GetPowerOnModeAutoUpdateEnable();
};


/**
 * Gets whether low power mode support is currently enabled for the STB
 * 
 * @return {Boolean} bEnabled.  True if low power mode support is enabled
 */

Nimbus.getLowPwrModeSupportEnabled = function(){
	return Nimbus.NimbusObj.GetLowPwrModeSupportEnabled();
};

/**
 * Sets whether low power mode support is enabled in the STB.
 * 
 * @param {Boolean} bEnabled True to enable low power mode support 
 * 
 * @return {Boolean} True if successful
 */

Nimbus.setLowPwrModeSupportEnabled = function(bEnabled){
	return Nimbus.NimbusObj.SetLowPwrModeSupportEnabled(bEnabled);
};

/**
 * Updates the firmware of the unit using the streaming push method.  The unit will immediately close
 * all players and enter the firmware update mode.  The specified content will be opened and examined
 * for a compatible firmware download stream.  If found, the update will be downloaded and flashed into
 * memory.  The unit will then automatically reboot.
 * 
 * @param {String} content  The content descriptor of the stream containing the firmware update.  See the the Nimbus.getPlayer 
 *   				        method for examples.  Only the RTP, UDP, and RFDigital protocols are supported.
 * 
 * @return {Boolean} True if successfully initiated
 */

Nimbus.updateFirmwareStreamPush = function(content){
	return Nimbus.NimbusObj.UpdateFirmwareStreamPush(content);
};

/**
 * @ignore
 * <b>Deprecated - renamed to updateFirmwareStreamPush</b>
 */

Nimbus.updateFirmware = function(content){
	return Nimbus.NimbusObj.UpdateFirmwareStreamPush(content);
};

/**
 * Updates the firmware of the unit using the network pull method.  The unit will immediately close
 * all players and enter the firmware update mode.  The specified URL will be downloaded and flashed into
 * memory.  The unit will then automatically reboot.
 * 
 * @param {String} Location           IP Address in standard octet notation of server hosting the firmware.
 * @param {String} Port               Optional: default is 21 for ftp protocol.  The TCP port to use to connect to the server hosting the firmware.
 * @param {String} TransferProtocol   Optional: default is "ftp".  All other values reserved for future use. 
 * @param {String} Username           Optional: Username to use to log into server hosting the firmware.  Note that the username is limited to 31 ASCII characters.
 * @param {String} Password           Optional: Password to use when logging into server hosting the content.  Note that the password is limited to 31 ASCII characters.
 * @param {String} FilePath           Relative path the firmware file on the server.
 * 
 * @return {Boolean} True if successfully initiated
 */

Nimbus.updateFirmwareNetworkPull= function(Location, Port, TransferProtocol, Username, Password, FilePath){
	return Nimbus.NimbusObj.UpdateFirmwareNetworkPull(Location, Port, TransferProtocol, Username, Password, FilePath);
};

/**
 * Updates the firmware of the unit using a local file.  The file will be validated and then unit will close the
 * Nimbus application and enter the firmware update mode.  The unit will then automatically reboot.
 * 
 * @param {String} Drive              Local name of the drive containing the file: "Hard Drive", "Flash Drive", or "Ext USB Drive".
 * @param {String} Filepath           Name of the update file with optional relative path.
 * 
 * @return {Boolean} True if successfully initiated
 */

Nimbus.updateFirmwareLocalFile= function(Drive, Filename){
	return Nimbus.NimbusObj.UpdateFirmwareLocalFile(Drive, Filename);
};

/**
 * Updates the configuration of the unit using the specified content descriptor.  The unit will immediately close
 * all players and enter the configuration update mode.  The specified content will be opened and examined
 * for a compatible configuration download stream.  If found, the update will be downloaded and stored in
 * memory.  The unit will then automatically reboot (if the downloaded configuration is different.)
 *
 * @param {String} content  The content descriptor of the stream containing the configuration update.  See the the Nimbus.getPlayer 
 *  				        method for examples.  Only the RTP, UDP, and RFDigital protocols are supported.
 * @return {Boolean} True if successful
 */

Nimbus.updateConfigurationStreamPush = function(content){
	return Nimbus.NimbusObj.UpdateConfigurationStreamPush(content);
};

/**
 * Restore factory configuration.  The default values for all settings are restored, and the unit is
 * automatically rebooted.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.restoreFactoryConfiguration = function(){
	return Nimbus.NimbusObj.RestoreFactoryConfiguration();
};

/**
 * Sets the graphics resolution used for browser and GUI windows.  This 
 * setting is stored in non-volatile memory.  A reboot is necessary 
 * for the change to take effect.  The default resolution is 1280x720.
 * 
 * @param {Number} width   Width of screen in pixels [720, 1280]
 * @param {Number} height  Height of screen in pixels [480, 720]
 *
 * @return {Boolean} True if successful
 */

Nimbus.setGraphicsResolution = function(width, height){
	return Nimbus.NimbusObj.SetGraphicsResolution(width, height);
};

/**
 * Gets the graphics resolution used for browser and GUI windows.
 * 
 * @return {Object} Graphics resolution.<br>
 * 	{Number} width  - Width in pixels<br>
 * 	{Number} height - Height in pixels<br>
 */

Nimbus.getGraphicsResolution = function(){
	var res = new Array();
	res.width = Nimbus.NimbusObj.GetGraphicsResolutionWidth();
	res.height = Nimbus.NimbusObj.GetGraphicsResolutionHeight();
	return res;
};

/**
 * Sets the amount of extra video memory to allocate to the OSD
 * framebuffer.  If this method returns true it indicates that there
 * should be a subsequent call to set the max. secondary video decoder
 * profile.  In turn that call will indicate whether a reboot must be
 * performed.  The change to video memory will only become available upon
 * reboot.  If the video decoder profile has not been reset prior to the
 * reboot then it may fail to set the new video memory size if it has
 * increased over what was set previously.
 * 
 * @param {Number} Size, in bytes, of extra video memory to allocate [0, 8388608]
 *
 * @return {Boolean} True if a subsequent call to set the secondary video decoder
 * profile should be made.  False if successful but no subsequent call is required.
 * Returns null if the method fails.
 */

Nimbus.setExtraVideoMemorySize = function(vidMemSiz){
	return Nimbus.NimbusObj.SetExtraVideoMemorySize(vidMemSiz);
};

/**
 * Gets the amount of extra video memory to allocate to
 * the OSD framebuffer.  Note that this is the value stored in settings,
 * not necessarily the value used when calculating the total OSD memory
 * size when the box was booted.
 * 
 * @return	{Number} Size, in bytes, of extra video memory to allocate on next boot.
 */

Nimbus.getExtraVideoMemorySize = function(){
	return Nimbus.NimbusObj.GetExtraVideoMemorySize ();
};

/**
 * Sets the underscan amount (in percent) applied to each side of
 * the graphics layer.
 *  
 * This setting is useful in cases where the TV normally overscans
 * the video output of the STB causing some of the graphics/UI
 * to be non-visible.  This setting should be applied BEFORE 
 * creating any player windows.
 * 
 * @param {Number} underscan Underscan in percent [0, 25]
 *
 * @return {Boolean} True if successful
 */

Nimbus.setGraphicsUnderscan = function(underscan){
	return Nimbus.NimbusObj.SetGraphicsUnderscan(underscan);
};

/**
 * Sets the underscan amount (in percent) for the graphics layer. 
 * 
 * @return {Number} Underscan in percent.
 */

Nimbus.getGraphicsUnderscan = function(){
	return Nimbus.NimbusObj.GetGraphicsUnderscan();
};

/**
 * Sets the screen update delay.  This is the minimum amount of
 * time between screen updates.  The shorter the delay, the more
 * time that will be spent performing screen rendering and the less
 * responsive the application will be.  Note that updates only occur
 * as a result of the browser/js code causing a change in the
 * screen content.
 *
 * The default value is 40ms.
 * 
 * @param {Number} delayMS  Update delay in milliseconds [20, ]
 *
 * @return {Boolean} True if successful
 */

Nimbus.setScreenUpdateDelay = function(delayMS){
	return Nimbus.NimbusObj.SetScreenUpdateDelay(delayMS);
};

/**
 * Gets the screen update delay.
 * 
 * @return {Number} Delay in milliseconds.
 */

Nimbus.getScreenUpdateDelay = function(){
	return Nimbus.NimbusObj.GetScreenUpdateDelay();
};

/**
 * Sets the screen update delay after an external command has been processed.
 * This is the minimum amount of time between screen updates. The delay can be 
 * set to zero for this value. This gives the box more time to process further
 * commands before rendering the screen updates.  Note that updates only occur
 * as a result of the browser/js code causing a change in the screen content.
 *
 * The default value is 0ms.
 * 
 * @param {Number} delayMS  Update delay in milliseconds [20, ]
 *
 * @return {Boolean} True if successful
 */

Nimbus.setScreenUpdateDelayCmdMS = function(delayMS){
	return Nimbus.NimbusObj.SetScreenUpdateDelayCmdMS(delayMS);
};

/**
 * Gets the screen update delay after a command has been processed.
 * 
 * @return {Number}	 Delay in milliseconds.
 */

Nimbus.getScreenUpdateDelayCmdMS = function(){
	return Nimbus.NimbusObj.GetScreenUpdateDelayCmdMS();
}

/**
 * Enables/disables screen updates.  When disabled, no screen rendering
 * will be done by the browser nor will player window position/size
 * changes be applied.  This method is useful when it is desired
 * to hold-off the display of screen changes when the overall screen
 * layout is being changed.
 * 
 * @param {Boolean} bEnableScreen  True to enable screen updates.
 * @param {Boolean} bEnableVideo   True to enable video window updates
 *
 * @return {Boolean} True if successful
 */

Nimbus.setScreenUpdateEnable = function(bEnableScreen, bEnableVideo){
	return Nimbus.NimbusObj.SetScreenUpdateEnable(bEnableScreen, bEnableVideo);
};

/**
 * Gets the screen update enable state.
 * 
 * @return {Boolean} True if enabled.
 */

Nimbus.getScreenUpdateEnable = function(){
	return Nimbus.NimbusObj.GetScreenUpdateEnable();
};

/**
 * Initiates a content update. This method will trigger the content update process which involves
 * connecting to the specified server, reading the update control file, and then performing the actions
 * specified in that file.  These actions can be used to add/remove specific files.
 *
 * This feature can be used to load startup html content and/or browser fonts onto the unit.
 * 
 * @param {String} Location           IP Address in standard octet notation of server hosting the update files.
 * @param {String} Port               Optional: default is 21 for ftp protocol.  The TCP port to use to connect to the server hosting the firmware.
 * @param {String} TransferProtocol   Optional: default is "ftp".  All other values reserved for future use. 
 * @param {String} Username           Optional: default is "anonymous". Username to use to log into server hosting the firmware.  (limited to 31 ASCII characters)
 * @param {String} Password           Optional: Password to use when logging into server hosting the content.  (limited to 31 ASCII characters)
 * @param {String} UpdateFile         Optional: default is "update.xml". The name of the update control file to download from the server.
 * @param {String} UpdateFolder       Optional: default is none.  The name of the folder on the server in which the update control file is located. (limited to 31 ASCII characters)
 * @param {String} UpdateDrive        Required: The name of the content drive on the set top box onto which to transfer content. 
 * @param {Boolean} NoUpload          Optional: default is false.  Set to true to turn off upload of inventory and channel ring at completion of content update.
 * 
 * @return {Boolean} True if successfully initiated
 */

Nimbus.updateContent = function(Location, Port, TransferProtocol, Username, Password, UpdateFile, UpdateFolder, UpdateDrive, NoUpload){
	return Nimbus.NimbusObj.UpdateContent(Location, Port, TransferProtocol, Username, Password, UpdateFile, UpdateFolder, UpdateDrive, NoUpload);
};

/**
* Initiates a content update. This method will trigger the content update process which involves
* connecting to the specified server, reading the update control file, and then performing the actions
* specified in that file.  These actions can be used to add/remove specific files.
*
* This feature can be used to load startup html content and/or browser fonts onto the unit.
* 
* @param {String} Location           IP Address in standard octet notation of server hosting the update files.
* @param {String} Port               Optional: default is 21 for ftp protocol.  The TCP port to use to connect to the server hosting the firmware.
* @param {String} TransferProtocol   Optional: default is "ftp".  All other values reserved for future use. 
* @param {String} Username           Optional: default is "anonymous". Username to use to log into server hosting the firmware.  (limited to 31 ASCII characters)
* @param {String} Password           Optional: Password to use when logging into server hosting the content.  (limited to 31 ASCII characters)
* @param {String} UpdateFile         Optional: default is "update.xml". The name of the update control file to download from the server.
* @param {String} UpdateFolder       Optional: default is none.  The name of the folder on the server in which the update control file is located. (limited to 31 ASCII characters)
* @param {String} UpdateDrive        Required: The name of the content drive on the set top box onto which to transfer content. 
* @param {String} IdStr              Optional: ID to match to update xml.  If specified but no match, the content update will not run.
* 
* @return {Boolean} True if successfully initiated
*/

Nimbus.updateContentByID = function(Location, Port, TransferProtocol, Username, Password, UpdateFile, UpdateFolder, UpdateDrive, IdStr)
{
    return Nimbus.NimbusObj.UpdateContent(Location, Port, TransferProtocol, Username, Password, UpdateFile, UpdateFolder, UpdateDrive, false, IdStr ? IdStr : "undefined");
};

/**
 * Gets the status of the current/prior content update initiated via the updateContent method.
 * 
 * @return {Object} Content update status:<br>
 * 	{String} Status         - Status, "None", "DidNotStart", "PendingStart", "InProgress", "DoneSuccess", "DoneFailure"<br>
 * 	{String} ProgressFile   - Name of current file in progress<br>
 * 	{String} ProgressAction - Action in progress<br>
 * 	{Number} NumSuccess     - Number of files successfully acted upon<br>
 * 	{Number} NumFailure     - Number of files unsuccessfully acted upon<br>
 */

Nimbus.getUpdateContentStatus = function(){
	var raw = Nimbus.NimbusObj.GetUpdateContentStatus();
	var StatusList = new Array();
	StatusList = raw.split("!");

	var StatusObj = new Object();
	StatusObj.Status = StatusList[0];
	StatusObj.ProgressFile = StatusList[1];
	StatusObj.ProgressAction = StatusList[2];
	StatusObj.NumSuccess = StatusList[3];
	StatusObj.NumFailure = StatusList[4];
	return StatusObj;
};

/**
* Clear the content package ID of the last successful content update over an
* RF or IP Stream.  The ID is stored so that the content package is not continuously applied.
* Clearing the ID allows any content to be downloaded.
* 	{Number} index     : content package index to clear.  If not specified, then index 0 will be cleared.  Set to -1 to clear all IDs
*
* @return {Boolean} True if successful
*/

Nimbus.clearContentUpdateUID = function(index)
{
    return Nimbus.NimbusObj.ClearContentUpdateUID(index);
};

/**
* Set the content ID for a given package index number
* The ID is stored so that the content package is not continuously applied.  Explicitly being able to 
* set it can stop a download from ever happening, if the calling app knows the package ID to set
* 	{Number} index     : content package index to set ID.  
* 	{Number} lo        : The low part of the ID to set
* 	{Number} hi        : The High part of the ID to set
*
* @return {Boolean} True if successful
*/

Nimbus.setContentUpdateUID = function(index,lo,hi)
{
	    return Nimbus.NimbusObj.SetContentUpdateUID(index,lo,hi);
}

/**
* Set the Group ID for this unit to watch for a content update over an
* RF or IP Stream.  The ID is stored so that a content package can be 
* selectively applied to units within a specific group.
* Clearing the ID (GroupID 0) allows any content to be downloaded.
* 	{Number} GroupID     : Group ID that this STB belongs to
*
* @return {Boolean} True if successful
*/

Nimbus.setGroupContentUpdateID = function(GroupID)
{
    return Nimbus.NimbusObj.SetGroupContentUpdateID(index);
};

/**
* Get the Group ID currently in use for this unit for a content update
* over an RF or IP Stream.  
*
* @return {Number} Group ID in Use
*/

Nimbus.getGroupContentUpdateID = function(GroupID)
{
    return Nimbus.NimbusObj.GetGroupContentUpdateID(index);
};

/**
* Clears the Group ID (set to 0) for this unit so any content update 
* over an RF or IP Stream will be downloaded.

* @return {Boolean} True if successful
*/

Nimbus.clearGroupContentUpdateID = function(GroupID)
{
    return Nimbus.NimbusObj.ClearGroupContentUpdateID(index);
};

/**
 * Sets the memory limits used to manage system memory use by the browser.
 * These should only be used with guidance from Enseo.
 * 
 * @param {Boolean} bPercent 		True if units are percent, otherwise in bytes.
 * @param {Number} HeapSizeLimit 	Maximum overall size the heap is allowed to grow.
 * @param {Number} AllocationLimit 	Maximum amount of memory the browser is allowed to allocate.
 *
 * @return {Boolean} True if successful
 */

Nimbus.setBrowserMemoryLimits = function(bPercent, HeapSizeLimit, AllocationLimit){
	return Nimbus.NimbusObj.SetBrowserMemoryLimits(bPercent, HeapSizeLimit, AllocationLimit);
};

////////////////////////////////////////////////////////////////////////
//
// User interface related
//
////////////////////////////////////////////////////////////////////////

/**
 * Enables or disables the mouse pointer.  When disabled, the mouse cursor
 * is disabled and mouse input is translated into arrow navigation keys.
 * 
 * @param {Boolean} bState                  (required) True to make the mouse pointer enabled and visible
 * @param {Boolean} bForceEnabled           (optional, defaults to False) When bState is False, then setting this parameter to True
 *                                          will enable the mouse, but keep it hidden.
 * @param {Boolean} bForThisWindowInstance  (optional, defaults to False) True to set these parameters for the current window only, 
 *                                          otherwise apply globally.
 * @return {Boolean} True if successful
 */

Nimbus.setMousePointerEnable = function(bState, bForceEnabled, bForThisWindowInstance){
	Nimbus.NimbusObj.SetMousePointerEnable(bState, bForceEnabled, bForThisWindowInstance);
	return true;
};

/**
 * Gets the enable state of the mouse pointer.
 *
 * @param {Boolean} bForThisWindowInstance  (optional, defaults to False) True to get setting for current window, otherwise get the global setting
 * @param {Boolean} bGetEnabled             (optional, defaults to False) True to get current enable state, otherwise get current visibility
 *
 * @return {Boolean} True if the mouse pointer is enabled/visible
 */

Nimbus.getMousePointerEnable = function(bForThisWindowInstance, bGetEnabled){
	return Nimbus.NimbusObj.GetMousePointerEnable(bForThisWindowInstance, bGetEnabled);
};

/**
 * Gets whether a mouse device is attached to the system
 *
 * @return {Boolean} True if the mouse is attached and available currently in 
 * the system.  The Mouse needs to be attached to the STB prior to STB power on 
 * for full functionality
 */

Nimbus.getMouseDeviceAvailable = function(){
	return Nimbus.NimbusObj.GetMouseDeviceAvailable();
};

/**
 * Deprecated - The recommended method for controlling the spatial
 * navigation mode of the browser is by translating navigation/select
 * commands into setSpatialNavigationAction method calls.
 * 
 * Sets the state of automatic spatial navigation mode.  When enabled the arrow keys
 * and select key are automatically processed by the browser to navigate between
 * the page elements.  
 * 
 * @param {Boolean} state True to enable auto spatial navigation mode.
 * @return {Boolean} True if successful
 */

Nimbus.setAutoSpatialNavigationEnable = function(state){
	Nimbus.NimbusObj.SetAutoSpacialNavigation(state);
	return true;
};

/**
 * @ignore
 * <b>Deprecated - renamed to setAutoSpatialNavigationEnable</b>
 */

Nimbus.setAutoSpacialNavigationEnable = function(state){
	return Nimbus.setAutoSpatialNavigationEnable(state);
};

/**
 * Deprecated - See setAutoSpatialNavigationEnable().
 * Gets the state of automatic spatial navigation mode.
 * 
 * @return {Boolean} True if auto spatial navigation mode is enabled.
 */

Nimbus.getAutoSpatialNavigationEnable = function(){
	return Nimbus.NimbusObj.GetAutoSpacialNavigation();
};

/**
 * @ignore
 * <b>Deprecated - renamed to getAutoSpatialNavigationEnable</b>
 */

Nimbus.getAutoSpacialNavigationEnable = function(){
	return Nimbus.getAutoSpatialNavigationEnable();
};

/**
 * Sets the state of highliting for the automatic spatial navigation mode.
 * When disabled (but spatial nav is enabled), no visible highliting
 * is used.
 * 
 * @param {Boolean} state True to enable highlighting by auto spatial navigation mode.
 * @return {Boolean} True if successful
 */

Nimbus.setAutoSpatialNavigationHighlighting = function(state){
	Nimbus.NimbusObj.SetAutoSpacialNavigationHighlighting(state);
	return true;
};

/**
 * @ignore
 * <b>Deprecated - renamed to setAutoSpatialNavigationHighlighting</b>
 */

Nimbus.setAutoSpacialNavigationHighlighting = function(state){
	return Nimbus.setAutoSpatialNavigationHighlighting(state);
};

/**
 * Gets the state of highliting for automatic spatial navigation mode.
 * 
 * @return {Boolean} True if highlighting is enabled for auto spatial navigation.
 */

Nimbus.getAutoSpatialNavigationHighlighting = function(){
	return Nimbus.NimbusObj.GetAutoSpacialNavigationHighlighting();
};

/**
 * @ignore
 * <b>Deprecated - renamed to getAutoSpatialNavigationHighlighting</b>
 */

Nimbus.getAutoSpacialNavigationHighlighting = function(){
	return Nimbus.getAutoSpatialNavigationHighlighting();
};

/**
 * Performs the specified spatial navigation action.  These actions
 * allow for relative navigation between the page elements and 
 * activation of the selected element.  Call Nimbus.setAutoSpatialNavigationHighlighting(true)
 * to make the highlighting visible.
 *
 * Spatial navigation is only recommended for external (non-Nimbus) pages
 * where specific navigation logic cannot be implemented via JS.
 * 
 * @param {String} action  Action to be performed: "Left", "Right", "Up", "Down", "Activate"
 * @return {Boolean} True if successful
 */

Nimbus.setSpatialNavigationAction = function(action){
	return Nimbus.NimbusObj.SetSpatialNavigationAction(action);
};

/**
 * Sets the hightlighted item of spatial navigation.  This method works by specifying a location
 * on the page and a direction from which to start searching for a page item.
 *
 * Spatial navigation is only recommended for external (non-Nimbus) pages
 * where specific navigation logic cannot be implemented via JS.
 * 
 * @param {String}  direction Direction in which to search: "Left", "Right", "Up", "Down"
 * @param {Number}  xpos      X coordinate of page position from which to search for a page link
 * @param {Number}  ypos      Y coordinate of page position from which to search for a page link
 * @param {Boolean} bScroll   True to allow the page to be scrolled when searching
 * @return {Boolean} True if successful (call was made, but not necessarily a link was found)
 */

Nimbus.setAutoSpatialNavigationPosition = function(direction, xpos, ypos, bScroll){
	return Nimbus.NimbusObj.SetAutoSpatialNavigationPosition(direction, xpos, ypos, bScroll);
};

/**
 * Displays the specified message on the native GUI of the STB.  Two
 * popup box sizes are supported: 3 lines and 16 lines.  The popup
 * used is determined by counting the newlines found in the message string.
 * 
 * This is not the recommended way for displaying messages.  The better
 * approach is to use browser elements.
 * 
 * @param {String} message  The message to display
 * @param {Number} timeout  The timeout in milliseconds
 * @return {Boolean} True if successful
 */

Nimbus.displayMessage = function(message, timeout){
	Nimbus.NimbusObj.DisplayMessage(message, timeout);
	return true;
};

/**
 * Shows the options menu via the native UI.  The options menu includes
 * controls for VChip, closed captioning, and picture format and is intended
 * for use by the guest (as opposed to the installer).  Once the options menu
 * appears, it will take input focus for those keys needed by the native GUI
 * until the menu times-out or is exited.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.showOptionsMenu = function(){
	Nimbus.NimbusObj.ShowOptionsMenu();
	return true;
};

/**
 * Enables/disables the Options menu implemented by the native UI. The default
 * is for this menu to be disabled.  When enabled, if the Nimbus application
 * allows the Menu command to be handled by the native firmware, then the Options
 * menu will be displayed.
 *
 * Note that this functionality only applies if using the Enseo remote control
 * or a TV-specific remote control that produces command codes that the STB 
 * firmware can interpret.
 * 
 * @param {Boolean} state  True to enable.
 * @return {Boolean} True if successful
 */

Nimbus.setOptionsMenuEnable = function(state){
	Nimbus.NimbusObj.SetOptionsMenuEnable(state);
	return true;
};

/**
 * Gets the enable state of the Options menu implemented by the native UI.
 * 
 * @return {Boolean} True if enabled.
 */

Nimbus.getOptionsMenuEnable = function(){
	return Nimbus.NimbusObj.GetOptionsMenuEnable();
};

/**
 * Clears the native GUI menu/popup that is currently active.  This method will not
 * clear the setup (ie. installer) menu.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.clearNativeGUI = function(){
	Nimbus.NimbusObj.ClearNativeGUI();
	return true;
};

/**
 * Show/hide the closed captioning display.  This function is used to 
 * temporarily suppress the captioning display to prevent it from appearing
 * on top of the browser page.
 * 
 * @param {Boolean} state True to allow display of CC.
 * @return {Boolean} True if successful
 */

Nimbus.setCCVisibility = function(state){
	return Nimbus.NimbusObj.SetCCVisibility(state);
};

/**
 * Gets the visibility state of the closed captioning display.
 * 
 * @return {Boolean} True if enabled for display
 */

Nimbus.getCCVisibility = function(){
	return Nimbus.NimbusObj.GetCCVisibility();
};

/**
 * Sets the Closed Captioning mode.
 * 
 * @param {String} mode Closed captioning mode<br>
 * "Off"<br>
 * "On"<br>
 * "On-Mute" (enable CC when audio is muted by user)<br>
 * @return {Boolean} True if successful
 */

Nimbus.setCCMode = function(state){
	return Nimbus.NimbusObj.SetCCMode(state);
};

/**
 * Gets the Closed Captioning mode.
 * 
 * @return {String} Closed captioning mode. See Nimbus.setCCMode.
 */

Nimbus.getCCMode = function(){
	return Nimbus.NimbusObj.GetCCMode();
};

/**
 * Gets the analog closed captioning mode. 
 * 
 * @return {String} Analog closed captioning mode.  See Nimbus.setAnalogCCMode.
 */

Nimbus.getAnalogCCMode = function(){
	return Nimbus.NimbusObj.GetAnalogCCMode();
};

/**
 * Sets the analog closed captioning mode. 
 *
 * @param {String} mode Analog closed captioning mode<br>
 * "CC1"<br>
 * "CC2"<br>
 * "CC3"<br>
 * "CC4"<br>
 * "TXT1"<br>
 * "TXT2"<br>
 * "TXT3"<br>
 * "TXT4"<br>
 *
 * @return {Boolean} True if successful
 */

Nimbus.setAnalogCCMode = function(mode){
	return Nimbus.NimbusObj.SetAnalogCCMode(mode);
};

/**
 * Gets the digital closed captioning mode.
 * 
 * @return {String} Digital closed captioning mode.  See Nimbus.Player.setDigitalCCMode.
 */

Nimbus.getDigitalCCMode = function(){
	return Nimbus.NimbusObj.GetDigitalCCMode();
};

/**
 * Sets the digital closed captioning mode. 
 *
 * @param {String} mode Digital closed captioning mode<br>
 * "CS1"<br>
 * "CS2"<br>
 * "CS3"<br>
 * "CS4"<br>
 * "CS5"<br>
 * "CS6"<br>
 *
 * @return {Boolean} True if successful
 */

Nimbus.setDigitalCCMode = function(mode){
	return Nimbus.NimbusObj.SetDigitalCCMode(mode);
};

/**
 * Resets all closed captioning options to the default settings.  The default settings
 * are configured via the setup menu/cloning features of the unit.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.resetCC = function(){
	return Nimbus.NimbusObj.ResetCC();
};

/**
 * Enable/disable VChip rating challenge popup which is shown when VChip limits
 * are exceeded by the program rating.  This popup allows the user to enter a
 * code to stop blocking of the program.  When enabled and when active,
 * the popup will claim the input focus.
 * 
 * @param {Boolean} state True if rating challenge popup should be used.
 *
 * @return {Boolean} True if successful
 */

Nimbus.setVChipRatingPopupEnable = function(state){
	return Nimbus.NimbusObj.SetVChipRatingPopupEnable(state);
};

/**
 * Gets the enable state of the VChip rating challenge popup.
 * 
 * @return {Boolean} True if enabled
 */

Nimbus.getVChipRatingPopupEnable = function(){
	return Nimbus.NimbusObj.GetVChipRatingPopupEnable();
};

/**
 * Unblocks the currently VChip-blocked program (as indicated by the
 * Nimbus.Player.isVChipBlocking method).
 * 
 * @return {Boolean} True if successful
 */

Nimbus.allowVChipBlockedProgram = function(){
	return Nimbus.NimbusObj.AllowVChipBlockedProgram();
};

/**
 * Resets all VChip control options to the default settings.  The default settings
 * are configured via the setup menu/cloning features of the unit.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.resetVChip = function(){
	return Nimbus.NimbusObj.ResetVChip();
};

/**
 * Enable/disable the signal status popup.  This popup is shown 5 seconds after
 * tuning if the channel cannot be opened successfully.
 * 
 * @param {Boolean} state True if signal status popup should be used.
 *
 * @return {Boolean} True if successful
 */

Nimbus.setSignalStatusPopupEnable = function(state){
	return Nimbus.NimbusObj.SetSignalStatusPopupEnable(state);
};

/**
 * Gets the enable state of the signal status popup.
 * 
 * @return {Boolean} True if enabled
 */

Nimbus.getSignalStatusPopupEnable = function(){
	return Nimbus.NimbusObj.GetSignalStatusPopupEnable();
};

/**
 * Sends a command code to the native code for processing. These commands must 
 * be one of the Nimbus.Command codes.
 *
 * @param {Number} code  Command code.
 *
 * @return {Boolean} True if successfully sent to the native code.
 */

Nimbus.sendCommand = function(code){
	return Nimbus.NimbusObj.SendCommand("" + code + ",Javascript,");
};

/**
 * Sets the Keyboard Map.
 * 
 * @param {String} type Keyboard Type.<br>
 * "RCMM" - RCMM keyboard<br>
 * "4PPM" - 4PPM keyboard
 * @param {String} map Keyboard Map.<br>
 * "Auto" - Autodetect the correct map where possible<br>
 * "US" - US key mapping<br>
 * "UK" - UK key mapping<br>
 *
 * @return {Boolean} True if successful
 */

Nimbus.setKeyboardMap = function(type, map){
	return Nimbus.NimbusObj.SetKeyboardMap(type, map);
};

/**
 * Gets the Keyboard Map.
 * 
 * @param {String} type  Keyboard Type.  See setKeyboardMap.
 *
 * @return {String} Keyboard Map.
 */

Nimbus.getKeyboardMap = function(type){
	return Nimbus.NimbusObj.GetKeyboardMap(type);
};

/**
 * Route the specified IR or USSB HID command code to the Nimbus event handler.
 * This is used to override the default command routing that causes
 * some commands/keys to be routed to the web browser and not to the Nimbus
 * application (ie. all keys on a keyboard).
 * 
 * Use this method to route special keyboard/remote commands (such as
 * the top-row function keys) that would normally be routed to the browser.
 * 
 * For USB Keyboard override, use only the IRCodeUpper Field, IRCodeLower should be 0.
 * Intercpeted keys will come into the Nimbus Event Handler as Nimbus.Command.Intercept, 
 * but will also be deliviered to the browser.
 * The IRCodeUpper Field is a map to describe the keystroke, broken out as:
 *    0xSSMMCCCC
 * where:
 *   SS   = KeyState, set as 01 for depressed or 00 for up
 *   MM   = Key Modifiers bitmask.  Values can be combined. Set mask to cover values for
 *             NONE    0x00
 *             CONTROL 0x01
 *             SHIFT   0x02
 *             ALT     0x04
 *             META    0x08
 *             SUPER   0x10
 *   CCCC = Key Code.  This can be the ASCII value for Number and Letter keys, or the 
 *          Opera GOGI Keycode for special keys:
 *            E001 F1     E00F F15       E029 UP        E037 ENTER
 *            E002 F2     E010 F16       E02A DOWN      E038 ALT
 *            E003 F3     E011 F17       E02B LEFT      E039 SHIFT
 *            E004 F4     E012 F18       E02C RIGHT     E03A CTRL
 *            E005 F5     E013 F19       E02D ESC       E03B CONTEXT_MENU
 *            E006 F6     E014 F20       E02E DIV       E04F GP_START
 *            E007 F7     E015 F21       E02F MUL       E050 CAPS_LOCK
 *            E008 F8     E016 F22       E030 ADD       E051 NUM_LOCK
 *            E009 F9     E017 F23       E031 DEC       E052 SCROLL_LOCK
 *            E00A F10    E018 F24       E032 INS       E053 PAUSE
 *            E00B F11    E025 HOME      E033 DEL       E054 PRINT_SCREEN
 *            E00C F12    E026 END       E034 BACKSPACE
 *            E00D F13    E027 PAGEUP    E035 TAB
 *            E00E F14    E028 PAGEDOWN  E036 SPACE
 * 
 * @param {String} IRType       IR protocol.  See definition of Nimbus.Command.IRType.
 * @param {Number} IRCodeUpper  Upper 32bits of IR code or Keyboard Key mask
 * @param {Number} IRCodeLower  Lower 32bits of IR code.
 *
 * @return {Boolean} True if successful
 */

Nimbus.setNimbusCmdRouting = function(IRType, IRCodeUppper, IRCodeLower){
	return Nimbus.NimbusObj.SetNimbusCmdRouting(IRType, IRCodeUppper, IRCodeLower);
};

/**
 * Reset the routing of the specified command to the defaults.
 * 
 * @param {String} IRType       IR protocol.  See definition of Nimbus.Command.IRType.
 * @param {Number} IRCodeUpper  Upper 32bits of IR code.
 * @param {Number} IRCodeLower  Lower 32bits of IR code.
 *
 * @return {Boolean} True if successful
 */

Nimbus.resetNimbusCmdRouting = function(IRType, IRCodeUppper, IRCodeLower){
	return Nimbus.NimbusObj.ResetNimbusCmdRouting(IRType, IRCodeUppper, IRCodeLower);
};

/**
 * Reset all command routing back to defaults.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.resetAllNimbusCmdRouting = function(){
	return Nimbus.NimbusObj.ResetAllNimbusCmdRouting();
};

/**
 * Send the specified key to the browser.  This allows remapping of IR/cmd codes
 * into Unicode keys to the browser.
 * 
 * @param {Number} key      16-bit Unicode keycode or one the Nimbus.BrowserKey values.
 * @param {Boolean} bShift  True to apply shift modifier.
 * @param {Boolean} bCtrl   True to apply control modifier.
 * @param {Boolean} bAlt    True to apply alt modifer.
 *
 * @return {Boolean} True if successful
 */

Nimbus.sendKeyToBrowser = function(key, bShift, bCtrl, bAlt){
	return Nimbus.NimbusObj.SendKeyToBrowser(key, bShift, bCtrl, bAlt);
};

////////////////////////////////////////////////////////////////////////
//
// Output control functionality
//
////////////////////////////////////////////////////////////////////////

/**
 * Returns true if the A/V output is enabled and producing a signal.
 * 
 * @return {Boolean} True if STB/IMP output is enabled and active
 */

Nimbus.isOutputActive = function(){
	return Nimbus.NimbusObj.GetOutputActiveStatus();
};

/**
 * Enables or disables copy protection features on the STB/IMP output(s).  If
 * disabled, then protected content will not be playable.
 *
 * This method is permitted only when the app is served from
 * an authenticated web server.
 * 
 * @param {Boolean} state  True to enable protection
 *
 * @return {Boolean} True if successful
 */

Nimbus.setOutputProtection = function(state){
	return Nimbus.NimbusObj.SetOutputProtectionEnable(state);
};

/**
 * Gets the enable state of the video output copy protection features.
 * 
 * @return {Boolean} True if protection enabled
 */

Nimbus.getOutputProtection = function(){
	return Nimbus.NimbusObj.GetOutputProtectionEnable();
};

/**
 * @ignore
 * <b>Deprecated - renamed to getOutputProtection</b>
 */

Nimbus.getOutputProtected = function(){
	return Nimbus.NimbusObj.GetOutputProtectionEnable();
};

/**
 * Applies the current A/V output configuration if the STB is in the ON state.
 * 
 * @return {Boolean} True if successful.  False if unit is 'OFF'.
 */

Nimbus.applyOutputSettings = function(){
	return Nimbus.NimbusObj.ApplyOutputSettings();
};

////////////////////////////////////////////////////////////////////////
//
// Misc functionality
//
////////////////////////////////////////////////////////////////////////

/**
 * Gets the application data from non-volatile memory.
 *
 * @param {Boolean} bCommon     True to retrieve persistent data that is stored regardless of app location
 * @param {Boolean} bTemporary  True to retrieve a copy stored in temporary ram
 *
 * @return {String} Application data
 */

Nimbus.getAppData = function(bCommon, bTemporary){
	return Nimbus.NimbusObj.GetAppData(bCommon, bTemporary);
};

/**
 * Sets the specified application data into non-volatile memory.
 * The data is stored on a per host basis unless bCommon is specified as true.
 * The maximum size is 100kB.
 *
 * @param {String} appData      Application data string.
 * @param {Boolean} bCommon     True to set data that is accessible by any Nimbus app
 * @param {Boolean} bTemporary  True to set data to a file in temporary ram instead of the system flash
 *
 * @return {Boolean} True if successful
 */

Nimbus.setAppData = function(appData, bCommon, bTemporary) {
    return Nimbus.NimbusObj.SetAppData(appData, bCommon, bTemporary);
};

/**
 * Gets the user data stored in the STB settings.  This value can be set
 * and read by the Nimbus application for such purposes as identifying the unit or
 * the unit location.  This value can also be read/set via the Network API of the
 * STB.
 *
 * @return {String} User data, max 31 characters
 */

Nimbus.getUserData = function(){
	return Nimbus.NimbusObj.GetUserData();
};

/**
 * Sets the user data stored in the STB settings.  See getUserData for more info.
 *
 * @param {String} data User data, max 31 characters
 *
 * @return {Boolean} True if successful
 */

Nimbus.setUserData = function(data){
	return Nimbus.NimbusObj.SetUserData(data);
};

/**
 * Trigger a playlist rescan.  The firmware will check all content drives and
 * update the internal list of available playlists.  This method should be called
 * if playlist content is changed by an external application running on the STB.
 * This method is not necessary if Nimbus.updateContent is used to update the play
 * lists/content.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.triggerPlaylistRescan = function(){
	return Nimbus.NimbusObj.TriggerPlaylistRescan();
};

/**
 * Enables/disables an external power switch.  Some STBs include an output
 * port for controlling a special A/C power strip/switch.
 *
 * @param {Boolean} bEnabled True to enable the external power switch.
 *
 * @return {Boolean} True if successful
 */

Nimbus.setExtPowerControlEnable = function(bEnabled) {
    return Nimbus.NimbusObj.SetExtPowerControlEnable(bEnabled);
};

/**
 * Gets the state of the external power control.
 *
 * @return {Boolean} True if enabled, False if disabled, Null if feature not available.
 */

Nimbus.getExtPowerControlEnable = function(){
	return Nimbus.NimbusObj.GetExtPowerControlEnable();
};

/**
 * Logs the specified message to the console.
 * 
 * @param {String} msg Message to log
 *
 * @return None
 */
Nimbus.logMessage = function(msg){
	Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_APP, msg);
}	

/**
 * Sets the parameters used by the native code to check a URL for connectivity.
 * When a URL is specified, the native code will try to open the URL. If it cannot 
 * connect, the notification event Nimbus.Event.MESSAGE_URL_CHECK_FAILED will 
 * be sent to the Nimbus app.  If it can connect, the event 
 * Nimbus.Event.MESSAGE_URL_CHECK_OK will be sent.
 *
 * If no URL is specified, then checking is disabled.
 * 
 * @param {String} URL      URL to test.  Specify null to disable checking.
 * @param {Number} Timeout  Time to wait for connection in seconds.
 * @param {Number} Period   Time between checks in seconds.
 *
 * @return {Boolean} True if successful
 */

Nimbus.setURLChecking = function(url, timeout, period){
	return Nimbus.NimbusObj.SetURLChecking(url, timeout, period);
};

/**
 * Gets the web application URL specified by DHCP.
 * 
 * @return {String} URL in DHCP or null if none specified.
 */

Nimbus.getDHCPAppURL = function(){
	return Nimbus.NimbusObj.GetDHCPAppURL();
};

/**
 * Opens the specified URL as the Nimbus application page.
 * 
 * @param {String} URL  URL to open.  This page may be external or stored locally on the STB.
 *                      Example local URL: file://localhost/tmp/internal/sysflash/disk/user/nimbus/html/my_page.html
 *
 * @return {Boolean} True if successful
 */

Nimbus.openURL = function(url){
	return Nimbus.NimbusObj.OpenURL(url);
};

/**
 * Enables or disables the loading of the main Nimbus page via the DHCP-specified URL.
 * The default is to disable loading.  
 * 
 * ** PLEASE NOTE**
 * The startup page residing on the STB MUST call this method with True specified to 
 * allow an external page to be loaded.  
 * 
 * @param {Boolean} state  True to enable loading
 *
 * @return {Boolean} True if successful
 */

Nimbus.setMainPageLoadingEnable = function(state){
	return Nimbus.NimbusObj.SetMainPageLoadingEnable(state);
};

/**
 * Gets the enable state for the loading of the main Nimbus page via
 * the DHCP-specified URL.
 * 
 * @return {Boolean} True if loading is enabled
 */

Nimbus.getMainPageLoadingEnable = function(){
	return Nimbus.NimbusObj.GetMainPageLoadingEnable();
};

/**
 * Sets the timing parameters used when loading the main Nimbus page.  To ensure these parameters
 * are used for the initial main page load, call this method in the page load event of the
 * startup/resident Nimbus application.  The purpose of these parameters is to tune the page loading
 * timing of the STB to accommodate the load capacity of the web server.
 *
 * Before loading a Nimbus page from a server, a TCP connection test to the server is performed.
 * If this fails, then a delay of LoadRetryDelay is used before trying again.  If the test succeeds,
 * a random delay from 0 to LoadDelayMax is used before trying to open the page with the browser.  If
 * the browser fails to load the page, a delay of LoadRetryDelay is used before starting the 
 * overall procedure again.
 * 
 * @param {Number} OpenTestTimeout Timeout in ms when verifying the connection with the server.
 * @param {Number} LoadRetryDelay  If the connection test fails, a delay of this amount (in ms) will be used
 *                                 before testing the connection again.
 * @param {Number} LoadDelayMax    If the connection test succeeds, a random delay from 0 to LoadDelayMax ms will be
 *                                 used before trying to open the page with the browser.
 *
 * @return {Boolean} True if successful
 */

Nimbus.setMainPageLoadingParameters = function(OpenTestTimeout, LoadRetryDelay, LoadDelayMax){
	return Nimbus.NimbusObj.SetMainPageLoadingParameters(OpenTestTimeout, LoadRetryDelay, LoadDelayMax);
};

/**
 * Sets the specified firmware log level setting.
 * 
 * @param {String} Category Logging category:<br>
 * "App" - Application level<br>
 * "Lib" - Library level<br>
 * "Nimbus" - Nimbus API level<br>
 * @param {Number} Level Logging level, [0-6], -1 to set to default level
 *
 * @return {Boolean} True if log level set
 */

Nimbus.setLogLevel = function(Category, Level){
	return Nimbus.NimbusObj.SetLogLevel(Category, Level);
};

/**
 * Gets the specified firmware log level setting.
 * 
 * @param {String} Category Logging category, see setLogLevel
 *
 * @return {Number} Log level, or -1 if invalid category
 */

Nimbus.getLogLevel = function(Category){
	return Nimbus.NimbusObj.GetLogLevel(Category);
};

/**
 * Sets the syslog host.
 * 
 * @param {String} Host  Host to send system logging messages. Null to disable.
 *
 * @return {Boolean} True if host set
 */

Nimbus.setSysLogHost = function(Host){
	return Nimbus.NimbusObj.SetSysLogHost(Host);
};

/**
 * Triggers the dumping of the browser error log to console and syslog (if enabled).
 * 
 * @return {Boolean} True
 */

Nimbus.dumpBrowserLog = function(){
	return Nimbus.NimbusObj.DumpBrowserLog();
};

/**
 * Triggers the dumping of the current contents of the system log back to the system log.
 * This can be useful immediately after *remote* system logging is enabled to force existing
 * messages in the local log file to be sent to the remote host.
 * 
 * @return {Boolean} True
 */

Nimbus.dumpSystemLog = function(){
	return Nimbus.NimbusObj.DumpSystemLog();
};

/**
 * Gets the number of seconds since the last keyboard/mouse command was sent to the browser.
 * This does not include commands routed thru Nimbus events.
 * 
 * @return {Number} Number of seconds since the last keyboard/mouse command was sent to browser.
 */

Nimbus.getTimeSinceLastBrowserInput = function(){
	return Nimbus.NimbusObj.GetTimeSinceLastBrowserInput();
};

/**
 * Sends a message out the Auxiliary Serial Port using the "APP" message type.  See
 * the Enseo Auxiliary Serial Protocol document for more details.
 * 
 * @param {String} Message  Message to be sent.
 * @return {Boolean} True if message queued.
 */

Nimbus.sendAuxSerialMessage = function(message){
	return Nimbus.NimbusObj.SendAuxSerialMessage(message);
};

/**
 * Opens and listens on a TCP port for 'Auxiliary Control' commands.
 * These commands are processed in exactly the same as if they were
 * received over the auxiliary serial port.
 *
 * Only one TCP port can be monitored for auxiliary commands at a time. Only
 * one network client can establish a connection on such a port at a time.
 *
 * To close the TCP port use Nimbus.closeAuxNetPort().  To send a message
 * over a connection established on the port use Nimbus.sendAuxNetMessage().
 * 
 * @param {Number} port  The TCP port to use
 * @return {Boolean} True if server port opened and listening
 */

Nimbus.openAuxNetPort = function(port){
	return Nimbus.NimbusObj.OpenAuxNetPort(port);
};

/**
 * Close an active 'AuxNet' TCP network server.
 * 
 * @return {Boolean} True if server port is closed.
 */

Nimbus.closeAuxNetPort = function(){
	return Nimbus.NimbusObj.CloseAuxNetPort();
};

/**
 * Sends a message on a 'AuxNet' TCP network connection using the "APP" message type.
 * 
 * @param {String} Message  Message to be sent.
 * @return {Boolean} True if message queued.
 */

Nimbus.sendAuxNetMessage = function(message){
	return Nimbus.NimbusObj.SendAuxNetMessage(message);
};

/**
 * Gets the current 'aux net' connection status.
 *
 * @return {Object} Connection status.
 * 	{Boolean} connection    - Indicates whether a connection with a network client is established.<br>
 * 	{String}  clientAddress - The IPv4 address of the client if connection is true.<br>
 *  {Number}  clientPort    - The port of of the client if connection is true.
 * 
 */

Nimbus.getAuxNetConnectionStatus = function(){
	var json = Nimbus.NimbusObj.GetAuxNetConnectionStatus ();
	if (json == null) {
		return null;
	}
	return eval('(' + json + ')');
};

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Sets the specified 'tweaking' parameter.
 *
 * @param {String} Name   Name of parameter.
 * @param {String} Value  Value of parameter (use empty string to unset tweak).
 *
 * @return {Boolean} True if set/unset.
 */

Nimbus.setTweakValue = function(Name, Value){
	return Nimbus.NimbusObj.SetTweakValue(Name, Value);
};

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Gets the specified 'tweaking' parameter.
 *
 * @param {String} Name  Name of parameter.
 *
 * @return {String} Current value of the parameter if it has been previously set.
 */

Nimbus.getTweakValue = function(Name){
	return Nimbus.NimbusObj.GetTweakValue(Name);
};

/**
 * @ignore
 * Enables/disables passing of the Test Key C to the Nimbus app
 *
 * @param {Boolean} bEnabled  True to enablehandling of key in Nimbus app.
 * 					          If false, key will be used as an app reload command by default
 *
 * @return {Boolean} True if successful
 */

Nimbus.setTestKeyCCustom = function(bEnabled) {
    return Nimbus.NimbusObj.SetTestKeyCCustom(bEnabled);
};

/**
 * @ignore
 * Gets the state of Test Key C pass-thru to the Nimbus app
 *
 * @return {Boolean} True if enabled, False if disabled, Null if feature not available.
 */

Nimbus.getTestKeyCCustom = function(){
	return Nimbus.NimbusObj.GetTestKeyCCustom();
};

////////////////////////////////////////////////////////////////////////
//
// General purpose settings functionality
//
////////////////////////////////////////////////////////////////////////

/**
 * Returns all firmware settings in XML format.  'Sensitive' settings are not
 * returned (e.g. encryption keys).
 *
 * @return {String} Settings formatted as XML.
 */

Nimbus.getSettingsXml = function() {
	return Nimbus.NimbusObj.GetSettingsXml ();
};

/**
 * Set the firmware settings using the specified XML string.  The XML declaration (&lt? xml
 * version="1.0" ?&gt) is not required but settings should be supplied under
 * top-level &lt ENSEO_STB_SETTINGS&gt tag.  If bApplyAgainstDefaults is set to
 * true all of the settings will be defaulted.  Note that in doing so all
 * current settings are lost.  Any settings supplied in the string will be
 * merged over the defaults.  If the string is empty no settings will
 * be applied and all settings are defaulted.  If the string is empty and
 * bApplyAgainstDefaults is false, no change to settings will occur.
 *
 * @param {String} xml                     XML string containing settings values to be changed.
 * @param {Boolean} applyAgainstDefaults   If false, no other settings will be changed
 *                                         (they will remain at their current values.)  If true, all settings
 *                                         will be defaulted before applying the XML setting values.
 * @return {Boolean} True if successful
 */

Nimbus.setSettingsXml = function(xml, applyAgainstDefaults) {
	return Nimbus.NimbusObj.SetSettingsXml(xml, applyAgainstDefaults);
};

////////////////////////////////////////////////////////////////////////
//
// (Network) Time functionality
//
////////////////////////////////////////////////////////////////////////

/**
 * Sets the time zone delta used to localize the time display.
 * For example, specify -6 for US central standard time.
 * 
 * Calling this method will set the time zone mode to "Delta".
 * See the setTimeZoneMode method.
 *
 * @param {Number} tzDeltaHours  Number of hours [-23, 23]
 * @param {Number} tzDeltaMins   Number of mins  [0, 59]
 *
 * @return {Boolean} True if successful
 */

Nimbus.setTimeZoneDelta = function(tzDeltaHours, tzDeltaMins){
	return Nimbus.NimbusObj.SetTimeZoneDelta(tzDeltaHours, tzDeltaMins);
};

/**
 * Returns the current time zone delta.
 *
 * @return {Object} Time zone delta:<br>
 *  {Number}  tzDeltaHours - The time zone delta hours [-23, 23]<br>
 *  {Number}  tzDeltaMins  - The time zone delta mins  [0, 59]<br>
 *  or null if not supported.
 * 
 */

Nimbus.getTimeZoneDelta = function(){
	var json = Nimbus.NimbusObj.GetTimeZoneDelta ();
	if (json == null) {
		return null;
	}
	return eval('(' + json + ')');
};

/**
 * Sets the time zone name.  Two names should be specified to
 * ensure compatibility with all Enseo STB platforms since some
 * conform to a POSIX style timezone specifier and others conform
 * to the more modern zone information file method.
 * 
 * Calling this method will set the time zone mode to "Name". See
 * the setTimeZoneMode method.
 *
 * @param {String} tzPOSIXName POSIX timezone description string, ex. 'CST6CDT' 
 * @param {String} tzZoneName  Zone information name, ex. 'America/Chicago'
 *
 * @return {Boolean} True if successful. False if not supported.
 */

Nimbus.setTimeZoneName = function(tzPOSIXName, tzZoneName){
	try {
		return Nimbus.NimbusObj.SetTimeZoneName(tzPOSIXName, tzZoneName);
	} catch (e) {}
	return false;
};

/**
 * Returns the current time zone name.
 *
 * @return {Object} Time zone names:<br>
 *  {String}  tzPOSIXName - POSIX timezone description<br>
 *  {String}  tzZoneName  - Zone information name<br>
 * or null if not supported.
 */

Nimbus.getTimeZoneName = function(){
	try {
		var json = Nimbus.NimbusObj.GetTimeZoneName();
		if (json == null) {
			return null;
		}
		return eval('(' + json + ')');
	} catch (e) {}
	return null;
};

/**
 * Sets the time zone mode.
 * 
 * @param {String} tzMode Time zone mode. One of:<br>
 *                  "Delta" - Use specified delta values<br>
 *                  "DHCP" - Use DHCP provided time zone<br>
 *				    "Name" - Use specified timezone name
 *
 * @return {Boolean} True if successful.  False if not supported.
 */

Nimbus.setTimeZoneMode = function(tzMode){
	try {
		return Nimbus.NimbusObj.SetTimeZoneMode(tzMode);
	} catch (e) {}
	return false;
};

/**
 * Returns the current time zone mode.
 *
 * @return {String} tzMode - See setTimeZoneMode.  Null if not supported.
 */

Nimbus.getTimeZoneMode = function(){
	try {
		return Nimbus.NimbusObj.GetTimeZoneMode();
	} catch (e) {}
	return null;
};


/**
 * Returns the current system time in seconds since the POSIX Epoch.  This
 * time can be multiplied by 1000 to convert to milliseconds and used to
 * construct a Date object.
 *
 * @return {Number}   - The time in seconds since the epoch.  -1 is returned on error.
 */

Nimbus.getSysEpochTime = function()
{
	var seconds = -1;
	try {
		seconds = Nimbus.NimbusObj.GetSysEpochTime ();
	} catch (e) {	}
	return seconds;
};

/**
 * Enables or disables use of NTP server for setting the time.  This is an
 * alternative method to that of using DHCP to provide NTP server details.
 * When using this method to specify the NTP server, the DHCP info
 * should not specify the NTP server and, in general, the IP address
 * should be static.  Note that DNS should be set up correctly on the box
 * so that NTP server name resolution can be performed.  These settings
 * are persisted between reboots and may not take effect until the box is
 * rebooted.  However, if NTP is being enabled an immediate attempt will
 * be made to retrieve time information from the supplied NTP server.  If
 * NTP is already running (for example, if the NTP server name was
 * provided by DHCP) then these NTP settings will be stored but NTP will
 * not be reset.  If NTP is being disabled and NTP was previously used the
 * current time will not be unset.
 * 
 * @param {Boolean} enable  Enable NTP if set to true.  Disable NTP if false.
 * @param {String}  NTP1    The name or IP address of a NTP server
 *
 * @return {Boolean} True if successful
 */

Nimbus.setNTPEnable = function (enable, NTP1){
	return Nimbus.NimbusObj.SetNTPEnable (enable, NTP1);
};

/**
 * Returns the current NTP settings.
 *
 * @return {Object} NTP settings:<br>
 *  {Boolean} enable - Whether stored (as opposed to DHCP) NTP server address is enabled<br>
 *  {String}  NTP1   - The stored name or IP address of the NTP server
 */

Nimbus.getNTPEnable = function(){
	var json = Nimbus.NimbusObj.GetNTPEnable ();
	if (json == null) {
		return null;
	}
	return eval('(' + json + ')');
};

////////////////////////////////////////////////////////////////////////
//
// Network functionality
//
////////////////////////////////////////////////////////////////////////

/**
 * Returns whether Network Discovery is enabled.
 * 
 * @return {Boolean} True if Network Discovery is enabled.
 */

Nimbus.getNetworkDiscoveryEnable = function(){
	return Nimbus.NimbusObj.GetNetworkDiscoveryEnable();
};

/**
 * Enables or disables Network Discovery.  The network
 * discovery feature provides a facility for finding Enseo STB units
 * on the network.
 *
 * Note that this setting takes immediate effect and is persisted between reboots. 
 *
 * @param {Boolean} setting  True to enable Network Discovery. False to disable.
 *
 * @return {Boolean} True if Network Discovery state change successful.
 */

Nimbus.setNetworkDiscoveryEnable = function(setting){
	return Nimbus.NimbusObj.SetNetworkDiscoveryEnable(setting);
};

/**
 * Return whether the Network API is enabled.
 * 
 * @return {Boolean} True if Network API is enabled.
 */

Nimbus.getNetworkAPIEnable = function(){
	return Nimbus.NimbusObj.GetNetworkAPIEnable();
};

/**
 * Enables or disables the Network API.  Note that this setting
 * takes immediate effect and is persisted between reboots.
 *
 * @param {Boolean} setting True to enable the Network API. False to disable.
 *
 * @return {Boolean} True if Network API state change successful.
 */

Nimbus.setNetworkAPIEnable = function(setting){
	return Nimbus.NimbusObj.SetNetworkAPIEnable(setting);
};

/**
 * Return whether a named Network API call is enabled.
 * Note that even if the Network API call is enabled it will not be
 * available if the Network API is disabled.
 * 
 * @param {String} name  The name of the Network API call (method).
 *
 * @return {Boolean} True if the named Network API call is enabled.
 */

Nimbus.getNetworkAPICallEnable = function(name){
	return Nimbus.NimbusObj.GetNetworkAPICallEnable(name);
};

/**
 * Enables or disables a named Network API call.  Note that the enable
 * state is not persisted between reboots.  This function can be called
 * whether the Network API is currently enabled or not.  If the Network
 * API is currently disabled, the Network API call will be enabled or
 * disabled as set by this function if and when the Network API is next
 * enabled.
 * 
 * @param {String} name    The name of the Network API call (method).
 * @param {Boolean} state  True to enable the Network API call (method). False to disable.
 *
 * @return {Boolean} True if the named Network API call is enabled.
 */

Nimbus.setNetworkAPICallEnable = function(name, state){
	return Nimbus.NimbusObj.SetNetworkAPICallEnable(name, state);
};

/**
 * Enable or disable all Network API calls.  Note that the enable state is
 * not persisted between reboots.  This function can be called whether the
 * Network API is currently enabled or not.  If the Network API is
 * currently disabled, the Network API calls will be enabled or disabled
 * as set by this function if and when the Network API is next enabled.
 * 
 * @param {String} name    The name of the Network API call (method).
 * @param {Boolean} state  True to enable the Network API call (method). False to disable.
 *
 * @return {Boolean} True if the named Network API call is enabled.
 */

Nimbus.setNetworkAPIAllCallsEnable = function(state){
	return Nimbus.NimbusObj.SetNetworkAPIAllCallsEnable(state);
};


/**
 * Return the current configured Network Hostname used by the STB.
 *
 * The Network host name can be a max length of 31 characters.  the function
 * will return "DEFAULT" if the box is using the default hostname.
 * 
 * @return {String} Current configured Network hostname.
 */

Nimbus.getNetworkHostname = function(){
	return Nimbus.NimbusObj.GetNetworkHostname();
};

/**
 * Set or clear the network hostname for the STB. Note that this setting
 * is persisted between reboots.
 *
 * @param {String} hostname  New host name to use, or "DEFAULT" to restore to default setting
 * @param {Boolean} bApply   True to apply the setting immediately.  Network 
 *                           connectivity may be interrupted.
 * @return {Boolean} True if Network hostname change is successful.
 */

Nimbus.setNetworkHostname = function(hostname, bApply){
	return Nimbus.NimbusObj.SetNetworkHostname(hostname, bApply);
};

/**
 * Apply the previously specified Network settings.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.applyNetworkSettings = function(){
	return Nimbus.NimbusObj.ApplyNetworkSettings();
}

/**
 * Send a TCP message to a given address:port without waiting for a reply.
 * 
 * @param {String} address  TCP Address.
 * @param {Number} port     TCP port.
 * @param {String} message  Message, can be a string or an Array of byte values.
 *
 * @return {Boolean} True if the named Network API call is enabled.
 */

Nimbus.sendDirectTCPMessageTo = function(address, port, message) {
	if ('string' == typeof (message)) {
		// Pass the message string as-is
		return Nimbus.NimbusObj.SendDirectTCPMessageTo(address, port, message);
	} else if ('object' == typeof (message)) {
		// Treat the message as an array of byte values.
		var msg   = message.toString();
		var nelms = message.length;
		return Nimbus.NimbusObj.SendDirectTCPMessageTo(address, port, msg, nelms);
	}
	return false;
};

/**
 * Send a UDP message to a given address:port without waiting for a reply.
 * 
 * @param {String} address  UDP Address.
 * @param {Number} port     UDP port.
 * @param {String} message  Message can be a string or an Array of byte values.
 *
 * @return {Boolean} True if the named Network API call is enabled.
 */

Nimbus.sendDirectUDPMessageTo = function(address, port, message) {
	if ('string' == typeof (message)) {
		// Pass the message string as-is
		return Nimbus.NimbusObj.SendDirectUDPMessageTo(address, port, message);
	} else if ('object' == typeof (message)) {
		// Treat the message as an array of byte values.
		var msg   = message.toString();
		var nelms = message.length;
		return Nimbus.NimbusObj.SendDirectUDPMessageTo(address, port, msg, nelms);
	}
	return false;
};

/**
 * Gets a list of available network device IDs.  Use one of these IDs to select a device
 * when calling the getNetworkDevice function. The possible values are:<br>
 * "ethernet0/1/2"<br>
 * "cable_modem0"<br>
 * 
 * @return {Array} Array of device IDs
 */

Nimbus.getNetworkDeviceList = function(){
	// Get the number of devices
	var count = Nimbus.NimbusObj.NetworkDeviceCount;
	// Build a list of the device ID strings	
	var DevList = [];
	for (var i = 0; i < count; i++) {
		DevList[i] = Nimbus.NimbusObj.GetNetworkDeviceName(i);
	}
	return DevList;	
};

/**
 * Gets an interface to the specified network device. The device ID is obtained from
 * getNetworkDeviceList.
 * 
 * @param {String} DeviceId  The ID of the network device
 *
 * @return {Nimbus.NetworkDevice} Instance of the network device interface
 */

Nimbus.getNetworkDevice = function(DeviceId){
	// Create a new network device class
	return new Nimbus.NetworkDevice(DeviceId);
};

/**
 * Class providing an interface for controlling a network device - use Nimbus.getNetworkDevice to
 * obtain an instance.
 * 
 * @class
 */

Nimbus.NetworkDevice = function(DeviceId){
	// Create a native js network device object for the specified device
	this.NetDevObj = new EONimbusNetworkDevice(DeviceId);
	Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.NetworkDevice constructor, DeviceId=" + DeviceId);
};

/**
 * Enables or disables the network device.
 * 
 * @param {Boolean} state  True to enable the device
 *
 * @return {Boolean} True if successful
 */

Nimbus.NetworkDevice.prototype.setEnabled = function(state){
	if (this.NetDevObj == null) {
		return null;
	}
	return this.NetDevObj.SetEnable(state);
};

/**
 * Get enable state of the network device.
 * 
 * @return {Boolean} True if network device is enabled
 */

Nimbus.NetworkDevice.prototype.getEnabled = function(){
	if (this.NetDevObj == null) {
		return null;
	}
	return this.NetDevObj.GetEnable();
};

/**
 * Gets the type of network device this object represents.
 * 
 * @return {String} Network device type.  See getNetworkDeviceList for the possible values.
 */

Nimbus.NetworkDevice.prototype.getLinkType = function() {
	if (this.NetDevObj == null) {
		return "unknown";
	}
	var type = this.NetDevObj.Type;
	Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "getLinkType, type= " + type);
	return type;
};

/**
 * Gets the MAC address of the network device.
 * 
 * @return {String} MAC address
 */

Nimbus.NetworkDevice.prototype.getMAC = function(){
	if (this.NetDevObj == null) {
		return null;
	}
	return this.NetDevObj.GetMACAddress();
};

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Sets the MAC address of the network device.  The STB must be
 * rebooted before the change will take effect.
 * 
 * @param {String} MAC address
 * @param {String} Password
 * 
 * @return {Boolean} True if successful
 * 
 */

Nimbus.NetworkDevice.prototype.setMAC = function(mac, pw){
	if (this.NetDevObj == null) {
		return null;
	}
	return this.NetDevObj.SetMACAddress(mac, pw);
};

/**
 * Gets the IP address of the network device.
 * 
 * @return {String} IP address, or null if the device does not have an IP
 */

Nimbus.NetworkDevice.prototype.getIP = function(){
	if (this.NetDevObj == null) {
		return null;
	}
	return this.NetDevObj.GetIPAddress();
};

/**
 * Gets the netmask of the network device.
 * 
 * @return {String} Netmask in IP format, or null if the device does not have a netmask
 */

Nimbus.NetworkDevice.prototype.getNetmask = function(){
	if (this.NetDevObj == null) {
		return null;
	}
	return this.NetDevObj.GetNetmask();
};

/**
 * Gets the gateway IP address of the network device.
 * 
 * @return {String} Gateway IP, or null if the device does not have a gateway
 */

Nimbus.NetworkDevice.prototype.getGateway = function(){
	if (this.NetDevObj == null) {
		return null;
	}
	return this.NetDevObj.GetGateway();
};

/**
 * Gets an interface to the ethernet switch device.
 * 
 * @return {Nimbus.EthernetSwitch} Instance of the ethernet switch interface
 */

Nimbus.getEthernetSwitch = function(){
	return new Nimbus.EthernetSwitch();
};

/**
 * Class for controlling an ethernet switch - use Nimbus.getEthernetSwitch to obtain an instance.
 * 
 * @class
 */

Nimbus.EthernetSwitch = function(){
};

/**
 * Enables or disables VLAN tagging on the ethernet switch.
 *
 * @param {Boolean} state  True to enable VLAN tagging; False to disable.
 * @return {Boolean} True if successful
 * 
 */

Nimbus.EthernetSwitch.prototype.setVLANEnable = function(state){
	return Nimbus.NimbusObj.SetVLANEnable(state);
};

/**
 * Gets the enable state of VLAN tagging.
 * 
 * @return {Boolean} True if VLAN tagging is enabled
 */

Nimbus.EthernetSwitch.prototype.getVLANEnable = function(){
	return Nimbus.NimbusObj.GetVLANEnable();
};

/**
 * Sets the specified VLAN ID for the specified port.
 *
 * @param {String} port  The port to be assigned the ID: "STB", "Guest"
 * @param {Number} id    The VLAN ID: [1-4095], Lower 4 bits of ID must be unique
 *					     for each port.
 * @return {Boolean} True if successful
 */

Nimbus.EthernetSwitch.prototype.setVLANID = function(port, id){
	return Nimbus.NimbusObj.SetVLANID(port, id);
};

/**
 * Gets the VLAN ID for the specified port.
 *
 * @param {String} port  The port to be queried for the ID. See setVLANID.
 * @return {Number} VLAN ID, or -1 if invalid port.
 */

Nimbus.EthernetSwitch.prototype.getVLANID = function(port){
	return Nimbus.NimbusObj.GetVLANID(port);
};

/**
 * Sets the enable state for the specified switch port.
 *
 * @param {String} port    The port to be modified: "Guest"
 * @param {Boolean} state  True to enable port at boot time
 *
 * @return {Boolean} True if successful
 */

Nimbus.EthernetSwitch.prototype.setEnable = function(port, state){
	return Nimbus.NimbusObj.SetSwitchPortEnable(port, state);
};

/**
 * Gets the enable state for the specified switch port.
 *
 * @param {String} port  The port to be queried. See setEnable.
 * @return {Boolean} Enable state, or null if invalid port.
 */

Nimbus.EthernetSwitch.prototype.getEnable = function(port){
	return Nimbus.NimbusObj.GetSwitchPortEnable(port);
};

/**
 * Sets the boot enable state for the specified switch port.  This
 * setting will be used when the STB boots.
 *
 * @param {String} port    The port to be modified: "Guest"
 * @param {Boolean} state  True to enable port at boot time
 *
 * @return {Boolean} True if successful
 */

Nimbus.EthernetSwitch.prototype.setBootEnable = function(port, state){
	return Nimbus.NimbusObj.SetSwitchPortBootEnable(port, state);
};

/**
 * Gets the boot enable state for the specified switch port.
 *
 * @param {String} port  The port to be queried. See setBootEnable.
 * @return {Boolean} Enable state, or null if invalid port.
 */

Nimbus.EthernetSwitch.prototype.getBootEnable = function(port){
	return Nimbus.NimbusObj.GetSwitchPortBootEnable(port);
};

/**
 * Apply the previously specified ethernet switch settings.
 * 
 * @return {Number} True if successful
 */

Nimbus.EthernetSwitch.prototype.applySettings = function(){
	return Nimbus.NimbusObj.ApplyEthernetSwitchSettings();
};


/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Starts TouchKit Calibration if device is available
 *
 * @return {Boolean} True if successful.
 */

Nimbus.startTKCalibration = function(){
    return Nimbus.NimbusObj.StartTKCalibration();
};

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Gets the type of MTI PPV Control system that can be attached to the STB
 * 
 * @return {String} : One of br>
 * "LN_Terminal" - Lodgenet Terminal<br>
 * "LN_Commander" - Lodgenet Commander
 * "SeaChange" - SeaChang<br>
 * "NStream" - nStream<br>
 * "NxTV" - NxTV<br>
 * "None" - No specific interface type
 */
Nimbus.getPPVType = function() {
	return Nimbus.NimbusObj.GetPPVType();
}

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Sets the type of MTI PPV Control system attached to the STB
 * 
 * @param {String} PPVType <br>
 * "LN_Terminal" - Lodgenet Terminal<br>
 * "LN_Commander" - Lodgenet Commander
 * "SeaChange" - SeaChang<br>
 * "NStream" - nStream<br>
 * "NxTV" - NxTV<br>
 * "None" - No specific interface type
 * @return {Boolean} True if successful and changed, null on error, false if no change
 */
Nimbus.setPPVType = function(PPVType) {
	return Nimbus.NimbusObj.SetPPVType(PPVType);
}

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Sets the parameters which control ProIdiom authorization requirements.
 *
 * @param {Boolean} bEnabled  			Required: True to enable ProIdiom Authentication
 * @param {Number} 	PrimaryChannel		Optional: Primary Channel number to search for
 * 										broadcasted ProIdiom Keys, set to 0 to disable
 * @param {Number} 	SecondaryChannel	Optional: Secondary Channel number to search for 
 * 										broadcasted ProIdiom Keys, set to 0 to disable
 * 
 * @return {Boolean} True if parameters successfully set
 */

Nimbus.setAuthMode = function(bEnabled, PrimaryChannel, SecondaryChannel){
	return Nimbus.NimbusObj.SetAuthMode(bEnabled, PrimaryChannel, SecondaryChannel);
};

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Gets the current enabled/disabled state for ProIdiom authorization.
 *
 * @return {Boolean} True if Authorization is enabled
 */

Nimbus.getAuthModeEnabled = function(){
	return Nimbus.NimbusObj.GetAuthModeEnabled();
};

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Gets the current Primary search channel for Proidiom Authorized key searches
 *
 * @return {Number} Channel in use, 0 if disabled
 */

Nimbus.getAuthModePrimaryChannel = function(){
	return Nimbus.NimbusObj.GetAuthModePrimaryChannel();
};

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Gets the current Secondary search channel for Proidiom Authorized key searches
 *
 * @return {Number} Channel in use, 0 if disabled
 */

Nimbus.getAuthModeSecondaryChannel = function(){
	return Nimbus.NimbusObj.GetAuthModeSecondaryChannel();
};

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Gets the switch on power mode the STB will apply when it first receives 
 * power
 * 
 * @return {String} : One of <br>
 * "On" - The STB will power ON and attempt to power on any controlled TV<br>
 * "Standby" - The STB will power OFF and attempt to power down any controlled TV<br>
 * "Restore" - The STB and TV will revert to the last state prior to the TSB losing power
 */
Nimbus.getSwitchOnPowerMode = function() {
	return Nimbus.NimbusObj.GetSwitchOnPowerMode();
}

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Sets the switch on power mode the STB will apply when it first receives 
 * power
 * 
 * @param {String} PPVType <br>
 * "On" - The STB will power ON and attempt to power on any controlled TV <br>
 * "Standby" - The STB will power OFF and attempt to power down any controlled TV <br>
 * "Restore" - The STB and TV will revert to the last state prior to the TSB losing power
 *
 * @return {Boolean} True if successful, null on error
 */
Nimbus.setSwitchOnPowerMode = function(Mode) {
	return Nimbus.NimbusObj.SetSwitchOnPowerMode(Mode);
}

////////////////////////////////////////////////////////////////////////
//
// Event notification functionality
//
////////////////////////////////////////////////////////////////////////

/**
 * Event object class - passed to an event hander registered via Nimbus.addEventListener.  
 * It holds the information that describes an event received from the native code.
 * An event can contain a notification or a command.  The EventType member is used
 * to determine whether the event is a notification or a command.
 * 
 * @class
 * @constructor
 */
Nimbus.Event = function(EventType, EventMsg, EventData)
{
    /**
    * Type of event - Either Nimbus.Event.TYPE_COMMAND or Nimbus.Event.TYPE_NOTIFICATION.
	*                 If a command then Nimbus.parseCommand(event) should be used to parse
	*                 the command info from the event.
    * @type Number
    */
    this.EventType = EventType;
    /**
    * Optional message string providing additional information that is event-type specific.
    * @type String
    */
    this.EventMsg = EventMsg;
    /**
    * Optional array of data values which are event-type specific.
    * @type Array
    */
    this.EventData = EventData;
    /**
    * Optional Number of events the message represents
    * @type Number
    */
    this.NumSubEvents = 0;
    /**
    * Optional Number of events of which this message represents that have been processed
    * @type Number
    */
    this.ProcessedSubEvents = 0;
    /**
    * Optional array of sub event Strings for multi events
    * @type Array
    */
    this.SubEventStrs = null;
};

//
// Event Types
//

Nimbus.Event.TYPE_INVALID = 0;		// Invalid type
Nimbus.Event.TYPE_COMMAND = 1;		// Command type
Nimbus.Event.TYPE_NOTIFICATION = 2;	// Notification type

//
// Event Messages
//
Nimbus.Event.MESSAGE_TV_STATUS_CHANGE				= "TVStatusChange";					// TV status change
Nimbus.Event.MESSAGE_TV_INPUT_STATUS_CHANGE			= "TVInputStatusChange";			// TV input status change

Nimbus.Event.MESSAGE_PLAYER_STATUS_CHANGE 			= "PlayerStatusChange";				// Player status change, PlayerID in event.EventData[0]; 0=>primary, 1=>secondary
Nimbus.Event.MESSAGE_PLAYER_PROGRAM_INFO_CHANGE		= "PlayerProgramInfoChange";		// Player program info change, PlayerID in event.EventData[0]; 0=>primary, 1=>secondary
Nimbus.Event.MESSAGE_RTSP_ANNOUNCEMENT_WAITING 		= "RTSPAnnouncementWaiting";		// RTSP announcement waiting, PlayerID in event.EventData[0]; 0=>primary, 1=>secondary

Nimbus.Event.MESSAGE_DATA_CHANNEL_STATUS			= "DataChannelStatusChange";		// Data channel status change (connection/data availability), ChannelID in event.EventData[0]

Nimbus.Event.MESSAGE_STB_STATUS_CHANGE				= "STBStatusChange";				// STB status change

Nimbus.Event.MESSAGE_URL_CHECK_OK 					= "URLCheckOk";						// URL check ok
Nimbus.Event.MESSAGE_URL_CHECK_FAILED 				= "URLCheckFailed";					// URL check failed

Nimbus.Event.MESSAGE_WINDOW_LOADING_STARTED 		= "WindowLoadingStarted";			// Window status, loading started
Nimbus.Event.MESSAGE_WINDOW_LOADING_FINISHED 		= "WindowLoadingFinished";			// Window status, loading finished
Nimbus.Event.MESSAGE_WINDOW_LOADING_FAILED 			= "WindowLoadingFailed";			// Window status, loading failed
Nimbus.Event.MESSAGE_WINDOW_CLOSED 					= "WindowClosed";					// Window status, window closed
Nimbus.Event.MESSAGE_WINDOW_URL_CHANGED 			= "WindowURLChanged";				// Window status, URL changed
Nimbus.Event.MESSAGE_WINDOW_SECURITY_MODE_CHANGED	= "WindowSecurityModeChanged"; 		// Window status, security mode changed

Nimbus.Event.MESSAGE_WINDOW_FOCUS_CHANGED			= "WindowFocusChanged";				// Window/widget status, focus changed, event.EventData[0] == 1 => window has focus

Nimbus.Event.MESSAGE_WIDGET_OPENED 					= "WidgetOpened";					// Widget status, opened
Nimbus.Event.MESSAGE_WIDGET_CLOSED 					= "WidgetClosed";					// Widget status, closed
Nimbus.Event.MESSAGE_WIDGET_CLOSE_REQUESTED         = "WidgetCloseRequested"; 		    // Widget status, close requested
Nimbus.Event.MESSAGE_WIDGET_VISIBILITY_CHANGED		= "WidgetVisibilityChanged";		// Widget status, visibility changed

Nimbus.Event.MESSAGE_TIME_SET						= "TimeSet";						// Time was set

Nimbus.Event.NIMBUS_CONTENT_UPDATE_COMPLETE         = "ContentUpdateComplete"; 		    // Content update completed

// Enseo reserved.
Nimbus.Event.NIMBUS_TK_CALIBRATION         			= "TKCALIBRATION"; 		    		// Content update completed

/**
 * @ignore (Omit from documentation)
 * Internal callback function not to be called directly by javascript code.
 *
 * @param {String} EventStr Encoded event information
 */

Nimbus.eventCallback = function(EventStr){
	if (gLogDispatchEvents) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.eventCallback: event=[" + EventStr + "]\n");
	}

	var bProcessed = false;
	var event = new Nimbus.Event(0, "");

	// Parse the event string of the form: <event number>,<event msg>
	// Find the comma that separates the event number from the event msg
	var pos = EventStr.search(/,/i);
	if (pos != -1) {
		// Comma found, get each field
		event.EventType = parseInt(EventStr.slice(0, pos));
		event.EventMsg = EventStr.slice(pos + 1, EventStr.length);

		// The event message can include optional data.  Parse that data into an array.
		// NOTE: For backwards compatibility, EventMsg must contain the optional data if the
		// EventType is 'command', but not if EventType is 'notif'. Yuk
		var SubStrings = new Array();
		SubStrings = event.EventMsg.split(",");
		// If data values provided, include in the event object an array containing them
		if (SubStrings.length > 1) {
			if (event.EventType == Nimbus.Event.TYPE_NOTIFICATION) {
				event.EventMsg = SubStrings[0];
			}				
			event.EventData = SubStrings.slice(1);
		}
		if (gLogDispatchEvents) {
			Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.eventCallback: EventType= " + event.EventType + ", EventMsg= [" + event.EventMsg + "]\n");
		}

		// Call the registered listeners.
		bProcessed = Nimbus.dispatchEvent(event);

		// If the event was a command and was not processed, then pass it back to native app
		if (!bProcessed && event.EventType == Nimbus.Event.TYPE_COMMAND) {
			Nimbus.NimbusObj.SendCommand(event.EventMsg);
		}
	}
	return bProcessed;
};

/**
 * Registers an event listener.  The specified listener function is called whenever an event is received.  A listener 
 * should return true if the event was handled (or should be ignored by the native code).  The native code will
 * process the event (where applicable) if no listener handles the event.
 * 
 * @param {Function} eventListener Listener function
 * @return {Boolean} True if successful
  */

Nimbus.addEventListener = function(eventListener){

	if (gLogDispatchEvents) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "addEventListener: Current number of listeners= " + Nimbus.EventListeners.length);
	}

	// Don't add again if already in the list
	for (var i = 0; i < Nimbus.EventListeners.length; i++) {
		if (Nimbus.EventListeners[i] == eventListener) {
			if (gLogDispatchEvents) {
				Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "addEventListener: Listener already in the list\n");
			}
			return true;
		}
	}
	// Add listener to the end of the list
	Nimbus.EventListeners.push(eventListener);
	if (gLogDispatchEvents) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "addEventListener: New number of listeners= " + Nimbus.EventListeners.length);
	}

	return true;
};

/**
 * Removes an event listener from the event notification list.
 * 
 * @param {Function} Listener function
 * @return {Boolean} True if successful
  */

Nimbus.removeEventListener = function(eventListener){

	if (gLogDispatchEvents) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "removeEventListener: Current number of listeners= " + Nimbus.EventListeners.length);
	}

	// Look for the event in the list
	for (var i = 0; i < Nimbus.EventListeners.length; i++) {
		if (Nimbus.EventListeners[i] == eventListener) {
			// Remove it from the list
			Nimbus.EventListeners.splice(i, 1);
			if (gLogDispatchEvents) {
				Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "removeEventListener: New number of listeners= " + Nimbus.EventListeners.length);
			}
			return true;
		}
	}

	if (gLogDispatchEvents) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "removeEventListener: listener not found\n");
	}
	return false;
};

/**
 * Sends the specified event to all registered event listeners.
 * 
 * @param {Nimbus.Event} event  Event to be sent
 * @return {Boolean} True if successful
  */

Nimbus.dispatchEvent = function(event){

	var bProcessed = false;
	
	if (gLogDispatchEvents) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DISABLED, "dispatchEvent: Current number of listeners= " + Nimbus.EventListeners.length);
	}
	// Call the registered listeners.
	// Call from a copy of the list of listeners in case the list is modified by a listener.
	var CallList = Nimbus.EventListeners;
	for (var i = 0; i < CallList.length; i++) {
		if (gLogDispatchEvents) {
			Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DISABLED, "Nimbus.dispatchEvent: calling listener\n");
		}
		if (CallList[i](event)) {
			bProcessed = true;
		}
	}
	return bProcessed;
};


/**
 * Command object class - returned by Nimbus.parseCommand.  Holds the information that describes a 
 * command received from the native code.
 * 
 * @class
 * @constructor
 */

Nimbus.Command = function(code, source, IRType, IRCodeLower, IRCodeUpper, Params){
	/**
	 * Command code
	 * @type Number
	*/
	this.Code = code;
	/**
	 * Source of command, one of: "IR", "TV", "TV-Standalone", "Console", "STB-Internal", "TV-KB-Standalone", "TV-KB", "AUX"
	 * @type String
	*/
	this.Source = source;
	/**
	 * Type of IR command code, one of: "None", "NEC", "RC5", "RCMM_RC", "RCMM_MOUSE", "RCMM_KEYBOARD", "RCMM_GAME",
	 * "4PPM_NOTE_KEYBOARD", "4PPM_DESK_KEYBOARD", "4PPM_RC", "SIRCS12", "SIRCS15", "SIRCS20", "4PPM_POINTER", "4PPM_GAME",
	 * "4PPM_MOUSE", "PANASONIC48", "PANASONIC56", "SAMSUNG_RC", "SEACHANGE", "SEACHANGE_JOYSTICK", "TOUCHKIT", 
	 * "Keyboard", "Remote", "Mouse"
	 * @type Number
	*/
	this.IRType	= IRType;
	/**
	 * IR command code upper 32bits
	 * @type Number
	*/
	this.IRCodeUpper = IRCodeUpper;
	/**
	 * IR command code lower 32bits
	 * @type Number
	*/
	this.IRCodeLower = IRCodeLower;
	/**
	 * String parameters included with the Application command
	 * @type String
	*/
	this.Params = Params;
};

//
// Command codes
//
Nimbus.Command.Base				= 0xf000;
Nimbus.Command.OnOff 			= Nimbus.Command.Base + 0x01;	// On/off toggle
Nimbus.Command.On				= Nimbus.Command.Base + 0x43;	// On
Nimbus.Command.Off				= Nimbus.Command.Base + 0x44;	// Off
Nimbus.Command.OnAlt			= Nimbus.Command.Base + 0x36;	// On
Nimbus.Command.OffAlt			= Nimbus.Command.Base + 0x37;	// Off

Nimbus.Command.Up				= Nimbus.Command.Base + 0x02;	// Nav up
Nimbus.Command.Down				= Nimbus.Command.Base + 0x03;	// Nav down
Nimbus.Command.Left				= Nimbus.Command.Base + 0x04; 	// Nav left
Nimbus.Command.Right			= Nimbus.Command.Base + 0x05;	// Nav right
Nimbus.Command.Select			= Nimbus.Command.Base + 0x06;	// Nav select

Nimbus.Command.Menu				= Nimbus.Command.Base + 0x07;	// Menu
Nimbus.Command.Guide			= Nimbus.Command.Base + 0x96;	// Guide
Nimbus.Command.Back				= Nimbus.Command.Base + 0x97;	// Back
Nimbus.Command.Cancel			= Nimbus.Command.Base + 0x98;	// Cancel

Nimbus.Command.VolPlus			= Nimbus.Command.Base + 0x08;	// Volume plus
Nimbus.Command.VolMinus			= Nimbus.Command.Base + 0x09;	// Volume minus
Nimbus.Command.Mute				= Nimbus.Command.Base + 0x0b;	// Mute toggle
Nimbus.Command.MuteOn			= Nimbus.Command.Base + 0x0c;	// Mute On
Nimbus.Command.MuteOff			= Nimbus.Command.Base + 0x0d;	// Mute Off

Nimbus.Command.Key1				= Nimbus.Command.Base + 0x0e;	// Digit keys
Nimbus.Command.Key2				= Nimbus.Command.Base + 0x0f;
Nimbus.Command.Key3				= Nimbus.Command.Base + 0x10;
Nimbus.Command.Key4				= Nimbus.Command.Base + 0x11;
Nimbus.Command.Key5				= Nimbus.Command.Base + 0x12;
Nimbus.Command.Key6				= Nimbus.Command.Base + 0x13;
Nimbus.Command.Key7				= Nimbus.Command.Base + 0x14;
Nimbus.Command.Key8				= Nimbus.Command.Base + 0x15; 
Nimbus.Command.Key9				= Nimbus.Command.Base + 0x16;
Nimbus.Command.Key0				= Nimbus.Command.Base + 0x17;

Nimbus.Command.Play     		= Nimbus.Command.Base + 0x18;	// Play
Nimbus.Command.PlayPause		= Nimbus.Command.Base + 0x18;	// Play/pause
Nimbus.Command.Stop				= Nimbus.Command.Base + 0x19;	// Stop
Nimbus.Command.Pause			= Nimbus.Command.Base + 0x1a;	// Pause
Nimbus.Command.FastRewind		= Nimbus.Command.Base + 0x1b;	// Rewind
Nimbus.Command.FastForward		= Nimbus.Command.Base + 0x1c;	// Fast forward
Nimbus.Command.SlowRewind		= Nimbus.Command.Base + 0x1d;	// Slow Rewind
Nimbus.Command.SlowForward		= Nimbus.Command.Base + 0x1e;	// Slow forward
Nimbus.Command.PrevTrack		= Nimbus.Command.Base + 0x1f;	// Previous
Nimbus.Command.NextTrack		= Nimbus.Command.Base + 0x20;	// Next

Nimbus.Command.KeyF             = Nimbus.Command.Base + 0x29;   // Key F

Nimbus.Command.ChanPlus			= Nimbus.Command.Base + 0x2b;	// Channel plus
Nimbus.Command.ChanMinus		= Nimbus.Command.Base + 0x2c;	// Channel minus
Nimbus.Command.PrevChan			= Nimbus.Command.Base + 0x2d;	// Previous channel viewed

Nimbus.Command.Sleep			= Nimbus.Command.Base + 0x2e;	// Sleep mode selection
Nimbus.Command.SleepAlt			= Nimbus.Command.Base + 0x30;	// Sleep mode selection
Nimbus.Command.ScreenFormatAlt	= Nimbus.Command.Base + 0x35; 	// Screen format selection
Nimbus.Command.CCAlt			= Nimbus.Command.Base + 0x55;	// CC control

Nimbus.Command.SetupKeySequence = Nimbus.Command.Base + 0x4d;   // Setup Key Sequence

Nimbus.Command.SAP				= Nimbus.Command.Base + 0x4e;	// Secondary audio program

Nimbus.Command.DisplayLabel		= Nimbus.Command.Base + 0x4c;	// Display channel label
Nimbus.Command.Status			= Nimbus.Command.Base + 0x2a;	// Display status screen

Nimbus.Command.SelectComposite	= Nimbus.Command.Base + 0x73;	// Select composite input
Nimbus.Command.SelectVGA 		= Nimbus.Command.Base + 0x76;	// Select VGA input
Nimbus.Command.SelectHDMI		= Nimbus.Command.Base + 0x77;	// Select HDMI input

Nimbus.Command.TuneDefault		= Nimbus.Command.Base + 0x78,	// Select the default channel/input

																// The following Select* commands expect Cmd.Params
																// to contain a number specifying the input instance.
Nimbus.Command.SelectTuner		= Nimbus.Command.Base + 0x66,	// Select Enseo Tuner
Nimbus.Command.SelectCompositeAlt = Nimbus.Command.Base + 0x67,	// Select Composite Input (TV or Enseo)
Nimbus.Command.SelectSVideo		= Nimbus.Command.Base + 0x68,	// Select S-Video Input (TV or Enseo)
Nimbus.Command.SelectComponent	= Nimbus.Command.Base + 0x69,	// Select Component Input
Nimbus.Command.SelectVGA		= Nimbus.Command.Base + 0x6a,	// Select VGA Input
Nimbus.Command.SelectHDMIAlt	= Nimbus.Command.Base + 0x6b,	// Select DVI/HDMI Input

Nimbus.Command.AppSpecificA		= Nimbus.Command.Base + 0x56;	// Special function keys with application-specific purposes
Nimbus.Command.AppSpecificB		= Nimbus.Command.Base + 0x57;	//   such as for use by Javascript-based VOD applications
Nimbus.Command.AppSpecificC		= Nimbus.Command.Base + 0x58;
Nimbus.Command.AppSpecificD		= Nimbus.Command.Base + 0x59;
Nimbus.Command.AppSpecificE		= Nimbus.Command.Base + 0x5a;
Nimbus.Command.AppSpecificF		= Nimbus.Command.Base + 0x5b;
Nimbus.Command.AppSpecificG		= Nimbus.Command.Base + 0x5c;
Nimbus.Command.AppSpecificH		= Nimbus.Command.Base + 0x5d;
Nimbus.Command.AppSpecificI		= Nimbus.Command.Base + 0x5e;
Nimbus.Command.AppSpecificJ     = Nimbus.Command.Base + 0x5f;
Nimbus.Command.AppSpecificK     = Nimbus.Command.Base + 0xc0;
Nimbus.Command.AppSpecificL     = Nimbus.Command.Base + 0xc1;
Nimbus.Command.AppSpecificM     = Nimbus.Command.Base + 0xc2;
Nimbus.Command.AppSpecificN     = Nimbus.Command.Base + 0xc3;
Nimbus.Command.AppSpecificO     = Nimbus.Command.Base + 0xc4;

Nimbus.Command.Intercept		= Nimbus.Command.Base + 0x8d;	// Command used to intercept keyboard strokes when using Nimbus.setNimbusCmdRouting for keyboards 
Nimbus.Command.Nimbus			= Nimbus.Command.Base + 0x8e;	// Application-specific message received from another Nimbus window
Nimbus.Command.Application      = Nimbus.Command.Base + 0x8f;	// Application-specific message received from Aux serial command port

Nimbus.Command.TestKeyA 		= Nimbus.Command.Base + 0xa0;
Nimbus.Command.TestKeyB 		= Nimbus.Command.Base + 0xa1;
Nimbus.Command.TestKeyC 		= Nimbus.Command.Base + 0xa2;

Nimbus.Command.SelectCompositeOutput = Nimbus.Command.Base + 0xf0;
Nimbus.Command.SelectHDMIOutput      = Nimbus.Command.Base + 0xf1;

//
// Special Key Codes for use in sending to the browser.  See sendKeyToBrowser().
//

Nimbus.BrowserKeyBase 			= 0x10000;
Nimbus.BrowserKeyHome			= Nimbus.BrowserKeyBase + 0x01;
Nimbus.BrowserKeyEnd			= Nimbus.BrowserKeyBase + 0x02;
Nimbus.BrowserKeyPageUp			= Nimbus.BrowserKeyBase + 0x03;
Nimbus.BrowserKeyPageDown 		= Nimbus.BrowserKeyBase + 0x04;
Nimbus.BrowserKeyUp				= Nimbus.BrowserKeyBase + 0x05;
Nimbus.BrowserKeyDown			= Nimbus.BrowserKeyBase + 0x06;
Nimbus.BrowserKeyLeft			= Nimbus.BrowserKeyBase + 0x07;
Nimbus.BrowserKeyRight			= Nimbus.BrowserKeyBase + 0x08;
Nimbus.BrowserKeyEsc			= Nimbus.BrowserKeyBase + 0x09;
Nimbus.BrowserKeyIns			= Nimbus.BrowserKeyBase + 0x0a;
Nimbus.BrowserKeyDel			= Nimbus.BrowserKeyBase + 0x0b;
Nimbus.BrowserKeyBackspace		= Nimbus.BrowserKeyBase + 0x0c;
Nimbus.BrowserKeyTab			= Nimbus.BrowserKeyBase + 0x0d;
Nimbus.BrowserKeySpace			= Nimbus.BrowserKeyBase + 0x0e;
Nimbus.BrowserKeyEnter			= Nimbus.BrowserKeyBase + 0x0f;




/**
 * Parses a command event string received from native code via an event notification.
 *
 * @param {String} CmdStr  Encoded command event string
 * @return {Nimbus.Command} Command object
 */

Nimbus.parseCommand = function(CmdStr){
	var Cmd = new Nimbus.Command(0, "", "", 0, 0, "");
	
	// Parse the command string of the form: <command>,<command source>,<IR type>,<IR code upper 32 bits>,<IR code lower 32 bits>,<Params>
	var SubStrings = new Array();
	// Don't split the <params> out since they are extracted based upon start/end delimiters and could contain commas
	SubStrings = CmdStr.split(",", 5);
	if (SubStrings.length >= 2) {
		Cmd.Code = parseInt(SubStrings[0], 10);	
		Cmd.Source = SubStrings[1];
		// Maintain backwards compatibility for Nimbus 1.4 and earlier where
		// the IR type and code was not sent
		if (SubStrings.length >= 5) {
			Cmd.IRType = SubStrings[2];
			Cmd.IRCodeUpper = parseInt(SubStrings[3], 10);
			Cmd.IRCodeLower = parseInt(SubStrings[4], 10);
			// Check for Params added in Nimbus 3.11
			// The Params are in the form of: [PBegin]data[PEnd].  Start/end
			// delimiters are used so that commas can be included in the data 
			// if desired (since this data is generated independently of the firmware).
			var OffBegin = CmdStr.search(/\[PBegin\]/);
			if (OffBegin != -1) {
				var OffEnd = CmdStr.search(/\[PEnd\]/);
				if (OffEnd != -1) {
					Cmd.Params = CmdStr.slice(OffBegin + 8, OffEnd);
				}
			}
			if (SubStrings.length >= 6) {
				Cmd.Params = SubStrings[5];
			}
		}
		if (gLogDispatchEvents) {
			Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.ParseCommand: Cmd.Code= 0x" + Cmd.Code.toString(16) + ", Cmd.Source= " + Cmd.Source + ", Cmd.IRType= " + Cmd.IRType + ", Cmd.IRCodeUpper= 0x" + Cmd.IRCodeUpper.toString(16) + ", Cmd.IRCodeLower= 0x" + Cmd.IRCodeLower.toString(16) + ", Cmd.Params= [" + Cmd.Params + "]\n");
		}
		return Cmd;
	}	
	return null;
};

/**
 * Open IR blaster port.
 * 
 * @param {Number} Open IR blaster port 	
 * @return {Boolean} True if successful
 */

Nimbus.OpenIrBlasterPort = function(blasterPort){
	return Nimbus.NimbusObj.OpenIrBlasterPort(blasterPort);
};

/**
 * Close IR blaster port.
 * 
 * @param {Number} Close IR blaster port 	
 * @return {Boolean} True if successful
 */

Nimbus.CloseIrBlasterPort = function(blasterPort){
	return Nimbus.NimbusObj.CloseIrBlasterPort(blasterPort);
};

/**
 * Config specified IR blaster port.
 * 
 * @param {Number} IR blaster port 	
 * @param {Number} IR blaster mode	
 * @param {Number} IR blaster repeat count	

 * @return {Boolean} True if successful
 */

Nimbus.ConfigIrBlasterPort = function(blasterPort,blasterPortMode,repeatCount){
	return Nimbus.NimbusObj.ConfigIrBlasterPort(blasterPort,blasterPortMode,repeatCount);
};

/**
 * Send an IR blaster command to a specified port.
 * 
 * @param {Number} IR blaster port to transmit the command 	
 * @param {Number} Command to send	

 * @return {Boolean} True if successful
 */

Nimbus.SendIrBlasterCommand = function(blasterPort,command){
	return Nimbus.NimbusObj.SendIrBlasterCommand(blasterPort,command);
};
/**********************************************************************************************
***********************************************************************************************
**********************************************************************************************/
