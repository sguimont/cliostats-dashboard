// Polyfills
// fixes for non ES6 browsers (IE, safari, ...)
import "es6-shim/es6-shim.js";
import "./shims/shims_for_IE.js";
import "angular2/bundles/angular2-polyfills.js";
import "angular2/platform/browser";
import "angular2/platform/common_dom";
import "angular2/core";
import "angular2/router";
import "angular2/http";
import "rxjs";
// todo remove once https://github.com/angular/angular/issues/6501 is fixed.

// Angular 2

// RxJS

require('bootstrap/dist/css/bootstrap.min.css');
require('imports?jQuery=jquery!bootstrap/dist/js/bootstrap.min');

require('imports?jQuery=jquery!jquery-slimscroll/jquery.slimscroll');

require('animate.css/animate.min.css');
require('font-awesome/css/font-awesome.min.css');

require('metismenu/dist/metisMenu');
require('metismenu/dist/metisMenu.css');
