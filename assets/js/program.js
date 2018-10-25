// Returns a function that calls each of the arguments of chain in sequence
// e.g., chain(fn1, fn2, fn3)  ->  function (...args) { fn1(...args); fn2(...args); fn3(...args); }
function chain(...fns) {
  return (...args) => fns.forEach((fn) => fn(...args));
}

// $.ajax(...).always(receiveAt(obj, 'prop')) will send an AJAX request that sets obj.prop to the response when it arrives
function receiveAt(obj, prop) {
  return (...args) => {
    let responseIndex = (args[1] === 'success') ? 2 : 0;
    let response = args[responseIndex]
    obj[prop] = response;
  }
}

// If `obj.prop` is defined (perhaps in the prototype) by a getter that must do some sort of expensive computation to return `val`, `memoize(obj, { prop: val })` can be used to record the value so it need not be recomputed next time. It then returns `val`.
function memoize(obj, propsToMemoize) {
  Object.keys(propsToMemoize).forEach((key) =>
    Object.defineProperty(obj, key, { value: propsToMemoize[key] }));
}


// Global app class
class App {
  constructor() {
    Object.assign(this, {
      stockQueryInput: '',
      newsQueryInput: '',
      queries: {
        stock: {
          current: null,
          pending: null,
        },
        news: {
          current: null,
          pending: null
        }
      }
    });
  }

  update() {
    // Pending queries are moved to current if ready.
    let qs = this.queries;
    for (let q in qs) {
      if (qs[q].pending && qs[q].pending.status) {
        qs[q].current = qs[q].pending;
        qs[q].pending = null;
      }
    }

    this.render();
  }

  render() {
    $('div#app').empty().append(
      $('<div id="data-selection">').append(
        $('<form>').append(
          $('<input class="query" type="text" placeholder="Dataset code">')
            .val(this.stockQueryInput)
            .on('change', (e) => this.stockQueryInput = $(e.currentTarget).val()),
          $('<input type="submit" value="Search">')
            .val("Search"))
          .on('submit', (e) => {
            e.preventDefault();
            this.queries.stock.pending = new StockQuery(this.stockQueryInput, this.update.bind(this))
          })
      ),
      $('<div id="news-selection">').append(
        $('<input class="query" type="text" placeholder="Search news">')
          .val(this.newsQueryInput)
          .on('change', (e) => this.newsQueryInput = $(e.currentTarget).val())
      ),
      $('<div id="chart">'),
      $('<div id="news">').append(
        $('<h1>News</h1>'),
        this.queries.news.current && this.queries.news.current.status
        && this.queries.news.current.articles.map((article) =>
          $('<div class="article">').append(
            $('<h2>').text(article.headline),
            $('<p>').text(article.snippet)
          )
        ))
    );

    if (this.queries.stock.current && this.queries.stock.current.status) {
      c3.generate({
        bindto: '#chart',
        data: {
          onclick: (d) => this.queries.news.pending = new NewsQuery(this.newsQueryInput, d.x.getFullYear(), d.x.getMonth(), this.update.bind(this)), // Chart click handler
          xs: {
            'datasetValues': 'datasetDates'
          },
          columns: [
            ['datasetDates', ...this.queries.stock.current.dataset.dates],
            ['datasetValues', ...this.queries.stock.current.dataset.values]
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
      });
    }
  }
}

class StockQuery {
  constructor(symbol, update) {
    Object.assign(this, {
      symbol, update,
      response: { // separate data and metadata API responses
        data: null,
        metadata: null,
      }
    })

    // Send requests
    $.ajax({
      method: 'GET',
      url: 'https://www.quandl.com/api/v3/datasets/WIKI/' + symbol + '/data.json',
      data: {
        api_key: 'UgyTCPiRsSybMnmGJJKA'
      }
    }).always(chain(receiveAt(this.response, 'data'), this.update));

    $.ajax({
      method: 'GET',
      url: 'https://www.quandl.com/api/v3/datasets/WIKI/' + symbol + '/metadata.json',
      data: {
        api_key: 'UgyTCPiRsSybMnmGJJKA'
      }
    }).always(chain(receiveAt(this.response, 'metadata'), this.update));
  }

  get status() {
    let d = this.response.data && this.response.data.statusText === 'success';
    let m = this.response.metadata && this.response.metadata.statusText === 'success';

    if (d && m) // Both data and metadata requests succeeded
      return true;
    else if (d === false || m === false) // At least one request failed
      return false;
    else return null; // Neither failed and at least one is still pending
  }

  get companyName() {
    if (this.status) {
      let namePlusJunk = this.response.metadata.responseJSON.dataset.name;
      let companyName = namePlusJunk.match(/(.*?) \(/)[1]; // Extract the prefix before the first ' ('

      memoize(this, { companyName })
      return companyName;
    } else return null;
  }

  get dataset() {
    if (this.status) {
      let d = this.response.data.responseJSON.dataset_data;
      let valIndex = d.column_names.indexOf('Close');
      let dataset = {
        dates: d.data.map(datum => datum[0]),
        values: d.data.map(datum => datum[valIndex])
      };

      memoize(this, { dataset })
      return dataset;
    } else return null;
  }
}

class NewsQuery {
  constructor(query, year, month, update) {
    Object.assign(this, {
      query, year, month, update,
      response: null
    });

    let beginMonth = month || 0;
    let begin = new Date(year, beginMonth, 1);

    // `new Date(year, month, day)` interprets day 0 of next month as the last day of this month
    let endMonthPlus1 = month ? month + 1 : 12;
    let end = new Date(year, endMonthPlus1, 0);

    // YYYY-MM-DDT... -> YYYYMMDD
    function format(date) {
      return date.toISOString().split('T')[0].replace(/-/g, '');
    }

    $.ajax({
      url: 'https://api.nytimes.com/svc/search/v2/articlesearch.json?',
      data: {
        'api-key': '33d24445c695491bb4645a00e949c71f',
        'q': query,
        'fq': 'news_desk:("Business" "Business Day" "Financial" "Your Money" )',
        'begin_date': format(begin),
        'end_date': format(end),
        'fl': "headline,snippet,web_url,pub_date,news_desk"
      }
    }).always(chain(receiveAt(this, 'response'), this.update));
  }

  get status() {
    return this.response && this.response.statusText === 'OK';
  }

  get articles() {
    if (this.status) {
      let articles = this.response.responseJSON.response.docs.map(doc => Object({
        headline: doc.headline.main,
        snippet: doc.snippet,
        url: doc.web_url,
        date: doc.pub_date
      }));

      Object.defineProperty(this, 'articles', { value: articles });
      return articles;
    } else return null;
  }
}

var app = new App();
app.stockQueryInput = 'FB';
app.newsQueryInput = 'Facebook';
app.update();