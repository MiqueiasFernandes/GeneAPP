import axios from 'axios';
import { Gene } from './model';
import { Anotacao } from './model/Anotacao';
import { EMAIL, MODALS, notificar, CACHE } from './State';
import { Arquivo } from './utils/Arquivo';

function email(next) {
    if (EMAIL.value) {
        next(EMAIL.value)
    } else {
        MODALS.push({
            titulo: 'Email para utilizar API',
            html: '<p>Algumas APIs solicitam seu email, esse dado será transmitido a ela e não será salvo no GeneAPP. É necessário informar um email valido para utilizar essa funcionalidade.</p>',
            inputs: [{ label: 'email', value: 'your@mail' }],
            botoes: [
                {
                    text: 'OK', color: 'bg-sky-500', default: true,
                    action: ({ email }) => email && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email),
                    end: (_, dt) => {
                        next(EMAIL.value = dt['email'])
                    }
                },
                {
                    text: 'Cancelar', color: 'bg-amber-500',
                    action: () => true,
                    end: () => notificar('Só é possivel continuar apos informar email.', 'warn', 20)
                }
            ]
        })
    }
}

export function withEmail(x) { email(x) }

// !curl --request POST 'https://rest.uniprot.org/idmapping/run' \
//    --form 'ids="NP_001330439.1"' \
//    --form 'from="RefSeq_Protein"' \
//    --form 'to="UniProtKB"'
//    {"jobId":"4124e9e788e93903027c33da0f3076ce81471c1c"}
//    !curl 'https://rest.uniprot.org/idmapping/status/4124e9e788e93903027c33da0f3076ce81471c1c'
//    {"jobStatus":"FINISHED"}
//    ! curl -s "https://rest.uniprot.org/idmapping/uniprotkb/results/4124e9e788e93903027c33da0f3076ce81471c1c"
//    {"results":[{"from":"NP_001330439.1","to":{"entryType":"UniProtKB unrevi

export function getUniprot(id: string, cbk: (x) => {}) {
    return axios.postForm('https://rest.uniprot.org/idmapping/run', {
        ids: id,
        from: "RefSeq_Protein",
        to: "UniProtKB"
    })
        .then(res => {
            const job = res.data.jobId
            const intv = setInterval(() => {
                axios.get('https://rest.uniprot.org/idmapping/status/' + job)
                    .then(res => {
                        if (res.data.results || res.data.jobStatus === "FINISHED") {
                            clearInterval(intv);
                            if (res.data.results)
                                cbk(res.data.results)
                            else
                                axios.get("https://rest.uniprot.org/idmapping/uniprotkb/results/" + job)
                                    .then(res => cbk(res.data))
                        }
                    })
            }, 3000)
        })
}

const NCBI_EFETCH_API = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'

/// https://www.ncbi.nlm.nih.gov/books/NBK25497
export function getNCBIaa(id, seq = (aa: string) => aa) {
    return axios.get(NCBI_EFETCH_API, {
        params: {
            db: 'protein',
            id,
            rettype: 'fasta',
            retmode: 'text'
        }
    }).then(res => seq(res.data.split('\n').slice(1).join('')))
}

//https://www.ncbi.nlm.nih.gov/books/NBK25499/#chapter4.EFetch
export function getNCBInc({ cromossomo, start, end, strand }, seq = (fna: string) => fna) {
    return axios.get(NCBI_EFETCH_API, {
        params: {
            db: 'nuccore',
            id: cromossomo.nome, strand: strand ? 1 : 2, seq_start: start, seq_stop: end,
            rettype: 'fasta',
            retmode: 'text'
        }
    }).then(res => seq(res.data.split('\n').slice(1).join('')))
}

export function getNCBIgene(id, gene = (d) => null) {
    return axios.get(NCBI_EFETCH_API, {
        params: {
            db: 'gene',
            id,
            rettype: 'gene_table',
            retmode: 'text'
        }
    }).then(res => gene(Gene.fromNCBI(res.data.split('\n'))))
}

export function getInterpro(sequence: string,
    status = (x: string, t) => null,
    fim = (x: Anotacao[]) => null) {
    const ipro = `https://www.ebi.ac.uk/Tools/services/rest/iprscan5`
    email(email => {
        axios.postForm(
            `${ipro}/run`, {
            email,
            goterms: false,
            pathways: false,
            appl: 'PfamA',
            title: 'anotar',
            sequence
        }).then(res => {
            const job = res.data;
            status(`Job ${job.substring(0, 5)}...${job.slice(-5)} anotando pela API InterproScan5`, 1)
            const itv = setInterval(() => {
                axios.get(`${ipro}/status/${job}`).then(res => {
                    if (res.data === 'FINISHED') {
                        clearInterval(itv)
                        axios.get(`${ipro}/result/${job}/tsv`).then(res => {
                            if (!res || res.data.split('\t') < 2) {
                                console.log(res.data)
                                return status(`Job ${job.substring(0, 5)}...${job.slice(-5)} sem anotacao`, 2)
                            }
                            var anotacoes = []
                            res.data
                                .split('\n')
                                .map(x => x.split('\t'))
                                .filter(x => x.length > 4)
                                .forEach(
                                    x => (anotacoes = anotacoes.concat(Anotacao.fromRaw2(x)))
                                )
                            fim(anotacoes)
                        })
                    }
                })
            }, 60000)
        })
    })
}

export function getInterpro2GO() {
    const HREF = 'https://ftp.ebi.ac.uk/pub/databases/GO/goa//external2go/interpro2go'
    return axios.get(HREF).then(r => CACHE.value['ipro2go'] || (CACHE.value['ipro2go'] = Object.fromEntries(
        r.data.split('\n')
            .filter(x => x.length > 1 && !x.startsWith('!'))
            .map(x => x.split(' > '))
            .map(([_, G]) => G.split(' ; '))
            .map(([E, I]) => [I, E.slice(3)])
    )))
}

export function findServer(id = null): Promise<{ host: string }> {
    return new Promise((resolve, reject) => {
        const tt = (s1, s2) => axios.get(`http://geneappserver${s1}.mikeias.net/server`)
            .then(r =>
                ((!id && r.data.slots > 0) || (id && r.data.servidor === id)) ?
                    resolve(Object.assign(r.data, { host: `http://geneappserver${s1}.mikeias.net` }))
                    : (s2 ? tt(s2[0], s2.length > 1 ? s2[1] : null) : reject())
            )
            .catch(_ => s2 ? tt(s2[0], s2.length > 1 ? s2[1] : null) : reject())
        tt(0, [7, [2, [6, [5, [4, [3, [8, [1, [9]]]]]]]]])
    })
}

export function mkProj(file) {
    return findServer().then(s => {
        var formData = new FormData();
        formData.append(file.name, file);
        return axios.post(s.host + '/projeto', formData)
    })
}

export function upFile(proj, path, file) {
    return findServer(proj.servidor).then(s => {
        var formData = new FormData();
        formData.append('projeto', proj.projeto);
        formData.append('path', path);
        formData.append(file.name, file);
        return axios.post(s.host + '/arquivos', formData)
    })
}

export function process(proj) {
    return findServer(proj.servidor).then(s => {
        return axios.get(`${s.host}/process/${proj.path}/${proj.projeto}`)
    })
}

export function status(proj) {
    return findServer(proj.servidor).then(s => {
        return axios.get(`${s.host}/status/${proj.path}/${proj.projeto}`)
    })
}
