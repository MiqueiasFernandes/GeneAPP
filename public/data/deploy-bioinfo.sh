#!/bin/bash

APACHE=/geneapp/
HOST=127.0.0.1
PORT=5001
LIMIT=10 #MMKKK...
BODYSIZE=100000000

if (( `sleep 10 && netstat -pln 2>/dev/null | grep tcp | grep $PORT | grep -c GeneAPPServer` > 0 ))
then 
      netstat -pln 2>/dev/null | grep tcp | grep $PORT
      echo "ja existe outro processo rodando nessa porta ( $PORT )..."
      echo abortando ....
      exit
fi

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
mkdir $LOCAL
echo "import sys" > $LOCAL/wsgi.py
echo "from geneapp import app" >> $LOCAL/wsgi.py
echo "application = app" >> $LOCAL/wsgi.py

WRK=$BASE/workdir
mkdir -p $WRK/data && mkdir $WRK/runs

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
    if not 
    return {"servidor": 101 , "slots": $LIMIT-len(os.listdir(f"{LOCAL}/runs"))}

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

$BASE/wsgi/apachectl start

(( `sleep 10 && netstat -pln 2>/dev/null | grep tcp | grep $PORT | grep -c GeneAPPServer` > 0 ))  \
   && echo GeneAPPServer executando OK || echo error

echo "Processo terminado `date +%d/%m\ %H:%M`"