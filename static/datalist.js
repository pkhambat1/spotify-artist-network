let dataList = $('#json-datalist');
let input = $('input#artist');
let timeout = null;

input.on('input', function () {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
        let name = input.val();
        if (!name) return;
        let url = encodeURI(`/_get_artist_list?name='${name}`);
        console.log(url);
        fetch(url).then(function (response) {
            return response.json();
        }).then(function (data) {
            console.log(data);
            // Hack 101
            if (data[0].name === name) {
                var breadth = d3.select('#value-step-breadth').text();
                var depth = d3.select('#value-step-depth').text();
                makeGraph(name, breadth, depth);
                return;
            }
            dataList.empty();
            data.forEach(item => {
                // Create a new <option> element.
                var option = document.createElement('option');
                // Set the value using the item in the JSON array.
                option.value = item.name;
                dataList.append(option);
            });
        }).catch(function (e) {
            console.log("Err", e);
        });
    }, 250);
});