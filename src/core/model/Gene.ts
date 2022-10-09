import { Cromossomo } from "./Cromossomo";
import { Isoforma } from "./Isoforma";
import { Locus } from "./Locus";

export class Gene extends Locus {
    private isoformas: Array<Isoforma> = new Array<Isoforma>();

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

}