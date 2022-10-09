import { Isoforma } from "./Isoforma";
import { Locus } from "./Locus";

export class CDS {

    private loci: Array<Locus> = new Array<Locus>();
    private isoforma: Isoforma = null;

    constructor(locus: Locus) {
        this.addSite(locus);
    }

    addSite(locus: Locus): CDS {
        this.loci.push(locus);
        return this;
    }

    update(isoforma: Isoforma) {
        this.isoforma = isoforma;
        this.loci.sort((a, b) => this.isoforma.strand ? (a.start - b.start) : (b.start - a.start));
    }

}