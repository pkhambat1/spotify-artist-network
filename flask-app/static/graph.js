// Network Graph
var svg = d3.select("#viz");
svg.on('mouseover', () => {
    svg.style('cursor', 'move');
});
let currentSelection = d3.select('span#currentSelection').select('strong');
var width = svg.attr('width');
var height = svg.attr('height');
var currentZoom = 1;
var transform = null;
let rootPopularity;
let selectedId;
// let selectedGreen = '#5CDB94';
let selectedGreen = 'red';
let artistText = d3.select('span#artistText').select('strong');
let breadthText = d3.select('span#breadthText').select('strong');
let depthText = d3.select('span#depthText').select('strong');

const loadGraph = (json, breadth, depth) => {
    d3.json(json).then(graph => {

        artistText.text(graph.nodes[0].name);
        breadthText.text(breadth);
        depthText.text(depth);
        currentSelection.text(graph.nodes[0].name);
        const viridis = ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"];
        const cool = ["#6e40aa", "#417de0", "#1ac7c2", "#40f373", "#aff05b"];
        const warm = ["#6e40aa", "#d23ea7", "#ff5e63", "#efa72f", "#aff05b"];
        const cividis = ["#002051", "#575c6e", "#a49d78", "#fdea45"];
        const plasma = ["#0d0887", "#7e03a8", "#cc4778", "#f89540", "#f0f921"];

        const color = d3.scaleThreshold()
            .domain([20, 40, 60, 80])
            .range(plasma);
        // console.log(graph);
        let frame = d3.select('#player').select('iframe');
        let origId = graph.nodes[0].id;
        let embed = `https://open.spotify.com/embed/artist/${origId}`;
        frame.attr('src', embed);
        selectedId = origId;
        rootPopularity = graph.nodes[0].popularity;
        var extent = d3.extent(
            graph.nodes, d => d.popularity
            // [0, 100]
        );
        const adjlist = new Set();
        graph.links.forEach((d, i) => {
            adjlist.add(d.source + "-" + d.target);
            adjlist.add(d.target + "-" + d.source);
        });


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

        var borderPath = svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", height)
            .attr("width", width)
            .style("stroke", 'rgb(98, 98, 98)')
            .style("fill", "none")
            .style("stroke-width", '3px');

        var container = svg
            .append("g")
            .attr("class", "container")
            .attr("transform", transform);

        var voronoi = d3.voronoi().extent([[0 - height / 2, -100 - width / 2], [width * 1.5, height * 1.5]]);
        var init = () => {
            svg.transition().call(
                zoom.transform,
                d3.zoomIdentity.scale(currentZoom),
                d3.zoomTransform(svg.node())
            );
        };

        svg.on('dblclick', reset);
        var zoomed = () => {
            transform = d3.event.transform;
            currentZoom = d3.event.transform.k;
            node.select('circle')
                .attr('r', d => d.index === 0 ? 14 / d3.event.transform.k : 8 / d3.event.transform.k)
                .attr('stroke-width', (d, i) => d.index === 0 ? 3 / d3.event.transform.k : 1.5 / d3.event.transform.k);
            container.selectAll('line.link')
                .attr('stroke-width', 1 / d3.event.transform.k);
            container.selectAll('text')
                .style('font-size', d => d.index === 0 ? 16 / d3.event.transform.k + "px" : 14 / d3.event.transform.k + "px")
                .attr("dx", d => d.index === 0 ? 18 / d3.event.transform.k : 14 / d3.event.transform.k);
            container.attr('transform', d3.event.transform);
        };

        var zoom = d3.zoom()
            .scaleExtent([.5, 2])
            // .scaleExtent([.05, 3])
            .on("zoom", zoomed);
        svg.call(zoom)
            .on("dblclick.zoom", null);

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
            .attr('class', 'node')
            .attr('id', d => d.id);
        node.append("circle")
            .attr('r', d => d.index === 0 ? (transform ? 14 / transform.k : 14) : (transform ? 8 / transform.k : 8))
            .attr("stroke", "whitesmoke")
            .attr("stroke", "lightgray")
            .attr("stroke-width", d => d.index === 0 ? (transform ? 3 / transform.k : 3) : (transform ? 1.5 / transform.k : 1.5))
            .attr("fill", d => color(d.popularity));
        d3.select(`g.node[id="${origId}"]`).select('circle').style('stroke', selectedGreen);

        node.append("text")
            .attr("dx", d => d.index === 0 ? (transform ? 18 / transform.k : 18) : (transform ? 14 / transform.k : 14))
            .attr("dy", () => transform ? `${.35 / transform.k}em` : '.35em')
            .attr("font-size", d => d.index === 0 ? (transform ? 16 / transform.k : 16) : (transform ? 14 / transform.k : 14))
            .attr("font-family", "sans-serif")
            .attr("font-weight", d => d.index === 0 ? 700 : 300)
            .text(d => d.name);

        var polygon = container.append('g')
            .attr('class', 'polygons')
            .selectAll('polygon.polygon')
            .data(graph.nodes)
            .enter()
            .append('polygon')
            .attr('class', 'polygon')
            .on("mouseover", focus)
            .on('click', getPlayer);

        function getPlayer() {
            var src = d3.select(d3.event.target).datum().id;
            var name = d3.select(d3.event.target).datum().name;
            currentSelection.text(name);
            d3.select(`g.node[id="${selectedId}"]`).select('circle').style('stroke', '');
            selectedId = src;
            embed = `https://open.spotify.com/embed/artist/${src}`;
            frame.attr('src', embed);
            d3.select(`g.node[id="${selectedId}"]`).select('circle').style('stroke', selectedGreen);
        }

        drawLegend();

        svg.selectAll('*').on('mouseout', unfocus);

        function selectArtist() {
            var src = d3.select(d3.event.target).datum().id;
            d3.select(`g.node[id="${src}"]`).raise();
            node.select('circle')
                .transition()
                .style('stroke', o => src === o.id ? 'red' : '')
        }

        function focus() {
            var src = d3.select(d3.event.target).datum().id;
            d3.select(`g.node[id="${src}"]`).raise();
            node.select('text')
                .transition()
                .style("opacity", o => neigh(src, o.id) ? 1 : 0.15);

            node.select('circle')
                .transition()
                // .style("opacity", o => neigh(src, o.id) ? 1 : 0.4)
                .style('stroke', o => o.id === selectedId ? selectedGreen : o.id === src ? 'red' : 'whitesmoke');
            link
                .transition()
                .style("opacity", o => o.source.id === src || o.target.id === src ? 1 : 0.5)
                .style('stroke', o => o.source.id === src || o.target.id === src ? 'red' : '');
        }

        function unfocus() {
            node.select('circle')
                .transition()
                .style('stroke', o => o.id !== selectedId ? 'whitesmoke' : selectedGreen)
                .style('opacity', 1);
            node.select('text')
                .transition()
                .style('opacity', 1);
            link
                .transition()
                .style("opacity", 1)
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

        function drawLegend() {
            const x = d3.scaleLinear()
                .domain([0, 100])
                .rangeRound([740, 860]);

            const g = svg.append("g")
                .attr("class", "key")
                .attr("transform", "translate(70,40)");

            g.selectAll("rect")
                .data(color.range().map(function (d) {
                    d = color.invertExtent(d);
                    if (d[0] == null) d[0] = x.domain()[0];
                    if (d[1] == null) d[1] = x.domain()[1];
                    return d;
                }))
                .enter().append("rect")
                .attr("height", 8)
                .attr("x", d => x(d[0]))
                .attr("width", d => x(d[1]) - x(d[0]))
                .attr("fill", d => color(d[0]));

            g.append("text")
                .attr("class", "caption")
                .attr("x", x.range()[0])
                .attr("y", -6)
                .attr("fill", "white")
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text("Artist Popularity (0 - 100)");

            g.call(d3.axisBottom(x)
                .tickSize(13)
                // .tickFormat('')
                .tickValues(color.domain()))
                .select(".domain")
                .remove();
        }
    });
};

