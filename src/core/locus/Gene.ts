import { AlternativeSplicing } from "../model/AlternativeSplicing";
import { Cromossomo } from "../model/Cromossomo";
import { DifferentialExpression } from "../model/DifferentialExpression";
import { Isoforma } from "./Isoforma";
import { Locus } from "./Locus";

export class Gene extends Locus {
    private isoformas: Array<Isoforma> = new Array<Isoforma>();
    private bed = {};
    private as_events = new Array<AlternativeSplicing>();
    private dexp: DifferentialExpression = null;
    private anots;


    getAS = () => this.as_events;

    addAS(as: AlternativeSplicing) {
        this.as_events.push(as)
    }

    setDE(de: DifferentialExpression) {
        this.dexp = de;
    }

    addIsoforma(isoforma: Isoforma) {
        this.isoformas.push(isoforma);
    }

    getIsoformaByID(id: string) {
        return this.isoformas.filter(i => i.meta.ID === id)[0];
    }

    hasIsoforma = (id: string) => this.isoformas.some(i => i.meta.ID === id);

    update(chr: Cromossomo): void {
        this.isoformas.forEach(i => i.update(this));
    }

    getIsoformas = () => this.isoformas;

    setBED(raw: string[]) {
        if (!this.bed[raw[0]])
            this.bed[raw[0]] = [[parseInt(raw[2]), parseInt(raw[3]), parseInt(raw[4])]]
        else
            this.bed[raw[0]].push([parseInt(raw[2]), parseInt(raw[3]), parseInt(raw[4])])
    }

    getBED = (site?: number[]) => site ? Object.fromEntries(Object.entries(this.bed).map(x => [x[0],
    x[1].filter(b => b[0] >= site[0] && b[1] <= site[1])
    ])) : this.bed;

    getAnots = (t?) => this.anots || (this.anots = [... new Set(this.isoformas.map(i => i.getAnotsAcession(t)).reduce((p, c) => p.concat(c), []))].filter(x => x !== '?'))

    // A2M alpha-2-macroglobulin[Homo sapiens]
    // Gene ID: 2, updated on 9-Oct-2022


    // Reference GRCh38.p14 Primary Assembly NC_000012.12  (minus strand) from: 9116229 to: 9067708
    // mRNA transcript variant 2 NM_001347423.2, 37 exons,  total annotated spliced exon length: 4659
    // protein isoform a precursor NP_001334352.2 (CCDS44827.1), 36 coding  exons,  annotated AA length: 1474

    // Exon table for  mRNA  NM_001347423.2 and protein NP_001334352.2
    // Genomic Interval Exon		Genomic Interval Coding		Gene Interval Exon		Gene Interval Coding		Exon Length	Coding Length	Intron Length
    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // 9116229-9116128		1-102		102		261
    // 9115
    public static fromNCBI(raw) {

        var nome = null;
        var ref = null;
        var mrnas = []

        raw.forEach((l, i) => {
            if (i < 1) {
                nome = l
                return
            }
            if (i > 1 && !ref && l.startsWith('Reference ')) {
                ref = l
                return
            }
            if (nome && ref) {
                if (l.startsWith('mRNA')) {
                    mrnas.unshift([l])
                } else {
                    mrnas[0].push(l)
                }
            }
        });

        const to = parseInt(ref.split(' to: ')[1].split(' ')[0])
        const from = parseInt(ref.split(' from: ')[1].split(' ')[0])
        const start = Math.min(to, from)
        const end = Math.max(to, from)
        const chr = new Cromossomo(ref.split(' ')[1], end - start + 1)
        const gene = new Gene(chr, start, end, ref.indexOf(' (minus strand) ') < 1, nome)
        mrnas.map(m => Isoforma.fromTable(m, gene)).forEach(i => gene.addIsoforma(i))
        return gene;
    }
}