// Global app state object
var state = {
  dataset: null,
  articles: [{
    headline: "Something happened",
    snippet: "It was very important and it happened.",
    date: '2000-01-01',
    url: ''
  }],
  dataQuery: 'WIKI/FB', // Search box
  newsQuery: 'Facebook',
  newsBegin: '2014-01-01',
  newsEnd: '2016-01-01'
};

// Fetch dataset `code` from Quand. `valIndex` is the array index of the desired value column. Takes a `callback` to call with the processed response data.
function fetchTimeSeries(code, valIndex, callback) {
  $.ajax({
    method: 'GET',
    url: 'https://www.quandl.com/api/v3/datasets/' + code + '/data.json?api_key=UgyTCPiRsSybMnmGJJKA'
  }).done(response => callback({
    dates: response.dataset_data.data.map(datum => datum[0]),
    values: response.dataset_data.data.map(datum => datum[valIndex])
  }));
}

function fetchArticles(query, beginDate, endDate, callback) {
  function format(date) {
    return date.toISOString().match(/^(\d\d\d\d)-(\d\d)-(\d\d)/).slice(1).join('');
  }

  $.ajax({
    url: 'https://api.nytimes.com/svc/search/v2/articlesearch.json?'
      + $.param({
        'api-key': '33d24445c695491bb4645a00e949c71f',
        'q': query,
        'fq': 'news_desk:("Business")',
        'begin_date': "" + beginDate.getFullYear() + "0101", // format(beginDate),
        'end_date': "" + beginDate.getFullYear() + "1231", // format(endDate),
        'fl': "headline,snippet,web_url,pub_date,news_desk"
      })
  }).done(response => callback(response.response.docs.map(doc => {
    return {
      headline: doc.headline.main,
      snippet: doc.snippet,
      url: doc.web_url,
      date: doc.pub_date
    }
  })));
}

// Event handler for the submit button
function submitDataQuery(event) {
  event.preventDefault();
  fetchTimeSeries(state.dataQuery, 1, (data) => {
    state.dataset = data;
    render();
  });
}

var chart = null;

function render() {
  $('div#app').empty().append(
    $('<div id="data-selection">').append(
      $('<form>').on('submit', submitDataQuery).append(
        $('<input class="query" type="text" placeholder="Dataset code">')
          .val(state.dataQuery)
          .on('change', (e) => state.dataQuery = $(e.currentTarget).val()),
        $('<input type="submit">')
          .val("Search"))
    ),
    $('<div id="news-selection">').append(
      $('<input class="query" type="text" placeholder="Search news">')
        .val(state.newsQuery)
        .on('change', (e) => state.newsQuery = $(e.currentTarget).val())
    ),
    $('<div id="chart">'),
    $('<div id="news">').append(
      $('<h1>News</h1>'),
      state.articles.map((article) =>
        $('<div class="article">').append(
          $('<h2>').text(article.headline),
          $('<p>').text(article.snippet)
        )
      ))
  );

  if (state.dataset) {
    chart = c3.generate({
      bindto: '#chart',
      data: {
        onclick: (d) => fetchArticles(state.newsQuery, d.x, d.x, (articles) => {state.articles = articles; render()}), // Chart click handler
        xs: {
          'datasetValues': 'datasetDates',
          'newsControlsY': 'newsControls'
        },
        columns: [
          ['datasetDates', ...state.dataset.dates],
          ['datasetValues', ...state.dataset.values],
          ['newsControls', state.newsBegin, state.newsEnd],
          ['newsControlsY', 0, 0]
        ],
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            count: 10,
            format: '%Y-%m-%d'
          }
        }
      },
      // point: {
      //   show: false
      // }
    });
  }
}

render();

function load() {
  chart.load({
    json: [
      { date2: "2014-01-01", value: 0 },
      { date2: "2016-01-01", value: 0 },
    ]
  })
}