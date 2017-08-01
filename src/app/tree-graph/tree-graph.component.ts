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

import { NodeD3 } from './elements/node';
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

    @Input() data: Object;

    @Output() node_select = new EventEmitter();
    @Output() link_select = new EventEmitter();

    @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<any>;

    dims: any;
    domain: any;
    transform: any;
    colors: ColorHelper;
    tree_graph: any;
    svg: any;
    size: number[];
    root: hierarchy;
    margin = [10, 10, 10, 10];
    padding = {
        'top': 30,
        'bottom': 30,
        'left': 30,
        'right': 30
    }
    @Input() nodes: NodeD3[] = [];
    @Input() links: Link[] = [];
    kinds = ['simple', 'proportional'];
    kind: string = 'simple';
    step = 120;
    duration = 750;
    text_position = [-1.1, 0.36]
    width = 1200;
    height = 800;
    draw: boolean = false;
    default_radius: number = 10;
    i = 0;
    idn = 4;
    node_id_list = new Map();
    // lolo = new Node();//https://developer.mozilla.org/es/docs/Web/API/Node
    // Obtain a list from a to b


    leaves: number = 0;
    levels: number = 0;

    step_x: number = 0;
    step_y: number = 0;

    list_levels = []

    getSizeTree(tree) {
        this.leaves = tree.leaves().length
        this.levels = tree.height

        return [this.levels, this.leaves]
    }

    setSteps(tree) {
        var levels = 1;
        var leaves = 1;
        [levels, leaves] = this.getSizeTree(tree)
        console.log("Size on setteps")
        console.log([levels, leaves])
        console.log("[w,h]")
        console.log([this.width, this.height])
        var disp_height = this.height - this.padding['top'] - this.padding['bottom']
        var disp_width = this.width - this.padding['right'] - this.padding['left']
        var step_x: number = 0;
        var step_y: number = 0;
        if (leaves > 0) {
            step_y = disp_height / leaves
        }
        else {
            step_y = disp_height
        }
        if (levels > 0) {
            step_x = disp_width / levels
        }
        else {
            step_x = disp_width

        }

        console.log("Steps obtained")
        console.log([step_x, step_y])
        return [step_x, step_y]
    }

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
        // hierarchy(data, children)
        var root = hierarchy(data, function(d) { return d.children; });
        //root.x0 = this.padding.left
        //root.y0 = this.height / 2
        console.log("Root hierarchy")
        console.log(root)
        var name = root.data.name
        root.name = name
        root.children.forEach(d => this.collapse(d))
        return root
    }


    getRadius(kind, radius: number, depth: number) {
        console.log("Kind")
        console.log(kind)
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
        else {
            return this.default_radius
        }
    }

    // get position 0  and 1

    getPositionList(source: NodeD3, final: NodeD3) {
        console.log("Source")
        console.log(source)
        console.log("Final")
        console.log(final)
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

        var source = node.getSource()

        // check children groups
        if (source.children) {
            source._children = source.children;
            source.children = null;
        } else {
            source.children = source._children;
            source._children = null;
        }
        node.switchOpen()
        this.draw_update(source);
        // set transitio movement
        container.transition().duration(this.duration)
        if (node.children) {
            node.children.forEach(ch_node => {
                node.setTransform(
                    "translate(" + ch_node.x + "," + ch_node.y + ")"
                )
            })
        } else {
            node.setTransform(
                "translate(" + node.prev_x + "," + node.prev_y + ")"
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
        super.update();
        this.draw_tree();
        this.setColors();
    }

    draw_tree() {
        console.log("Selecting svg")
        this.svg = select('svg')

        this.width = 1000
        this.height = 800

        this.dims = calculateViewDimensions({
            width: this.width,
            height: this.height,
            margins: this.margin
        });

        console.log("Creating tree")

        console.log(this.dims)

        this.tree_graph = tree()
            .size([this.dims.width * .8, this.dims.height * 0.8]);


        // define tree data:

        console.log("Tree graph init")
        console.log(this.tree_graph)

        // added x0 and y0 

        var root = this.data2tree(this.data)

        console.log("Parse root to tree graph")

        console.log("Root")
        console.log(root)

        var source = this.tree_graph(root);

        console.log("Source ok")
        console.log(source)


        var a, b

        [a, b] = this.setSteps(source)

        source.block_start = this.padding.top
        source.block_before = 0//this.padding.top

        console.log("Steps defined")
        this.step_x = a
        this.step_y = b
        console.log([this.step_x, this.step_y])

        source.id = this.node_idm(this.idn)

        this.draw_update(source)


    }

    addNode2List(source, element) {
        var step = this.step
        var idm: string
        if (!element.id) {
            idm = this.node_idm(this.idn)
        }
        else {
            idm = element.id
        }

        var node = new NodeD3(idm)
        var nleaves = element.leaves().length
        node.setSource(element)
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
        console.log("Leaves:levels")
        console.log(this.leaves, this.levels)
        var ns = source.leaves().length
        var nr = ns - element.leaves().length

        console.log("block start")
        console.log(element.block_start)
        console.log("this.step_y")
        console.log(this.step_y)
        console.log("leaves")
        console.log(element.leaves().length)

        var node_position: Position = {
            x: this.padding.right + this.step_x * element.depth,
            y: element.block_start + this.step_y * element.leaves().length / 2
        }
        console.log("Node Position:")
        console.log(node.id)
        console.log(node_position)
        console.log("Block")
        console.log(element.block_start)
        node.setNodePosition(node_position)
        //transform
        //node.setTransform("translate(" + source.x0 + "," + source.y0 + ")")
        node.switchOpen()
        this.nodes.push(node)
        return node
    }

    makeid(n: number) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < n; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    node_idm(n: number) {
        var idm = this.makeid(n)
        while (this.node_id_list.has(idm)) {
            idm = this.makeid(n)
        }
        return idm
    }

    draw_update(source) {

        // update parent component chart

        // generate nodes

        // decendants return an array

        var i = 0
        var block_start = source.block_start
        var block_before = source.block_before

        console.log("Datawork")
        console.log(source)
        console.log(source.descendants())

        // extract the source node and children in an array
        var descendants = source.descendants()

        descendants.slice(1, descendants.length).forEach(element => {

            // reference to parent block

            element.block_start = block_start // where start to positionate the blocks


            // reference to first brother on list positionated

            element.block_before = block_before
            block_before = block_before + element.leaves().length * this.step_y

            if (i == 0) {
                block_start = block_start + block_before
            }
            else {
                block_start = block_before
            }

            element.position = ++i;

        })

        console.log("QUe paso?")

        descendants.forEach(
            element => {
                console.log("Element")
                console.log(element)
                var node = this.addNode2List(source, element)
                console.log("Source")
                console.log(source)
                console.log("Node")
                console.log(node)
                if (!(source == element)) {
                    var p0p1 = this.getPositionList(source, element)
                    console.log("Position P0 and P1")
                    console.log(p0p1)
                    var link_id = `${source.id}-${node.id}`
                    var link = new Link(link_id, p0p1)
                    this.links.push(link)
                    console.log("Setup ok nodes and links")
                    console.log(this.nodes)
                    console.log(this.links)
                }
            })
        console.log("Drawing tree")
        this.draw = true

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

    range(a, b) {
        var result = []
        for (var i = a; i <= b; i++) {
            result.push(i)
        }
        return result
    }

    nlist(n) {
        var a, b
        if (n % 2 == 0) {
            a = -n / 2
            b = n - 1
        }
        else {
            var limit = Math.floor(n / 2)
            a = -limit
            b = limit
        }

        return this.range(a, b)
    }

}
