import {Component} from "angular2/core";
import {RouteConfig, ROUTER_DIRECTIVES} from "angular2/router";
import {FORM_PROVIDERS} from "angular2/common";
import {Api} from "./services/api/api";
import {Home} from "./components/home/home";
import {About} from "./components/about/about";
import "../style/app.scss";

var JQuery = require('jquery');

@Component({
    selector: 'app',
    providers: [...FORM_PROVIDERS, Api],
    directives: [...ROUTER_DIRECTIVES],
    pipes: [],
    styles: [require('./app.scss')],
    template: require('./app.html')
})
@RouteConfig([
    {path: '/', component: Home, name: 'Home'},
    {path: '/About', component: About, name: 'About'}
])
export class App {
    url:string = 'https://github.com/sguimont/node-cliostats';

    constructor(public api:Api) {
    }

    fixWrapperHeight() {
        var headerH = 62;
        var navigationH = JQuery("#navigation").height();
        var contentH = JQuery(".content").height();

        // Set new height when contnet height is less then navigation
        if (contentH < navigationH) {
            JQuery("#wrapper").css("min-height", navigationH + 'px');
        }

        // Set new height when contnet height is less then navigation and navigation is less then window
        if (contentH < navigationH && navigationH < JQuery(window).height()) {
            JQuery("#wrapper").css("min-height", JQuery(window).height() - headerH + 'px');
        }

        // Set new height when contnet is higher then navigation but less then window
        if (contentH > navigationH && contentH < JQuery(window).height()) {
            JQuery("#wrapper").css("min-height", JQuery(window).height() - headerH + 'px');
        }
    }

    setBodySmall() {
        if (JQuery(window).width() < 769) {
            JQuery('body').addClass('page-small');
        } else {
            JQuery('body').removeClass('page-small');
            JQuery('body').removeClass('show-sidebar');
        }
    }

    ngOnInit() {
        JQuery.fn['animatePanel'] = function () {

            var element = JQuery(this);
            var effect = JQuery(this).data('effect');
            var delay = JQuery(this).data('delay');
            var child = JQuery(this).data('child');

            // Set default values for attrs
            if (!effect) {
                effect = 'zoomIn';
            }
            if (!delay) {
                delay = 0.06;
            } else {
                delay = delay / 10;
            }
            if (!child) {
                child = '.row > div';
            } else {
                child = "." + child;
            }

            //Set defaul values for start animation and delay
            var startAnimation = 0;
            var start = Math.abs(delay) + startAnimation;

            // Get all visible element and set opacity to 0
            var panel = element.find(child);
            panel.addClass('opacity-0');

            // Get all elements and add effect class
            panel = element.find(child);
            panel.addClass('stagger').addClass('animated-panel').addClass(effect);

            var panelsCount = panel.length + 10;
            var animateTime = (panelsCount * delay * 10000) / 10;

            // Add delay for each child elements
            panel.each(function (i, elm) {
                start += delay;
                var rounded = Math.round(start * 10) / 10;
                JQuery(elm).css('animation-delay', rounded + 's');
                // Remove opacity 0 after finish
                JQuery(elm).removeClass('opacity-0');
            });

            // Clear animation after finish
            setTimeout(function () {
                JQuery('.stagger').css('animation', '');
                JQuery('.stagger').removeClass(effect).removeClass('animated-panel').removeClass('stagger');
            }, animateTime);

        };

        this.setBodySmall();

        JQuery('.hide-menu').on('click', function (event) {
            event.preventDefault();
            if (JQuery(window).width() < 769) {
                JQuery("body").toggleClass("show-sidebar");
            } else {
                JQuery("body").toggleClass("hide-sidebar");
            }
        });

        // Initialize metsiMenu plugin to sidebar menu
        JQuery('#side-menu').metisMenu();

        // Initialize animate panel function
        JQuery('.animate-panel').animatePanel();

        // Function for collapse hpanel
        JQuery('.showhide').on('click', function (event) {
            event.preventDefault();
            var hpanel = JQuery(this).closest('div.hpanel');
            var icon = JQuery(this).find('i:first');
            var body = hpanel.find('div.panel-body');
            var footer = hpanel.find('div.panel-footer');
            body.slideToggle(300);
            footer.slideToggle(200);

            // Toggle icon from up to down
            icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
            hpanel.toggleClass('').toggleClass('panel-collapse');
            setTimeout(function () {
                hpanel.resize();
                hpanel.find('[id^=map-]').resize();
            }, 50);
        });

        // Function for close hpanel
        JQuery('.closebox').on('click', function (event) {
            event.preventDefault();
            var hpanel = JQuery(this).closest('div.hpanel');
            hpanel.remove();
            if (JQuery('body').hasClass('fullscreen-panel-mode')) {
                JQuery('body').removeClass('fullscreen-panel-mode');
            }
        });

        // Fullscreen for fullscreen hpanel
        JQuery('.fullscreen').on('click', function () {
            var hpanel = JQuery(this).closest('div.hpanel');
            var icon = JQuery(this).find('i:first');
            JQuery('body').toggleClass('fullscreen-panel-mode');
            icon.toggleClass('fa-expand').toggleClass('fa-compress');
            hpanel.toggleClass('fullscreen');
            setTimeout(function () {
                JQuery(window).trigger('resize');
            }, 100);
        });

        // Open close right sidebar
        JQuery('.right-sidebar-toggle').on('click', function () {
            JQuery('#right-sidebar').toggleClass('sidebar-open');
        });

        // Function for small header
        JQuery('.small-header-action').on('click', function (event) {
            event.preventDefault();
            var icon = JQuery(this).find('i:first');
            var breadcrumb = JQuery(this).parent().find('#hbreadcrumb');
            JQuery(this).parent().parent().parent().toggleClass('small-header');
            breadcrumb.toggleClass('m-t-lg');
            icon.toggleClass('fa-arrow-up').toggleClass('fa-arrow-down');
        });

        JQuery('.tooltip-demo').tooltip({
            selector: "[data-toggle=tooltip]"
        });

        // Initialize popover
        JQuery("[data-toggle=popover]").popover();

        // Move modal to body
        // Fix Bootstrap backdrop issu with animation.css
        JQuery('.modal').appendTo("body");

        JQuery(window).bind("load", function () {
            // Remove splash screen after load
            JQuery('.splash').css('display', 'none');
        });

        var _this = this;
        setTimeout(function () {
            _this.fixWrapperHeight();
        }, 300);

        JQuery(window).bind("resize click", function () {

            // Add special class to minimalize page elements when screen is less than 768px
            _this.setBodySmall();

            // Waint until metsiMenu, collapse and other effect finish and set wrapper height
            setTimeout(function () {
                _this.fixWrapperHeight();
            }, 300);
        });

    }
}
