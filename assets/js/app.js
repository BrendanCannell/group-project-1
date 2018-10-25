// Global app class
class App {
  constructor(bindto) {
    Object.assign(this, {
      bindto,
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
      },
      message: "Type in a Ticker to Display Stock Price Graph",
      chart: {
        element: $('<div id="chart">'),
        c3: null
      },
    });
  }

  // Wrap `localStorage` item 'favs' as a property
  get favs() {
    return JSON.parse(localStorage.getItem('favs')) || [];
  }
  set favs(arr) {
    localStorage.setItem('favs', JSON.stringify(arr));
  }

  update() {
    // Pending queries are moved to current if successful.
    let s = this.queries.stock;
    if (s.pending && s.pending.success) {
      s.current = s.pending;
      s.pending = null;
      // this.chart && this.chart.destroy();
      // this.chart = null;
    }

    let n = this.queries.news;
    if (n.pending && n.pending.success) {
      n.current = n.pending;
      n.pending = null;
    }

    this.render();
  }

  render() {
    let stock = this.queries.stock.current;
    let news = this.queries.news.current;

    // Keeps `$($arg)` synced with `obj[prop]`. Otherwise forms would get cleared on every render.
    function $sync($arg, obj, prop) {
      return $($arg).val(obj[prop]).on('change', (e) => obj[prop] = $(e.currentTarget.val()));
    }

    $(this.bindto).empty().append(
      $('<div id="data-selection">').append(
        $('<form>').append(
          $sync('<input class="query" type="text" placeholder="Dataset code">', this, 'stockQueryInput'),
          $('<input type="submit" value="Search">')
        ).on('submit', (e) => {
          e.preventDefault();
          this.queries.stock.pending = new StockQuery(this.stockQueryInput, this.update.bind(this))
        })
      ),
      $('<div id="news-selection">').append(
        $sync('<input class="query" type="text" placeholder="Search news">', this, 'newsQueryInput')
      ),
      this.chart.element,
      $('<div id="news">').append(
        $('<h1>News</h1>'),
        news && news.success && news.articles.map((article) =>
          $('<div class="article">').append(
            $('<h2>').text(article.headline),
            $('<p>').text(article.snippet)
          )
        ))
    );

    $(this.bindto).empty().append(
      $("<div id='controls' class='card'>").append(
        $("<h2 class='text-center'>").text(app.message),
        $("<div class='row'>").append(
          $("<div class='col-md-3'>"),

          $("<div class='col-md-6'>").append(
            $("<div class='row form-group'>").append(
              $("<h4>").text("Ticker"),
              $('<form>').append(
                $sync('<input class="query" type="text" placeholder="Dataset code">', this, 'stockQueryInput'),
                $('<input type="submit" value="Search">')
              ).on('submit', (e) => {
                e.preventDefault();
                this.queries.stock.pending = new StockQuery(this.stockQueryInput, this.update.bind(this))
              })),

            $("<div class='row form-group'>").append(
              $("<h4>").text("News"),
              $sync('<input class="query" type="text" placeholder="Search news">', this, 'newsQueryInput')),

            $("<div class='row form-group'>").append(
              $("<h4>").text("Date"))),

          $("<div class='col-md-3'>"))),

      this.chart.element,
      $('<div id="news">').append(
        $('<h1>News</h1>'),
        news && news.success && news.articles.map((article) =>
          $('<div class="article">').append(
            $('<h2>').text(article.headline),
            $('<p>').text(article.snippet)))));

    if (stock && stock.success) {
      if (!this.chart.c3) {
        this.chart.c3 = c3.generate({
          bindto: this.bindto + ' #chart',
          data: {
            onclick: (d) => this.queries.news.pending = new NewsQuery(this.newsQueryInput, d.x.getFullYear(), d.x.getMonth(), this.update.bind(this)), // Chart click handler
            xs: {
              'datasetValues': 'datasetDates'
            },
            columns: [
              ['datasetDates', ...stock.dataset.dates],
              ['datasetValues', ...stock.dataset.values]
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
          legend: {
            show: false
          }
        });
      } else {
        this.chart.c3.load({
          columns: [
            ['datasetDates', ...stock.dataset.dates],
            ['datasetValues', ...stock.dataset.values]
          ]
        })
      }
    }
  }
}