import { Isoforma } from "./Isoforma";
import { Locus } from "./Locus";

export class UTR extends Locus {
    is_five: boolean;
    is_three: boolean;
    isoforma: Isoforma = null;

    update(isoforma: Isoforma) {
        this.isoforma = isoforma;
    }
}