import {
    Component,
    EventEmitter,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ContentChild,
    TemplateRef,
    ElementRef,
    AfterViewInit
} from '@angular/core';

import { LocationStrategy } from '@angular/common';

import { Input } from '@angular/core';
import { Output } from '@angular/core';

import { tree, hierarchy } from 'd3-hierarchy';
import { select, source } from 'd3';

//import { BaseChartComponent } from '../common/base-chart.component';

import { BaseChartComponent } from '@swimlane/ngx-charts'
import { calculateViewDimensions } from '@swimlane/ngx-charts';
import { ColorHelper } from '@swimlane/ngx-charts';

@Component({
    selector: 'ngx-charts-tree-graph',
    templateUrl: './templates/tree-graph.component.html',
    styleUrls: ['./static/css/tree-graph.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeGraphComponent extends BaseChartComponent {

    @Input() results;
    @Input() tooltipDisabled: boolean = false;
    @Input() valueFormatting: any;
    @Input() labelFormatting: any;
    @Input() gradient: boolean = false;
    @Input() radius: number = 10;
    @Output() select = new EventEmitter();

    @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<any>;

    dims: any;
    domain: any;
    transform: any;
    colors: ColorHelper;
    tree_graph: any;
    data: any;
    svg: any;
    root: hierarchy;
    margin = [10, 10, 10, 10];
    nodes: []
    links: []

    collapse(d) {
        if (d.children) {
            d._children = d.children
            d._children.forEach(this.collapse)
            d.children = null
        }
    }

    data2tree(data) {
        this.root = hierarchy(data, function(d) { return d.chidren; });
        this.root.x0 = this.height / 2
        this.root.y0 = 0
        this.root.children.forEach(this.collapse)
        return this.root
    }


    update(): void {

        var i = 0;

        super.update();

        this.svg = select('svg')

        this.dims = calculateViewDimensions({
            width: this.width,
            height: this.height,
            margins: this.margin
        });


        this.tree_graph = tree<any>()
            .size([this.dims.width, this.dims.height]);


        // define tree data:

        this.data = this.tree_graph(this.root);

        // generate nodes

        // decendants return an array 
        this.nodes = this.data.descendants()

        // get next 1 data node
        this.links = this.data.slice(1)

        // Normalize fixed deep
        // added typeof element

        this.nodes.forEach(function(d: any) { d.y = d.depth * 180; })

        // Update the nodes:

        var node = this.svg.selectAll('g.node')
            .data(this.nodes, function(d) { return d.id || (d.id = ++i) })

        // enter new nodes at parten's previous position
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', function(d)
            { return "translate(" + source.y0 + "," + source.x0 + ")"; })
            .attr('r', this.radius)

        // put circle on every node



        this.setColors();

        this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;
    }

    getDomain(): any[] {
        return this.results.map(d => d.name);
    }

    onClick(data): void {
        this.select.emit(data);
    }

    setColors(): void {
        this.colors = new ColorHelper(this.scheme, 'ordinal', this.domain, this.customColors);
    }
}
