/**
 * @fileOverview Enseo Nimbus DataChannel Javascript API
 * <p><b>Copyright (c) Enseo, Inc. 2008-2010
 *
 * This material contains trade secrets and proprietary information
 * and	may not	 be used, copied, disclosed or	distributed	 except
 * pursuant to	a license from Enseo, Inc. Use of copyright notice
 * does not imply publication or disclosure.</b>
 */

////////////////////////////////////////////////////////////////////////
//
// Reference   : $Source: /cvsroot/calica/apps/rootfs_common/root/usr/bin/data/html/js/enseo_datachan.js,v $
//
// Revision	   : $Revision: 1.13 $
//
// Date		   : $Date: 2011-02-23 08:58:01 $
//
// Description : Nimbus DataChannel javascript API.
//
////////////////////////////////////////////////////////////////////////


/**
 * Gets an interface for creating and controlling a data channel object.
 * 
 * @return {Nimbus.DataChannel} Instance of the Nimbus.DataChannel interface, or null if the object could not be created
 */
 
Nimbus.getDataChannel = function(){

	// Create a new browser window class
	var win = new Nimbus.DataChannel();
	if (win != null) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getDataChannel");
	}
	return win;
};

/**
 * Class providing an interface for creating and controlling a data channel - use Nimbus.getDataChannel 
 * to obtain an instance.   A data channel can be created to receive IP multicast or unicast messages.  
 * The message format can either be raw or Enseo-specific.  When raw mode is used, the data sent/received is
 * passed from/to the Nimbus App as is.  The Enseo-specific message format is:<br>
 * <br>
 * EONIMBUSDATACHANNEL|ver|seq#|checksum|length|payload                 <br>
 * <br>
 * where: <br>
 *   ver      is 1 (and currently no other value is accepted).  If the version number is out of range the payload will be rejected.<br><br>
 *   seq#     is an unsigned (i.e. positive) payload sequence number (expressed as base 10 ASCII digits). It should not exceed the
 *            range of unsigned 32 bit integer.  It is used for filtering payloads in situations where payloads are sent redundantly.
 *            The sequence number is compared with those of recent payloads received on the same address.  The payload will be
 *            rejected (i.e. not passed to the Nimbus application) if the sequence number matches any previous payload received within
 *            a hold-off interval (by default, 60 seconds).  This hold-off period can be adjusted by Nimbus application.<br><br>
 *  checksum  is a CRC32 checksum (expressed as base 16 ASCII in the form 0xXXXXXXXX) pre-calculated over the payload bytes 
 *            (i.e. all bytes following the closing '|' separator of the payload length field). If the checksum is 0 (0x0) the
 *            checksum will not be verified. If the checksum does not agree with that calculated over the received bytes the payload
 *            will be rejected.<br><br>
 *  length    is the number of payload bytes following the closing '|' character of this field.  This is the length of the region over
 *            which the CRC32 checksum is calculated.  The maximum payload length is limited to 8k bytes.  The length should be greater
 *            than zero.  The payload will be rejected if the actual received length does not match the specified length.<br><br>
 *  payload   is the payload bytes.  The payload will be passed as-is to the Nimbus application as a JavaScript string.  As such, there
 *            are restrictions on acceptable bytes.  For example, it must not contain a C String termination character (0) and in general
 *            should contain printable ASCII characters.<br>
 * 
 * @class
 */

Nimbus.DataChannel = function(){
	// Create a browser window object
	this.DataChanObj = new EONimbusDataChannel();
	this.ID = this.DataChanObj.GetID();
	Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.DataChannel constructor, ID= " + this.ID);
};

/**
 * Gets the Data Channel ID.
 * 
 * @return {Number} Channel ID
 */

Nimbus.DataChannel.prototype.getID = function(){
	if (this.DataChanObj == null) {
		return 0;
	}
	return this.ID;
};

/**
 * Opens the data channel as an IP multicast UDP receiver.
 * 
 * @param {String}  Address   IP Multicast address.
 * @param {Number}  Port      IP port.
 * @param {Boolean} bRawMode  If true, pass all data without interpretation.
 *                            This is an optional parameter which defaults to false.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.DataChannel.prototype.openIPMulticast = function(address, port, bRawMode){
	if (this.DataChanObj == null) {
		return false;
	}
	return this.DataChanObj.OpenIPMulticast(address, port, bRawMode);
};

/**
 * Opens the data channel as an IP unicast TCP server.
 * 
 * @param {Number}  Port          TCP port.
 * @param {Boolean} bUseBuffering True to buffer outgoing messages when there
 *                                is no active connection with a client.
 * @param {Boolean} bRawMode      If true, pass all data without interpretation.
 *                                This is an optional parameter which defaults to false.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.DataChannel.prototype.openIPUnicastServer = function(port, bUseBuffering, bRawMode){
	if (this.DataChanObj == null) {
		return false;
	}
	return this.DataChanObj.OpenIPUnicastServer(port, bUseBuffering, bRawMode);
};

/**
 * Opens the data channel as an IP unicast UDP receiver.
 * 
 * @param {Number}  Port      UDP port.
 * @param {Boolean} bRawMode  If true, pass all data without interpretation.
 *                            This is an optional parameter which defaults to false.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.DataChannel.prototype.openUDPUnicastServer = function(port, bRawMode){
	if (this.DataChanObj == null) {
		return false;
	}
	return this.DataChanObj.OpenUDPUnicastServer(port, bRawMode);
};

/**
 * Specify a terminator character when working with a serial 
 * device 
 * 
 * @param {String}	Terminator character.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.DataChannel.prototype.terminator = function(term)
{
	if (this.DataChanObj == null) {
		return false;
	}
	return this.DataChanObj.Terminator(term);
};

/**
 * Open a serial device data channel
 * 
 * @param {String}	device path.  Currenty forced to the STB AUX port
 *
 * @param {Number}	buad rate 
 *  
 * @param {Number} bits per word.  Currently forced to 8.
 *  
 * @param {String} parity bits.  Can be 'none', 'even', or 
 *  	  'odd'.  Currently forced to 'none'.
 *  
 * @param {Number} stop bits.  Currently forced to 1.
 *  
 * @return {Boolean} True if successful
 */

Nimbus.DataChannel.prototype.openSerial = function(device, baudRate, bits, parity, stop)
{
	if (this.DataChanObj == null) {
		return false;
	}
	return this.DataChanObj.OpenSerial( device, baudRate, bits, parity, stop );
};

/**
 * Closes the data channel.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.DataChannel.prototype.close = function(){
	if (this.DataChanObj == null) {
		return false;
	}
	return this.DataChanObj.Close();
};

/**
 * Gets the next message in the receive queue.  The message is effectively
 * consumed by calling this method.
 * 
 * @return {String} Message string if available, otherwise null
 */

Nimbus.DataChannel.prototype.getMessage = function(){
	if (this.DataChanObj == null) {
		return false;
	}
	return this.DataChanObj.GetMessage();
};

/**
 * Returns the next Message in the receive queue as a byte array. Includes
 * client info.  The message is effectively consumed by calling this
 * method.

 * @return {Object} Message Data Object:<br>
 *  {Array}   messageData   - The message data stored as array of byte values.<br>
 *  {Number}  messageLength - The number of bytes in the message.<br>
 * 	{String}  clientAddress - The IPv4 address of the client which sent the message.<br>
 *  {Number}  clientPort    - The port from which the client sent the message.<br>
 *  {Number}  sequence      - Sequence number if message was received via UDP multicast.
 */

Nimbus.DataChannel.prototype.getMessageObject = function(){
	if (this.DataChanObj == null) {
		return false;
	}
	var json = this.DataChanObj.GetMessageObject ();
	if (json == null) {
		return null;
	}
	return eval('(' + json + ')');
};

/**
 * Place a message into the sending message queue.  Messages placed into
 * this queue are sent to the currently connected (tcp unicast) client or
 * the next client which connects on this data channel.
 * Message can be a string or an Array of byte values.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.DataChannel.prototype.sendMessage = function(message){
	if (this.DataChanObj == null) {
		return false;
	}
	if ('string' == typeof (message)) {
		// Pass the message string as-is
		return this.DataChanObj.SendMessage(message);
	} else if ('object' == typeof (message)) {
		// Treat the message as an array of byte values.
		var m = message.toString();
		var nelms = message.length;
		return this.DataChanObj.SendMessage(m, nelms);
	}
};

/**
 * Flushes the data channel receive message queue.  All messages currently in the
 * receive queue will be discarded.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.DataChannel.prototype.flush = function(){
	if (this.DataChanObj == null) {
		return false;
	}
	return this.DataChanObj.Flush();
};

/**
 * Flushes the data channel transmit message queue.
 * All messages which are still waiting to be sent are discarded.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.DataChannel.prototype.flushUnsentMessages = function(){
	if (this.DataChanObj == null) {
		return false;
	}
	return this.DataChanObj.FlushUnsentMessages();
};

/**
 * Resets the queue filter.  The queue filter discards duplicate
 * messages (ie. messages having the same sequence number) to avoid
 * overloading Nimbus processing in cases where the sender repeats
 * messages.  Resetting the filter will cause the next instance of
 * any previously received messages to be added to the queue.
 *
 * The queue filter is implemented using a hold-off timer. Each
 * time a message is received a count-down timer is started with
 * the current hold-off time as the seed.  If another message
 * is received before the hold-off timer expires, then the new
 * message is discarded and the hold-off timer is restarted.  If
 * the hold-off timer expires, then the next message having the
 * corresponding sequences number will be queued.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.DataChannel.prototype.resetFilter = function(){
	if (this.DataChanObj == null) {
		return false;
	}
	return this.DataChanObj.ResetFilter();
};

/**
 * Sets the queue filter hold-off duration.  See resetFilter().
 * 
 * @param {Number} Duration   Duration of hold-off timer in seconds.
 * @return {Boolean} True if successful
 */

Nimbus.DataChannel.prototype.setFilterDuration = function(Duration){
	if (this.DataChanObj == null) {
		return false;
	}
	return this.DataChanObj.SetFilterDuration(Duration);
};

/**
 * Gets the queue filter hold-off duration.  See resetFilter().
 * 
 * @return {Boolean} Duration of the hold-off timer in seconds.
 */

Nimbus.DataChannel.prototype.getFilterDuration = function(){
	if (this.DataChanObj == null) {
		return false;
	}
	return this.DataChanObj.GetFilterDuration();
};

/**
 * Closes the data channel unicast connection and returns to listening state.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.DataChannel.prototype.resetConnection = function(){
	if (this.DataChanObj == null) {
		return false;
	}
	return this.DataChanObj.ResetConnection();
};

/**
 * Returns the current unicast connection status.
 *
 * @return {Object} Connection status:<br>
 * 	{Boolean} connected     - Indicates whether there is a current unicast connection.<br>
 *  {Boolean} dataAvailable - Indicates whether there is data waiting to be read.<br>
 * 	{String}  clientAddress - The IPv4 address of the client if connection is true.<br>
 *  {Number}  clientPort    - The port of of the client if connection is true.
 */

Nimbus.DataChannel.prototype.getConnectionStatus = function(){
	if (this.DataChanObj == null) {
		return false;
	}
	var json = this.DataChanObj.GetConnectionStatus ();
	if (json == null) {
		return null;
	}
	return eval('(' + json + ')');
};

/**
 * Sets the unicast connection timeout (in seconds).  A value of -1
 * is used to disable the timeout.  This is the default value.
 * 
 * @return {Boolean} True if successful
 */

Nimbus.DataChannel.prototype.setConnectionTimeout = function(timeout){
	if (this.DataChanObj == null) {
		return false;
	}
	return this.DataChanObj.SetConnectionTimeout (timeout);
};

/**
 * Gets the unicast connection timeout (in seconds).  A value of -1
 * indicates the timeout is disabled.
 * 
 * @return {Number} The unicast connection timeout (in seconds)
 */

Nimbus.DataChannel.prototype.getConnectionTimeout = function(){
	if (this.DataChanObj == null) {
		return false;
	}
	return this.DataChanObj.GetConnectionTimeout ();
};

