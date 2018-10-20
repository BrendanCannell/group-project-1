function getMetadata(code) {
  return $.ajax({
    method: 'GET',
    url: 'https://www.quandl.com/api/v3/datasets/' + code + '/metadata.json?api_key=UgyTCPiRsSybMnmGJJKA'
  }).done(console.log);
}

function plotTimeseries(code, valName = "Value", valIndex = 1) {
  $.ajax({
    method: 'GET',
    url: 'https://www.quandl.com/api/v3/datasets/' + code + '/data.json?api_key=UgyTCPiRsSybMnmGJJKA'
  })
  .done(response => {
    let dates = response.dataset_data.data.map(datum => datum[0]);
    let values = response.dataset_data.data.map(datum => datum[valIndex]);

    let chart = c3.generate({
      bindto: '#chart',
      data: {
        x: 'date',
        columns: [
          ['date', ...dates],
          [valName, ...values]
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
  })
}