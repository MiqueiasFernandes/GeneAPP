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
import { onMounted } from 'vue';
import { TableIcon, PresentationChartLineIcon } from '@heroicons/vue/solid';
import { Canvas, ViewBox, VennPlot, RadarPlot, Padding, BarPlotRadial, BarPlot, ViolinPlot, AreaPlot } from '../core/d3';
import { PROJETO } from "../core/State";
import { CSV } from '../core/utils/CSV';
useHead({ title: 'Overview' });

const projeto = PROJETO;
const HEIGHT = 300;

const cors = ['red', 'green', 'blue', 'yellow', 'pink', 'gray', 'orange', 'purple']
var x = 0;


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


    // const boxs = viewBox.splitX(3, 10);
    // canvas.rect(boxs[0].getBoxX0(), boxs[0].getBoxY0(), boxs[0].getBoxSize().width, boxs[0].getBoxSize().height, 'blue', 0, .4);
    // canvas.rect(boxs[1].getBoxX0(), boxs[1].getBoxY0(), boxs[1].getBoxSize().width, boxs[1].getBoxSize().height, 'orange', 0, .3);
    // const sy =   boxs[2].splitY(3, 20);
    // const sya = sy[0];
    // const syb= sy[1];
    // const syc = sy[2];
    // canvas.rect(sya.getBoxX0(), sya.getBoxY0(), sya.getBoxSize().width, sya.getBoxSize().height, 'green', 0, .3);
    // canvas.rect(syb.getBoxX0(), syb.getBoxY0(), syb.getBoxSize().width, syb.getBoxSize().height, 'blue', 0, .3);
    // canvas.rect(syc.getBoxX0(), syc.getBoxY0(), syc.getBoxSize().width, syc.getBoxSize().height, 'red', 0, .3);

    // new BarPlot()
    //     .setX("Sample")
    //     .setY("FastQC_mqc-generalstats-fastqc-avg_sequence_length")
    //     .setYlim([0, 160])
    //     .setColor((d) => projeto.getFatorBySample(d.fator).cor)
    //     .setCanvas(canvas, boxs[0])
    //     .plot(dataSet);

    // new BarPlot()
    //     .setX("Sample")
    //     .setY("FastQC_mqc-generalstats-fastqc-total_sequences")
    //     .setColor((d) => projeto.getFatorBySample(d.fator).cor)
    //     .setCanvas(canvas, boxs[1])
    //     .plot(dataSet);

    // canvas.rect(boxs[2].getBoxX0(), boxs[2].getBoxY0(), boxs[2].getBoxSize().width, boxs[2].getBoxSize().height, 'red', 0, .3);



    // new LinePlot()
    //     .setX("x")
    //     .setY("y")
    //     .setYlim([0, 5])
    //     .setCanvas(canvas,  boxs[2])
    //     .plot([ {x: 1, y: 3} , {x: 2, y: 4} , {x: 3, y: 1} , ]);

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

function plotGs(wC) {
    const W = wC;
    const H = HEIGHT;
    const viewBox = ViewBox.fromSize(W, H, new Padding(30, 10, 80, 50));

    const total = parseInt(projeto.getResumo('Quantidade de genes:')[0].split(': ')[1]);
    const cod = parseInt(projeto.getResumo('Quantidade de genes cod prot:')[0].split(': ')[1]);
    const as = parseInt(projeto.getResumo('Genes com AS anotado:')[0].split(': ')[1]);
    const here = parseInt(projeto.getResumo('AS genes encontrados | so rMATS')[0].split('Total : ')[1].split(' ')[0])

    new BarPlot('graphAs', viewBox)
        .setX("Obs")
        .setY("Genes")
        .setColor(() => 'orangered')
        .plot([
            { Obs: 'Total', Genes: total },
            { Obs: 'Coding', Genes: cod },
            { Obs: 'A.S.', Genes: as },
            { Obs: projeto.getContrast() + ' A.S.', Genes: here },
        ], undefined, (a, b) => b[1] - a[1]);
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
    const W = wC * 3;
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

function plotar(id, a, b) {
    const box = ViewBox.fromSize(a, b, Padding.simetric(5));
    new Canvas(id, box, cors[x++ % 8])
}


function criar() {
    const wC = 1100 / 7;

    plotQC(wC);
    plotRd(wC);
    plotMp(wC);
    plotGs(wC);
    plotGc(wC);
    plotCv(wC);

    plotar('graphAn', wC * 3, 250);
}

onMounted(_ => {
    criar();
})


const cols = ['Etapa', 'Tool', 'Fator', 'Sample', 'Propriedade', 'Valor'];
const rows = [
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
];

const graficos = [
    [{ id: 'graphCv', titulo: 'Gene read dept and coverage' }, { id: 'graphAn', titulo: 'Protein anotattion' }],
    [{ id: 'graphQc', titulo: 'Quality Control' }, { id: 'graphRd', titulo: 'Read Mapping mRNA,CDS,Genome' }, { id: 'graphMp', titulo: 'AS Discovery' }],
    [{ id: 'graphAs', titulo: 'Gene`Set Kind' }, { id: 'graphGc', titulo: 'Genomic Structure context' }]];

</script>
    
<template>
    <div class="bg-gray-50">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">


            <Tabs :names="['table', 'chart']" active="chart">

                <template #table>
                    <TableIcon class="mr-2 w-5 h-5" /> Table
                </template>
                <template #tableContent>
                    <Table :cols="cols" :rows="rows"></Table>
                </template>

                <template #chart>
                    <PresentationChartLineIcon class="mr-2 w-5 h-5" /> Graphics
                </template>
                <template #chartContent>

                    <Button @click="criar">plotar</Button>

                    <div class="flex flex-wrap justify-center justify-evenly content-evenly" v-for="row in graficos">
                        <div class="m-4 rounded-md shadow-md bg-gray-200" v-for="grafico in row">
                            <div class="w-full flex justify-center" :id="grafico.id"></div>
                            <div
                                class="w-full bg-gray-100 px-6 pt-4 pb-2 text-gray-700  font-bold text-xl text-center ">
                                {{grafico.titulo}}
                            </div>
                        </div>
                    </div>

                </template>

            </Tabs>

        </div>
    </div>
</template>
    