import { Isoforma } from "../locus/Isoforma";
import { Locus } from "../locus/Locus";

export class Anotacao {
    key: string;
    private value: string;
    private link: string;
    private locus: Locus;
    private anotations: {};

    constructor(key: string, value: string, anotations) {
        this.key = key;
        this.value = value;
        this.anotations = anotations;
    }

    get = (k) => this.anotations[k];
    toLoci(iso: Isoforma): Locus[] {
        const loci = [];
        if (!this.anotations || !this.anotations['start'] || !this.anotations['stop'])
            return loci;
        const parts = iso.getCDS().project(this.anotations['start'], this.anotations['stop'])
        parts.forEach(p => loci.push(new Locus(iso.cromossomo, Math.min(...p), Math.max(...p), iso.strand, this.value + ': ' + this.anotations['text'])))
        return loci;
    };

    share = () => [this.value, this.anotations['start'], this.anotations['stop']]

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

    static fromRaw2(raw: string[]): Anotacao[] {

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
        const interpro = raw[11].trim();
        //12 InterPro annotations - description (e.g. BRCA2 repeat)
        //13 (GO annotations (e.g. GO:0005515) - optional column; only displayed if –goterms option is switched on)
        const gos = raw[13];
        //14 (Pathways annotations (e.g. REACT_71) - optional column; only displayed if –pathways option is switched on)
        const path = raw[14];

        const anotacoes = [Anotacao.fromRaw(raw)];

        interpro && anotacoes.push(new Anotacao('InterPro', interpro, { acession: interpro, text: raw[12], start, stop }))
        tool === 'Pfam' && anotacoes.push(new Anotacao('Pfam', accession, { accession, text: anotacao, start, stop }))
        tool !== 'Pfam' && anotacoes.push(new Anotacao('Other', accession, { accession, text: anotacao, start, stop, raw }))
        gos && gos.length > 3 && gos.split('|').map(go => go.trim()).forEach(go => {
            anotacoes.push(new Anotacao('GO', go.trim(), { accession }))
        });
        path && path.length > 3 && path.split('|').map(pa => pa.trim()).forEach(pa => {
            anotacoes.push(new Anotacao('Pathway', pa.split(':')[1].trim(), { accession, db: pa.split(':')[0] }))
        });
        return anotacoes.filter(a => a.key && a.value);
    }
}