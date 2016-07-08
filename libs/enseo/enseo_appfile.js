/**
 * @fileOverview Enseo Nimbus AppFile Javascript API
 * <p><b>Copyright (c) Enseo, Inc. 2009-2010
 *
 * This material contains trade secrets and proprietary information
 * and	may not	 be used, copied, disclosed or	distributed	 except
 * pursuant to	a license from Enseo, Inc. Use of copyright notice
 * does not imply publication or disclosure.</b>
 */

////////////////////////////////////////////////////////////////////////
//
// Reference   : $Source: /cvsroot/calica/apps/rootfs_common/root/usr/bin/data/html/js/enseo_appfile.js,v $
//
// Revision	   : $Revision: 1.9.10.2 $
//
// Date		   : $Date: 2011-03-30 22:20:45 $
//
// Description : Nimbus Application File object JavaScript API
//
////////////////////////////////////////////////////////////////////////

/**
 * Namespace for the Nimbus JavaScript API
 * @name Nimbus
 */


/**
 * Gets an interface for creating and controlling an Application File object.
 * 
 * @return {Nimbus.AppFile} Instance of the Nimbus.AppFile interface, or
 * null if the object could not be created
 */

Nimbus.getAppFile = function()
{
	// Create a new browser window class
	var win = new Nimbus.AppFile();
	if (win != null) {
		Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.getAppFile");
	}
	return win;
};

/**
 * Class providing an interface for creating and controlling an Application File object - 
 * use Nimbus.getAppFile to obtain an instance.  This object can be used to open, read and write application files.
 * 
 * @class
 */

Nimbus.AppFile = function()
{
    // Create a browser window object
    this.AppFileObj = new EONimbusAppFile();
    
    Nimbus.NimbusObj.LogDebugMessage(Nimbus.LOG_MSG_TYPE_API_DEBUG, "Nimbus.AppFile constructor");
};


/**
* Opens a file on a given drive.  An AppFile object can only maintain one
* open file.  (This method will fail if a file is already open.)
*
* @param {String} driveName  The name of the drive, "Default", "System Drive", "Hard Drive", "Flash Drive", "SSM Drive"
* @param {String} fileName   The name of the file.  The following characters
*                            are not permitted in the file name: / \ " * | : < > ?
* @param {String} mode       The mode with which to open the file; "ReadOnly",
*                            "ReadWriteOverwrite", "ReadWriteTruncate", "ReadWriteAppend"
* @param {Boolean} bPublic  True if accessing a file visible to the content  manager.  Default value is false
* 
* @return {Boolean} True if successful
*/

Nimbus.AppFile.prototype.open = function(driveName, fileName, mode, bPublic)
{
    if (this.AppFileObj == null)
    {
        return false;
    }
    return this.AppFileObj.Open (driveName, fileName, mode, bPublic);
};

/**
* Closes the open file.
*
* @return {Boolean} True if file is successfully closed.  Returns False
* if no file was open or file could not be closed.
*/

Nimbus.AppFile.prototype.close = function()
{
    if (this.AppFileObj == null)
    {
        return false;
    }
    return this.AppFileObj.Close ();
};

/**
* Obtains an object containing information about the currently open file.
*
* @return {Object} AppFile info object:<br>
*  {String}  driveName - The name of the drive on which the open file resides.<br>
*  {String}  fileName  - The name of the open file.<br>
*  {Number}  fileSize  - The size of the open file in kilobytes.
*/

Nimbus.AppFile.prototype.info = function()
{
    if (this.AppFileObj == null)
    {
        return false;
    }
	var json = this.AppFileObj.Info ();
	if (json == null) {
		return null;
	}
	return eval('(' + json + ')');
};

/**
* Writes data to the open fle.  The data to be written can be supplied as
* a String, in which case the characters in the String are written to the
* file, or as an Array of byte values. This call advances the position
* within the file.
*
* @param {String} or {Array} data  The data to be written.
* 
* @return {Number} Returns the number of bytes written or no value if there was an error.
*/

Nimbus.AppFile.prototype.write = function(data)
{
	if (this.AppFileObj == null) {
		return false;
	}
	if ('string' == typeof (data)) {
		// Pass the message string as-is
		return this.AppFileObj.Write(data);
	} else if ('object' == typeof (data)) {
		// Treat the message as an array of byte values.
		var dataFormatted = data.toString();
		var nElems = data.length;
		return this.AppFileObj.Write(dataFormatted, nElms);
	}
};

/**
* Reads data from the open file.  This call advances the position within
* the file.
*
* @param {Number} nBytes  The number of bytes to read from the file.  A
*                         maximum of 64kb can be read by a single call to this function.
*
* @return {Object} AppFile data object:<br>
*  {Array} data          - The data to be read from the file.<br>
*  {Number} length       - The number of bytes read from the file.<br>
*  {Boolean} isEndOfFile - True if there are no more bytes to read.<br>
*  {Boolean} isError     - True if an error was encountered.
* 
*/

Nimbus.AppFile.prototype.read = function(nBytes)
{
    if (this.AppFileObj == null)
    {
        return false;
    }
	var json = this.AppFileObj.Read (nBytes);
	if (json == null) {
		return null;
	}
	return eval('(' + json + ')');
};

/**
* Reads string data from the open file.  This call advances the position within
* the file.
*
* @return {String} the string content from the file
* 
*/
Nimbus.AppFile.prototype.readString = function()
{
    if (this.AppFileObj == null)
    {
        return false;
    }
	return this.AppFileObj.ReadString ();
}

/**
* Returns whether the end of the file has been encountered such that a
* read operation will yield no further bytes.
*
* @return {Boolean}  True if at end-of-file.  False if not.  Returns no
*                    value if file is not open.
*/

Nimbus.AppFile.prototype.isEndOfFile = function()
{
    if (this.AppFileObj == null)
    {
        return false;
    }
    return this.AppFileObj.IsEndOfFile ();
};

/**
* Returns whether a read or write or other file error has been encountered.
*
* @return {Boolean} True if file error.  False if no error.  Returns no
*                   value if file is not open.
*/

Nimbus.AppFile.prototype.isError = function()
{
    if (this.AppFileObj == null)
    {
        return false;
    }
    return this.AppFileObj.IsError ();
};

/**
* Sets the current position within the open file.
*
* @param {Number} offset Byte offset.
* @param {String} whence Optional parameter specifying location from which
* offset should be added.<br>
* 	"Start"   - Offset is relative to start of file.<br>
* 	"End"     - Offset is relative to end of file.<br>
* 	"Current" - Offset is relative to current position within file.<br>
* If 'whence' parameter is not supplied the offset will be relative to the
* start of the file.
*
* @return {Boolean} True if file position has been set successfully.
*/

	Nimbus.AppFile.prototype.setPosition = function(offset, whence)
{
    if (this.AppFileObj == null)
    {
        return false;
    }
    return this.AppFileObj.SetPosition (offset, whence);
};

/**
* Returns the current byte offset from the start of the open file.
*
* @return {Number} Byte offset from start of file.  No value is returned
*                  if the file is not open.
*/

Nimbus.AppFile.prototype.getPosition = function()
{
    if (this.AppFileObj == null)
    {
        return false;
    }
    return this.AppFileObj.GetPosition ();
};

/**
* Removes a file on a given drive.  If the file to be removed is the
* currently open file the file will first be closed.
*
* @param {String} driveName  The name of the drive, "Default", "System Drive", "Hard Drive", "Flash Drive", "SSM Drive"
* @param {String} fileName   The name of the file to remove.
* @param {Boolean} bPublic  True if accessing a file visible to the content manager.  Default value is false
*
* @return {Boolean} True if the file is successfully removed.
*/

Nimbus.AppFile.prototype.remove = function(driveName, fileName, bPublic)
{
    if (this.AppFileObj == null)
    {
        return false;
    }
    return this.AppFileObj.Remove (driveName, fileName, bPublic);
};

/**
* Renames a file on a given drive.  If the new name of the file is also
* the currently open file the file will first be closed.
*
* @param {String} driveName 	The name of the drive, "Default", "System Drive", "Hard Drive", "Flash Drive", "SSM Drive"
* @param {String} oldFileName  	The old name of the file to rename.
* @param {String} newFileName  	The new name of the file.
* @param {Boolean} bPublic  True if accessing a file visible to the content
*  manager.  Default value is false
*
* @return {Boolean} True if the file is successfully renamed.
*/

Nimbus.AppFile.prototype.rename = function(driveName, oldFileName, newFileName, bPublic)
{
    if (this.AppFileObj == null)
    {
        return false;
    }
    return this.AppFileObj.Rename (driveName, oldFileName, newFileName, bPublic);
};

/**
* Obtains a list of file names and sizes (kb) of application files on a drive.
*
* @param {String} driveName  The name of the drive, "Default", "System Drive", "Hard Drive", "Flash Drive", "SSM Drive"
* @param {Boolean} bPublic  True if accessing a file visible to the content manager.  Default value is false
*
* @return {Object} AppFile ListFiles object:<br>
*  {Array} fileNames - The names of the application files on the drive.<br>
*  {Array} fileSizes - The sizes (in kilobytes) of the application files.<br>
*/

Nimbus.AppFile.prototype.listFiles = function(driveName, bPublic)
{
    if (this.AppFileObj == null)
    {
        return false;
    }
	var json = this.AppFileObj.ListFiles (driveName, bPublic);
	if (json == null) {
		return null;
	}
	return eval('(' + json + ')');
};
