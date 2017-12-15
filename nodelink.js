var svg = d3.select("#nodelink"),
  width = +svg.attr("width"),
  height = +svg.attr("height"),
  radius = 5;

var simulation = d3.forceSimulation().force("link", d3.forceLink().id(function(d) {
  return d.id;
}).strength(0.8)).force("charge", d3.forceManyBody().strength(-20)).force("center", d3.forceCenter(width / 2, height / 2));

d3.json("data/nodelink/Class-4-753_0.json", function(error, graph) {
  if (error)
    throw error;

  var link = svg.append("g").attr("class", "links").selectAll("line").data(graph.links).enter().append("line").attr("stroke-width", function(d) {
    return 0.1;
  });

  var node = svg.append("g").attr("class", "nodes").selectAll("circle").data(graph.nodes).enter().append("circle").attr("class", "node").attr("id", function(d) {
    return d.id;
  }).attr("r", function(d) {
    switch (d.group) {
      case 2:
        return 8;
      default:
        return 5;
    }
  }).attr("fill", function(d) {
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
