#!/bin/bash

## usage: rm -rf workdir && ./geneapp.sh -d `pwd`/workdir
## scp -i Downloads/MacAWS.pem local/capitulo3/GeneAPP/public/data/geneapp.sh admin@ec2-54-167-115-1.compute-1.amazonaws.com:

##  GeneAPPServer (microservice)
##  --------\
##          |
##          |------ Flask WSGI :80 => to handle process
##          |
##          |------ Clear          => to clear old data (>7days) 
##          |
##          |------ Rodar          => to call process for integration data
##

HOST=0.0.0.0
PORT=5000
SERVER=101
LIMIT=1
DEV=1  #GMMMKKKBBB
BODYSIZE=100000000
USER=admin
LOCAL=`pwd`

while getopts p:h:l:s:d:i:x:u:k: opts; do
    case ${opts} in
        h) HOST=${OPTARG} ;;
        p) PORT=${OPTARG} ;;
        l) LIMIT=${OPTARG} ;;
        s) SERVER=${OPTARG} ;;
        d) LOCAL=${OPTARG} ;;
        i) INSTALL=1 ;;
        x) PRD=1 ;;
        u) USER=${OPTARG} ;;
        k) SCRIPT=${OPTARG} ;;
    esac
done

[ $PRD ] && DEV= && echo "ambiente PRD ..."

[ $INSTALL ] && sudo apt install apache2-dev wget curl python3 python3-pip python3-venv libapache2-mod-wsgi-py3 openjdk-11-jre
[ $INSTALL ] && sudo pip3 install mod_wsgi
[ $INSTALL ] && echo " ******* programs instaled ******* " && exit

## A instalacao do INTERPROSCAN é manual
## use: https://interproscan-docs.readthedocs.io/en/latest/InstallationRequirements.html 
## 1) wget http://ftp.ebi.ac.uk/pub/software/unix/iprscan/5/5.59-91.0/interproscan-5.59-91.0-64-bit.tar.gz
## 2) tar -xvf interproscan-5.59-91.0-64-bit.tar.gz
## 3) testar: $>interproscan
## 4) setar a variavel abaixo

IPSCAN=/home/admin/interproscan-5.59-91.0/interproscan.sh

echo "Configurando GeneAPP em $LOCAL"
[ ! -d $LOCAL ] && mkdir -p $LOCAL
echo "Server [$SERVER] => $HOST :: $PORT ($LIMIT)!"

[ ! -d $LOCAL/data ] && mkdir -p $LOCAL/data/`date +%Y-%m-%d`
[ ! -d $LOCAL/runs ] && mkdir $LOCAL/runs
[ ! -d $LOCAL/software ] \
    && mkdir $LOCAL/software \
    && python3 -m venv $LOCAL/software/venv \
    && source $LOCAL/software/venv/bin/activate \
    && pip install flask flask-cors biopython mod_wsgi

cp $SCRIPT $LOCAL/software/RUN.sh
source $LOCAL/software/venv/bin/activate
cat > $LOCAL/software/geneapp.py <<EOL

from flask import Flask, request, abort, send_file
from flask_cors import CORS
import uuid
import os
import shutil
from datetime import datetime

LIMIT = $LIMIT
LOCAL = "$LOCAL"

app = Flask(__name__)
##app.config["MAX_CONTENT_LENGTH"] = $BODYSIZE
CORS(app)

@app.route("/server")
def server():
    return {"servidor": $SERVER , "slots": $LIMIT-len(os.listdir(f"{LOCAL}/runs"))}

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
        "cds.fa",
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


## Informar Status
@app.route("/status/<local>/<projeto>")
def status(local, projeto):
    path = f"{LOCAL}/data/{local}/{projeto}"
    if not os.path.isdir(path):
        abort(400)
    sf = f"{LOCAL}/runs/{projeto}"
    ## ver se o arq de log existe pq ta rodando
    if os.path.exists(sf):
        return {"status": [l.strip() for l in open(sf).readlines()]}
    ## se nao existe retornar o path de resultados se existe
    sf = f"{path}/{projeto}"
    if os.path.exists(sf):
        return {"status": [l.strip() for l in open(sf).readlines()] + os.listdir(f"{path}/public")}
    ## se nao existe retonar erro de falha
    return {"status": ["ERROR"]}
    
## Processar
@app.route("/process/<local>/<projeto>")
def process(local, projeto):
    path = f"{LOCAL}/data/{local}/{projeto}"
    if not os.path.isdir(path):
        abort(400)
    if len(os.listdir(path)) < 3:
        return { "status": "error few files." }
    if len([f for f in os.listdir(path) if 'checkpoint' in f]) < 1:
        open(path+'/checkpoint1', 'w')
    return {"status": "OK"}

## Fornecer todos dados
@app.route("/result/<local>/<projeto>/<filea>/<fileb>")
def result(local, projeto, filea, fileb):
    ## limitar consumo diario de dados
    path = f"{LOCAL}/data/{local}/{projeto}/public"
    if not os.path.isdir(path):
        abort(400)
    pa = int(filea)
    pb = int(fileb)
    assert pa >= 0 and pa <= 10
    assert pb >= 0 and pb <= 999999
    return {
        f"parte{pa}_{pb}": 
        [l.strip() for l in open(f"{path}/parte{pa}_{pb}.geneapp").readlines()]}

## Fornecer zip
@app.route("/zip/<local>/<projeto>")
def zipar(local, projeto):
    ## limitar consumo diario de dados
    path = f"{LOCAL}/data/{local}/{projeto}/public/all.tbz2"
    assert os.path.exists(path)
    return send_file(path, as_attachment=True)
    
EOL

rodar() {
    while true
    do  
        (( `ls -1 $LOCAL/runs/ | grep -c . ` > 0 )) && \
        for process in $LOCAL/runs/* 
        do  DATATMP=`head -1 $process`
            echo count >> $DATATMP/waits
            ## limit 10 min p rodar
            (( `grep -c . $DATATMP/waits` > 100 )) && rm -rf $process $DATATMP && continue
            [ -f $DATATMP/checkpoint1 ] && $LOCAL/software/RUN.sh $DATATMP >> $process
            if  [[ `grep @VALIDADO@ $process` ]]
                then echo "RODANDO $process em $DATATMP ..."
                touch $DATATMP/checkpoint2
                bash $LOCAL/software/RUN.sh $DATATMP $LOCAL/software/venv/bin/activate $IPSCAN >> $process
                cp $process $DATATMP
                rm -rf $process
                touch $DATATMP/checkpoint3
                [ -d $DATATMP/public ] && tar cvfj $DATATMP/public.tbz2 $DATATMP/public
                [ -f $DATATMP/public.tbz2 ] && mv $DATATMP/public.tbz2 $DATATMP/public/all.tbz2
            else
                [ -f $DATATMP/checkpoint1 ] && rm -rf $DATATMP/checkpoint1
            fi
        done
        sleep 6
    done 1>> $LOCAL/works.log.txt 2>> $LOCAL/works.err.txt
}

rodar &

limpar() {
    while true
    do  echo "executando limpeza em $LOCAL/data/* ..."
        find $LOCAL/data/* -type d -ctime +7 -exec rm -rf {} \;
        sleep 1d
    done 1>> $LOCAL/works.log.txt 2>> $LOCAL/works.err.txt
}

limpar &

##DEV
[ $DEV ] && flask --app $LOCAL/software/geneapp run --port $PORT --host $HOST

[ ! -d $LOCAL/software/venv/lib/python3.9/site-packages ] && echo "ERRO fix python venv PATH!"

##PRD
echo "import sys" > $LOCAL/software/wsgi.py
echo "sys.path.insert(0,'$LOCAL/software/venv/lib/python3.9/site-packages')" >> $LOCAL/software/wsgi.py
echo "from geneapp import app" >> $LOCAL/software/wsgi.py
echo "application = app" >> $LOCAL/software/wsgi.py
[ $PRD ] && cd $LOCAL/software && \
    sudo mod_wsgi-express start-server wsgi.py \
     --port $PORT \
     --user $USER \
     --processes $LIMIT \
     --limit-request-body $BODYSIZE \
     --server-root $LOCAL/software/wsgi

sleep 10 && netstat -pln | grep tcp | grep $PORT

wait
echo "Processo terminado `date +%d/%m\ %H:%M`"