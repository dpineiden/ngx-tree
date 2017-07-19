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
        var path = null
        if (p1) {
            path = `M ${p0.y} ${p0.x}
            C ${(p0.y + p1.y) / 2} ${p0.x},
              ${(p0.y + p1.y) / 2} ${p1.x},
              ${p1.y} ${p1.x}`
        }
        return path
    }

    setStroke(value: string) {
        this.stroke = value;
    }

    setFill(value: string) {
        this.fill = value;
    }

}
