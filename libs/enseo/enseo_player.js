/**
 * @fileOverview Enseo Nimbus Player Javascript API
 * <p><b>Copyright (c) Enseo, Inc. 2008-2010
 *
 * This material contains trade secrets and proprietary information
 * and	may not	 be used, copied, disclosed or	distributed	 except
 * pursuant to	a license from Enseo, Inc. Use of copyright notice
 * does not imply publication or disclosure.</b>
 */

////////////////////////////////////////////////////////////////////////
//
// Reference   : $Source: /cvsroot/calica/apps/rootfs_common/root/usr/bin/data/html/js/enseo_player.js,v $
//
// Revision	   : $Revision: 1.14.6.2 $
//
// Date		   : $Date: 2011-03-30 22:20:45 $
//
// Description : Nimbus Player javascript API.
//
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
//
// Player functionality
//
////////////////////////////////////////////////////////////////////////

/**
 * Gets the primary player interface for controlling playback of all media types including streaming (RTSP, 
 * UDP, RTP), digital/analog terrestrial/cable channels, analog inputs, and local file content.  The media is
 * selected via an XML channel descriptor of one of following formats:
 * 
	<table border="2">
	<tr>
		<td>
		Channel Type
		</td>
		<td>
		Channel Descriptor Syntax
		</td>
		<td>
		Examples
		</td>
	</tr>
	<tr  valign="top">
		<td>
			RF Analog
		</td>
		<td>
			&lt;ChannelParams ChannelType="Analog"&gt;<br>
				&nbsp;&lt;AnalogChannelParams<br>
					&nbsp;&nbsp;PhysicalChannelIDType=[ChanIDType]<br> 
					&nbsp;&nbsp;PhysicalChannelID=[ChanID]&gt;<br>
				&nbsp;&lt;/AnalogChannelParams&gt;<br>
			&lt;/ChannelParams&gt;<br>
			<br>
		</td>
		<td>
			&lt;ChannelParams ChannelType="Analog"&gt;<br>
				&nbsp;&lt;AnalogChannelParams<br>
					&nbsp;&nbsp;PhysicalChannelIDType="Cable"<br> 
					&nbsp;&nbsp;PhysicalChannelID="78"&gt;<br>
				&nbsp;&lt;/AnalogChannelParams&gt;<br>
			&lt;/ChannelParams&gt;<br>
		</td>
	</tr>
	<tr  valign="top">
		<td>
			RF Digital
		</td>
		<td>
			&lt;ChannelParams ChannelType="Digital"&gt;<br>
				&nbsp;&lt;DigitalChannelParams<br>
					&nbsp;&nbsp;PhysicalChannelIDType=[ChanIDType]<br>
					&nbsp;&nbsp;PhysicalChannelID=[ChanID]<br>
					&nbsp;&nbsp;DemodMode=[DemodMode]<br>
					&nbsp;&nbsp;ProgramSelectionMode=[ProgramSelMode]<br>
					&nbsp;&nbsp;ProgramID=[ProgramID]&gt;<br>
				&nbsp;&lt;/DigitalChannelParams&gt;<br>
			&lt;/ChannelParams&gt;<br>
		</td>
		<td>
			&lt;ChannelParams ChannelType="Digital"&gt;<br>
				&nbsp;&lt;DigitalChannelParams<br>
					&nbsp;&nbsp;PhysicalChannelIDType="Cable"<br>
					&nbsp;&nbsp;PhysicalChannelID="79"<br>
					&nbsp;&nbsp;DemodMode="QAM256"<br>
					&nbsp;&nbsp;ProgramSelectionMode="PATProgram"<br>
					&nbsp;&nbsp;ProgramID="1"&gt;<br>
				&nbsp;&lt;/DigitalChannelParams&gt;<br>
			&lt;/ChannelParams&gt;<br>
		</td>
	</tr>
	<tr  valign="top">
		<td>
			IP Streaming
		</td>
		<td>
			&lt;ChannelParams ChannelType="UDP" Encryption=[EncryptionType]&gt;<br>
				&nbsp;&lt;UDPChannelParams<br>
					&nbsp;&nbsp;Address=[IPAddress]<br>
					&nbsp;&nbsp;Port=[Port]&gt;<br>
				&nbsp;&lt;/UDPChannelParams&gt;<br>
			&nbsp;&lt;/ChannelParams&gt;<br>
		</td>
		<td>
			&lt;ChannelParams ChannelType="UDP" Encryption="Proidiom"&gt;<br>
				&nbsp;&lt;UDPChannelParams<br>
					&nbsp;&nbsp;Address="239.255.224.3"<br>
					&nbsp;&nbsp;Port="1234"&gt;<br>
				&nbsp;&lt;/UDPChannelParams&gt;<br>
			&lt;/ChannelParams&gt;<br>
		</td>
	</tr>
	<tr valign="top">
		<td>
			RTSP
		</td>
		<td>
			&lt;ChannelParams ChannelType="RTSP" Encryption=[EncryptionType]&gt;<br>
				&nbsp;&lt;RTSPChannelParams<br>
					&nbsp;&nbsp;URL=[RTSPURL]<br>
					&nbsp;&nbsp;OpenParams=[RTSPOpenParams]&gt;<br>
				&nbsp;&lt;/RTSPChannelParams&gt;<br>
			&lt;/ChannelParams&gt;<br>
		</td>
		<td>
			&lt;ChannelParams ChannelType="RTSP"&gt;<br>
				&nbsp;&lt;RTSPChannelParams<br>
					&nbsp;&nbsp;URL="rtsp://172.20.255.50/movie1"&gt;<br>
				&nbsp;&lt;/RTSPChannelParams&gt;<br>
			&lt;/ChannelParams&gt;<br>
		</td>
	</tr>
	<tr valign="top">
		<td>
			Internet Radio
		</td>
		<td>
			&lt;ChannelParams ChannelType="InternetRadio"&gt;<br>
				&nbsp;&lt;InternetRadioChannelParams<br>
					&nbsp;&nbsp;URL=[ShoutcastURL]&gt<br>
				&nbsp;&lt;/InternetRadioChannelParams&gt;<br>
			&lt;/ChannelParams&gt;<br>
		</td>
		<td>
			&lt;ChannelParams ChannelType="InternetRadio"&gt;<br>
				&nbsp;&lt;InternetRadioChannelParams<br>
					&nbsp;&nbsp;URL="http://scfire-ntc-aa03.stream.aol.com:80/stream/1040"&gt;<br>
				&nbsp;&lt;/InternetRadioChannelParams&gt;<br>
			&lt;/ChannelParams&gt;<br>
		</td>

	</tr>
	<tr valign="top">
		<td>
			Playlist - For more detailed syntax, see the document<br> "Enseo Set Top Box Network API and Formats"
		</td>
		<td>
			&lt;ChannelParams ChannelType="File"&gt;<br>
				&nbsp;&lt;FileChannelParams<br>
					&nbsp;&nbsp;PlaylistId=[PlaylistID]&gt;<br>
				&nbsp;&lt;/FileChannelParams&gt;<br>
			&lt;/ChannelParams&gt;<br>
			<br>
			&lt;ChannelParams ChannelType="File"&gt;<br>
				&nbsp;&lt;FileChannelParams&gt;<br>
					&nbsp;&nbsp;&lt;Playlist id=[PlaylistIDTemp] drive=[Drive] loop=[Loop]&gt;<br>
					&nbsp;&nbsp;&nbsp;&lt;MPEG name=[Filename] location=[Folder]/&gt;<br>
					&nbsp;&nbsp;&lt;/Playlist&gt;<br>
				&nbsp;&lt;/FileChannelParams&gt;<br>
			&lt;/ChannelParams&gt;<br>
		</td>
		<td>
			&lt;ChannelParams ChannelType="File"&gt;<br>
				&nbsp;&lt;FileChannelParams<br>
					&nbsp;&nbsp;PlaylistId="123"&gt;<br>
				&nbsp;&lt;/FileChannelParams&gt;<br>
			&lt;/ChannelParams&gt;<br>
			<br>
			&lt;ChannelParams ChannelType="File"&gt;<br>
				&nbsp;&lt;FileChannelParams<br>
					&nbsp;&nbsp;&lt;Playlist id="123" drive="System Drive" loop="0"&gt;<br>
					&nbsp;&nbsp;&nbsp;&lt;MPEG name="ding.wav" location=""/&gt;<br>
					&nbsp;&nbsp;&lt;/Playlist&gt;<br>
				&nbsp;&lt;/FileChannelParams&gt;<br>
			&lt;/ChannelParams&gt;<br>
			<br>
		</td>

	</tr>
	<tr  valign="top">
		<td>
			TV/STB Input
		</td>
		<td>
			&lt;ChannelParams ChannelType="Input"&gt;<br>
				&nbsp;&lt;InputChannelParams<br>
					&nbsp;&nbsp;InputID=[InputID]&gt;<br>
				&nbsp;&lt;/InputChannelParams&gt;<br>
			&lt;/ChannelParams&gt;<br>
		</td>
		<td>
			&lt;ChannelParams ChannelType="Input"&gt;<br>
				&nbsp;&lt;InputChannelParams<br>
					&nbsp;&nbsp;InputID="Composite0"&gt;<br>
				&nbsp;&lt;/InputChannelParams&gt;<br>
			&lt;/ChannelParams&gt;<br>
		</td>

	<tr  valign="top">
		<td colspan="3">
			To play only audio or only video, include the ChannelUsage property after the ChannelType.<br>
			&lt;ChannelParams ChannelType="UDP"<br>
				ChannelUsage=[Usage]&gt;<br>
				&nbsp;&lt;UDPChannelParams<br>
					&nbsp;&nbsp;Address=[IPAddress]<br>
					&nbsp;&nbsp;Port=[Port]&gt;<br>
				&nbsp;&lt;/UDPChannelParams&gt;<br>
			&nbsp;&lt;/ChannelParams&gt;<br>
		</td>
	<tr>
	
	<tr  valign="top">
		<td colspan="3">
			where:<br>
			ChanIDType= "Cable", "CableSTD", "CableHRC", "CableIRC", "Air", or "Freq"<br>
			ChanID= [channel number] or [freq in kHz]<br>
			DemodMode= "QAMAuto", "QAM256", "QAM64", or "8VSB"<br>
			ProgramSelMode= "PATProgram"<br>
			ProgramID= [Program listed in PMT]<br>
			IPAddress= [IP Address of stream]<br>
			Port= [Port used for stream]<br>
			RTSPURL= [URL of content]<br>
			RTSPOpenParams= [Optional open params appended to URL] (use "&amp;" for "&" in the params)<br>
			ShoutcastURL= [URL of Shoutcast Radio content]<br>
			PlaylistID= [ID of existing preloaded playlist]<br>
			PlaylistIDTemp= [ID of temporary playlist to create]<br>
			Filename= [Name of media file] Supported types:<br>
			&nbsp;&nbsp;Elementary Stream Types:<br>
			&nbsp;&nbsp;&nbsp;Video: MPEG2, H.264<br>
			&nbsp;&nbsp;&nbsp;Audio: MPEG1/2 (including MP3), AC3, AAC, WAV<br>
			&nbsp;&nbsp;Containing Streams: MPEG2 Transport, MPEG2 Program Stream<br>
			Drive= [Drive where content is located; "Default", "System Drive", "Hard Drive", "Flash Drive", "SSM Drive"]<br>
			Folder= [Optional folder on the drive; If not specified, then a folder called "content" is used]<br>
			Loop= [1 to loop the content, otherwise play once; default is loop]<br>
			InputID= "CompositeN", "S-VideoN", "ComponentN", "DVI/HDMIN", or "VGA/RGBN" where N= 0 thru 7<br>
			&nbsp;&nbsp;Prefix the InputID with "Local_" to only specify inputs that are local to the STB.<br>
			&nbsp;&nbsp;Otherwise, the InputID is a logical ID which can refer to TV inputs or inputs local to the STB. <br>
			Usage= "AudioVideo", "AudioOnly", "VideoOnly"<br>
			EncryptionType= "Proidiom", "VCAS", "Auto", "None" (Optional: "Auto" is used if the encryption type is not specified.)
		</td>
	<tr>
	</table>
 * 
 * @param {String} content  The XML channel descriptor of the media in which to play.  If null, then return the last player created.
 * @param {Number} position  The number of milliseconds into the media resource to start playing from. Optional, default = 0.
 * @param {String} decryptSessionID  Decryption session ID.  Optional.
 * @return {Nimbus.Player} Instance of the Nimbus.Player interface, or null if the player could not be created
 */

Nimbus.getPriPlayer = function(content, position, decryptSessionID){
	return Nimbus.getPlayerInternal("primary", content, position, decryptSessionID);
}

/**
 * Gets the secondary player.  See getPriPlayer for basic player information.  Secondary player limitations:<br>
 * HD3000:<br>
 *  1. Only SD video resolutions supported.<br>
 *  2. Only locally-stored WAV audio files are supported when the primary player is playing compressed audio.<br>
 * HD2000:<br>
 *  1. Only RF Digital and streaming channel types are supported.<br>
 *  2. Only one RF digital channel can be open at any given time since the STB hardware is limited to one 
 *     tuner and demodulator.<br>
 *  3. Only MPEG video (SD/HD) is supported. (The primary player also supports H.264 video.)<br>
 *	4. Closed captioning is only supported on the primary player.<br>
 *  5. VChip is only supported on the primary player.<br>
 *  6. Secondary player is not available if the primary player is playing an analog channel.<br>
 * 
 *  Note that the Nimbus.setSecPlayerMaxProfile must be used prior to using the secondary player (HD2000 only).
 */

Nimbus.getSecPlayer = function(content, position, decryptSessionID){
	return Nimbus.getPlayerInternal("secondary", content, position, decryptSessionID);
}

/**
 * @ignore (Omit from documentation)
 * Gets the primary player.  See getPriPlayer.  Provided for backwards compatibility with prior Nimbus
 * API releases.
 * 
 */

Nimbus.getPlayer = function(content, position, decryptSessionID){
	return Nimbus.getPlayerInternal("primary", content, position, decryptSessionID);
}

/**
 * @ignore (Omit from documentation)
 *
 */

Nimbus.getPlayerInternal = function(type, content, position, decryptSessionID){
	var CurPlayer = null;
	if (type == "primary") {
		CurPlayer = Nimbus.CurrentPriPlayer;
	} else if (type == "secondary") {
		CurPlayer = Nimbus.CurrentSecPlayer;
	} else {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getPlayer, invalid type: " + type);
		return null;
	}

	// If no settings string specified, return current player, if any.
	if (content == null) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getPlayer, current " + type + " player requested");
		return CurPlayer;
	}

	// Only one active player currently supported
	if (CurPlayer != null) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getPlayer, failed since a " + type + " player already exists");
		return null;
	}
	var InitialPos = 0;
	if (content != null) {
		InitialPos = position;
	}

	var SessionID = "";
	if (decryptSessionID != null) {
		SessionID = decryptSessionID;
	}
	
	// Create a new player class
	var player = null;
	player = new Nimbus.Player(content, InitialPos, SessionID, type);
	if (player != null) {
		if (type == "primary") {
			Nimbus.CurrentPriPlayer = player;
		} else if (type == "secondary") {
			Nimbus.CurrentSecPlayer = player;
		}
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getPlayer, new " + type + " player, content desc= " + content);
	}
	return player;
};

/**
 * Sets the maximum decoding profile to be required by the secondary player.  This method must
 * be used if the secondary player will be used.  By setting the profile, the firmware can
 * configure the boot-time memory allocations which reserve memory for decoder usage.  As a
 * consequence, then method will indicate whether a reboot is necessary for the change to be
 * applied.
 * <br><br>
 * HD2000 Only
 *
 * @param {String} mode Video Decoder Profile:<br>
 * "None"<br>
 * "MPEG2 HD 720"<br>
 * "MPEG2 HD 1080"<br>
 * "H.264 HD"<br>
 * @return {Boolean} Null - failure, True - successful, False - successful but reboot needed.
 *
 */

Nimbus.setSecPlayerMaxProfile = function(profile){
	return Nimbus.NimbusObj.SetSecPlayerMaxProfile(profile);
};

/**
 * Gets the player auto input switch enable.
 * 
 * @return {Boolean} Switching enabled.  See Nimbus.setAutoInputSwitch.
 */

Nimbus.getAutoInputSwitch = function(){
	return Nimbus.NimbusObj.GetAutoInputSwitch();
};

/**
 * Enables or disables the automatic switching of the TV input to the output
 * of the STB when a player is opened (and the channel is not a TV input). 
 * This mode is enabled by default.
 * 
 * @param {Boolean} state  True to enable auto input switching
 * @return {Boolean} True if successful
 */

Nimbus.setAutoInputSwitch = function(state){
	return Nimbus.NimbusObj.SetAutoInputSwitch(state);
};

/**
 * Gets the S/PDIF output mode.
 * 
 * @return {Boolean} bBitstream.  See Nimbus.setSPDIFMode.
 */

Nimbus.getSPDIFMode = function(){
	return Nimbus.NimbusObj.GetSPDIFMode();
};

/**
 * Sets the S/PDIF output mode.
 * 
 * @param {Boolean} bBitstream  True to pass compressed bitstream to external decoder/amplifier
 *                              when using the primary player.  Otherwise the STB should decode the audio and send PCM audio
 *                              instead.  When bitstream mode is enabled, audio output from the secondary player is not available.
 *
 * @return {Boolean} True if successful
 */

Nimbus.setSPDIFMode = function(bBitstream){
	return Nimbus.NimbusObj.SetSPDIFMode(bBitstream);
};

/**
 * Class providing an interface for controlling a player - use Nimbus.getPriPlayer or 
 * Nimbus.getSecPlayer to obtain an instance.
 * 
 * @class
 */

Nimbus.Player = function(content, InitialPos, SessionID, type){
	// Create a native js player object
	this.PlayerObj = new EONimbusPlayer(content, InitialPos, SessionID, type);
	Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.Player constructor, content desc=" + content);
	this.content = content;
	this.type = type;
};

/**
 * Sets the settings of the media to playback.  This method can be used to change the media being
 * played by the player.  This method is recommended for the fastest channel changes such as when the guest is 
 * navigating thru a list of free-to-guest channels.  If the player is currently playing, then the player 
 * will be stopped and restarted using the new settings.
 * 
 * @param {String} content           The XML channel descriptor of the new media.  See the the Nimbus.getPriPlayer method for more details.
 * @param {String} decryptSessionID  Decryption session ID.  Optional.
 *
 * @return {Boolean} True if successful
 * 
 */

Nimbus.Player.prototype.setContent = function(content, decryptSessionID){
	if (this.PlayerObj == null) {
		return false;
	}
	this.content = content;

	var SessionID = "";
	if (decryptSessionID != null) {
		SessionID = decryptSessionID;
	}
	return this.PlayerObj.SetContent(content, SessionID);
};

/**
 * Returns true if the player is capable (ready) of playing media.  False is returned if the player is
 * not in a state to play media (such as the media cannot be accessed, the player has been destroyed, 
 * or an internal error has occured).
 * 
 * @return {Boolean} True if the player is in a state to play media
 */

Nimbus.Player.prototype.isReady = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.GetReadyStatus();
};

/**
 * @ignore
 * Returns true if the media content includes video/graphics output.
 * 
 * <br><br><b>**** Unimplemented ****</b>
 *
 * @return {Boolean} True if content includes video/graphics output
 */

Nimbus.Player.prototype.isContentDisplayable = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.IsContentDisplayable();
};

/**
 * Returns true if VChip is blocking the presentation of the content.
 * 
 * @return {Boolean} True if VChip is blocking this content
 */

Nimbus.Player.prototype.isVChipBlocking = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.GetVChipBlocking();
};

//
// Player status code
//
Nimbus.Player.Status_OK 						= 0;	// Playback opened successfully or last player command successful.
Nimbus.Player.Status_Error 						= 1;	// Normally should not occur.
Nimbus.Player.Status_Reacquiring				= 2;	// Obsolete.  Replaced with more specific error status codes.
Nimbus.Player.Status_NoRFHW						= 3;	// Playback failed.  R/F channel type specified but no R/F front end hardware.
Nimbus.Player.Status_PowerOff					= 4;	// Playback failed.  Board power state is OFF.
Nimbus.Player.Status_DemodLockFailed			= 5;	// Playback failed.  Cannot lock to signal.  Open retries will occur.
Nimbus.Player.Status_NotAuthorized				= 6;	// Enseo Proidiom authorization in progress.
Nimbus.Player.Status_Authorizing				= 7;	// Not used.
Nimbus.Player.Status_Pending					= 8;	// Playback is in the process of opening a new channel.
Nimbus.Player.Status_Closed						= 9;	// Playback is closed.
Nimbus.Player.Status_EndOfStream				= 10,	// Playback reached the end of the stream (RTSP only).
Nimbus.Player.Status_NotAvailable				= 11,	// Playback failed.  Required resource is busy (Tuner/demod for RF channel).
Nimbus.Player.Status_OutputProtectionRequired	= 12;	// Playback failed.  The content is protected but output protection is not enabled.
														// RTSP Playback failures: (Retries will occur if retries enabled. See setRetryEnable())
Nimbus.Player.Status_RTSP_TCPOpenFailed			= 20;	// 		TCP open failure
Nimbus.Player.Status_RTSP_OptionsReqFailed		= 21;	//		Options request failed
Nimbus.Player.Status_RTSP_DescribeReqFailed		= 22;	//		Describe request failed
Nimbus.Player.Status_RTSP_SetupReqFailed		= 23;	//		Setup request failed
Nimbus.Player.Status_RTSP_PlayReqFailed			= 24;	//		Play request failed
Nimbus.Player.Status_RTSP_PauseReqFailed		= 25;	//		Pause request failed
Nimbus.Player.Status_AnalogDecoderLockFailed	= 50;	// Playback failed.  Analog decoder cannot lock to signal.  Open retries will occur.
Nimbus.Player.Status_AnalogCaptureOpenFailed	= 51;	// Playback failed.  Analog capture failed.  Open retries will occur.
Nimbus.Player.Status_TSPlayer_OpenFailed		= 60;	// Playback failed.  MPEG TS/PS stream player failed to open.  Open retries will occur.
Nimbus.Player.Status_TSPlayer_PlayFailed		= 61;	// Playback failed.  MPEG TS/PS stream player failed to play.  Open retries will occur.
Nimbus.Player.Status_TSPlayer_PATError			= 62;	// Playback failed.  MPEG TS stream player failed to find a PAT in the stream.  Open retries will occur.
Nimbus.Player.Status_TSPlayer_PMTError			= 63;	// Playback failed.  MPEG TS stream player failed to find a PMT in the stream.  Open retries will occur.
Nimbus.Player.Status_TSPlayer_VCTError			= 64;	// Playback failed.  MPEG TS stream player failed to find a VCT in the stream.  Open retries will occur.
Nimbus.Player.Status_TSPlayer_ProgramNotAvail	= 65;	// Playback failed.  MPEG TS stream player failed to find the specified MPEG program in the stream.  Open retries will occur.
Nimbus.Player.Status_TSPlayer_PlaybackError		= 66;	// Playback failed.  MPEG TS/PS stream player encountered a decoding error.  Open retries will occur.
Nimbus.Player.Status_IP_OpenFailed				= 80;	// Playback failed.  RTP/UDP player failed to receive stream data.  Open retries will occur.

/**
 * Gets the error status describing the current error condition (if any).
 *
 * @return {Number} Error status
 */

Nimbus.Player.prototype.getErrorStatus = function(){
	if (this.PlayerObj == null) {
		return null;
	}
	return this.PlayerObj.GetErrorStatus();
};

/**
 * Returns true if the player has encountered an error during playback and is currently
 * in an error state.  Errors can include loss of stream or RF signal.  In most cases
 * the player will continue to retry until the issue can be resolved or the player
 * is stopped/destroyed.
 * 
 * @return {Boolean} True if the player is in the error state
 */

Nimbus.Player.prototype.isInError = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	var status = this.PlayerObj.GetErrorStatus();
	return status != Nimbus.Player.Status_OK &&
		   status != Nimbus.Player.Status_Closed &&
		   status != Nimbus.Player.Status_Pending &&
		   status != Nimbus.Player.Status_Authorizing;
};

/**
 * Gets the rating of the program (if available).
 * 
 * @return {String} Rating description string of the program
 */

Nimbus.Player.prototype.getProgramRating = function(){
	if (this.PlayerObj == null) {
		return null;
	}
	return this.PlayerObj.GetProgramRating();
};

/**
 * Gets the title of the current program/track. Null is returned if the title is unknown.
 * 
 * @return {String} Title, or null if undeterminable
 */

Nimbus.Player.prototype.getProgramTitle = function(){
	if (this.PlayerObj == null) {
		return null;
	}
	return this.PlayerObj.GetProgramTitle();
};

/**
 * Gets the length of the media content.  Zero is returned if the length is unknown.
 * 
 * @return {Number} Length in seconds, or 0 if unknown
 */

Nimbus.Player.prototype.getContentLength = function(){
	if (this.PlayerObj == null) {
		return null;
	}
	return this.PlayerObj.GetContentLength();
};

/**
 * Restarts audio playback using a specific pid
 * 
 * @return {Boolean} true for success
 */

Nimbus.Player.prototype.restartAudio = function(pid){
	if (this.PlayerObj == null) {
		return null;
	}
	return this.PlayerObj.RestartAudio(pid);
};


/**
 * Restarts audio playback using a specific pid
 * 
 * @return {Boolean} true for success
 */

Nimbus.Player.prototype.getAudioInfo = function(pid){
	if (this.PlayerObj == null) {
		return null;
	}
	Nimbus.logMessage(" **************** " );
	var json = this.PlayerObj.GetAudioInfo();
	Nimbus.logMessage( '(' + json + ')' );
	if( json == null ) {
		return null;
	}
	return eval('(' + json + ')');
};


/**
 * Sets the playback rate of the current media.
 * 
 * @param {Number} rate The new playback rate.  Examples:<br>
 *   0 - stopped<br>
 *   1 - play at normal speed<br>
 *   0.5 - play at half speed<br>
 *   2 - play at 2x speed<br>
 *   -2 - play in reverse at 2x speed
 *
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.setSpeed = function(rate){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.SetSpeed(rate);
};

/**
 * Gets the playback rate at which the media is currently playing. If the media has not yet started
 * playing or is stopped, this method returns 0.  See Player.setSpeed.
 * 
 * @return {Number} The current playback rate the media
 */

Nimbus.Player.prototype.getSpeed = function(){
	if (this.PlayerObj == null) {
		return 0;
	}
	return this.PlayerObj.GetSpeed();
};

/**
 * Starts the player from the current position at the current rate. 
 * 
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.play = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.Play();
};

/**
 * Pauses the player.  If the current media includes video content, then the last frame is displayed.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.pause = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.Pause();
};

/**
 * Advances the player to the next clip.  Only applicable for certain channel types (ie. playlists).
 * 
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.next = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.Next();
};

/**
 * Stops the player.  If the current media includes video content, then the video is hidden/blanked.  The current
 * playback position is not changed.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.stop = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.Stop();
};

/**
 * Stops player and frees all resources associated with it.  After the player is stopped, all other
 * player methods (except isReady & destroy) return a failed result.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.close = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	if (this.type == "primary") {
		Nimbus.CurrentPriPlayer = null;
	} else if (this.type == "secondary") {
		Nimbus.CurrentSecPlayer = null;
	} else {
		return false;
	}		
	return this.PlayerObj.Close();
};

/**
 * Sets the playback position of the player.  If currently in the playing state, the player will
 * immediately change to this position and continue playing.  Otherwise, the new position will not
 * be used until after a play is issued.
 * 
 * @param {Number} position  Playback position in seconds
 *
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.setPosition = function(position){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.SetPosition(position);
};

/**
 * Gets the playback position of the player. If the length of the media is infinite/unknown,
 * then this function returns the number of seconds the player has been playing the media.
 * 
 * @return {Number} Playback position in seconds
 */

Nimbus.Player.prototype.getPosition = function(){
	if (this.PlayerObj == null) {
		return null;
	}
	return this.PlayerObj.GetPosition();
};

/**
 * Sets the player retry enable.
 *
 * @param {Boolean} retry True if the player should retry on a failed attempt to
 *						  open the content (default).  Otherwise the application
 *						  must monitor the error status and close/reopen to try again.
 *						  This option only applies to RTSP content.
 *
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.setRetryEnable = function(retry){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.SetRetryEnable(retry);
};

/**
 * Gets the player retry enable.
 * 
 * @return {Boolean} Retry enabled.  See Nimbus.Player.setRetryEnable.
 */

Nimbus.Player.prototype.getRetryEnable = function(){
	if (this.PlayerObj == null) {
		return null;
	}
	return this.PlayerObj.GetRetryEnable();
};

/**
 * Enables or disables the display of the video layer. When enabled, the video layer
 * is shown at the specified (or default) position/size/layer-order settings.
 * 
 * @param {Boolean} state  True to enable the video layer
 *
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.setVideoLayerEnable = function(state){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.SetVideoLayerEnable(state);
};

/**
 * Gets the display enable state of the video layer. This function does not indicate if the window
 * is actually visible due to position/size/layer-order.
 * 
 * @return {Boolean} True if video layer is enabled for display
 */

Nimbus.Player.prototype.getVideoLayerEnable = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.GetVideoLayerEnable();
};

/**
 * Sets the screen position and size of the video layer.  This method can be used when the video layer is disabled.
 * (The coordinate system used for the video layer is the same as used for the browser graphics layer.)
 * 
 * @param {Number} x  Number of pixels from the left edge of the screen to the left edge of the video window
 * @param {Number} y  Number of pixels from the top edge of the screen to the top edge of the video window
 * @param {Number} w  Width of the video window in pixels
 * @param {Number} h  Height of the video window in pixels
 *
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.setVideoLayerRect = function(x, y, w, h){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.SetVideoLayerRect(x, y, w, h);
};

/**
 * Gets the screen position and size of the video layer.  (The coordinate system used for the video layer is
 * the same as used for the browser graphics layer.)
 * 
 * @return {Object} The position and size of the video layer on the screen:<br>
 * 	{Number} x      - Number of pixels from the left edge of the screen to the left edge of the video window<br>
 * 	{Number} y      - Number of pixels from the top edge of the screen to the top edge of the video window<br>
 *  {Number} width  - Width of the video window in pixels<br>
 *  {Number} height - Height of the video window in pixels
 */

Nimbus.Player.prototype.getVideoLayerRect = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	var rect = new Array();
	rect.x = this.PlayerObj.GetVideoLayerRectX();
	rect.y = this.PlayerObj.GetVideoLayerRectY();
	rect.width = this.PlayerObj.GetVideoLayerRectWidth();
	rect.height = this.PlayerObj.GetVideoLayerRectHeight();
	return rect;
};

/**
 * Sets the blending mode of the video window.
 * 
 * @param {String} mode Blending mode<br>
 *  "uniform_alpha"  - The alpha value set via setVideoLayerTransparency() is used to control blending of the pixels
 *                     in the video window with the browser layer.<br>
 *  "page_alpha"     - The resulting alpha channel of the browser layer controls blending. This mode requires more CPU
 *                     for rendering the browser page.<br>
 *  "colorkey"       - The color key set via setChromaKeyColor() is used to control which pixels on the browser layer
 *                     are transparent.<br>
 *  "colorkey_alpha" - Same as "colorkey" mode except that browser layer pixels not having the color key value are
 *                     blended using the alpha value set via setVideoLayerTransparency().
 *                     
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.setVideoLayerBlendingMode = function(mode){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.SetVideoLayerBlendingMode(mode);
};

/**
 * Gets the blending mode of the video window.
 * 
 * @return {String} The blending mode.  See Nimbus.Player.setVideoLayerBlendingMode
 */

Nimbus.Player.prototype.getVideoLayerBlendingMode = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.GetVideoLayerBlendingMode();
};

/**
 * Sets the transparency of the video window.
 * 
 * @param {Number} transparency  A number from 0 to 1 representing the transparency of the video window (0 => fully opaque, 1 => fully transparent)
 *
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.setVideoLayerTransparency = function(transparency){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.SetVideoTransparency(transparency);
};

/**
 * Gets the transparency of the video window.
 * 
 * @return {Number} A number from 0 to 1 representing the transparency of the video window (0 => fully opaque, 1 => fully transparent)
 */

Nimbus.Player.prototype.getVideoLayerTransparency = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.GetVideoTransparency();
};

/**
 * Sets the color key used on the browser graphics layer to allow the video layer to be seen through the 
 * browser graphics layer when the video window is behind the browser graphics layer.  All pixels
 * on the browser graphics layer that are of this color become transparent when the video layer is behind it.
 * 
 * @param {Number} color  Hex color code indicating the chroma key color
 *
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.setChromaKeyColor = function(color){
	if (this.PlayerObj == null) {
		return false;
	}
	this.PlayerObj.SetVideoChromaKey(color);
	return true;
};

/**
 * Gets the color key used on the browser graphics layer to allow the video layer to be seen through the 
 * browser graphics layer when the video window is behind the browser graphics layer.
 * 
 * @return {Number} Hex color code indicating the chroma key color
 */

Nimbus.Player.prototype.getChromaKeyColor = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.GetVideoChromaKey();
};

/**
 * Raises video window to the top of the video window stack.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.raiseVideoLayerToTop = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.RaiseVideoLayerToTop();
};

/**
 * Lowers video window to the bottom of the video window stack.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.lowerVideoLayerToBottom = function(){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.LowerVideoLayerToBottom();
};

/**
 * Sets the picture format for video playback. 
 *
 * @param {String} mode Picture format mode:<br>
 *  "Native"        - Uses default formatting to maintain proportions<br>
 *  "Widescreen"    - Stretches 4x3 content to fill the 16x9 frame<br>
 *  "4x3 Expanded"  - Stretches the 4x3 content of a 16x9 frame to fill the 16x9 frame<br>
 *  "16x9 Expanded" - Stretches the 16x9 content of a 4x3 frame to fill the 16x9 frame<br>
 *
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.setPictureFormat = function(mode){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.SetPictureFormat(mode);
};

/**
 * Gets the picture format used for video playback.
 * 
 * @return {String} Picture format mode.  See Nimbus.Player.setPictureFormat.
 */

Nimbus.Player.prototype.getPictureFormat = function(){
	if (this.PlayerObj == null) {
		return null;
	}
	return this.PlayerObj.GetPictureFormat();
};

/**
 * @ignore
 * Enables or disables the current player as the primary closed captioning source.
 * By default, a newly created player becomes the primary source if no other player
 * is already the primary source.
 *
 * <br><br><b>**** Unimplemented ****</b>
 * 
 * @param {Boolean} state True if this player if the primary CC source.
 *
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.setPrimaryCCSource = function(state){
//	if (this.PlayerObj == null) {
//		return false;
//	}
//	return this.PlayerObj.SetPrimaryCCSource(state);
	// Currently only one player supported, so always the primary source
	return true;
};

/**
 * @ignore
 * Gets whether the current player is the primary closed captioning source.
 * 
 * <br><br><b>**** Unimplemented ****</b>
 *
 * @return {Number} True if this player if the primary CC source.
 */

Nimbus.Player.prototype.getPrimaryCCSource = function(){
//	if (this.PlayerObj == null) {
//		return false;
//	}
//	return this.PlayerObj.GetPrimaryCCSource();
	// Currently only one player supported, so always the primary source
	return true;
};

/**
 * Sets the audio volume level of the player.  This volume level is independent of the overall audio
 * output volume setting of the TVController.  This setting can be used to provide a more consistent
 * volume level by adjusting the volume level of content that was encoded at a higher nominal level.
 * When multiple players are available, this control can be used to set the mixing of the combined
 * audio.
 * 
 * @param {Number} volume  A number from 0 to 100, with 0 being muted and 100 being full volume
 *
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.setVolume = function(volume){
	if (this.PlayerObj == null) {
		return false;
	}
	return this.PlayerObj.SetVolume(volume);
};

/**
 * Gets the audio volume level of the player.
 * 
 * @return {Number} A number from 0 to 100, with 0 being muted and 100 being full volume
 */

Nimbus.Player.prototype.getVolume = function(){
	if (this.PlayerObj == null) {
		return null;
	}
	return this.PlayerObj.GetVolume();
};

/**
 * Sends a 'get parameter' request to the RTSP server.  This function
 * returns a handle which is then used as the argument to the
 * getRTSPResponse function to read the reponse.
 *
 * (Optional functionality.)
 * 
 * @param {String} request  The request string to send
 *
 * @return {Number} Handle to be used to read the request, or null on error
 */

Nimbus.Player.prototype.sendRTSPGetParameter = function(request){
	if (this.PlayerObj == null) {
		return null;
	}
	return this.PlayerObj.SendRTSPGetParameter(request);
};

/**
 * Sends a 'set parameter' request to the RTSP server.  This function
 * returns a handle which is then used as the argument to the
 * getRTSPResponse function to read the reponse.
 *
 * (Optional functionality.)
 * 
 * @param {String} request  The request string to send
 *
 * @return {Number} Handle to be used to read the request, or null on error
 */

Nimbus.Player.prototype.sendRTSPSetParameter = function(request){
	if (this.PlayerObj == null) {
		return null;
	}
	return this.PlayerObj.SendRTSPSetParameter(request);
};

/**
 * Gets the response of a previous 'set parameter' or 'get parameter' request.
 * 
 * (Optional functionality.)
 *
 * @param {String} handle  The handle returned by the sendRTSPSetParameter/sendRTSPGetParameter function
 *
 * @return {String} Response string if available, otherwise null
 */

Nimbus.Player.prototype.getRTSPResponse = function(handle){
	if (this.PlayerObj == null) {
		return null;
	}
	return this.PlayerObj.GetRTSPResponse(handle);
};

/**
 * Gets a received RTSP announcement.
 * Note that a notification event is sent to the JS application when 
 * an announcement is available.  For this event the EventMsg field is set to 
 * "RTSPAnnouncementWaiting".  A subsequent event is only sent after
 * the JS application call the GetRTSPAnnouncement method.
 *
 * (Optional functionality.)
 * 
 * @return {String} Announcement string if available, otherwise null
 */

Nimbus.Player.prototype.getRTSPAnnouncement = function(){
	if (this.PlayerObj == null) {
		return null;
	}
	return this.PlayerObj.GetRTSPAnnouncement();
};

/**
 * @ignore
 * <b>Deprecated - renamed to getRTSPAnnouncement</b>
 */
Nimbus.Player.prototype.getRTSPAnnoucement = function(){
	if (this.PlayerObj == null) {
		return null;
	}
	return this.PlayerObj.GetRTSPAnnouncement();
};

/**
 * Gets the last RTSP command and the response received from the RTSP server.
 * 
 * (Optional functionality.)
 *
 * @return {Object} The position and size of the video layer on the screen:<br>
 * 	{String} command  - RTSP command that was issued<br>
 * 	{Number} response - RTSP response code
 */

Nimbus.Player.prototype.getLastRTSPCmdResponse = function(){
	if (this.PlayerObj == null) {
		return null;
	}
	var RespObj = new Array();
	RespObj.cmd = "";
	RespObj.response = 0;

	var resp = this.PlayerObj.GetLastRTSPCmdResponse();	
	// Parse the cmd code and response from the string: <cmd string>,<numeric response>
	var pos = resp.search(/,/i);
	if (pos != -1) {
		// Comma found, get each field
		RespObj.command = resp.slice(0, pos);
		RespObj.response = parseInt(resp.slice(pos + 1, resp.length));
	}	
	return RespObj;
};

/**
 * Sets the teardown reason code to be sent on the next RTSP teardown.
 *
 * (Optional functionality.)
 * 
 * @param {Number} reason Application/server specific reason code
 *
 * @return {Boolean} True if successful
 */

Nimbus.Player.prototype.setRTSPTeardownReason = function(reason){
	if (this.PlayerObj == null) {
		return false;
	}
	this.PlayerObj.SetRTSPTeardownReason(reason);
	return true;
};

/**********************************************************************************************
***********************************************************************************************
**********************************************************************************************/
