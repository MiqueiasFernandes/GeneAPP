import { Gene } from "../locus/Gene";
import { Isoforma } from "../locus/Isoforma";
import { Locus } from "../locus/Locus";

export class Cromossomo {
    nome: string;
    private tamanho: number;
    private genes: Array<Gene> = new Array<Gene>();
    private loci: Array<Locus> = new Array<Locus>();

    constructor(nome: string, tamanho: number) {
        this.nome = nome;
        this.tamanho = tamanho;
    }

    addLocus(locus: Locus) {
        this.loci.push(locus);
    }

    addGene(gene: Gene) {
        this.genes.push(gene);
    }

    getGeneByID(id: string): Gene {
        return this.genes.filter(g => g.meta.ID === id)[0];
    }

    getIsoformByID(id: string): Isoforma {
        for (const gene of this.genes) {
            if (gene.hasIsoforma(id))
                return gene.getIsoformaByID(id);
        }
    }

    update() {
        this.genes.forEach(g => g.update(this));
    }

    getGenes = () => this.genes;

    getLoci = (a, b) => this.loci.filter(l => (l.start <= a && l.end >= a) || (l.start <= b && l.end >= b) || (l.start <= a && l.end >= b) || (a <= l.start && b >= l.end))
    getLoci2(a, b) {
        const ls = this.getLoci(a, b)
        return ls && ls.length > 0 ? ls : null;
    }
}