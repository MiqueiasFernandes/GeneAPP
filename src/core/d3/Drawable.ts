import * as d3 from "d3";
import { Conj } from "../utils/Conj";
import { Bounds } from "./Bounds";
//import * as toPng from 'save-svg-as-png'

export class Drawable {

    static used_patterns = [];
    static used_patterns_basic_color = {};
    static spectros = [[]];

    bounds: Bounds;
    bg: string;
    svg: any;
    drawable: Drawable;
    svg_id: string;

    constructor(
        drawable: Drawable, element: string, bounds: Bounds, bg: string = "#f8f9fa", id: string
    ) {
        this.bounds = bounds;
        this.bg = bg;
        if (drawable) {
            this.svg = id ? drawable.svg.append("g").attr("id", id) : drawable.svg;
            this.drawable = drawable;
            this.svg_id = drawable.svg_id
        } else {
            this.create(element);
        }
    }

    create(element: string) {
        this.drawable = this;
        this.svg = d3
            .select('#' + element)
            .append("svg")
            .attr('id', this.svg_id = (element + '_svg'))
            .style("background", 'yellow')//this.bg)
            .attr("width", '100%')///this.bounds.total_with)
            .attr("height", '100%')///this.bounds.total_height)
            .append("g")
            .attr("transform", "translate(" + this.bounds.margin.left + "," + this.bounds.margin.top + ")");
        Drawable.used_patterns.push(this.svg.append("defs"));
    }

    clear(element: string) {
        if (document.getElementById(element)) {
            Array().concat(document.getElementById(element).children).forEach((e) =>
                e.remove()
            );
        }
        Drawable.used_patterns = [];
        Drawable.used_patterns_basic_color = {};
        Drawable.spectros = [[]];
    }

    circ(x: number, y: number, r: number, c = "black") {
        return this.svg
            .append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", r)
            .style("fill", c);
    }

    rect(x: number, y: number, w: number, h: number, c = "black", r: number) {
        return this.svg
            .append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("rx", r || 0)
            .attr("ry", r || 0)
            .attr("width", w)
            .attr("height", h)
            .attr("fill", c);
    }

    text(x: number, y: number, text: string, estilo: any = {}) {
        const txt = this.svg.append("text").attr("x", x).attr("y", y).text(text);
        if (estilo.b) txt.style('font-weight', 'bold')
        if (estilo.serif) txt.style('font-family', 'serif')
        if (estilo.fs) txt.style('font-size', estilo.fs)
        if (estilo.r) txt.attr('transform', `rotate(${estilo.r} ${x},${y})`)
        if (estilo.hc) txt.style('text-anchor', 'middle')
        if (estilo.c) txt.style('fill', estilo.c)
        if (estilo.s) txt.style('stroke', estilo.s)
        return txt;
    }

    line({ c = "black", sw = 2, x1, y1, x2, y2, v, h }) {
        x1 = v ? v : x1;
        x2 = v ? v : x2;
        y1 = h ? h : y1;
        y2 = h ? h : y2;
        return this.svg
            .append("line")
            .style("stroke", c)
            .style("stroke-width", sw)
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2);
    }

    _getDefs() {
        return Drawable.used_patterns[0];
    }

    pattern(c = "black", w = 1) {
        const id = 'diagonalHatch' + w + c;
        if (Drawable.used_patterns.indexOf(id) < 0) {
            this._getDefs()
                .append("pattern")
                .attr("id", id)
                .attr("patternUnits", "userSpaceOnUse")
                .attr("width", 4)
                .attr("height", 4)
                .append("path")
                .attr("d", "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2")
                .attr("stroke", c)
                .attr("stroke-width", w);
            Drawable.used_patterns.push(id)
            Drawable.used_patterns_basic_color[`url(#${id})`] = c;
        }
        return `url(#${id})`;
    }

    path(p: string, c = 'black', sw: number = 2, f = 'none') {
        this.svg
            .append("path")
            .attr("d", p)
            .attr("fill", f)
            .attr("stroke", c)
            .attr("stroke-width", sw);
    }

    curva({ x, y, w, x2, h = 20, c, sw, f }) {
        const _x2 = (x2 ? x2 : (x + w)) - x
        const p = `M ${x},${y} c 0,${h} ${_x2},${h} ${_x2},0`
        return this.path(p, c, sw, f)
    }

    triangulo(x, y, w, h, f = 'black', c = 'none', sw) {
        const p = `M ${x - w / 2},${y} l ${w},0 l ${-w / 2},${-(h || w)} z`
        return this.path(p, c, sw, f)
    }


    gradient_par(c1, r = 95) {
        let c2 = 'black';
        switch (c1) {
            case "blue": c2 = "purple"; break;
            case "green": c2 = "yellow"; break;
            case "red": c2 = "orange"; break;
            case "orange": c2 = "purple"; break;
            case "yellow": c2 = "mediumpurple"; break;
        }
        return this.gradient(c1, c2, r);
    }

    gradient(c1 = "blue", c2 = "purple", r = 95) {
        const id = `${c1}${r}${c2}`;
        if (Drawable.used_patterns.indexOf(id) < 0) {

            var lg = this._getDefs()
                .append("linearGradient")
                .attr("id", id) //id of the gradient
                .attr("x2", r + "%")
                .attr("x1", "0%")
                .attr("y2", r + "%")
                .attr("y1", "0%"); //since its a vertical linear gradient
            lg.append("stop")
                .attr("offset", "0%")
                .style("stop-color", c1) //end in red
                .style("stop-opacity", 1);

            lg.append("stop")
                .attr("offset", "100%")
                .style("stop-color", c2) //start in blue
                .style("stop-opacity", 1);
            Drawable.used_patterns.push(id)
            Drawable.used_patterns_basic_color[`url(#${id})`] = c1;
        }
        return `url(#${id})`;
    }

    getBasicColor(id) {
        return Drawable.used_patterns_basic_color[id]
    }

    wave(x, y, width, c = "black", w = 2, s = .1) {

        const sobra = (width % (s * 100)) / 2;
        const inteiros = (width - sobra) / (s * 100);
        const path = null;///Array(inteiros).map(_ => `q ${s * 25},${s * 50} ${s * 50},0 t ${s * 50},0 `).join('');

        return this.svg.append("path")
            .attr("d", `M ${x},${y + s * 50} c 0,0 ${sobra / 2},-${sobra * .8} ${sobra},0 ${path} c 0,0 ${sobra / 2},${sobra * .8} ${sobra},0`)
            .attr("stroke", c)
            .attr("fill", "none")
            .attr("stroke-width", w)

    }

    flipX() {
        return this.svg
            .append("g")
            .attr('transform', `scale(-1,1) translate(${-(this.bounds.x * 2 + this.bounds.width)},0)`);
    }

    spectro(sid, x, amostras) {
        if (!sid) {
            sid = Drawable.spectros.push(new Conj<number>(amostras).uniq().sort((a, b) => a - b).map((s, i) => [s, i])) - 1
        }
        const spectros = Drawable.spectros[sid]
        return [sid, x ? `rgb(${150 + spectros.find(y => y[0] === x)[1] * (100 / spectros.length)},0,0)` : '#000']
    }

    regua(
        start,
        end,
        x = 0,
        y = 0,
        width,
        offsetX = 0,
        pos,
        regua = false,
        h = 200
    ) {
        pos = pos || d3.axisBottom
        var x_axis = d3.scaleLinear().domain([start, end]).range([0, width]);
        const ppx = (1 + end - start) / width
        const g = this.svg
            .append("g")
            .attr("transform", `translate(${x},${y})`)
            .call(pos(x_axis));

        if (regua) {
            //  regua = this.line({ v: -999, y1: y - 11, y2: y + h, c: "gray" });
            const regua2 = this.text(-999, y - 15, '154', { hc: true, fs: '.8rem', serif: true });
            //   this.line({ h: y, x1: x, x2: 1 + x + width, sw: 8 }).on(
            //       "mousemove",
            //       (coord) =>
            //          regua &&
            //          regua.attr("x1", coord.offsetX - offsetX) &&
            //          regua.attr("x2", coord.offsetX - offsetX) &&
            //          regua2.attr("x", coord.offsetX - offsetX) &&
            //          regua2.text(parseInt(start + ppx * (coord.offsetX - offsetX)))
            //  );
        }
        return g;
    }

    g(bounds, id, bg) {
        return new Drawable(this, null, bounds || this.bounds, bg, id)
    }

    hide() {
        this.svg.style('display', 'none')
    }

    show() {
        this.svg.style('display', 'unset')
    }

    download() {
        //  toPng.saveSvgAsPng(document.getElementById(this.svg_id), "diagram.png", { scale: 1 });
    }
}