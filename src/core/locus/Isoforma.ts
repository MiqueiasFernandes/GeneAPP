import { Anotacao } from "../model/Anotacao";
import { CDS } from "./CDS";
import { Exon } from "./Exon";
import { Gene } from "./Gene";
import { Intron } from "./Intron";
import { Locus } from "./Locus";
import { UTR } from "./UTR";

export class Isoforma extends Locus {
    private exons: Array<Exon> = new Array<Exon>();
    private introns: Array<Intron> = new Array<Intron>();
    private five_prime_utr: UTR = null;
    private three_prime_utr: UTR = null;
    private cds: CDS = null;
    private gene: Gene = null;
    private anotacao: Array<Anotacao> = new Array<Anotacao>();

    addExon = (exon: Exon) => this.exons.push(exon);
    addIntron = (intron: Intron) => this.introns.push(intron);
    setFivePrimeUTR = (futr: UTR) => (this.five_prime_utr = futr);
    setThreePrimeUTR = (tutr: UTR) => (this.three_prime_utr = tutr);
    setCDS = (locus: Locus) => (this.cds = this.cds ? this.cds.addSite(locus) : new CDS(locus));
    getCDS = () => this.cds;
    getIntrons = () => this.introns || this.update(this.gene).introns;
    getExons = () => this.exons;
    getUTR = () => [this.five_prime_utr, this.three_prime_utr];

    update(gene: Gene): Isoforma {
        this.gene = gene;
        this.exons.sort((a, b) => a.start - b.start).forEach(e => e.update(this));
        this.cds && this.cds.update(this);
        this.five_prime_utr && this.five_prime_utr.update(this);
        this.three_prime_utr && this.three_prime_utr.update(this);
        this.introns = this.exons
            .map(e => `${e.start},${e.end}`).join(';').split(',').map(x => x.split(';')).filter(x => x.length === 2)
            .map(
                i => new Intron(this.cromossomo, parseInt(i[0]) + 1, parseInt(i[1]) - 1, this.strand, 'Intron')
            );
        return this;
    }
}