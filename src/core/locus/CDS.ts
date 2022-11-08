import { Isoforma } from "./Isoforma";
import { Locus } from "./Locus";

export class CDS {

    private loci: Array<Locus> = new Array<Locus>();
    private loci_sorted: Array<Locus> = new Array<Locus>();
    private isoforma: Isoforma = null;

    constructor(locus: Locus) {
        this.addSite(locus);
    }
    share = () => this.loci.map(l => l.share())

    addSite(locus: Locus): CDS {
        this.loci.push(locus);
        return this;
    }

    update(isoforma: Isoforma) {
        this.isoforma = isoforma;
        this.getLoci();
    }

    getLoci = () => this.loci_sorted.length === this.loci.length ?
        this.loci_sorted :
        (this.loci_sorted = this.loci.sort((a, b) => this.isoforma.strand ? a.start - b.start : b.end - a.end));

    updateFase() {
        if (this.loci[0].fase > 0) return
        var tot = 0;
        var tot_aa = 0
        this.getLoci().forEach((l, i) => {
            if (i < 1) {
                l.fase = 1;
                l.start_aa = 1;
                l.end_aa = tot_aa = Math.ceil(l.size / 3)
            } else {
                l.fase = tot % 3 + 1;
                l.start_aa = tot_aa + (l.fase < 2 ? 1 : 0)
                l.end_aa = tot_aa = Math.ceil(l.start_aa + (l.size - (l.fase === 1 ? 0 : l.fase === 2 ? 2 : 1)) / 3)
            }
            tot += l.size;
        })
    }

    project(startAA: number, endAA: number): number[][] {
        this.updateFase();
        return this.loci_sorted
            .map(l => l.siteFromAA(startAA, endAA)).filter(x => x[0] > 0)
    }

    len = () => this.loci.reduce((a, b) => a + b.size, 0)

}