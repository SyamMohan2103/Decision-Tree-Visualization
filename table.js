// create table, etc.
var tableSVG = d3.select("#words"),
  tableWidth = +tableSVG.attr("width"),
  tableHeight = +tableSVG.attr("height")
var table = tableSVG.append('foreignObject').attr("width", tableWidth).attr("height", tableHeight).append("xhtml:body");

var thead = table.append('thead');
var tbody = table.append('tbody');

// append the header row
thead.append('tr').selectAll('th').data(['feature', 'score']).enter().append('th').text(function(col_names) {
  return col_names + "\t";
});

dispatch.on("dataLoaded", function(graph) {
  function update_table(key) {
    var data = graph[key];
    // update data to display

    // remove existing rows
    // this basically resets the table element
    // but is not the right way
    tbody.selectAll('tr').remove();

    // join new data with old elements, if any
    var rows = tbody.selectAll('tr').data(data);

    var rowsEnter = rows.enter().append('tr');

    rowsEnter.append('td').attr("class", "idColumn");

    rowsEnter.append('td').attr("class", "valColumn");

    // rowsEnter.append('td')
    //     .append('svg')
    //     .attr("width", 20)
    //     .attr("height", 20).append('circle')
    //     .attr("class", "svgCircle")
    //     .style("fill", "red");

    d3.selectAll(".idColumn").data(data).text(function(d) {
      return d.feature;
    });
    d3.selectAll(".valColumn").data(data).text(function(d) {
      return d.score.toFixed(5);
    });
    // d3.selectAll(".svgCircle").data(data).attr("cx", 10)
    //     .attr("cy", 10).transition().duration(500)
    //     .attr("r", function(d) {
    //         return d.score;
    //     })
    //     .style("fill", "red");

    rows.transition().duration(1000).exit().remove();
  }

  function clear_table(key) {
    tbody.selectAll('tr').remove();
  }

  dispatch.on("rectSelected", function(d) {
    update_table(d);
  })
  dispatch.on("rectDeselected", function(d) {
    clear_table(d);
  })
});
