class NewsQuery {
  constructor(query, year, month, update) {
    this.response = null;

    let beginMonth = month || 0;
    let begin = new Date(year, beginMonth, 1);

    // `new Date(year, month, day)` interprets day 0 of next month as the last day of this month
    let endMonthPlus1 = month ? month + 1 : 12;
    let end = new Date(year, endMonthPlus1, 0);

    // YYYY-MM-DDT... -> YYYYMMDD
    function format(date) {
      return date.toISOString().split('T')[0].replace(/-/g, '');
    }

    let proxy = observe(this, update);

    $.ajax({
      url: 'https://api.nytimes.com/svc/search/v2/articlesearch.json',
      data: {
        'api-key': '33d24445c695491bb4645a00e949c71f',
        'q': query,
        'fq': 'news_desk:("Business" "Business Day" "Financial" "Your Money" )',
        'begin_date': format(begin),
        'end_date': format(end),
        'fl': "headline,snippet,web_url,pub_date,news_desk"
      }
    }).always(receiveAt(proxy, 'response'));

    return proxy;
  }

  get success() {
    return this.response && this.response.statusText === 'OK';
  }

  get articles() {
    if (this.success) {
      let articles = this.response.responseJSON.response.docs.map(doc => Object({
        headline: doc.headline.main,
        snippet: doc.snippet,
        url: doc.web_url,
        date: doc.pub_date
      }));

      memoize(this, { articles });
      return articles;
    } else return null;
  }
}