//Acquire the width of a string using a particular font
String.prototype.width = function(font) {
    var f = font || '12px arial';

    var o = $('<div>' + this + '</div>')
        .css({
            'position': 'absolute',
            'float': 'left',
            'white-space': 'nowrap',
            'visibility': 'hidden',
            'font': font
        })
        .appendTo($('body'));

    var divWidth = o.width();

    o.remove();

    return divWidth;
}

//Get date in short format
Date.prototype.shortFormat = function() {
    return (this.toLocaleDateString() + " " +
        this.toLocaleTimeString());
}


var sliderPosition;

var width = 1100,
    height = 400,
    rightPad = 20,
    leftPad = 50,
    bottomPad = 150,
    topPad = 200,
    radius = 5;


var xScale;


function displayTimeline(rawInput, relevanceThreshold, initialSetup) {

    if (!rawInput) {
        alert("Please fill the textarea");
        console.log("Please fill the textarea");
        return;
    }

    if (initialSetup) {

        sliderPosition = leftPad

        try {
            rawInput = JSON.parse(rawInput);

        } catch (e) {
            console.log(e);
            alert(e);
            return;
        }
    }
    //Hide formInput and show reset button
    document.getElementById("formInput").style.display = 'none';
    document.getElementById("reset").style.display = 'block';

    //Clear any previous barchart
    var myNode = document.getElementById("timeline");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }


    //Retrieve an array of entities
    var entities = getEntitiesArray(rawInput, relevanceThreshold);

    if (initialSetup) {
        var originalEntitiesTimeParse = getMinMaxTime(entities);
        originalMinTime = originalEntitiesTimeParse[0];
        originalMaxTime = originalEntitiesTimeParse[1];


        //Adding padding to min and max times
        var paddingSeconds = (3 * radius / (width - rightPad - leftPad)) * (originalMaxTime.getTime() - originalMinTime.getTime());
        var domainMin = new Date(originalMinTime.getTime() - paddingSeconds);
        var domainMax = new Date(originalMaxTime.getTime() + paddingSeconds);


        console.log(originalMaxTime.toLocaleTimeString() + " to " + domainMax.toLocaleTimeString());


        xScale = d3.scaleTime()
            .domain([domainMin, domainMax])
            .range([leftPad, width - rightPad]);

    }

    //  console.log("Original entities input:\n\n" + JSON.stringify(entities, null, "\t"));


    //Add the empty svg element to the DOM
    var svg = d3.select("#timeline")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    xAxisDraw(svg, xScale);

    //Add the tooltip area to the webpage
    var tooltip = d3.select("#timeline").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var color = d3.scaleOrdinal(d3.schemeCategory20);


    if (entities.length !== 0) {
        //      console.log("Parsed time for entities:\n\n" + JSON.stringify(entities, null, "\t"));

        drawCircles(svg, entities, xScale, tooltip, color);

        drawLegend(svg, entities, color);
    }


/*
    var navWidth = width - rightPad - leftPad,
        navHeight = 60;

    var navChart = d3.select("#timeline").append('svg')
        .classed('navigator', true)
        .attr('width', navWidth)
        .attr('height', navHeight)
        .append('g');
//        .attr('transform', 'translate(' + leftPad + ',' + (-topPad) + ')');

    var navXScale = d3.scaleTime()
        .domain([domainMin, domainMax])
        .range([leftPad, navWidth]);

    
        var navYScale = d3.scale.linear()
            .domain([yMin, yMax])
            .range([navHeight, height - bottomPad]);


    var navXAxis = d3.axisBottom()
        .scale(navXScale);

    navChart.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + navHeight + ')')
        .call(navXAxis);


    var navData = d3.area()
        .x(function(d) {
            return navXScale(d.time);
        })
        .y0(navHeight)
        .y1(function(d) {
            return (navHeight - (1.5 * radius));
          });

    var navLine = d3.line()
        .x(function(d) {
            return navXScale(d.time);
        })
        .y(function(d) {
          return (navHeight - (1.5 * radius))
        });

    navChart.append('path')
        .attr('class', 'data')
        .attr('d', navData(entities));

    navChart.append('path')
        .attr('class', 'line')
        .attr('d', navLine(entities));

*/


    drawSlider(svg);

    /*
    //If current timeline update is part of intro animation, don't repeat it
    if (animation)
    {
    drawSlider(svg), true;
    }
    else drawSlider(svg, false);

    */

}

//Get an array of entities from the input string
function getEntitiesArray(rawInput, relevanceThreshold) {
    var input = JSON.parse(rawInput.Item.entities.S);

    var entities = [];
    //Building an entities array to incorporate individual times in each entity
    for (var i = 0; i < input.length; i++) {

        if (parseFloat(input[i].relevance) > relevanceThreshold) {

            for (var j = 0; j < input[i].timestamp.length; j++) {
                var tmpObj = {};
                tmpObj['type'] = input[i].type;
                tmpObj['text'] = input[i].text;
                tmpObj['relevance'] = parseFloat(input[i].relevance);
                tmpObj['count'] = parseInt(input[i].count);
                tmpObj['time'] = parseTime(input[i].timestamp[j]);

                entities.push(tmpObj);
            }

        }
    }
    return entities;
}



//Get the maximum pixel width of entity labels (entity text)
function getMaxLabelWidth(entities, labelFont) {
    var max = 0;
    for (var i = 0; i < entities.length; i++) {
        if (entities[i].text.width(labelFont) > max) {
            max = entities[i].text.width(labelFont);
        }
    }
    return max;
}

function getMinMaxTime(entities) {

    if (entities.length == 0) return [null, null];

    //Finding minTime, maxTime, relevanceMax, and relevanceMax
    var minTime = entities[0].time;
    var maxTime = entities[0].time;


    for (var i = 0; i < entities.length; i++) {

        //Finding maxTime and minTime
        if (maxTime < entities[i].time) maxTime = entities[i].time;
        else if (minTime > entities[i].time) minTime = entities[i].time;

    }
    return [minTime, maxTime];
}

//Draw x-Axis
function xAxisDraw(svg, xScale) {

    var xAxis = d3.axisBottom();
    xAxis.scale(xScale);
    var xLabel = "Time";

    xAxis.ticks(d3.timeMinute.every(10));
    //Display full time
    xAxis.tickFormat(d3.timeFormat("%I:%M%p"));

    // Add X-axis
    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0, " + (height - bottomPad) + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width - rightPad)
        .attr("y", 40)
        .attr("fill", "#222")
        .style("text-anchor", "end")
        .style("font-size", "20px")
        .text(xLabel);
}


function drawCircles(svg, entities, xScale, tooltip, color) {


    svg.selectAll("circle")
        .data(entities)
        .enter()
        .append("circle")
        .attr("class", function(d) {

            //Replace spaces with underscores
            var rmSpaces = d.text.replace(/ /g, "_");

            return "circle-" + rmSpaces;
        })
        .attr("cx", function(d) {
            return xScale(d.time);
        })
        .attr("cy", function(d) {
            return (height - bottomPad - (1.5 * radius));
        })
        .attr("r", radius)
        .style("fill", function(d) {
            //Color the datapoints according to their type
            return color(d.text);
        })
        .on("mouseover", function(d) {

            var largeRadius = Math.sqrt(3) * radius;

            //Making all classes other than slider handle of circles translucent
            d3.selectAll("circle:not(.handle")
                .style("opacity", 0.3);

            //Make the current circle have default opacity with heavier borders and larger radius
            d3.select(this)
                .style("opacity", 1)
                .style("stroke-width", 5)
                .attr("r", largeRadius);

            var timeString = "Time: " + entities[0].time.shortFormat();
            var widthTimeString = timeString.width();

            var xPos = xScale(d.time) - widthTimeString / 2 - largeRadius / 2;
            if (xPos < 0) xPos = 0;

            //Display tooltip with relevant information
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<b>Type: " + d.type + "<br/>" +
                    "Text: " + d.text + "<br/>" +
                    "Count: " + d.count + "<br/>" +
                    "Time: " + d.time.shortFormat() + "<br/>" +
                    "Relevance: " + d.relevance + "</b>")
                .style("left", xPos + "px")
                .style("top", height - bottomPad - largeRadius - 60 + "px");

        })
        .on("mouseout", function(d) {

            //Resetting opacity of all circles other than slider handle
            d3.selectAll("circle:not(.handle")
                .style("opacity", 1);

            //Reset the current circle's border thickness and radius
            d3.select(this)
                .style("stroke-width", 1)
                .attr("r", radius);


            //Hide tooltip upon mouse-out
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}


function drawLegend(svg, entities, color) {

    var labelFont = "11px sans-serif"
    var legendTabHeight = 0;
    var maxLegendHeight = 250;
    var legendTabs = 0;
    var currentLegendTabIndex = 0;

    var maxLabelWidth = getMaxLabelWidth(entities, labelFont);

    // Draw legend
    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {

            if (legendTabHeight + 55 > maxLegendHeight) {
                legendTabs++;
                currentLegendTabIndex = 0
                legendTabHeight = 0;
                currentLegendTabIndex++;
                legendTabHeight += 55;
                return "translate(" + (-legendTabs * (maxLabelWidth + 85)) + "," + currentLegendTabIndex * 35 + ")";

            } else {
                currentLegendTabIndex++;
                legendTabHeight += 55;
                return "translate(" + (-legendTabs * (maxLabelWidth + 85)) + "," + currentLegendTabIndex * 35 + ")";

            }


        });


    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 20)
        .attr("y", rightPad)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", color)
        .on("mouseover", function(d) {

            //Replace spaces with underscores
            var rmSpaces = d.replace(/ /g, "_");

            //Making all other classes of circles translucent
            var notSelector = "circle:not(.circle-" + rmSpaces + "):not(.handle)";
            svg.selectAll(notSelector)
                .style("opacity", 0.3);

            //Making this class of circles have a larger radius and thicker border
            svg.selectAll(".circle-" + rmSpaces)
                .style("stroke-width", 5)
                .attr("r", function() {
                    return Math.sqrt(3) * radius;
                });

        })
        .on("mouseout", function(d) {

            //Replace spaces with underscores
            var rmSpaces = d.replace(/ /g, "_");

            //Resetting opacity of all other classes of circles
            var notSelector = "circle:not(.circle-" + rmSpaces + "):not(.handle)";
            svg.selectAll(notSelector)
                .style("opacity", 1);

            //Resetting border thickness and radius of this class of circles
            svg.selectAll(".circle-" + rmSpaces)
                .style("stroke-width", 1)
                .attr("r", radius);

        });



    // draw legend text
    legend.append("text")
        .attr("x", width - 26)
        .attr("y", rightPad + 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {
            return d;
        })
        .attr("font-size", "14px")
        .on("mouseover", function(d) {

            //Replace spaces with underscores
            var rmSpaces = d.replace(/ /g, "_");

            //Making all other classes of circles translucent
            var notSelector = "circle:not(.circle-" + rmSpaces + "):not(.handle)";
            svg.selectAll(notSelector)
                .style("opacity", 0.3);

            //Making this class of circles have a larger radius and thicker border
            svg.selectAll(".circle-" + rmSpaces)
                .style("stroke-width", 5)
                .attr("r", function() {
                    return Math.sqrt(3) * radius;
                });

        })
        .on("mouseout", function(d) {

            //Replace spaces with underscores
            var rmSpaces = d.replace(/ /g, "_");

            //Resetting opacity of all other classes of circles
            var notSelector = "circle:not(.circle-" + rmSpaces + "):not(.handle)";
            svg.selectAll(notSelector)
                .style("opacity", 1);

            //Resetting border thickness and radius of this class of circles
            svg.selectAll(".circle-" + rmSpaces)
                .style("stroke-width", 1)
                .attr("r", radius);

        });


}


function drawSlider(svg) {
    var sliderScale = d3.scaleLinear()
        .domain([0.0, 1.0])
        .range([leftPad, width - rightPad])
        .clamp(true);

    var slider = svg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(0, " + (height - 55) + ")");


    slider.append("line")
        .attr("class", "track")
        .attr("x1", sliderScale.range()[0])
        .attr("x2", sliderScale.range()[1])
        .select(function() {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-inset")
        .select(function() {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function() {
                slider.interrupt();
            })
            .on("start drag", function() {
                console.log("slided to: " + sliderScale.invert(d3.event.x));


                sliderPosition = d3.event.x;

                //Making sure slider circle stays in range
                if (sliderPosition < leftPad) {
                    sliderPosition = leftPad;
                }
                if (sliderPosition > width - rightPad) {
                    sliderPosition = width - rightPad;
                }

                displayTimeline(getSampleInput(), sliderScale.invert(sliderPosition), false);
            }));

    var sliderLabel = slider.append("text")
        .attr("class", "sliderLable")
        .attr("x", width / 2 + leftPad + 50)
        .attr("y", 45)
        .attr("fill", "#222")
        .style("text-anchor", "end")
        .style("font-size", "16px")
        .text("Relevance Threshold Slider");


    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(sliderScale.ticks(10))
        .enter().append("text")
        .attr("x", sliderScale)
        .attr("text-anchor", "middle")
        .text(function(d) {
            return d.toFixed(2);
        });

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

    handle.attr("cx", sliderPosition);

    /*

    if (!skipAnimation)
    {
      slider.transition() // Gratuitous intro!
          .duration(10)
          .tween("displayTimeline", function() {
            console.log('sdfa');
              var i = d3.interpolate(0, 50);
              return function(t) {
                introAnimation( i(t));
              };
          });
    }


                function introAnimation(position)
                {
                  handle.attr("cx", sliderScale(position));
                  displayTimeline(getSampleInput(), position, false, true);

                }
    */

}





function reset() {

    //Clear any previous timeline
    var myNode = document.getElementById("timeline");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }

    //Show formInput and hide reset button
    document.getElementById("formInput").style.display = 'block';
    document.getElementById("reset").style.display = 'none';
}




function getSampleInput() {
    var input = {
        "Item": {
            "entities": {
                "S": "[{\"type\":\"Person\",\"text\":\"Elon Musk\",\"relevance\":\"0.80222\", \"timestamp\":[\"09:32\", \"09:49\", \"09:58\", \"09:59\", \"10:56\", \"10:57\", \"10:58\"], \"count\":\"3\",\"Relevance\":\"0.80222\"},{\"type\":\"Company\",\"text\":\"Tesla\",\"relevance\":\"0.438313\", \"timestamp\":[\"09:21\", \"09:56\", \"09:22\", \"09:29\", \"09:34\", \"09:40\", \"09:22\"], \"count\":\"1\",\"Relevance\":\"0.438313\"},{\"type\":\"Technology\",\"text\":\"Autopilot\",\"relevance\":\"0.493184\",\"count\":\"1\",\"timestamp\":[\"09:11\", \"09:12\", \"09:14\", \"09:15\", \"09:32\", \"09:09\", \"09:23\", \"09:20\"], \"Relevance\":\"0.80222\"},{\"type\":\"FieldTerminology\",\"text\":\"sports car\",\"timestamp\":[\"09:41\", \"09:44\", \"09:45\", \"09:32\",\"09:47\", \"09:48\", \"09:49\", \"09:59\"], \"relevance\":\"0.40922\",\"count\":\"5\",\"Relevance\":\"0.80222\"},{\"type\":\"FieldTerminology\",\"text\":\"lithium ion battery\", \"timestamp\":[\"10:02\", \"10:03\", \"10:09\", \"10:05\", \"10:06\", \"10:07\", \"10:19\"], \"relevance\":\"0.60137\",\"count\":\"2\",\"Relevance\":\"0.80222\"},{\"type\":\"Person\",\"text\":\"Nikola Tesla\",\"relevance\":\"0.3013\",\"count\":\"1\", \"timestamp\":[\"09:25\", \"09:28\", \"09:49\", \"09:51\", \"10:35\", \"10:36\", \"10:48\", \"10:52\"], \"Relevance\":\"0.80222\"}, {\"type\":\"Company\",\"text\":\"Gigafactory\",\"relevance\":\"0.7152\", \"timestamp\":[\"10:30\", \"10:35\", \"10:36\", \"10:48\", \"10:49\", \"10:59\", \"09:09\"], \"count\":\"2\",\"Relevance\":\"0.7152\"}, {\"type\":\"Company\",\"text\":\"Mobileye\",\"relevance\":\"0.6489\", \"timestamp\":[\"09:45\", \"09:02\", \"09:46\", \"09:53\", \"10:02\", \"10:18\", \"10:41\"], \"count\":\"7\",\"Relevance\":\"0.6489\"}, {\"type\":\"FieldTerminology\",\"text\":\"solar panels\",\"relevance\":\"0.1365\", \"timestamp\":[\"09:59\", \"09:53\", \"09:26\", \"09:25\", \"10:08\", \"10:09\", \"10:15\"], \"count\":\"7\",\"Relevance\":\"0.1365\"}, {\"type\":\"FieldTerminology\",\"text\":\"proprietary software\",\"relevance\":\"0.2478\", \"timestamp\":[\"09:02\", \"09:09\", \"09:10\", \"09:06\", \"10:21\", \"10:23\", \"10:25\"], \"count\":\"7\",\"Relevance\":\"0.2478\"}, {\"type\":\"FieldTerminology\",\"text\":\"energy storage\",\"relevance\":\"0.4712\", \"timestamp\":[\"09:35\", \"09:36\", \"09:37\", \"09:18\", \"10:42\", \"10:43\", \"10:45\"], \"count\":\"7\",\"Relevance\":\"0.4712\"}, {\"type\":\"FieldTerminology\",\"text\":\"artificial intelligence\",\"relevance\":\"0.5923\", \"timestamp\":[\"09:02\", \"09:03\", \"09:07\", \"09:09\", \"10:01\", \"10:04\", \"10:07\"], \"count\":\"7\",\"Relevance\":\"0.5923\"}, {\"type\":\"FieldTerminology\",\"text\":\"neural network\",\"relevance\":\"0.3401\", \"timestamp\":[\"09:16\", \"09:17\", \"09:30\", \"09:33\", \"10:25\", \"10:28\", \"10:31\"], \"count\":\"7\",\"Relevance\":\"0.3401\"}, {\"type\":\"Company\",\"text\":\"Faraday Future\",\"relevance\":\"0.4398\", \"timestamp\":[\"09:03\", \"09:06\", \"09:07\", \"09:52\", \"10:12\", \"10:11\", \"10:14\"], \"count\":\"7\",\"Relevance\":\"0.4398\"}, {\"type\":\"FieldTerminology\",\"text\":\"electric car\",\"relevance\":\"0.83922\", \"timestamp\":[\"09:55\", \"09:56\", \"09:58\", \"10:36\", \"10:37\", \"10:50\", \"10:51\"], \"count\":\"7\",\"Relevance\":\"0.83922\"}]"
            },
            "conference-uuid": {
                "S": "25236C0C-6ADD-437E-B128-2053C493E4A5"
            }
        }
    };

    return input;
}

//Insert sample JSON input
function insertSampleInput() {


    if (document.getElementById("sampleInput").checked == true) {

        document.getElementById('input').value = JSON.stringify(getSampleInput(), null, "\t");
    } else {
        document.getElementById('input').value = "";
    }
}


//Extract a Date Object out of a time string
function parseTime(timeStr, dt) {
    if (!dt) {
        dt = new Date();
    }

    var time = timeStr.match(/(\d+)(?::(\d\d))?\s*(p?)/i);
    if (!time) {
        return NaN;
    }
    var hours = parseInt(time[1], 10);
    if (hours == 12 && !time[3]) {
        hours = 0;
    } else {
        hours += (hours < 12 && time[3]) ? 12 : 0;
    }

    dt.setHours(hours);
    dt.setMinutes(parseInt(time[2], 10) || 0);
    dt.setSeconds(0, 0);

    return dt;
}
