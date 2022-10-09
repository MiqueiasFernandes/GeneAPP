import { Locus } from "./Locus";

export class Anotacao {
    private key: string;
    private value: string;
    private link: string;
    private locus: Locus;

    constructor(key: string, value: string) {
        this.key = key;
        this.value = value;
    }

    public setLocus(locus: Locus) {
        this.locus = locus;
        locus.add_anotacao(this);
    }
}