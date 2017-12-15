var svg = d3.select("#nodelink"),
  width = +svg.attr("width"),
  height = +svg.attr("height"),
  radius = 5
  clickedSample = null;

function calcRadius(d) {
  switch (d.group) {
    case 2:
      return 8;
    default:
      return radius;
  }
}

function highlightNode(id) {
  clickedSample = id;
}

function unHighlightNode() {
  clickedSample = 10000;
}

d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};

var simulation = d3.forceSimulation().force("link", d3.forceLink().id(function(d) {
  return d.id;
}).strength(0.8)).force("charge", d3.forceManyBody().strength(-20)).force("center", d3.forceCenter(width / 2, height / 2));

d3.json("data/nodelink/Class-4-753_0.json", function(error, graph) {
  if (error)
    throw error;

  var link = svg.append("g").attr("class", "links").selectAll("line").data(graph.links).enter().append("line").attr("stroke-width", function(d) {
    return 0.1;
  }).attr("stroke", "#999")
  .attr("stroke-opacity", 0.6);

  var node = svg.append("g").attr("class", "nodes").selectAll("circle").data(graph.nodes).enter().append("circle").attr("class", "node").attr("id", function(d) {
    return "node-" + d.id;
  }).attr("stroke", "#fff")
    .attr("stroke-width", "1.5px")
    .attr("r", calcRadius)
    .attr("fill", function(d) {
    switch (d.group) {
      case 0:
        return d3.rgb("#98abc5");
      case 1:
        return d3.rgb("#ff8c00");
      case 2:
        return "red";
      default:
        return d3.rgb("#98abc5");
    }
  })
  .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

  svg.selectAll("circle").on("click", function(d) {
    var notClicked = (this.getAttribute("r") != 6);
    var clickedNode = this;
    if (d.group != 2) {
      d3.selectAll("circle.node").transition().attr("stroke", function() {
        return (notClicked && this === clickedNode) ? "#000000" : "#fff";
      })
      .attr("stroke-width", function() {
        return (notClicked && this === clickedNode) ? "3px" : "1.5px";
      })
      .attr("r", function() {
        if (notClicked && this === clickedNode) {
          return 6;
        } else if (this === clickedNode) {
          return radius;
        } else {
          return this.getAttribute("r");
        }
      });
      link.attr("stroke-width", function(l) {
        if (notClicked && d.id == l.source.id) {
          return 5;
        } else {
          return 0.1;
        }
      })
      .attr("stroke", function(l) {
        if (notClicked && d.id == l.source.id) {
          return "#31a354";
        } else {
          return "#999";
        }
      })
      .attr("stroke-opacity", function(l) {
        if (notClicked && d.id == l.source.id) {
          return 1;
        } else {
          return 0.6;
        }});
      d3.select(this).moveToFront();
    }
  });

  node.append("title").text(function(d) {
    return d.id;
  });

  // node.append("text")
  //     .attr("dx", 12)
  //     // .attr("dy", ".35em")
  //     .text(function(d) { return d.id; } );
  var label = svg.selectAll("node-label")
               .data(graph.nodes)
               .enter()
               .append("text")
                .text(function(d) {
                  if (d.group == 2) {
                    return d.id;
                  }
                })
                .style("text-anchor", "middle")
                .style("font-size", 12);

  simulation.nodes(graph.nodes).on("tick", ticked);

  simulation.force("link").links(graph.links);

  function ticked() {
    link.attr("x1", function(d) {
      return d.source.x;
    }).attr("y1", function(d) {
      return d.source.y;
    }).attr("x2", function(d) {
      return d.target.x;
    }).attr("y2", function(d) {
      return d.target.y;
    });

    node.attr("cx", function(d) {
      return d.x = Math.max(radius, Math.min(width - radius, d.x));
    }).attr("cy", function(d) {
      return d.y = Math.max(radius, Math.min(height - radius, d.y));
    });

    label.attr("x", function(d) { return d.x; })
         .attr("y", function(d) { return d.y - 10; });
  }

  setInterval(function() { updateHighlights(); }, 10);

  function updateHighlights() {
    if (clickedSample) {
      node.transition().attr("stroke", function(d) {
        return (d.id === clickedSample) ? "#000000" : "#fff";
      })
      .attr("stroke-width", function(d) {
        return (d.id === clickedSample) ? "3px" : "1.5px";
      })
      .attr("r", function(d) {
        return (d.id === clickedSample) ? 6 : calcRadius(d);
      });
      link.attr("stroke-width", function(l) {
        if (clickedSample == l.source.id) {
          return 5;
        } else {
          return 0.1;
        }
      })
      .attr("stroke", function(l) {
        if (clickedSample == l.source.id) {
          return "#31a354";
        } else {
          return "#999";
        }
      });
      clickedSample = null;
    }
  }
});

function dragstarted(d) {
  if (!d3.event.active)
    simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active)
    simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
