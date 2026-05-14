var options = {
    series: [{
    name: 'Premium cars',
    type: 'column',
    data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160]
  }, {
    name: 'Car services',
    type: 'line',
    data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16]
  }],
    chart: {
    height: 350,
    type: 'line',
  },
  stroke: {
    width: [0, 4]
  },
  title: {
    text: 'Monthly bookings'
  },
  dataLabels: {
    enabled: true,
    enabledOnSeries: [1]
  },
  labels: ['01 Jan 2025', '02 Jan 2025', '03 Jan 2025', '04 Jan 2025', '05 Jan 2025', '06 Jan 2025', '07 Jan 2025', '08 Jan 2025', '09 Jan 2025', '10 Jan 2025', '11 Jan 2025', '12 Jan 2025'],
  yaxis: [{
    title: {
      text: 'Premium cars',
    },
  
  }, {
    opposite: true,
    title: {
      text: 'Car services'
    }
  }]
  };

  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();