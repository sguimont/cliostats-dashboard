import {Component, OnInit} from "angular2/core";

var Chart = require('chart.js/Chart');
var JQuery = require('jquery');

@Component({
  selector: 'charts',
  template: require('./charts.html'),
  styles: [require('./charts.scss')],
  providers: [],
  directives: [],
  pipes: []
})
export class Charts implements OnInit {

  constructor() {
    // Do stuff
  }

  ngOnInit() {
    console.log('Hello Charts');

    var sharpLineData = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
        {
          label: "Example dataset",
          fillColor: "rgba(77, 137, 8, 0.5)",
          strokeColor: "rgba(77, 137, 8, 0.7)",
          pointColor: "rgba(77, 137, 8, 1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(98,203,49,1)",
          data: [33, 48, 40, 19, 54, 27, 54]
        }
      ]
    };

    var sharpLineOptions = {
      scaleShowGridLines: true,
      scaleGridLineColor: "rgba(0,0,0,.05)",
      scaleGridLineWidth: 1,
      bezierCurve: false,
      pointDot: true,
      pointDotRadius: 4,
      pointDotStrokeWidth: 1,
      pointHitDetectionRadius: 20,
      datasetStroke: true,
      datasetStrokeWidth: 1,
      datasetFill: true,
      responsive: true
    };

    var element:any = document.getElementById("sharpLineOptions");
    var ctx = element.getContext("2d");
    var newChart = new Chart(ctx).Line(sharpLineData, sharpLineOptions);

    JQuery(window).bind("resize", function () {
      setTimeout(function () {
        newChart.resize(newChart.render, true);
      }, 50);
    });
  }
}
