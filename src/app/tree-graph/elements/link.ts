import { Position } from './position'

interface LinkInterface {
    id: string,
    d: string,
    stroke?: string,
    fill?: string,
}

export class Link implements LinkInterface {
    id: string;
    d: string;
    fill?: string;
    stroke?: string;

    constructor(id: string, p: Position[]) {
        this.id = id;
        this.stroke = "black";
        this.fill = "transparent";
        this.d = this.createLink(p[0], p[1])
    }

    createLink(p0: Position, p1: Position) {
        console.log("Input")
        console.log([p0, p1])
        var path = null
        var b0 = p0.x + (p1.x - p0.x) / 2
        var b1 = p0.y
        var v0 = p1.x - (p1.x - p0.x) / 2
        var v1 = p1.y
        if (p1) {
            path = `M ${p0.x} ${p0.y}
                    C ${b0} ${b1},
                    ${v0} ${v1},
                    ${p1.x} ${p1.y}`
        }
        console.log(path)
        return path
    }

    setStroke(value: string) {
        this.stroke = value;
    }

    setFill(value: string) {
        this.fill = value;
    }

}
