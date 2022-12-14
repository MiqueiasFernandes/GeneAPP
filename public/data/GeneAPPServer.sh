#!/bin/bash

MODE=JCEC
DATADIR=$1 ##/home/mfernandes/geneapp/runsteste/data
RODAR=$2 ## $LOCAL/software/venv/bin/activate
IPSCAN=$3 ## /home/admin/interproscan-5.59-91.0/interproscan.sh

## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##

echo "validando ... $DATADIR `date +%d/%m\ %H:%M`"
## dados basicos
[ ! $DATADIR ] && echo "invalido: precisa informar DATADIR" && exit

## RUN,SAMPLE,FACTOR,FOLDER
[ -f $DATADIR/experimental_design.csv ] && TEM_DSG=1 || NTEM_DSG=1
## fasta nivel cromossomico
[ -f $DATADIR/genoma.fa ] && TEM_GENOMA=1 || NTEM_GENOMA=1
## gff so com os AS genes
[ -f $DATADIR/gene.gff.min ] && TEM_GFF_MIN=1 || NTEM_GFF_MIN=1
## gff3 padrao NCBI admite ID=gene-xxxxxxx; ou ID=xxxxxx;
[ -f $DATADIR/gene.gff ] && TEM_GFF=1 || NTEM_GFF=1
## padrao: >nome_transcrito locus_tag=nome_gene protein_id=nome_protein
[ -f $DATADIR/cds.fa ] && TEM_CDS=1 || NTEM_CDS=1

## dados do 3drnaseq
[ -f $DATADIR/'DAS genes testing statistics.csv' ] && TEM_DASGT=1 || NTEM_DASGT=1
[ -f $DATADIR/'DE gene testing statistics.csv' ] && TEM_DEGT=1 || NTEM_DEGT=1
[ -f $DATADIR/'RNAseq info.csv' ] && TEM_RNAI=1 || NTEM_RNAI=1
[ -f $DATADIR/'Significant DAS genes list and statistics.csv' ] && TEM_SDAS=1 || NTEM_SDAS=1
[ -f $DATADIR/'Significant DE genes list and statistics.csv' ] && TEM_SDE=1 || NTEM_SDE=1
[ -f $DATADIR/TPM_genes.csv ] && TEM_TPMG=1 || NTEM_TPMG=1
[ -f $DATADIR/TPM_trans.csv ] && TEM_TPMT=1 || NTEM_TPMT=1
[ -f $DATADIR/transcript_gene_mapping.csv ] && TEM_TGM=1 || NTEM_TGM=1
[ $TEM_SDAS ] && TEM_3D=1 || NTEM_3D=1

## dados do rmats
[ -f $DATADIR/A3SS.MATS.$MODE.txt ] && TEM_RA3=1 || NTEM_RA3=1
[ -f $DATADIR/A5SS.MATS.$MODE.txt ] && TEM_RA5=1 || NTEM_RA5=1
[ -f $DATADIR/RI.MATS.$MODE.txt ] && TEM_RRI=1 || NTEM_RRI=1
[ -f $DATADIR/SE.MATS.$MODE.txt ] && TEM_RSE=1 || NTEM_RSE=1
[ $TEM_RA3$TEM_RA5$TEM_RRI$TEM_RSE ] && TEM_R=1 || NTEM_R=1 

## dados do maser OPCIONAL
[ -f $DATADIR/sign_events_A3SS.tsv ] && TEM_MA3=1 || NTEM_MA3=1
[ -f $DATADIR/sign_events_A5SS.tsv ] && TEM_MA5=1 || NTEM_MA5=1
[ -f $DATADIR/sign_events_RI.tsv ] && TEM_MRI=1 || NTEM_MRI=1
[ -f $DATADIR/sign_events_SE.tsv ] && TEM_MSE=1 || NTEM_MSE=1
[ $TEM_MA3$TEM_MA3$TEM_MA3$TEM_MA3 ] && TEM_M=1 || NTEM_M=1

## outros dados OPCIONAL
[ -f $DATADIR/anotacao.tsv ] && TEM_ANOTACAO=1 || NTEM_ANOTACAO=1
[ -f $DATADIR/cov_all.bed ] && TEM_BED=1 || NTEM_BED=1
[ -f $DATADIR/filogenia.txt ] && TEM_FILO=1 || NTEM_FILO=1
[ -f $DATADIR/resumo.txt ] && TEM_RESUMO=1 || NTEM_RESUMO=1
[ -f $DATADIR/multiqc_general_stats.txt ] && TEM_MQC=1 || NTEM_MQC=1

## validar
[ $NTEM_DSG ] && echo ERRO FALTA experimental_design.csv && ERRO=1
[ $NTEM_GENOMA ] && echo ERRO FALTA genoma.fa && ERRO=1
[ $NTEM_CDS ] && echo ERRO FALTA cds.fa && ERRO=1
[ $NTEM_GFF ] && [ $NTEM_GFF_MIN ] && echo ERRO FALTA gene.gff && ERRO=1
[ $NTEM_R ] && [ $NTEM_3D ] && echo ERRO FALTA rMATS ou 3DRNASeq && ERRO=1

[ $ERRO ] && echo invalido && exit
echo "validado com sucesso VALIDO @VALIDADO@ com sucesso"
[ ! $RODAR ] && exit
echo "ativando $RODAR"
source $RODAR
OUTDIR=$DATADIR/out
EXPDIR=$DATADIR/exp
rm -rf $OUTDIR && mkdir $OUTDIR
rm -rf $EXPDIR && mkdir $EXPDIR
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##

echo "gerando dados auxiliares...  `date +%d/%m\ %H:%M`"

touch $DATADIR/3drnaseq_as_genes.txt
[ $TEM_SDAS ] && tail -n+2 $DATADIR/Sign*DAS*ene*is*atistics.csv | cut -d, -f1 | tr -d \" | sort -u > $DATADIR/3drnaseq_as_genes.txt
touch $DATADIR/rmats_as_genes.txt
[ $TEM_R ] && cut -f-2 $DATADIR/*.MATS.$MODE.txt | grep -v "^ID" | cut -f2 | tr -d \" | sort -u > $DATADIR/rmats_as_genes.txt
[ $TEM_M ] && cut -f-2 $DATADIR/sign_events_* | grep -v "^ID" | cut -f2 | tr -d \" | sort -u > $DATADIR/rmats_as_genes.txt
cat $DATADIR/3drnaseq_as_genes.txt $DATADIR/rmats_as_genes.txt | sort -u > $OUTDIR/all_as_genes.txt
echo "TOTAL DAS GENES $(grep -c . $OUTDIR/all_as_genes.txt) encontrados"
(( $(grep -c . $OUTDIR/all_as_genes.txt) < 1 )) && echo ERRO NEHNHUM DAS GENE NA LISTA && exit
AMBOS=$(join $DATADIR/3drnaseq_as_genes.txt $DATADIR/rmats_as_genes.txt | grep -c .)
SO_RMATS=$(join -v2 $DATADIR/3drnaseq_as_genes.txt $DATADIR/rmats_as_genes.txt | grep -c .)
SO_3D=$(join -v1 $DATADIR/3drnaseq_as_genes.txt $DATADIR/rmats_as_genes.txt | grep -c .)
echo "$(date +%d/%m\ %H:%M) Total : $(grep -c . $OUTDIR/all_as_genes.txt) AS genes | so rMATS $SO_RMATS | so 3DRNASEQ $SO_3D | ambos $AMBOS |"

[ $NTEM_TGM ] && \
    echo 'TXNAME,GENEID' > $DATADIR/transcript_gene_mapping.csv && \
    paste -d, \
        <(grep \> $DATADIR/cds.fa | sed 's/.*locus_tag=//' | sed s/].*//) \
        <(grep \> $DATADIR/cds.fa | cut -c2- | cut -d\  -f1) \
        | sort -u >> $DATADIR/transcript_gene_mapping.csv

join -t, -2 2 \
    $OUTDIR/all_as_genes.txt \
    <(tail -n+2 $DATADIR/transcript_gene_mapping.csv | sort -t, -k2) \
    > $OUTDIR/all_as_isoforms.txt


[ $NTEM_GFF ] && [ $TEM_GFF_MIN ] && cp $DATADIR/gene.gff.min $DATADIR/gene.gff
NTEM_GFF=
TEM_GFF=1
[ $TEM_GFF_MIN ] && mv $DATADIR/gene.gff.min $OUTDIR/gene.gff.min
[ $NTEM_GFF_MIN ] && echo "gerando gff min `date +%d/%m\ %H:%M` ..." &&  python3 <(printf "
    import shutil
    all_as_genes = set([l.strip() for l in open('$OUTDIR/all_as_genes.txt').readlines() if len(l) > 1])
    attrs =  [
                #'Dbxref', 'Is_circular','Note','chromosome','ecotype','end_range','exception','exon_number',
                #'gbkey','gene_synonym','genome','inference','mol_type','number','orig_protein_id','orig_transcript_id',
                #'part','partial','product','pseudo','rpt_type','start_range','transcript_id','transl_table'
                'ID', 'Name', 'Parent', 'gene', 'gene_biotype', 'locus_tag', 'protein_id'
            ]
    gfilt2 = []
    ## dividir por cromosssomo para conquistar O(1gb)
    chrms = set([x.split(chr(9))[0] for x in open('$DATADIR/gene.gff').readlines() if x.count(chr(9)) == 8])
    for chrm in chrms:
        gff = [[x[:20] for x in l.strip().split(chr(9))[:-1]] for l in open('$DATADIR/gene.gff').readlines() if l.count(chr(9)) == 8 and l.startswith(chrm+chr(9))]
        print(chrm, len(gff))
        gff2 = [';'.join([x for x in l.strip().split(chr(9))[-1][:100].split(';') if x.split('=')[0] in attrs])
                for l in open('$DATADIR/gene.gff').readlines() if l.count(chr(9)) == 8 and l.startswith(chrm+chr(9))]
        gff = [gff[i]+[gff2[i]] for i in range(len(gff))]
        genes = [[[y for y in x[-1].split(';') if y.startswith('ID=')][0][3:], x] for x in gff if 'gene' in x[2]]
        gfilt = [(i,g) for i, g in genes if i in all_as_genes]
        gfilt = [(i.replace('gene-', ''),g) for i, g in genes if i.replace('gene-', '') in all_as_genes] if len(gfilt) < 1 else gfilt
        gfilt2.extend([x for x,_ in gfilt])
        gfilt = [x for _,x in gfilt]
        gfilt = [[l[0], int(l[3]), int(l[4])] for l in gfilt]
        gff_p = [[l[0], int(l[3]), int(l[4]), l] for l in gff]
        gff_d = [g for a, b, c, g in gff_p if 'region' == g[2] or 
                any([a == x and b >= y and c <= z for x, y, z in gfilt])]
        open('$OUTDIR/gene.gff.min.'+chrm, 'w').writelines([chr(9).join(x)+chr(10) for x in gff_d])

    with open('$OUTDIR/gene.gff.min', 'wb') as output:
        for chrm in chrms:
            shutil.copyfileobj(open('$OUTDIR/gene.gff.min.'+chrm, 'rb'), output)

    lo =  len(open('$DATADIR/gene.gff').readlines())
    lm =  len(open('$OUTDIR/gene.gff.min').readlines())

    print('salvo em $OUTDIR/gene.gff.min') 
    print(f'gff ficou reduzido em {lm*100//lo}%% => {lm} de {lo}')
    if len(set(gfilt2)) < len(all_as_genes): print([x for x in all_as_genes if not x in gfilt2 ])
    print(f'genes encontrados no gff: {len(set(gfilt2))} de {len(all_as_genes)}')
    " | cut -c5-)
NTEM_GFF_MIN=
TEM_GFF_MIN=1 

echo "gerando fasta dos genes...  `date +%d/%m\ %H:%M`"

python3 <(printf "
    import os
    from Bio import SeqIO, Seq, SeqRecord 
    all_as_genes = set([l.strip() for l in open('$OUTDIR/all_as_genes.txt').readlines() if len(l) > 1])
    genoma = '$DATADIR/genoma.fa' 
    gff = '$OUTDIR/gene.gff.min' 
    gns = [x for x in [l.strip().split('\t') for l in open(gff).readlines()] if 'gene' in x[2]] 
    cords = [[x[0], int(x[3]), int(x[4]), x[6] == '+',  
              (x[-1].split('ID=gene-')[1] if 'ID=gene-' in x[-1] else x[-1].split('ID=')[1]).strip().split(' ')[0].split(';')[0]
              ] for x in gns if 'ID=' in x[-1]] 
    print(len(cords), 'genes no GFF') 
    print(len(all_as_genes), 'genes AS para exportar') 
    cords = [x for x in cords if x[-1] in all_as_genes] 
    print(len(cords), 'genes encontrados')
    if len(cords) < len(all_as_genes):
        tmp = set([x[-1] for x in cords])
        print([x for x in all_as_genes if not x in tmp], 'genes nao encontrados')
    seqs = SeqIO.to_dict(SeqIO.parse(genoma, 'fasta')) 
    gseqsF = [SeqRecord.SeqRecord(seqs[s[0]].seq[s[1]-1:s[2]], id=s[-1], description='') for s in cords if s[3]] 
    gseqsR = [SeqRecord.SeqRecord(seqs[s[0]].seq[s[1]:s[2]+1].reverse_complement(), id=s[-1], description='') for s in cords if not s[3]] 
    seqs = SeqIO.write(gseqsF+gseqsR, '$OUTDIR/gene_seqs.fa', 'fasta') 
    print(f'$OUTDIR/gene_seqs.fa persistido com {seqs} seqs.')
    " | cut -c5-)

paste -d, \
    <(grep \> $OUTDIR/gene_seqs.fa | cut -d\  -f1 | tr -d \>) \
    <(sed 's/>.*/@/' $OUTDIR/gene_seqs.fa | tr -d \\n | tr @ \\n | tail -n+2) \
    >$OUTDIR/das_genes.inline

echo "gerando mapemento gene->protein $OUTDIR/gene2mrna2cds2ptn.csv ...  `date +%d/%m\ %H:%M`"

cat <(echo "gene,mrna,cds,protein") \
    <(paste -d, \
        <(grep \> $DATADIR/cds.fa | sed 's/.*\[locus_tag=//' | cut -d] -f1) \
        <(grep \> $DATADIR/cds.fa | cut -d\| -f2 | sed 's/.*/\?/') \
        <(grep \> $DATADIR/cds.fa | cut -c2- | cut -d\  -f1) \
        <(grep \> $DATADIR/cds.fa | sed 's/.*\[protein_id=//' | cut -d] -f1)) \
    >$OUTDIR/gene2mrna2cds2ptn.csv

echo "processando $OUTDIR/ri_psc.csv ...  `date +%d/%m\ %H:%M`"

[ $TEM_RRI ] && python3 <(printf "
from Bio import SeqIO
import os
ri = '$DATADIR/RI.MATS.$MODE.txt'
raw = [[x[0]]+x[3:7] for x in 
    [l.strip().split('\t') for l in open(ri).readlines() if '\t' in l][1:]]
seqs = SeqIO.to_dict(SeqIO.parse('$DATADIR/genoma.fa', 'fasta'))
tmp = [(id,seqs[seq[3:]].seq[int(start):int(end)], strand) for id,seq,strand,start,end in raw]
res = [(id,(seq if strand == '+' else seq.reverse_complement())) for id,seq,strand in tmp]
final = [[id, len(seq)]+[seq[i:].translate().find('*') for i in [2,3,4]] for id, seq in res]
open('$OUTDIR/ri_psc.csv', 'w').writelines([f'{l[0]},{l[1]},{l[2]},{l[3]},{l[4]}{os.linesep}' 
                            for l in [['id','len','f1','f2','f3']]+final])
print('introns extraidos $OUTDIR/ri_psc.csv', len(final)) 
")

echo "gerando fasta das ptns...  `date +%d/%m\ %H:%M`"

python3 <(printf "
from Bio import SeqIO
from Bio.SeqRecord import SeqRecord
import os
table = [l.strip().split(',') for l in open('$OUTDIR/gene2mrna2cds2ptn.csv').readlines()[1:]]
gene2iso = [l.strip().split(',') for l in open('$DATADIR/transcript_gene_mapping.csv').readlines()[1:] if len(l)>3]
iso2gene = dict(gene2iso)
as_genes = set([l.strip() for l in open('$OUTDIR/all_as_genes.txt').readlines() if len(l)>1])
as_iso = [x for x in gene2iso if x[1] in as_genes]
genes_as_iso = set([x[1] for x in as_iso])

print('GENES SEM CDS: ', ', '.join([x for x in as_genes if not x in genes_as_iso]))

cds = SeqIO.to_dict(SeqIO.parse('$DATADIR/cds.fa', 'fasta'))
isos = [x[0] for x in as_iso]
isos_seq = [v for k, v in cds.items() if k in isos]
print('ISO SEM SEQ: ', ', '.join([x.id for x in isos_seq if not x.id in isos]))

ta_cds = isos_seq[0].id in [x[1] for x in table]
tdic = {(x[1] if ta_cds else x[2]): x[3] for x in table}

SeqIO.write([SeqRecord(c.seq.translate(), tdic[c.id], description=f'gene={iso2gene[c.id]}') for c in isos_seq], '$OUTDIR/ptnas.faa', 'fasta')
open('$OUTDIR/ptnas.inline', 'w').writelines([f'{x.id},{str(x.seq)}{os.linesep}' for x in SeqIO.parse('$OUTDIR/ptnas.faa', 'fasta')])
")

sed s/[*]$// $OUTDIR/ptnas.inline | grep -v \* | sed s/^/\>/ | tr , \\n > $OUTDIR/ptnas.ipro

for SMP in $(tail -n+2 $DATADIR/experimental_design.csv )
    do echo $SMP | awk -F "," '{printf $4"/"$2".rmats.bam,"}' >> $EXPDIR/$(echo $SMP | cut -d, -f3).bams
done

## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##

filogenia() {

    local A_SEQ=$OUTDIR/gene_seqs.fa
    local A_FILO=$OUTDIR/filogenia.txt
    local J_FILO=$DATADIR/job_filogenia.txt
    SERVER="https://www.genome.jp/tools-bin/ete"


    echo "gerando job"
    SEQ="nucleotide"   
    workflow1="mafft_default"
    workflow2="-none"
    workflow3="-none"
    workflow4="-fasttree_default"
    DATA="upload_file=@$A_SEQ" 

    JOB=$(curl -s \
        -F "seqtype=$SEQ" \
        -F "seqformat=unaligned" \
        -F "$DATA" \
        -F "workflow1=$workflow1" \
        -F "workflow2=$workflow2" \
        -F "workflow3=$workflow3" \
        -F "workflow4=$workflow4" \
        -F "workflow=$workflow1$workflow2$workflow3$workflow4" $SERVER | grep -m1 'ete?id=' | cut -d= -f2 | cut -d\" -f1)

        echo $JOB >$J_FILO
        echo "$(date +%d/%m\ %H:%M) rodando filogenia em $JOB"

    if (($(echo $JOB | awk '{print length}') > 10)); then
        while (($(curl -s $SERVER'?id='$JOB | grep -c "Your job is still running") > 0)); do
            echo "aguardando filogenia ... $(date +%d/%m\ %H:%M)"
            sleep 60
        done
        echo "terminou filogenia ... $(date +%d/%m\ %H:%M)"
        curl -s $SERVER'?id='$JOB | grep -m1 midpoint_data | cut -d\" -f2 >$A_FILO
    else
        echo "filogenia job $JOB falhou"
    fi
    echo "filogenia terminou $JOB $(date +%d/%m\ %H:%M)"
}
[ $NTEM_FILO ] && echo "processando filogenia.txt ...  `date +%d/%m\ %H:%M`" && filogenia &


## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##

anotar() {
    $IPSCAN \
        -appl PANTHER,Pfam,SMART \
        -cpu 2 -f TSV -goterms -pa -verbose \
        -i $OUTDIR/ptnas.ipro -o $OUTDIR/anotacao.tsv
    echo "$(date +%d/%m\ %H:%M) terminou anotacao" 
}

[ $NTEM_ANOTACAO ] && echo "processando anotacao.txt ... $IPSCAN  `date +%d/%m\ %H:%M`" && anotar &

## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##

wait
echo "copiando arquivos estaticos ...  `date +%d/%m\ %H:%M`"
## BASICO
mv $DATADIR/experimental_design.csv $EXPDIR
## RMATS
[ $TEM_RA3 ] && mv $DATADIR/A3SS.MATS.$MODE.txt $EXPDIR/A3SS.MATS.JCEC.txt.csv
[ $TEM_RA5 ] && mv $DATADIR/A5SS.MATS.$MODE.txt $EXPDIR/A5SS.MATS.JCEC.txt.csv
[ $TEM_RRI ] && mv $DATADIR/RI.MATS.$MODE.txt $EXPDIR/RI.MATS.JCEC.txt.csv
[ $TEM_RSE ] && mv $DATADIR/SE.MATS.$MODE.txt $EXPDIR/SE.MATS.JCEC.txt.csv
## MASER
[ $TEM_MA3 ] && mv $DATADIR/sign_events_A3SS.tsv $EXPDIR/sign_events_A3SS.tsv.csv
[ $TEM_MA5 ] && mv $DATADIR/sign_events_A5SS.tsv $EXPDIR/sign_events_A5SS.tsv.csv
[ $TEM_MRI ] && mv $DATADIR/sign_events_RI.tsv $EXPDIR/sign_events_RI.tsv.csv
[ $TEM_MSE ] && mv $DATADIR/sign_events_SE.tsv $EXPDIR/sign_events_SE.tsv.csv
## 3DRNASEQ
[ $TEM_DASGT ] && mv $DATADIR/'DAS genes testing statistics.csv' $EXPDIR
[ $TEM_DEGT ] && mv $DATADIR/'DE gene testing statistics.csv' $EXPDIR
[ $TEM_RNAI ] && mv $DATADIR/'RNAseq info.csv' $EXPDIR
[ $TEM_SDAS ] && mv $DATADIR/'Significant DAS genes list and statistics.csv' $EXPDIR
[ $TEM_SDE ] && mv $DATADIR/'Significant DE genes list and statistics.csv' $EXPDIR
[ $TEM_TPMG ] && mv $DATADIR/TPM_genes.csv $EXPDIR
[ $TEM_TPMT ] && mv $DATADIR/TPM_trans.csv $EXPDIR
## OUTROS
[ $TEM_ANOTACAO ] && mv $DATADIR/anotacao.tsv $EXPDIR/kanotacao.tsv
[ $TEM_BED ] && mv $DATADIR/cov_all.bed $EXPDIR
[ $TEM_FILO ] && mv $DATADIR/filogenia.txt $EXPDIR
[ $TEM_RESUMO ] && mv $DATADIR/resumo.txt $EXPDIR
[ $TEM_MQC ] && mv $DATADIR/multiqc_general_stats.txt $EXPDIR
## GERADOS
mv $OUTDIR/gene.gff.min $EXPDIR
mv $OUTDIR/all_as_genes.txt $EXPDIR
mv $OUTDIR/all_as_isoforms.txt $EXPDIR
mv $DATADIR/transcript_gene_mapping.csv $EXPDIR
mv $OUTDIR/ri_psc.csv $EXPDIR
mv $OUTDIR/gene2mrna2cds2ptn.csv $EXPDIR
mv $OUTDIR/das_genes.inline $EXPDIR
mv $OUTDIR/ptnas.inline $EXPDIR
[ -f $OUTDIR/filogenia.txt ] && mv $OUTDIR/filogenia.txt $EXPDIR
[ -f $OUTDIR/anotacao.tsv ] && mv $OUTDIR/anotacao.tsv $EXPDIR/kanotacao.tsv

## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##

echo "integrando dados ...  `date +%d/%m\ %H:%M`"



cat \
    <(echo 'part=1') \
    <(cd $EXPDIR/ && wc -l * | sed 's/^/lines=/') \
    <(for f in $EXPDIR/*.bams; do cat $f <(echo {$f}); done | sed 's/^/map=/') \
    <(head -20 $DATADIR/gene.gff | grep '#' | sed 's/^/gff=/') \
    <(echo 'part=2') \
    <(cd $EXPDIR && for file in *; do echo $file=$(echo $file | tr -cd [:alnum:]); done) \
    <(echo 'part=3') \
    <(cd $EXPDIR && for file in *; do sed "s/^/$(echo $file | tr -cd [:alnum:])=/" "$file"; done) \
    <(echo 'part=4') \
    <(cd $EXPDIR && grep -m1 . *.csv) \
    >$OUTDIR/to_app.txt

mv $OUTDIR/to_app.txt $EXPDIR

python3 <(printf "
    lines = [l for l in open('$EXPDIR/to_app.txt').readlines()]
    ck = len(lines)//10
    p1, p2, p3 = lines[:ck], lines[ck:-ck], lines[-ck:]
    parts = [p1] + [p2[x::8] for x in range(8)] + [p3]
    [open(f'$EXPDIR/parte{i}_{len(parts[i])}.geneapp', 'w').writelines(parts[i]) for i in range(10)] 
    " | cut -c5-)

mkdir $DATADIR/public
mv $EXPDIR/parte*geneapp $DATADIR/public

echo "terminado em  `date +%d/%m\ %H:%M`"

