import {Component, OnInit} from "angular2/core";
import {StatsService} from "../../services/stats.service";

var Chart = require('chart.js/Chart');
var JQuery = require('jquery');
var _ = require('lodash');
var moment = require('moment');

@Component({
  selector: 'charts',
  template: require('./charts.html'),
  styles: [require('./charts.scss')],
  providers: [],
  directives: [],
  pipes: []
})
export class Charts implements OnInit {

  constructor(private statsService:StatsService) {
    // Do stuff
  }

  ngOnInit() {
    console.log('Hello Charts');

    this.statsService.getStats().then(function (res) {
      console.log(res);

      var data = [];
      var labels = [];
      _.forEach(res, function (item) {
        data.push(item.junit.tests);
        labels.push(moment(item.createdAt).format('YYYY-MM-DD hh:mm'));
      });

      var sharpLineData = {
        labels: labels,
        datasets: [{
          label: "Tests",
          fillColor: "rgba(77, 137, 8, 0.5)",
          strokeColor: "rgba(77, 137, 8, 0.7)",
          pointColor: "rgba(77, 137, 8, 1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(98,203,49,1)",
          data: data
        }]
      };

      var sharpLineOptions = {
        scaleShowGridLines: true,
        scaleGridLineColor: "rgba(0,0,0,.05)",
        scaleGridLineWidth: 1,
        bezierCurve: true,
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
    }).catch(function (err) {
      console.error(err);
    });

  }
}
