import { Projeto } from "../model";
import { AlternativeSplicing, AS3dranseq, ASrmats } from "../model/AlternativeSplicing";
import { Cromossomo } from "../model/Cromossomo";
import { DifferentialExpression } from "../model/DifferentialExpression";
import { Exon } from "./Exon";
import { Intron } from "./Intron";
import { Isoforma } from "./Isoforma";
import { Locus } from "./Locus";

export class Gene extends Locus {
    private isoformas: Array<Isoforma> = new Array<Isoforma>();
    private bed = {};
    private as_events = new Array<AlternativeSplicing>();
    private dexp: DifferentialExpression = null;
    private anots;
    private canonic: Isoforma;
    private has_bed = false;
    private tags = []

    getTags = () => this.tags.length > 0 ? this.tags :
        (this.tags =
            (this.nome + ',' + this.meta['NID'] + ',' +
                this.isoformas.map(i => i.getTags().join(',')).join(',')
            ).split(',')
        )

    getNome = () => this.meta['NID'] || this.nome

    getAS = () => this.as_events;

    addAS(as: AlternativeSplicing) {
        this.as_events.push(as)
    }

    setDE(de: DifferentialExpression) {
        this.dexp = de;
    }

    getDE = () => this.dexp;

    addIsoforma(isoforma: Isoforma) {
        this.isoformas.push(isoforma);
    }

    getIsoformaByID(id: string) {
        return this.isoformas.filter(i => i.meta.ID === id)[0];
    }

    hasIsoforma = (id: string) => this.isoformas.some(i => i.meta.ID === id);

    update(chr: Cromossomo): void {
        this.isoformas.forEach(i => i.update(this));
    }

    getIsoformas = () => this.isoformas;
    isAS = () => this.isoformas.length > 1;

    setBED(raw: string[]) {
        if (!this.bed[raw[0]])
            this.bed[raw[0]] = [[parseInt(raw[2]), parseInt(raw[3]), parseInt(raw[4])]]
        else
            this.bed[raw[0]].push([parseInt(raw[2]), parseInt(raw[3]), parseInt(raw[4])])
        this.has_bed = true
    }

    getBED = (site?: number[]) => site ? Object.fromEntries(Object.entries(this.bed).map(x => [x[0],
    x[1].filter(b => b[0] >= site[0] && b[1] <= site[1])
    ])) : this.bed;
    maxTPM = () => Object.values<number[][]>(this.bed).map(ss => ss.map(b => b[2]).reduce((a, b) => Math.max(a, b), 0)).reduce((a, b) => Math.max(a, b), 0)
    minTPM = () => Object.values<number[][]>(this.bed).map(ss => ss.map(b => b[2]).reduce((a, b) => Math.min(a, b), 99999)).reduce((a, b) => Math.min(a, b), 999999)
    cov = () => Object.values<number[][]>(this.bed).map(ss => ss.filter(b => b[2] > 0).map(x => x[1] - x[0]).reduce((a, b) => a + b, 0)).reduce((a, b) => Math.max(a, b), 0)
    hasBED = () => this.has_bed

    getAnots = (t?) => this.anots || (this.anots = [... new Set(this.isoformas.map(i => i.getAnotsAcession(t)).reduce((p, c) => p.concat(c), []))].filter(x => x !== '?'))
    getGO = () => [... new Set(this.isoformas.map(i => i.getAnots('GO').map(x => x.value)).reduce((p, c) => p.concat(c), []))].filter(x => x !== '?')
    getPathway = () => [... new Set(this.isoformas.map(i => i.getAnots('Pathway').map(x => x.value)).reduce((p, c) => p.concat(c), []))].filter(x => x !== '?')
    getPfam = () => [... new Set(this.isoformas.map(i => i.getAnots('Pfam').map(x => x.value)).reduce((p, c) => p.concat(c), []))].filter(x => x !== '?')
    getInterpro = () => [... new Set(this.isoformas.map(i => i.getAnots('InterPro').map(x => x.value)).reduce((p, c) => p.concat(c), []))].filter(x => x !== '?')
    // A2M alpha-2-macroglobulin[Homo sapiens]
    // Gene ID: 2, updated on 9-Oct-2022


    // Reference GRCh38.p14 Primary Assembly NC_000012.12  (minus strand) from: 9116229 to: 9067708
    // mRNA transcript variant 2 NM_001347423.2, 37 exons,  total annotated spliced exon length: 4659
    // protein isoform a precursor NP_001334352.2 (CCDS44827.1), 36 coding  exons,  annotated AA length: 1474

    // Exon table for  mRNA  NM_001347423.2 and protein NP_001334352.2
    // Genomic Interval Exon		Genomic Interval Coding		Gene Interval Exon		Gene Interval Coding		Exon Length	Coding Length	Intron Length
    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // 9116229-9116128		1-102		102		261
    // 9115
    public static fromNCBI(raw) {

        var nome = null;
        var ref = null;
        var mrnas = []

        raw.forEach((l, i) => {
            if (i < 1) {
                nome = l
                return
            }
            if (i > 1 && !ref && l.length > 3) {
                ref = l
                return
            }
            if (nome && ref) {
                if (l.startsWith('mRNA')) {
                    mrnas.unshift([l])
                } else {
                    mrnas[0].push(l)
                }
            }
        });

        const to = parseInt(ref.split(' to: ')[1].split(' ')[0])
        const from = parseInt(ref.split(' from: ')[1].split(' ')[0])
        const start = Math.min(to, from)
        const end = Math.max(to, from)
        const chr = new Cromossomo(ref.trim().split(' ')[0], end - start + 1)
        const gene = new Gene(chr, start, end, ref.indexOf(' (minus strand) ') < 1, nome)
        mrnas.map(m => Isoforma.fromTable(m, gene)).forEach(i => gene.addIsoforma(i))
        return gene;
    }


    getCanonic() {
        if (this.isoformas.length < 1)
            return null
        if (this.isoformas.length < 2)
            return this.isoformas[0];
        if (this.canonic)
            return this.canonic;

        const iso_start = this.isoformas.map(i => i.start).reduce((a, b) => Math.min(a, b), this.isoformas[0].start)
        const iso_end = this.isoformas.map(i => i.end).reduce((a, b) => Math.max(a, b), this.isoformas[0].end)

        // pegar todos pontos dos mRNA no gene com pontos ao lado
        const pts = (l: Locus) => `${l.start - 1},${l.start},${l.start + 1},${l.end - 1},${l.end},${l.end + 1}`
        const points = Object.fromEntries([... new Set(
            this.isoformas.map(i => i.getExons().map(pts).join()).join().split(',')
                .concat(
                    this.isoformas.map(i => i.getIntrons().map(pts).join()).join().split(',')
                )
        )].map(i => parseInt(i)).filter(p => p >= iso_start && p <= iso_end).sort().map(p => [p, []]))

        // anotar tipo do ponto
        this.isoformas.forEach(i => i.getExons().forEach(e => {
            for (let i = e.start; i <= e.end; i++)
                points[i] && points[i].push('E')
        }))

        this.isoformas.forEach(i => i.getIntrons().forEach(i => {
            for (let k = i.start; k <= i.end; k++)
                points[k] && points[k].push('I')
        }))

        // anotar A.S. utr
        const points2 = []
        Object.keys(points).forEach(p => this.isoformas.forEach(i => parseInt(p) < i.start && points[parseInt(p)].push('A')))
        Object.keys(points).forEach(p => this.isoformas.forEach(i => parseInt(p) > i.end && points[parseInt(p)].push('A')))
        Object.keys(points).forEach(p => {
            const pt = parseInt(p)
            const I = points[pt].indexOf('I') >= 0;
            const E = points[pt].indexOf('E') >= 0;
            const A = (points[pt].indexOf('A') >= 0) || (I && E);
            points2.push([pt, A ? 'A' : I ? 'I' : E ? 'E' : 'A'])
        })

        // colapsar
        const final = []
        var start = 0;
        points2.sort((a, b) => a[0] - b[0]).forEach(([P, T]) => {
            if (final.length < 1) {
                final.push([P, T, P])
                start = P;
            } else {
                if (final[0][1] === T) {
                    final[0][2] = P
                } else {
                    final[0][2] = P - 1
                    final.unshift([P, T, P])
                }
            }
        })

        this.canonic = new Isoforma(this.cromossomo, start, final[0][2], this.strand, "Canonic");
        final.filter(x => x[1] === 'E').forEach((e, i) => this.canonic.addExon(new Exon(
            this.cromossomo, e[0], e[2], this.strand, `Exon${i}`
        )))
        final.filter(x => x[1] === 'I').forEach((e, i) => this.canonic.addIntron(new Intron(
            this.cromossomo, e[0], e[2], this.strand, `Intron${i}`
        )))
        final.filter(x => x[1] === 'A').forEach((e, i) => this.canonic.addSite(new Locus(
            this.cromossomo, e[0], e[2], this.strand, `Alternative${i}`
        )))

        return this.canonic;
    }

    share = () => [
        this.getNome(),
        [this.start, (this.strand ? '+' : '-'), this.end],
        this.isoformas.map(i => i.share()),
        this.as_events.map(a => a.share())
    ]

    static fromShare(dt) {
        const cromossomo = new Cromossomo('Unknown', dt[1][2] - dt[1][0] + 1)
        const gene = new Gene(cromossomo, dt[1][0], dt[1][2], dt[1][1] == '+', dt[0])
        dt[2].forEach(i => gene.addIsoforma(Isoforma.deserialize(gene, i)))
        dt[3].forEach(as => gene.addAS(as[0] === 'rMATS' ? ASrmats.fromShare(gene, as) : AS3dranseq.fromShare(gene, dt)))
        return gene;
    }

    checkAS(projeto: Projeto) {
        if (!projeto)
            return null;
        var conf = null;
        this.as_events.filter(a => a['tipo'] === 'RI').forEach(evt => {
            var start = parseInt(evt.extra['AS_SITE_START'])
            var end = parseInt(evt.extra['AS_SITE_END'])
            this.getCanonic().getSites().filter(s => s.start >= start && s.end <= end).forEach(site => {

                start = site.start
                end = site.end

                //achar as isoformas que tiveram introns retidos
                const tem_i = this.isoformas.map(iso => iso.getIntrons()).filter(i => i.filter(j => j.start >= start && j.end <= end).length > 0).map(i => i[0].isoforma.nome)
                if (tem_i.length < 1) return
                //achar os exons que reteram os intron
                const tem_e = this.isoformas.map(iso => iso.getExons()).filter(e => e.filter(j => j.start <= start && j.end >= end).length > 0).map(i => i[0].isoforma.nome)
                if (tem_e.length < 1) return
                //definir se houve as pelo 3d
                var evts: any[] = this.as_events.filter(a => a.evidence === '3DRNASeq')
                if (evts.length < 1) return
                evts = evts.map(e => e.getAS(projeto)).filter(x => x.length > 0)
                ///definir se evt ocorreu em intron da iso x exon da iso y e houve dif tpm controle trat
                tem_i.forEach(x =>
                    tem_e.forEach(y => {
                        evts.forEach(t => t.forEach(([S, Ts]) => {
                            if ((S === x && Ts.includes(y)) || (S === y && Ts.includes(x)))
                                conf = `AS ${this.getNome()} RI ${x} & ${y} !`
                        }))
                    }))
            })
        })
        if (conf)
            return conf;
        this.as_events.filter(a => a['tipo'] === 'SE').forEach(evt => {
            var start = parseInt(evt.extra['AS_SITE_START'])
            var end = parseInt(evt.extra['AS_SITE_END'])
            this.getCanonic().getSites().filter(s => s.start >= start && s.end <= end).forEach(site => {

                start = site.start
                end = site.end

                //achar as isoformas que tiveram exons pulado
                const tem_i = this.isoformas.map(iso => iso.getExons()).filter(i => i.filter(j => j.start >= start && j.end <= end).length > 0).map(i => i[0].isoforma.nome)
                if (tem_i.length < 1) return

                //achar os introns que substituiram os es
                const tem_e = this.isoformas.map(iso => iso.getIntrons()).filter(e => e.filter(j => j.start <= start && j.end >= end).length > 0).map(i => i[0].isoforma.nome)
                if (tem_e.length < 1) return

                //definir se houve as pelo 3d
                var evts: any[] = this.as_events.filter(a => a.evidence === '3DRNASeq')
                if (evts.length < 1) return

                evts = evts.map(e => e.getAS(projeto)).filter(x => x.length > 0)
                ///definir se evt ocorreu em intron da iso x exon da iso y e houve dif tpm controle trat
                tem_i.forEach(x =>
                    tem_e.forEach(y => {
                        evts.forEach(t => t.forEach(([S, Ts]) => {
                            if ((S === x && Ts.includes(y)) || (S === y && Ts.includes(x)))
                                conf = `AS ${this.getNome()} SE ${x} & ${y} !`
                        }))
                    }))
            })
        })
        return conf
    }

}