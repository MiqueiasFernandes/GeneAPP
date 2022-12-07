
##aqui o apache compartilha o mesmo host e porta com varias aplicacoes

## http://bioinfo.icb.ufmg.br/geneapps
## essa é a pasta onde vai rodar o GeneAPPExplorer
## colocar o aplicativo compilado e configurar o .htaccess

## http://bioinfo.icb.ufmg.br/geneappserver
## esse caminho é apontado via proxy para o app flask
## 1) configurar o proxy: /etc/httpd/conf.d/flask.conf                                             Modificado  
##         ProxyPass /geneappserver http://127.0.0.1:5000/
##         ProxyPassReverse /geneappserver http://127.0.0.1:5000/
## 2) reiniciar o apache: service httpd restart
## 3) consultar o status: service httpd status
## 4) levantar o flask na port 5000


