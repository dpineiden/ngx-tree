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
    chart_name: string = 'tree-graph';
    chart: any;
    chartType: string
    chartGroups = [
        {
            name: 'Tree Graph',
            charts: [
                {
                    name: 'Tree Graph Simple',
                    selector: 'tree-graph',
                    options: [],
                    defaults: {}
                }
            ]
        },
    ]

    constructor(public location: Location) {
        // load data to principal component
        console.log("Constructor")
        Object.assign(this, { tree_example })

    }

    ngOnInit() {
        console.log("Init Componente App")
        this.location.replaceState(this.chart_name)

        console.log(this.chartGroups)

        for (const group of this.chartGroups) {
            this.chart = group.charts.find(x => x.selector === this.chart_name)
        }

        console.log("Chart defined")

        // Copy all properties to destiny:

        console.log(this.chart)

        Object.assign(this, this.chart.defaults)

        setInterval(this.updateData.bind(this), 1000)

        console.log("Assign chart's type")

        this.chartType = this.chart_name;

        console.log("Init ok")

    }

    updateData() {
        return {}
    }


}
