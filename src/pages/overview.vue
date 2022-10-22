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
import { TableIcon, PresentationChartLineIcon, } from '@heroicons/vue/solid';
import { CursorClickIcon } from '@heroicons/vue/outline';
import {
    Canvas, ViewBox, VennPlot, RadarPlot, Padding, BarPlotRadial, FunilPlot,
    BarPlot, BarPlotVertical, ViolinPlot, AreaPlot, UpsetPlot, DendogramPlot
} from '../core/d3';
import { PROJETO } from "../core/State";
useHead({ title: 'Overview' });

const projeto = PROJETO;
const HEIGHT = 300;

function plotQC(wC) {
    // "Sample"
    // "FastQC_mqc-generalstats-fastqc-percent_duplicates"
    // "FastQC_mqc-generalstats-fastqc-percent_gc"
    // "FastQC_mqc-generalstats-fastqc-percent_fails"
    // "FastQC_mqc-generalstats-fastqc-total_sequences"

    const W = wC * 2;
    const H = HEIGHT;

    const viewBox = ViewBox.fromSize(W, H, Padding.simetric(10));
    const canvas = new Canvas('graphQc', viewBox)//, '#efefef');

    const dataSet = projeto.qc_status
        .mapColInt("FastQC_mqc-generalstats-fastqc-avg_sequence_length")
        .mapColInt("FastQC_mqc-generalstats-fastqc-total_sequences")
        .mapCol("FastQC_mqc-generalstats-fastqc-percent_fails", parseFloat)
        .getRows();

    //const boxs = viewBox.splitX(2, 10);

    new BarPlotRadial()
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

    new RadarPlot('graphRd', viewBox)
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

    new VennPlot('graphMp', viewBox)
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

    new FunilPlot('graphAs', viewBox).plot([
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

        new ViolinPlot()
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

    new AreaPlot('graphCv', viewBox)
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

    new BarPlotVertical('graphAn', viewBox)
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

    new UpsetPlot('graphUp', viewBox)
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

    new DendogramPlot('graphFi', viewBox).plot(data)
}

const show = ref(false);

function criar() {
    show.value = true;
    const wC = 1100 / 7;
    setTimeout(() => {
        plotQC(wC);
        plotRd(wC);
        plotMp(wC);
        plotGc(wC);
        plotCv(wC);
        plotAn(wC);
        const texp = plotEx(wC);
        plotGs(wC, texp);
        plotFilo(wC);
    }, 300);
}

onMounted(() => (show.value = false) || (setTimeout(() => criar(), 300)))
onUpdated(() => (show.value = false) || (setTimeout(() => criar(), 300)))

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
    <div class="bg-gray-50">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">


            <Tabs :names="['table', 'chart']" active="chart">

                <template #table>
                    <TableIcon class="mr-2 w-5 h-5" /> Table
                </template>
                <template #tableContent>
                    <Table class="m-4" :cols="cols" :rows="rows"></Table>
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
                                <div class="w-full flex justify-center" :id="grafico.id"></div>
                                <div
                                    class="w-full bg-gray-100 px-6 pt-4 pb-2 text-gray-700  font-bold text-xl text-center ">
                                    {{grafico.titulo}}
                                </div>
                            </div>
                        </div>
                    </template>

                </template>

            </Tabs>

        </div>
    </div>
</template>
    