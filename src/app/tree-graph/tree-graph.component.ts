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

// import elements from tree

import { Node } from './elements/node';
import { Link } from './elements/link';
import { Position } from './elements/position';
//

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
    @Input() nodes: Node[] = [];
    @Input() last_nodes: Node[] = [];
    @Input() links: Link[] = [];
    kinds = ['simple', 'proportional'];
    kind: string;
    step = 120;

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


    getRadius(kind, radius: number, depth: number) {
        if (kind in this.kinds) {
            if (kind == 'simple') {
                return radius
            }
            else if (kind = 'proportional') {
                if (depth > 0) {
                    return radius / depth
                }
                else {
                    return radius
                }
            }
        }
    }

    // Toggle children on click.
    onNodeClick(d) {
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

        // update parent component chart
        super.update();

        this.kind = 'simple'

        var i = 0;
        var duration = 750;

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

        this.data.descendants().forEach(
            element => {
                var step = this.step
                var node = new Node(element.id)
                node.setRadius(this.getRadius(this.kind, this.radius, element.depth))
                var text_position: Position = {
                    x: element.children || element._children ? -1.1 : 1.1,
                    y: 0.36
                }
                node.setTextPosition(text_position)
                node.setNodeName(element.data.name)
                node.setStyle(element._children ? "lightsteelblue" : "#fff")
                node.setDepth(element.depth)
                node.setHeight(element.height)
                node.setTextAnchor(
                    element.children || element._children ? 'end' : 'start')
                //position
                var node_position: Position = {
                    x: element.x,
                    y: element.depth * step
                }
                node.setNodePosition(node_position)
                //transform
                node.setTransform("translate(" + source.y0 + "," + source.x0 + ")")
                this.nodes.push(node)
            })
        //foreach push to nodes


        // get next 1 data node
        this.data.slice(1).forEach(
            element => {
                var step = this.step
                var node = new Node(element.id)
                node.setRadius(this.getRadius(this.kind, this.radius, element.depth))
                var text_position: Position = {
                    x: element.children || element._children ? -1.1 : 1.1,
                    y: 0.36
                }
                node.setTextPosition(text_position)
                node.setNodeName(element.data.name)
                node.setStyle(element._children ? "lightsteelblue" : "#fff")
                node.setDepth(element.depth)
                node.setHeight(element.height)
                node.setTextAnchor(
                    element.children || element._children ? 'end' : 'start')
                //position
                var node_position: Position = {
                    x: element.x,
                    y: element.depth * step
                }
                node.setNodePosition(node_position)
                //transform
                node.setTransform("translate(" + source.y0 + "," + source.x0 + ")")
                this.last_nodes.push(node)
            })

        // Normalize fixed deep
        // added typeof element


        //  set transition --> TOD angular transition

        // Si selecciono un node, si tiene hijos ocultos, angular obtiene el id
        // se crean nuevos nodos y se dibujan sobre el panel
        // al obtener id, se rescata el Node de la lista y se obtiene position source
        // se genera una animación translate de source a destiny

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
