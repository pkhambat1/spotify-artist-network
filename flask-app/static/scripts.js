$(document).ready(function () {
    $('input#artist').val(default_artist);
    makeGraph(default_artist, default_breadth, default_depth);
});

$('button#search-artist').on('click', () => {
    var artist = $('input#artist').val();
    var breadth = d3.select('#value-step-breadth').text();
    var depth = d3.select('#value-step-depth').text();
    makeGraph(artist, breadth, depth);
});

const makeGraph = (artist, breadth, depth) => {
    var artist_network = `/_get_artist_network?artist=${artist}&breadth=${breadth}&depth=${depth}`;
    artist_network = encodeURI(artist_network);
    loadGraph(artist_network, breadth);
};
