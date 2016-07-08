debug = {

    $status: null,

    trace: function (dmsg) {
      $("#dbgOut").append("<p>" + dmsg + "</p>");
    },

    log: function(dmsg) {
        // Only run on the first time through - reset this function to the appropriate console.log helper
        if (Function.prototype.bind) {
            if (typeof window["Nimbus"] != "undefined") { // Enseo
                debug.log = Nimbus.logMessage.bind(Nimbus);
            }

            if (window.console) { // PC
                debug.log = console.log.bind(console);
            }
        }

        else {
            if (typeof window["Nimbus"] != "undefined") { // Enseo
                debug.log = Nimbus.logMessage(Nimbus.logMessage, console);
            }

            if (window.console) { // PC
                debug.log = function () {
                    console.log.apply(console, arguments);
                };
            }
        }

        debug.log.apply(this.log, arguments);

        //console.log(dmsg);
    },

    status: function(dmsg){
        if(!this.$status)
            this.$status = $('#loading').find('#status');

        this.log(dmsg);
        var li = $("<li />").text(dmsg).appendTo(this.$status);

        this.$status.scrollTop(this.$status[0].scrollHeight);
    }

};