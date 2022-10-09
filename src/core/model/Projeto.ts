import { Cromossomo } from "./Cromossomo";
import { Exon } from "./Exon";
import { Gene } from "./Gene";
import { Isoforma } from "./Isoforma";
import { Locus } from "./Locus";
import { UTR } from "./UTR";

class Sample {
    path: string;
    nome: string;
    run: string;

    constructor(path: string) {
        this.path = path;
    }

    config(line: string[]) {
        this.nome = line[1];
        this.run = line[0];
    }
}

class Fator {
    nome: String;
    samples: Array<Sample> = new Array<Sample>();
    cor: String;

    constructor(raw: string, color: string) {
        //sample_MT1/MT1.rmats.bam,sample_MT2/MT2.rmats.bam,sample_MT3/MT3.rmats.bam,{MUTANT.bams}
        const dt = raw.split(',').reverse();
        this.nome = dt[0].slice(1, -1).split(".")[0];
        this.samples = dt.slice(1).map(x => new Sample(x.split('/')[0]));
        this.cor = color || "#ff2486";
    }

}

export class Projeto {
    nome: String;
    fatores: Array<Fator> = new Array<Fator>();
    taxonomy: string = null;
    cromossomos: Array<Cromossomo> = new Array<Cromossomo>();
    private parse_status = 0;

    constructor(nome: string) {
        this.nome = nome;
        this.fatores = new Array<Fator>();
    }

    addFator(raw: string) {
        const fator = new Fator(raw, this.fatores.length > 0 ? "#0ab6ff" : null);
        this.fatores.some(f => f.nome === fator.nome) || this.fatores.push(fator);
    }

    getFator = path => this.fatores.filter(f => f.nome === path)[0];

    setDesign(lines: string[]) {
        if (lines[0] === 'RUN,SAMPLE,FACTOR,FOLDER') {
            lines
                .slice(1)
                .map(x => x.split(","))
                .forEach(line => this.getFator(line[2]).samples.filter(s => s.path === line[3])[0].config(line));
        }
        else
            throw 'Line 1 do desenho experimental errada: ' + lines[0];
    }

    validarRawData(raw_data): { erros: string[], metadata, files } {
        const part1 = raw_data.indexOf('part=1');
        const part2 = raw_data.indexOf('part=2');
        const part3 = raw_data.indexOf('part=3');
        const part4 = raw_data.indexOf('part=4');

        if (part1 !== 0 || part1 >= part2 || part2 >= part3 || part3 >= part4) {
            return { erros: ["Divisao incorreta das partes"], metadata: null, files: null };
        }

        const metadata = raw_data.slice(part1 + 1, part2).map(l => l.split('=')).map(l => [l[0], l.slice(1).join('=')]);
        const alias = raw_data.slice(part2 + 1, part3).map(l => l.split('='));
        var files = raw_data.slice(part3 + 1, part4).concat(raw_data.slice(part4 + 1));
        files = alias.map(x => [
            x[0],
            files.filter(l => l.startsWith(x[1])).map(l => l.slice(x[1].length + 1))
        ]);
        const conf_lines = f => parseInt(metadata.filter(x => x[0] === 'lines' && x[1].endsWith(f[0]))[0][1].trim().split(' ')[0]);
        const erros = files.filter(f => f[1].length !== conf_lines(f)).map(f => [f[0], f[1].length, conf_lines(f)]);
        if (erros.length > 0) {
            return { erros: erros.map(e => e[0] + ' {R' + e[1] + 'E' + e[2] + '}'), metadata: null, files: null };
        }
        return { erros: undefined, metadata, files };
    }

    private part = (v, t) => v.filter(x => x[0] === t)[0][1];

    parse_dados_basicos(metadata, files) {
        metadata.filter(x => x[0] === "map").map(x => x[1]).forEach(x => this.addFator(x));
        this.setDesign(this.part(files, 'experimental_design.csv'));
        this.taxonomy = metadata
            .filter(x => x[0] === "gff" && x[1].startsWith('##species https://www.ncbi'))[0][1].trim().split(' ')[1];


        const multiqc_data = files.filter(f => f[0] === 'multiqc_general_stats.txt').map(x => x[1]);
        const resumo_data = files.filter(f => f[0] === 'resumo.txt').map(x => x[1]);

        this.parse_status += 10;
    }

    parseGFF(files): boolean {
        const cromossomos = {};
        this.part(files, 'gene.gff.min')
            .map(x => x.split('\t'))
            .sort((a, b) => {
                const A = a[2];
                const B = b[2];

                if (A === B) return 0;

                if (A === "region") return -1;

                if (A === "gene") {
                    if (B === "region") return 1;
                    return -1;
                }

                if (['mRNA', 'transcript', 'primary_transcript'].includes(A)) {
                    if (["region", "gene"].includes(B)) return 1;
                    return -1;
                }

                return 1;
            })
            .forEach(
                l => {
                    const crh_nome = l[0];
                    const tipo = l[2];
                    const locus = Locus.fromGFF(null, l, null);
                    switch (tipo) {
                        case "region":
                            cromossomos[crh_nome] = new Cromossomo(crh_nome, locus.end + 1);
                            break;
                        case "gene":
                            if (cromossomos[crh_nome]) {
                                const gene = new Gene(
                                    cromossomos[crh_nome], locus.start, locus.end, locus.strand, locus.meta['ID']);
                                gene.meta = locus.meta;
                                cromossomos[crh_nome].addGene(gene);
                            } else {
                                console.warn(`Cromossomo ${crh_nome} not found: ${l}`);
                            }
                            break;
                        case 'mRNA':
                        case 'transcript':
                        case 'primary_transcript':
                            const mrna = new Isoforma(cromossomos[crh_nome], locus.start, locus.end, locus.strand, locus.meta['ID']);
                            mrna.meta = locus.meta;
                            const gene = cromossomos[crh_nome].getGeneByID(mrna.meta.Parent);
                            if (gene) {
                                gene.addIsoforma(mrna);
                            } else {
                                console.warn(`Gene ${mrna.meta.Parent} for ${tipo} not found: ${l}`);
                            }
                            break;
                        case 'five_prime_UTR':
                        case 'three_prime_UTR':
                            const utr = new UTR(cromossomos[crh_nome], locus.start, locus.end, locus.strand, locus.meta.ID);
                            utr.meta = locus.meta;
                            utr.is_five = 'five_prime_UTR' === tipo;
                            utr.is_three = 'three_prime_UTR' === tipo;
                            var iso = cromossomos[crh_nome].getIsoformByID(utr.meta.Parent);
                            if (iso) {
                                utr.is_five && iso.setFivePrimeUTR(utr);
                                utr.is_three && iso.setThreePrimeUTR(utr);
                            } else {
                                console.warn(`Isoform ${utr.meta.Parent} for ${tipo} not found: ${l}`);
                            }
                            break;
                        case 'exon':
                            const exon = new Exon(cromossomos[crh_nome], locus.start, locus.end, locus.strand, locus.meta.ID);
                            exon.meta = locus.meta;
                            iso = cromossomos[crh_nome].getIsoformByID(exon.meta.Parent);
                            if (iso) {
                                iso.addExon(exon);
                            } else {
                                console.warn(`Isoform ${exon.meta.Parent} for ${tipo} not found: ${l}`);
                            }
                            break;
                        case 'CDS':
                            const cds = new Locus(cromossomos[crh_nome], locus.start, locus.end, locus.strand, locus.meta.ID);
                            cds.meta = locus.meta;
                            iso = cromossomos[crh_nome].getIsoformByID(cds.meta.Parent);
                            if (iso) {
                                iso.setCDS(cds);
                            } else {
                                console.warn(`Isoform ${cds.meta.Parent} for ${tipo} not found: ${l}`);
                            }
                            break;
                        default:
                            cromossomos[crh_nome].addLocus(Locus.fromGFF(cromossomos[crh_nome], l, tipo));
                            break;
                    }
                }
            );

        Object.keys(cromossomos)
            .map(k => cromossomos[k])
            .forEach(c => {
                c.update();
                this.cromossomos.push(c);
            });
        this.parse_status += 10;
        return true;
    }

    parseTPM(files): boolean {
        const tpm_data = [
            files.filter(f => f[0] === 'TPM_genes.csv').map(x => x[1]),
            files.filter(f => f[0] === 'TPM_trans.csv').map(x => x[1]),
            files.filter(f => f[0] === 'transcript_gene_mapping.csv').map(x => x[1])
        ];
        return true;
    }

    parseRMATS(files): boolean {
        const rmats_data = files
            .filter(f => [
                "A3SS.MATS.JCEC.txt", 'A5SS.MATS.JCEC.txt', 'RI.MATS.JCEC.txt', 'SE.MATS.JCEC.txt', 'MXE.MATS.JCEC.txt',
                'sign_events_A3SS.tsv', 'sign_events_A5SS.tsv', 'sign_events_RI.tsv', 'sign_events_SE.tsv'
            ].indexOf(f[0]) === 0)
            .map(x => x[1]);
        return true;
    }

    parse3D(files): boolean {

        const to3d_data = files
            .filter(f => [
                'Significant DAS genes list and statistics.csv', 'Significant DE genes list and statistics.csv'
            ].indexOf(f[0]) === 0)
            .map(x => x[1]);
        return true;
    }

    parseCobertura(files): boolean {

        const cobertura_data = files.filter(f => f[0] === 'cov_all.bed').map(x => x[1]);
        return true;
    }

    parseAnotacao(files): boolean {
        const anotacao_data = files.filter(f => f[0] === 'anotacao.tsv').map(x => x[1]);
        return true;
    }

    parseFiles(metadata, files, fn_status) {
        fn_status(0);
        /// tpm > gff > anotacao
        /// basicos
        /// rmats
        /// 3d
        ///cobertura
        setTimeout(() => { this.parse_dados_basicos(metadata, files); fn_status(this.parse_status) }, 100);
        setTimeout(() => { this.parseGFF(files); fn_status(this.parse_status) }, 100);

    }
}