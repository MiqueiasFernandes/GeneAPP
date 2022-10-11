import { Locus } from "../locus/Locus";

export class Anotacao {
    private key: string;
    private value: string;
    private link: string;
    private locus: Locus;
    private anotations: {};

    constructor(key: string, value: string, anotations) {
        this.key = key;
        this.value = value;
        this.anotations = anotations;
    }

    public setLocus(locus: Locus) {
        this.locus = locus;
        locus.add_anotacao(this);
    }

    static fromRaw(raw: string[]): Anotacao {

        //00 Protein accession (e.g. P51587)
        const id = raw[0];
        //01 Sequence MD5 digest (e.g. 14086411a2cdf1c4cba63020e1622579)
        const md5 = raw[1];
        //02 Sequence length (e.g. 3418)
        const len = raw[2];
        //03 Analysis (e.g. Pfam / PRINTS / Gene3D)
        const tool = raw[3];
        //04 Signature accession (e.g. PF09103 / G3DSA:2.40.50.140)
        const accession = raw[4];
        //05 Signature description (e.g. BRCA2 repeat profile)
        const anotacao = raw[5];
        //06 Start location
        const start = parseInt(raw[6]);
        //07 Stop location
        const stop = parseInt(raw[7]);
        //08 Score - is the e-value (or score) of the match reported by member database method (e.g. 3.1E-52)
        const score = raw[8];
        //09 Status - is the status of the match (T: true)
        //10 Date - is the date of the run
        //11 InterPro annotations - accession (e.g. IPR002093)
        //12 InterPro annotations - description (e.g. BRCA2 repeat)
        //13 (GO annotations (e.g. GO:0005515) - optional column; only displayed if –goterms option is switched on)
        const gos = raw[13];
        //14 (Pathways annotations (e.g. REACT_71) - optional column; only displayed if –pathways option is switched on)
        const path = raw[14];

        return new Anotacao(tool, accession, {
            anotacao, start, stop, gos, path, interpro: true
        })
    }
}