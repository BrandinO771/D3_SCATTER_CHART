////----------BRANDON STEINKE--------11/13/19

    /////THIS CODE -- BUILDS A SCATTER CHART
    /// LOADS CSV DATA TO POPULATE CHART , USER CAN TOGGLE X-AXIS, TO DISPLAY DIFF X AXIS VALUES 
    /// SCATTER ELEMENTS RESPOND TO CHANGE IN AXIS VALUES WITH SMOOTH ANIMATED TRANSITIONS
    /// TOOL TIPS DISPLAY RELEVANT DATA PTS

function makeResponsive() /// ALL CODE IS WRAPPED IN THIS MAKE RESPONS FUNC TO RESIZE CHART BASED ON BROSWER WINDOW SIZE 
  {
      
        var svgArea = d3.select("body").select("svg");
        if (  !svgArea.empty() )  { svgArea.remove();  }
        
        /////////////-----SET VARIABLES------////////////////////////////////////////////////////
        // var svgWidth  = 960;// ORIGINAL CHART SIZE 
        // var svgHeight = 600;
        //// THIS MAKES CHART RESPONSIVE ALWAYS LOOKING AT WINDOW SIZE--INCLUDES PADDING BY SUBTRACTING -300, 500 
        var svgHeight = window.innerHeight-200;
        var svgWidth  = window.innerWidth-500;

        var margin    = {
                        top:    20,
                        right:  40,
                        bottom: 120,
                        left:   100
                        };

        var width  = svgWidth - margin.left - margin.right;
        var height = svgHeight - margin.top - margin.bottom;

        var svg = d3    // Create an SVG wrapper, append an SVG group that will hold our chart, // and shift the latter by left and top margins.
            .select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);
        
            // Append an SVG group
        var chartGroup = svg.append("g")
                        .attr("transform", `translate(${margin.left}, ${margin.top})`);
        
        var chosenXAxis = "income";  // Initial Params


    //////////////////////////////////////////////////////////////////////////////////////////////
    ///-------------- 5 FUNCTIONS BELOW UPDATE CHART ELEMENTS---------------------------////////// 
    //////////////////////////////////////////////////////////////////////////////////////////////

    function xScale(healthData, chosenXAxis)    // function used for updating x-scale var upon click on axis label
        {
        var xLinearScale = d3.scaleLinear() // create scales

            .domain([
                    d3.min(healthData, d => d[chosenXAxis]) * 0.8,
                    d3.max(healthData, d => d[chosenXAxis]) * 1.1,
                   ])
            .range([0, width]);

            return xLinearScale;
        }


    function renderCircles(circlesGroup, newXScale, chosenXAxis) // function used for updating circles group with a transition to     // new circles
        {
        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]));
            return circlesGroup;
        }


            ///  this translates the labeles to cirlce locaations on axis change   
    function updateAbbr( stateLabels , newXScale, chosenXAxis  ) // function used for updating circles group with a transition to     // new circles
        {
         stateLabels.transition()
            .duration(1000)
            
             .attr("x", d => newXScale(d[chosenXAxis])  )   //  -5 );
                // console.log('line 65 this is the stateLabels', stateLabels);
            return stateLabels;     
        }


    function renderAxes(newXScale, xAxis)  // function used for updating xAxis var upon click on axis label
        {
        var bottomAxis = d3.axisBottom(newXScale);
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

            return xAxis;
        }

   
    function updateToolTip(chosenXAxis, circlesGroup)  // function used for updating circles group with new tooltip
        {
            var toolTip = d3.tip()
                .attr("class", "tooltip")
                .offset([120, 0])
                .html(function(d) { return (`State: ${d.state}, ${d.abbr}<br> Avg  Income : $ ${d.income}  <br> Lacks HealthCare: ${d.healthcare} %   <br> Poverty: ${d.poverty} % <br> Obsese: ${d.obesity} % <br>Smokes: ${d.smokes} % `);  });
     
            circlesGroup.call(toolTip);   // onmouseout event
            circlesGroup.on("mouseover", function(data)       { toolTip.show(data); })
                        .on("mouseout", function(data, index) { toolTip.hide(data); });

            return circlesGroup;
        }
    //////////////////////////////////////////////////////////////////////////////////////////////
    ///-------------- LOAD DATA -------------////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    ///--every thing belw is wrapped in one function this load data func
    // Retrieve data from the CSV file and execute everything below
    d3.csv("assets/data/data.csv") .then(function( healthData) 
        {
            // if (err) throw err;
            // console.log('unable to load data')
            healthData.forEach(function(data) // LOAD AND PARSE TEXT DATA TO NUMBERS 
                    {
                    data.healthcare = +data.healthcare; 
                    data.income     = +data.income;
                    data.smokes     = +data.smokes;
                    data.poverty    = +data.poverty;
                    data.obesity    = +data.obesity;
                    data.age        = +data.age;
                    });
                // console.log("here is all the healthdata", healthData);
                    

            //////////////////////////////////////////////////////////////////////////////////////////////
            ///----------------CREATE AXIS'S ----------------------------------------------------------////
            //////////////////////////////////////////////////////////////////////////////////////////////
                // xLinearScale function above csv import
            var xLinearScale = xScale(healthData, chosenXAxis);

            var yLinearScale = d3.scaleLinear()
                .domain([ d3.min(healthData, d => d.healthcare) -1,   d3.max(healthData, d => d.healthcare) +2]) //+ (1*(d3.max(healthData, d => d.healthcare)) ))])
                .range([height, 0]);
  
                // Create initial axis functions
            var bottomAxis = d3.axisBottom(xLinearScale);
            var leftAxis   = d3.axisLeft(yLinearScale);

                // append x axis
            var xAxis = chartGroup.append("g")
                .classed("x-axis", true)
                .attr("transform", `translate(0, ${height})`)
                .call(bottomAxis);

                // append y axis
            chartGroup.append("g").call(leftAxis);

        
            //////////////////////////////////////////////////////////////////////////////////////////////
            ///------INSTANTIATE CHART ELEMENTS--------/////////////--CIRCLES----LABELS--------------/////
            //////////////////////////////////////////////////////////////////////////////////////////////
       
            var circlesGroup = chartGroup.selectAll("circle") // BUILD CIRCLE SCATTER CHART OBJS 
                .data(healthData)
                .enter()
                .append("circle") 
                .classed("stateCircle", true)
                .attr("cx", d => xLinearScale(d[chosenXAxis]))
                .attr("cy", d => yLinearScale(d.healthcare))
                .attr("r", 14)
                .attr("opacity", ".8");

            var labelsGroup = chartGroup.append("g")// Create group for  2 x- axis labels
                .attr("transform", `translate(${width / 2}, ${height + 20})`);

            var incomeLabel = labelsGroup.append("text") //-CLICKABLE X-AXIS LABEL-//
                .attr("x", 0)
                .attr("y", 20)
                .attr("value", "income") // value to grab for event listener
                .classed("active", true)
                .text("Income Level (Avg)");

            var povertyLabel = labelsGroup.append("text")//-CLICKABLE X-AXIS LABEL-//
                .attr("x", 0)
                .attr("y", 40)
                .attr("value", "poverty") // value to grab for event listener
                .classed("inactive", true)
                .text("In Poverty (%)");

            var obesityLabel = labelsGroup.append("text")//-CLICKABLE X-AXIS LABEL-//
                .attr("x", 0)
                .attr("y", 60)
                .attr("value", "obesity") // value to grab for event listener
                .classed("inactive", true)
                .text("Obesity (%)");
             
            chartGroup.append("text") //  append y axis
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .classed("axis-text", true)
                .text(" Lacking HealthCare (%) ");

                // updateToolTip function above csv import
            var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
                // x axis labels event listener
    
            function runOnce(data)///BUILD STATE LABELS 
                {
                chartGroup.selectAll("circlesGroup")
                .data(data)
                .enter()
                .append("text")
                .classed("stateText", true)
                    .attr("x", d => xLinearScale(d[chosenXAxis] ))// - 550))
                .attr("y", d => yLinearScale(d.healthcare) + 4 )
                .text(d => d.abbr)
                .attr("font-family", "sans-serif")
                .attr("font-size", "10px")
                .attr("font-weight", "bold")
                .attr("fill", "black");
                }
        
                runOnce(healthData);
            var stateLabels = d3.selectAll(".stateText");
            // console.log('line 217 this is the stateLabels', stateLabels);


            //////////////////////////////////////////////////////////////////////////////////////////////
            ///------MOUSE EVENTS--------UPDATE AXIS AND CHART ELEMENTS ON USER DATA SELECTION-------/////
            //////////////////////////////////////////////////////////////////////////////////////////////

            labelsGroup.selectAll("text")
            .on("mouseover", function()  // .on("click", function() {
                {
                    // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) 
                        {
                                // replaces chosenXAxis with value
                            chosenXAxis  = value;
                                // console.log('this is the value line 241', value);
                                // console.log(chosenXAxis)
                                // functions here found above csv import
                                // updates x scale for new data
                            xLinearScale = xScale( healthData, chosenXAxis );
                                // updates x axis with transition
                            xAxis        = renderAxes( xLinearScale, xAxis );
                            circlesGroup = renderCircles( circlesGroup, xLinearScale, chosenXAxis );
                            statelabels  = updateAbbr( stateLabels , xLinearScale, chosenXAxis, healthData, yLinearScale );

                                // updates tooltips with new info
                            circlesGroup = updateToolTip( chosenXAxis, circlesGroup );
                                                      
                                // changes classes to change bold text
                            if (chosenXAxis === "poverty") 
                                    {
                                    reduceBy = .15;
                                    // text = updateAbbr(healthData, chosenXAxis);
                                    povertyLabel
                                        .classed("active", true)
                                        .classed("inactive", false);

                                    incomeLabel
                                        .classed("active", false)
                                        .classed("inactive", true);
                                    
                                    obesityLabel
                                    .classed("active", false)
                                    .classed("inactive", true);
                                    }

                            if (chosenXAxis === "income") 
                                    {
                                    reduceBy = 500;
                                    // text = updateAbbr(healthData, chosenXAxis);

                                    povertyLabel
                                        .classed("active", false)
                                        .classed("inactive", true);
                                    incomeLabel
                                        .classed("active", true)
                                        .classed("inactive", false);
                                    obesityLabel
                                        .classed("active", false)
                                        .classed("inactive", true);
                                    }

                            if (chosenXAxis === "obesity") 
                                    {
                                    reduceBy = .15;
                                    // text = updateAbbr(healthData, chosenXAxis);

                                    povertyLabel
                                        .classed("active", false)
                                        .classed("inactive", true);
                                    incomeLabel
                                        .classed("active", false)
                                        .classed("inactive", true);
                                    obesityLabel
                                        .classed("active", true)
                                        .classed("inactive", false);
                                    }


                        }
                });
    
    });

}


    makeResponsive(); /// RUN THE MAKE RESPONSIVE FUNC
    // Event listener for window resize.
    // When the browser window is resized, makeResponsive() is called.
    d3.select(window).on("resize", makeResponsive);



                                                                                                                                                                                                                                                                                                                                            ///    B R A N D O N    STEINKE




/*

//////////-----ATTEMPT TO ADD ADDTIONAL Y AXIS  FAILED BELOW----- //////////////////////////




        var labelsGroupY = chartGroup.append("g")
                            .attr("transform", "rotate(-90)")
                            .attr("y", 0 - margin.left)
                            .attr("x", 0 - (height / 2))
                            .attr("dy", "1em");
                        // .attr("transform", "rotate(-90)", `translate(${ margin.left}, ${height * .5})`)  ;
                        // .attr("dy", "1em");

        var incomeLabel = labelsGroupY.append("text")
            // .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", -200 )
            // .attr("dy", "1em")
            .attr("value", "income") // value to grab for event listener
            .classed("axis-text", true)
            .text("Income Level");




    function renderAxesY(newYScale, yAxis)  // function used for updating xAxis var upon click on axis label
    {
    var leftAxis = d3.axisBottom(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

        return yAxis;
    }    
    

    
    function yScale(healthData, chosenYAxis)    // function used for updating x-scale var upon click on axis label
        {
        var yLinearScale = d3.scaleLinear() // create scales

            .domain([
                    d3.min(healthData, d => d[chosenYAxis]) * 0.8,
                    d3.max(healthData, d => d[chosenYAxis]) * 1.1,
                   ])
            .range([0, width]);

        return yLinearScale;
        }



    labelsGroupY.selectAll("text")
    .on("mouseover", function()  // .on("click", function() {
        {
               // get value of selection
        var valuez = d3.select(this).attr("value");
        if (valuez !== chosenYAxis) 
                {
                        // replaces chosenXAxis with value
                    chosenYAxis  = valuez;
                    console.log('this is the value line 291', valuez);
                        // console.log(chosenXAxis)
                        // functions here found above csv import
                        // updates x scale for new data
                    yLinearScale = yScale( healthData, chosenYAxis );
                        // updates x axis with transition
                    yAxis        = renderAxesY( yLinearScale, yAxis );
                    circlesGroup = renderCircles( circlesGroup, xLinearScale, chosenYAxis );
                        // updates tooltips with new info
                    circlesGroup = updateToolTip( chosenYAxis, circlesGroup );
                    // text = updateAbbr(healthData, chosenXAxis);
                   
                        // changes classes to change bold text
                    if (chosenYAxis === "income") 
                            {
                            // text = updateAbbr(healthData, healthData.poverty);
                            text = updateAbbr(healthData, chosenYAxis);
                            incomeLabel
                                .classed("active", true)
                                .classed("inactive", false);
    
                            healthLengthLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            
                            obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                            }
    
                    if (chosenYAxis === "healthcare") 
                            {
                            text = updateAbbr(healthData, chosenYAxis);
    
                            incomeLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            healthLengthLabel
                                .classed("active", true)
                                .classed("inactive", false);
                            obesityLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            }
    
                    if (chosenYAxis === "obesity") 
                            {
                            text = updateAbbr(healthData, chosenYAxis);
    
                            incomeLabel
                                .classed("active", false)
                                .classed("inactive", false);
                            healthLengthLabel
                                .classed("active", false)
                                .classed("inactive", false);
                            obesityLabel
                                .classed("active", true)
                                .classed("inactive", false);
                            }
                }
    
            });

            
            */