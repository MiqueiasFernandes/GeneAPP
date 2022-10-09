import { Anotacao } from "./Anotacao";
import { Cromossomo } from "./Cromossomo";

class Meta {
    ID: string;
    Parent: string;
}

export class Locus {

    nome: string;
    start: number;
    end: number;
    strand: boolean;
    cromossomo: Cromossomo;
    meta: Meta = new Meta();

    anotacoes: Array<Anotacao> = new Array<Anotacao>();

    constructor(cromossomo: Cromossomo, start: number, end: number, strand: boolean, nome: string) {
        this.cromossomo = cromossomo;
        this.start = start;
        this.end = end;
        this.strand = strand;
        this.nome = nome;
    }

    public getLocus = () => this;

    public add_anotacao(anotacao: Anotacao) {
        this.anotacoes.push(anotacao);
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


}