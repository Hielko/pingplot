function start(options) {

    if (options === undefined) {
        alert("No options passed");
        return;
    }

    function doPlot(data) {
        data.load( function (response) {
            plotData(data, data.divid);
        });

        if (!options.disableRefresh && isToday(data.date)) {
            setTimeout(function () {
                doPlot(data);
            }, 60 * 1000);
        }
    }

    if (options.startDate === undefined) {
        options.startDate = new Date();
    }
	options.disableRefresh = options.disableRefresh || 0;

    date = new Date(options.startDate.getTime());
    for (day = 0; day < options.days; day++) {
        var data = new dataType();
        data.date = new Date(date.getTime());
        data.divid = 'd' + (date.getTime());
        createPlotDivs(data.divid);
        doPlot(data);
        date.setDate(date.getDate() - 1);
    }

    $(window).resize(function () {
        console.log("<div>Handler for .resize() called.</div>");
    });

    $("<div id='tooltip'></div>").appendTo("body");
}
