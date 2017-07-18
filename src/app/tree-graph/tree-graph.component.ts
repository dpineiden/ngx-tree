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
    nodes = [];
    links = [];

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



    diagonal(s, d) {
        var path = null
        if (d) {
            path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`
        }
        return path
    }

    // Toggle children on click.
    click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        this.update();
    }

    update(): void {

        var i = 0;
        var duration = 750;

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

        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 10)
            .style('fill', function(d) {
                return d._children ? "lightsteelblue" : "#fff"
            });

        // put label on every node

        nodeEnter.append('text')
            .attr('dy', '.35m')
            .attr('x', function(d) {
                return d.children || d._children ? -13 : 13;
            })
            .attr('text-anchor', function(d) {
                return d.children || d._children ? 'end' : 'start'
            })
            .text(function(d) { return d.data.name })


        //  set transition --> TOD angular transition

        var nodeUpdate = nodeEnter.merge(node)

        // set transition
        nodeUpdate.transition()
            .duration(duration)
            .attr('transform', function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            })

        nodeUpdate.select('circle.node')
            .attr('r', 10)
            .attr('fill', function(d) {
                return d._children ? 'lightsteelblue' : "#fff";
            })
            .attr('cursor', 'pointer')

        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr('transform', function(d) {
                return "translate(" + source.y + "," + source.x + ")"
            })
            .remove()

        nodeExit.select('circle')
            .attr('r', 1e-6)

        nodeExit.select('text')
            .style('fill-opacity', 1e-6)

        // Update the links

        var link = this.svg.selectAll('path.link')
            .data(this.links, function(d) { return d.id });


        // Enter any new links at the parent's previous position




        var linkEnter = link.enter().insert('path', 'g')
            .attr('class', 'link')
            .attr('d', function(d) {
                var o = { x: source.x0, y: source.y0 }
                return this.diagonal(o, o)
            })

        // Update

        var linkUpdate = linkEnter.merge(link)

        // Transition back to the parent element position

        linkUpdate.transtion()
            .duration(duration)
            .attr('d', function(d) { return this.diagonal(d, d.parent) })

        // Remove exiting links

        var linkExit = link.exit().transition()
            .duration()
            .attr('d', function(d) {
                var o = { x: source.x, y: source.y }
                return this.diagonal(o, o)
            })
            .remove();

        this.nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        })


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
