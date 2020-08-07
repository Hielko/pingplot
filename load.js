// Require Jquery, flot, moment, bootstrap

var Settings = {
    chartYMax: 500
};

function getFilename(date) {
    return "plot2-" + moment(date).format("YYYY-MM-DD") + ".txt";
}

function getFilesPath() {
    return location.protocol + '//' + location.host + "/ping/hier/" + moment(date).format("YYYY-MM") + "/";
}

var dataType = function () {
    this.date = null;
    this.data = [];
    this.nodata = [];

    this.parsedata  = function(fileContents) {
        // 20181030T153059 
        // 0123456789012345678
        function extractTimeStamp(str) {
            try {
                var parts = str.split('T');
                var dateStr = parts[0];
                var timeStr = parts[1];
                var date = new Date(parseInt(dateStr.substr(0, 4), 10), parseInt(dateStr.substr(4, 2), 10) - 1, parseInt(dateStr.substr(6, 2), 10),
                    parseInt(timeStr.substr(0, 2), 10), parseInt(timeStr.substr(2, 2), 10), parseInt(timeStr.substr(4, 2), 10));
                return date;
            } catch (e) {
                return null;
            }
        }

        var timeStamp = null;
        this.data = [];
        this.nodata = [];
        var me = this;
        //console.log( "fileContents "+fileContents);
        fileContents.split("\n").forEach(function (line) {
            if (line) {
                var parts = line.split(' ');
                timeStamp = extractTimeStamp(parts[0]);
                if (timeStamp instanceof Date) {
                    var val = parseFloat(parts[1], 10);
                    if (val === 0 || isNaN(val) || !val || val === '') {
                        me.nodata.push([timeStamp, Settings.chartYMax]);
                    } else {
                        me.data.push([timeStamp, val]);
                    }
                }
            }
        });
    }


    this.load = function(callBack) 
    {
        var xhr = new XMLHttpRequest();
        var me = this;
        xhr.addEventListener("load", function () {
            me.parsedata(this.response);
            callBack(me);
        }, false);
        xhr.addEventListener("error", function () {
            document.write("Error");
            callBack(me);
        }, false);
    
        var url = getFilesPath() + getFilename(date);
        xhr.open('GET', url, true);
        xhr.send();
    }
};
