import { Position } from './position'

interface NodeInterface {
    id: number,
    radius: number,
    cursor: string,
    style: string,
    depth: number,
    height: number,
    name: string,
    x: number;
    y: number;
    transform?: string;
    children: Object;
    _children: Object;
    text?: {
        anchor: string,
        x: string,
        y: string,
    }
}

export class Node implements NodeInterface {
    id: number;
    radius: number;
    cursor: string;
    style: string;
    depth: number;
    height: number;
    name: string;
    x: number;
    y: number;
    transform?: string;
    children: Object;
    _children: Object;
    text?: {
        anchor: string,
        x: string,
        y: string,
    }
    constructor(id: number) {
        this.id = id;
        this.radius = 1e-6;
        this.cursor = "pointer";
        this.style = "";
        this.depth = 1;
        this.text.anchor = "end";
        this.text.x = "-1.1em";
        this.text.y = "0.36em";
    }

    setRadius(value: number) {
        this.radius = value;
    }

    setNodePosition(p: Position) {
        this.x = p.x
        this.y = p.y
    }

    setTextPosition(p: Position) {
        this.text.x = "${p.x}em";
        this.text.y = "${p.y}em";
    }

    setTextAnchor(value: string) {
        this.text.anchor = value;
    }

    setNodeName(value: string) {
        this.name = value;
    }

    setCursor(value: string) {
        this.cursor = value
    }

    setStyle(value: string) {
        this.style = value
    }

    setDepth(value: number) {
        this.depth = value
    }

    setHeight(value: number) {
        this.height = value
    }

    setTransform(value: string) {
        this.transform = value
    }
}
