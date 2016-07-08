/**
 * @fileOverview Enseo Nimbus TV Controller Javascript API
 * <p><b>Copyright (c) Enseo, Inc. 2008-2010
 *
 * This material contains trade secrets and proprietary information
 * and	may not	 be used, copied, disclosed or	distributed	 except
 * pursuant to	a license from Enseo, Inc. Use of copyright notice
 * does not imply publication or disclosure.</b>
 */

////////////////////////////////////////////////////////////////////////
//
// Reference   : $Source: /cvsroot/calica/apps/rootfs_common/root/usr/bin/data/html/js/enseo_tvonly.js,v $
//
// Revision	   : $Revision: 1.3 $
//
// Date		   : $Date: 2010-10-27 18:04:01 $
//
// Description : Nimbus TV Controller javascript API extension for TV ONLY control.
//
////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////
//
// TV ONLY controller functionality
//
////////////////////////////////////////////////////////////////////////


//
// Command codes for TV Specific controls
//
Nimbus.Command.ForceTVOn 		= Nimbus.Command.Base + 0xe1;
Nimbus.Command.ForceTVOff 		= Nimbus.Command.Base + 0xe2;
Nimbus.Command.TVVolPlus 		= Nimbus.Command.Base + 0xe3;
Nimbus.Command.TVVolMinus 		= Nimbus.Command.Base + 0xe4;
Nimbus.Command.TVMuteOn 		= Nimbus.Command.Base + 0xe6;
Nimbus.Command.TVMuteOff 		= Nimbus.Command.Base + 0xe7;

/**
 * Sets the power state of specifically the TV.
 * 
 * @param {Boolean} state  True if power should be enabled
 *
 * @return {Boolean} True if successful
 */

Nimbus.TVController.prototype.setTVPower = function(state){
	if (this.TVCtrl == null) {
		return false;
	}
	return this.TVCtrl.TVPower = state;
};

/**
 * Gets the power state specifically of the TV.
 * 
 * @return {Boolean} True if TV power is enabled or null if power state is unknown
 */

Nimbus.TVController.prototype.getTVPower = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.TVPower;
};

/**
 * Sets the audio volume level of the TV System.   When the exernal TV control interface is disabled, this
 * method controls the output volume of the STB.  If the TV volume is controlled by other means (such as
 * directly using the TV remote control), then this method should be used to set the STB volume output to 100.
 * This change will affect only the TV, not the STB overall Volume state, as long as the SetTVAudSync has 
 * been set to false
 * 
 * @param {Number} volume  A number from 0 to 100, with 0 being muted and 100 being full volume
 *
 * @return {Boolean} True if successful
 */

Nimbus.TVController.prototype.setTVVolume = function(volume){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.TVVolume = volume;
};

/**
 * Gets the audio volume level specifically of the TV.
 * This value may be different from STB level volume as long SetTVAudSync has 
 * been set to false
 * 
 * @return {Number} A number from 0 to 100, with 0 being muted and 100 being full volume
 */

Nimbus.TVController.prototype.getTVVolume = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.TVVolume;
};

/**
 * Set the mute state of the TV audio output.  If SetTVAudSync is set to true this will also
 * affect the STB volume level
 * 
 * @param {Boolean} state  True to mute the audio output
 *
 * @return {Boolean} True if successful
 */

Nimbus.TVController.prototype.setTVMute = function(state){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.TVMute = state;
};

/**
 * Gets the mute state of the TV audio output. If SetTVAudSync is set to true this will also
 * reflect the STB volume level
 * 
 * @return {Boolean} True if TV is muted, or null if undeterminable
 */

Nimbus.TVController.prototype.getTVMute = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.TVMute;
};

/**
 * Set whether the STB and TV use the same volume controls.  If set false, the STB output can be handled
 * independently of TV Volume
 * 
 * @param {Boolean} state  True synchronize TV and STB Audio Controls (default)
 *
 * @return {Boolean} True if successful
 */

Nimbus.TVController.prototype.setTVAudioSync = function(state){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.TVAudioSync = state;
};

/**
 * Gets whether the STB and TV are using the same audio volume controls
 * 
 * @return {Boolean} True if TV and STB are in Sync
 */

Nimbus.TVController.prototype.getTVAudioSync = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.TVAudioSync;
};

/**
 * Set whether the STB and TV use thepower state.  If set false, the STB 
 * power can be on while the TV is off
 * 
 * @param {Boolean} state  True synchronize TV and STB Power states
 * @return {Boolean} True if successful
 */

Nimbus.TVController.prototype.setTVPowerSync = function(state){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.TVPowerSync = state;
};


/**
 * Gets whether the STB and TV are using the same power state
 * 
 * @return {Boolean} True if TV and STB are in Sync
 */

Nimbus.TVController.prototype.getTVPowerSync = function(){
	if (this.TVCtrl == null) {
		return null;
	}
	return this.TVCtrl.TVPowerSync;
};

/**********************************************************************************************
***********************************************************************************************
**********************************************************************************************/
