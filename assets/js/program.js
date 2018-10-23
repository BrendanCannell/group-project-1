// Global app state object
var state = {
  dataset: null,
  articles: [{
    headline: "Something happened",
    snippet: "It was very important and it happened.",
    date: '2000-01-01',
    url: ''
  }],
  input: '',
};

// Fetch dataset `code` from Quandl. `valIndex` is the array index of the desired value column. Takes a `callback` to call with the processed response data.
function getTimeSeries(code, valIndex, callback) {
  $.ajax({
    method: 'GET',
    url: 'https://www.quandl.com/api/v3/datasets/' + code + '/data.json?api_key=UgyTCPiRsSybMnmGJJKA'
  }).done(response => callback({
    dates: response.dataset_data.data.map(datum => datum[0]),
    values: response.dataset_data.data.map(datum => datum[valIndex])
  }));
}

// Event handler for the submit button
function submitQuery(event) {
  event.preventDefault();
  getTimeSeries(state.input, 1, (data) => {
    state.dataset = data;
    render();
  });
}

function render() {
  //changed selector to empty div "#news" below Articles header
  $('#news').empty().append(
    $('<div id="news-selection">').append(
      $('<form>').on('submit', submitQuery).append(
        $('<input class="query" type="text">')
          .val(state.input)
          .on('change', (e) => state.input = $(e.currentTarget).val()),
        $('<input type="submit">')
          .val("Search"))
    ),
    // $('<div id="chart">'),
    $("#news").append(
      // $('<h1>News</h1>'),
      state.articles.map((article) =>
        $('<div class="article">').append(
          $('<h2>').text(article.headline),
          $('<p>').text(article.snippet)
        )
    ))
  );

  if (state.dataset) {
    c3.generate({
      bindto: '#chart',
      data: {
        onclick: console.log,
        x: 'date',
        columns: [
          ['date', ...state.dataset.dates],
          ['value', ...state.dataset.values]
        ]
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            count: 10,
            format: '%Y-%m-%d'
          }
        }
      }
    });
  }
}


function main() {
  render();
}

window.onload = function() {
  main();
}