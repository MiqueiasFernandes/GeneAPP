import axios from 'axios';



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
    axios.postForm('https://rest.uniprot.org/idmapping/run', {
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
    // .catch(e => { })
}


