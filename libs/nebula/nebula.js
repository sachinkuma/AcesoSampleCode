/******************************************************************************/
/**
 * Define constants for the Command Event Modifiers member (a bitwise AND of
 * the following vales, or 0 if no modifiers are pressed)
 *
 ******************************************************************************/
var SHIFT_KEY = 0x02000000;
var CTRL_KEY = 0x04000000;
var ALT_KEY = 0x08000000;
var WIN_KEY = 0x10000000;
var KEYPAD_KEY = 0x20000000;


/******************************************************************************/
/**
 * Create a "name space" object to contain the Nebula API
 *
 * @return
 *        Creates global "Nebula" object (if it doesn't already exist)
 *
 ******************************************************************************/
if (typeof this["Nebula"] == "undefined") {
    this["Nebula"] = {};
    try {
        Nebula.NebulaObj = EONebula;
    }
    catch (err) {
        if (console && console.error)
            console.error('EONebula object failed to initialize!');
    }
}


/******************************************************************************/
/**
 * Get the version number of the API set
 *
 * @return
 *        String in the format <major>.<minor>
 *
 ******************************************************************************/
Nebula.getAPIRevision = function () {
    return Nebula.NebulaObj.ApiRevision;
};

/******************************************************************************/
/**
 * Get the version number of the Nebula browser
 *
 * @return
 *      String in the format x.x.x.x
 *
 ******************************************************************************/
Nebula.getNativeRevision = function () {
    return Nebula.NebulaObj.NativeRevision;
};

/******************************************************************************/
/**
 * Retrieve list of available network devices
 *
 * @return
 *        Array of strings, each one a unique network device
 *
 ******************************************************************************/
Nebula.getNetworkDeviceList = function () {
    return Nebula.NebulaObj.GetNetworkDeviceList();
};

/******************************************************************************/
/**
 * Return a new network device object
 *
 * @return
 *        NebulaNetworkDevice
 *
 ******************************************************************************/
Nebula.getNetworkDevice = function (name) {
    return Nebula.NebulaObj.GetNetworkDevice(name);
};


/******************************************************************************/
/**
 * Get current state, or enable/disable the web debugger window
 *
 * @return
 *        bool (for get); nothing for set
 *
 ******************************************************************************/
Nebula.Debug = function () {
    if (arguments.length == 0)
        return Nebula.NebulaObj.Debug;
    else
        Nebula.NebulaObj.Debug = arguments[0];
};

Nebula.debug = Nebula.Debug;


/******************************************************************************/
/**
 * Log the specified debug message
 *
 * @return
 *        None.
 *
 ******************************************************************************/
Nebula.logMessage = function (msg) {
    return Nebula.NebulaObj.LogDebugMessage(0, msg);
};


/******************************************************************************/
/**
 * Reload the application page.
 *
 * @return
 *        None.
 *
 ******************************************************************************/
Nebula.reload = function (bWait) {
    return Nebula.NebulaObj.Reload(bWait);
};


/******************************************************************************/
/**
 * Start the specified executable as a separate process
 *
 * @return
 *        None.
 *
 ******************************************************************************/
Nebula.startNativeProcess = function (exec) {
    Nebula.NebulaObj.StartProcess(exec);
};


/******************************************************************************/
/**
 * Application handshaking.  The JavaScipt app must call the handshake function
 * periodically to indicate that it is still running.  The period is specified
 * in seconds.
 *
 * @return
 *        None.
 *
 ******************************************************************************/
Nebula.getHandshakeTimeout = function () {
    return Nebula.NebulaObj.GetHandshakeTimeout();
};
Nebula.setHandshakeTimeout = function (seconds) {
    Nebula.NebulaObj.SetHandshakeTimeout(seconds);
};
Nebula.handshake = function (name) {
    return Nebula.NebulaObj.Handshake(name);
};


/******************************************************************************/
/**
 * Get/set the system time zone.  Uses the Windows name (e.g. as shown in the
 * control panel applet for setting time zone).
 *
 ******************************************************************************/
Nebula.getTimeZoneName = function () {
    return Nebula.NebulaObj.GetTimeZoneName();
};
Nebula.setTimeZoneName = function (name) {
    return Nebula.NebulaObj.SetTimeZoneName(name);
};


/******************************************************************************/
/**
 * Set/get the logging level for various components in the Nebula browser.
 * Note that, although the API is implemented, the code in the Nebula browser
 * currently does not use the logging level anywhere.
 *
 ******************************************************************************/
Nebula.setLogLevel = function (category, level) {
    return Nebula.NebulaObj.SetLogLevel(category, level);
};
Nebula.getLogLevel = function (category) {
    return Nebula.NebulaObj.GetLogLevel(category);
};


/******************************************************************************/
/**
 * Set parameters which control ProIdiom authorization requirement.
 *
 ******************************************************************************/
Nebula.setAuthMode = function (enabled, priChan, secChan) {
    return Nebula.NebulaObj.SetAuthMode(enabled, priChan, secChan);
};
Nebula.getAuthModeEnabled = function (category) {
    return Nebula.NebulaObj.GetAuthModeEnabled();
};
Nebula.getAuthModePrimaryChannel = function (category) {
    return Nebula.NebulaObj.GetAuthModePrimaryChannel();
};
Nebula.getAuthModeSecondaryChannel = function (category) {
    return Nebula.NebulaObj.GetAuthModeSecondaryChannel();
};


/******************************************************************************/
/**
 * Set parameters which control ProIdiom authorization requirement.
 *
 ******************************************************************************/
Nebula.addCommandHandler = function (handler) {
    Nebula.NebulaObj.CommandEvent.connect(handler);
};
Nebula.removeCommandHandler = function (handler) {
    Nebula.NebulaObj.CommandEvent.disconnect(handler);
};
Nebula.addNotificationHandler = function (handler) {
    Nebula.NebulaObj.NotificationEvent.connect(handler);
};
Nebula.removeNotificationHandler = function (handler) {
    Nebula.NebulaObj.NotificationEvent.disconnect(handler);
};


/******************************************************************************/
/**
 * Restart the terminal.  Argument specifies whether to restart in Kiosk mode.
 *
 * @return
 *        True if restart successfully initiated, false if not.  Restart happens
 *      asyncronously, so it might not actually succeed, even if true was
 *      returned.
 *
 ******************************************************************************/
Nebula.restart = function (coldboot) {
    return Nebula.NebulaObj.Restart(coldboot ? true : false);
};


/******************************************************************************/
/**
 * Open the user browser window.  The initial URL can be specified, as well as
 * the size and position of the window.  The window is not moveable or resizable
 * by the user (so it can be positioned relative to the main application UI
 * underneath).
 *
 * If the window is already open, nothing happens (i.e. the specified URL is
 * not loaded, nor is the window moved or sized).
 *
 * @return
 *        True if window was opened successfully; false if not.
 *
 ******************************************************************************/
Nebula.openUserBrowser = function (url, x, y, width, height) {
    return Nebula.NebulaObj.OpenUserBrowser(url, x, y, width, height);
};

/******************************************************************************/
/**
 * Check if the user browser window is open or not
 *
 ******************************************************************************/
Nebula.isUserBrowserOpen = function () {
    return Nebula.NebulaObj.IsUserBrowserOpen();
};

/******************************************************************************/
/**
 * Close the user browser window, if it is open.  It is not considered an error
 * to close the window if it's not currently open.
 *
 * @return
 *        True if window was closed successfully; false if not.
 *
 ******************************************************************************/
Nebula.closeUserBrowser = function () {
    return Nebula.NebulaObj.CloseUserBrowser();
};

Nebula.getDisplayEnabled = function () {
    return Nebula.NebulaObj.GetDisplayEnabled();
};

Nebula.setDisplayEnabled = function (enabled) {
    return Nebula.NebulaObj.SetDisplayEnabled(enabled ? true : false);
};

Nebula.getVolume = function () {
    return Nebula.NebulaObj.GetVolume();
};

Nebula.setVolume = function (vol) {
    return Nebula.NebulaObj.SetVolume(vol);
};

Nebula.getMute = function () {
    return Nebula.NebulaObj.GetMute();
};

Nebula.setMute = function (mute) {
    return Nebula.NebulaObj.SetMute(mute);
};

/******************************************************************************/
/**
 * Get AutoUpdate feature.
 ******************************************************************************/
Nebula.getAutoUpdateEnabled = function () {
    return Nebula.NebulaObj.GetAutoUpdateEnabled();
};

/******************************************************************************/
/**
 * Set AutoUpdate feature.
 * Auto update checks server every 8 hours for new Nebula update
 * @param {Boolean} enabled True to enable, False to disable
 * @param {String} path optional. If specified will check specified server.
 * default value is ftp://GVMCsupport:GVMC%40support1@ftp.aceso.com/Nebula/updates/production/
 ******************************************************************************/
Nebula.setAutoUpdateEnabled = function (enabled, path) {
    if (!path)
        path = "";
    return Nebula.NebulaObj.SetAutoUpdateEnabled(enabled, path);
};

Nebula.autoUpdate = function () {
    return Nebula.NebulaObj.AutoUpdate();
};