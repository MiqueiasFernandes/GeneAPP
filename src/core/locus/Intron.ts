import { Isoforma } from "./Isoforma";
import { Locus } from "./Locus";

export class Intron extends Locus {
    isoforma: Isoforma = null;

    update(isoforma: Isoforma) {
        this.isoforma = isoforma;
        return this;
    }
}