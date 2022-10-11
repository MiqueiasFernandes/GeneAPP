import { Gene } from "../locus/Gene";

export class DifferentialExpression {
    private gene: Gene;
    private log2fc: number;
    private qvalue: number;

    constructor(gene: Gene, log2fc: number, qvalue: number) {
        this.gene = gene;
        this.log2fc = log2fc;
        this.qvalue = qvalue;
        gene.setDE(this);
    }
}