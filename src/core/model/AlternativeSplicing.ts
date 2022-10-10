import { Fator } from "./Fator";
import { Gene } from "./Gene";

export class AlternativeSplicing {
    private evidence: string;
    private gene: Gene;
    private qvalue: number;
    private dps: number;
    private extra: {};

    constructor(evidence: string, gene: Gene, dps: number, qvalue: number, extra = {}) {
        this.evidence = evidence;
        this.gene = gene;
        this.qvalue = qvalue;
        this.dps = dps;
        this.extra = extra;
        gene.addAS(this);
    }
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
    }
}