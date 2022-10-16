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
                this.extra['IMPACT'] = Math.max(ria, rib) - Math.min(ria, rib)
                break;
            case 'SE':
                //se  exonStart_0base	exonEnd
                var sea = parseInt(raw['exonStart_0base'])
                var seb = parseInt(raw['exonEnd'])
                this.extra['IMPACT'] = Math.max(sea, seb) - Math.min(sea, seb)
                break;
            default:
                //a3ss   longExonStart_0base	longExonEnd	shortES	shortEE
                //a5ss  longExonStart_0base	longExonEnd	shortES	shortEE
                var a = parseInt(raw['longExonStart_0base'])
                var b = parseInt(raw['longExonEnd'])
                var c = parseInt(raw['shortES'])
                var d = parseInt(raw['shortEE'])
                this.extra['IMPACT'] = (Math.max(a, b) - Math.min(a, b)) + (Math.max(c, d) - Math.min(c, d))
                break;
        }
    }
}