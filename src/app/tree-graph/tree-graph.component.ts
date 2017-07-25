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
import { select } from 'd3';

//import { BaseChartComponent } from '../common/base-chart.component';

import { BaseChartComponent } from '@swimlane/ngx-charts'
import { calculateViewDimensions } from '@swimlane/ngx-charts';
import { ColorHelper } from '@swimlane/ngx-charts';

// import elements from tree

import { Node } from './elements/node';
import { Link } from './elements/link';
import { Position } from './elements/position';


@Component({
    selector: 'ngx-charts-tree-graph',
    templateUrl: './templates/tree-graph.component.html',
    styleUrls: ['./static/css/tree-graph.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeGraphComponent extends BaseChartComponent {

    @Input() results;
    @Input() tooltipDisabled: boolean = false;
    @Input() valueFormatting: any;
    @Input() labelFormatting: any;
    @Input() gradient: boolean = false;
    @Input() radius: number = 10;

    @Output() node_select = new EventEmitter();
    @Output() link_select = new EventEmitter();

    @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<any>;
    data = {
        'children': [
            {
                'children':
                [
                    {
                        'children': ['g'],
                        'name': 'f'
                    },
                    {
                        'children': [],
                        'name': 'h'
                    }],
                'name': 'e'
            },
            {
                'children':
                [
                    {
                        'children':
                        [
                            {
                                'children':
                                [
                                    {
                                        'children': [],
                                        'name': 'l'
                                    },
                                    {
                                        'children': [],
                                        'name': 'm'
                                    }],
                                'name': 'k'
                            }], 'name': 'j'
                    }
                ],
                'name': 'i'
            },
            {
                'children':
                [
                    {
                        'children':
                        [
                            {
                                'children': [],
                                'name': 'c'
                            },
                            {
                                'children': [],
                                'name': 'd'
                            }
                        ],
                        'name': 'b'
                    }
                ],
                'name': 'a'
            }
        ],
        'name': 'PIGRO'
    }


    dims: any;
    domain: any;
    transform: any;
    colors: ColorHelper;
    tree_graph: any;
    svg: any;
    root: hierarchy;
    margin = [10, 10, 10, 10];
    @Input() nodes: Node[] = [];
    @Input() links: Link[] = [];
    kinds = ['simple', 'proportional'];
    kind: string;
    step = 120;
    duration = 750;
    text_position = [-1.1, 0.36]
    width = 800;
    height = 400;

    collapse(d) {
        console.log("Collapse")
        console.log(d)
        if ('children' in d) {
            if (d.children.length > 0) {
                console.log("Inside collapse")
                d._children = d.children
                d._children.forEach(d => this.collapse(d))
                d.children = null
            }
        }
        console.log("D collapsed")
        console.log(d)
    }

    data2tree(data) {
        var root = hierarchy(data, function(d) { return d.children; });
        root.x0 = this.height / 2
        root.y0 = 0
        console.log("Root hierarchy")
        console.log(root)
        root.children.forEach(d => this.collapse(d))
        return root
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

    // get position 0  and 1

    getPositionList(source: Node, final: Node) {
        var p0: Position = {
            x: source.x,
            y: source.y
        }
        var p1: Position = {
            x: final.x,
            y: final.y
        }
        return [p0, p1]
    }



    // Toggle children on click.
    onNodeClick(node) {
        // select transition movement duration by css id
        var container = select(".node #" + node.id)

        // check children groups
        if (node.children) {
            node._children = node.children;
            node.children = null;
        } else {
            node.children = node._children;
            node._children = null;
        }
        node.switchOpen()
        this.draw_update(node);
        // set transitio movement
        container.transition().duration(this.duration)
        if (node.children) {
            node.children.forEach(ch_node => {
                node.setTransform(
                    "translate(" + ch_node.y + "," + ch_node.x + ")"
                )
            })
        } else {
            node.setTransform(
                "translate(" + node.prev_y + "," + node.prev_x + ")"
            )
            node.setRadius(1e-6)
            node.setStyle(1e-6)
        }
    }

    onLinkClick(link) {
        console.log(link)
    }

    setKind(kind: string) {
        if (kind in this.kinds) {
            this.kind = kind
        }
    }

    styleNodeId(node) {
        return node.id
    }


    update(): void {
        super.update()
        this.draw_tree();
        this.setColors();
    }

    draw_tree() {
        console.log("Selecting svg")
        this.svg = select('svg')

        this.dims = calculateViewDimensions({
            width: this.width,
            height: this.height,
            margins: this.margin
        });

        console.log("Creating tree")

        console.log(this.dims)

        this.tree_graph = tree()
            .size([this.dims.width, this.dims.height]);


        // define tree data:

        console.log("Tree graph init")
        console.log(this.tree_graph)

        var root = this.data2tree(this.data)

        console.log("Parse root to tree graph")

        console.log("Root")
        console.log(root)

        var source = this.tree_graph(root);

        console.log("Source ok")
        console.log(source)

        this.draw_update(source)
    }

    draw_update(source) {

        // update parent component chart

        var i = 0;

        // generate nodes

        // decendants return an array

        console.log("Datawork")
        console.log(source.descendants())

        console.log("QUe paso?")

        source.descendants().forEach(
            element => {
                console.log("Element")
                console.log(element)
                var step = this.step
                var node = new Node(element.id)
                node.setRadius(this.getRadius(this.kind, this.radius, element.depth))
                console.log(node)
                var text_position: Position = {
                    x: element.children || element._children ?
                        -(this.text_position[0]) : this.text_position[1],
                    y: this.text_position[1]
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
                node.setChildren(element)
                node.setTransform("translate(" + source.y0 + "," + source.x0 + ")")
                node.switchOpen()
                this.nodes.push(node)
                var p0p1 = this.getPositionList(source, element)
                var link_id = "${source.id}-${node.id}"
                var link = new Link(link_id, p0p1)
                this.links.push(link)
                console.log("Setup ok nodes and links")
                console.log(this.nodes)
                console.log(this.links)
            })
        console.log("Drawing tree")


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
