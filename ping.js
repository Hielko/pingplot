function start(options) {

    if (options === undefined) {
        alert("No options passed");
        return;
    }

    function PingAndPlot(pingData) {
        pingData.load( function (response) {
            plotPing(pingData, pingData.divid);
        });

        if (!options.disableRefresh && isToday(pingData.date)) {
            setTimeout(function () {
                PingAndPlot(pingData);
            }, 60 * 1000);
        }
    }

    if (options.startDate === undefined) {
        options.startDate = new Date();
    }
	options.disableRefresh = options.disableRefresh || 0;

    date = new Date(options.startDate.getTime());
    for (day = 0; day < options.days; day++) {
        var pingData = new PingDataType();
        pingData.date = new Date(date.getTime());
        pingData.divid = 'd' + (date.getTime());
        createPlotDivs(pingData.divid);
        PingAndPlot(pingData);
        date.setDate(date.getDate() - 1);
    }

    $(window).resize(function () {
        console.log("<div>Handler for .resize() called.</div>");
    });

    $("<div id='tooltip'></div>").appendTo("body");
}
