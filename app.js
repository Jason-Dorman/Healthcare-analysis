// // make the page responsive
// function makeResponsive() {

    // create dimensions
    var svgWidth = 960;
    var svgHeight = 500;

    var margin = {
        top: 20,
        bottom: 40,
        right: 80,
        left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // create svg wrapper and append scg group for chart
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // append svg group
    var chartGroup = svg.append('g')
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial params
    var chosenXAxis = "income";

    // function used for updating x-scale var upon click on axis label
    function xScale(healthData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
            d3.max(healthData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);

        return xLinearScale;
    }

    // function to update xAxis var after click on axis label
    function renderAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }

    // function to update circles with new tooltip
    function renderCircles(circlesGroup, newXScale, chosenXAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]));

        return circlesGroup;
    }
    
    // function for updating circlesGroup with tooltip
    function updateToolTip(chosenXAxis, circlesGroup) {

        if (chosenXAxis === "income") {
            var label = "Income:";
        }
        else {
            var label = "Age:";
        }

        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function(d) {
                return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
            });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data);
        })
            //onmouseout event
            .on("mouseout", function(data, index) {
                toolTip.hide(data);
            });
        return circlesGroup;
    }

    // Retrieve data from csv file
    d3.csv("data.csv").then(function(healthData) {
        console.log(healthData);
        // if (err) throw err;
        //parse data
        healthData.forEach(function(data) {
            data.income = +data.income;
            data.age = +data.age;
            data.healthcare = +data.healthcare;
            console.log(data.income);
            console.log(data.age);
            console.log(data.healthcare);
        });
        

        // xLinearScale function for csv import
        var xLinearScale = xScale(healthData, chosenXAxis);

        // create y scale function
        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(healthData, d => d.healthcare)])
            .range([height, 0]);

        // create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
            // .classed("aText", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        chartGroup.append("g")
            .call(leftAxis);

        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthData)
            .enter()
            .append("circle")
            // .classed("stateCircle", true)
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d.healthcare))
            // .classed("stateText", true)
            .attr("r", 10)
            .attr("fill", "blue")
            .attr("opacity", ".5")
            // .text(d => d.abbr);

            var textGroup = chartGroup.append("g").selectAll("text")
            .data(healthData)
            .enter()
            .append("text")
            // .classed("stateCircle", true)
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d.healthcare))
            .classed("stateText", true)
            .text(d => d.abbr);
            // .attr("transform", `translate(0, ${height})`)

        // create group for 2 x axis labels
        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var incomeLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "income")
            .classed("active", true)
            .text("Income");

        var ageLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Age");

        // append y axis
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .classed("active", true)
            .text("% With Healthcare Coverage");

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // x axis labels event listener
        labelsGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {

                    // replace chosenXaxis with value
                    chosenXAxis = value;

                    // console.log(chosenXAxis)

                    // update x scale for new data
                    xLinearScale = xScale(healthData, chosenXAxis);

                    // updates x axis with transition
                    xAxis = renderAxes(xLinearScale, xAxis);

                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                    // changes classes to change bold text
                    if (chosenXAxis === "income") {
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactve", true);
                    }
                    else {
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
        });

// // when browser loads responsiveness is called
// makeResponsive();

// // when window is resized responsiveness is called
// d3.select(window).on("resize", makeResponsive);