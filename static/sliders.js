let breadthData = d3.range(5);
let depthData = d3.range(4);
let sliderWidth = 180;
let sliderHeight = 50;
const defaultBreadth = 3;
const defaultDepth = 2;
const defaultArtist = 'The Beatles';

// Step
var sliderStepBreadth = d3
    .sliderBottom()
    .min(d3.min(breadthData))
    .max(d3.max(breadthData))
    .width(sliderWidth - 60)
    .tickFormat(d3.format(''))
    .ticks(breadthData.length - 1)
    .step(1)
    .fill('#1DB954')
    .default(defaultBreadth)
    .handle(d3.symbol()
        .type(d3.symbolCircle)
        .size(200)()
    )
    .on('onchange', val => {
        var artist = $('input#artist').val();
        var depth = d3.select('#value-step-depth').text();
        makeGraph(artist, parseInt(val), parseInt(depth));
        d3.select('#value-step-breadth').text(val);
    });

var sliderStepDepth = d3
    .sliderBottom()
    .min(d3.min(depthData))
    .max(d3.max(depthData))
    .width(sliderWidth - 60)
    .tickFormat(d3.format(''))
    .ticks(depthData.length - 1)
    .step(1)
    .fill('#1DB954')
    .default(defaultDepth)
    .handle(d3.symbol()
        .type(d3.symbolCircle)
        .size(200)()
    )
    .on('onchange', val => {
        var artist = $('input#artist').val();
        var breadth = d3.select('#value-step-breadth').text();
        makeGraph(artist, parseInt(breadth), parseInt(val));
        d3.select('#value-step-depth').text(val);
    });

var gStepBreadth = d3
    .select('div#slider-step-breadth')
    .append('svg')
    .attr('width', sliderWidth)
    .attr('height', sliderHeight)
    .append('g')
    .attr('transform', 'translate(10,10)');

var gStepDepth = d3
    .select('div#slider-step-depth')
    .append('svg')
    .attr('width', sliderWidth)
    .attr('height', sliderHeight)
    .append('g')
    .attr('transform', 'translate(10,10)');

gStepBreadth.call(sliderStepBreadth);
gStepDepth.call(sliderStepDepth);

d3.select('#value-step-breadth').text(sliderStepBreadth.value());
d3.select('#value-step-depth').text(sliderStepDepth.value());
