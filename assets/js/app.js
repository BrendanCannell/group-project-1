// TODO Progress indicator
// TODO Failure indicator
// TODO x-axis



// Global app class
class App {
  constructor(bindto) {
    Object.assign(this, {
      ui: {
        bindto,
        message: "Type in a Stock Symbol to Display Stock Price Graph",
        stockQueryInput: '',
        newsQueryInput: {
          text: '',
          from: new Date("2010-01-01"),
          to: new Date("2010-12-01")
        },
        chart: {
          element: $('<div id="chart">'),
          c3: null
        },
      },
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

      favs: Utils.autosave(JSON.parse(localStorage.getItem('favs')) || [], 'favs')
    });

    /////slider Variables//////
    var dayCount = 0;


    ///////Month Slider////////
    moment.locale("en-US");


  }

  submitStockQuery() {
    this.queries.stock.pending = new StockQuery(this.ui.stockQueryInput, this.update.bind(this))
  }

  submitNewsQuery() {
    let input = this.ui.newsQueryInput;

    this.queries.news.pending = new NewsQuery(input.text, input.from, input.to, this.update.bind(this))
  }

  update() {
    // Pending queries are moved to current if successful.
    let s = this.queries.stock;
    if (s.pending && s.pending.success) {
      s.current = s.pending;
      s.pending = null;
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
    let stockSuccess = stock && stock.success;
    let news = this.queries.news.current;
    let newsSuccess = news && news.success;

    // Keeps `$($arg)` synced with `obj[prop]`. Otherwise forms would get cleared on every render.
    function $sync($arg, obj, prop) {
      return $($arg).val(obj[prop]).on('change', (e) => obj[prop] = $(e.currentTarget).val());
    }

    $(this.ui.bindto).empty().append(
      $("<div id='controls' class='card'>").append(
        $("<h2 class='text-center'>").text(this.ui.message),
        $("<div class='row'>").append(
          $("<div class='col-md-3'>"),

          $("<div class='col-md-6'>").on('submit', (e) => { e.preventDefault(); this.submitStockQuery() }).append(
            $("<div class='row form-group'>").append(
              $("<h4>").text("Symbol"),
              $('<form>').append(
                $sync('<input class="query" type="text">', this.ui, 'stockQueryInput'),
                $('<input type="submit" value="Search">'))),

            $("<div class='row form-group'>").on('submit', (e) => { e.preventDefault(); this.submitNewsQuery() }).append(
              $("<h4>").text("News"),
              $('<form>').append(
                $sync('<input class="query" type="text">', this.ui.newsQueryInput, 'text'),
                $('<input type="submit" value="Search">')))),

          $("<div class='col-md-3'>")),
        $('<div class="row">').append(
          $('<div class="col-12">').append(
            $('<input type="text" class="month slider">').append(
              $('<div id="custom-handle" class="ui-slider-handle">')),
            $('<input type="text" class="year slider">').append(
              $('<div id="custom-handle" class="ui-slider-handle">'))))),
      $('<h1 class="text-center">').text((stock && stock.companyName) || ''),
      this.ui.chart.element,
      $('<div id="news">').append(
        $('<h1>News</h1>'),
        newsSuccess && news.articles.map((article) =>
          $('<div class="article">').append(
            $(`<a href="${article.url}" target="_blank">`).append($('<h2>').html(article.headline)),
            $('<p>').text(article.date),
            $('<p>').html(article.snippet)))));

    if (stockSuccess) {
      var ticks = [];
      let span = stock.to.getFullYear() - stock.from.getFullYear();
      for (let year = stock.from.getFullYear(); year <= stock.to.getFullYear(); year++) {
        let yearstr = '' + year;
        ticks.push(yearstr + '-01-01');

        if (10 >= span) {
          ticks.push(yearstr + '-04-01');
          ticks.push(yearstr + '-07-01');
          ticks.push(yearstr + '-10-01');
        }
      }

      let format = (span <= 20)
        ? (year) => year.getMonth() === 0 ? year.getFullYear() : ''
        : (year) => year.getFullYear() % 5 === 0 ? year.getFullYear() : '';

      if (!this.ui.chart.c3) {
        this.ui.chart.c3 = c3.generate({
          bindto: this.ui.bindto + ' #chart',
          data: {
            onclick: (d) => this.queries.news.pending = new NewsQuery(this.ui.newsQueryInput.text, d.x.getFullYear(), d.x.getMonth(), this.update.bind(this)), // Chart click handler
            xs: {
              'datasetValuesY': 'datasetDates',
              'datasetValuesY2': 'datasetDates'
            },
            columns: [
              ['datasetDates', ...stock.dataset.dates],
              ['datasetValuesY', ...stock.dataset.values],
              ['datasetValuesY2', ...stock.dataset.values]
            ],
            axes: {
              'datasetValuesY': 'y',
              'datasetValuesY2': 'y2'
            },
            hide: ['datasetValuesY2']
          },
          axis: {
            x: {
              type: 'timeseries',
              tick: {
                values: ticks,
                format: format,
                culling: false,
                outer: false
              },
            },
            y: {
              show: true,
              tick: {
                outer: false
              }
            },
            y2: {
              show: true,
              tick: {
                outer: false
              }
            }
          },
          legend: {
            show: false
          },
          point: {
            show: false
          },
          tooltip: {
            show: false
          }
        });
      } else {
        this.ui.chart.c3.load({
          columns: [
            ['datasetDates', ...stock.dataset.dates],
            ['datasetValuesY', ...stock.dataset.values],
            ['datasetValuesY2', ...stock.dataset.values]
          ]
        });

        // C3 doesn't actually let you dynamically update the ticks, but I copied this hack from StackOverflow
        this.ui.chart.c3.internal.xAxisTickValues = ticks;
        this.ui.chart.c3.internal.config.axis_x_tick_values = ticks;
        this.ui.chart.c3.flush();
      }
    }

    $('.month.slider').ionRangeSlider(stockSuccess
      ? {
        type: "double",
        grid: true,
        min: 1,
        max: 12,
        from: this.ui.newsQueryInput.from.getMonth(),
        to: this.ui.newsQueryInput.to.getMonth(),
        step: 1,
        grid_snap: true,
        prettify: (date) => moment(date, 'MM.YYYY').format("MMM"),
        onChange: (data) => {
          this.ui.newsQueryInput.from.setMonth(data.from);
          this.ui.newsQueryInput.to.setMonth(data.to);
        }
      }
      : {
        disable: true,
        hide_min_max: true,
        hide_from_to: true
      });

    $('.year.slider').ionRangeSlider(stockSuccess
      ? {
        type: "double",
        grid: true,
        min: stock.from.getFullYear(),
        max: stock.to.getFullYear(),
        from: this.ui.newsQueryInput.from.getFullYear(),
        to: this.ui.newsQueryInput.to.getFullYear(),
        prettify_enabled: false,
        onChange: (data) => {
          this.ui.newsQueryInput.from.setFullYear(data.from);
          this.ui.newsQueryInput.to.setFullYear(data.to);
        }
      }
      : {
        disable: true,
        hide_min_max: true,
        hide_from_to: true
      });
  }
}