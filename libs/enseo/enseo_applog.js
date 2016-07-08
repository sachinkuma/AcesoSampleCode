/**
 * @fileOverview Enseo Nimbus AppLog Javascript API
 * <p><b>Copyright (c) Enseo, Inc. 2008-2010
 *
 * This material contains trade secrets and proprietary information
 * and	may not	 be used, copied, disclosed or	distributed	 except
 * pursuant to	a license from Enseo, Inc. Use of copyright notice
 * does not imply publication or disclosure.</b>
 */

////////////////////////////////////////////////////////////////////////
//
// Reference   : $Source: /cvsroot/calica/apps/rootfs_common/root/usr/bin/data/html/js/enseo_applog.js,v $
//
// Revision	   : $Revision: 1.7 $
//
// Date		   : $Date: 2010-10-27 18:04:01 $
//
// Description : Nimbus AppLog javascript API.
//
////////////////////////////////////////////////////////////////////////


/**
* Applog event object class.  Holds the information that describes an Applog event received from the native code.
* 
* @class
* @constructor
*/

/**
* Registers the specified Applog category to enable the reception of log events.
* 
* @param {String} Category String name: <br>
*   "Anonymous"<br>
*   "Application"<br>
*	"Playback"<br>
*	"Tuning"<br>
*	"Channel"<br>
*	"Update"<br>
*	"HotPlug"<br>
*	"Power"<br>
*   "All", (All of the above)
* @return {Boolean} True if successful
*/

Nimbus.registerApplogCategory = function(Category)
{
    return Nimbus.NimbusObj.RegisterApplogCategory(Category);
};

/**
* De-registers the specified Applog category to stop the reception of log events.
* 
* @param {String} Category String name: <br>
*   "Anonymous"<br>
*   "Application"<br>
*	"Playback"<br>
*	"Tuning"<br>
*	"Channel"<br>
*	"Update"<br>
*	"HotPlug"<br>
*	"Power"<br>
*   "All", (All of the above)
* @return {Boolean} True if successful
*/

Nimbus.deregisterApplogCategory = function(Category)
{
    return Nimbus.NimbusObj.DeregisterApplogCategory(Category);
}; 

/**
 * Log Event object class - passed to an event handler registered via Nimbus.registerApplogCategory.
 * Holds the information that describes one or more log events.
 * 
 * @class
 * @constructor
 */

Nimbus.LogEvent = function(TimeStamp, Category, Type)
{
	/**
	 * Time stamp
	 * @type String
	*/
    this.TimeStamp = TimeStamp;
	/**
	 * Category, one of: "Anonymous", "Application", "Playback", "Tuning", "Channel", "Update", "HotPlug", "Power"
	 * @type String
	*/
    this.Category = Category;
	/**
	 * Type, one of: "Unknown", "Debug", "Verbose", "Information", "Warning", "Error", "Critical"
	 * @type String
	*/
    this.Type = Type;
	/**
	 * Array of Messages
	 * @type Array of Strings
	*/
    this.Messages = new Array();
};

/**
* @ignore (Omit from documentation)
* Add a message to the Event Log object.
*
* @param {String} Message
* @return None
*/

Nimbus.LogEvent.prototype.AddMessage = function(Message)
{
    this.Messages.push(Message);
};

/**
* Gets the specified message of the Event Log object.
*
* @param {Number} Index into the message list.
* @return {String} Message
*/

Nimbus.LogEvent.prototype.Message = function(index)
{
    if (index < this.Messages.length)
    {
        return this.Messages[index];
    }
    return null;
};

/**
* Gets the number of messages in the Event Log object.
*
* @return {Number} Number of messages.
*/

Nimbus.LogEvent.prototype.NumMessages = function()
{
    return this.Messages.length;
};


//Event Type Codes
Nimbus.LogEvent.UNKNOWN_EVENT   = "Unknown";
Nimbus.LogEvent.DEBUG_EVENT     = "Debug";
Nimbus.LogEvent.VERBOSE_EVENT   = "Verbose";
Nimbus.LogEvent.INFO_EVENT      = "Information";
Nimbus.LogEvent.WARNING_EVENT   = "Warning";
Nimbus.LogEvent.ERROR_EVENT     = "Error";
Nimbus.LogEvent.CRITICAL_EVENT  = "Critical";
	
//Event Category Codes
Nimbus.LogEvent.ANONYMOUS_CATEGORY      = "Anonymous";
Nimbus.LogEvent.APPLICATION_CATEGORY    = "Application";
Nimbus.LogEvent.PLAYBACK_CATEGORY       = "Playback";
Nimbus.LogEvent.TUNING_CATEGORY         = "Tuning";
Nimbus.LogEvent.CHANNEL_CATEGORY        = "Channel";
Nimbus.LogEvent.UPDATE_CATEGORY         = "Update";
Nimbus.LogEvent.HOTPLUG_CATEGORY        = "HotPlug";
Nimbus.LogEvent.POWER_CATEGORY          = "Power";

////////////////////////////////////////////////////////////////////////
/**
* Parses a LogEvent event string received from native code via an event notification.
*
* @param {String} EvtStr  Encoded command event string
* @return {Nimbus.LogEvent} Log Event
*/

Nimbus.parseLogEvent = function(Event)
{
    if (0 == Event.ProcessedSubEvents)
    {
        Event.SubEventStrs = new Array();
        var EvtMsg = Event.EventMsg.substring(1, Event.EventMsg.length - 1);

        Event.SubEventStrs = EvtMsg.split("><");
        Event.NumSubEvents = Event.SubEventStrs.length;
    }

    if (null == Event.SubEventStrs || 0 == Event.NumSubEvents)
    {
        return null;
    }

    if (Event.ProcessedSubEvents >= Event.NumSubEvents)
    {
        return null;
    }

    var EvtStr = Event.SubEventStrs[Event.ProcessedSubEvents];
    Event.ProcessedSubEvents++;

    var SubStrings = new Array();
    var Evt = null;

    SubStrings = EvtStr.split("|");

    if (SubStrings.length >= 4)
    {
        if (SubStrings[0] != "LogEvent")
        {
            return null;
        }

        Evt = new Nimbus.LogEvent(SubStrings[1], SubStrings[2], SubStrings[3]);

        var i = 4;
        var Messages = "";
        while (i < (SubStrings.length - 1))
        {
            Evt.AddMessage(SubStrings[i]);
            if (i > 4) { Messages += ","; }
            Messages += SubStrings[i];
            i++;
        }
    }

    return Evt;
};

/**********************************************************************************************
***********************************************************************************************
**********************************************************************************************/
