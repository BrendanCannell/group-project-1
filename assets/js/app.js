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
      }
    });
  }

  update() {
    // Pending queries are moved to current if ready.
    function swapIfReady(queryPair) {
      let qp = queryPair;
      if (qp.pending && qp.pending.success) {
        qp.current = qp.pending;
        qp.pending = null;
      }
    }

    swapIfReady(this.queries.stock);
    swapIfReady(this.queries.news);

    this.render();
  }

  render() {
    let stock = this.queries.stock.current;
    let news = this.queries.news.current;

    $(this.bindto).empty().append(
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
        news && news.success && news.articles.map((article) =>
          $('<div class="article">').append(
            $('<h2>').text(article.headline),
            $('<p>').text(article.snippet)
          )
        ))
    );

    if (stock && stock.success) {
      c3.generate({
        bindto: '#chart',
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
      });
    }
  }
}