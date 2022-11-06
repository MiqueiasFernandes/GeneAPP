<route lang="json">
{
    "meta": {
        "title": "Overview",
        "description": "Overview of experiment",
        "ordem": 3,
        "fbgc": "bg-indigo-800 text-white",
        "hfbgc": "bg-indigo-600 hover:bg-indigo-500 text-white",
        "rqproj": true
    }
}
</route>
      
<script setup>
import { onMounted, onUpdated, ref } from 'vue';
import { TableIcon, PresentationChartLineIcon } from '@heroicons/vue/solid';
import { CursorClickIcon, DownloadIcon } from '@heroicons/vue/outline';
import {
    Canvas, ViewBox, VennPlot, RadarPlot, Padding, BarPlotRadial, FunilPlot,
    BarPlot, BarPlotVertical, ViolinPlot, AreaPlot, UpsetPlot, DendogramPlot
} from '../core/d3';
import { PROJETO } from "../core/State";
useHead({ title: 'Overview' });

const projeto = PROJETO;
const HEIGHT = 300;

function plotQC(wC) {
    const W = wC * 2;
    const H = HEIGHT;
    const viewBox = ViewBox.fromSize(W, H, Padding.simetric(10));
    const canvas = new Canvas('graphQc', viewBox)//, '#efefef');

    const dataSet = projeto.qc_status
        .mapColInt("FastQC_mqc-generalstats-fastqc-avg_sequence_length")
        .mapColInt("FastQC_mqc-generalstats-fastqc-total_sequences")
        .mapCol("FastQC_mqc-generalstats-fastqc-percent_fails", parseFloat)
        .getRows();

    plots['graphQc'] = new BarPlotRadial()
        .setX("Sample")
        .setY("FastQC_mqc-generalstats-fastqc-total_sequences")
        .setY3("FastQC_mqc-generalstats-fastqc-avg_sequence_length")
        .setY2("FastQC_mqc-generalstats-fastqc-percent_fails")
        .set_ylim2(0, 100)
        .setColor2(() => 'red')
        .setColor((d) => projeto.getFatorBySample(d.fator).cor)
        .set_y2lab(x => parseInt(x) + '%')
        .setCanvas(canvas, viewBox)
        .setTitle('QC')
        .plot(dataSet)
}

function plotRd(wC) {
    const W = wC * 2;
    const H = HEIGHT;
    const data = projeto.getResumo('Mapeamento de ').map(x => x.split('Mapeamento de ')[1]);

    const as_genes = data.filter(x => x.indexOf(' AS_GENES: ') > 0).map(x => [x.split(' ')[0], parseFloat(x.trim().split(' ')[3].replace('%', ''))])
    const cds = data.filter(x => x.indexOf(' CDS: ') > 0).map(x => [x.split(' ')[0], parseFloat(x.trim().split(' ')[3].replace('%', ''))])
    const genoma = data.filter(x => x.indexOf(' GENOMA: ') > 0).map(x => [x.split(' ')[0], parseFloat(x.trim().split(' ')[3].replace('%', ''))])

    const viewBox = ViewBox.fromSize(W, H, Padding.simetric(20));

    plots['graphRd'] = new RadarPlot('graphRd', viewBox)
        .setFill(x => { const cs = { "ASGENES": 'red', "CDS": 'green', "Genoma": 'yellow', xpto: 'yellow', smp5: 'orange', smp6: 'gray' }; return cs[x] })
        .plot({
            "ASGENES": Object.fromEntries(as_genes),
            "CDS": Object.fromEntries(cds),
            "Genoma": Object.fromEntries(genoma)
        }, [0, 100]);
}

function plotMp(wC) {
    const W = wC * 2;
    const H = HEIGHT;

    const viewBox = ViewBox.fromSize(W, H, Padding.simetric(20));

    const data = projeto.getResumo('AS genes encontrados | so rMATS')[0].split('|');

    plots['graphMp'] = new VennPlot('graphMp', viewBox)
        .plot(Object.fromEntries(data.map((x, i) =>
            i == 1 ? ['A', parseInt(x.split('rMATS ')[1].trim())] :
                i == 2 ? ['B', parseInt(x.split('3DRNASEQ ')[1].trim())] :
                    i == 3 ? ['AB', parseInt(x.split('ambos ')[1].trim())] :
                        ['', '']
        ).concat([['A_LAB', 'rMATS'], ['B_LAB', '3DRNASeq']])));
}

function plotGs(wC, texp) {
    const W = wC * 3;
    const H = HEIGHT;
    const viewBox = ViewBox.fromSize(W, H, Padding.simetric(10));

    const total = parseInt(projeto.getResumo('Quantidade de genes:')[0].split(': ')[1]);
    const cod = parseInt(projeto.getResumo('Quantidade de genes cod prot:')[0].split(': ')[1]);
    const as = parseInt(projeto.getResumo('Genes com AS anotado:')[0].split(': ')[1]);
    const here = parseInt(projeto.getResumo('AS genes encontrados | so rMATS')[0].split('Total : ')[1].split(' ')[0])

    plots['graphAs'] = new FunilPlot('graphAs', viewBox).plot([
        { step: 1, name: 'Total Gene repertory', value: total },
        { step: 2, name: 'Protein Coding', value: cod },
        { step: 3, name: 'A.S. annotated', value: as },
        { step: 4, name: 'Expressed', value: texp },
        { step: 5, name: 'D.A.S', value: here },
    ]);
}

function plotGc(wC) {
    const W = wC * 6;
    const H = HEIGHT;
    const viewBox = ViewBox.fromSize(W, H, Padding.simetric(20));
    const canvas = new Canvas('graphGc', viewBox);
    const boxes = viewBox.splitX(7);

    boxes.forEach((box, i) => {

        var obs = [];
        var k = 0;
        var smoth = 10;
        var tick = 50;
        var a = 1;
        var b = null;
        var t = 'G' + i;

        i === k++ && (t = 'Gene Size') && (b = 10000) && (obs = projeto.getALLGenes().map(g => g.size));
        i === k++ && (t = 'CDS Size') && (b = 10000) && (obs = projeto.getALLASIsos().map(i => i.getCDS().getLoci().map(l => l.size).reduce((p, c) => p + c)));
        i === k++ && (t = 'Intronic Size') && (b = 10000) && (obs = projeto.getALLGenes().map(g => g.getIsoformas().map(i => i.getIntrons().map(i => i.size).reduce((p, c) => p + c, 0)).reduce((p, c) => p + c, 0) / g.getIsoformas().length));
        i === k++ && (t = 'Intron Size') && (b = 3000) && (obs = projeto.getALLASIsos().map(i => i.getIntrons().map(i => i.size).join(',')).join(',').split(',').map(x => parseInt(0 + x)));
        i === k++ && (t = 'Exon Size') && (b = 3000) && (obs = projeto.getALLASIsos().map(i => i.getExons().map(i => i.size).join(',')).join(',').split(',').map(x => parseInt(0 + x)));
        //i === k++ && (t = 'UTR Size') && (b = 3000) && (obs = projeto.getALLASIsos().map(i => (0||i.getUTR()[0])+(0||i.getUTR()[1])).join(',').split(',').map(x => parseInt(0 + x)));
        i === k++ && (t = 'Qtd. mRNA/Gene') && (b = 30) && (smoth = 6) && (obs = projeto.getALLGenes().map(g => g.getIsoformas().length));
        i === k++ && (t = 'Qtd. Exons') && (b = 30) && (smoth = 6) && (obs = projeto.getALLASIsos().map(i => i.getExons().length));

        ///conferir se esta calibrado
        ///obs = ',20'.repeat(10000).slice(1).split(',').map(x => parseInt(x)).concat(obs)

        plots['graphGc'] = new ViolinPlot()
            .setCanvas(canvas, box.addPaddingY(20).toPadding(Padding.left(30)))
            .setTitle(t)
            .setColor(_ => 'mediumspringgreen')
            .plot(obs, a, b, smoth, tick);
    })

}

function plotCv(wC) {
    const W = wC * 4;
    const H = HEIGHT;
    const viewBox = ViewBox.fromSize(W, H, new Padding(10, 20, 30, 60));

    const covs = {};
    projeto.fatores.forEach(fator => {
        fator.samples.forEach(sample => {
            const all = [];
            for (var i = 0; i <= 100; i++) all.push(0);
            covs[sample.nome] = all;
        })
    });

    projeto.getALLGenes().forEach(gene => {
        const size = gene.size;
        Object.entries(gene.getBED()).forEach(samp_bed => {
            const sample = samp_bed[0];
            samp_bed[1].forEach(s_e_tpm => {
                covs[sample][parseInt(s_e_tpm[0] * 100 / size)] += s_e_tpm[2]
            })
        })
    });

    plots['graphCv'] = new AreaPlot('graphCv', viewBox)
        .setColor(d => projeto.getFatorBySample(d.key).cor)
        .plot(covs, 100);
}

function plotAn(wC) {
    const W = wC * 2.5;
    const H = HEIGHT;
    const viewBox = ViewBox.fromSize(W, H, new Padding(15, 50, 30, 80));

    const data = {
        GO: { genes: [], anotacao: [] },
        Pathways: { genes: [], anotacao: [] },
        Interpro: { genes: [], anotacao: [] },
        PFam: { genes: [], anotacao: [] },
        Other: { genes: [], anotacao: [] }
    }

    projeto.getALLASIsos().forEach(iso => {
        const g = iso.getGene().nome;
        iso.anotacoes.forEach(a => {
            const x = a.get('acession');
            switch (a.key) {
                case 'Pfam': return data.PFam.genes.push(g) && data.PFam.anotacao.push(x)
                case 'InterPro': return data.Interpro.genes.push(g) && data.Interpro.anotacao.push(x)
                case 'GO': return data.GO.genes.push(g) && data.GO.anotacao.push(x)
                case 'Pathway': return data.Pathways.genes.push(g) && data.Pathways.anotacao.push(x)
                case 'Other': return data.Other.genes.push(g) && data.Other.anotacao.push(x)
            }
        })
    })

    const datax = [
        { tipo: 'GO', genes: [...new Set(data.GO.genes)].length, anotacao: [...new Set(data.GO.anotacao)].length },
        { tipo: 'Pathways', genes: [...new Set(data.Pathways.genes)].length, anotacao: [...new Set(data.Pathways.anotacao)].length },
        { tipo: 'Interpro', genes: [...new Set(data.Interpro.genes)].length, anotacao: [...new Set(data.Interpro.anotacao)].length },
        { tipo: 'PFam', genes: [...new Set(data.PFam.genes)].length, anotacao: [...new Set(data.PFam.anotacao)].length },
        { tipo: 'Other', genes: [...new Set(data.Other.genes)].length, anotacao: [...new Set(data.Other.anotacao)].length },
    ];

    plots['graphAn'] = new BarPlotVertical('graphAn', viewBox)
        .setX('tipo')
        .setY('genes')
        .setY2('anotacao')
        .setColor(_ => '#66f5f7')
        .setColor2(_ => '#d0ff00')
        .hidleAx()
        .plot(datax)
        .legend({ t: 'Qtd. genes', c: '#66f5f7' }, { t: 'Qtd. anotattions', c: '#d0ff00' })

}

function plotEx(wC) {
    const W = wC * 3;
    const H = HEIGHT;
    const viewBox = ViewBox.fromSize(W, H, new Padding(10, 10, 50, 60));

    const exp = {}

    projeto.fatores.forEach(fator => {
        exp[fator.nome] = []
        fator.samples.forEach(sample => {
            exp[fator.nome] = exp[fator.nome].concat(Object.entries(sample.tpm_genes).filter(x => x[1] > 10).map(([X, _]) => X))
        })
        exp[fator.nome] = [... new Set(exp[fator.nome])]
    });

    const data = {
        'a': exp[projeto.fatores[0].nome].length,
        'b': exp[projeto.fatores[1].nome].length
    }

    const texp = data['ab'] = [... new Set(exp[projeto.fatores[0].nome].concat(exp[projeto.fatores[1].nome]))].length

    data[''] = parseInt(projeto.getResumo('Genes com AS anotado:').map(x => x.split(':')[1])[0].trim());

    plots['graphUp'] = new UpsetPlot('graphUp', viewBox)
        .plot(data, {
            'a': projeto.fatores[0].nome,
            'b': projeto.fatores[1].nome
        }, Object.fromEntries(projeto.fatores.map(f => [f.nome, f.cor])))

    return texp
}

function plotFilo(wC) {
    const W = wC * 7;
    const H = HEIGHT * 3.5;
    const viewBox = ViewBox.fromSize(W, H, Padding.simetric(0));

    const data = projeto.getFilogenia();
    if (!data) return;

    plots['graphFi'] = new DendogramPlot('graphFi', viewBox).plot(data)
}

const show = ref(false);

const tablePR = ref([])
const tablePRheader = [
    { meta: { id: 'etapa', lab: 'Step', ord: 0 } },
    { meta: { id: 'tool', lab: 'Tool', ord: 1 } },
    { meta: { id: 'fator', lab: 'Factor', ord: 2 } },
    { meta: { id: 'sample', lab: 'Sample', ord: 3 } },
    { meta: { id: 'prop', lab: 'Property', ord: 4 } },
    { meta: { id: 'val', lab: 'Value', ord: 5, class: 'font-mono font-bold' } }
]

const tableED = ref([])
const tableEDheader = [
    { meta: { id: 'fator', lab: 'Factor', ord: 1 } },
    { meta: { id: 'sample', lab: 'Sample', ord: 2 } },
    { meta: { id: 'tipo', lab: 'Library', ord: 3 } },
    { meta: { id: 'run', lab: 'Run', ord: 4 } },
    { meta: { id: 'quantidate', lab: 'Reads', ord: 5 } },
    { meta: { id: 'tamanho', lab: 'Length', ord: 6 } },
    { meta: { id: 'qc', lab: 'QC Fail', ord: 7 } },
    { meta: { id: 'map', lab: 'Mapping', ord: 8 } }
]

function loadTables() {


    const dataSet = projeto.qc_status
        .mapColInt("FastQC_mqc-generalstats-fastqc-avg_sequence_length") //// media de tamanho
        .mapColInt("FastQC_mqc-generalstats-fastqc-total_sequences")   //// quantidade
        .mapCol("FastQC_mqc-generalstats-fastqc-percent_fails", parseFloat) ////falhou qc
        .getRows();

    const qtdR = dataSet.map(x => x["FastQC_mqc-generalstats-fastqc-total_sequences"]).reduce((a, b) => a + b, 0)
    const lenR = dataSet.map(x => x["FastQC_mqc-generalstats-fastqc-avg_sequence_length"]).reduce((a, b) => a + b, 0) / dataSet.length;

    const getProp = (a, b, c) => {
        const ops = PROJETO.getResumo(a)
            .filter(x => !b || x.indexOf(b) > 0)
            .map(x => a && b ? (x.split(a)[1].split(b)[0]) : x)
        return ops.length > 0 ? ops.map(x => c ? x.split(': ')[1] : x) : ['']
    }
    const getProp2 = (x) => getProp(x, null, true)[0]

    /// tabela processamento
    const rs = [
        { etapa: 'Pre processamento', prop: 'Genome Size', val: getProp2('Tamanho do genoma: ') },
        { etapa: 'Pre processamento', prop: 'Cromossomes', val: getProp2('sequencias no genoma: ') },
        { etapa: 'Pre processamento', prop: 'Total genes', val: getProp2('Quantidade de genes: ') },
        { etapa: 'Pre processamento', prop: 'Genes coding', val: getProp2('Quantidade de genes cod prot: ') },
        { etapa: 'Pre processamento', prop: 'AS Genes coding', val: getProp2('Genes com AS anotado:') },
        { etapa: 'Pre processamento', prop: 'Transcripts', val: getProp2('Quantiade de transcritos:') },
        { etapa: 'Pre processamento', prop: 'Transcriptome length', val: getProp2('ho total de transcritos:') },
        { etapa: 'Pre processamento', prop: 'Transcripts coding', val: getProp2('CDS de genes com AS anotado:') },
        { etapa: 'Pre processamento', prop: 'AS Genes transcripts coding length', val: getProp2('total da CDS de genes com AS:') },
        { etapa: 'Pre processamento', prop: 'RNASeq reads', val: `${(qtdR / 1000000).toPrecision(3)}mi` },
        { etapa: 'Pre processamento', prop: 'RNASeq read length', val: lenR },
        { etapa: 'Pre processamento', prop: 'Transcritome depth', val: ((qtdR * lenR) / (parseInt(getProp2('ho total de transcritos:').replace('Mpb', '') * 1000000))).toPrecision(3) + 'x' },
        //{ etapa: 'Pre processamento', prop: 'Transcritome coding coverage', val: '' },
    ]

    const rs2 = []
    PROJETO.fatores.forEach(f => f.samples.forEach(s => rs2.push(...[
        { etapa: 'Align', tool: 'Hisat', fator: f.nome, sample: s.nome, prop: 'Mapping Genome', val: getProp(`ento de ${s.nome} no GENOMA: `, ' overall ali')[0] },
        { etapa: 'Align', tool: 'Hisat', fator: f.nome, sample: s.nome, prop: 'Mapping Transcripts', val: getProp(`ento de ${s.nome} no CDS: `, ' overall ali')[0] },
        { etapa: 'Align', tool: 'Hisat', fator: f.nome, sample: s.nome, prop: 'Mapping AS Genes', val: getProp(`ento de ${s.nome} no AS_GENES: `, ' overall ali')[0] },
        { etapa: 'Align', tool: 'Salmon', fator: f.nome, sample: s.nome, prop: 'Quantify AS Genes transcripts', val: (parseInt(getProp2(`CDS expressa em ${s.nome}: `)) / parseInt(getProp2('CDS de genes com AS anotado:')) * 100).toPrecision(3) + '%' },
    ])))

    const gns = PROJETO.getALLGenes().map(g => g.getAS())
    const anot1 = (x) => [...new Set(PROJETO.getALLASIsos().filter(i => i.getAnots(x).length > 0).map(x => x.getGene().nome))]
    const anot2 = (x) => [...new Set(PROJETO.getALLASIsos().map(i => i.getAnots(x).map(x => x.value)).reduce((a, b) => a.concat(b), []))]
    const anot3 = () => PROJETO.getALLASIsos().map(i => i.getAnots('InterPro').map(x => x.size()).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0)
    const rs3 = [
        { etapa: 'Discovery', tool: 'rMATS', prop: 'Bam 1', val: getProp('factor ', '.bams escolhido para --b1')[0] },
        { etapa: 'Discovery', tool: 'rMATS', prop: 'Bam 2', val: getProp('factor ', '.bams escolhido para --b2')[0] },
        { etapa: 'Discovery', tool: 'rMATS', prop: 'Total Events', val: getProp('rMATS encontrou ', 'total  even')[0] },
        { etapa: 'Discovery', tool: 'Maser', prop: 'Total Events', val: getProp('analise rMATS ', ' SIGNIFICATIVO ge')[0] },
        { etapa: 'Discovery', tool: 'Maser', prop: 'A3SS genes', val: gns.filter(es => es.some(e => e['tipo'] === 'A3SS' && e.extra['MASER'])).length },
        { etapa: 'Discovery', tool: 'Maser', prop: 'A5SS genes', val: gns.filter(es => es.some(e => e['tipo'] === 'A5SS' && e.extra['MASER'])).length },
        { etapa: 'Discovery', tool: 'Maser', prop: 'RI genes', val: gns.filter(es => es.some(e => e['tipo'] === 'RI' && e.extra['MASER'])).length },
        { etapa: 'Discovery', tool: 'Maser', prop: 'SE genes', val: gns.filter(es => es.some(e => e['tipo'] === 'SE' && e.extra['MASER'])).length },
        { etapa: 'Discovery', tool: '3DRNASeq', prop: 'Total DAS genes', val: PROJETO.getALLDASgenes().length },
        { etapa: 'Discovery', tool: '3DRNASeq', prop: 'Sign DAS genes', val: getProp('analise 3DRnaSEQ ', ' SIGNIFICA')[0] },
        { etapa: 'Discovery', tool: '3DRNASeq', prop: 'Sign DE genes', val: PROJETO.Significant_DE_genes.length },
        { etapa: 'Discovery', prop: 'DAS Genes some evidence', val: getProp('Total : ', ' AS genes encontrados |')[0] },
        { etapa: 'Discovery', prop: 'DAS Genes multiple evidence', val: getProp('| ambos ', ' |')[0] },

        { etapa: 'Anotation', prop: 'Proteome size', val: '' },
        { etapa: 'Anotation', prop: 'Proteome length', val: '' },
        { etapa: 'Anotation', prop: 'Proteins to anotte', val: '' },
        { etapa: 'Anotation', prop: 'Proteins to anotte length', val: '' },
        { etapa: 'Anotation', tool: 'InterproScan', prop: 'PFam: found Genes', val: anot1('Pfam').length },
        { etapa: 'Anotation', tool: 'InterproScan', prop: 'PFam: found Acessions', val: anot2('Pfam').length },
        { etapa: 'Anotation', tool: 'InterproScan', prop: 'Interpro: found Genes', val: anot1('InterPro').length },
        { etapa: 'Anotation', tool: 'InterproScan', prop: 'Interpro: found Acessions', val: anot2('InterPro').length },
        { etapa: 'Anotation', tool: 'InterproScan', prop: 'GO: found Genes', val: anot1('GO').length },
        { etapa: 'Anotation', tool: 'InterproScan', prop: 'GO: found Acessions', val: anot2('GO').length },
        { etapa: 'Anotation', tool: 'InterproScan', prop: 'Pathways: found Genes', val: anot1('Pathway').length },
        { etapa: 'Anotation', tool: 'InterproScan', prop: 'Pathways: found Acessions', val: anot2('Pathway').length },
        { etapa: 'Anotation', prop: 'Total length proteins with domains', val: anot3() },

        { etapa: 'BED Generation', tool: 'deeptools', prop: 'Total genes with bed', val: '' },
        { etapa: 'BED Generation', tool: 'deeptools', prop: 'TPM min', val: '' },
        { etapa: 'BED Generation', tool: 'deeptools', prop: 'TPM max', val: '' },
        { etapa: 'BED Generation', tool: 'deeptools', prop: 'Total AS Gene coverage', val: '' },
    ]

    tablePR.value = rs.concat(rs2).concat(rs3)

    /// tabela experimental design
    /// 1. fator
    /// 2. amostra
    /// 3. run

    const dt = []
    dt.push(...PROJETO.getCtrl().samples.map(s => ({ fator: s.fator, sample: s.nome, run: s.run })))
    dt.push(...PROJETO.getTrat().samples.map(s => ({ fator: s.fator, sample: s.nome, run: s.run })))


    /// 4. total reads
    //  5. taamnho
    /// 6. Qc falhou %
    /// 7. % mapeda genoma

    const resumo2 = PROJETO.getResumo('overall alignment rate')
        .filter(x => x.indexOf('GENOMA:') > 0)
        .map(x => [x.split(' de ')[1].split(' ')[0], x.split(' GENOMA: ')[1].split(' ')[0]])

    const resumo3 = PROJETO.getResumo(' tratando ')
        .filter(x => x.indexOf(' como ') > 0)
        .map(x => [x.split(' tratando ')[1].split(' ')[0], x.split(' como ')[1].split(' ')[0]])

    dt.forEach(d => {

        const oar = resumo2.filter(x => x[0].startsWith(d.sample))
        if (oar.length > 0) {
            d.map = oar[0][1]
        }
        const tp = resumo3.filter(x => x[0].startsWith(d.sample))
        if (tp.length > 0) {
            d.tipo = tp[0][1]
        }

        const ss = dataSet.filter(x => x.Sample.startsWith(d.sample))
        if (ss.length > 0) {
            d.tamanho = ss[0]["FastQC_mqc-generalstats-fastqc-avg_sequence_length"]
            d.quantidate = ss[0]["FastQC_mqc-generalstats-fastqc-total_sequences"]
            d.qc = ss[0]["FastQC_mqc-generalstats-fastqc-percent_fails"].toPrecision(2) + '%'
        }
    })

    /// 8. QC reads %
    // ////Input Read Pairs: ...   Dropped:

    const resumo1 = PROJETO.getResumo('Input Read Pairs:')
    console.log(resumo1)

    tableED.value = dt


}

function criar() {
    show.value = true;
    const wC = 1100 / 7;
    setTimeout(() => {
        loadTables();
        plotQC(wC);
        plotRd(wC);
        plotMp(wC);
        plotGc(wC);
        plotCv(wC);
        plotAn(wC);
        const texp = plotEx(wC);
        plotGs(wC, texp);
        plotFilo(wC);
        projeto.addResultados(Object.fromEntries(Object.entries(plots).filter(([_, X]) => X.download())
            .map(([K, V]) => [K + '.svg', {
                data: V.download(), tipo: 'image/svg+xml'
            }])))
    }, 300);
}

onMounted(() => (show.value = false) || (setTimeout(() => criar(), 300)))
onUpdated(() => (show.value = false) || (setTimeout(() => criar(), 300)))

const plots = {}
const graficos = [
    [
        { id: 'graphUp', titulo: 'Gene expression' },
        { id: 'graphAs', titulo: 'Gene Funnil' }
    ],
    [
        { id: 'graphCv', titulo: 'Gene read dept and coverage' },
        { id: 'graphAn', titulo: 'Protein anotattion' }
    ],
    [
        { id: 'graphQc', titulo: 'Quality Control' },
        { id: 'graphRd', titulo: 'Read Mapping mRNA,CDS,Genome' },
        { id: 'graphMp', titulo: 'AS Discovery' }
    ],
    [
        { id: 'graphFi', titulo: 'AS Gene phtlogeni' }
    ],
    [
        { id: 'graphGc', titulo: 'Genomic Structure context' }
    ]
];

const cols = ['Etapa', 'Tool', 'Fator', 'Sample', 'Propriedade', 'Valor'];
const rows = [
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
];


</script>
    
<template>
    <div>
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Tabs :names="['table', 'table2', 'table3', 'chart']" active="table">


                <template #table>
                    <TableIcon class="mr-2 w-5 h-5" /> Pipeline results
                </template>
                <template #tableContent>
                    <Table class="my-4" :cols="tablePRheader" :rows="tablePR"></Table>
                </template>

                <template #table2>
                    <TableIcon class="mr-2 w-5 h-5" /> Experimental design
                </template>
                <template #table2Content>
                    <Table class="my-4" :cols="tableEDheader" :rows="tableED" indexed="true"></Table>
                </template>

                <template #table3>
                    <TableIcon class="mr-2 w-5 h-5" /> Gene repertory
                </template>
                <template #table3Content>
                    <Table class="my-4" :cols="cols" :rows="rows"></Table>
                </template>




                <template #chart>
                    <PresentationChartLineIcon class="mr-2 w-5 h-5" /> Graphics
                </template>
                <template #chartContent>

                    <Button class="m-4" v-if="!show" @click="criar()">
                        <CursorClickIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" /> Plot
                    </Button>

                    <template v-else>
                        <div class="flex flex-wrap justify-center justify-evenly content-evenly"
                            v-for="row in graficos">
                            <div class="m-4 rounded-md shadow-md bg-gray-200" v-for="grafico in row">
                                <div class="w-full flex justify-center" :id="grafico.id">
                                    <Imagem class="m-8"></Imagem>
                                </div>
                                <div
                                    class="w-full bg-gray-100 px-6 pt-4 pb-2 text-gray-700  font-bold text-xl text-center flex  items-center justify-center">
                                    <span class="mx-4"> {{ grafico.titulo }}</span>
                                    <button @click="plots[grafico.id].baixar(grafico.id + '.svg')"
                                        class="place-self-end bg-white dark:bg-slate-800 p-2 w-8 h-8 ring-1 ring-slate-900/5 dark:ring-slate-200/20 shadow-md rounded-full flex items-center justify-center">
                                        <DownloadIcon class="w-6 h-6 text-violet-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </template>

                </template>

            </Tabs>

        </div>
    </div>
</template>
    