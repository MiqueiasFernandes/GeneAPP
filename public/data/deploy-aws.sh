##!/bin/bash
## implantar em instancia da aws
## usage: bash public/data/deploy-aws.sh 54.242.3.198 ~/Downloads/MacAWS.pem "-x 1"

IP=$1
CRTF=$2
OPT=$3
HOST="ec2-`echo $IP | tr . - `.compute-1.amazonaws.com"
echo "implantando em $HOST"
scp -i $CRTF public/data/*.sh admin@$HOST:server 
ssh -i $CRTF admin@$HOST "rm -rf ~/workdir && ~/server/geneapp.sh -d ~/workdir $OPT"
