import { Anotacao } from "../model";
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

    addExon = (exon: Exon) => this.exons.push(exon);
    addIntron = (intron: Intron) => this.introns.push(intron);
    setFivePrimeUTR = (futr: UTR) => (this.five_prime_utr = futr);
    setThreePrimeUTR = (tutr: UTR) => (this.three_prime_utr = tutr);
    setCDS = (locus: Locus) => (this.cds = this.cds ? this.cds.addSite(locus) : new CDS(locus));
    getCDS = () => this.cds;
    getIntrons = () => this.introns || this.update(this.gene).introns;
    getExons = () => this.exons;
    getUTR = () => [this.five_prime_utr, this.three_prime_utr];
    getGene = () => this.gene;
    hasCDS = () => !!this.cds;

    update(gene: Gene): Isoforma {
        this.gene = gene;
        this.exons.sort((a, b) => a.start - b.start).forEach(e => e.update(this));
        this.cds && this.cds.update(this);
        this.five_prime_utr && this.five_prime_utr.update(this);
        this.three_prime_utr && this.three_prime_utr.update(this);
        this.introns = this.exons
            .map(e => `${e.start},${e.end}`).join(';').split(',').map(x => x.split(';')).filter(x => x.length === 2)
            .map(
                (i, k) => new Intron(this.cromossomo, parseInt(i[0]) + 1, parseInt(i[1]) - 1, this.strand, 'Intron' + k)
            );
        return this;
    }

    // mRNA transcript variant 2 NM_001347423.2, 37 exons,  total annotated spliced exon length: 4659
    // protein isoform a precursor NP_001334352.2 (CCDS44827.1), 36 coding  exons,  annotated AA length: 1474

    // Exon table for  mRNA  NM_001347423.2 and protein NP_001334352.2
    // Genomic Interval Exon		Genomic Interval Coding		Gene Interval Exon		Gene Interval Coding		Exon Length	Coding Length	Intron Length
    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // 9116229-9116128		1-102		102		261
    // 9115866-9115764		9115849-9115764		364-466		381-466		103		86		2220
    // 9113543-9113360		9113543-9113360		2687-2870		2687-2870		184		184		823
    // 91125
    static fromTable(raw, gene: Gene) {
        raw = raw.filter(x => x.length > 5)
        if (!raw[0].startsWith('mRNA ')) return
        var exs = false
        var nome = null
        var ptna = null
        var h = null
        var exc = -1
        var ccol = -1
        const etb = []
        const ctb = []
        raw.forEach((l, i) => {
            if (i > 0) {
                if (l.startsWith('protein')) {
                    return
                }
                if (l.startsWith('Exon table for')) {
                    nome = l.split('mRNA')[1].trimStart().split(' ')[0]
                    ptna = l.indexOf('and protein ') ? l.split('and protein ')[1].split(' ')[0] : null
                    return
                }
                if (l.startsWith('------------------------------------------------------------')) {
                    exs = true
                    h = raw[i - 1].split('\t')
                    exc = h.indexOf('Genomic Interval Exon')
                    ccol = h.indexOf('Genomic Interval Coding')
                    return
                }
                if (exs && exc >= 0 && ccol > 0) {
                    const ec = l.split('\t');
                    const e = ec[exc].split('-').map(x => parseInt(x))
                    const eini = Math.min(...e)
                    const eend = Math.max(...e)
                    etb.push([eini, eend])
                    if (ec[ccol].length > 2) {
                        const c = ec[ccol].split('-').map(x => parseInt(x))
                        const cini = Math.min(...c)
                        const cend = Math.max(...c)
                        if (cini >= eini && cend <= eend) {
                            ctb.push([cini, cend])
                        } else {
                            console.warn('Linha invalida: ', l)
                        }
                    }
                }
            }
        })

        const mrna = new Isoforma(
            gene.cromossomo,
            Math.min(...etb.map(x => x[0])),
            Math.max(...etb.map(x => x[1])),
            gene.strand,
            nome);

        ptna && mrna.add_anotacao(new Anotacao('Protein', ptna))
        etb.forEach((e, i) => mrna.addExon(new Exon(gene.cromossomo, e[0], e[1], gene.strand, `Exon${i}`)))
        ctb.forEach((c, i) => mrna.setCDS(new Locus(gene.cromossomo, c[0], c[1], gene.strand, `CDS${i}`)))
        mrna.update(gene);
        return mrna;
    }
}