// Network Graph

var svg = d3.select("#viz");
var width = svg.attr('width');
var height = svg.attr('height');
var currentZoom = 1;
var transform = null;
let rootPopularity;

// var depthLevel = (breadth, index) => {
//     const DEPTH_MAX = 10;
//     for (let i = 0; i < DEPTH_MAX + 1; i++) {
//         let cumSum = 0;
//         for (let j = 0; j < i + 1; j++) {
//             cumSum += Math.pow(breadth, j);
//         }
//         if (cumSum >= index + 1) {
//             return i;
//         }
//     }
//     return DEPTH_MAX;
// };

const loadGraph = (json, breadth) => {


    d3.json(json).then(graph => {
        rootPopularity = graph.nodes[0].popularity;
        // console.log(rootPopularity);
        console.log(graph.nodes[0].popularity);
        var extent = d3.extent(
            graph.nodes, d => d.popularity
            // [0, 100]
        );
        var adjlist = new Set();
        graph.links.forEach((d, i) => {
            adjlist.add(d.source + "-" + d.target);
            adjlist.add(d.target + "-" + d.source);
        });

        // var color = d3.scaleSequential(d3.interpolateYlGnBu)
        // var color = d3.scaleSequential(d3.interpolateViridis)
        // var color = d3.scaleSequential(d3.interpolateWarm)
        // var color = d3.scaleSequential(d3.interpolateCool)
        var color = d3.scaleSequential(d3.interpolateSinebow)
            .domain([0, 100]);

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
        svg.selectAll("g.container,g#legend").remove();


        var container = svg
            .append("g")
            .attr("class", "container")
            .attr("transform", transform);

        var voronoi = d3.voronoi().extent([[0 - width / 2, 0 - height / 2], [width * 1.5, height * 1.5]]);


        var init = () => {
            svg.transition().call(
                zoom.transform,
                d3.zoomIdentity.scale(currentZoom),
                d3.zoomTransform(svg.node())
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
                .attr("dx", d => d.index === 0 ? 18 / d3.event.transform.k : 12 / d3.event.transform.k);
            container.attr('transform', d3.event.transform);
        };

        var zoom = d3.zoom()
            .scaleExtent([.5, 1.5])
            // .scaleExtent([.05, 3])
            .on("zoom", zoomed);
        svg.call(zoom);


        var link = container.append('g')
            .attr('class', 'links')
            .selectAll(".link")
            .data(graph.links)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr("stroke", "rgb(170, 170, 170, 0.5)")
            .attr("stroke-width", () => transform ? 1 / transform.k : 1);

        var node = container.append('g')
            .attr('class', 'nodes')
            .selectAll(".node")
            .data(graph.nodes)
            .enter()
            // .call(() => zoomed)
            .append("g")
            .attr('class', 'node');
        // .call(
        //     d3.drag()
        //         .on("start", dragstarted)
        //         .on("drag", dragged)
        //         .on("end", dragended)
        // );
        node.append("circle")
            .attr('r', d => d.index === 0 ? (transform ? 12 / transform.k : 12) : (transform ? 6 / transform.k : 6))
            .attr("stroke", "whitesmoke")
            // .attr("stroke", "lightgray")
            .attr("stroke-width", d => d.index === 0 ? (transform ? 3 / transform.k : 3) : (transform ? 1 / transform.k : 1))
            // .attr("fill", (d, i) => color(depthLevel(breadth, i)));
            .attr("fill", d => color(d.popularity));
        node.append("text")
            .attr("dx", d => d.index === 0 ? (transform ? 18 / transform.k : 18) : (transform ? 12 / transform.k : 12))
            .attr("dy", () => transform ? `${.35 / transform.k}em` : '.35em')
            .attr("font-size", d => d.index === 0 ? (transform ? 16 / transform.k : 16) : (transform ? 12 / transform.k : 12))
            .attr("font-family", "sans-serif")
            .attr("font-weight", d => d.index === 0 ? 700 : 300)
            .text(d => d.id);
        var polygon = container.append('g')
            .attr('class', 'polygons')
            // .selectAll("polygon.polygon")
            .selectAll('polygon.polygon')
            .data(graph.nodes)
            .enter()
            .append('polygon')
            .attr('class', 'polygon')
            .on("mouseover", focus);

        svg.on('mouseout', unfocus);
        drawLegend();

        // node.on("mouseover", focus).on("mouseout", unfocus);

        function focus() {
            var src = d3.select(d3.event.target).datum().id;
            console.log(d3.select(this));
            // node
            //     .transition()
            //     .style("opacity", o => neigh(src, o.id) ? 1 : 0.2);
            node.select('circle')
                .transition()
                .style('stroke', o => o.id === src ? 'red' : '');
            link
                .transition()
                // .style("opacity", o => o.source.id === src || o.target.id === src ? 1 : 0.2)
                .style('stroke', o => o.source.id === src || o.target.id === src ? 'red' : '');
        }

        function unfocus() {
            node
                .transition()
                .style("opacity", '1');
            node.select('circle')
                .transition()
                .style('stroke', 'whitesmoke');
            link
                .transition()
                .style("opacity", '1')
                .style('stroke', 'rgb(170, 170, 170, 0.5)');
        }

        function neigh(a, b) {
            return a === b || adjlist.has(a + "-" + b);
        }

        function ticked() {
            if (graph.nodes[0].x) {
                let polygonShapes = voronoi(graph.nodes.map(d => [d.x, d.y])).polygons();
                polygon
                    .attr("points", (d, i) => polygonShapes[i]).attr('id', d => d.id);
            }
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

        function drawLegend() {
            let lWidth = 200;
            let lHeight = 10;

            // our color scale doesn't have an invert() function
            // and we need some way of mapping 0% and 100% to our domain
            // so we'll create a scale to reverse that mapping
            var percentScale =
                d3.scaleLinear()
                    // d3.scaleDiverging(d3.interpolateRdYlGn)
                    .domain(color.domain())
                    .range(extent);
            // calculate how much to shift legend group to fit in our plot area nicely
            var xshift = width - (lWidth + 20);
            var yshift = 30;
            // create group for legend elements
            // will translate it to the appropriate location later
            var legend = svg.append("g")
                .attr("id", "legend")
                .attr("transform", `translate(${xshift}, ${yshift})`);

            legend.append('text')
                .attr('class', 'axis-title')
                .text('Artist Popularity (0 - 100)')
                .attr('y', '-.8em');

            // draw the color rectangle with gradient
            legend.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", lWidth)
                .attr("height", lHeight)
                .attr("fill", "url(#gradient)");


            // create another scale so we can easily draw an axis on the color box
            var legendScale = d3.scaleLinear()
                .domain(extent)
                // .domain([0, 100])
                .range([0, lWidth]);

            // use an axis generator to draw axis under color box
            var legendAxis = d3.axisBottom(legendScale)
                // https://github.com/d3/d3-format
                .tickFormat(d3.format(""))
                .tickValues(getTicks())
                .tickSize(4);

            function getTicks() {
                let low = extent[0], high = extent[1];
                let range = high - low;
                if (range === 0) {
                    return extent;
                }
                if (Math.min((rootPopularity - low) / range, (high - rootPopularity) / range) > 0.05) {
                    return [low, rootPopularity, high];
                } else {
                    return extent;
                }
            }

            // draw it!
            legend.append("g")
                .attr("id", "color-axis")
                .attr("class", "legend")
                .attr("transform", `translate(0, ${lHeight})`)
                .call(legendAxis);

            // setup gradient for legend
            // http://bl.ocks.org/mbostock/1086421
            legend.append("defs")
                .append("linearGradient")
                .attr("id", "gradient")
                .selectAll("stop")
                .data(d3.ticks(0, 100, 5))
                .enter()
                .append("stop")
                .attr("offset", function (d) {
                    return d + "%";
                })
                .attr("stop-color", function (d) {
                    return color(percentScale(d));
                });


            legend.attr("transform", `translate(${xshift}, ${yshift})`);
        }
    });


};

