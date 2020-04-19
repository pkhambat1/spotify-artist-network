// Network Graph

var width = 800;
var height = 650;
var currentZoom = 1;
var transform = null;


var depthLevel = (breadth, index) => {
    const DEPTH_MAX = 10;
    for (let i = 0; i < DEPTH_MAX + 1; i++) {
        let cumSum = 0;
        for (let j = 0; j < i + 1; j++) {
            cumSum += Math.pow(breadth, j);
        }
        if (cumSum >= index + 1) {
            return i;
        }
    }
    return DEPTH_MAX;
};


const loadGraph = (json, breadth) => {
    d3.json(json).then(graph => {
        console.log(graph);
        var extent = d3.extent(graph.nodes,
            (d, i) => depthLevel(breadth, i)
        );
        var color = d3.scaleSequential(d3.interpolatePlasma)
            .domain(extent);
        var simulation = d3.forceSimulation(graph.nodes)
            .force("charge", d3.forceManyBody().strength(-4000))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("x", d3.forceX(width / 2).strength(1))
            .force("y", d3.forceY(height / 2).strength(1))
            .force("link", d3.forceLink(graph.links).id(d => d.id).distance(50).strength(1))
            .on("tick", ticked);
        var reset = () => {
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity,
                d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
            );
        };
        var svg = d3.select("#viz")
            .attr("width", width)
            .attr("height", height)
            .style('background-color', 'black');


        svg.select("g.container").remove();


        var container = svg
            .append("g")
            .attr("class", "container")
            .attr("transform", transform);


        var init = () => {
            svg.transition().call(
                zoom.transform,
                d3.zoomIdentity.scale(currentZoom),
                d3.zoomTransform(svg.node())
                // .invert([width / 2, height / 2])
            );
        };

        svg.on('click', reset);
        var zoomed = () => {
            transform = d3.event.transform;
            currentZoom = d3.event.transform.k;
            container.selectAll('g.node').select('circle')
                .attr('r', d => d.index === 0 ? 12 / d3.event.transform.k : 6 / d3.event.transform.k)
                .attr('stroke-width', (d, i) => d.index === 0 ? 3 / d3.event.transform.k : 1 / d3.event.transform.k);
            container.selectAll('line.link')
                .attr('stroke-width', 1 / d3.event.transform.k);
            container.selectAll('text')
                .style('font-size', d => d.index === 0 ? 16 / d3.event.transform.k + "px" : 12 / d3.event.transform.k + "px")
                .attr("dx", d => d.index === 0 ? 18 / d3.event.transform.k : 12 / d3.event.transform.k)
                .attr("dy", `${.35 / d3.event.transform.k}em`);
            container.attr('transform', d3.event.transform);
        };

        var zoom = d3.zoom()
            // .scale(1)
            .scaleExtent([.5, 3])
            .on("zoom", zoomed);
        svg.call(zoom);
        var link = container.selectAll(".link")
            .data(graph.links)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr("stroke", "rgb(170, 170, 170, 0.7)")
            .attr("stroke-width", () => transform ? 1 / transform.k : 1);
        var node = container.selectAll(".node")
            .attr("class", "nodes")
            .data(graph.nodes)
            .enter()
            // .call(() => zoomed)
            .append("g")
            .attr('class', 'node').call(
                d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended)
            );
        node.append("circle")
            .attr('r', d => d.index === 0 ? (transform ? 12 / transform.k : 12) : (transform ? 6 / transform.k : 6))
            .attr("stroke", "whitesmoke")
            .attr("stroke-width", d => d.index === 0 ? (transform ? 3 / transform.k : 3) : (transform ? 1 / transform.k : 1))
            .attr("fill", (d, i) => color(depthLevel(breadth, i)));
        node.append("text")
            .attr("dx", d => d.index === 0 ? (transform ? 18 / transform.k : 18) : (transform ? 12 / transform.k : 12))
            .attr("dy", () => transform ? `${.35 / transform.k}em` : '.35em')
            .attr("font-size", d => d.index === 0 ? (transform ? 16 / transform.k : 16) : (transform ? 12 / transform.k : 12))
            .attr("font-family", "sans-serif")
            .attr("font-weight", d => d.index === 0 ? 700 : 300)
            .text(d => d.id);
//
// var a = {
//         'id': "Limp Soyd",
//         'group': 1
//     },
//     b = {
//         'id': "Lanz Gimmer",
//         'group': 1
//     },
//     c = {
//         'id': "Balan Marsons Project",
//         'group': 1
//     };
// graph.nodes.push(a);
// graph.nodes.push(b);
// graph.nodes.push(c);
// restart();
// d3.timeout(function () {
//     graph.links.push({
//         'source': a.id,
//         'target': b.id,
//         'value': 1
//     }); // Add a-b.
//     graph.links.push({
//         'source': b.id,
//         'target': c.id,
//         'value': 1
//     }); // Add b-c.
//     graph.links.push({
//         'source': c.id,
//         'target': a.id,
//         'value': 1
//     }); // Add c-a.
//     graph.links.push({
//         'source': c.id,
//         'target': "Pink Floyd",
//         'value': 1
//     }); // Add c-a.
//     graph.links.push({
//         'source': "Camel",
//         'target': b.id,
//         'value': 1
//     }); // Add c-a.
//     restart();
// }, 1000);
//
// d3.interval(function () {
//     graph.nodes.pop(); // Remove c.
//     for (let i = 0; i < 4; i++) {
//         graph.links.pop(); // Remove c-a.
//     }
//     restart();
// }, 2000, d3.now());
//
// d3.interval(function () {
//
//     graph.nodes.push(c); // Re-add c.
//     graph.links.push({
//         'source': a.id,
//         'target': b.id,
//         'value': 1
//     }); // Add a-b.
//     graph.links.push({
//         'source': b.id,
//         'target': c.id,
//         'value': 1
//     }); // Add b-c.
//     graph.links.push({
//         'source': c.id,
//         'target': a.id,
//         'value': 1
//     }); // Add c-a.
//     graph.links.push({
//         'source': c.id,
//         'target': "Pink Floyd",
//         'value': 1
//     }); // Add c-a.
//     graph.links.push({
//         'source': "Camel",
//         'target': b.id,
//         'value': 1
//     }); // Add c-a.
//     restart();
// }, 2000, d3.now() + 1000);
//
//
// function restart() {
//     // Apply the general update pattern to the links.
//     link = link.data(graph.links, d => `${d.source.id}-${d.target.id}`);
//     link.exit().remove();
//     link = link.enter().append("line").attr('class', 'link').attr('stroke', '#aaa').attr('stroke-width', 1).merge(link);
//     // Apply the general update pattern to the nodes.
//     node = node.data(graph.nodes, d => d.id);
//     node.exit().remove();
//     node = node.enter()
//         .append("circle")
//         .attr("fill", d => color(d.group))
//         .attr("r", 5)
//         .attr("stroke", "#fff")
//         .attr("stroke-width", 2)
//         .merge(node);
//     // Update and restart the simulation.
//     console.log('before simulation.nodes(graph.nodes);');
//     simulation.nodes(graph.nodes);
//     simulation.force("link").links(graph.links);
//     simulation.alpha(1).restart();
// }


        function ticked() {
            node.call(updateNode);
            link.call(updateLink);
        }

        function updateLink(link) {
            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        }

        function updateNode(node) {
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        }

        function dragstarted(d) {
            d3.event.sourceEvent.stopPropagation();
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d3.select(this).raise();
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    })
};

