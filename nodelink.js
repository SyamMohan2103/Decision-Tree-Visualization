var svg = d3.select("#nodelink"),
  width = +svg.attr("width"),
  height = +svg.attr("height"),
  radius = 5
  clickedNode = null;

function calcRadius(d) {
  switch (d.group) {
    case 2:
      return 7;
    default:
      return radius;
  }
}

function highlightNode(id) {
  // console.log(id);
  // svg.selectAll("circle.node").transition().attr("stroke", function(d) {
  //   return (d.id === id) ? "#000000" : "#fff";
  // })
  // .attr("stroke-width", function(d) {
  //   return (d.id === id) ? "3px" : "1.5px";
  // })
  // .attr("r", function(d) {
  //   return (d.id === id) ? 6 : this.getAttribute("r");
  // });
  clickedNode = id;
}

var simulation = d3.forceSimulation().force("link", d3.forceLink().id(function(d) {
  return d.id;
}).strength(0.8)).force("charge", d3.forceManyBody().strength(-20)).force("center", d3.forceCenter(width / 2, height / 2));

d3.json("data/nodelink/Class-4-753_0.json", function(error, graph) {
  if (error)
    throw error;

  var link = svg.append("g").attr("class", "links").selectAll("line").data(graph.links).enter().append("line").attr("stroke-width", function(d) {
    return 0.1;
  }).attr("stroke", "#999");

  var node = svg.append("g").attr("class", "nodes").selectAll("circle").data(graph.nodes).enter().append("circle").attr("class", "node").attr("id", function(d) {
    return d.id;
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
  }).call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

  svg.selectAll("circle").on("click", function(d) {
    if (d.group === 2)
      return;
    var clickedNode = this;
    d3.selectAll("circle.node").transition().attr("stroke", function() {
      return (this === clickedNode) ? "#000000" : "#fff";
    })
    .attr("stroke-width", function() {
      return (this === clickedNode) ? "3px" : "1.5px";
    })
    .attr("r", function() {
      return (this === clickedNode) ? 6 : this.getAttribute("r");
    });
    link.attr("stroke-width", function(l) {
      if (d.id == l.source.id) {
        return 5;
      } else {
        return 0.1;
      }
    })
    .attr("stroke", function(l) {
      if (d.id == l.source.id) {
        return "#31a354";
      } else {
        return "#999";
      }
    });
    this.parentNode.appendChild(this);
    // })
    // .on("mouseout", function(d) {
    //   link.attr("stroke-width", function(l) {
    //     return 0.1;
    //   });
  });

  node.append("title").text(function(d) {
    return d.id;
  });

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

    if (clickedNode) {
      node.attr("stroke", function(d) {
        // console.log(d);
        return (d.id === clickedNode) ? "#000000" : "#fff";
      });
      clickedNode = null;
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
