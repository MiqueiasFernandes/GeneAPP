import { Isoforma } from "./Isoforma";
import { Locus } from "./Locus";

export class Exon extends Locus {

    isoforma: Isoforma = null;

    update(isoforma: Isoforma) {
        this.isoforma = isoforma;
    }

}