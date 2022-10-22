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
    Canvas, ViewBox, VennPlot, RadarPlot, Padding, BarPlotRadial,
    BarPlot, BarPlotVertical, ViolinPlot, AreaPlot, UpsetPlot
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

function plotAn(wC) {
    const W = wC * 3;
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
    const W = wC * 2;
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

    data['ab'] = [... new Set(exp[projeto.fatores[0].nome].concat(exp[projeto.fatores[1].nome]))].length

    data[''] = parseInt(projeto.getResumo('Genes com AS anotado:').map(x => x.split(':')[1])[0].trim());

    new UpsetPlot('graphUp', viewBox)
        .plot(data, {
            'a': projeto.fatores[0].nome,
            'b': projeto.fatores[1].nome
        }, Object.fromEntries(projeto.fatores.map(f => [f.nome, f.cor])))
}

function plotFilo(wC) {
    const data = "((((((((((AT5G18230:0.303031,AT3G48070:0.320323)100:0.656893,AT5G42030_ABIL4:0.257936)38:0.108675,AT1G04300:0.290475)100:1.90041,((AT5G43320_ckl8:0.374242,AT3G21175_ZML1:0.359818)15.6:0.12682,(AT3G62750_BGLU8:0.459518,(AT3G61710_ATG6:0.324724,AT1G14710:0.425316)100:0.532539)39.5:0.0328725)97.8:1.06328)33.1:0.280486,(AT4G16660:0.280852,(AT1G58180_BCA6:0.630728,AT4G30820:0.325527)54.8:0.0577197)100:1.39608)19.7:0.0716117,((AT1G75420:0.444715,(AT4G00990:0.331868,AT1G78290_SNRK2-8:0.302686)97.4:0.214018)87.9:0.487002,((AT1G11450_UMAMIT27:0.534781,((AT2G16990:0.207722,AT4G02075_PIT1:0.445359)100:0.196939,(AT3G23560_ALF5:0.498274,AT2G16980:0.25935)99.4:0.187539)99.9:0.234631)98:0.197279,(AT4G14340_CKI1:0.424303,AT3G27610:0.355722)100:0.462575)70:0.188336)100:1.54239)70.7:0.273448,(((((AT1G31175:0.251108,AT5G14210:0.0393661)98.9:1.3515,((AT1G33270:0.335612,AT5G44290:0.38302)57.3:0.112926,((AT2G32710:0.399888,AT3G51950:0.358135)100:0.551178,(AT3G06500_A/N-InvC:0.518716,(AT5G05930_GC1:0.402407,AT1G08350:0.357532)98.4:0.125354)99.9:0.210538)26.9:0.208323)99.3:1.19855)52.1:0.271381,(((AT1G61150:0.257871,AT4G09300:0.204476)100:0.324542,(AT4G19160:0.342537,AT1G03960:0.392839)99.9:0.269887)83.5:0.405556,(AT5G48370:0.546563,(AT5G66810:0.487807,(AT4G36050:0.391197,AT3G24150:0.329564)99.7:0.174856)88.3:0.113253)81.7:0.276457)100:1.24256)70.9:0.438271,(AT1G55750:0.343785,AT2G41600:0.276337)100:1.71842)11.6:0.0253675,(((AT5G09850:0.279639,AT2G45380:0.461322)99.3:0.883892,(AT1G22280_PAPP2C:0.158584,(AT2G25670:0.219372,AT1G77800:0.448446)100:0.464086)99.9:0.977389)84:0.571137,(((AT5G07940:0.474152,AT2G26210:0.162365)100:1.17629,(AT2G31510_ARI7:0.383348,AT1G49180:0.302065)100:1.06885)82.6:0.268292,((AT1G77000_SKP2B:0.337875,AT2G31580:0.384403)100:1.05632,(((AT3G58220:0.425548,AT2G20950:0.287397)100:0.915369,((AT1G48550:0.524275,(AT5G66100_LARP1b:0.377016,AT2G48020:0.40142)17.1:0.0738988)100:0.633954,((AT4G08470_MEKK3:0.701082,(AT1G53280_DJ1B:0.53802,(AT1G80380:0.413527,AT5G15610:0.384254)97:0.113714)4.2:0.0303283)100:0.360461,((AT1G09660:0.401847,AT1G30540:0.414751)100:0.646276,(AT1G73600:0.644777,(AT2G05440_GRP9:0.480796,(AT3G49530_NAC062:0.334128,AT3G08040_FRD3:0.437118)93.3:0.102839)86.6:0.0986602)100:0.418465)20.9:0.047594)86.9:0.0982035)99.8:0.266956)15.6:0.0287695,(((AT1G14700_PAP3:0.24041,AT4G19420:0.490241)100:1.26451,(AT5G62760:0.359004,AT1G79450_ALIS5:0.338751)99.7:0.830819)76.3:0.360204,(((AT1G09140_SR30:0.929768,(((AT2G06025:0.515473,(AT5G62130:0.402612,AT1G62800_ASP4:0.402888)99.9:0.173551)100:0.350773,((AT3G16560:0.422894,AT5G67240_SDN3:0.387462)39.6:0.0533307,(AT3G01100_HYP1:0.513314,AT3G27320:0.649718)96.7:0.105337)100:0.365847)100:0.265178,(AT3G01150_PTB1:0.636862,(AT1G05940_CAT9:0.605,(AT1G63110:0.634445,(AT4G38130_HD1:0.423666,AT4G35890_LARP1c:0.384528)98.8:0.100233)90.6:0.0910277)69.1:0.0921539)100:0.508379)83.2:0.0942647)99:0.188171,(AT3G46980_PHT4:1.01698,((AT1G27770_ACA1:0.441792,AT1G70180:0.279381)100:0.884345,(AT2G37760_AKR4C8:0.433183,(AT5G11030_ALF4:0.364985,AT1G07780_PAI1:0.390827)91.6:0.133512)100:0.815225)18.2:0.0233528)72.4:0.0974799)49.9:0.0583023,(AT1G59750_ARF1:0.319945,AT2G28060:0.398482)100:1.13451)66.7:0.0864792)9.7:0.0204741)71.3:0.112231)98:0.316496)46.7:0.0835295)83.9:0.283886)12.1:0.0226123)51.5:0.108666,((((AT2G20850_SRF1:0.390067,AT1G63900_DAL1:0.372878)99.4:0.302975,(AT1G76510:0.53494,(AT4G37680_HHP4:0.345354,AT1G29120:0.372643)98.6:0.137758)8.2:0.269938)98.6:1.14897,((AT5G59960:0.405099,AT4G25640_DTX35:0.384732)70.5:0.103651,(AT3G56130:0.553264,(AT1G16460_RDH2:0.535197,(AT2G01060:0.366201,AT5G43930:0.356024)100:0.180477)87.4:0.101138)96.5:0.547288)99.9:1.32135)62.8:0.477274,((AT1G67800:0.370836,(AT1G05000_PFA-DSP1:0.36692,AT5G56190:0.363936)98.8:0.271096)99.7:0.796906,(AT5G38940:0.132638,(AT5G38020:0.654356,(AT5G45260_RRS1:0.0557005,(AT5G45050_TTR1:0.0419029,AT5G64470_TBL12:0.590001)100:0.220855)100:0.269344)67.6:0.120958)100:1.32506)64:0.217591)57.2:0.197843)54.5:0.0874987,(((((AT1G32410:0.274486,(((AT1G16480:0.537762,(AT4G32285:0.341371,AT3G51240_F3H:0.327997)97.5:0.161016)100:0.461009,((AT1G65280:0.657108,(AT1G08460_HDA08:0.582886,((AT5G20250_DIN10:0.518246,(AT1G20510_OPCL1:0.385905,AT3G28720:0.382141)98.4:0.0888159)96.3:0.0894515,AT3G14660_CYP72A13:0.806771)33:0.0290423)78.5:0.082712)99.9:0.237342,(AT5G37380:0.35896,AT5G55100:0.365977)100:0.665934)16:0.0174567)26.4:0.0938549,((AT4G34140:0.367978,AT4G24800_ECIP1:0.378851)100:0.660321,(AT5G16610:0.287529,AT3G26370:0.443892)100:0.794001)24.9:0.0263618)100:1.02455)30.1:0.469054,((AT5G03440:0.579237,(AT3G03500:0.564043,(AT2G25950:0.434953,(AT2G45540:0.302363,AT3G59330:0.233118)100:0.249748)97.4:0.151148)64:0.110505)100:0.447347,(((AT2G31960_GSL03:0.362934,AT3G66654:0.269769)100:0.467134,(AT1G77290:0.55468,(AT3G03380_DEG7:0.407629,AT5G55290:0.219284)100:0.377415)60.7:0.0397371)100:0.508132,((AT2G16930:0.113108,(AT2G04800:0.238841,AT5G22770_alpha-ADR:0.236058)99.9:0.544401)100:0.840043,(AT5G62950:0.332536,(AT3G25980_MAD2:0.218949,AT4G11670:0.36952)98.1:0.345867)100:0.848199)79.7:0.147356)87.6:0.181245)54.9:0.106214)97:0.511055,((AT3G61670:0.528777,(AT4G39270:0.321467,AT1G13090_CYP71B28:0.377903)99.6:0.15008)50.1:0.296373,((AT2G41640:0.456074,AT1G25280_TLP10:0.302579)100:0.598357,(AT3G04350:0.450247,(AT3G02600_LPP3:0.389245,AT5G55530:0.379439)100:0.188847)99.8:0.195707)67:0.0960488)100:1.3857)13.2:0.280631,((AT1G17520:0.538813,(AT3G26910:0.524906,(AT2G28550_RAP2.7:0.369892,AT1G61890:0.377846)99.7:0.134737)87.8:0.116674)90.8:0.362291,((AT1G55500_ECT4:0.420061,AT4G02640_BZO2H1:0.317219)100:0.503579,((AT1G16650:0.52212,(AT1G50300_TAF15:0.369396,AT4G27120:0.355628)99.7:0.184844)100:0.346916,((AT3G55510_RBL:0.36689,AT1G15200:0.407594)97.6:0.104847,(AT5G43630_TZP:0.518022,AT4G11560:0.614139)13.4:0.0693024)100:0.330052)52.8:0.0672272)45.9:0.347979)100:1.6882)33.7:0.180046,((((((((AT4G08280:0.275441,AT3G55850_LAF3:0.343742)77.6:0.255226,(AT5G56180_ARP8:0.362646,AT2G39650:0.327006)95.2:0.332493)100:1.55235,(((AT2G35060_KUP11:0.5374,AT4G15415_ATB_GAMMA:0.78579)90.5:0.109012,AT1G31950:0.385413)7.7:0.0541361,AT2G35380:0.322808)97.4:1.07507)38:0.293696,(AT2G23680:0.474707,(AT3G04490:0.305423,AT5G08535:0.261873)82.5:0.194057)100:1.11516)22.5:0.100269,((AT2G20000_HBT:0.414403,AT2G39805:0.291462)96.5:0.312034,(AT3G07580:0.382347,(AT1G07700:0.323569,AT2G39280:0.343521)100:0.262141)96.6:0.29426)100:1.41735)29.9:0.116775,(((AT1G48490:0.52064,(AT4G37460_SRFR1:0.325527,AT2G38450:0.247893)100:0.341062)100:1.17078,((((((AT1G78200:0.159917,(AT3G15351:0.239549,AT1G50730:0.378512)100:0.518465)100:0.837991,((((AT4G22850:0.211558,AT3G19210_RAD54:0.445348)100:0.575477,(AT4G14520:0.631553,(AT4G14385:0.496333,(AT5G06770:0.2845,AT2G48160:0.408237)100:0.226937)85.7:0.0867535)88.3:0.12841)100:0.50619,(AT5G50370:0.235396,AT3G01310:0.415697)100:1.18452)6.7:0.00455925,((((AT3G59770_SAC9:0.906232,AT5G60930:0.768874)13.7:0.0350972,(AT3G59800:0.439728,(AT5G04560_DME:0.388982,AT4G24380:0.235678)100:0.217265)100:0.192414)89.7:0.0962234,AT5G61310:0.453402)84.3:0.135939,((AT5G52660:0.378623,AT5G18540:0.336907)100:1.47973,AT3G29575_AFP3:0.206606)100:0.505713)100:0.470467)88.4:0.132515)7.1:0.0106713,(AT5G28770_BZO2H3:0.33872,(AT3G10180:0.347113,AT3G55170:0.246235)99:0.294758)100:1.17566)89.5:0.200134,((AT5G58200:0.145041,AT5G24450:0.526462)100:1.00285,(AT1G80690:0.252311,(AT3G47560:0.274923,AT2G46020_BRM:0.315978)99.7:0.445322)100:0.692414)98.9:0.515582)10.4:0.0344355,(((AT1G55810_UKL3:0.394233,(AT5G60120_TOE2:0.600205,AT4G17370:0.368392)41.8:0.0138506)100:1.19856,((AT3G15880_WSIP2:0.432406,AT4G16710:0.15411)100:0.519632,(AT3G04500:0.435047,(AT3G19460:0.269616,AT4G02260_RSH1:0.428032)99.9:0.208722)89.5:0.167908)99.9:0.602915)3.2:0.252736,((AT5G24290_MEB2:0.453071,(AT5G45350:0.376113,AT3G02460:0.358927)99.5:0.191026)77:0.264575,(AT4G02430_SR34b:0.504512,(AT5G09690_MGT7:0.389472,AT4G16765:0.381498)98.5:0.156457)84.7:0.378799)100:1.4001)58:0.153775)9:0.0374489,(AT3G10260:0.150677,AT1G67490_GCS1:0.473719)100:1.59053)54.5:0.0910342)29.1:0.0576275,((AT5G61410_RPE:0.339708,(AT3G26890:0.528524,(AT3G54350_emb1967:0.341541,AT3G23400_FIB4:0.281512)99.7:0.172145)34.5:0.270146)100:1.36487,((AT2G41240_BHLH100:0.174195,AT3G20440_EMB2729:0.44931)99.8:0.435312,(AT3G26720:0.381699,AT4G27490_RRP41L:0.290999)85.3:0.24968)95.4:0.991379)60.6:0.523589)48.3:0.0862067)0:0.0653662,((AT3G07650_COL9:0.444118,(AT4G00420:0.625881,(AT5G42940:0.428619,AT1G02960:0.331144)97.6:0.101939)57.3:0.0536121)100:1.33203,((AT4G12030_BAT5:0.349225,(AT4G35785:0.694534,(AT1G48210:0.210546,AT3G59350:0.484256)46.1:0.125844)74.4:0.0499262)99.5:1.05182,((AT5G57630_CIPK21:0.433782,(AT1G49160_WNK7:0.35889,AT3G24840:0.374225)100:0.19792)67.4:0.226106,((AT5G04090:0.333205,AT4G00520:0.379303)100:0.6485,(AT1G04280:0.534576,(AT2G02080_IDD4:0.365638,AT3G16800:0.32659)99.4:0.13934)100:0.262419)48.2:0.0564246)99.8:1.21051)74.6:0.303338)85.6:0.363427)44.6:0.0925722,((((AT5G42900_COR27:0.309425,AT1G31650_ROPGEF14:0.386953)93.5:0.354197,((AT4G24590:0.45272,(AT2G01735_RIE1:0.276062,AT2G38840:0.347925)100:0.216999)100:0.373763,((AT3G09360:0.406034,AT5G47080_CKB1:0.258582)100:0.30327,(AT1G21560:0.312702,AT2G22610:0.381982)100:0.302645)100:0.263177)71.1:0.22586)100:1.54743,((((((AT3G20650:0.471697,(AT4G37440:0.54367,(AT2G02820_MYB88:0.646102,(AT3G59640:0.290691,AT1G79270_ECT8:0.386256)100:0.710146)71.6:0.0684572)95.3:0.0977176)17.5:0.0354378,(AT5G60100_PRR3:0.374276,AT2G03810:0.360267)46.3:0.124871)100:1.64299,(AT4G34265:0.373677,(AT5G23450_LCBK1:0.705331,(AT4G33940:0.289602,AT3G16630_KINESIN-13A:0.320002)98.4:0.150905)85.4:0.0985483)91.2:1.42095)0:0.0979928,(AT1G61660:0.397464,(AT3G01860:0.424391,AT3G20640:0.252765)51.7:0.153525)100:1.50018)38.6:0.261273,((((AT2G20790:0.370954,AT1G06620:0.332735)96.5:0.297136,(AT4G27040_VPS22:0.336275,AT2G26770_SCAB1:0.371053)87.1:0.224965)93.6:1.13401,((AT3G56080:0.597408,(AT5G18120_APRL7:0.606939,(AT5G02100_UNE18:0.504601,(AT5G52070:0.471029,AT1G30130:0.312058)99.8:0.134091)94.6:0.0946225)76.5:0.131293)78.9:0.135788,((AT3G14930_HEME1:0.415327,AT3G47990_SIS3:0.374557)100:0.308116,(AT3G18380_SHH2:0.472296,(AT1G02145_ALG12:0.388021,AT5G26740:0.352943)98.7:0.140182)99.9:0.214648)50.8:0.452761)99.9:1.61064)31.2:0.353292,(((AT4G25434_NUDT10:0.420197,AT4G12460_ORP2B:0.332234)100:0.773372,(((AT1G72320_PUM23:0.417951,AT1G13570:0.312566)100:0.49067,(AT5G65740:0.567097,(AT5G55970:0.483854,(AT1G16540_ABA3:0.369799,AT1G78870_UBC35:0.297598)100:0.213713)96.7:0.106389)99.3:0.168809)97.5:0.138385,(((AT1G53165_ATMAP4K_ALPHA1:0.47388,AT5G62470_MYB96:0.207947)100:0.909526,(AT5G25540_CID6:0.196073,AT5G36880_ACS:0.386806)100:0.659909)54.3:0.0767114,AT3G01435:0.680024)31.1:0.0243102)51.9:0.0580082)100:0.862053,((AT3G11240_ATE2:0.359639,(AT2G39300:0.352069,AT3G54740:0.336299)98.9:0.294925)100:1.08709,(AT1G54080_UBP1A:0.482305,(AT4G03110_RBP-DR1:0.320749,AT3G48360_BT2:0.428698)45.3:0.135189)99.8:1.07644)54.7:0.256978)18.3:0.0496684)23.6:0.104196)29.9:0.0969326,((AT1G51270:0.361101,(AT2G34070_TBL37:0.503046,(AT3G27400:0.393472,AT4G29740_CKX4:0.372313)100:0.175241)98.9:0.291666)100:1.39813,((((AT2G26800:0.291676,AT3G14130_HAOX1:0.391025)100:1.74026,(AT4G24270_EMB140:0.402349,AT1G20270:0.262055)94:0.87377)43.1:0.156595,(AT1G01490:0.142657,AT3G51860_CAX3:0.582894)100:1.3279)0:0.0169126,((AT2G01420_PIN4:0.480699,(AT2G32150:0.334885,AT4G02600_MLO1:0.368212)99.1:0.187309)99.5:0.459247,((AT4G29930:0.499234,(AT1G31050:0.381536,AT1G43650_UMAMIT22:0.390311)96.2:0.103937)99.6:0.246398,(AT5G62165_AGL42:0.543691,(AT1G22430:0.438624,(AT4G36380_ROT3:0.325464,AT3G21260_GLTP3:0.300196)100:0.205494)98.7:0.129702)100:0.383753)73.8:0.2369)100:1.26627)28.8:0.163878)61.9:0.139205)21.8:0.0240621)22.1:0.0691451,(((AT1G54360_TAF6B:0.496461,(AT3G01980:0.331525,AT5G20710_BGAL7:0.424268)95.8:0.134968)99.6:0.475232,(((AT5G42690:0.358681,AT1G26770_EXPA10:0.327358)56.1:0.0443699,(AT1G23020_FRO3:0.562392,AT1G77590_LACS9:0.68192)98.9:0.138204)100:0.809754,((AT1G34020:0.378009,AT2G01270_QSOX2:0.359275)100:0.410278,(AT5G58940_CRCK1:0.667033,(AT4G25080_CHLM:0.498633,(AT5G65940_CHY1:0.404736,AT1G07890_APX1:0.393398)95.3:0.132222)91.5:0.111078)99.8:0.254283)94.1:0.181775)32.7:0.0788114)100:0.907348,(((AT5G17010:0.402476,AT2G04360:0.216525)73.2:0.16728,(AT1G79985:0.438458,(AT3G04970:0.333984,AT5G01950:0.313655)96.7:0.131577)99:0.519559)98.4:0.899579,(AT1G05870:0.528775,((AT2G03390:0.509064,(AT4G31150:0.346133,AT3G19780:0.337279)99.7:0.132303)39.6:0.0280785,(AT3G54010_PAS1:0.588461,AT1G01080:0.687331)61.8:0.0719459)73.5:0.245234)100:1.23815)77.5:0.322058)83.7:0.397738)75:0.110582)13.7:0.00841146)41:0.057641)69:0.08826865,((((AT1G62640_KAS_III:0.536806,((AT5G53300_UBC10:0.319589,AT5G23050_AAE17:0.378133)100:0.63,(AT3G14190:0.472133,(AT1G26440_UPS5:0.283566,AT1G80260_emb1427:0.37595)100:0.175453)98.2:0.13448)17.9:0.0078602)100:1.68915,(((AT1G08125:0.356783,AT1G09195:0.402716)99.9:0.518303,(AT5G04220_SYTC:0.563806,(AT3G46440_UXS5:0.605214,(AT2G42280_FBH4:0.508065,(AT2G02710_PLPB:0.334857,AT1G61560_MLO6:0.395495)97.8:0.105525)95.4:0.104771)97:0.125628)54.4:0.0638872)100:1.35123,(((AT1G50630:0.43977,((AT1G17650_GLYR2:0.507536,((AT1G69420:0.346949,AT3G26670:0.369391)100:0.465314,(AT5G46340_RWA1:0.610921,(AT2G31350_GLX2-5:0.488108,(AT1G77890:0.377993,AT1G05710:0.340704)99.4:0.122138)97.1:0.104046)88:0.127432)100:0.791576)93.2:0.143633,(AT3G12200_Nek7:0.506173,(AT5G03330:0.410011,AT3G59680:0.34412)97.6:0.0924778)92.2:0.108494)81.6:0.0818847)99.8:1.21716,((AT4G31480:0.392074,AT2G47060_PTI1-4:0.279231)86.4:0.753277,((AT3G09830:0.326772,AT4G16143_IMPA-2:0.423547)10.1:0.0686634,((AT1G33050:0.356486,AT3G43700_BPM6:0.354979)100:0.293876,(AT2G25350:0.413214,AT1G45249_ABF2:0.33943)100:0.233524)99.9:0.436687)100:1.66795)51.9:0.342069)19.2:0.209331,((((AT1G53570_MAP3KA:0.533869,(AT5G61880:0.265771,AT4G38510_VAB2:0.349422)99.9:0.193287)98.1:0.171425,(AT2G17970:0.641398,(AT4G11160:0.407063,AT3G11930:0.27525)100:0.350669)93.4:0.145237)100:0.856769,(AT4G24160:0.353364,AT5G03900:0.396511)73.7:0.0953731)68.8:0.0908379,AT5G14030:0.391282)99.9:1.36138)37.3:0.203311)11.3:0.0690507)22.8:0.137598,(((AT2G25850_PAPS2:0.333988,AT4G12720_NUDT7:0.335367)100:0.164053,AT5G63440:0.432895)17:0.00969946,(AT1G25420:0.565378,AT2G16530:0.65294)35.9:0.0801864)100:1.5579)31.8:0.12373,((((AT3G09600_RVE8:0.397756,AT4G30900:0.395646)92.2:0.224844,(AT3G62860:0.407171,AT1G56550_RGXT3:0.427474)74.6:0.293954)100:1.31318,(((AT2G37150:0.36776,AT5G66070:0.270406)35.8:0.212493,(AT3G10250:0.710279,AT1G46480_WOX4:0.43877)3.3:0.00863821)100:1.36807,(AT3G20810_JMJD5:0.498837,((AT2G33620:0.367422,AT5G11350:0.377236)99.5:0.142164,AT1G67840_CSK:0.588454)35.1:0.0294289)98.7:1.16017)37.6:0.200763)0:0.0125209,((AT1G07350_SR45a:0.385678,AT5G52040_RS41:0.370993)90.9:0.205636,(AT1G16610_SR45:0.44551,AT1G55310_SCL33:0.365029)66.5:0.266713)100:1.17536)87.5:0.390307)69:0.05619135)69;"
}

const show = ref(false);

function criar() {
    show.value = true;
    const wC = 1100 / 7;
    setTimeout(() => {
        plotQC(wC);
        plotRd(wC);
        plotMp(wC);
        plotGs(wC);
        plotGc(wC);
        plotCv(wC);
        plotAn(wC);
        plotEx(wC);
    }, 300);
}

onMounted(() => (show.value = false) || (setTimeout(() => criar(), 300)))
onUpdated(() => (show.value = false) || (setTimeout(() => criar(), 300)))


const cols = ['Etapa', 'Tool', 'Fator', 'Sample', 'Propriedade', 'Valor'];
const rows = [
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
    { 'Etapa': 'map', 'Tool': 'star', 'Fator': 'red', 'Sample': 'xpto', 'Propriedade': 'total', 'Valor': 300 },
];

const graficos = [
    [
        { id: 'graphUp', titulo: 'Gene expression' },
        { id: 'graphFi', titulo: 'AS Gene phtlogeni' }
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
        { id: 'graphAs', titulo: 'Gene`Set Kind' },
        { id: 'graphGc', titulo: 'Genomic Structure context' }
    ]
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
    