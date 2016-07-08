/**
 * @fileOverview ENseo Nimbus TV Controller Javascript API
 * <p><b>Copyright (c) Enseo, Inc. 2008-2010
 *
 * This material contains trade secrets and proprietary information
 * and	may not	 be used, copied, disclosed or	distributed	 except
 * pursuant to	a license from Enseo, Inc. Use of copyright notice
 * does not imply publication or disclosure.</b>
 */

////////////////////////////////////////////////////////////////////////
//
// Reference   : $Source: /cvsroot/calica/apps/rootfs_common/root/usr/bin/data/html/js/enseo_tvcontroller.js,v $
//
// Revision	   : $Revision: 1.20 $
//
// Date		   : $Date: 2011-02-17 16:21:49 $
//
// Description : Nimbus TV Controller javascript API.
//
////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////
//
// TV controller functionality
//
////////////////////////////////////////////////////////////////////////

/**
 * Gets a TV controller interface for controlling TV functionality.
 *
 * @return {Nimbus.TVController} Instance of the Nimbus.TVController interface, or null if the interface could not be created
 */

Nimbus.getTVController = function(){
	// Return the current controller, if any.
	if (Nimbus.CurrentController != null) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getTVController, returning existing object");
		return Nimbus.CurrentController;
	}
	// Create a new TV controller class
	var controller = new Nimbus.TVController();
	if (controller != null) {
		Nimbus.CurrentController = controller;
	}
	return controller;
};

/**
 * Class providing an interface for controlling a TV - use Nimbus.getTVController to obtain an instance.
 * 
 * @class
 */

Nimbus.TVController = function(){
	// Create a native js player object
	this.TVCtrl = new EONimbusTVController();
	Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.TVController constructor");
};

/**
 * Sets the external TV control enable.  When enabled, the STB will expect to connect and
 * control a TV/monitor via a serial or Smartport interface.  Note that if the enable state
 * is changed by this method, a restart of the STB will be done immediately.
 * 
 * @param {Boolean} state  True to enable external TV control, otherwise disable control.
 *
 * @return {Boolean} True if successful
 */

Nimbus.TVController.prototype.setExternalTVControlEnable = function(state){
	if (this.TVCtrl == null) {
		return false;
	}
	return this.TVCtrl.SetExternalTVControlEnable(state);
};

/**
 * Gets the external TV control enable.
 * 
 * @return {Boolean} True if external control is enabled.
 */

Nimbus.TVController.prototype.getExternalTVControlEnable = function(){
	if (this.TVCtrl == null) {
		return false;
	}
	return this.TVCtrl.GetExternalTVControlEnable();
};

/**
 * Sets the power state of the TV and STB.
 * 
 * @param {Boolean} state  True if power should be enabled
 *
 * @return {Boolean} True if successful
 */

Nimbus.TVController.prototype.setPower = function(state){
	if (this.TVCtrl == null) {
		return false;
	}
	return this.TVCtrl.Power = state;
};

/**
 * Gets the power state of the TV.
 * 
 * @return {Boolean} True if TV power is enabled or null if power state is unknown
 */

Nimbus.TVController.prototype.getPower = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.Power;
};

/**
 * Sets the audio volume level of the TV.   When the exernal TV control interface is disabled, this
 * method controls the output volume of the STB.  If the TV volume is controlled by other means (such as
 * directly using using the TV remote control), then this method should be used to set the STB volume output to 100.
 * 
 * @param {Number} volume A number from 0 to 100, with 0 being muted and 100 being full volume
 *
 * @return {Boolean} True if successful
 */

Nimbus.TVController.prototype.setVolume = function(volume){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.Volume = volume;
};

/**
 * Gets the audio volume level of the TV.
 * 
 * @return {Number} A number from 0 to 100, with 0 being muted and 100 being full volume
 */

Nimbus.TVController.prototype.getVolume = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.Volume;
};

/**
 * Set the mute state of the TV audio output.  When the exernal TV control interface is disabled, this
 * method controls the output volume of the STB.  If the TV volume is controlled by other means (such as
 * directly using using the TV remote control), then this method should be used to set the STB volume output to 100.
 * 
 * @param {Boolean} state True to mute the audio output
 *
 * @return {Boolean} True if successful
 */

Nimbus.TVController.prototype.setMute = function(state){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.Mute = state;
};

/**
 * Gets the mute state of the TV audio output.
 * 
 * @return {Boolean} True if TV is muted, or null if undeterminable
 */

Nimbus.TVController.prototype.getMute = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.Mute;
};

/**
 * Sets the enable state of the STB volume indicator display for presenting the volume
 * level when volume commands are processed.  This method can be used to disable the
 * STB volume indicator when it is desired to use the volume indicator displayed by
 * the TV instead.
 *
 * @param {Boolean} state True to display the volume indicator
 *
 * @return {Boolean} True if successful
 */

Nimbus.TVController.prototype.setVolumeIndicatorEnable = function(state){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.SetVolumeIndicatorEnable(state);
};

/**
 * Gets the enable state of the volume indicator.
 *
 * @return {Boolean} True if the volume indicator is used
 */

Nimbus.TVController.prototype.getVolumeIndicatorEnable = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.GetVolumeIndicatorEnable();
};


/**
 * Gets the list of available TV inputs (does not include any inputs provided by the STB).
 *
 * @return {Array} An array of input objects where each object contains:<br>
 * 	{String} Name - Name of the input<br>
 * 	{String} ID   - ID string of the input. Use this value when selecting an input<br>
 */

Nimbus.TVController.prototype.getInputList = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	var InputList = new Array();

	var temp = this.TVCtrl.GetInputList();
	if (temp == null) {
		return InputList;
	}
	var RawInputList = new Array();
	RawInputList = temp.split("!");

	// Input list is an array of objects with each object
	// holding the name string and the input ID string
	for (var i=0; i < RawInputList.length; i += 2) {
		var InputObj = new Object();
		InputObj.Name = RawInputList[i];
		InputObj.ID = RawInputList[i+1];
		InputList[i/2] = InputObj;
	}
	return InputList;
};


/**
 * Gets the number of available TV A/V inputs.
 *
 * @return {Number} The total number of available A/V inputs
 */

Nimbus.TVController.prototype.getInputCount = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.GetInputCount();
};


/**
 * Sets the TV A/V input to use.
 *
 * @param {String} ID  Input ID string.  Use getInputList to determine the valid IDs for a TV.
 *
 * @return {Boolean} True if successful. False if the input could not be selected.
 */

Nimbus.TVController.prototype.setInput = function(indexName){
	if (this.TVCtrl == null) {
		return null;
	}
	var result = this.TVCtrl.SetInput(indexName);
	if (result == null) {
		return false;
	}
	return result;
};

/**
 * Gets the TV A/V input currently selected.
 *
 * @return {Object} Current input or null if unsuccessful:<br>
 * 	{String} Name - Name of the input<br>
 * 	{String} ID   - ID string of the input.<br>
 */

Nimbus.TVController.prototype.getInput = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	var temp = this.TVCtrl.GetInput();
	
	if (temp == null) {
		return null;
	}

	var RawList = new Array();
	RawList = temp.split("!");
	var InputObj = new Object();
	if (RawList.length == 2) {
		InputObj.Name = RawList[0];
		InputObj.ID = RawList[1];
	}
	return InputObj;
};

/**
 * Gets the TV type.
 *
 * @return {String} TV type if success.  Null otherwise.
 */

Nimbus.TVController.prototype.getType = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.GetType();
};

/**
 * Gets the TV Model type.
 *
 * @return {String} TV Model if success.  Null otherwise.
 */

Nimbus.TVController.prototype.getModel = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.GetModel();
};

/**
 * Gets the TV Model Number.
 *
 * @return {String} TV Model Number if success.  Null otherwise.
 */

Nimbus.TVController.prototype.getModelNumber = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.GetModelNumber();
};
/**
 * Gets the TV status.
 *
 * @return {Boolean} True if online, otherwise offline.
 */

Nimbus.TVController.prototype.isOnline = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.GetOnlineStatus();
};

/**
 * Sends a command to the TV.  The supported commands depend upon the capabilities of
 * the TV.  This call is mainly intended for passing special commands such as those
 * needed to control a built-in/slave DVD player.
 *
 * @param {Number} Cmd Command. Supported commands:<br>
 *  Nimbus.Command.Play<br>
 *  Nimbus.Command.Stop<br>
 *  Nimbus.Command.Pause<br>
 *  Nimbus.Command.FastRewind<br>
 *  Nimbus.Command.FastForward<br>
 *  Nimbus.Command.PrevTrack<br>
 *  Nimbus.Command.NextTrack<br>
 *  Nimbus.Command.Up<br>
 *  Nimbus.Command.Down<br>
 *  Nimbus.Command.Left<br>
 *  Nimbus.Command.Right<br>
 *  Nimbus.Command.Select<br>
 *  Nimbus.Command.Menu	<br>
 *
 * @return {Boolean} True if successful. False if the command could not be sent.
 */

Nimbus.TVController.prototype.sendCommand = function(Cmd){
	if (this.TVCtrl == null) {
		return false;
	}
	return this.TVCtrl.SendCommand(Cmd);
};

/**
 * Tunes the specified analog channel using the tuner of the TV.  *** This feature is available for a very
 * limited number of TVs. ***
 *
 * @param {String} TuningMode  Tuning mode to use: "Cable", "CableSTD", "CableHRC", "CableIRC", or "Air"
 * @param {Number} PhyChan     Physical channel number.
 *
 * @return {Boolean} True if successful. False otherwise.
 */

Nimbus.TVController.prototype.tuneAnalog = function(TuningMode, PhyChan){
	if (this.TVCtrl == null) {
		return false;
	}
	var result = this.TVCtrl.TuneAnalog(TuningMode, PhyChan);
	if (result == null) {
		return false;
	}
	return result;
};

/**
 * Tunes the specified digital channel using the tuner of the TV.  *** This feature is available for a very
 * limited number of TVs. ***
 *
 * @param {String}  TuningMode        Tuning mode to use: "Cable", "CableSTD", "CableHRC", "CableIRC", or "Air"
 * @param {Number}  PhyChan           Physical channel number.
 * @param {Number}  ProgramNum        One of the program numbers specified in the PAT of the transport stream.
 * @param {Boolean} bAudioOnly        True if only the audio portion of the channel should be played.  Otherwise
 *                                    audio and video.
 * @param {String}  decryptInfo		  Decryption info.  Optional.
 *
 * @return {Boolean} True if successful. False otherwise.
 */

Nimbus.TVController.prototype.tuneDigital = function(TuningMode, PhyChan, ProgramNum, bAudioOnly, decryptInfo){
	if (this.TVCtrl == null) {
		return false;
	}
	var result = this.TVCtrl.TuneDigital(TuningMode, PhyChan, ProgramNum, bAudioOnly, decryptInfo);
	if (result == null) {
		return false;
	}
	return result;
};

/**
 * Gets the TV tuner status.  *** This feature is available for a very
 * limited number of TVs. ***
 *
 * @return {Boolean} True if signal present, otherwise no signal.
 */

Nimbus.TVController.prototype.getTuningStatus = function(){
	if (this.TVCtrl == null) {
		return false;
	}
	return this.TVCtrl.GetTuningStatus();
};

/**
 * Displays the channel number and label using the OSD of the TV.  *** This feature is available for a very
 * limited number of TVs. ***
 *
 * @param {String}  ChanNumber Channel number to be displayed, max 8 characters.
 * @param {String}  ChanLabel  Channel label to be displayed, max 17 characters.
 *
 * @return {Boolean} True if successful. False otherwise.
 */

Nimbus.TVController.prototype.setLabel = function(ChanNumber, ChanLabel){
	if (this.TVCtrl == null) {
		return null;
	}
	var result = this.TVCtrl.SetLabel(ChanNumber, ChanLabel);
	if (result == null) {
		return false;
	}
	return result;
};

/**
 * Gets the status of a TV-integrated media player.
 *
 * @return {Object} Status object:<br>
 *  {Boolean} bAvailable - True if player is available<br>
 * 	{String} mediaType   - Type of media currently inserted: "None", "CD", "DVD"
 */

Nimbus.TVController.prototype.getPlayerStatus = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	var str = this.TVCtrl.GetPlayerStatus();
	if (str != null) {
		Nimbus.logMessage(str);
		var status = eval('(' + str + ')');
		return status;
	}
	return null;
};

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Sets the Maximum audio volume level for the STB board level.  It is still up 
 * to the calling Nimbus app to enforce the maximum level, but this call will 
 * keep it in synch with the STB settings
 * 
 * @param {Number} volume A number from 0 to 100, with 0 being muted and 100 being full volume
 *
 * @return {Boolean} True if successful
 */

Nimbus.TVController.prototype.setMaxVolume = function(volume){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.MaxVolume = volume;
};

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Gets the Maxmium audio volume level configured for the STB settings
 * 
 * @return {Number} A number from 0 to 100, with 0 being muted and 100 being full volume
 */

Nimbus.TVController.prototype.getMaxVolume = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.MaxVolume;
};

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Sets the Minimum audio volume level for the STB board level.  It is still up 
 * to the calling Nimbus app to enforce the minimum level, but this call will 
 * keep it in synch with the STB settings
 * 
 * @param {Number} volume A number from 0 to 100, with 0 being muted and 100 being full volume
 *
 * @return {Boolean} True if successful
 */

Nimbus.TVController.prototype.setMinVolume = function(volume){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.MinVolume = volume;
};

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Gets the Minimum audio volume level configured for the STB settings
 * 
 * @return {Number} A number from 0 to 100, with 0 being muted and 100 being full volume
 */

Nimbus.TVController.prototype.getMinVolume = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.MinVolume;
};

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Gets volume level the STB will use when it powers on
 * 
 * @return {String} : One of <br>
 * "Restore" - The STB will restore the previous volume level <br>
 * number - The level the STB will use, from 0 to 100 <br>
 */
Nimbus.TVController.prototype.getSwitchOnVolume = function() {
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.GetSwitchOnVolume();
}

/**
 * @ignore (Omit from documentation. Enseo reserved.)
 *
 * Sets volume level the STB will use when it powers on
 * 
 * @param {String} Mode/Level <br>
 * "Restore" - The STB will restore the previous volume level<br>
 * number - The level the STB will use, from 0 to 100<br>
 * @return {Boolean} True if successful, null on error
 */
Nimbus.TVController.prototype.setSwitchOnVolume = function(Mode) {
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.SetSwitchOnVolume(Mode);
}

/**
 * Switch the TV to a specified PIP mode.  *** This feature is available for a very
 * limited number of TVs. ***
 *
 * @param {Number} PipMode     Command TV to switch to a specified PIP mode.
 *
 * @return {Boolean} True if successful. False otherwise.
 */

Nimbus.TVController.prototype.SetPIPMode = function(PipMode){
	if (this.TVCtrl == null) {
		return false;
	}
	var result = this.TVCtrl.SetPIPMode(PipMode);
	if (result == null) {
		return false;
	}
	return result;
};

/**
 * Set TV Power Mode to virtual standby or standby.  *** This feature is available for a very
 * limited number of TVs. ***
 *
 * @param {Boolean} Flag to enable/disable virtual standby.
 *
 * @return {Boolean} True if successful. False otherwise.
 */

Nimbus.TVController.prototype.setTVPowerMode = function(Mode){
	if (this.TVCtrl == null) {
		return false;
	}
	var result = this.TVCtrl.SetTVPowerMode(Mode);
	if (result == null) {
		return false;
	}
	return result;
};


/**
 * Gets the TV power  mode.
 * 
 * @return {Boolean} True if virtual standby is enabled.
 */

Nimbus.TVController.prototype.getTVPowerMode = function(){
	if (this.TVCtrl == null) {
		return false;
	}
	return this.TVCtrl.GetTVPowerMode();
};


/**
 * Enable/disable TV front panel processing.  *** This feature is available for a very
 * limited number of TVs. ***
 *
 * @param {Boolean} Flag to enable/disable TV front panel processing.
 *
 * @return {Boolean} True if successful. False otherwise.
 */
Nimbus.TVController.prototype.setTVFrontButtonMode = function(bProcess){
	if (this.TVCtrl == null) {
		return false;
	}
	var result = this.TVCtrl.SetTVFrontButtonMode(bProcess);
	if (result == null) {
		return false;
	}
	return result;
};

/**
 * Gets the TV front panel processing mode.
 * 
 * @return {Boolean} True if TV front panel button processing is enabled.
 */
Nimbus.TVController.prototype.getTVFrontButtonMode = function(){
	if (this.TVCtrl == null) {
		return false;
	}
	return this.TVCtrl.GetTVFrontButtonMode();
};

/**********************************************************************************************
***********************************************************************************************
**********************************************************************************************/
