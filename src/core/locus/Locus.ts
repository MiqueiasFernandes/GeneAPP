import { Anotacao } from "../model/Anotacao";
import { Cromossomo } from "../model/Cromossomo";

class Meta {
    ID: string;
    Parent: string;
}

export class Locus {

    nome: string;
    start: number;
    end: number;
    size: number;
    strand: boolean;
    cromossomo: Cromossomo;
    meta: Meta = new Meta();
    sites: Locus[] = new Array<Locus>();
    fase = 0;
    start_aa = 0;
    end_aa = 0;
    seq = null;

    anotacoes: Array<Anotacao> = new Array<Anotacao>();

    constructor(cromossomo: Cromossomo, start: number, end: number, strand: boolean, nome: string) {
        this.cromossomo = cromossomo;
        this.start = start;
        this.end = end;
        this.size = end - start + 1;
        this.strand = strand;
        this.nome = nome;
    }

    public copy = () => new Locus(this.cromossomo, this.start, this.end, this.strand, this.nome)

    public getLocus = () => this;

    public add_anotacao(anotacao: Anotacao) {
        this.anotacoes.push(anotacao);
    }

    add_anotacoes(anots: Anotacao[]) {
        this.anotacoes.push(...anots);
    }

    addSite(locus: Locus) {
        this.sites.push(locus)
    }

    getSites = () => this.sites;

    siteFromAA(startAA, endAA): number[] {
        // site fora
        if (endAA < this.start_aa || startAA > this.end_aa)
            return [0, 0]
        // site extende
        if (startAA <= this.start_aa && endAA >= this.end_aa) {
            return [this.start, this.end]
        }
        const aas = (1 + endAA - startAA) * 3
        const start = this.strand ?
            (startAA <= this.start_aa ? this.start : (this.start + (startAA - this.start_aa) * 3 - (this.fase - 1))) :
            (startAA <= this.start_aa ? this.end : (this.end - (startAA - this.start_aa) * 3 + (this.fase - 1)));
        // site dentro
        return this.strand ? [
            start,
            Math.min(start + aas, this.end)
        ] : [
            Math.max(start - aas, this.start),
            start
        ]
    }

    public static fromGFF(chr: Cromossomo, raw: string[], nome: string): Locus {
        const start = parseInt(raw[3]);
        const end = parseInt(raw[4]);
        const strand = raw[6] === '+';
        const locus = new Locus(chr, start, end, strand, nome);
        raw[8]
            .split(';')
            .map(x => x.split('='))
            .forEach(x => locus.meta[x[0]] = x.slice(1).join('='));
        return locus;
    }

    getAnotsAcession = (t?) => this.anotacoes.filter(x => !t || (x.key === t[0] || x.key === t[1])).map(a => a.value || '?')
    getAnotsText = (t?) => this.anotacoes.filter(x => !t || x.key).map(a => a.get('text')).filter(x => !!x)
    getAnots = (t?) => this.anotacoes.filter(x => !t || (x.key === t))
    share = () => [this.start, this.end]
}