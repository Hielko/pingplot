function isToday(date) {
    return date instanceof Date && moment(date).format('YYYYMMDD') === moment(new Date()).format('YYYYMMDD');
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
        $(titleDivId).html("not instanceof PingDataType<br>");
        return;
    }
    if (!(pingData.date && pingData.date instanceof Date)) {
        $(titleDivId).html("Invalid date '" + pingData.date + "'<br>")
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

     if (pingData.data.length === 0) {
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
                color: "#008928"
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
    };

    if (pingData.plot === undefined) {
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
