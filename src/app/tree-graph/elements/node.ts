import { Position } from './position'

interface NodeInterface {
    id: string,
    radius: number,
    cursor: string,
    style: string,
    depth: number,
    height: number,
    name: string,
    x: number;
    y: number;
    prev_x: number;
    prev_y: number;
    transform?: string;
    source: Node;
    open: boolean;
    text?: {
        anchor: string,
        x: number,
        y: number,
        style?: string;
    }

}

export class NodeD3 implements NodeInterface {
    id: string;
    radius: number;
    cursor: string;
    style: string;
    depth: number;
    height: number;
    name: string;
    x: number;
    y: number;
    prev_x: number;
    prev_y: number;
    transform?: string;
    source: Node;
    open: boolean;
    text?: {
        anchor: string,
        x: number,
        y: number,
        style?: string;
    }

    constructor(id: string) {
        this.id = id;
        this.radius = 1e-6;
        this.cursor = "pointer";
        this.style = "";
        this.depth = 1;
        this.x = 0;
        this.y = 0
        this.open = false;
        this.text = {
            anchor: "end",
            x: -1.1,
            y: 0.36,
        }
        //Object.assign(this.source, { x: 0, y: 0 })
    }

    setRadius(value: number) {
        console.log("Radius set to")
        console.log(value)
        this.radius = value;
    }

    setNodePosition(p: Position) {
        this.x = p.x
        this.y = p.y
        Object.assign(this.source,
            {
                x: p.x,
                y: p.y
            }
        )
    }

    setTextPosition(p: Position) {
        console.log("Text position")
        this.text.x = p.x;
        this.text.y = p.y;
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

    setTextStyle(value: string) {
        this.text.style = value
    }

    switchOpen() {
        if (this.open) {
            this.open = false
        }
        else {
            this.open = true
        }
    }

    setSource(source: Node) {
        this.source = source
    }

    getSource() {
        return this.source
    }
}
