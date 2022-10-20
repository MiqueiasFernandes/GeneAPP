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

    anotacoes: Array<Anotacao> = new Array<Anotacao>();

    constructor(cromossomo: Cromossomo, start: number, end: number, strand: boolean, nome: string) {
        this.cromossomo = cromossomo;
        this.start = start;
        this.end = end;
        this.size = end - start + 1;
        this.strand = strand;
        this.nome = nome;
    }

    public getLocus = () => this;

    public add_anotacao(anotacao: Anotacao) {
        this.anotacoes.push(anotacao);
    }

    add_anotacoes(anots: Anotacao[]) {
        this.anotacoes.push(...anots);
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

    getAnotsAcession = (t?) => this.anotacoes.filter(x => !t || (x.key === t[0] || x.key === t[1])).map(a => a.get('acession') || '?')
    getAnotsText = (t?) => this.anotacoes.filter(x => !t || x.key).map(a => a.get('text')).filter(x => !!x)

}