var input = {
    "Item": {
        "entities": {
            "S": "[{\"type\":\"Person\",\"text\":\"Elon Musk\",\"relevance\":\"0.80222\",\"count\":\"3\",\"Relevance\":\"0.80222\"},{\"type\":\"Company\",\"text\":\"Tesla\",\"relevance\":\"0.438313\",\"count\":\"1\",\"Relevance\":\"0.438313\"},{\"type\":\"Technology\",\"text\":\"Autopilot\",\"relevance\":\"0.493184\",\"count\":\"1\",\"Relevance\":\"0.80222\"},{\"type\":\"FieldTerminology\",\"text\":\"sports car\",\"relevance\":\"0.40922\",\"count\":\"5\",\"Relevance\":\"0.80222\"},{\"type\":\"FieldTerminology\",\"text\":\"lithium ion battery\",\"relevance\":\"0.60137\",\"count\":\"2\",\"Relevance\":\"0.80222\"},{\"type\":\"Person\",\"text\":\"Nikola Tesla\",\"relevance\":\"0.3013\",\"count\":\"1\",\"Relevance\":\"0.80222\"}]"
        },
        "conference-uuid": {
            "S": "25236C0C-6ADD-437E-B128-2053C493E4A5"
        }
    }
};


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

//Acquire the height of a string using a particular font
String.prototype.height = function(font) {
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

    var divHeight = o.height();

    o.remove();

    return divHeight;
}

var entities = JSON.parse(input.Item.entities.S);
console.log(JSON.stringify(entities, null, "\t"));


var numEntities = entities.length;

var width = 1100,
    height = 700,
    rightPad = 20,
    leftPad = 150,
    bottomPad = 40,
    topPad = 20;

//Add the empty svg element to the DOM
var svg = d3.select("#barChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);


var relevanceMax = d3.max(entities, function(d) {
    return parseFloat(d.relevance);
});

var relevanceMin = d3.min(entities, function(d) {
    return parseFloat(d.relevance);
});

var countMax = d3.max(entities, function(d) {
    return parseInt(d.count);
});

var countMin = d3.min(entities, function(d) {
    return parseInt(d.count);
});

/*
    var xScale = d3.scale.ordinal()
        .rangeBand([0, width], .1);
*/


//A color is assigned to each entity type
var colorValue = function(d) {
    return d.type;
};
var color = d3.scaleOrdinal(d3.schemeCategory20);


//Y values map from [0, countMax + 2] to
var yScale = d3.scaleLinear().domain([0, countMax + 1]).range([height - bottomPad, topPad]);

/*
    var xAxis = d3.axisBottom();
    xAxis.scale(xScale);
*/


var yAxis = d3.axisLeft();
yAxis.scale(yScale);
var yLabel = "Count";

//Add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);






var barWidth = 35;
var offset = 20;
var spacing = 20;

var labelFont = "13px sans-serif";


//Change barWidth if necessary to accomodate longer than usual labels
for (var i = 0; i < entities.length; i++)
{
  var textWidth = entities[i].text.width(labelFont);
  if ( textWidth > barWidth + spacing)
  {
    console.log("greater!");
    barWidth = textWidth - spacing;

    if ( barWidth * entities.length >= width - leftPad - rightPad)
    {
      console.log("barWidth too large!");
      break;
    }
  }
}




svg.selectAll(".bar")
    .data(entities)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("width", barWidth + "px")
    .attr("x", function(d, i) {
        return i * (barWidth + spacing) + leftPad + offset;
    })
    .attr("y", function(d) {
        return yScale(d.count);
    })
    .attr("height", function(d) {
        return height - yScale(d.count) - bottomPad;
    })
    .style("fill", function(d) {
        //Color the datapoints according to their type
        return color(colorValue(d));
    })
    .on("mouseover", function(d, i) {

      //Highlight the bar with a brown color
        d3.select(this)
            .style("fill", "brown");

        //Display tooltip with relevant information
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html("<b>Type: " + d.type + "<br/>" +
                "Text: " + d.text + "<br/>" +
                "Count: " + d.count + "<br/>" +
                "Relevance: " + d.relevance + "</b>")
            .style("left", i * (barWidth + spacing) + leftPad + offset + "px")
            .style("top",  (yScale(d.count) - 20) + "px");

    })
    .on("mouseout", function(d) {

      //Reset the bar's color
      d3.select(this)
          .style("fill", function(d) {
              //Color the datapoints according to their type
              return color(colorValue(d));
          });

        //Hide tooltip upon mouse-out
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });;


//Add labels to the points to be able to see what the associated text is
svg.selectAll("text")
    .data(entities)
    .enter()
    .append("text")
    .text(function(d) {

      if (d.text.width(labelFont) < barWidth + spacing) return d.text;
      else {
        var temp = d.text;
        temp.split(" ").join("\n");
        console.log(temp);
        return temp;
      }
    })
    .style("font", labelFont)
    .attr("x", function(d, i) {

      var text = d.text;

      if (d.text.width(labelFont) >= barWidth + spacing)
      {
        text.replace(/\s/g, "\n");
      }

        //Center the text on the datapoint's center
        return i * (barWidth + spacing) + leftPad + offset + (barWidth - text.width(labelFont))/2;

    })
    .attr("y", function(d) {

        return height - bottomPad +  d.text.height(labelFont);
    });

//Add Y-axis
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + leftPad + ", 0)")
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("x", -topPad)
    .attr("dy", ".71em")
    .attr("fill", "#333")
    .style("text-anchor", "end")
    .style("font-size", "19px")
    .text(yLabel);