import { Gene } from "../locus/Gene";

export class AlternativeSplicing {
    evidence: string;
    private gene: Gene;
    qvalue: number;
    dps: number;
    extra: {};

    constructor(evidence: string, gene: Gene, dps: number, qvalue: number, extra = {}) {
        this.evidence = evidence;
        this.gene = gene;
        this.qvalue = qvalue;
        this.dps = dps;
        this.extra = extra;
        gene.addAS(this);
    }

    getEvidence = () => this.evidence;
    hasMASER = () => this.extra['MASER']
    getGene = () => this.gene;
}

export class AS3dranseq extends AlternativeSplicing {
    constructor(gene: Gene, raw: {}) {
        super('3DRNASeq', gene, raw['maxdeltaPS'], raw['adj.pval'], raw);
    }
}

export class ASrmats extends AlternativeSplicing {
    private tipo: string;
    constructor(gene: Gene, raw: {}, tipo: string) {
        super('rMATS', gene, raw['IncLevelDifference'], raw['FDR'], raw);
        this.tipo = raw['tipo'] = tipo;

        switch (tipo) {
            case 'RI':
                //ri riExonStart_0base	riExonEnd
                var ria = parseInt(raw['riExonStart_0base'])
                var rib = parseInt(raw['riExonEnd'])
                this.extra['AS_SITE_START'] = Math.min(ria, rib)
                this.extra['AS_SITE_END'] = Math.max(ria, rib)
                break;
            case 'SE':
                //se  exonStart_0base	exonEnd
                var sea = parseInt(raw['exonStart_0base'])
                var seb = parseInt(raw['exonEnd'])
                this.extra['AS_SITE_START'] = Math.min(sea, seb)
                this.extra['AS_SITE_END'] = Math.max(sea, seb)
                break;
            default:
                //a3ss   longExonStart_0base	longExonEnd	shortES	shortEE
                //a5ss  longExonStart_0base	longExonEnd	shortES	shortEE
                var a = parseInt(raw['longExonStart_0base'])
                var b = parseInt(raw['longExonEnd'])
                var c = parseInt(raw['shortES'])
                var d = parseInt(raw['shortEE'])
                this.extra['AS_INI_DIF'] = a !== c
                this.extra['AS_END_DIF'] = b !== d
                this.extra['AS_INI_DIF'] && this.extra['AS_END_DIF'] && console.warn('Evento AS duplicado ' + raw)
                this.extra['AS_SITE_START'] = this.extra['AS_INI_DIF'] ? Math.min(a, c) : a
                this.extra['AS_SITE_END'] = this.extra['AS_END_DIF'] ? Math.max(b, d) : b
                this.extra['AS_PB'] = this.extra['AS_INI_DIF'] ? Math.max(a, c) : Math.min(b, d)
                break;
        }
        this.extra['IMPACT'] = 1 + this.extra['AS_SITE_END'] - this.extra['AS_SITE_START']
    }

    coords = null;

    getASsite = (genoma?) => genoma ?
        [this.extra['AS_SITE_START'], this.extra['AS_SITE_END']] :
        (this.coords ? this.coords : (this.coords = [Math.min(this.extra['AS_SITE_START'], this.extra['AS_SITE_END']) - this.getGene().start,
        Math.max(this.extra['AS_SITE_START'], this.extra['AS_SITE_END']) - this.getGene().start]))

    getASpb = (genoma?) => this.extra['AS_PB'] - (genoma ? 0 : this.getGene().start)
}