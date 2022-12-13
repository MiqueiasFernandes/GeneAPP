#!/bin/bash
## usage:
## curl -s https://raw.githubusercontent.com/MiqueiasFernandes/GeneAPP/main/public/data/deploy-bioinfo.sh | bash -

## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## configurar o ambiente bioinfo ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
APACHE=/geneapp/
HOST=127.0.0.1
PORT=5001
LIMIT=10 #MMKKK...
BODYSIZE=100000000
USER=geneapp
IPSCAN=/home/geneapp/interproscan-5.59-91.0/interproscan.sh
SERVER=101

if (( `sleep 10 && netstat -pln 2>/dev/null | grep tcp | grep -c $PORT ` > 0 ))
then 
      netstat -pln 2>/dev/null | grep tcp | grep $PORT
      echo "ja existe outro processo rodando nessa porta ( $PORT )..."
      echo abortando ....
      exit
fi

while getopts h:p:l:x:u:i: opts; do
    case ${opts} in
        h) HOST=${OPTARG} ;;
        p) PORT=${OPTARG} ;;
        l) LIMIT=${OPTARG} ;;
        x) PRD=1 ;;
        u) USER=${OPTARG} ;;
        i) IPSCAN=${OPTARG} ;;
    esac
done

[ $PRD ] && DEV= && echo "ambiente PRD ..."
[ $DEV ] && echo "modo DEV ..."
echo "Server [$SERVER] => $HOST :: $PORT ($LIMIT)!"

## modo de operacao http:
##  aqui o apache compartilha o mesmo host e porta com varias aplicacoes
##  usamos apache@proxi para redirecionar /geneappserver => localhost:5001
##  -> Logar no server user@bioinfo.icb.ufmg.br
DIR=/home/geneapp
VERSAO=$(echo v`date +%d%b%y_%Hh%M`)
BASE=$DIR/$VERSAO
mkdir $BASE &&  cd $BASE
[ ! -d $BASE ] && exit
echo implantando em $BASE ...
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##

echo "Started deploy at `date +%d/%m\ %H:%M`"

## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## implantar o GeneAPPExplorer ## ## ## ## ## ## ## ## #
## ## ## ## ## ## ## ## ## http://bioinfo.icb.ufmg.br/geneapp/ ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## Obter o projeto do github 
git clone https://github.com/MiqueiasFernandes/GeneAPP/ && cd GeneAPP
## Alterar o vue para as paginas reconhecerem 
sed -i 's/"\/"/"\/geneapp\/"/' src/main.js
## Compilar e colocar na pasta (node > 16!!)
npm i node@16 && npm run build -- --base=/geneapp/
## Copiar o app para dentro da pasta 
sudo cp -r dist/** public/data/.htaccess /var/www/html/geneapp/
## ver se implantou com sucesso 
(( `ls dist/assets/index.*.js | grep -cf \
     <(curl -s http://bioinfo.icb.ufmg.br/geneapp/ \
     | grep .js | sed 's/.*\/index.//' | sed s/[.].*//)` > 0 \
)) && echo tudo ok || echo teve erros
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##

echo "Terminou implantacao do GeneAPPExplorer `date +%d/%m\ %H:%M`"
cd $DIR

## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
## ## ## ## ## ## ## ## ## implantar o GeneAPPServer ## ## ## ## ## ## ## ## ## 
## ## ## ## ## ## ## ## ## http://bioinfo.icb.ufmg.br/geneappserver ## ## ## ## 
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
## 
## *** *** *** ***  *** *** *** *** configurar JAVA 11 *** *** *** *** *** *** *
## https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html
## Linux x64 Compressed Archive
## wget -O jdk11.tar.gz https://download.oracle.com/otn/java/jdk.... ... ....
## tar -xvf jdk11.tar.gz
##
## *** *** *** ***  *** *** *** configurar INTERPRO SCAN 5 *** *** *** *** *** *
## http://ftp.ebi.ac.uk/pub/software/unix/iprscan/5/5.59-91.0/interproscan-5.59-91.0-64-bit.tar.gz
## nano /home/geneapp/interproscan-5.59-91.0/interproscan.sh
##  loc essa linha => JAVA=$(type -p java)
##  colocar abaixo => JAVA=/home/geneapp/jdk-11.0.16.1/bin/java
## testar: /home/geneapp/interproscan-5.59-91.0/interproscan.sh
##
## *** *** *** *** *** *** *** configurar o proxy APACHE 2 *** *** *** *** ***
## http://bioinfo.icb.ufmg.br/geneappserver
## esse caminho é apontado via proxy para o app flask
## 1) configurar o proxy: /etc/httpd/conf.d/flask.conf 
## cp /etc/httpd/conf.d/flask.conf flask.conf.old
## sudo echo 'ProxyPass /geneappserver http://127.0.0.1:5000/' > /etc/httpd/conf.d/flask.conf 
## sudo echo 'ProxyPassReverse /geneappserver http://127.0.0.1:5000/' >> /etc/httpd/conf.d/flask.conf 
## 2) reiniciar o apache: service httpd restart
## 3) consultar o status: service httpd status
## 
## *** *** *** *** *** *** ***  configurar o PYTHON 3.7 *** *** *** *** *** ***
## wget https://www.python.org/ftp/python/3.7.1/Python-3.7.1.tar.xz
## tar -xvf Python-3.7.1.tar.xz
## cd Python-3.7.1 && ./configure --enable-shared && make && cp libpython3.* lib/ && cd ..
## pip3 install --user virtualenv

## 1) configurar o mod_wsgi
cd $BASE
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$DIR/Python-3.7.1/lib
$DIR/.local/bin/virtualenv -p $DIR/Python-3.7.1/python $BASE/venv
source $BASE/venv/bin/activate
pip install mod_wsgi --global-option=build_ext --global-option="-L$DIR/Python-3.7.1/lib"
pip install flask flask-cors biopython

## 2) levantar o flask na port 5000
LOCAL=$BASE/geneapp
mkdir $LOCAL && cp $BASE/GeneAPP/public/data/process.sh $LOCAL/RUN.sh
echo "import sys" > $LOCAL/wsgi.py
echo "from geneapp import app" >> $LOCAL/wsgi.py
echo "application = app" >> $LOCAL/wsgi.py

WRK=$BASE/workdir
mkdir -p $WRK/data && mkdir $WRK/runs


rodar() {
    while [ -d $WRK/runs ]
    do  
        (( `ls -1 $WRK/runs | grep -c . ` > 0 )) && \
        for process in $WRK/runs/* 
        do  DATATMP=`head -1 $process`
            echo count >> $DATATMP/waits
            ## limit 10 min p rodar
            (( `grep -c . $DATATMP/waits` > 100 )) && rm -rf $process $DATATMP && continue
            [ -f $DATATMP/checkpoint1 ] && $LOCAL/RUN.sh $DATATMP >> $process
            if  [[ `grep @VALIDADO@ $process` ]]
                then echo "RODANDO $process em $DATATMP ..."
                touch $DATATMP/checkpoint2
                bash $LOCAL/RUN.sh $DATATMP $BASE/venv/bin/activate $IPSCAN >> $process
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

limpar() {
    while [ -d $WRK/data ]
    do  echo "executando limpeza em $WRK/data/* ..."
        find $WRK/data/* -type d -ctime +7 -exec rm -rf {} \;
        sleep 1d
    done 1>> $LOCAL/works.log.txt 2>> $LOCAL/works.err.txt
}

rodar & limpar &

cat > $LOCAL/geneapp.py <<EOL
from flask import Flask, request, abort, send_file
from flask_cors import CORS
import uuid
import os
import shutil
from datetime import datetime

LIMIT = $LIMIT
LOCAL = "$WRK"

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 100000000
##CORS(app)

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

mod_wsgi-express setup-server $LOCAL/wsgi.py \
     --host $HOST --port $PORT \
     --user geneapp \
     --processes 10 \
     --limit-request-body $BODYSIZE \
     --server-root $BASE/wsgi \
     --python-path $BASE/venv/lib/python3.7/site-packages \
     --python-path $BASE/geneapp \
     --process-name GeneAPPServer$VERSAO

[ $DEV ] && flask --app $BASE/geneapp/geneapp run --port $PORT --host $HOST
[ $PRD ] && $BASE/wsgi/apachectl start \
   && (( `sleep 10 && netstat -pln 2>/dev/null | grep tcp | grep $PORT | grep -c GeneAPPServer` > 0 ))  \
   && echo GeneAPPServer executando OK || echo error

echo "Deploy terminado `date +%d/%m\ %H:%M`"

wait