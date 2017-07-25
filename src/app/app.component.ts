import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Location, LocationStrategy, HashLocationStrategy } from '@angular/common';
import * as shape from 'd3-shape';
import * as d3 from 'd3';

import { tree_example } from './data'

@Component({
    selector: 'app-root',
    providers: [Location, { provide: LocationStrategy, useClass: HashLocationStrategy }],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
    title = 'Tree Graph Component';
    chart_name: string = 'ngx-charts-tree-graph';
    chart: any;
    chartGroups = [
        {
            name: 'Tree Graph',
            charts: [
                {
                    name: 'Tree Graph Simple',
                    selector: 'ngx-charts-tree-graph',
                    options: [],
                    defaults: {}
                }
            ]
        },
    ]

    constructor(public location: Location) {
        // load data to principal component
        Object.assign(this, { tree_example })

    }

    ngOnInit() {
        this.location.replaceState(this.chart_name)

        for (const group of this.chartGroups) {
            this.chart = group.charts.find(x => x.selector === this.chart_name)
        }

        // Copy all properties to destiny:

        Object.assign(this, this.chart.defaults)

        setInterval(this.updateData.bind(this), 1000)

    }

    updateData() {
        return {}
    }


}
