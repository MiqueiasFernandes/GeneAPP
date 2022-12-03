#!/bin/bash

## usage: rm -rf workdir && ./geneapp.sh -d `pwd`/workdir
## scp -i Downloads/MacAWS.pem local/capitulo3/GeneAPP/public/data/geneapp.sh admin@ec2-54-167-115-1.compute-1.amazonaws.com:

HOST=0.0.0.0
PORT=5000
SERVER=3
LIMIT=5
LOCAL=`pwd`

while getopts p:h:l:s:d:i: opts; do
    case ${opts} in
        h) HOST=${OPTARG} ;;
        p) PORT=${OPTARG} ;;
        l) LIMIT=${OPTARG} ;;
        s) SERVER=${OPTARG} ;;
        d) LOCAL=${OPTARG} ;;
        i) INSTALL=1 ;;
    esac
done

echo "Configurando GeneAPP em $LOCAL"
[ ! -d $LOCAL ] && mkdir -p $LOCAL
echo "Server [$SERVER] => $HOST :: $PORT ($LIMIT)!"

[ $INSTALL ] && sudo apt install apache2-dev wget curl python3 python3-pip python3-venv

[ ! -d $LOCAL/data ] && mkdir -p $LOCAL/data/`date +%Y-%m-%d`
[ ! -d $LOCAL/runs ] && mkdir $LOCAL/runs
[ ! -d $LOCAL/software ] \
    && mkdir $LOCAL/software \
    && python3 -m venv $LOCAL/software/venv \
    && source $LOCAL/software/venv/bin/activate \
    && pip install flask flask-cors biopython
    && sudo pip install mod_wsgi

source $LOCAL/software/venv/bin/activate
cat > $LOCAL/software/geneapp.py <<EOL

from flask import Flask, request, abort
from flask_cors import CORS
import uuid
import os
import shutil
from datetime import datetime

LIMIT = $LIMIT
LOCAL = "$LOCAL"

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 100*1000*1000 ###  MAX FILE 100 MB
CORS(app)

@app.route("/projeto", methods=["POST"])
def projeto():
    if len(os.listdir(f"{LOCAL}/runs")) >= LIMIT:
        abort(503)
    f = request.files['experimental_design.csv']
    id = str(uuid.uuid4())
    local = datetime.today().strftime("%Y-%m-%d")
    data = f'{LOCAL}/data/{local}/{id}'
    os.makedirs(data)
    f.save(data + '/experimental_design.csv')
    lns = [l for l in open(data + '/experimental_design.csv').readlines() if len(l) > 5]
    #assert len(lns) > 1 and len(lns) < 17
    #assert lns[0] == 'RUN,SAMPLE,FACTOR,FOLDER\n'
    #assert all([max(l) < 1000 and l.count(',') == 3 for l in lns])
    open(f"{LOCAL}/runs/{id}", "w").write(f"{data}\n")
    return { 
              "projeto":  id, 
              "path":  local, 
              "servidor": $SERVER 
            }  

## Carregar arquivos
@app.route("/arquivos", methods=["POST"])
def arquivos():
    projeto = request.form['projeto']
    local = request.form['path']
    path = f"{LOCAL}/data/{local}/{projeto}"
    if not os.path.isdir(path):
        abort(400)
    beds = ['cov_'+x.split(',')[1]+'.bed' for x in open(path + '/experimental_design.csv').readlines()][1:]
    valid_files = [

        ## rMATS
        "A3SS.MATS.JCEC.txt",
        "A5SS.MATS.JCEC.txt",
        "RI.MATS.JCEC.txt",
        "SE.MATS.JCEC.txt",

        ## MASER
        "sign_events_A3SS.tsv",
        "sign_events_A5SS.tsv",
        "sign_events_RI.tsv",
        "sign_events_SE.tsv",

        ## 3DRNASeq
        "DAS genes testing statistics.csv",
        "DE gene testing statistics.csv",
        "RNAseq info.csv",
        "Significant DAS genes list and statistics.csv",
        "Significant DE genes list and statistics.csv",
        "TPM_genes.csv",
        "TPM_trans.csv",
        "transcript_gene_mapping.csv",

        ## interproscan
        "anotacao.tsv",

        ## ete3
        "filogenia.txt",

        ## deeptools
        "cov_all.bed",

        ## multiqc
        "multiqc_general_stats.txt.csv",

        ## as_data_gen.sh
        "all_as_isoforms.txt",
        "das_genes.inline",
        "experimental_design.csv",
        "gene2mrna2cds2ptn.csv",
        "genoma.fa",
        "gene.gff",
        "gene.gff.min",
        "ptnas.inline",
        "resumo.txt",
        "ri_psc.csv",

    ] + beds
    valid_files = [x for x in valid_files if not x in os.listdir(path)]
    valid_files2 = valid_files + \
                  [x+'.zip' for x in valid_files] + \
                  [x+'.tgz' for x in valid_files] + \
                  [x+'.tbz2' for x in valid_files]

    for v in [x for x in valid_files2 if x in request.files]:
        f = request.files[v]
        f.save(f"{path}/{v}")
        if v.endswith('.zip') or v.endswith('.tgz') or v.endswith('.tbz2'):
            try:
                shutil.unpack_archive(f"{path}/{v}", path)
                v = v[:-4 if v.endswith('.zip') or v.endswith('.tgz') else -5]
            except: 
                os.remove(f"{path}/{v}") 
                print('ERRO COMPRESS:', v, shutil.get_unpack_formats())
                abort(422)
        if v == 'cov_all.bed':
            [open(f"{path}/{x}", "w") for x in beds]
        elif v.endswith('.bed'):
            open(f"{path}/cov_all.bed", "a").writelines(open(f"{path}/{v}").readlines()+['\n\n'])
        ok = os.listdir(path)
        falta = [x for x in valid_files if not x in ok]
        return { "ok": ok, "falta":  falta}
    abort(400)
 

## Processar

## Informar Status


## Fornecer todos dados


EOL






limpar() {
    while true
    do  echo "executando limpeza em $LOCAL/data/* ..."
        find $LOCAL/data/* -type d -ctime +7 -exec rm -rf {} \;
        sleep 1d
    done
}


limpar &
flask --app $LOCAL/software/geneapp run --port $PORT --host $HOST
wait

 
