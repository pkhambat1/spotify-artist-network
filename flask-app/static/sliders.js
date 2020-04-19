let breadth_data = [0, 1, 2, 3, 4];
// var depth_data = [0, 1, 2, 3, 4];
let depth_data = [0, 1, 2, 3];
let slider_width = 200;
let slider_height = 80;
const default_breadth = 2;
const default_depth = 2;
const default_artist = 'Post Malone';

// Step
var sliderStepBreadth = d3
    .sliderBottom()
    .min(d3.min(breadth_data))
    .max(d3.max(breadth_data))
    .width(breadth_data.length * 25)
    .tickFormat(d3.format(''))
    .ticks(breadth_data.length)
    .step(1)
    .default(default_breadth)
    .on('onchange', val => {
        var artist = $('input#artist').val();
        var depth = d3.select('#value-step-depth').text();
        makeGraph(artist, parseInt(val), parseInt(depth));
        d3.select('#value-step-breadth').text(val);
    });

var sliderStepDepth = d3
    .sliderBottom()
    .min(d3.min(depth_data))
    .max(d3.max(depth_data))
    .width(depth_data.length * 23)
    .tickFormat(d3.format(''))
    .ticks(depth_data.length)
    .step(1)
    .default(default_depth)
    .on('onchange', val => {
        var artist = $('input#artist').val();
        var breadth = d3.select('#value-step-breadth').text();
        makeGraph(artist, parseInt(breadth), parseInt(val));
        d3.select('#value-step-depth').text(val);
    });

var gStepBreadth = d3
    .select('div#slider-step-breadth')
    .append('svg')
    .attr('width', slider_width)
    .attr('height', slider_height)
    .append('g')
    .attr('transform', 'translate(30,30)');

var gStepDepth = d3
    .select('div#slider-step-depth')
    .append('svg')
    .attr('width', slider_width)
    .attr('height', slider_height)
    .append('g')
    .attr('transform', 'translate(30,30)');

gStepBreadth.call(sliderStepBreadth);
gStepDepth.call(sliderStepDepth);

d3.select('#value-step-breadth').text(sliderStepBreadth.value());
d3.select('#value-step-depth').text(sliderStepDepth.value());
