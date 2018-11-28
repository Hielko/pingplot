// Require Jquery, flot, moment, bootstrap

var PingDataType = function () {
    this.date = null;
    this.data = [];
    this.nodata = [];
};

var Settings = {
    chartYMax: 500
}

function getPingFilename(date) {
    return "plot2-" + moment(date).format("YYYY-MM-DD") + ".txt";
}

function getPingFilesPath() {
    return location.protocol + '//' + location.host + "/ping/hier/";
}

function isToday(date) {
    return date instanceof Date && moment(date).format('YYYYMMDD') == moment(new Date()).format('YYYYMMDD');
}

function parsePingData(pingContentsFile, result) {
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

    var pingTimeStamp = null;
    result.data = [];
    result.nodata = [];
    //console.log( "pingContentsFile "+pingContentsFile);
    pingContentsFile.split("\n").forEach(function (line) {
        if (line) {
            var parts = line.split(' ');
            pingTimeStamp = extractTimeStamp(parts[0]);
            if (pingTimeStamp instanceof Date) {
                var val = parseFloat(parts[1], 10)
                if (val == 0 || val == NaN || !val || val == '') {
                    result.nodata.push([pingTimeStamp, Settings.chartYMax]);
                } else {
                    result.data.push([pingTimeStamp, val]);
                }
            }
        }
    });
    return result;
}

function getPingData(date, contextData, onload) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        onload(contextData, this.response);
    }, false);
    xhr.addEventListener("error", function () {
        document.write("Error");
        onload();
    }, false);

    var url = getPingFilesPath() + getPingFilename(date);
    xhr.open('GET', url, true);
    xhr.send();
}

function createPlotDivs(divid) {
    jQuery('<div/>', {
        id: divid + "Title",
        class: "title"
    }).appendTo('#inner');

    jQuery('<div/>', {
        id: divid,
        class: "row"
    }).appendTo('#inner');
}


function plotPing(pingData, divid) {

    var titleDivId = "#" + divid + "Title";
    var dateFormat = "dddd DD MMMM YYYY ";
    var todayBar = [];
    var dateIsToday = isToday(pingData.date);

    if (!pingData instanceof PingDataType) {
        $(titleDivId).html("Invalid data <br>");
        return;
    }
    if (!(pingData.date && pingData.date instanceof Date)) {
        $(titleDivId).html("Invalid date " + pingData.date + "<br>")
        return;
    }
    if (pingData.data.length < 2) {
        $(titleDivId).html(moment(pingData.date).format(dateFormat) + " no data<br>")
        $('#' + divid).hide();
        return;
    }
    if (dateIsToday) {
        $(titleDivId).html("Vandaag");
        todayBar.push([new Date(), Settings.chartYMax]);
    } else {
        $(titleDivId).html(moment(pingData.date).format(dateFormat));
    }

    if (pingData.data.length == 0) {
        return;
    }

    var start = new Date(pingData.date.getTime());
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    var end = new Date(pingData.date.getTime());
    end.setHours(23);
    end.setMinutes(59);
    end.setSeconds(59);

    var options = {
        xaxis: {
            font: {
                color: "#008928",
            },
            mode: "time",
            timeformat: "%H",
            tickSize: [2, "hour"],
            twelveHourClock: false,
            timezone: "browser",
            min: start.valueOf(),
            max: end.valueOf()
        },
        yaxis: {
            font: {
                color: "#008928",
            },
            min: 0, max: Settings.chartYMax
        },
        grid: {
            hoverable: true,
            clickable: true
        },
        lines: {
            lineWidth: 0.5,
            fill: true,
            shadowColor: "#FF0000"
        },
        colors: ["#00FF00", "#FF0000", "#0000FF"]
    }

    if (pingData.plot == undefined) {
        pingData.plot = $.plot($('#' + divid), [], options);
        $('#' + divid).bind("plothover", function (event, pos, item) {
            if (item) {
                var y = item.datapoint[1].toFixed(0);
                $("#tooltip").html(y + " ms")
                    .css({ top: item.pageY + 5, left: item.pageX + 5 })
                    .fadeIn(200);
            } else {
                $("#tooltip").hide();
            }
        });
    }

    pingData.plot.setData([{ data: pingData.data },
    { data: pingData.nodata, bars: { show: true } },
    { data: todayBar, bars: { show: true } }]);
    pingData.plot.setupGrid();
    pingData.plot.draw();

}


function start(options) {

    if (options == undefined) {
        alert("No options passed")
        return;
    }


    function GetPingDataAndPlot(pingData) {
        getPingData(pingData.date, pingData, function (context, response) {
            parsePingData(response, context);
            plotPing(context, context.divid);
        });

        if (!options.disableRefresh && isToday(pingData.date)) {
            setTimeout(function () {
                GetPingDataAndPlot(pingData);
            }, 60 * 1000);
        }
    }

    if (options.startDate == undefined) {
        options.startDate = new Date();
    }
    options.disableRefresh = options.disableRefresh || 0;

    date = new Date(options.startDate.getTime());
    for (day = 0; day < options.days; day++) {
        var pingData = new PingDataType();
        pingData.date = new Date(date.getTime());
        pingData.divid = 'd' + (date.getTime());
        createPlotDivs(pingData.divid);
        GetPingDataAndPlot(pingData);
        date.setDate(date.getDate() - 1);
    }

    $(window).resize(function () {
        console.log("<div>Handler for .resize() called.</div>");
    });

    $("<div id='tooltip'></div>").appendTo("body");
}
