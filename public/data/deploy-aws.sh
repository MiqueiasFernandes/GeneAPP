##!/bin/bash
## implantar em instancia da aws
## usage: bash public/data/deploy-aws.sh 54.242.3.198 ~/Downloads/MacAWS.pem "-x 1 -p 80"

## instancia t2.micro (1GB ram / 1 vcpu / 100GB ssd) (precisa de disco p interproscan)

IP=$1
CRTF=$2
OPT=$3
HOST="ec2-`echo $IP | tr . - `.compute-1.amazonaws.com"
echo "implantando em $HOST"
scp -i $CRTF public/data/*.sh admin@$HOST:server 
#ssh -i $CRTF admin@$HOST "sudo service apache2 stop"
ssh -i $CRTF admin@$HOST "rm -rf ~/workdir && ~/server/geneapp.sh -d ~/workdir -k ~/server/process.sh $OPT"
