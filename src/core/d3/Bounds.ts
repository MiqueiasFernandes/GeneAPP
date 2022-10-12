// export class Margin {
//     top: number = 0;
//     right: number = 0;
//     bottom: number = 0;
//     left: number = 0;

//     constructor(top = 0, right = 0, bottom = 0, left = 0) {
//         this.top = top;
//         this.right = right;
//         this.bottom = bottom;
//         this.left = left;
//     }
// }

export class Bounds {

    x: number;
    y: number;
    margin: any; ///Margin;
    width: number;
    height: number;
    total_with: number;
    total_height: number;
    r: number;
    d: number;

    constructor(w: number, h: number, x: number = 0, y: number = 0, margin = {}) {
        this.x = x;
        this.y = y;
        this.margin = margin;
        this.width =0;// w - margin.left - margin.right;
        this.height = 0//h - margin.top - margin.bottom;
        this.total_with = w;
        this.total_height = h;
        this.r = x + this.width;
        this.d = y + this.height;
    }

    down(pts: number) {
        return new Bounds(this.width, this.height, this.x, this.y + pts)
    }

    up(pts: number) {
        return new Bounds(this.width, this.height, this.x, this.y - pts)
    }

    left(pts: number) {
        return new Bounds(this.width, this.height, this.x + pts, this.y)
    }

    withX(x: number) {
        return new Bounds(this.width, this.height, x, this.y)
    }

    withHeight(h: number) {
        return new Bounds(this.width, h, this.x, this.y)
    }

    withWidth(w: number) {
        return new Bounds(w, this.height, this.x, this.y)
    }

    scaleX(_a1: number, _a2: number, _b1: number, _b2: number) {
        const a1 = Math.min(_a1, _a2)
        const a2 = Math.max(_a1, _a2)
        const b1 = Math.min(_b1, _b2)
        const b2 = Math.max(_b1, _b2)
        const my_w = 1 + a2 - a1
        const o_w = 1 + b2 - b1
        const rel = this.width / my_w
        return new Bounds(o_w * rel, this.height, this.x + (b1 - a1) * rel, this.y)
    }

    mv() {
        return this.y + this.height / 2;
    }

    mh() {
        return this.x + this.width / 2;
    }

    toString() {
        const margin = this.margin;
        const m = `[^${margin.top} >${margin.right} v${margin.bottom} <${margin.left}]`
        return `x: ${this.x} y: ${this.y} w: ${this.width} h: ${this.height} ${m}`
    }
}