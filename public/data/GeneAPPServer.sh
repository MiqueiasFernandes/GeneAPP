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


