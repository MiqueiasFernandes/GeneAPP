class Sample {
    path: string;
    nome: string;
    run: string;
    fator: string;
    tpm_genes = {};
    tpm_trans = {};

    constructor(path: string) {
        this.path = path;
    }

    config(row) {
        this.nome = row.SAMPLE;
        this.run = row.RUN;
        this.fator = row.FACTOR;
    }

    fillTPM(dt, gene = true) {
        dt
            .map(r => [r["@"], r[`${this.fator}.${this.nome}`]])
            .forEach(r => ((gene ? this.tpm_genes : this.tpm_trans)[r[0]] = parseFloat(r[1])));
    }
}

export class Fator {
    nome: String;
    samples: Array<Sample> = new Array<Sample>();
    cor: String;
    is_control = false;
    is_case = false;

    constructor(raw: string, color: string) {
        //sample_MT1/MT1.rmats.bam,sample_MT2/MT2.rmats.bam,sample_MT3/MT3.rmats.bam,{MUTANT.bams}
        const dt = raw.split(',').reverse();
        this.nome = dt[0].slice(1, -1).split(".")[0];
        this.samples = dt.slice(1).map(x => new Sample(x.split('/')[0]));
        this.cor = color || "#ff2486";
    }

    setControl = () => this.is_control = true;
    setCase = () => this.is_case = true;
}