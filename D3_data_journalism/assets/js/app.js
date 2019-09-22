// Step 1: Set up the chart
var svgWidth = 800;
var svgHeight = 550;

var margin = {
    top: 50,
    right: 50,
    bottom: 80,
    left: 80
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


// Step 2: Create an SVG wrapper and append the SVG group to hold the chart
var svg = d3.select("#svgdiv")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Step 3: Import data from the data.csv file    
d3.csv("assets/data/data.csv").then(function(timesData) {
    //if (err) throw err; version issue using then
    // Format data
    timesData.forEach(function(data) {
        data.states = data.states;
        data.abbr = data.abbr;
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
        data.income = +data.income;                     
    });

    console.log(timesData);

    /*
        d3.csv("assets/data/data.csv").then(function(timesData){
            console.log(timesData);
        });
    **/
    // initialize chosen axes
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // function used for updating x-scale var upon click on axis label
    function xScale(timesData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(timesData, d => d[chosenXAxis]) * 0.9, d3.max(timesData, d => d[chosenXAxis]) * 1.1])
            .range([0, width]);
        return xLinearScale;
    }

    // function used for updating y-scale var upon click on axis label
    function yScale(timesData, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(timesData, d => d[chosenYAxis]) * 0.8 ,d3.max(timesData, d => d[chosenYAxis]) * 1.1])
            .range([height,0]);
        return yLinearScale;
    }

    // function used for updating xAxis var upon click on axis label
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
    
        xAxis.transition()
        .duration(800)
        .call(bottomAxis);
    
        return xAxis;
    }

    // function used for updating yAxis var upon click on axis label
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
    
        yAxis.transition()
        .duration(800)
        .call(leftAxis);
    
        return yAxis;
    }

    // function used for updating circles group with a transition to new circles
    function renderCircles(cg, newXScale, newYScale, chosenXAxis, chosenYAxis) {

        cg.transition()
        .duration(800)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
        
        return cg;
    }

    function renderTexts(tg, newXScale, newYScale, chosenXAxis, chosenYAxis) {

        tg.transition()
        .duration(800)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis])+4);
        
        return tg;
    }
    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

        if (chosenXAxis === "poverty") {
            var xlabel = "Poverty:";
        } else if (chosenXAxis === "age") {
            var xlabel = "Age:";
        } else{
            var xlabel = "Household Income:" ;
        }
    
        if (chosenYAxis === "healthcare") {
            var ylabel = "Healthcare:";
        } else if (chosenYAxis === "smokes") {
            var ylabel = "Smokes:";
        } else{
            var ylabel = "Obesity:" ;
        }

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, -60])
            .html(function(d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}%`);
        });
    
        circlesGroup.call(toolTip);
        
        circlesGroup
        // Hover over event
            .on("mouseover", function(data) {
                toolTip.show(data, this);
            })
        // Mouse out event
            .on("mouseout", function(data, index) {
                toolTip.hide(data, this);
            });
    
        return circlesGroup;
    }

    // Step 4: Create Scales
    var xLinearScale = xScale(timesData, chosenXAxis);
    var yLinearScale = yScale(timesData, chosenYAxis);


    // Step 5: Create Axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`).call(bottomAxis);

    // Append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true).call(leftAxis);

    // Step 7: append the circles and texts
    var circlesGroup = chartGroup.selectAll("circle")
        .data(timesData)
        .enter()
        .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 12)
            .attr("fill", "lightblue")
            .attr("opacity", "0.75");
    
    
    var textsGroup = chartGroup.selectAll("text")
        .data(timesData)
        .enter()
        .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis])+4)
            .attr("text-anchor","middle")
            .attr("font-size","9px")
            .attr("font-weight","bold")
            .attr("color", "#FFFFFF")
            .text(d => d.abbr);

    // Update Tooltip      
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);   
    //circlesGroup = updateText(chosenXAxis, chosenYAxis, circlesGroup);   

    // Step 8: Add axes titles
    // Create group for  3 x-axis labels
    var labelsXGroup = chartGroup.append("g")    
        .attr("transform", `translate(${width / 2}, ${height + 15 })`);

    var povertyLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .classed("inactive", false)
        .text("In Poverty (%)");

    var AgeLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("active", false)
        .classed("inactive", true)       
        .text("Age (Median)");        

    var IncomeLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("active", false)
        .classed("inactive", true)   
        .text("Household Income (Median)"); 

    // Create group for  3 y-axis labels
    var labelsYGroup = chartGroup.append("g")    
        .attr("transform", `rotate(-90)`);

    var healthcareLabel = labelsYGroup.append("text")
        .attr("x", 0 - (height/2))
        .attr("y", 0 - 20)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .classed("inactive", false)   
        .text("Lacks Healthcare (%)");
        
    var smokesLabel = labelsYGroup.append("text")
        .attr("x", 0 - (height/2))
        .attr("y", 0 - 40)
        .attr("value", "smokes") // value to grab for event listener
        .classed("active", false)
        .classed("inactive", true)   
        .text("Smokes (%)");

    var obesityLabel = labelsYGroup.append("text")
        .attr("x", 0 - (height/2))
        .attr("y", 0 - 60)
        .attr("value", "obesity") // value to grab for event listener
        .classed("active", false)
        .classed("inactive", true)   
        .text("Obese (%)");

    // x axis labels event listener
    labelsXGroup.selectAll("text").on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
            chosenXAxis = value;
            xLinearScale = xScale(timesData, chosenXAxis);
            xAxis = renderXAxes(xLinearScale, xAxis);
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            textsGroup = renderTexts(textsGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                AgeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                IncomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            } else if (chosenXAxis === "age") {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                AgeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                IncomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            } else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                AgeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                IncomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });

    // y axis labels event listener
    labelsYGroup.selectAll("text").on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
            chosenYAxis = value;
            yLinearScale = yScale(timesData, chosenYAxis);
            yAxis = renderYAxes(yLinearScale, yAxis);
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            textsGroup = renderTexts(textsGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            if (chosenYAxis === "healthcare") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            } else if (chosenYAxis === "smokes") {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            } else {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });
});