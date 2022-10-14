import { Conj } from "../utils/Conj";
import { CSV } from "../utils/CSV";
import { Anotacao } from "./Anotacao";
import { Cromossomo } from "./Cromossomo";
import { Exon } from "../locus/Exon";
import { Gene } from "../locus/Gene";
import { Isoforma } from "../locus/Isoforma";
import { Locus } from "../locus/Locus";
import { UTR } from "../locus/UTR";
import { Fator } from "./Fator";
import { AlternativeSplicing, AS3dranseq, ASrmats } from "./AlternativeSplicing";
import { DifferentialExpression } from "./DifferentialExpression";

export class Projeto {
    nome: String;
    status = 0; // 0 vazio, 1 carregado
    fatores: Array<Fator> = new Array<Fator>();
    taxonomy: string = null;
    cromossomos: Array<Cromossomo> = new Array<Cromossomo>();
    private qc_status: CSV = null;
    private gene2isos = {};
    private iso2gene = {};
    private as_genes = [];
    private as_isos = [];
    private full_map_table: string[][] = [];
    private gene_prefix: number = 0;
    private genes = {};
    private isoformas_FASTA = {};
    private isoformas_GFF = {};
    private das_genes: Array<AlternativeSplicing> = new Array<AlternativeSplicing>();
    private de_genes: Array<DifferentialExpression> = new Array<DifferentialExpression>();
    private resumo: string[] = null;


    constructor(nome: string) {
        this.nome = nome;
        this.fatores = new Array<Fator>();
    }

    getALLGenes = (): Gene[] => Object.values(this.genes);
    getALLIsos = (fasta: boolean = false): Isoforma[] => Object.values(fasta ? this.isoformas_FASTA : this.isoformas_GFF);
    getFator = nome => this.fatores.filter(f => f.nome === nome)[0];
    getFatorBySample = (sp: string) => this.fatores.filter(f => f.samples.some(s => s.nome === sp))[0];
    getResumo = (x: string) => this.resumo ? this.resumo.filter(z => z.indexOf(x)>=0) : [];
    getContrast = () => `${this.fatores[0].nome}-${this.fatores[1].nome}`

    addFator(raw: string) {
        const fator = new Fator(raw, this.fatores.length > 0 ? "#0ab6ff" : null);
        fator.is_control = this.fatores.length < 1;
        fator.is_case = this.fatores.length > 0;
        this.fatores.some(f => f.nome === fator.nome) || this.fatores.push(fator);
    }

    setDesign(csv: CSV) {
        if (['RUN', 'SAMPLE', 'FACTOR', 'FOLDER'].every(x => csv.get_header().includes(x))) {
            csv.getRows().forEach(r => this.getFator(r.FACTOR).samples.filter(s => s.path === r.FOLDER)[0].config(r));
        }
        else
            throw 'Line 1 do desenho experimental errada: ' + csv.get_header();
    }

    validarRawData(raw_data): { erros: string[], metadata, files, headers } {
        const part1 = raw_data.indexOf('part=1');
        const part2 = raw_data.indexOf('part=2');
        const part3 = raw_data.indexOf('part=3');
        const part4 = raw_data.indexOf('part=4');

        if (part1 !== 0 || part1 >= part2 || part2 >= part3 || part3 >= part4) {
            return { erros: ["Divisao incorreta das partes"], metadata: null, files: null, headers: null };
        }

        const metadata = raw_data.slice(part1 + 1, part2).map(l => l.split('=')).map(l => [l[0], l.slice(1).join('=')]);
        const alias = raw_data.slice(part2 + 1, part3).map(l => l.split('='));
        const headers = raw_data.slice(part4 + 1).map(l => l.split(':'));
        var files = raw_data.slice(part3 + 1, part4).concat(raw_data.slice(part4 + 1));
        files = alias.map(x => [
            x[0],
            files.filter(l => l.startsWith(x[1])).map(l => l.slice(x[1].length + 1))
        ]);
        const conf_lines = f => parseInt(metadata.filter(x => x[0] === 'lines' && x[1].endsWith(f[0]))[0][1].trim().split(' ')[0]);
        const erros = files.filter(f => f[1].length !== conf_lines(f)).map(f => [f[0], f[1].length, conf_lines(f)]);
        if (erros.length > 0) {
            return { erros: erros.map(e => e[0] + ' {R' + e[1] + 'E' + e[2] + '}'), metadata: null, files: null, headers: null };
        }
        return { erros: undefined, metadata, files, headers };
    }

    private part = (v, t) => v.filter(x => x[0] === t)[0][1];

    private getCSV = (v, t, h, s = ",") => {
        const lines = this.part(v, t);
        const header = h ? h.filter(x => x[0] === t)[0][1] : null;
        return CSV.fromLines(lines.filter(l => l !== header), s, header ? header.split(s) : []);
    }

    parse_dados_basicos(metadata, files, headers): string {

        metadata.filter(x => x[0] === "map").map(x => x[1]).forEach(x => this.addFator(x));
        const experimental_design = this.getCSV(files, 'experimental_design.csv', headers);
        this.setDesign(experimental_design);
        this.taxonomy = metadata
            .filter(x => x[0] === "gff" && x[1].startsWith('##species https://www.ncbi'))[0][1].trim().split(' ')[1];

        this.qc_status = this.getCSV(files, 'multiqc_general_stats.txt.csv', headers, '\t');
        this.qc_status.addCol('fator', r => r.Sample.replace(/.F$/, '').replace(/.R$/, ''));

        this.resumo = this.part(files, 'resumo.txt');
       
        const log = [
            ///Tamanho do genoma: 
            ///Quantiade de sequencias no genoma: 
            ///Quantidade de genes: 
            ///Quantidade de genes cod prot: 
            ///Quantiade de transcritos: 
            ///Tamanho total de transcritos: 
            ///Genes com AS anotado: 
            ///CDS de genes com AS anotado: 
            ///Tamanho total da CDS de genes com AS:
            /// xxxxxxx  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxMapeamento no $LABEL: 
            ///tratando $SAMPLE como 
            ///Surviving' 
            ///CDS expressa em $SAMPLE: 
            ///analise rMATS 
            ///analise 3DRnaSEQ  SIGNIFICATIVO genes" >> $RESUMO
            /// Total : ... AS genes encontrados | so rMATS $SO_RMATS | so 3DRNASEQ $SO_3D | ambos $AMBOS 
        ];

        return null;
    }

    parseGFF(files, headers): string {

        const transcript_gene_mapping = this.getCSV(files, 'transcript_gene_mapping.csv', headers);
        transcript_gene_mapping.getRows().forEach(r => {
            if (!this.gene2isos[r.GENEID]) this.gene2isos[r.GENEID] = [];
            this.gene2isos[r.GENEID].push(r.TXNAME);
            this.iso2gene[r.TXNAME] = r.GENEID;
        });

        const cromossomos = {};
        const valid_genes = Object.keys(this.gene2isos);
        const valid_mrnas = Object.keys(this.iso2gene);
        const as_gene_isos = this.part(files, 'all_as_isoforms.txt').map(x => x.split(','))
        const as_genes = as_gene_isos.map(x => x[0]);
        const as_isos = as_gene_isos.map(x => x[1]);
        this.as_genes = new Conj(as_genes.filter(g => valid_genes.includes(g))).uniq();
        this.as_isos = new Conj(as_isos.filter(i => valid_mrnas.includes(i))).uniq();

        const gene2mrna2cds2ptn = this.getCSV(files, 'gene2mrna2cds2ptn.csv', headers);
        const gene_test = this.as_genes[0];
        const mrna_test = this.as_isos[0];

        const gene_ok = gene2mrna2cds2ptn.get_col('gene').some(g => g === gene_test);
        const iso_mrna = gene2mrna2cds2ptn.get_col('mrna').some(g => g === mrna_test);
        const iso_cds = gene2mrna2cds2ptn.get_col('cds').some(g => g === mrna_test);
        //const iso_ptn = gene2mrna2cds2ptn.get_col('protein').some(g => g === mrna_test);

        if (!gene_ok) return "Gene " + gene_test + " NAO ENCONTRADO no MAPA";
        if (!iso_mrna && !iso_cds) return "mRNA " + mrna_test + " NAO ENCONTRADO no MAPA";

        const gff = this.part(files, 'gene.gff.min')
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
            });

        const gene_ids = gff
            .filter(x => x[2] === 'gene')
            .map(x => x[8].split('ID=')[1].split(';')[0]);

        if (!gene_ids.includes(gene_test)) {
            if (gene_ids.includes('gene-' + gene_test)) {
                console.warn("Genes do GFF com nome prefixado em `gene-` corrigindo.");
                this.gene_prefix = 5;
            } else
                return `Gene ${gene_test} NAO ENCONTRADO nos genes do GFF`;
        }

        const ptna_test = gene2mrna2cds2ptn.getRows().filter(g => g.gene === gene_test)[0].protein;
        const ptna_ver = gff.filter(x => x[8].includes(ptna_test));

        if (ptna_ver.length < 1) return "Protein " + ptna_test + " NAO ENCONTRADO no GFF";

        const qual_tipo_tem_prot = ptna_ver[0][2];
        const qual_prop_tem_prot = ptna_ver[0][8].split('=' + ptna_test)[0].split(';').reverse()[0] + '=';
        const qual_id = ptna_ver[0][8].split(';').filter(x => x.startsWith('ID='));
        const qual_parent = ptna_ver[0][8].split(';').filter(x => x.startsWith('Parent='));
        const qual_prop_id = qual_id.length > 0 ? (qual_id[0].split('=')[0] + '=') : null;
        const qual_prop_parent = qual_parent.length > 0 ? (qual_parent[0].split('=')[0] + '=') : null;

        const new_table = Object.fromEntries(gff.filter(x => x[2] === qual_tipo_tem_prot)
            .map(x => x[8])
            .filter(x => x.includes(qual_prop_tem_prot) &&
                ((qual_prop_id && x.includes(qual_prop_id)) || (qual_prop_parent && x.includes(qual_prop_parent))))
            .map(x => [
                x.split(qual_prop_tem_prot)[1].split(';')[0],
                [qual_prop_id && x.includes(qual_prop_id) ? x.split(qual_prop_id)[1].split(';')[0] : null,
                qual_prop_parent && x.includes(qual_prop_parent) ? x.split(qual_prop_parent)[1].split(';')[0] : null]
            ]));

        var full_table_gene2iso2ptn = [];
        this.as_isos.forEach(i => full_table_gene2iso2ptn.push([i]));
        full_table_gene2iso2ptn.forEach(x => x.push(this.iso2gene[x[0]]));
        const conv = Object.fromEntries(gene2mrna2cds2ptn.getRows().map(x => [iso_mrna ? x.mrna : x.cds, x.protein]))
        full_table_gene2iso2ptn.forEach(x => x.push(conv[x[0]]));
        full_table_gene2iso2ptn = full_table_gene2iso2ptn.map(x => x.concat(new_table[x[2]]));
        ///['lcl|NC_003070.9_cds_NP_001030925.1_25', 'AT1G01080', 'NP_001030925.1', 'cds-NP_001030925.1', 'rna-NM_001035848.1']

        const mrna_ids = gff
            .filter(x => x[2] === 'mRNA')
            .concat(gff.filter(x => x[2] === 'transcript'))
            .concat(gff.filter(x => x[2] === 'primary_transcript'))
            .map(x => x[8].split('ID=')[1].split(';')[0]);

        const line_test = full_table_gene2iso2ptn[0];
        const mrnaI = mrna_ids.includes(line_test[3]) ? 3 : mrna_ids.includes(line_test[4]) ? 4 : null;

        if (!mrnaI) return "CDS ou mRNA do GFF NAO possui ID da proteina.";

        this.full_map_table = full_table_gene2iso2ptn.map(x => [x[1], x[0], x[mrnaI], x[2]]);
        const adc = {};
        this.full_map_table.forEach(x => {
            !valid_genes.includes(x[0]) && valid_genes.push(x[0]);
            !valid_mrnas.includes(x[1]) && valid_genes.push(x[1]);
            !valid_mrnas.includes(x[2]) && valid_genes.push(x[2]);
            this.gene2isos[x[0]].push(x[1]);
            this.gene2isos[x[0]].push(x[2]);
            this.iso2gene[x[1]] = x[0];
            this.iso2gene[x[2]] = x[0];
            !this.as_genes.includes(x[0]) && this.as_genes.push(x[0]);
            !this.as_isos.includes(x[2]) && this.as_isos.push(x[2]);
            adc[x[2]] = [x[1], x[3]];
        });

        gff.forEach(
            l => {
                const crh_nome = l[0];
                const tipo = l[2];
                const locus = Locus.fromGFF(null, l, null);
                switch (tipo) {
                    case "region":
                        cromossomos[crh_nome] = new Cromossomo(crh_nome, locus.end + 1);
                        break;
                    case "gene":
                        locus.meta['NID'] = locus.meta.ID.slice(this.gene_prefix);
                        if (!this.as_genes.includes(locus.meta['NID']))
                            break;
                        if (cromossomos[crh_nome]) {
                            const gene = new Gene(
                                cromossomos[crh_nome], locus.start, locus.end, locus.strand, locus.meta.ID);
                            gene.meta = locus.meta;
                            cromossomos[crh_nome].addGene(gene);
                            this.genes[locus.meta['NID']] = gene;
                        } else {
                            console.warn(`Cromossomo ${crh_nome} not found: ${l}`);
                        }
                        break;
                    case 'mRNA':
                    case 'transcript':
                    case 'primary_transcript':
                        if (!this.as_isos.includes(locus.meta.ID))
                            break;
                        const mrna = new Isoforma(cromossomos[crh_nome], locus.start, locus.end, locus.strand, locus.meta.ID);
                        mrna.meta = locus.meta;
                        const gene = cromossomos[crh_nome].getGeneByID(mrna.meta.Parent);
                        if (gene) {
                            if (adc[mrna.meta.ID]) {
                                mrna.meta['MRNA'] = adc[mrna.meta.ID][0];
                                mrna.meta['PTNA'] = adc[mrna.meta.ID][1];
                                this.isoformas_FASTA[mrna.meta['MRNA']] = mrna;
                            } else {
                                console.warn(locus);
                            }
                            gene.addIsoforma(mrna);
                            this.isoformas_GFF[mrna.meta.ID] = mrna;
                        } else {
                            if (valid_genes.includes(mrna.meta.Parent))
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
                            if (valid_mrnas.includes(utr.meta.Parent))
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
                            if (valid_mrnas.includes(exon.meta.Parent))
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
                            if (valid_mrnas.includes(cds.meta.Parent))
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
    }

    parseTPM(files, headers) {

        const tpm_genes = this.getCSV(files, 'TPM_genes.csv', headers).getRows({ "@": x => x.replaceAll('"', '') });
        this.fatores.forEach(f => f.samples.forEach(s => s.fillTPM(tpm_genes)));
        tpm_genes.forEach(tpm => {
            if (this.as_genes.includes(tpm['@']))
                (this.genes[tpm['@']].tpm = tpm)
        });

        const tpm_trns = this.getCSV(files, 'TPM_trans.csv', headers).getRows({ "@": x => x.replaceAll('"', '') });
        this.fatores.forEach(f => f.samples.forEach(s => s.fillTPM(tpm_trns, false)));
        tpm_trns.forEach(tpm => {
            if (this.as_isos.includes(tpm['@'])) {
                var iso = this.isoformas_FASTA[tpm['@']];
                if (iso) {
                    iso.tpm = tpm;
                } else
                    iso = this.isoformas_GFF[tpm['@']];
                if (iso) {
                    iso.tpm = tpm;
                } else {
                    console.warn(`Isoforma ${tpm['@']} de AS e TPM não encontrada na lista.`);
                }
            }
        });

    }

    parseAnotacao(files) {
        const anotacao = this.part(files, 'anotacao.tsv').map(x => x.split('\t')).map(x => [x[0].split(',')[0], x]);
        this.getALLIsos().forEach(iso =>
            anotacao.filter(a => a[0] === iso.meta['PTNA']).map(a => a[1]).forEach(a => iso.add_anotacao(Anotacao.fromRaw(a)))
        );
    }

    parseCobertura(files) {
        this.part(files, 'cov_all.bed').map(x => x.split(',')).forEach(r => this.genes[r[1]].setBED(r));
    }

    parse3D(files, headers): string {

        const fnSTR = x => x.trim().replaceAll('"', '');
        const fnFloat = x => parseFloat(x);

        const Significant_DAS_genes = this
            .getCSV(files, 'Significant DAS genes list and statistics.csv', headers)
            .getRows({ "target": fnSTR, 'adj.pval': fnFloat, 'maxdeltaPS': fnFloat });

        const Significant_DE_genes = this.getCSV(files, 'Significant DE genes list and statistics.csv', headers)
            .getRows({ "target": fnSTR, 'adj.pval': fnFloat, 'log2FC': fnFloat });

        Significant_DAS_genes
            .forEach(das => this.genes[das["target"]] && this.das_genes.push(
                new AS3dranseq(this.genes[das["target"]], das)
            ));

        Significant_DE_genes
            .forEach(de => this.genes[de["target"]] && this.de_genes.push(
                new DifferentialExpression(this.genes[de["target"]], de['log2FC'], de['adj.pval'])
            ));

        return null;
    }

    parseRMATS(files, headers): string {

        const fnSTR = x => x.trim().replaceAll('"', '');
        const fnFloat = x => parseFloat(x);

        const mats_a3ss_sig = this.getCSV(files, 'sign_events_A3SS.tsv.csv', headers, '\t').get_col('ID');
        const mats_a5ss_sig = this.getCSV(files, 'sign_events_A5SS.tsv.csv', headers, '\t').get_col('ID');
        const mats_se_sig = this.getCSV(files, 'sign_events_SE.tsv.csv', headers, '\t').get_col('ID');
        const mats_ri_sig = this.getCSV(files, 'sign_events_RI.tsv.csv', headers, '\t').get_col('ID');

        const mats_a3ss = this.getCSV(files, 'A3SS.MATS.JCEC.txt.csv', headers, '\t');
        const mats_a5ss = this.getCSV(files, 'A5SS.MATS.JCEC.txt.csv', headers, '\t');
        const mats_se = this.getCSV(files, 'SE.MATS.JCEC.txt.csv', headers, '\t');
        const mats_ri = this.getCSV(files, 'RI.MATS.JCEC.txt.csv', headers, '\t');

        /// A3SS 'ID', 'GeneID', 'geneSymbol', 'chr', 'strand', 'longExonStart_0base', 'longExonEnd', 'shortES', 'shortEE', 'flankingES', 'flankingEE', 'ID', 'IJC_SAMPLE_1', 'SJC_SAMPLE_1', 'IJC_SAMPLE_2', 'SJC_SAMPLE_2', 'IncFormLen', 'SkipFormLen', 'PValue', 'FDR', 'IncLevel1', 'IncLevel2', 'IncLevelDifference']
        mats_a3ss
            .getRows({ "GeneID": fnSTR, 'IncLevelDifference': fnFloat, 'FDR': fnFloat })
            .map(e => Object.assign(e, { MASER: mats_a3ss_sig.includes(e.ID) }))
            .forEach(das => this.genes[das["GeneID"]] && this.das_genes.push(
                new ASrmats(this.genes[das["GeneID"]], das, 'A3SS')
            ));

        /// A5SS 'ID', 'GeneID', 'geneSymbol', 'chr', 'strand', 'longExonStart_0base', 'longExonEnd', 'shortES', 'shortEE', 'flankingES', 'flankingEE', 'ID', 'IJC_SAMPLE_1', 'SJC_SAMPLE_1', 'IJC_SAMPLE_2', 'SJC_SAMPLE_2', 'IncFormLen', 'SkipFormLen', 'PValue', 'FDR', 'IncLevel1', 'IncLevel2', 'IncLevelDifference']
        mats_a5ss
            .getRows({ "GeneID": fnSTR, 'IncLevelDifference': fnFloat, 'FDR': fnFloat })
            .map(e => Object.assign(e, { MASER: mats_a5ss_sig.includes(e.ID) }))
            .forEach(das => this.genes[das["GeneID"]] && this.das_genes.push(
                new ASrmats(this.genes[das["GeneID"]], das, 'A5SS')
            ));

        /// SE   'ID', 'GeneID', 'geneSymbol', 'chr', 'strand', 'exonStart_0base', 'exonEnd', 'upstreamES', 'upstreamEE', 'downstreamES', 'downstreamEE', 'ID', 'IJC_SAMPLE_1', 'SJC_SAMPLE_1', 'IJC_SAMPLE_2', 'SJC_SAMPLE_2', 'IncFormLen', 'SkipFormLen', 'PValue', 'FDR', 'IncLevel1', 'IncLevel2', 'IncLevelDifference']
        mats_se
            .getRows({ "GeneID": fnSTR, 'IncLevelDifference': fnFloat, 'FDR': fnFloat })
            .map(e => Object.assign(e, { MASER: mats_se_sig.includes(e.ID) }))
            .forEach(das => this.genes[das["GeneID"]] && this.das_genes.push(
                new ASrmats(this.genes[das["GeneID"]], das, 'SE')
            ));

        /// RI   'ID', 'GeneID', 'geneSymbol', 'chr', 'strand', 'riExonStart_0base', 'riExonEnd', 'upstreamES', 'upstreamEE', 'downstreamES', 'downstreamEE', 'ID', 'IJC_SAMPLE_1', 'SJC_SAMPLE_1', 'IJC_SAMPLE_2', 'SJC_SAMPLE_2', 'IncFormLen', 'SkipFormLen', 'PValue', 'FDR', 'IncLevel1', 'IncLevel2', 'IncLevelDifference']
        mats_ri
            .getRows({ "GeneID": fnSTR, 'IncLevelDifference': fnFloat, 'FDR': fnFloat })
            .map(e => Object.assign(e, { MASER: mats_ri_sig.includes(e.ID) }))
            .forEach(das => this.genes[das["GeneID"]] && this.das_genes.push(
                new ASrmats(this.genes[das["GeneID"]], das, 'RI')
            ));

        return null;
    }

    parseFiles(result, fn_status): string {

        fn_status(0);
        const metadata = result.metadata;
        const files = result.files;
        const headers = result.headers;

        var error_msg = null;
        var cont = 0;

        /// basicos
        if (error_msg = this.parse_dados_basicos(metadata, files, headers)) return error_msg;
        fn_status(cont += 10);

        /// gff
        if (error_msg = this.parseGFF(files, headers)) return error_msg;
        fn_status(cont += 10);

        /// 3d
        if (error_msg = this.parse3D(files, headers)) return error_msg;
        fn_status(cont += 10);

        /// rmats
        if (error_msg = this.parseRMATS(files, headers)) return error_msg;
        fn_status(cont += 10);

        /// tpm
        setTimeout(() => { this.parseTPM(files, headers); fn_status(cont += 20) }, 200); //60

        /// anotacao
        setTimeout(() => { this.parseAnotacao(files); fn_status(cont += 20) }, 300); //80

        ///cobertura
        setTimeout(() => { this.parseCobertura(files); fn_status(cont += 20) }, 500); //100

    }
}
