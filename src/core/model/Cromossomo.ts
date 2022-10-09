import { Gene } from "./Gene";
import { Isoforma } from "./Isoforma";
import { Locus } from "./Locus";

export class Cromossomo {
    private nome: string;
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
}