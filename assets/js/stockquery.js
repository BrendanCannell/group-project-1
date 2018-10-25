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