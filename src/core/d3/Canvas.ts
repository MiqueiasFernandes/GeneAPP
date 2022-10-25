import * as d3 from "d3";
import { ViewBox } from "./Size";

export class Fill {
    nome: string
    id: string
    cor: string
    cor2: string
    constructor(nome, cor) {
        this.nome = nome
        this.cor = cor
        this.id = `def${nome}`
    }

    setGradient(cor2: string, defs, r = 95) {
        this.cor2 = cor2
        var lg = defs
            .append("linearGradient")
            .attr("id", this.id) //id of the gradient
            .attr("x2", r + "%")
            .attr("x1", "0%")
            .attr("y2", r + "%")
            .attr("y1", "0%"); //since its a vertical linear gradient
        lg.append("stop")
            .attr("offset", "0%")
            .style("stop-color", this.cor) //end in red
            .style("stop-opacity", 1);

        lg.append("stop")
            .attr("offset", "100%")
            .style("stop-color", this.cor2) //start in blue
            .style("stop-opacity", 1);
        return this;
    }

    setPattern(defs, c = "black", t = 1) {
        defs.append("pattern")
            .attr("id", this.id)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", 4)
            .attr("height", 4)
            .append("path")
            .attr("d", t === 1 ? "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" : "M0,0 l5,5")
            .attr("stroke", c)
            .attr("stroke-width", 1);
        return this;
    }

    static getGradient(cor, defs, c2 = 'black', r = 95) {
        switch (cor) {
            case "blue": c2 = "purple"; break;
            case "green": c2 = "yellow"; break;
            case "red": c2 = "orange"; break;
            case "orange": c2 = "purple"; break;
            case "yellow": c2 = "mediumpurple"; break;
        }
        return new Fill('G' + cor, cor).setGradient(c2, defs, r);
    }

    static getPattern(defs, cor?, t?) {
        return new Fill('P' + cor, cor).setPattern(defs, cor, t);
    }

}

export class Canvas {
    viewBox: ViewBox;
    elID: string;
    bg: string;
    svg: any;
    defs: any;
    fiils: Array<Fill> = new Array<Fill>();

    constructor(elID?: string, viewBox?: ViewBox, bg?: string) {
        if (!elID)
            return;
        this.elID = elID;
        this.viewBox = viewBox;
        this.bg = bg;
        this.reset()
    }

    reset() {
        this.svg = d3.select(`#${this.elID}`).select(`svg`);
        !this.svg.empty() && this.svg.remove();
        this.svg = d3
            .select(`#${this.elID}`)
            .append("svg")
            .attr('id', `SVG${this.elID}`)
            .style("background", this.bg)
            .attr("width", this.viewBox.getViewSize().width)
            .attr("height", this.viewBox.getViewSize().height)
            .append("g");
        this.defs = this.svg.append("defs");
        this.fiils = new Array<Fill>();
    }

    plotOn(canvas: Canvas, viewBox?: ViewBox, name?: string): Canvas {
        this.viewBox = viewBox || this.viewBox || canvas.viewBox;
        this.elID = canvas.elID;
        this.bg = canvas.bg;
        this.svg = canvas.svg.append("g");
        name && this.svg.attr("id", name);
        return canvas;
    }

    rect(x: number, y: number, w: number, h: number, c = "black", r = 0, o = 1, svg?) {
        return (svg || this.svg)
            .append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("rx", r || 0)
            .attr("ry", r || 0)
            .attr("width", w)
            .attr("height", h)
            .attr("fill", c)
            .attr("opacity", o);
    }

    circ(x: number, y: number, r: number, c = "black") {
        return this.svg
            .append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", r)
            .style("fill", c);
    }

    text(x: number, y: number, text: string, estilo: any = {}, svg?) {
        const txt = (svg || this.svg).append("text").attr("x", x).attr("y", y).text(text);
        if (estilo.b) txt.style('font-weight', 'bold')
        if (estilo.serif) txt.style('font-family', 'serif')
        if (estilo.mono) txt.style('font-family', 'monospace')
        if (estilo.fs) txt.style('font-size', estilo.fs)
        if (estilo.r) txt.attr('transform', `rotate(${estilo.r} ${x},${y})`)
        if (estilo.hco || estilo.hc) txt.style('text-anchor', estilo.hco || 'middle')
        if (estilo.vc) txt.style("alignment-baseline", estilo.vco || 'central')
        if (estilo.c) txt.style('fill', estilo.c)
        if (estilo.s) txt.style('stroke', estilo.s)
        if (estilo.o) txt.style('opacity', estilo.o)
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

    path(p: string, c = 'black', sw: number = 2, f = 'none') {
        return this.svg
            .append("path")
            .attr("d", p)
            .attr("fill", f)
            .attr("stroke", c)
            .attr("stroke-width", sw);
    }

    wave(x, y, width, c = "black", w = 3, s = .1) {

        const sobra = (width % (s * 100)) / 2;
        const inteiros = (width - sobra) / (s * 100);
        const path = `q ${s * 25},${s * 50} ${s * 50},0 t ${s * 50},0 `.repeat(inteiros);

        return this.svg.append("path")
            .attr("d", `M ${x},${y + s * 50} c 0,0 ${sobra / 2},-${sobra * .8} ${sobra},0 ${path} c 0,0 ${sobra / 2},${sobra * .8} ${sobra},0`)
            .attr("stroke", c)
            .attr("fill", "none")
            .attr("stroke-width", w)
            .attr('stroke-linecap', "round")

    }

    fillGradient(item, cor, cor2?) {
        var fill = this.fiils.some(x => x.id === `defG${cor}`) ? this.fiils.filter(x => x.id === `defG${cor}`)[0] : null
        if (!fill) {
            this.fiils.push(fill = Fill.getGradient(cor, this.defs, cor2))
        }
        item.attr("fill", `url(#${fill.id})`)
    }

    fillPattern(item, cor, t?) {
        var fill = this.fiils.some(x => x.id === `defP${cor}`) ? this.fiils.filter(x => x.id === `defP${cor}`)[0] : null
        if (!fill) {
            this.fiils.push(fill = Fill.getPattern(this.defs, cor, t))
        }
        item.attr("fill", `url(#${fill.id})`)
    }

    public download() {
        var serializer = new XMLSerializer();
        var xmlString = serializer.serializeToString(d3.select(`#SVG${this.elID}`).node());
        // var imgData = 'data:image/svg+xml;base64,' + btoa(xmlString);
        return xmlString
    }

}

