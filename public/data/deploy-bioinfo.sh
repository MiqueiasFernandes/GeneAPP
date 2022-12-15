#!/bin/bash
## usage PRD
## curl -s https://raw.githubusercontent.com/MiqueiasFernandes/GeneAPP/main/public/data/deploy-bioinfo.sh | bash -s - -x 1
## usage DEV
## rm -rf v* && bash ~/Home/local/capitulo3/GeneAPP/public/data/deploy-bioinfo.sh -u ubuntu -l 2 -s 103
##  GeneAPPServer (microservice)
##  --------\
##          |
##          |------ Flask WSGI :80 => to handle process
##          |
##          |------ Clear          => to clear old data (>7days) 
##          |
##          |------ Rodar          => to call process for integration data
##

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
DEV=1
DEV_IP="192.168.64.2"

cd ~

if (( `sleep 10 && netstat -pln 2>/dev/null | grep tcp | grep -c $PORT ` > 0 ))
then 
      netstat -pln 2>/dev/null | grep tcp | grep $PORT
      echo "ja existe outro processo rodando nessa porta ( $PORT )..."
      echo abortando ....
      exit
fi

while getopts h:p:l:x:u:i:s:d: opts; do
    case ${opts} in
        h) HOST=${OPTARG} ;;
        p) PORT=${OPTARG} ;;
        l) LIMIT=${OPTARG} ;;
        x) PRD=1 ;;
        u) USER=${OPTARG} ;;
        i) IPSCAN=${OPTARG} ;;
        s) SERVER=${OPTARG} ;;
        d) DEV_IP=${OPTARG} ;;
    esac
done

[ $PRD ] && DEV= && echo "ambiente PRD ..."
[ $DEV ] && echo "modo DEV ..."
echo "Server [$SERVER] => $HOST :: $PORT ($LIMIT)!"

## modo de operacao http:
##  aqui o apache compartilha o mesmo host e porta com varias aplicacoes
##  usamos apache@proxi para redirecionar /geneappserver => localhost:5001
##  -> Logar no server user@bioinfo.icb.ufmg.br
DIR=/home/$USER
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
[ $DEV ] &&  cp -r ~/Home/local/capitulo3/GeneAPP/ .
[ $PRD ] && git clone https://github.com/MiqueiasFernandes/GeneAPP/ 
cd GeneAPP || exit
## Alterar o vue para as paginas reconhecerem 
sed -i 's/"\/"/"\/geneapp\/"/' src/main.js
[ $DEV ] && sed -i "s/.*GENEAPP_API=.*/const GENEAPP_API=\'$DEV_IP\'/" src/core/ClientAPI.ts
## Compilar e colocar na pasta (node > 16!!)
npm i node@16 && npm run build -- --base=/geneapp/
## Copiar o app para dentro da pasta (chown ...)
cp -r dist/** public/data/.htaccess /var/www/html/geneapp/
## ver se implantou com sucesso 
(( `ls dist/assets/index.*.js | grep -cf \
     <(curl -s http://$HOST/geneapp/ \
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
## sudo echo 'ProxyPass /geneappserver http://127.0.0.1:5001/' > /etc/httpd/conf.d/flask.conf 
## sudo echo 'ProxyPassReverse /geneappserver http://127.0.0.1:5001/' >> /etc/httpd/conf.d/flask.conf 
## 2) reiniciar o apache: service httpd restart
## 3) consultar o status: service httpd status
## 
## *** *** *** *** *** *** ***  configurar o PYTHON 3.7 *** *** *** *** *** ***
## wget https://www.python.org/ftp/python/3.7.1/Python-3.7.1.tar.xz
## tar -xvf Python-3.7.1.tar.xz
## cd Python-3.7.1 && ./configure --enable-shared && make && mkdir lib && cp libpython3.* lib/ && cd ..
## pip3 install --user virtualenv

## 1) configurar o mod_wsgi
cd $BASE
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$DIR/Python-3.7.1/lib

[ `which virtualenv` ] && virtualenv $BASE/venv
[ ! `which virtualenv` ] && $DIR/.local/bin/virtualenv -p $DIR/Python-3.7.1/python $BASE/venv
source $BASE/venv/bin/activate
pip install mod_wsgi --global-option=build_ext --global-option="-L$DIR/Python-3.7.1/lib"
pip install flask flask-cors biopython

## 2) levantar o flask na port 5001
LOCAL=$BASE/geneapp
mkdir $LOCAL 
cp $BASE/GeneAPP/public/data/GeneAPPServer.sh $LOCAL/RUN.sh
cp $BASE/GeneAPP/public/data/GeneAPPServer.py $LOCAL

WRK=$BASE/workdir
mkdir -p $WRK/data && mkdir $WRK/runs

echo "import os"                                                 > $LOCAL/wsgi.py
echo "os.environ['WRKDIR'] = '$WRK'"                            >> $LOCAL/wsgi.py
echo "os.environ['SLOTS'] = '$LIMIT'"                           >> $LOCAL/wsgi.py
echo "os.environ['SERVER'] = '$SERVER'"                         >> $LOCAL/wsgi.py
echo                                                            >> $LOCAL/wsgi.py
echo "from GeneAPPServer import app"                            >> $LOCAL/wsgi.py
echo "application = app"                                        >> $LOCAL/wsgi.py
echo                                                            >> $LOCAL/wsgi.py

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
                PROJ=GeneAPP_`head -1 $DATATMP/projeto`_proj
                [ -d $DATATMP/public ] && mkdir $PROJ && cp $DATATMP/public/part*.geneapp $PROJ
                [ -d $DATATMP/public ] && tar cvfj $DATATMP/public/geneapp.tbz2 $PROJ
                rm -rf $PROJ
                touch $DATATMP/checkpoint4
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

[ $DEV ] && export WRKDIR=$WRK  
[ $DEV ] && export SLOTS=$LIMIT 
[ $DEV ] && export SERVER=$SERVER
[ $DEV ] && flask --app $BASE/geneapp/GeneAPPServer run --port $PORT --host $HOST

[ $PRD ] && mod_wsgi-express setup-server $LOCAL/wsgi.py \
     --host $HOST --port $PORT \
     --user geneapp \
     --processes 10 \
     --limit-request-body $BODYSIZE \
     --server-root $BASE/wsgi \
     --python-path $BASE/venv/lib/`ls -1 $BASE/venv/lib/ | grep python3 | head -1`/site-packages \
     --python-path $BASE/geneapp \
     --process-name GeneAPPServer$VERSAO 

[ $PRD ] && $BASE/wsgi/apachectl start \
   && (( `sleep 10 && netstat -pln 2>/dev/null | grep tcp | grep $PORT | grep -c GeneAPP` > 0 ))  \
   && (( `curl -s 'http://$HOST:$PORT/server' | grep -c slots ` > 0)) \
   && echo GeneAPPServer executando OK || echo error

echo "Deploy terminado `date +%d/%m\ %H:%M`"

wait
