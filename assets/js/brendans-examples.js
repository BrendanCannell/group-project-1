/*

  This was used after including these external resources in the HTML.

  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
    crossorigin="anonymous"></script>

  <link href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.6.8/c3.min.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/c3/0.6.8/c3.min.js"></script>

 */

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