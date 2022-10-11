#!/bin/bash

#  Copyright (c) 2022 Miquéias Fernandes

#  Permission is hereby granted, free of charge, to any person obtaining a copy
#  of this software and associated documentation files (the "Software"), to deal
#  in the Software without restriction, including without limitation the rights
#  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#  copies of the Software, and to permit persons to whom the Software is
#  furnished to do so, subject to the following conditions:

#  The above copyright notice and this permission notice shall be included in
#  all copies or substantial portions of the Software.

#  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
#  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
#  THE SOFTWARE.

export TZ=America/Sao_Paulo
export INI_DIR=$(pwd)
export VERSAO="1.0.0"
export RMATS="https://github.com/Xinglab/rmats-turbo/releases/download/v4.1.2/rmats_turbo_v4_1_2.tar.gz"
export API='https://www.ebi.ac.uk/Tools/services/rest/iprscan5/'
export EMAIL=teste@teste.com
export TIMEOUT=60

log() {
    local tipo=$([ $5 ] || echo "INFO")$5
    printf "[%02d.%02d.%02d] %s %s => %s\n" "$1" "$2" "$3" "$(date +%d/%m\ %H:%M)" "$tipo" "$4"
}

preparar_ambiente() {
    # 1 = preparar as pastas
    export TMP_DIR=$INI_DIR/tmp_$(date +%s)
    export LOG_DIR=$TMP_DIR/logs
    export QNT_DIR=$TMP_DIR/qnt
    log 1 1 1 "criando o diretorio $TMP_DIR para salvar os arquivos temporarios"
    mkdir -p $LOG_DIR && mkdir $QNT_DIR

    log 1 1 2 "preparando o diretorio $1 para salvar os resultados"
    if [ ! -d $1 ]; then
        mkdir $1
        echo "$(date +%d/%m\ %H:%M) iniciando" >$1/resumo.txt
    else
        echo "$(date +%d/%m\ %H:%M) resumindo" >>$1/resumo.txt
        [ -f $1/to3d.zip ] && export JA_RODOU_3D=1
        [ -f $1/rmats_out.zip ] && export JA_RODOU_RMATS=1
    fi
    export OUT_DIR=$(cd $1/ && pwd)
    export RESUMO=$OUT_DIR/resumo.txt
    echo "$(date +%d/%m\ %H:%M) persistindo em $OUT_DIR" >>$RESUMO
    cd $TEMP_DIR

    #  2 = instalar pacotes debian
    #
    ## sra-toolkit : https://github.com/ncbi/sra-tools/wiki/HowTo:-fasterq-dump
    ## trimmomatic : http://www.usadellab.org/cms/?page=trimmomatic   http://www.usadellab.org/cms/uploads/supplementary/Trimmomatic/TrimmomaticManual_V0.32.pdf
    ## fastqc      : https://www.bioinformatics.babraham.ac.uk/projects/fastqc/
    ## salmon      : https://salmon.readthedocs.io/en/latest/salmon.html
    ## samtools    : https://www.htslib.org/doc/samtools.html
    ## hisat2      : http://daehwankimlab.github.io/hisat2/manual/

    local p=1
    for prog in fastq-dump TrimmomaticPE fastqc salmon samtools bamtools hisat2 pip curl wget; do
        if [ ! $(command -v $prog) ]; then

            [[ $prog == "fastq-dump" ]] && prog="sra-toolkit"
            [[ $prog == "TrimmomaticPE" ]] && prog="trimmomatic"
            [[ $prog == "pip" ]] && prog="python3-pip"
            [[ $prog == "R" ]] && prog="r-base "

            log 1 2 $p "instalando o $prog ..."
            sudo apt install $prog -y 1>$LOG_DIR/_1.2.$p\_install.$prog.log.txt 2>$LOG_DIR/_1.2.$p\_install.$prog.err.txt
            ((p = p + 1))
        fi
    done

    ## instalar nova versao do sra
    ## https://www.biostars.org/p/9527325/#9527333
    ## https://github.com/ncbi/sra-tools/wiki/02.-Installing-SRA-Toolkit
    export SRA_HOME=$TMP_DIR/sranew
    log 1 2 $p "instalando o novo sra-tools em $SRA_HOME..."
    mkdir $SRA_HOME && cd $SRA_HOME
    wget -qO sratoolkit.tar.gz https://ftp-trace.ncbi.nlm.nih.gov/sra/sdk/current/sratoolkit.current-ubuntu64.tar.gz &&
        tar -xzf sratoolkit.tar.gz >/dev/null &&
        ln -s ./sratoolkit.*/bin/fastq-dump
    export FQDUMP=$SRA_HOME/fastq-dump
    ./sratoolkit.*/bin/vdb-config -i --restore-defaults 1>vdb_config.log 2>$LOG_DIR/_1.2.$p\_install.$prog.err.txt

    # 3 = conferir se os prog foram instalados
    p=1
    for prog in fastq-dump TrimmomaticPE fastqc salmon samtools bamtools hisat2 pip $FQDUMP curl wget R; do
        if ! command -v $prog 1>/dev/null 2>/dev/null; then
            log 1 3 $p "ao instalar pacote $prog" "ERRO"
            ((p = p + 1))
        fi
    done
    (($p > 1)) && exit 1

    echo "usando o sra-toolkit NOVO ! Versão: $($SRA_HOME/fastq-dump --version | tr \\n \ )" >>$RESUMO
    echo -n "usando o salmon ! Versão: " >>$RESUMO
    salmon -v >>$RESUMO 2>&1
    echo "usando o hisat2 ! Versão: $(hisat2 --version | tr \\n \  | cut -c-50)" >>$RESUMO
    echo "usando o bamtools ! Versão: $(bamtools --version | tr \\n \  | cut -c-50)" >>$RESUMO
    echo "usando o samtools ! Versão: $(samtools --version | tr \\n \  | cut -c-50)" >>$RESUMO
    echo "usando o sra-toolkit ! Versão: $(fastq-dump --version | tr \\n \ )" >>$RESUMO
    echo "usando o trimmomatic ! Versão: $(TrimmomaticPE -version | tr \\n \ )" >>$RESUMO
    echo "usando o fastqc ! Versão: $(fastqc --version | tr \\n \ )" >>$RESUMO
    log 1 3 0 "programas instalados"

    # 4 = instalar pacotes python
    #
    ## multiqc   : https://multiqc.info/docs/
    ## biopython : https://biopython.org/
    ## deeptools : https://deeptools.readthedocs.io/en/develop/content/tools/bamCoverage.html
    p=1
    for pkg in multiqc biopython deeptools; do
        if [[ ! $(pip list | grep $pkg) ]]; then
            log 1 4 $p "instalando o $pkg ..."
            pip install $pkg 1>$LOG_DIR/_1.4.$p\_install.$pkg.log.txt 2>$LOG_DIR/_1.4.$p\_install.$pkg.err.txt
        fi
        if [[ $(pip list | grep $pkg) ]]; then
            echo "usando o $pkg ! $(pip list | grep $pkg | tr -s \  \ )" >>$RESUMO
        else
            log 1 4 $p "ao instalar pacote $pkg" "ERRO"
            exit 1
        fi
        ((p = p + 1))
    done

    bh=$(pip show deeptools | grep "Location: " | cut -d\  -f2)/deeptools/bamHandler.py
    if ! grep 'pysam.index(bamFile)' $bh 1>/dev/null 2>/dev/null; then
        log 1 4 $p "corrigindo o arquivo $bh"
        cp $bh .
        cp bamHandler.py $bh.old
        grep -B100000 'bam = pysam.Samfile(bamFile' bamHandler.py | grep -v 'bam = pysam.Samfile(bamFile' >xtemp
        echo '        pysam.index(bamFile)' >>xtemp
        tail bamHandler.py -n+$(grep -n 'bam = pysam.Samfile(bamFile' bamHandler.py | cut -d: -f1) >>xtemp
        cp xtemp $bh
        rm xtemp bamHandler.py
    fi

    ## 5 = instalar o rMATS
    if [ ! $JA_RODOU_RMATS ]; then
        cd $TMP_DIR &&
            mkdir rmats && cd rmats &&
            log 1 5 1 "baixando rMATS de $RMATS" &&
            wget -O rmats $RMATS 1>$LOG_DIR/_1.5.1_rmats_wget.log.txt 2>$LOG_DIR/_1.5.1_rmats_wget.err.txt &&
            log 1 5 2 "descomprimindo rMATS" &&
            tar -xvf rmats 1>$LOG_DIR/_1.5.2_rmats_tar.log.txt 2>$LOG_DIR/_1.5.2_rmats_tar.err.txt &&
            log 1 5 3 "instalando libgsl" &&
            sudo apt install libgsl-dev -y 1>$LOG_DIR/_1.5.3_rmats_libgsl.log.txt 2>$LOG_DIR/_1.5.3_rmats_lbgsl.err.txt &&
            log 1 5 4 "compilando rMATS" &&
            cd rmats_turbo* && make 1>$LOG_DIR/_1.5.2_rmats_make.log.txt 2>$LOG_DIR/_1.5.2_rmats_make.err.txt &&
            log 1 5 5 "instalando rMATS" &&
            cd .. && rm rmats && ln -s $(pwd)/$(ls rmats_turbo*/rmats.py) . && cd .. &&
            echo "rMATS => python3 $(pwd)/rmats/rmats.py" >>$RESUMO

        ## 6 = instalar o MASER
        log 1 6 1 "instalando o MASER"
        R CMD BATCH <(printf '
        if (!require("BiocManager", quietly = TRUE))\n
            install.packages("BiocManager")\n
        BiocManager::install("maser")') $LOG_DIR/_1.6.1_maser.log.txt $LOG_DIR/_1.6.1_maser.err.txt
    else
        log 1 5 0 "pulando instalacao do rMATS"
        log 1 6 0 "pulando instalacao do MASER"
    fi

    ## 7 = instalar o 3DRNAseq
    if [ ! $JA_RODOU_3D ]; then
        log 1 7 1 "instalando dependencias do 3D RNASEQ"
        R CMD BATCH <(printf '\n
        #####################################################################################\n
        ## Install packages of dependency\n
        ###---> Install packages from Cran\n
        cran.package.list <- c("shiny","shinydashboard","rhandsontable","shinyFiles",\n
                            "shinyjs","shinyBS","shinyhelper","shinyWidgets",\n
                            "magrittr","DT","plotly","ggplot2","eulerr",\n
                            "gridExtra","grid","fastcluster","rmarkdown",\n
                            "ggrepel","zoo","gtools")\n
        for(i in cran.package.list){\n
            if(!(i %%in%% rownames(installed.packages()))){\n
                message("Installing package: ",i)\n
                install.packages(i)\n
            } else next\n
        }\n
        ###---> Install packages from Bioconductor\n
        bioconductor.package.list <- c("tximport","edgeR","limma","RUVSeq", "ComplexHeatmap","rhdf5")\n
        for(i in bioconductor.package.list){\n
            if (!requireNamespace("BiocManager", quietly = TRUE))\n
                install.packages("BiocManager")\n
            if(!(i %%in%% rownames(installed.packages()))){\n
                message("Installing package: ",i)\n
                BiocManager::install(i)\n
            } else next\n
        }') $LOG_DIR/_1.7.1_3D_deps.log.txt $LOG_DIR/_1.7.1_3D_deps.err.txt

        log 1 7 2 "instalando o 3D RNASEQ"
        R CMD BATCH <(printf '
        ##################################################################################################
        ## use devtools R package to install ThreeDRNAseq from Github
        ###---> If devtools is not installed, please install
        if(!requireNamespace("devtools", quietly = TRUE))
            install.packages("devtools",dependencies = TRUE)

        ###---> Install ThreeDRNAseq
        if(!requireNamespace("ThreeDRNAseq", quietly = TRUE))
            devtools::install_github("wyguo/ThreeDRNAseq")') $LOG_DIR/_1.7.2_3D_rnaseq.log.txt $LOG_DIR/_1.7.2_3D_rnaseq.err.txt
    else
        log 1 7 0 "pulando instalacao do 3DRNAseq"
    fi

    echo "$(date +%d/%m\ %H:%M) programas instalados" >>$RESUMO
    log 1 0 0 "ambiente configurado"
    cd $INI_DIR && return 0
}

obter_dados() {
    cd $TMP_DIR

    local GENOMA=$1
    local GTF=$2
    local CDS=$3

    # 1 baixar o genoma
    if [[ $GENOMA == http* ]]; then
        log 2 1 1 "baixando o genoma de $GENOMA"
        wget -O genoma.fa.gz $GENOMA 1>$LOG_DIR/_2.1.1_genoma.download.log.txt 2>$LOG_DIR/_2.1.1_genoma.download.err.txt
    else
        cd $INI_DIR && log 2 1 1 "usando o genoma de $GENOMA"
        [[ $GENOMA == *.gz ]] && ln -s $GENOMA $TMP_DIR/genoma.fa.gz ##testar
        [[ $GENOMA == *.f*a ]] && ln -s $GENOMA $TMP_DIR/genoma.fa   ##testar
        cd $TMP_DIR
    fi
    echo "$(date +%d/%m\ %H:%M) genoma obtido" >>$RESUMO
    if [[ $GENOMA == *.gz ]]; then
        log 2 1 2 'descompactando o genoma ...'
        gunzip genoma.fa.gz 1>$LOG_DIR/_2.1.2_genoma.unzip.log.txt 2>$LOG_DIR/_2.1.2_genoma.unzip.err.txt
    fi
    [ ! -f genoma.fa ] && log 2 1 3 "genoma nao localizado em $GENOMA !" "WARN"
    [ -f genoma.fa ] && echo "Tamanho do genoma: $(grep -v \> genoma.fa | tr -d '\n' | wc -c | rev | cut -c7- | rev)Mpb" >>$RESUMO
    [ -f genoma.fa ] && echo "Quantiade de sequencias no genoma: $(grep -c \> genoma.fa)" >>$RESUMO

    # 2 baixar a anotacao

    if [[ $GTF == http* ]]; then
        log 2 2 1 "baixando o GTF de $GTF"
        wget -O gene.gtf.gz $GTF 1>$LOG_DIR/_2.2.1_gtf.download.log.txt 2>$LOG_DIR/_2.2.1_gtf.download.err.txt
        local GFF=$(echo $GTF | sed s/.gtf/.gff/)
        curl -sI $GFF 2>/dev/null | head -1 | grep -so 200 1>/dev/null && log 2 2 1 "baixando o GFF de $GFF" &&
            wget -O gene.gff.gz $GFF 1>$LOG_DIR/_2.2.1_gff.download.log.txt 2>$LOG_DIR/_2.2.1_gff.download.err.txt
    else
        cd $INI_DIR && log 2 2 1 "usando o GTF de $GTF"
        [[ $GTF == *.gz ]] && ln -s $GTF $TMP_DIR/gene.gtf.gz ##testar
        [[ $GTF == *.gtf ]] && ln -s $GTF $TMP_DIR/gene.gtf   ##testar
        cd $TMP_DIR
    fi
    echo "$(date +%d/%m\ %H:%M) GTF obtido" >>$RESUMO
    if [[ $GTF == *.gz ]]; then
        log 2 2 2 'descompactando o GTF ...'
        gunzip gene.gtf.gz 1>$LOG_DIR/_2.2.2_gtf.unzip.log.txt 2>$LOG_DIR/_2.2.2_gtf.unzip.err.txt
        [ -f gene.gff.gz ] && log 2 2 2 'descompactando o GFF ...' &&
            gunzip gene.gff.gz 1>$LOG_DIR/_2.2.2_gff.unzip.log.txt 2>$LOG_DIR/_2.2.2_gff.unzip.err.txt
    fi
    [ ! -f gene.gtf ] && log 2 2 3 "GTF nao localizado em $GTF !" "WARN"
    [ -f gene.gtf ] && echo "Quantidade de genes: $(grep -v '^#' gene.gtf | cut -f 3 | grep -c gene)" >>$RESUMO
    [ -f gene.gtf ] && echo "Quantidade de genes cod prot: $(grep -v '^#' gene.gtf | cut -f3,9 | grep '^CDS' | cut -f2 | tr \; '\n' | grep '^gene_id ' | uniq | wc -l)" >>$RESUMO

    # 3 baixar os transcritos
    ## aqui prefiro a CDS porque como o splicing/AS eh cotranscricional o transcrito processado eh majoritario na amostra
    ## usario prode usar isoforma com intron+utr sem problemas
    if [[ $CDS == http* ]]; then
        log 2 3 1 "baixando os transcritos de $CDS"
        wget -O cds.fa.gz $CDS 1>$LOG_DIR/_2.3.1_transcripts.download.log.txt 2>$LOG_DIR/_2.3.1_transcripts.download.err.txt
    else
        cd $INI_DIR && log 2 3 1 "usando transcritos de $CDS"
        [[ $CDS == *.gz ]] && ln -s $CDS $TMP_DIR/cds.fa.gz ##testar
        [[ $CDS == *.f*a ]] && ln -s $CDS $TMP_DIR/cds.fa   ##testar
        cd $TMP_DIR
    fi
    echo "$(date +%d/%m\ %H:%M) transcritos obtido" >>$RESUMO
    if [[ $GTF == *.gz ]]; then
        log 2 3 2 'descompactando os transcritos ...'
        gunzip cds.fa.gz 1>$LOG_DIR/_2.3.2_transcripts.unzip.log.txt 2>$LOG_DIR/_2.3.2_transcripts.unzip.err.txt
    fi
    [ ! -f cds.fa ] && log 2 3 3 "transcritos nao localizado em $CDS !" "WARN"
    [ -f cds.fa ] && echo "Quantiade de transcritos: $(grep -c \> cds.fa)" >>$RESUMO
    [ -f cds.fa ] && echo "Tamanho total de transcritos: $(grep -v \> cds.fa | tr -d '\n' | wc -c | rev | cut -c7- | rev)Mpb" >>$RESUMO

    echo "$(date +%d/%m\ %H:%M) terminou de obter dados" >>$RESUMO
    [ -f genoma.fa ] && [ -f gene.gtf ] && [ -f cds.fa ] && cd $INI_DIR && return 0
}

processar_sequencias() {
    cd $TMP_DIR

    # 1
    # Filtrar os genes que possuem AS anotados otimizando para o 3DRNASEQ
    # observar que novos eventos nao serao identificados, para esse outro caso de uso fazer por rMATS
    cp cds.fa cds.all.fa
    printf "############### 
        import os
        cds = 'cds.fa'
        seqs = [(l.strip(), l[1:-1].split()) for l in open(cds).readlines() if l.startswith('>')]
        print(len(seqs), 'sequencias de CDS')
        pars = [[a, b[0], c] for a, b, c in [[x[0], [z for z in x if 'locus_tag=' in z], y] for y, x in seqs] if len(b) == 1] 
        conts = {g: [0, []] for g in set([x[1] for x in pars])}
        print(len(conts), 'genes')
        for a, b, c in pars:
          conts[b][0]+=1
          conts[b][1].append(c)
        print(len(set([k for k, v in conts.items() if v[0] < 2])), 'genes sem AS')
        print(len(set([k for k, v in conts.items() if v[0] > 1])), 'genes com AS')
        ok = []
        for k, v in conts.items():
          if v[0] > 1:
            for seq in v[1]:
              ok.append(seq)
        print(len(ok), 'CDS de genes com AS')
        k=False
        as_cds = []
        genetrn = ['TXNAME,GENEID'+os.linesep]
        ok = set(ok)
        for l in open(cds).readlines():
          if l.startswith('>'):
            k = l.strip() in ok
            if k:
              genetrn.append(f\"{l[1:].split()[0]},{l.split('locus_tag=')[1].split(']')[0].strip()}{os.linesep}\")
          if k: \n\
            as_cds.append(l)
        open(cds, 'w').writelines(as_cds)
        open('transcript_gene_mapping.csv', 'w').writelines(genetrn)
        ###############  " | cut -c9- >script.py
    log 3 1 1 "filtrando transcritos"
    python3 script.py 1>$LOG_DIR/_3.1.1_transcripts.filter.log.txt 2>$LOG_DIR/_3.1.1_transcripts.filter.err.txt
    ##[ `grep -c . transcript_gene_mapping.csv ` == `grep -c \> cds.all.fa` ] || log 3 1 1 "NAO foi possivel criar transcript_gene_mapping.csv pelo campo locus_tag" "ERRO" && exit 1
    rm script.py
    echo "Genes com AS anotado: $(grep 'genes com AS' $LOG_DIR/_3.1.1_transcripts.filter.log.txt | head -1 | cut -d\  -f1)" >>$RESUMO
    echo "CDS de genes com AS anotado: $(grep -c \> cds.fa)" >>$RESUMO
    echo "Tamanho total da CDS de genes com AS: $(grep -v \> cds.fa | tr -d '\n' | wc -c | rev | cut -c7- | rev)Mpb" >>$RESUMO

    # 2
    # Filtrar os genes que possuem AS para gerar o BED
    echo "no_filter = False" >script.py
    [[ $(echo $1 | grep MAP_ALL) ]] && log 3 2 1 "extraindo sequencia de todos AS genes" && echo "no_filter = True" >script.py ## testar
    echo "add_gen = []" >>script.py
    [ -f $OUT_DIR/novel_as.txt ] && echo "add_gen = list(set([l.strip() for l in open('$OUT_DIR/novel_as.txt').readlines() if len(l) > 2]))[:100000]" >>script.py
    printf "############### 
        import os
        from Bio import SeqIO, Seq, SeqRecord 
        cds = 'cds.fa' 
        genoma = 'genoma.fa' 
        gtf = 'gene.gtf' 
        if len(add_gen) > 0: print(len(add_gen), 'genes adicionados por $OUT_DIR/novel_as.txt') 
        if no_filter: print('MAPEANDO EM TODOS GENES')
        gen_acecc = set(add_gen + [l.split('locus_tag=')[1].split()[0].replace(']', '') for l in open(cds).readlines() if l.startswith('>')]) 
        gns = [l.strip().split('\t') for l in open(gtf).readlines() if '\tgene\t' in l] 
        cords = [[x[0], int(x[3]), int(x[4]), x[6] == '+',  
                  [z.split('\"')[1] for z in [k.strip() for k in x[-1].split(';')] if z.startswith('gene_id \"') or z.startswith('gene \"')]+[''] 
                  ] for x in gns] 
        print(len(cords), 'genes no GTF') 
        cords = [x for x in cords if any([z for z in x[-1] if no_filter or (z in gen_acecc)])] 
        print(len(cords), 'genes a exportar') 
        seqs = SeqIO.to_dict(SeqIO.parse(genoma, 'fasta')) 
        gseqsF = [SeqRecord.SeqRecord(seqs[s[0]].seq[s[1]-1:s[2]], id=s[-1][0], description=s[-1][1]) for s in cords if s[3]] 
        gseqsR = [SeqRecord.SeqRecord(seqs[s[0]].seq[s[1]:s[2]+1].reverse_complement(), id=s[-1][0], description=s[-1][1]) for s in cords if not s[3]] 
        SeqIO.write(gseqsF+gseqsR, 'gene_seqs.fa', 'fasta') 
        print('finalizado.')
        ###############  " | cut -c9- >>script.py
    log 3 2 1 "extraindo sequencia dos AS genes"
    python3 script.py 1>$LOG_DIR/_3.2.1_genes.extract.log.txt 2>$LOG_DIR/_3.2.1_genes.extract.err.txt
    rm script.py
    echo "genes com AS extraidos: $(grep -c \> gene_seqs.fa)" >>$RESUMO
    grep \> gene_seqs.fa | cut -c2- | cut -f1 -d\  | sort -u >genes_as.txt

    cd $INI_DIR && return 0
}

indexar_sequencias() {
    ## observar que nas analises sao usados os parametros default
    cd $TMP_DIR

    [ $JA_RODOU_RMATS ] && log 4 0 0 "dispensando mapeamento por ter rMATS ok" && return

    ## as amostras devem ser mapeadas no genoma para saber se sao mesmo do organismo
    log 4 1 1 "indexando o genoma para validar as amostras"
    hisat2-build genoma.fa idxgenoma 1>$LOG_DIR/_4.1.1_genoma.index.log.txt 2>$LOG_DIR/_4.1.1_genoma.index.err.txt
    echo "$(date +%d/%m\ %H:%M) terminou de indexar o genoma" >>$RESUMO

    ## se a amostra mapeia no genoma mas mapeia pouco nos transcritos significa que nem todos transcritos estao anotados
    log 4 1 2 "indexando todos transcritos para validar a anotacao"
    hisat2-build cds.all.fa idxcdsall 1>$LOG_DIR/_4.1.2_cds.index.log.txt 2>$LOG_DIR/_4.1.2_cds.index.err.txt
    echo "$(date +%d/%m\ %H:%M) terminou de indexar os transcritos" >>$RESUMO

    ## necessario para gerar os graficos de cobertura de reads no webapp
    log 4 1 3 "indexando sequencia de 'AS genes' para gerar o BED"
    hisat2-build gene_seqs.fa idxgenes 1>$LOG_DIR/_4.1.3_genes.index.log.txt 2>$LOG_DIR/_4.1.3_genes.index.err.txt
    echo "$(date +%d/%m\ %H:%M) terminou de indexar os genes" >>$RESUMO

    log 4 2 1 "indexando os transcritos para quantificar"
    salmon index -t cds.fa --index idxcds 1>$LOG_DIR/_4.2.1_transcripts.index.log.txt 2>$LOG_DIR/_4.2.1_transcripts.index.err.txt
    echo "$(date +%d/%m\ %H:%M) terminou de indexar para quantificar" >>$RESUMO

    cd $INI_DIR && return 0
}

restaurar() {
    cd $TMP_DIR
    local SID=$1
    local RUN=$2
    local SAMPLE=$3
    local FACTOR=$4
    local TMP_SAMPLE=$5
    local OUT_SAMPLE=$6

    if [ -f $OUT_SAMPLE ]; then
        log 5 $SID 0 "tentando restaurar $OUT_SAMPLE"
        ln -s $OUT_SAMPLE $TMP_DIR/$SAMPLE.zip && rm -rf $TMP_SAMPLE
        cd $TMP_DIR && unzip $SAMPLE.zip 1>/dev/null 2>/dev/null && rm $TMP_DIR/$SAMPLE.zip
        if [ -f $TMP_SAMPLE/quant.sf ]; then
            echo "$(date +%d/%m\ %H:%M) sample $OUT_SAMPLE restaurada" >>$RESUMO
            mkdir $QNT_DIR/sample_$SAMPLE && cp $TMP_SAMPLE/quant.sf $QNT_DIR/sample_$SAMPLE/quant.sf
            return 0
        else
            cd $TMP_DIR && rm -rf $TMP_SAMPLE && mkdir $TMP_SAMPLE
            log 5 $SID 0 "impossivel restaurar $OUT_SAMPLE ..." "WARN"
            return 1
        fi
    else
        return 1
    fi
}

mapear() {
    local SID=$1
    local ETAPA=$2
    local INDEX=$3
    local SAMPLE=$4
    local LABEL=$5
    local IS_PE=$6

    log 5 $SID $ETAPA "mapeando $SAMPLE no $LABEL com hisat2"
    if [ $IS_PE ]; then
        hisat2 -x $INDEX -1 $SAMPLE.F.fq -2 $SAMPLE.R.fq --no-unal -S $SAMPLE.maped.sam \
            1>$LOG_DIR/_5.$SID.$ETAPA.map.$LABEL.$SAMPLE.log.txt 2>$LOG_DIR/_5.$SID.$ETAPA.map.$LABEL.$SAMPLE.err.txt
    else
        hisat2 -x $INDEX -U $SAMPLE.fq --no-unal -S $SAMPLE.maped.sam \
            1>$LOG_DIR/_5.$SID.$ETAPA.map.$LABEL.$SAMPLE.log.txt 2>$LOG_DIR/_5.$SID.$ETAPA.map.$LABEL.$SAMPLE.err.txt
    fi
    echo "$(date +%d/%m\ %H:%M) Mapeamento no $LABEL: $(grep 'overall' $LOG_DIR/_5.$SID.$ETAPA.map.$LABEL.$SAMPLE.err.txt)" >>$RESUMO
}

quantificar() {

    local SID=$1
    local RUN=$2
    local SAMPLE=$3
    local FACTOR=$4
    local TMP_SAMPLE=$5
    local OUT_SAMPLE=$6
    local GENE=$7
    cd $TMP_SAMPLE

    echo "$RUN,$SAMPLE,$FACTOR,sample_$SAMPLE" >$TMP_SAMPLE/experimental_design.csv

    # 1 baixar amostra
    log 5 $SID 1 "obtendo a amostra $SAMPLE pelo acesso $RUN no sra"
    fastq-dump $SRA_ARG1 $SRA_ARG2 $SRA_ARG3 $SRA_ARG4 --split-3 $RUN 1>$LOG_DIR/_5.$SID.1_download.$RUN.$SAMPLE.log.txt 2>$LOG_DIR/_5.$SID.1_download.$RUN.$SAMPLE.err.txt
    if [[ $(ls -lh | grep -c _[12].fastq) < 1 ]]; then
        log 5 $SID 1 "obtendo a amostra $SAMPLE pelo acesso $RUN no NOVO sra ..."
        $FQDUMP $SRA_ARG1 $SRA_ARG2 $SRA_ARG3 $SRA_ARG4 --split-3 $RUN 1>$LOG_DIR/_5.$SID.1_download.$RUN.$SAMPLE.log.txt 2>$LOG_DIR/_5.$SID.1_download.$RUN.$SAMPLE.err.txt
    fi
    grep 'Read' $LOG_DIR/_5.$SID.1_download.$RUN.$SAMPLE.log.txt >>$RESUMO

    local IS_PE=""
    if [[ $(ls -lh | grep -c _[12].fastq) > 1 ]]; then IS_PE=1; fi

    # 2 controle de qualidade
    if [ $IS_PE ]; then
        log 5 $SID 2 "fazendo controle de qualidade da amostra $SAMPLE com o TrimmomaticPE ..."
        echo "$(date +%d/%m\ %H:%M) tratando $SAMPLE como PE ..." >>$RESUMO
        TrimmomaticPE \
            $RUN\_1.fastq $RUN\_2.fastq \
            $SAMPLE.F.fq $SAMPLE.1.unp.fq \
            $SAMPLE.R.fq $SAMPLE.2.unp.fq \
            ILLUMINACLIP:TruSeq3-PE.fa:2:30:10:2:True LEADING:3 TRAILING:3 MINLEN:36 \
            1>$LOG_DIR/_5.$SID.2_qc.$SAMPLE.log.txt 2>$LOG_DIR/_5.$SID.2_qc.$SAMPLE.err.txt
    else
        log 5 $SID 2 "fazendo controle de qualidade da amostra $SAMPLE com o TrimmomaticSE ..."
        echo "$(date +%d/%m\ %H:%M) tratando $SAMPLE como SE ..." >>$RESUMO
        TrimmomaticSE \
            $RUN.fastq $SAMPLE.fq \
            ILLUMINACLIP:TruSeq3-PE.fa:2:30:10:2:True LEADING:3 TRAILING:3 MINLEN:36 \
            1>$LOG_DIR/_5.$SID.2_qc.$SAMPLE.log.txt 2>$LOG_DIR/_5.$SID.2_qc.$SAMPLE.err.txt
    fi
    grep 'Surviving' $LOG_DIR/_5.$SID.2_qc.$SAMPLE.err.txt >>$RESUMO

    # 3 rodar o fastqc
    log 5 $SID 3 "reportando controle de qualidade da amostra $SAMPLE com fastqc ..."
    rm -rf qc_$SAMPLE && mkdir qc_$SAMPLE
    if [ $IS_PE ]; then
        fastqc $SAMPLE.F.fq $SAMPLE.R.fq -o qc_$SAMPLE 1>$LOG_DIR/_5.$SID.3_stats.$SAMPLE.log.txt 2>$LOG_DIR/_5.$SID.3_stats.$SAMPLE.err.txt
    else
        fastqc $SAMPLE.fq -o qc_$SAMPLE 1>$LOG_DIR/_5.$SID.3_stats.$SAMPLE.log.txt 2>$LOG_DIR/_5.$SID.3_stats.$SAMPLE.err.txt
    fi
    echo "$(date +%d/%m\ %H:%M) terminou de obter amostra $SAMPLE por $RUN com qc" >>$RESUMO
    [ $KEEP_FASTQ ] || rm $RUN* $SAMPLE.1.unp.fq $SAMPLE.2.unp.fq

    # 4 mapear no genoma
    [ $SKIP_MAP_GENOMA ] || mapear $SID 4 $TMP_DIR/idxgenoma $SAMPLE "GENOMA" $IS_PE
    [ $SKIP_MAP_GENOMA ] && log 5 $SID 4 "pulando mapemento no genoma para amostra $SAMPLE"
    if [ -f $SAMPLE.maped.sam ]; then
        log 5 $SID 4 "gerando bam de $SAMPLE para rMATS"
        samtools view -S -b $SAMPLE.maped.sam >$SAMPLE.maped.bam 2>$LOG_DIR/_5.$SID.4_bam.$SAMPLE.err.txt
        bamtools sort -in $SAMPLE.maped.bam -out $SAMPLE.rmats.bam 1>$LOG_DIR/_5.$SID.4_bamSort.$SAMPLE.log.txt 2>>$LOG_DIR/_5.$SID.4_bamSort.$SAMPLE.err.txt
        rm -rf $SAMPLE.maped.sam $SAMPLE.maped.bam
    fi

    # 5 mapear na cds
    [ $SKIP_MAP_CDS ] || mapear $SID 5 $TMP_DIR/idxcdsall $SAMPLE "CDS" $IS_PE && rm $SAMPLE.maped.sam
    [ $SKIP_MAP_CDS ] && log 5 $SID 5 "pulando mapemento na cds para amostra $SAMPLE"

    # 6 mapear nos genes que tem AS anotado
    [ $SKIP_MAP_GENE ] || mapear $SID 6 $TMP_DIR/idxgenes $SAMPLE "AS_GENES" $IS_PE ## && rm $SAMPLE.maped.sam
    [ $SKIP_MAP_GENE ] && log 5 $SID 6 "pulando mapemento no gene para amostra $SAMPLE"

    # 7 quantificar com salmon
    log 5 $SID 7 "quantificando com a amostra $SAMPLE com salmon"
    if [ $IS_PE ]; then
        salmon quant -1 $TMP_SAMPLE/$SAMPLE.F.fq -2 $TMP_SAMPLE/$SAMPLE.R.fq -o $TMP_SAMPLE/quant_$SAMPLE --libType IU --index $TMP_DIR/idxcds \
            1>$LOG_DIR/_5.$SID.7_quant.$SAMPLE.log.txt 2>$LOG_DIR/_5.$SID.7_quant.$SAMPLE.err.txt
    else
        salmon quant -r $TMP_SAMPLE/$SAMPLE.fq -o $TMP_SAMPLE/quant_$SAMPLE --libType IU --index $TMP_DIR/idxcds \
            1>$LOG_DIR/_5.$SID.7_quant.$SAMPLE.log.txt 2>$LOG_DIR/_5.$SID.7_quant.$SAMPLE.err.txt
    fi
    mkdir $QNT_DIR/sample_$SAMPLE && cp $TMP_SAMPLE/quant_$SAMPLE/quant.sf $QNT_DIR/sample_$SAMPLE/quant.sf
    echo "$(date +%d/%m\ %H:%M) CDS expressa em $SAMPLE: $(cut -f4 $TMP_SAMPLE/quant_$SAMPLE/quant.sf | tail -n+2 | grep -cv '^0$')" >>$RESUMO

    # 8 gerar bed de exemplo
    if [ -f $SAMPLE.maped.sam ]; then
        log 5 $SID 8 "gerando arquivo de cobertura para a amostra $SAMPLE com deeptools"
        samtools view -S -b $SAMPLE.maped.sam >$SAMPLE.maped.bam 2>$LOG_DIR/_5.$SID.8_bam.$SAMPLE.err.txt
        bamtools sort -in $SAMPLE.maped.bam -out $SAMPLE.sorted.bam 1>$LOG_DIR/_5.$SID.8_bam.$SAMPLE.log.txt 2>>$LOG_DIR/_5.$SID.8_bam.$SAMPLE.err.txt
        bamCoverage -b $SAMPLE.sorted.bam -o $SAMPLE.bed --outFileFormat bedgraph --binSize 3 -p 2 -r $GENE \
            1>$LOG_DIR/_5.$SID.8_cov.$SAMPLE.log.txt 2>$LOG_DIR/_5.$SID.8_cov.$SAMPLE.err.txt
    else
        log 5 $SID 8 "nao ha mapeamento para gerar bed para a amostra $SAMPLE com deeptools" "WARN"
    fi

    # 9 salvar no OUT_DIR
    log 5 $SID 9 "limpando e persistindo dados de $SAMPLE"
    cd $TMP_SAMPLE
    rm -f $TMP_SAMPLE/*.fq $TMP_SAMPLE/*.sam $TMP_SAMPLE/*.bai $TMP_SAMPLE/$SAMPLE.maped.bam
    mkdir $TMP_SAMPLE/logs && cp $LOG_DIR/_5.$SID.* $TMP_SAMPLE/logs/
    cp $TMP_SAMPLE/quant_$SAMPLE/quant.sf $TMP_SAMPLE/
    cd $TMP_DIR
    echo "$(date +%d/%m\ %H:%M) Salvando $OUT_SAMPLE" >>$RESUMO
    zip -r $OUT_SAMPLE sample_$SAMPLE/** 1>$LOG_DIR/_5.$SID.9_zip.$SAMPLE.log.txt 2>$LOG_DIR/_5.$SID.9_zip.$SAMPLE.err.txt
}

quantificar_amostras() {
    cd $TMP_DIR
    local CONT=0
    local idx=1
    export GENE=$(grep \> $TMP_DIR/gene_seqs.fa | head -1000 | tail | head -1 | tr -d \> | cut -d\  -f1)
    log 5 0 0 "gene escolhido $GENE"
    for ARG in $@; do
        if (($idx > 4)); then                    ## ignorar os primeiros 4 argumentos passados ao programa
            if [[ $(echo $ARG | grep ,) ]]; then ## pegar argumentos das amostras com ","
                ((CONT = CONT + 1))

                local RUN=$(echo $ARG | cut -d, -f1)
                local SAMPLE=$(echo $ARG | cut -d, -f2)
                local FACTOR=$(echo $ARG | cut -d, -f3)
                local TMP_SAMPLE=$TMP_DIR/sample_$SAMPLE
                local OUT_SAMPLE=$OUT_DIR/$FACTOR.$SAMPLE.$RUN.zip
                mkdir $TMP_SAMPLE

                log 5 $CONT 0 "processando a amostra $SAMPLE em $OUT_SAMPLE"
                if restaurar $CONT $RUN $SAMPLE $FACTOR $TMP_SAMPLE $OUT_SAMPLE; then
                    log 5 $CONT 0 "amostra $OUT_SAMPLE restaurada"
                else
                    [ $JA_RODOU_3D ] && log 5 $CONT 0 "ESPERADO backup de amostra $SAMPLE em $OUT_SAMPLE !!!" "ERRO" && echo "$(date +%d/%m\ %H:%M) 404 $OUT_SAMPLE !!! ERRO !!!" >>$RESUMO && exit 1
                    quantificar $CONT $RUN $SAMPLE $FACTOR $TMP_SAMPLE $OUT_SAMPLE $GENE
                fi
            else ## demais argumentos tratar como parametro

                [[ $(echo $ARG | grep SRA_ARG1=) ]] && export SRA_ARG1=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param SRA_ARG1 : $SRA_ARG1" && continue
                [[ $(echo $ARG | grep SRA_ARG2=) ]] && export SRA_ARG2=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param SRA_ARG2 : $SRA_ARG2" && continue
                [[ $(echo $ARG | grep SRA_ARG3=) ]] && export SRA_ARG3=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param SRA_ARG3 : $SRA_ARG3" && continue
                [[ $(echo $ARG | grep SRA_ARG4=) ]] && export SRA_ARG4=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param SRA_ARG4 : $SRA_ARG4" && continue

                [[ $(echo $ARG | grep RMATS_ARG1=) ]] && export RMATS_ARG1=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param RMATS_ARG1 : $RMATS_ARG1" && continue
                [[ $(echo $ARG | grep RMATS_ARG2=) ]] && export RMATS_ARG2=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param RMATS_ARG2 : $RMATS_ARG2" && continue
                [[ $(echo $ARG | grep RMATS_ARG3=) ]] && export RMATS_ARG3=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param RMATS_ARG3 : $RMATS_ARG3" && continue
                [[ $(echo $ARG | grep RMATS_ARG4=) ]] && export RMATS_ARG4=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param RMATS_ARG4 : $RMATS_ARG4" && continue

                [[ $(echo $ARG | grep MIN_AVG_READS=) ]] && export MIN_AVG_READS=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param MIN_AVG_READS : $MIN_AVG_READS" && continue
                [[ $(echo $ARG | grep FDR=) ]] && export FDR=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param FDR : $FDR" && continue
                [[ $(echo $ARG | grep PSI=) ]] && export PSI=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param PSI : $PSI" && continue
                [[ $(echo $ARG | grep MODE=) ]] && export MODE=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param MODE : $MODE" && continue

                [[ $(echo $ARG | grep GENE=) ]] && export GENE=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param GENE : $GENE" && continue
                [[ $(echo $ARG | grep SKIP_MAP_GENOMA) ]] && export SKIP_MAP_GENOMA=1 && log 5 0 0 "param SKIP_MAP_GENOMA : 1" && continue
                [[ $(echo $ARG | grep SKIP_MAP_GENE) ]] && export SKIP_MAP_GENE=1 && log 5 0 0 "param SKIP_MAP_GENE : 1" && continue
                [[ $(echo $ARG | grep SKIP_MAP_CDS) ]] && export SKIP_MAP_CDS=1 && log 5 0 0 "param SKIP_MAP_CDS : 1" && continue
                [[ $(echo $ARG | grep KEEP_TMP) ]] && export KEEP_TMP=1 && log 5 0 0 "param KEEP_TMP : 1" && continue
                [[ $(echo $ARG | grep KEEP_FASTQ) ]] && export KEEP_FASTQ=1 && log 5 0 0 "param KEEP_FASTQ : 1" && continue
                [[ $(echo $ARG | grep MAP_ALL) ]] && export MAP_ALL=1 && log 5 0 0 "param MAP_ALL : mapear em todos genes" && continue

                [[ $(echo $ARG | grep EMAIL=) ]] && export EMAIL=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param EMAIL : $EMAIL" && continue
                [[ $(echo $ARG | grep TIMEOUT=) ]] && export TIMEOUT=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param TIMEOUT : $TIMEOUT" && continue
                [[ $(echo $ARG | grep GENE2PTNA=) ]] && export GENE2PTNA=$(echo $ARG | cut -d= -f2) && log 5 0 0 "param GENE2PTNA : $GENE2PTNA" && continue
                [[ $(echo $ARG | grep GEN_NCBI_TABLE) ]] && export GEN_NCBI_TABLE=1 && log 5 0 0 "param GEN_NCBI_TABLE : 1" && continue

                log 5 0 0 "param sem definicao $ARG" "WARN"
            fi
        fi
        ((idx = idx + 1))
    done
    (($CONT < 1)) && log 5 0 0 "sem amostras para quantificar" "ERRO" && return 1
    log 5 0 0 "total $CONT amostras quantificadas"
    cd $INI_DIR
}

rodar_rmats() {
    cd $TMP_DIR
    echo "$(date +%d/%m\ %H:%M) iniciando analise rMATS" >>$RESUMO
    [ -f $OUT_DIR/rmats_out.zip ] &&
        cp $OUT_DIR/rmats_out.zip rmats_out.zip &&
        unzip rmats_out.zip 1>$LOG_DIR/_6.1.0_rmats_unzip.log.txt 2>$LOG_DIR/_6.1.0_rmats_unzip.err.txt && export CTRL=$(grep -m1 CTRL= rmats_out/factors.txt | sed 's/.bams//') &&
        export CASE=$(grep -m1 CASE= rmats_out/factors.txt | sed 's/.bams//') &&
        log 6 1 0 "restaurado $TMP_DIR/rmats_out de $OUT_DIR/rmats_out.zip para o rMATS" &&
        echo "$(date +%d/%m\ %H:%M) analise rMATS restaurada" >>$RESUMO &&
        return

    log 6 1 0 "configurando $TMP_DIR/rmats_out para o rMATS"
    for SMP in $(cat sample_*/experimental_design.csv); do
        echo $SMP | awk -F "," '{printf $4"/"$2".rmats.bam,"}' >>$(echo $SMP | cut -d, -f3).bams
    done
    export CTRL=$(ls -1 *.bams | head -1)
    export CASE=$(ls -1 *.bams | head -2 | tail -1)
    echo "CTRL=$CTRL" >factors.txt
    echo "CASE=$CASE" >>factors.txt
    echo "$(date +%d/%m\ %H:%M) factor $CTRL escolhido para --b1 do rMATS" >>$RESUMO
    echo "$(date +%d/%m\ %H:%M) factor $CASE escolhido para --b2 do rMATS" >>$RESUMO

    ## rodar o rMATS
    log 6 1 1 "executando o rMATS para $CTRL x $CASE"
    python3 rmats/rmats.py --b1 $CTRL --b2 $CASE --gtf gene.gtf -t single \
        --od rmats_out \
        --tmp tmp_out \
        $RMATS_ARG1 $RMATS_ARG2 $RMATS_ARG3 $RMATS_ARG4 \
        1>$LOG_DIR/_6.1.1_rmats.log.txt 2>$LOG_DIR/_6.1.1_rmats.err.txt
    ## --readLength 150 --variable-read-length --nthread 1
    echo "$(date +%d/%m\ %H:%M) analise rMATS encontrou $(wc -l rmats_out/*.MATS.* | tail -1)  events" >>$RESUMO

    cp *.bams factors.txt rmats_out
    export CTRL=$(echo $CTRL | sed 's/.bams//')
    export CASE=$(echo $CASE | sed 's/.bams//')

    ## rodar o MASER
    if [ -d $TMP_DIR/rmats_out ]; then
        local mar=$([ $MIN_AVG_READS ] || echo "1")$MIN_AVG_READS
        local fdr=$([ $FDR ] || echo "0.05")$FDR
        local psi=$([ $PSI ] || echo "0.1")$PSI
        local mode=$([ $MODE ] || echo "JCEC")$MODE
        local gff=$([ -f $TMP_DIR/gene.gff ] && echo "$TMP_DIR/gene.gff")
        log 6 1 2 "executando o MASER , args:   MIN_AVG_READS: $mar | FDR: $fdr | PSI: $psi | MODE: $mode | GFF: $gff|"
        cd $TMP_DIR/rmats_out
        Rscript <(printf '
        show("script obtido de https://raw.githubusercontent.com/mcfonseca-lab/docker/master/rmats/run_maser.R")
        library(maser)
        args = commandArgs(trailingOnly=TRUE)
        label1 = args[[1]]
        label2 = args[[2]]
        min_avg_reads = as.numeric(args[[3]])
        fdr_threshold = as.numeric(args[[4]])
        deltaPSI_threshold = as.numeric(args[[5]])

        ftype = args[[6]] #JC or JCEC files
        if (length(args) > 6) {
        gtf = args[[7]]
        plot_transcripts=TRUE 
        } else {
        plot_transcripts=FALSE 
        }

        if (ftype == "JC"){
        ftype_long = "JC.txt"
        } else if (ftype == "JCEC"){
        ftype_long = "JCEC.txt"
        } else if (ftype == "JunctionCountOnly"){
        ftype_long = "JunctionCountOnly.txt"
        }

        #########################
        ####Coverage filter######
        #########################
        files <- list.files(path = ".", pattern=ftype_long)
        get_mean <- function(x){
        # Ensure that max between inc/exc isoform on both groups is higher than min_avg_reads 
        inc_s1 <- base::sapply(strsplit(as.character(x["IJC_SAMPLE_1"]), ",", fixed=T), function(x) base::mean(as.numeric(x)))
        exc_s1 <- base::sapply(strsplit(as.character(x["SJC_SAMPLE_1"]), ",", fixed=T), function(x) base::mean(as.numeric(x)))
        inc_s2 <- base::sapply(strsplit(as.character(x["IJC_SAMPLE_2"]), ",", fixed=T), function(x) base::mean(as.numeric(x)))
        exc_s2 <- base::sapply(strsplit(as.character(x["SJC_SAMPLE_2"]), ",", fixed=T), function(x) base::mean(as.numeric(x)))
        max_g1 <- max(c(inc_s1, exc_s1))
        max_g2 <- max(c(inc_s2, exc_s2))
        
        return(min(c(max_g1, max_g2)))

        }
        for (f in files){
        inclusion_table <- read.table(f, header = T)
        nrow_before <- nrow(inclusion_table)
        show(paste0("Filtering ", f, " file.. (", nrow_before, " events)"))
        filtered_table <- inclusion_table[apply(inclusion_table, 1, get_mean) > min_avg_reads,]
        nrow_after <- nrow(filtered_table)
        show(paste0("Number of events kept by coverage filter (min reads ", min_avg_reads, "):", 
                    nrow_after, "(", round(nrow_after/nrow_before*100,2), "%%)"))
        if(!dir.exists("coverage_filt/")){
            dir.create("coverage_filt/")
        }
        write.table(filtered_table, file = paste0("coverage_filt/", f), sep = "\t", quote=F)
        }
        ########################################
        ############# maser object #############
        ########################################
        maser_obj <- maser("coverage_filt/", c(label1, label2), ftype = ftype)

        ####################
        ######Volcano#######
        ####################
        as_types <- c("A3SS", "A5SS", "SE", "RI", "MXE")
        volcano_function <- function(type, maser_obj, fdr_threshold, deltaPSI_threshold){
        pdf(paste0("volcano_", type, ".pdf"))
        p <- maser::volcano(maser_obj, type = type, fdr = fdr_threshold, deltaPSI = deltaPSI_threshold)
        plot(p)
        dev.off()
        }
        base::lapply(as_types, volcano_function, maser_obj, fdr_threshold, deltaPSI_threshold)

        #############################
        ####dPSI/FDR filtering#######
        #############################
        maser_top_events <- maser::topEvents(maser_obj, fdr = fdr_threshold, deltaPSI = deltaPSI_threshold)
        print(maser_top_events)

        #############################
        #####Plot transcripts########
        #############################
        if(plot_transcripts){
        ens_gtf <- rtracklayer::import.gff(gtf)
        dir.create("tx_plots")
        plot_transcript_tracks <- function(x, maser_obj, gtf_f, type) {
            ID=gsub(" ", "", x["ID"], fixed = TRUE)
            gene=x["geneSymbol"]
            gene_maser <- geneEvents(maser_obj, geneS = gene)
            pdf(paste0("tx_plots/",gene,"_",type,"_",ID,"_tx.pdf"))
            plotTranscripts(gene_maser, type = type, event_id = ID,
                            gtf = gtf_f, zoom = F, show_PSI = TRUE)
            dev.off()
        }
        
        }
        ##########################
        ######Write output########
        ##########################
        for (event in c("SE","A5SS","A3SS","RI","MXE")){
        tryCatch(
            {
            top = maser::summary(maser_top_events, type = event)
            all = maser::summary(maser_obj, type = event)
            write.table(all, quote = F, sep= "\t", row.names = F, file=paste0("all_events_from_maser_", event, ".tsv"))
            write.table(top, quote = F, sep= "\t", row.names = F, file=paste0("sign_events_", event, ".tsv"))
            if(plot_transcripts){
                base::apply(top, 1, plot_transcript_tracks,maser_top_events,ens_gtf,event)  
            }
            },
            error=function(e){
            show(paste0("No ", event, " events passed the threshold"))
            }
        )
        }
        show("terminado com sucesso")' | sed 's/geneSymbol/GeneID/') $CTRL $CASE $mar $fdr $psi $mode $gff \
            1>$LOG_DIR/_6.1.2_msser.log.txt 2>$LOG_DIR/_6.1.2_maser.err.txt
    fi

    cd $TMP_DIR/rmats_out
    (($(ls -1 . | grep -c sign_events_) < 1)) && cut -f-2 *.MATS.$mode.txt | grep -v "^ID" | cut -f2 | tr -d \" | sort -u >rmats_as_genes.txt
    (($(ls -1 . | grep -c sign_events_) > 0)) && cut -f-2 sign_events_* | grep -v "^ID" | cut -f2 | tr -d \" | sort -u >rmats_as_genes.txt
    join -v1 <(sort -u rmats_as_genes.txt) <(cut -d, -f2 $TMP_DIR/transcript_gene_mapping.csv | sort -u) >rmats_non_coding_as_genes.txt
    (($(grep -c . rmats_non_coding_as_genes.txt) > 1)) && log 6 1 3 "rMATS AS Genes $(grep -c . rmats_as_genes.txt) [ALL] | $(grep -c . rmats_non_coding_as_genes.txt) [NONcoding]"
    join <(sort -u rmats_as_genes.txt) <(cut -d, -f2 $TMP_DIR/transcript_gene_mapping.csv | sort -u) >a && mv a rmats_as_genes.txt

    cd $TMP_DIR
    echo "$(date +%d/%m\ %H:%M) analise rMATS $(grep -c . $TMP_DIR/rmats_out/rmats_as_genes.txt) SIGNIFICATIVO genes" >>$RESUMO
    join $TMP_DIR/rmats_out/rmats_as_genes.txt $TMP_DIR/genes_as.txt >$TMP_DIR/rmats_out/rmats_as_genes_anotados.txt
    join -v1 $TMP_DIR/rmats_out/rmats_as_genes.txt $TMP_DIR/genes_as.txt >$TMP_DIR/rmats_out/rmats_as_genes_novos.txt
    log 6 1 3 "rMATS AS Genes ~ encontrados = $(grep -c . $TMP_DIR/rmats_out/rmats_as_genes.txt) / AS conhecidos = $(grep -c . $TMP_DIR/rmats_out/rmats_as_genes_anotados.txt) / AS novel  = $(grep -c . $TMP_DIR/rmats_out/rmats_as_genes_novos.txt)"

    if (($(grep -c . $TMP_DIR/rmats_out/rmats_as_genes_novos.txt) > 0)); then
        [ $RECURS_LIM ] && log 6 1 4 "achou genes novos diferentes novamente, abortando" "ERRO" && echo "$(date +%d/%m\ %H:%M) ERRO REC" >>$RESUMO && exit 1
        log 6 1 4 "Rodando mapeamento novamente para $(grep -c . $TMP_DIR/rmats_out/rmats_as_genes_novos.txt) genes"
        export OLD_TMP=$TMP_DIR
        echo "$(date +%d/%m\ %H:%M) abortando para reiterar comm $(grep -c . $TMP_DIR/rmats_out/rmats_as_genes_novos.txt) novos genes !!!! " >>$RESUMO
        if cp $RESUMO $TMP_DIR/resumo.old.txt && rm -rf $OUT_DIR && mkdir $OUT_DIR && mv $TMP_DIR/resumo.old.txt $OUT_DIR &&
            cat $OLD_TMP/rmats_out/rmats_as_genes_novos.txt $OUT_DIR/novel_as.txt | sort -u >a && mv a $OUT_DIR/novel_as.txt &&
            preparar_ambiente $4 &&
            obter_dados $1 $2 $3 &&
            processar_sequencias &&
            indexar_sequencias &&
            quantificar_amostras $@; then
            rm -rf $OLD_TMP
            log 6 1 0 "analisando novamente - $OLD_TMP - agora : $TMP_DIR"
            export RECURS_LIM=1
            analisar
            return 0
        fi
    fi

    log 6 1 4 "persistindo resultados do rMATS"
    echo "$(date +%d/%m\ %H:%M) analise rMATS terminada" >>$RESUMO
    cd $TMP_DIR && zip -r $OUT_DIR/rmats_out.zip rmats_out 1>$LOG_DIR/_6.1.4_rmats_zip.log.txt 2>$LOG_DIR/_6.1.4_rmats_zip.err.txt
}

rodar_3drnaseq() {
    cd $TMP_DIR
    echo "$(date +%d/%m\ %H:%M) iniciando analise 3DRnaSEQ" >>$RESUMO

    [ -f $OUT_DIR/to3d.zip ] &&
        cp $OUT_DIR/to3d.zip to3d.zip &&
        unzip to3d.zip 1>$LOG_DIR/_6.2.0_3drnaseq_unzip.log.txt 2>$LOG_DIR/_6.2.0_3drnaseq_unzip.err.txt &&
        log 6 2 0 "restaurado $TMP_DIR/to3d de $OUT_DIR/to3d.zip para o 3DRNASeq" &&
        echo "$(date +%d/%m\ %H:%M) analise 3DRnaSEQ restaurada" >>$RESUMO &&
        return

    ## rodar o 3D Rnaseq
    mkdir -p $TMP_DIR/to3d
    log 6 2 0 "Montar o csv experimentarl design para o 3DRnaseq"
    echo "RUN,SAMPLE,FACTOR,FOLDER" >$TMP_DIR/to3d/experimental_design.csv
    cat $TMP_DIR/sample_*/experimental_design.csv >>$TMP_DIR/to3d/experimental_design.csv
    cp $TMP_DIR/transcript_gene_mapping.csv $TMP_DIR/to3d
    cd $TMP_DIR
    log 6 2 1 "Rodar o 3DRnaseq"
    Rscript <(printf '
        show("scritp obtido de https://github.com/wyguo/ThreeDRNAseq/blob/master/vignettes/user_manuals/3D_RNA-seq_command_line_user_manual.md") 
        ###---> ThreeDRNAseq R package
        library(ThreeDRNAseq)

        ###---> Denpendency R package
        library(tximport)
        library(edgeR)
        library(limma)
        library(RUVSeq)
        library(eulerr)
        library(gridExtra)
        library(grid)
        library(ComplexHeatmap)
        library(ggplot2)
        library(ggrepel)

        options(stringsAsFactors=F)

        args = commandArgs(trailingOnly=TRUE)
        label1 = args[[1]]
        label2 = args[[2]]
        tmp_dir = args[[3]]
        qnt_dir = args[[4]]

        show(paste("ARGS: ", label1, label2, tmp_dir, qnt_dir))

        setwd(tmp_dir)

        ##save to object
        DDD.data <- list()
        ################################################################################
        ##----->> Set folders to read and save results
        data.folder <- file.path(getwd(),"data") # for .RData format results
        result.folder <- file.path(getwd(),"result") # for 3D analysis results in csv files
        figure.folder <- file.path(getwd(),"figure")# for figures
        report.folder <- file.path(getwd(),"report")

        DDD.data$data.folder <- data.folder
        DDD.data$result.folder <- result.folder
        DDD.data$figure.folder <- figure.folder
        DDD.data$report.folder <- report.folder

        if(!file.exists(data.folder))
        dir.create(path = data.folder,recursive = T)
        if(!file.exists(result.folder))
        dir.create(path = result.folder,recursive = T)
        if(!file.exists(figure.folder))
        dir.create(path = figure.folder,recursive = T)
        if(!file.exists(report.folder))
        dir.create(path = report.folder,recursive = T)

        ### Set the input data folder
        ##----->> folder of input files
        input.folder <- tmp_dir
        quant.folder <- qnt_dir

        ################################################################################
        ##----->> parameters of tximport to generate read counts and TPMs
        quant_method <- "salmon" # abundance generator
        tximport_method <- "lengthScaledTPM" # method to generate expression in tximport

        ################################################################################
        ##----->> parameters for data pre-processing
        ### has sequencign replicates?
        has_srep <- F

        ### parameter for low expression filters
        cpm_cut <- 1
        cpm_samples_n <- 3

        ### parameter for batch effect estimation
        has_batcheffect <- T
        RUVseq_method <- "RUVr" # RUVseq_method is one of "RUVr", "RUVs" and "RUVg"

        ### data normalisation parameter
        norm_method <- "TMM" ## norm_method is one of "TMM","RLE" and "upperquartile"

        ################################################################################
        ##----->> parameters for 3D analysis
        pval_adj_method <- "BH"
        pval_cut <- 0.01
        l2fc_cut <- 1
        DE_pipeline <- "limma"
        deltaPS_cut <- 0.1
        DAS_pval_method <- "F-test"

        ################################################################################
        ##----->> heatmap
        dist_method <- "euclidean"
        cluster_method <- "ward.D"
        cluster_number <- 10

        ################################################################################
        ##----->> TSIS
        TSISorisokTSP <- "isokTSP"
        TSIS_method_intersection <- method_intersection <- "mean"
        TSIS_spline_df <- spline_df <- NULL
        TSIS_prob_cut <- 0.5
        TSIS_diff_cut <- 1
        TSIS_adj_pval_cut <- 0.05
        TSIS_time_point_cut <- 1
        TSIS_cor_cut <- 0

        ################################################################################
        ##----->> Meta table includes sample information, e.g. conditions, bio-reps, seq-reps, abundance paths, etc.
        metatable <- read.csv(file.path(getwd(),"experimental_design.csv"))
        ##select the columns of experimental design
        factor_col <- c("FACTOR")
        brep_col <- "SAMPLE"
        quant_col <- "FOLDER"
        srep_col <- "seq_rep"

        ##arrange information in the metatable
        metatable$label <- as.vector(interaction(metatable[,factor_col]))
        metatable$sample.name <- as.vector(interaction(metatable[,c(factor_col,brep_col)]))
        metatable$quant.folder <-  file.path(quant.folder,metatable[,quant_col],
                                            ifelse(quant_method=="salmon","quant.sf","abundance.h5"))
        show(metatable)

        ##----->> Transcript-gene association mapping
        mapping <-read.csv(file.path(getwd(),"transcript_gene_mapping.csv"))
        mapping <- data.frame(as.matrix(mapping),stringsAsFactors = F)
        rownames(mapping) <- mapping$TXNAME
        show(paste("Genes importados: ", length(unique( mapping$GENEID ))))
        show(paste("Transcript importados: ", length(unique( mapping$TXNAME ))))

        show("==========> Read files      => OK")


        ################################################################################
        ##----->> Generate gene expression
        ##
        txi_genes <- tximport(metatable$quant.folder,dropInfReps = T,
                            type = quant_method, tx2gene = mapping,
                            countsFromAbundance = tximport_method)

        ## give colunames to the datasets
        colnames(txi_genes$counts) <-
        colnames(txi_genes$abundance) <-
        colnames(txi_genes$length) <-metatable$sample.name

        ## save the data
        write.csv(txi_genes$counts,file=paste0(result.folder,"/counts_genes.csv"))
        write.csv(txi_genes$abundance,file=paste0(result.folder,"/TPM_genes.csv"))
        save(txi_genes,file=paste0(data.folder,"/txi_genes.RData"))

        ################################################################################
        ##----->> Generate transcripts expression
        txi_trans<- tximport(metatable$quant.folder, 
                            type = quant_method, tx2gene = NULL,
                            countsFromAbundance = tximport_method,
                            txOut = T,dropInfReps = T)

        ## give colunames to the datasets
        colnames(txi_trans$counts) <- 
        colnames(txi_trans$abundance) <-
        colnames(txi_trans$length) <-metatable$sample.name

        ## save the data
        write.csv(txi_trans$counts,file=paste0(result.folder,"/counts_trans.csv"))
        write.csv(txi_trans$abundance,file=paste0(result.folder,"/TPM_trans.csv"))
        save(txi_trans,file=paste0(data.folder,"/txi_trans.RData"))

        ################################################################################
        ##extract gene and transcript read counts
        genes_counts <- txi_genes$counts
        trans_counts <- txi_trans$counts
        trans_TPM <- txi_trans$abundance


        show("==========> Run tximport    => OK")

        ##If no sequencing replicates, genes_counts and trans_counts remain the same by 
        if(has_srep){
        idx <- paste0(metatable$label,".",metatable[,brep_col])
        genes_counts <- sumarrays(genes_counts,group = idx)
        trans_counts <- sumarrays(trans_counts,group = idx)
        metatable_new <- metatable[metatable[,srep_col]==metatable[,srep_col][1],]
        } else {
        metatable_new <- metatable
        }

        show("==========> Step 1: Merge sequencing replicates    => OK")



        ################################################################################
        ##----->> Do the filters
        target_high <- low.expression.filter(abundance = trans_counts,
                                            mapping = mapping,
                                            abundance.cut = cpm_cut,
                                            sample.n = cpm_samples_n,
                                            unit = "counts",
                                            Log=F)
        ##save expressed genes and transcripts
        save(target_high,file=paste0(data.folder,"/target_high.RData"))

        ################################################################################
        ##----->> Mean-variance plot
        ## transcript level

        counts.raw = trans_counts[rowSums(trans_counts>0)>0,]
        counts.filtered = trans_counts[target_high$trans_high,]
        mv.trans <- check.mean.variance(counts.raw = counts.raw,
                                        counts.filtered = counts.filtered,
                                        condition = metatable_new$label)
        ### make plot
        fit.raw <- mv.trans$fit.raw
        fit.filtered <- mv.trans$fit.filtered
        mv.trans.plot <- function(){
        par(mfrow=c(1,2))
        plotMeanVariance(x = fit.raw$sx,y = fit.raw$sy,
                            l = fit.raw$l,lwd=2,fit.line.col ="gold",col="black")
        title("\n\nRaw counts (transcript level)")
        plotMeanVariance(x = fit.filtered$sx,y = fit.filtered$sy,
                            l = fit.filtered$l,lwd=2,col="black")
        title("\n\nFiltered counts (transcript level)")
        lines(fit.raw$l, col = "gold",lty=4,lwd=2)
        legend("topright",col = c("red","gold"),lty=c(1,4),lwd=3,
                legend = c("low-exp removed","low-exp kept"))
        }
        mv.trans.plot()

        ### save to figure folder
        png(filename = paste0(figure.folder,"/Transcript mean-variance trend.png"),
            width = 25/2.54,height = 12/2.54,units = "in",res = 300)
        mv.trans.plot()
        dev.off()

        pdf(file = paste0(figure.folder,"/Transcript mean-variance trend.pdf"),
            width = 25/2.54,height = 12/2.54)
        mv.trans.plot()
        dev.off()

        ################################################################################
        ## gene level
        counts.raw = genes_counts[rowSums(genes_counts>0)>0,]
        counts.filtered = genes_counts[target_high$genes_high,]
        mv.genes <- check.mean.variance(counts.raw = counts.raw,
                                        counts.filtered = counts.filtered,
                                        condition = metatable_new$label)
        ### make plot
        fit.raw <- mv.genes$fit.raw
        fit.filtered <- mv.genes$fit.filtered
        mv.genes.plot <- function(){
        par(mfrow=c(1,2))
        plotMeanVariance(x = fit.raw$sx,y = fit.raw$sy,
                            l = fit.raw$l,lwd=2,fit.line.col ="gold",col="black")
        title("\n\nRaw counts (gene level)")
        plotMeanVariance(x = fit.filtered$sx,y = fit.filtered$sy,
                            l = fit.filtered$l,lwd=2,col="black")
        title("\n\nFiltered counts (gene level)")
        lines(fit.raw$l, col = "gold",lty=4,lwd=2)
        legend("topright",col = c("red","gold"),lty=c(1,4),lwd=3,
                legend = c("low-exp removed","low-exp kept"))
        }
        mv.genes.plot()

        ### save to figure folder
        png(filename = paste0(figure.folder,"/Gene mean-variance trend.png"),
            width = 25/2.54,height = 12/2.54,units = "in",res = 300)
        mv.genes.plot()
        dev.off()

        pdf(file = paste0(figure.folder,"/Gene mean-variance trend.pdf"),
            width = 25/2.54,height = 12/2.54)
        mv.genes.plot()
        dev.off()

        show("==========> Step 2: Filter low expression transcripts/genes   => OK")


        ################################################################################
        ##----->> trans level
        data2pca <- trans_counts[target_high$trans_high,]
        dge <- DGEList(counts=data2pca) 
        dge <- calcNormFactors(dge)
        data2pca <- t(counts2CPM(obj = dge,Log = T))
        dim1 <- "PC1"
        dim2 <- "PC2"
        ellipse.type <- "polygon" #ellipse.type=c("none","ellipse","polygon")

        ##--All Bio-reps plots
        groups <- metatable_new[,brep_col] ## colour on biological replicates
        # groups <- metatable_new$label ## colour on condtions
        g <- plotPCAind(data2pca = data2pca,dim1 = dim1,dim2 = dim2,
                        groups = groups,plot.title = "Transcript PCA: bio-reps",
                        ellipse.type = ellipse.type,
                        add.label = T,adj.label = F)

        g

        ### save to figure
        png(filename = paste0(figure.folder,"/Transcript PCA Bio-reps.png"),
            width = 15/2.54,height = 13/2.54,units = "in",res = 300)
        print(g)
        dev.off()

        pdf(file = paste0(figure.folder,"/Transcript PCA Bio-reps.pdf"),
            width = 15/2.54,height = 13/2.54)
        print(g)
        dev.off()

        ##################################################
        ##--average expression plot
        groups <- metatable_new[,brep_col]
        data2pca.ave <- rowmean(data2pca,metatable_new$label,reorder = F)
        groups <- unique(metatable_new$label)
        g <- plotPCAind(data2pca = data2pca.ave,dim1 = "PC1",dim2 = "PC2",
                        groups = groups,plot.title = "Transcript PCA: average expression",
                        ellipse.type = "none",add.label = T,adj.label = F)

        g

        ### save to figure
        png(filename = paste0(figure.folder,"/Transcript PCA average expression.png"),
            width = 15/2.54,height = 13/2.54,units = "in",res = 300)
        print(g)
        dev.off()

        pdf(file = paste0(figure.folder,"/Transcript PCA average expression.pdf"),
            width = 15/2.54,height = 13/2.54)
        print(g)
        dev.off()


        ################################################################################
        ##----->> genes level
        data2pca <- genes_counts[target_high$genes_high,]
        dge <- DGEList(counts=data2pca) 
        dge <- calcNormFactors(dge)
        data2pca <- t(counts2CPM(obj = dge,Log = T))
        dim1 <- "PC1"
        dim2 <- "PC2"
        ellipse.type <- "polygon" #ellipse.type=c("none","ellipse","polygon")

        ##--All Bio-reps plots

        groups <- metatable_new[,brep_col] ## colour on biological replicates
        # groups <- metatable_new$label ## colour on condtions
        g <- plotPCAind(data2pca = data2pca,dim1 = dim1,dim2 = dim2,
                        groups = groups,plot.title = "genescript PCA: bio-reps",
                        ellipse.type = ellipse.type,
                        add.label = T,adj.label = F)

        g

        ### save to figure
        png(filename = paste0(figure.folder,"/Gene PCA Bio-reps.png"),
            width = 15/2.54,height = 13/2.54,units = "in",res = 300)
        print(g)
        dev.off()

        pdf(file = paste0(figure.folder,"/Gene PCA Bio-reps.pdf"),
            width = 15/2.54,height = 13/2.54)
        print(g)
        dev.off()

        ##################################################
        ##--average expression plot
        rownames(data2pca) <- gsub("_",".",rownames(data2pca))
        groups <- metatable_new[,brep_col]
        data2pca.ave <- rowmean(data2pca,metatable_new$label,reorder = F)
        groups <- unique(metatable_new$label)
        g <- plotPCAind(data2pca = data2pca.ave,dim1 = "PC1",dim2 = "PC2",
                        groups = groups,plot.title = "genescript PCA: average expression",
                        ellipse.type = "none",add.label = T,adj.label = F)

        g

        ### save to figure
        png(filename = paste0(figure.folder,"/Gene PCA average expression.png"),
            width = 15/2.54,height = 13/2.54,units = "in",res = 300)
        print(g)
        dev.off()

        pdf(file = paste0(figure.folder,"/Gene PCA average expression.pdf"),
            width = 15/2.54,height = 13/2.54)
        print(g)
        dev.off()


        show("==========> Step 3: Principal component analysis (PCA)   => OK")

        design <- condition2design(condition = metatable_new$label,
                                batch.effect = NULL)

        ################################################################################
        ##----->> trans level
        trans_batch <- remove.batch(read.counts = trans_counts[target_high$trans_high,],
                                    condition = metatable_new$label,
                                    design = design,
                                    contrast=NULL,
                                    group = metatable_new$label,
                                    method = RUVseq_method)
        save(trans_batch,file=paste0(data.folder,"/trans_batch.RData")) 

        ################################################################################
        ##----->> genes level
        genes_batch <- remove.batch(read.counts = genes_counts[target_high$genes_high,],
                                    condition = metatable_new$label,
                                    design = design,
                                    contrast=NULL,
                                    group = metatable_new$label,
                                    method = RUVseq_method)
        save(genes_batch,file=paste0(data.folder,"/genes_batch.RData")) 


        ################################################################################
        ## DO the PCA again
        ################################################################################

        ##----->> trans level
        data2pca <- trans_batch$normalizedCounts[target_high$trans_high,]
        dge <- DGEList(counts=data2pca) 
        dge <- calcNormFactors(dge)
        data2pca <- t(counts2CPM(obj = dge,Log = T))
        dim1 <- "PC1"
        dim2 <- "PC2"
        ellipse.type <- "polygon" #ellipse.type=c("none","ellipse","polygon")

        ##--All Bio-reps plots
        groups <- metatable_new[,brep_col] ## colour on biological replicates
        # groups <- metatable_new$label ## colour on condtions
        g <- plotPCAind(data2pca = data2pca,dim1 = dim1,dim2 = dim2,
                        groups = groups,plot.title = "Transcript PCA: bio-reps",
                        ellipse.type = ellipse.type,
                        add.label = T,adj.label = F)

        g

        ### save to figure
        png(filename = paste0(figure.folder,"/Transcript PCA batch effect removed Bio-reps.png"),
            width = 15/2.54,height = 13/2.54,units = "in",res = 300)
        print(g)
        dev.off()

        pdf(file = paste0(figure.folder,"/Transcript PCA batch effect removed Bio-reps.pdf"),
            width = 15/2.54,height = 13/2.54)
        print(g)
        dev.off()

        ##################################################
        ##--average expression plot
        groups <- metatable_new[,brep_col]
        data2pca.ave <- rowmean(data2pca,metatable_new$label,reorder = F)
        groups <- unique(metatable_new$label)
        g <- plotPCAind(data2pca = data2pca.ave,dim1 = "PC1",dim2 = "PC2",
                        groups = groups,plot.title = "Transcript PCA: average expression",
                        ellipse.type = "none",add.label = T,adj.label = F)

        g

        ### save to figure
        png(filename = paste0(figure.folder,"/Transcript PCA batch effect removed average expression.png"),
            width = 15/2.54,height = 13/2.54,units = "in",res = 300)
        print(g)
        dev.off()

        pdf(file = paste0(figure.folder,"/Transcript PCA batch effect removed average expression.pdf"),
            width = 15/2.54,height = 13/2.54)
        print(g)
        dev.off()


        ################################################################################
        ##----->> genes level
        data2pca <- genes_batch$normalizedCounts[target_high$genes_high,]
        dge <- DGEList(counts=data2pca) 
        dge <- calcNormFactors(dge)
        data2pca <- t(counts2CPM(obj = dge,Log = T))
        dim1 <- "PC1"
        dim2 <- "PC2"
        ellipse.type <- "polygon" #ellipse.type=c("none","ellipse","polygon")

        ##--All Bio-reps plots
        rownames(data2pca) <- gsub("_",".",rownames(data2pca))
        groups <- metatable_new[,brep_col] ## colour on biological replicates
        # groups <- metatable_new$label ## colour on condtions
        g <- plotPCAind(data2pca = data2pca,dim1 = dim1,dim2 = dim2,
                        groups = groups,plot.title = "genescript PCA: bio-reps",
                        ellipse.type = ellipse.type,
                        add.label = T,adj.label = F)

        g

        ### save to figure
        png(filename = paste0(figure.folder,"/Gene PCA batch effect removed Bio-reps.png"),
            width = 15/2.54,height = 13/2.54,units = "in",res = 300)
        print(g)
        dev.off()

        pdf(file = paste0(figure.folder,"/Gene PCA batch effect removed Bio-reps.pdf"),
            width = 15/2.54,height = 13/2.54)
        print(g)
        dev.off()

        ##################################################
        ##--average expression plot
        rownames(data2pca) <- gsub("_",".",rownames(data2pca))
        groups <- metatable_new[,brep_col]
        data2pca.ave <- rowmean(data2pca,metatable_new$label,reorder = F)
        groups <- unique(metatable_new$label)
        g <- plotPCAind(data2pca = data2pca.ave,dim1 = "PC1",dim2 = "PC2",
                        groups = groups,plot.title = "genescript PCA: average expression",
                        ellipse.type = "none",add.label = T,adj.label = F)

        g

        ### save to figure
        png(filename = paste0(figure.folder,"/Gene PCA batch effect removed average expression.png"),
            width = 15/2.54,height = 13/2.54,units = "in",res = 300)
        print(g)
        dev.off()

        pdf(file = paste0(figure.folder,"/Gene PCA batch effect removed average expression.pdf"),
            width = 15/2.54,height = 13/2.54)
        print(g)
        dev.off()


        show("==========> Step 4: Batch effect estimation   => OK")



        ################################################################################
        ##----->> trans level
        dge <- DGEList(counts=trans_counts[target_high$trans_high,],
                    group = metatable_new$label,
                    genes = mapping[target_high$trans_high,])
        trans_dge <- suppressWarnings(calcNormFactors(dge,method = norm_method))
        save(trans_dge,file=paste0(data.folder,"/trans_dge.RData"))

        ################################################################################
        ##----->> genes level
        dge <- DGEList(counts=genes_counts[target_high$genes_high,],
                    group = metatable_new$label)
        genes_dge <- suppressWarnings(calcNormFactors(dge,method = norm_method))
        save(genes_dge,file=paste0(data.folder,"/genes_dge.RData"))

        ################################################################################
        ##----->> distribution plot
        sample.name <- paste0(metatable_new$label,".",metatable_new[,brep_col])
        condition <- metatable_new$label

        ###--- trans level
        data.before <- trans_counts[target_high$trans_high,]
        data.after <- counts2CPM(obj = trans_dge,Log = T)
        g <- boxplotNormalised(data.before = data.before,
                                data.after = data.after,
                                condition = condition,
                                sample.name = sample.name)
        do.call(grid.arrange,g)

        ### save to figure
        png(filename = paste0(figure.folder,"/Transcript expression distribution.png"),
            width = 20/2.54,height = 20/2.54,units = "in",res = 300)
        do.call(grid.arrange,g)
        dev.off()

        pdf(file = paste0(figure.folder,"/Transcript expression distribution.pdf"),
            width = 20/2.54,height = 20/2.54)
        do.call(grid.arrange,g)
        dev.off()

        ###--- genes level
        data.before <- genes_counts[target_high$genes_high,]
        data.after <- counts2CPM(obj = genes_dge,Log = T)
        g <- boxplotNormalised(data.before = data.before,
                                data.after = data.after,
                                condition = condition,
                                sample.name = sample.name)
        do.call(grid.arrange,g)

        ### save to figure
        png(filename = paste0(figure.folder,"/Gene expression distribution.png"),
            width = 20/2.54,height = 20/2.54,units = "in",res = 300)
        do.call(grid.arrange,g)
        dev.off()

        pdf(file = paste0(figure.folder,"/Gene expression distribution.pdf"),
            width = 20/2.54,height = 20/2.54)
        do.call(grid.arrange,g)
        dev.off()



        show("==========> Step 5: Data normalization   => OK")

        RNAseq_info <- data.frame(
        Description=c("Raw transcripts",
                        "Raw genes",
                        "Samples",
                        "Samples after merging seq-reps",
                        "Condition of interest",
                        "CPM cut-off",
                        "Min samples to CPM cut-off",
                        "Expressed transcripts",
                        "Expressed genes"),
        Number=c(length(mapping$TXNAME),
                length(unique(mapping$GENEID)),
                nrow(metatable),
                nrow(metatable_new),
                length(unique(metatable$label)),
                cpm_cut,
                cpm_samples_n,
                length(target_high$trans_high),
                length(target_high$genes_high))
        )
        DDD.data$RNAseq_info <- RNAseq_info

        RNAseq_info

        contrast_uniq <- paste0(label1,"-",label2)
        contrast_pw <- c(contrast_uniq)

        ##----->> group mean contrast groups
        contrast_mean <- c()

        ##----->> group differences contrast groups
        contrast_pgdiff <- c()

        ##----->> put together
        contrast <- unique(c(contrast_pw,contrast_mean,contrast_pgdiff))

        DDD.data$contrast_pw <- contrast_pw
        DDD.data$contrast_mean <- contrast_mean
        DDD.data$contrast_pgdiff <- contrast_pgdiff
        DDD.data$contrast <- contrast


        show("==========> Step 1: Set contrast group   => OK")


        batch.effect <- genes_batch$W
        # batch.effect <- NULL ## if has no batch effects
        design <- condition2design(condition = metatable_new$label,
                                batch.effect = batch.effect)

        ################################################################################
        if(DE_pipeline == "limma"){
        ##----->> limma pipeline
        genes_3D_stat <- limma.pipeline(dge = genes_dge,
                                        design = design,
                                        deltaPS = NULL,
                                        contrast = contrast,
                                        diffAS = F,
                                        adjust.method = pval_adj_method)
        }

        if(DE_pipeline == "glmQL"){
        ##----->> edgeR glmQL pipeline
        genes_3D_stat <- edgeR.pipeline(dge = genes_dge,
                                        design = design,
                                        deltaPS = NULL,
                                        contrast = contrast,
                                        diffAS = F,
                                        method = "glmQL",
                                        adjust.method = pval_adj_method)
        }

        if(DE_pipeline == "glm"){
        ##----->> edgeR glm pipeline
        genes_3D_stat <- edgeR.pipeline(dge = genes_dge,
                                        design = design,
                                        deltaPS = NULL,
                                        contrast = contrast,
                                        diffAS = F,
                                        method = "glm",
                                        adjust.method = pval_adj_method)
        }
        ## save results
        DDD.data$genes_3D_stat <- genes_3D_stat

        show("==========> Step 2: DE genes  => OK")

        ################################################################################
        ##----->> generate deltaPS
        deltaPS <- transAbundance2PS(transAbundance =txi_trans$abundance[target_high$trans_high,],
                                    PS = NULL,
                                    contrast = contrast,
                                    condition = metatable$label,
                                    mapping = mapping[target_high$trans_high,])

        DDD.data$PS <- PS <- deltaPS$PS
        DDD.data$deltaPS <- deltaPS <- deltaPS$deltaPS


        ################################################################################
        ##----->> DAS genes,DE and DTU transcripts
        batch.effect <- genes_batch$W
        # batch.effect <- NULL ## if has no batch effects
        design <- condition2design(condition = metatable_new$label,
                                batch.effect = batch.effect)

        ################################################################################
        if(DE_pipeline == "limma"){
        ##----->> limma pipeline
        trans_3D_stat <- limma.pipeline(dge = trans_dge,
                                        design = design,
                                        deltaPS = deltaPS,
                                        contrast = contrast,
                                        diffAS = T,
                                        adjust.method = pval_adj_method)
        }

        if(DE_pipeline == "glmQL"){
        ##----->> edgeR glmQL pipeline
        trans_3D_stat <- edgeR.pipeline(dge = trans_dge,
                                        design = design,
                                        deltaPS = deltaPS,
                                        contrast = contrast,
                                        diffAS = T,
                                        method = "glmQL",
                                        adjust.method = pval_adj_method)
        }

        if(DE_pipeline == "glm"){
        ##----->> edgeR glm pipeline
        trans_3D_stat <- edgeR.pipeline(dge = trans_dge,
                                        design = design,
                                        deltaPS = deltaPS,
                                        contrast = contrast,
                                        diffAS = T,
                                        method = "glm",
                                        adjust.method = pval_adj_method)
        }
        ## save results
        DDD.data$trans_3D_stat <- trans_3D_stat

        show("==========> Step 3: DAS genes, DE and DTU transcripts => OK")

        ################################################################################
        ##----->> Summary DE genes
        DE_genes <- summaryDEtarget(stat = genes_3D_stat$DE.stat,
                                    cutoff = c(adj.pval=pval_cut,
                                                log2FC=l2fc_cut))
        DDD.data$DE_genes <- DE_genes

        ################################################################################
        ## summary DAS genes, DE and DTU trans
        ##----->> DE trans
        DE_trans <- summaryDEtarget(stat = trans_3D_stat$DE.stat,
                                    cutoff = c(adj.pval=pval_cut,
                                                log2FC=l2fc_cut))
        DDD.data$DE_trans <- DE_trans

        ##----->> DAS genes
        if(DAS_pval_method=="F-test") {
        DAS.stat <- trans_3D_stat$DAS.F.stat
        } else {
        DAS.stat <- trans_3D_stat$DAS.Simes.stat
        }

        lfc <- genes_3D_stat$DE.lfc
        lfc <- reshape2::melt(as.matrix(lfc))
        colnames(lfc) <- c("target","contrast","log2FC")
        DAS_genes <- summaryDAStarget(stat = DAS.stat,
                                        lfc = lfc,
                                        cutoff=c(pval_cut,deltaPS_cut))
        DDD.data$DAS_genes <- DAS_genes

        ##----->> DTU trans
        lfc <- trans_3D_stat$DE.lfc
        lfc <- reshape2::melt(as.matrix(lfc))
        colnames(lfc) <- c("target","contrast","log2FC")
        DTU_trans <- summaryDAStarget(stat = trans_3D_stat$DTU.stat,
                                        lfc = lfc,cutoff = c(adj.pval=pval_cut,
                                                            deltaPS=deltaPS_cut))
        DDD.data$DTU_trans <- DTU_trans

        ################################################################################
        ## save csv
        write.csv(DE_genes,file=paste0(result.folder,"/DE genes.csv"),row.names = F)
        write.csv(DAS_genes,file=paste0(result.folder,"/DAS genes.csv"),row.names = F)
        write.csv(DE_trans,file=paste0(result.folder,"/DE transcripts.csv"),row.names = F)
        write.csv(DTU_trans,file=paste0(result.folder,"/DTU transcripts.csv"),row.names = F)

        ################################################################################
        ##----->> target numbers
        DDD_numbers <- summary3Dnumber(DE_genes = DE_genes,
                                        DAS_genes = DAS_genes,
                                        DE_trans = DE_trans,
                                        DTU_trans=DTU_trans,
                                        contrast = contrast)
        DDD_numbers
        write.csv(DDD_numbers,file=paste0(result.folder,"/DE DAS DTU numbers.csv"),
                row.names = F)
        DDD.data$DDD_numbers <- DDD_numbers
        ################################################################################
        ##----->> DE vs DAS
        DEvsDAS_results <- DEvsDAS(DE_genes = DE_genes,
                                DAS_genes = DAS_genes,
                                contrast = contrast)
        DEvsDAS_results
        DDD.data$DEvsDAS_results <- DEvsDAS_results
        write.csv(DEvsDAS_results,file=paste0(result.folder,"/DE vs DAS gene number.csv"),
                row.names = F)


        ################################################################################
        ##----->> DE vs DTU
        DEvsDTU_results <- DEvsDTU(DE_trans = DE_trans,
                                DTU_trans = DTU_trans,
                                contrast = contrast)
        DEvsDTU_results
        DDD.data$DEvsDTU_results <- DEvsDTU_results
        write.csv(DEvsDTU_results,file=paste0(result.folder,"/DE vs DTU transcript number.csv"),row.names = F)


        show("==========> Step 4 Result summary")


        ################################################################################
        ##----->> DE genes
        idx <- factor(DE_genes$contrast,levels = contrast)
        targets <-  split(DE_genes,idx)
        data2plot <- lapply(contrast,function(i){
        if(nrow(targets[[i]])==0){
            x <- data.frame(contrast=i,regulation=c("down-regulated","up-regulated"),number=0)
        } else {
            x <- data.frame(contrast=i,table(targets[[i]]$up.down))
            colnames(x) <- c("contrast","regulation","number")
        }
        x
        })
        data2plot <- do.call(rbind,data2plot)
        g.updown <- plotUpdown(data2plot,plot.title = "DE genes",contrast = contrast)
        print(g.updown)

        ### save to figure
        png(paste0(figure.folder,"/DE genes up and down regulation numbers.png"),
            width = length(contrast)*5/2.54,10/2.54,units = "in",res = 300)
        print(g.updown)
        dev.off()

        pdf(paste0(figure.folder,"/DE genes up and down regulation numbers.pdf"),
            width = length(contrast)*5/2.54,10/2.54)
        print(g.updown)
        dev.off()

        ################################################################################
        ##----->> DE trans
        idx <- factor(DE_trans$contrast,levels = contrast)
        targets <-  split(DE_trans,idx)
        data2plot <- lapply(contrast,function(i){
        if(nrow(targets[[i]])==0){
            x <- data.frame(contrast=i,regulation=c("down-regulated","up-regulated"),number=0)
        } else {
            x <- data.frame(contrast=i,table(targets[[i]]$up.down))
            colnames(x) <- c("contrast","regulation","number")
        }
        x
        })
        data2plot <- do.call(rbind,data2plot)
        g.updown <- plotUpdown(data2plot,plot.title = "DE trans",contrast = contrast)
        print(g.updown)

        ### save to figure
        png(paste0(figure.folder,"/DE transcripts up and down regulation numbers.png"),
            width = length(contrast)*5/2.54,10/2.54,units = "in",res = 300)
        print(g.updown)
        dev.off()

        pdf(paste0(figure.folder,"/DE transcripts up and down regulation numbers.pdf"),
            width = length(contrast)*5/2.54,10/2.54)
        print(g.updown)
        dev.off()




        top.n <- 10
        size <- 1
        col0 <- "black"
        col1 <- "red"
        idx <- c("DE genes","DAS genes","DE transcripts","DTU transcripts")
        title.idx <- c(paste0("Volcano plot: DE genes (Low expression filtered; \nAdjusted p<",
                            pval_cut,"; |L2FC|>=",l2fc_cut,"; Labels: top ",
                            top.n," distance to (0,0))"),
                    paste0("Volcano plot: DAS genes (Low expression filtered; \nAdjusted p<",
                            pval_cut,"; |MaxdeltaPS|>=",deltaPS_cut,"; Labels: top ",
                            top.n," distance to (0,0))"),
                    paste0("Volcano plot: DE transcripts (Low expression filtered; \nAdjusted p<",
                            pval_cut,"; |L2FC|>=",l2fc_cut,"; Labels: top ",
                            top.n," distance to (0,0))"),
                    paste0("Volcano plot: DTU transcripts (Low expression filtered; \nAdjusted p<",
                            pval_cut,"; |deltaPS|>=",deltaPS_cut,"; Labels: top ",
                            top.n," distance to (0,0))")
        )
        names(title.idx) <- idx
        g <- lapply(idx,function(i){
        if(i=="DE genes"){
            DDD.stat <- genes_3D_stat$DE.stat
            data2plot <- data.frame(target=DDD.stat$target,
                                    contrast=DDD.stat$contrast,
                                    x=DDD.stat$log2FC,
                                    y=-log10(DDD.stat$adj.pval))
            data2plot$significance <- "Not significant"
            data2plot$significance[DDD.stat$adj.pval< pval_cut & 
                                    abs(DDD.stat$log2FC)>=l2fc_cut] <- "Significant"
            q <- plotVolcano(data2plot = data2plot,xlab = "log2FC of genes",ylab="-log10(FDR)",
                            title = title.idx[i],
                            col0 = col0,col1 = col1,size = size,top.n = top.n)
        }
        
        if(i=="DAS genes"){
            if(DAS_pval_method=="F-test")
            DDD.stat <- trans_3D_stat$DAS.F.stat else DDD.stat <- trans_3D_stat$DAS.simes.stat
            data2plot <- data.frame(target=DDD.stat$target,
                                    contrast=DDD.stat$contrast,
                                    x=DDD.stat$maxdeltaPS,
                                    y=-log10(DDD.stat$adj.pval))
            data2plot$significance <- "Not significant"
            data2plot$significance[DDD.stat$adj.pval< pval_cut & 
                                    abs(DDD.stat$maxdeltaPS)>=deltaPS_cut] <- "Significant"
            q <- plotVolcano(data2plot = data2plot,
                            xlab = "MaxdeltaPS of transcripts in each gene",ylab="-log10(FDR)",
                            title = title.idx[i],col0 = col0,col1 = col1,size = size,
                            top.n = top.n)
        }
        
        if(i=="DE transcripts"){
            DDD.stat <- trans_3D_stat$DE.stat
            data2plot <- data.frame(target=DDD.stat$target,
                                    contrast=DDD.stat$contrast,
                                    x=DDD.stat$log2FC,
                                    y=-log10(DDD.stat$adj.pval))
            data2plot$significance <- "Not significant"
            data2plot$significance[DDD.stat$adj.pval< pval_cut & 
                                    abs(DDD.stat$log2FC)>=l2fc_cut] <- "Significant"
            q <- plotVolcano(data2plot = data2plot,xlab = "log2FC of transcripts",
                            ylab="-log10(FDR)",title = title.idx[i],
                            col0 = col0,col1 = col1,size = size,top.n = top.n)
        }
        
        if(i=="DTU transcripts"){
            DDD.stat <- trans_3D_stat$DTU.stat 
            data2plot <- data.frame(target=DDD.stat$target,
                                    contrast=DDD.stat$contrast,
                                    x=DDD.stat$deltaPS,
                                    y=-log10(DDD.stat$adj.pval))
            data2plot$significance <- "Not significant"
            data2plot$significance[DDD.stat$adj.pval< pval_cut & 
                                    abs(DDD.stat$deltaPS)>=deltaPS_cut] <- "Significant"
            q <- plotVolcano(data2plot = data2plot,
                            xlab = "deltaPS of transcripts",ylab="-log10(FDR)",
                            title = title.idx[i],
                            col0 = col0,col1 = col1,size = size,top.n = top.n)
        }
        q
        })
        names(g) <- idx

        ######################################################################
        ##----->> save plot
        lapply(names(g),function(i){
        message(i)
        png(paste0(figure.folder,"/",i," volcano plot.png"),
            width = 10,height = 6,units = "in",
            res = 150)
        print(g[[i]])
        dev.off()
        
        pdf(paste0(figure.folder,"/",i," volcano plot.pdf"),
            width = 10,height = 6)
        print(g[[i]])
        dev.off()
        })

        ################################################################################
        ##----->> DE vs DAS genes
        DE.genes <- unique(DE_genes$target)
        DAS.genes <- unique(DAS_genes$target)
        genes.flow.chart <- function(){
        plotFlowChart(expressed =target_high$genes_high,
                        x = DE.genes,
                        y = DAS.genes,
                        type = "genes",
                        pval.cutoff = pval_cut,lfc.cutoff = l2fc_cut,
                        deltaPS.cutoff = deltaPS_cut)
        }
        genes.flow.chart()


        png(filename = paste0(figure.folder,"/Union set DE genes vs DAS genes.png"),
            width = 22/2.54,height = 13/2.54,units = "in",res = 300)
        genes.flow.chart()
        dev.off()

        pdf(file = paste0(figure.folder,"/Union set DE genes vs DAS genes.pdf"),
            width = 22/2.54,height = 13/2.54)
        genes.flow.chart()
        dev.off()

        ################################################################################
        ##----->> DE vs DTU transcripts
        DE.trans<- unique(DE_trans$target)
        DTU.trans <- unique(DTU_trans$target)

        trans.flow.chart <- function(){
        plotFlowChart(expressed = target_high$trans_high, 
                        x = DE.trans, 
                        y = DTU.trans, 
                        type = "transcripts", 
                        pval.cutoff = pval_cut,
                        lfc.cutoff = l2fc_cut,
                        deltaPS.cutoff = deltaPS_cut)
        }

        trans.flow.chart()

        png(filename = paste0(figure.folder,"/Union set DE transcripts vs DTU transcripts.png"),
            width = 22/2.54,height = 13/2.54,units = "in",res = 300)
        trans.flow.chart()
        dev.off()

        pdf(file = paste0(figure.folder,"/Union set DE transcripts vs DTU transcripts.pdf"),
            width = 22/2.54,height = 13/2.54)
        trans.flow.chart()
        dev.off()


        contrast.idx <- contrast[1]
        ################################################################################
        ##----->> DE vs DAS genes
        x <- unlist(DEvsDAS_results[DEvsDAS_results$Contrast==contrast.idx,-1])
        if(length(x)==0){
        message("No DE and/or DAS genes")
        } else {
        names(x) <- c("DE","DE&DAS","DAS")
        g <- plotEulerDiagram(x = x,fill = gg.color.hue(2))
        g
        grid.arrange(g,top=textGrob("DE vs DAS genes", gp=gpar(cex=1.2)))
        }

        ################################################################################
        ##----->> DE vs DTU transcripts
        x <- unlist(DEvsDTU_results[DEvsDTU_results$Contrast==contrast.idx,-1])
        if(length(x)==0){
        message("No DE and/or DTU transcripts")
        } else {
        names(x) <- c("DE","DE&DTU","DTU")
        g <- plotEulerDiagram(x = x,fill = gg.color.hue(2))
        g
        grid.arrange(g,top=textGrob("DE vs DTU transcripts", gp=gpar(cex=1.2)))
        }

        show("==========> Step 5 Make plot")

        ################################################################################
        ##----->> DE genes
        targets <- unique(DE_genes$target)
        data2heatmap <- txi_genes$abundance[targets,]
        column_title <- paste0(length(targets)," DE genes")
        data2plot <- rowmean(x = t(data2heatmap),
                            group = metatable$label,
                            reorder = F)
        data2plot <- t(scale(data2plot))
        hc.dist <- dist(data2plot,method = dist_method)
        hc <- fastcluster::hclust(hc.dist,method = cluster_method)
        clusters <- cutree(hc, k = cluster_number)
        clusters <- reorderClusters(clusters = clusters,dat = data2plot)

        ### save the target list in each cluster to result folder
        x <- split(names(clusters),clusters)
        x <- lapply(names(x),function(i){
        data.frame(Clusters=i,Targets=x[[i]])
        })
        x <- do.call(rbind,x)
        colnames(x) <- c("Clusters","Targets")

        g <- Heatmap(as.matrix(data2plot), name = "Z-scores", 
                    cluster_rows = TRUE,
                    clustering_method_rows=cluster_method,
                    row_dend_reorder = T,
                    show_row_names = FALSE, 
                    show_column_names = ifelse(ncol(data2plot)>10,F,T),
                    cluster_columns = FALSE,
                    split=clusters,
                    column_title= column_title)

        draw(g,column_title="Conditions",column_title_side = "bottom")

        ### save to figure
        png(paste0(figure.folder,"/Heatmap DE genes.png"),
            width = pmax(10,1*length(unique(metatable$label)))/2.54,height = 20/2.54,
            units = "in",res = 300)
        draw(g,column_title="Conditions",column_title_side = "bottom")
        dev.off()
        pdf(paste0(figure.folder,"/Heatmap DE genes.pdf"),
            width = pmax(10,1*length(unique(metatable$label)))/2.54,height = 20/2.54)
        draw(g,column_title="Conditions",column_title_side = "bottom")
        dev.off()


        ################################################################################
        ##----->> DAS genes
        targets <- unique(DAS_genes$target)
        data2heatmap <- txi_genes$abundance[targets,]
        column_title <- paste0(length(targets)," DAS genes")
        data2plot <- rowmean(x = t(data2heatmap),group = metatable$label,reorder = F)
        data2plot <- t(scale(data2plot))
        hc.dist <- dist(data2plot,method = dist_method)
        hc <- fastcluster::hclust(hc.dist,method = cluster_method)
        clusters <- cutree(hc, k = cluster_number)
        clusters <- reorderClusters(clusters = clusters,dat = data2plot)


        ### save the target list in each cluster to result folder
        x <- split(names(clusters),clusters)
        x <- lapply(names(x),function(i){
        data.frame(Clusters=i,Targets=x[[i]])
        })
        x <- do.call(rbind,x)
        colnames(x) <- c("Clusters","Targets")
        write.csv(x,file=paste0(result.folder,"/Target in each cluster heatmap ", column_title,".csv"),
                row.names = F)
        ###############################
        g <- Heatmap(as.matrix(data2plot), name = "Z-scores", 
                    cluster_rows = TRUE,
                    clustering_method_rows=cluster_method,
                    row_dend_reorder = T,
                    show_row_names = FALSE, 
                    show_column_names = ifelse(ncol(data2plot)>10,F,T),
                    cluster_columns = FALSE,
                    split=clusters,
                    column_title= column_title)

        draw(g,column_title="Conditions",column_title_side = "bottom")

        ### save to figure
        png(paste0(figure.folder,"/Heatmap DAS genes.png"),
            width = pmax(10,1*length(unique(metatable$label)))/2.54,height = 20/2.54,units = "in",res = 300)
        draw(g,column_title="Conditions",column_title_side = "bottom")
        dev.off()
        pdf(paste0(figure.folder,"/Heatmap DAS genes.pdf"),
            width = pmax(10,1*length(unique(metatable$label)))/2.54,height = 20/2.54)
        draw(g,column_title="Conditions",column_title_side = "bottom")
        dev.off()


        show("==========> Step 6 HEATMAP    OK")

        params_list <- list()
        params_list$condition_n = length(unique((metatable_new$label)))
        params_list$brep_n = length(unique(metatable[,brep_col]))
        #params_list$srep_n = length(unique(metatable[,srep_col]))
        params_list$samples_n = nrow(metatable_new)
        params_list$has_srep = has_srep
        params_list$quant_method = quant_method
        params_list$tximport_method = tximport_method
        params_list$cpm_cut = cpm_cut
        params_list$cpm_samples_n = cpm_samples_n
        params_list$norm_method = norm_method
        params_list$has_batcheffect = has_batcheffect
        params_list$RUVseq_method = RUVseq_method
        params_list$contrast = contrast
        params_list$DE_pipeline = DE_pipeline
        params_list$pval_adj_method = pval_adj_method
        params_list$pval_cut = pval_cut
        params_list$l2fc_cut = l2fc_cut
        params_list$deltaPS_cut = deltaPS_cut
        params_list$DAS_pval_method = DAS_pval_method

        ##heatmap
        params_list$dist_method <- dist_method
        params_list$cluster_method <- cluster_method
        params_list$cluster_number <- cluster_number



        DDD.data$conditions <- metatable$label
        DDD.data$params_list <- params_list
        save(DDD.data,file=paste0(data.folder,"/DDD.data.RData"))

        show(" ... SALVANDO RESULTADOS ... ")


        ####save results 
        idx <- c("DE_genes","DAS_genes","DE_trans","DTU_trans","samples","contrast",
                "DDD_numbers","DEvsDAS_results","DEvsDTU_results","RNAseq_info")
        idx.names <-gsub("_"," ",idx)
        idx.names <- gsub("trans","transcripts",idx.names)
        idx.names[1:4] <- paste0("Significant ",idx.names[1:4]," list and statistics")

        idx <- c(idx,"scores","scores_filtered")
        idx.names <- c(idx.names,"Raw isoform switch scores",
                    "Significant isoform switch scores")
        for(i in seq_along(idx)){
        if(is.null(DDD.data[[idx[i]]]))
            next
        write.csv(x = DDD.data[[idx[i]]],file = paste0(DDD.data$result.folder,"/",idx.names[i],".csv"),row.names = F)
        }
        ### save transcript-gene mapping
        write.csv(x = DDD.data$mapping,
                file = paste0(DDD.data$result.folder,"/Transcript and gene mapping.csv"),
                row.names = F,na = "")

        ### save 3d list
        ##save all gene/transcript statistics
        write.csv(x = DDD.data$genes_3D_stat$DE.stat,
                file = paste0(DDD.data$result.folder,"/DE gene testing statistics.csv"),
                row.names = F,na = "")

        write.csv(x = DDD.data$trans_3D_stat$DE.stat,
                file = paste0(DDD.data$result.folder,
                                "/DE transcripts testing statistics.csv"),
                row.names = F,na = "")

        if(DDD.data$params_list$DAS_pval_method=="F-test"){
        write.csv(x = DDD.data$trans_3D_stat$DAS.F.stat,
                    file = paste0(DDD.data$result.folder,
                                "/DAS genes testing statistics.csv"),
                    row.names = F,na = "")
        }
        if(DDD.data$params_list$DAS_pval_method=="Simes"){
        write.csv(x = DDD.data$trans_3D_stat$DAS.simes.stat,
                    file = paste0(DDD.data$result.folder,
                                "/DAS genes testing statistics.csv"),
                    row.names = F,na = "")
        }
        write.csv(x = DDD.data$trans_3D_stat$DTU.stat,
                file = paste0(DDD.data$result.folder,
                                "/DTU transcripts testing statistics.csv"),
                row.names = F,na = "")
        show("TERMINADO COM SUCESSO !!!") ') $CTRL $CASE $TMP_DIR/to3d $TMP_DIR/qnt 1>$LOG_DIR/_6.2.1_3DRNAseq.log.txt 2>$LOG_DIR/_6.2.1_3DRNAseq.err.txt

    [ -f $TMP_DIR/to3d/result/Sign*DAS*ene*is*atistics.csv ] && HAS_3D_AS=1 &&
        echo "$(date +%d/%m\ %H:%M) analise 3DRnaSEQ $(cut -d, -f1 $TMP_DIR/to3d/result/Sign*DAS*ene*is*atistics.csv | tail -n+2 | uniq | grep -c .) SIGNIFICATIVO genes" >>$RESUMO
    [ ! -f $TMP_DIR/to3d/result/Sign*DAS*ene*is*atistics.csv ] &&
        echo "$(date +%d/%m\ %H:%M) analise 3DRnaSEQ falhou" >>$RESUMO

    [ $HAS_3D_AS ] && tail -n+2 $TMP_DIR/to3d/result/Sign*DAS*ene*is*atistics.csv | cut -d, -f1 | tr -d \" | sort -u >$TMP_DIR/to3d/3drnaseq_as_genes.txt
    log 6 2 2 "persistindo resultados do 3drnaseq"
    echo "$(date +%d/%m\ %H:%M) terminou analise 3DRnaSEQ" >>$RESUMO
    cd $TMP_DIR && zip -r $OUT_DIR/to3d.zip to3d 1>$LOG_DIR/_6.2.2_3drnaseq_zip.log.txt 2>$LOG_DIR/_6.2.2_3drnaseq_zip.err.txt
}

gerar_bed_cobertura() {
    echo "$(date +%d/%m\ %H:%M) iniciando geracao de BEDs" >>$RESUMO
    cd $TMP_DIR
    ## gerar bed dos AS genes
    p=1
    rm -f cov_all.bed && mkdir $LOG_DIR/cov
    for SAMPLE in $(cut -d, -f2 to3d/exper*.csv | tail -n+2); do
        if [ -f $TMP_DIR/sample_$SAMPLE/$SAMPLE.sorted.bam ]; then
            log 6 3 $p "Gerando BED dos genes para $SAMPLE"
            rm -f cov.bed
            [ -f $OUT_DIR/cov_$SAMPLE.bed ] || (for GENE in $(cat $TMP_DIR/all_as_genes.txt); do
                bamCoverage -b $TMP_DIR/sample_$SAMPLE/$SAMPLE.sorted.bam -o tmp.bed --outFileFormat bedgraph --binSize 3 -p 2 -r $GENE \
                    1>$LOG_DIR/cov/_6.3.$p\_cov.$SAMPLE.$GENE.log.txt 2>$LOG_DIR/cov/_6.3.$p\_cov.$SAMPLE.$GENE.err.txt &&
                    cat tmp.bed | sed s/^/$SAMPLE,/ | tr -s [:blank:] , >>cov.bed && rm tmp.bed
                ((p = p + 1))
            done && mv cov.bed $OUT_DIR/cov_$SAMPLE.bed)
        fi
        cat $OUT_DIR/cov_$SAMPLE.bed >>$TMP_DIR/geneapp/cov_all.bed
    done
    echo "$(date +%d/%m\ %H:%M) terminou geracao de BEDs" >>$RESUMO
}

anotar_api() {

    local LOCAL=$1
    local Q=$2
    local TSV=$3
    local TTG=$4
    local PTNAS=$5
    local THREAD=$6
    local k=1
    log 6 4 0 "abrindo thread $THREAD para anotar $TTG / 10 ptnas"
    sleep $THREAD
    while read l; do
        ID=$(echo $l | cut -d, -f1)
        SEQ=$(echo $l | cut -d, -f2 | tr -cd '[:alpha:]')
        if [ ! -f $LOCAL/$ID.tsv ]; then
            JOB=$(curl -sSX POST --header 'Content-Type: application/x-www-form-urlencoded' --header 'Accept: text/plain' -d "email=$EMAIL&$Q&title=$ID&sequence=$SEQ" $API/run)
            ## log 6 4 $k "[$(ls -1 $LOCAL | grep -c .) de $(( $TTG / 10 ))] $k rodando $ID pelo job $JOB ..."
            sleep 30s
            for i in $(seq $TIMEOUT); do
                if grep FINISHED <(curl -sSX GET --header 'Accept: text/plain' "$API/status/$JOB") >/dev/null; then
                    curl -sSX GET --header 'Accept: text/tab-separated-values' "$API/result/$JOB/tsv" >$LOCAL/$ID.tsv
                    cat $LOCAL/$ID.tsv | sed "s/^/$ID,/" >>$TSV
                    log 6 4 $k "[$(ls -1 $LOCAL | grep -c .) de $(( $TTG / 10 )) : $(($(ls -1 $LOCAL | grep -c .) * 100 / $TTG))%]  anotacao de $ID obtida pelo job $JOB ok"
                    break
                else
                    sleep 30s
                fi
            done
            if [ ! -f $LOCAL/$ID.tsv ]; then
                log 6 4 $k "[$(ls -1 $LOCAL | grep -c .) de $TTG]  anotacao de $ID NAO obtida pelo job $JOB !!!!" "WARN"
            fi
        else
            cat $LOCAL/$ID.tsv | sed "s/^/$ID,/" >>$TSV
            log 6 4 $k "[$(ls -1 $LOCAL | grep -c .) de $TTG : $(($(ls -1 $LOCAL | grep -c .) * 100 / $TTG))%] $k -> $ID restaurado de $LOCAL/$ID.tsv"
        fi
        ((k = k + 1))
    done <$PTNAS
    log 6 4 0 "[$(ls -1 $LOCAL | grep -c .) de $TTG : $(($(ls -1 $LOCAL | grep -c .) * 100 / $TTG))%] finalizado a thread $THREAD"
}

anotar() {
    cd $TMP_DIR
    ## anotar as ptna

    local LOCAL=$OUT_DIR/anotacao
    local PTNAS=$TMP_DIR/ptnas.inline
    local TSV=$TMP_DIR/geneapp/anotacao.tsv
    local Q='goterms=true&pathways=true&appl=PfamA'
    echo "$(date +%d/%m\ %H:%M) iniciando anotacao" >>$RESUMO

    log 6 4 0 "extrair ptnas das cds"

    if [ $GEN_NCBI_TABLE ]; then
        cat <(echo "gene,mrna,cds,protein") \
            <(paste -d, \
                <(grep \> $TMP_DIR/cds.fa | sed 's/.*\[locus_tag=//' | cut -d] -f1) \
                <(grep \> $TMP_DIR/cds.fa | cut -d\| -f2 | sed 's/.*/\?/') \
                <(grep \> $TMP_DIR/cds.fa | cut -c2- | cut -d\  -f1) \
                <(grep \> $TMP_DIR/cds.fa | sed 's/.*\[protein_id=//' | cut -d] -f1)) \
            >$TMP_DIR/gene2mrna2cds2ptn.csv
    else
        cp $GENE2PTNA $TMP_DIR/gene2mrna2cds2ptn.csv
    fi

    python3 <(printf "
        from Bio import SeqIO
        from Bio.SeqRecord import SeqRecord
        import os
        table = [l.strip().split(',') for l in open('$TMP_DIR/gene2mrna2cds2ptn.csv').readlines()[1:]]
        gene2iso = [l.strip().split(',') for l in open('$TMP_DIR/to3d/transcript_gene_mapping.csv').readlines()[1:] if len(l)>3]
        iso2gene = dict(gene2iso)
        as_genes = set([l.strip() for l in open('$TMP_DIR/all_as_genes.txt').readlines() if len(l)>1])
        as_iso = [x for x in gene2iso if x[1] in as_genes]
        genes_as_iso = set([x[1] for x in as_iso])

        print('GENES SEM CDS: ', ', '.join([x for x in as_genes if not x in genes_as_iso]))

        cds = SeqIO.to_dict(SeqIO.parse('cds.fa', 'fasta'))
        isos = [x[0] for x in as_iso]
        isos_seq = [v for k, v in cds.items() if k in isos]
        print('ISO SEM SEQ: ', ', '.join([x.id for x in isos_seq if not x.id in isos]))

        ta_cds = isos_seq[0].id in [x[1] for x in table]
        tdic = {(x[1] if ta_cds else x[2]): x[3] for x in table}

        SeqIO.write([SeqRecord(c.seq.translate(), tdic[c.id], description=f'gene={iso2gene[c.id]}') for c in isos_seq], '$TMP_DIR/ptnas.faa', 'fasta')
        open('$PTNAS', 'w').writelines([f'{x.id},{str(x.seq)}{os.linesep}' for x in SeqIO.parse('$TMP_DIR/ptnas.faa', 'fasta')])
    " | cut -c9-) 1>$LOG_DIR/_6.4.1_ext_ptnas.log.txt 2>$LOG_DIR/_6.4.1_ext_ptnas.err.txt

    [ ! -d $LOCAL ] && mkdir $LOCAL
    rm -f $TSV
    local TT=$(grep -c , $PTNAS)

    if (($(grep -c , $PTNAS) > 10)); then
        anotar_api $LOCAL $Q $TSV $TT <(cat $PTNAS | paste - - - - - - - - - - | cut -f1 | grep ,) 1 &
        anotar_api $LOCAL $Q $TSV $TT <(cat $PTNAS | paste - - - - - - - - - - | cut -f2 | grep ,) 2 &
        anotar_api $LOCAL $Q $TSV $TT <(cat $PTNAS | paste - - - - - - - - - - | cut -f3 | grep ,) 3 &
        anotar_api $LOCAL $Q $TSV $TT <(cat $PTNAS | paste - - - - - - - - - - | cut -f4 | grep ,) 4 &
        anotar_api $LOCAL $Q $TSV $TT <(cat $PTNAS | paste - - - - - - - - - - | cut -f5 | grep ,) 5 &

        anotar_api $LOCAL $Q $TSV $TT <(cat $PTNAS | paste - - - - - - - - - - | cut -f6 | grep ,) 6 &
        anotar_api $LOCAL $Q $TSV $TT <(cat $PTNAS | paste - - - - - - - - - - | cut -f7 | grep ,) 7 &
        anotar_api $LOCAL $Q $TSV $TT <(cat $PTNAS | paste - - - - - - - - - - | cut -f8 | grep ,) 8 &
        anotar_api $LOCAL $Q $TSV $TT <(cat $PTNAS | paste - - - - - - - - - - | cut -f9 | grep ,) 9 &
        anotar_api $LOCAL $Q $TSV $TT <(cat $PTNAS | paste - - - - - - - - - - | cut -f10 | grep ,) 0 &
        wait
    else
        anotar_api $LOCAL $Q $TSV $TT $PTNAS 1
    fi

    echo "$(date +%d/%m\ %H:%M) terminou anotacao" >>$RESUMO
}

analisar() {

    cd $TMP_DIR && rodar_rmats && rodar_3drnaseq

    cat $TMP_DIR/to3d/3drnaseq_as_genes.txt $TMP_DIR/rmats_out/rmats_as_genes.txt | sort -u >$TMP_DIR/all_as_genes.txt
    log 6 3 0 "Compilar resultados para $(grep -c . $TMP_DIR/all_as_genes.txt) AS genes encontrados"
    AMBOS=$(join $TMP_DIR/to3d/3drnaseq_as_genes.txt $TMP_DIR/rmats_out/rmats_as_genes.txt | grep -c .)
    SO_RMATS=$(join -v2 $TMP_DIR/to3d/3drnaseq_as_genes.txt $TMP_DIR/rmats_out/rmats_as_genes.txt | grep -c .)
    SO_3D=$(join -v1 $TMP_DIR/to3d/3drnaseq_as_genes.txt $TMP_DIR/rmats_out/rmats_as_genes.txt | grep -c .)
    echo "$(date +%d/%m\ %H:%M) Total : $(grep -c . $TMP_DIR/all_as_genes.txt) AS genes encontrados | so rMATS $SO_RMATS | so 3DRNASEQ $SO_3D | ambos $AMBOS |" >>$RESUMO
    join -t, -2 2 $TMP_DIR/all_as_genes.txt <(tail -n+2 $TMP_DIR/to3d/transcript_gene_mapping.csv | sort -t, -k2) >$TMP_DIR/all_as_isoforms.txt
    rm -rf $TMP_DIR/geneapp && mkdir -p $TMP_DIR/geneapp && cd $TMP_DIR/geneapp
    cp $TMP_DIR/all_as_genes.txt $TMP_DIR/to3d/3drnaseq_as_genes.txt $TMP_DIR/rmats_out/rmats_as_genes.txt $TMP_DIR/all_as_isoforms.txt $TMP_DIR/geneapp

    gerar_bed_cobertura &
    anotar &
    wait

}

finalizar() {

    log 7 1 1 "finalizando"
    cd $TMP_DIR
    echo "$(date +%D.%H:%M:%S) finalizando." >>$RESUMO

    log 7 2 1 "executando o multiqc ..."
    multiqc sample_*/qc_* 1>$LOG_DIR/_7.2.1.multiqc.log.txt 2>$LOG_DIR/_7.2.1.multiqc.err.txt
    mkdir multqc_out && mv multiqc_*.html multqc_out

    log 7 3 1 "Gerar output para GeneAPP"
    rm -rf geneapp_data && mkdir geneapp_data

    python3 <(printf "
        gff = [l.strip().split(chr(9)) for l in open('gene.gff').readlines() if l.count(chr(9)) == 8]
        all_as_genes = set([l.strip() for l in open('all_as_genes.txt').readlines() if len(l) > 1])
        genes = [[[y for y in x[-1].split(';') if y.startswith('ID=')][0][3:], x] for x in gff if x[2] == 'gene']
        gfilt = [g for i, g in genes if i in all_as_genes]
        gfilt = [g for i, g in genes if i.replace('gene-', '') in all_as_genes] if len(gfilt) < 1 else gfilt
        print(f'genes encontrados no gff: {len(gfilt)} de {len(all_as_genes)}')
        gfilt = [[l[0], int(l[3]), int(l[4])] for l in gfilt]
        gff_p = [[l[0], int(l[3]), int(l[4]), l] for l in gff]
        gff_d = [g for a, b, c, g in gff_p if 'region' == g[2] or 
                any([a == x and b >= y and c <= z for x, y, z in gfilt])]
        print(f'gff ficou reduzido em {len(gff_d)*100//len(gff)}%% => {len(gff_d)} de {len(gff)}')
        open('geneapp_data/gene.gff.min', 'w').writelines([chr(9).join(x)+chr(10) for x in gff_d])
        print('salvo em geneapp_data/gene.gff.min') 
        " | cut -c9-) \
        1>$LOG_DIR/_7.3.1_gerar_GFFMIN.log.txt 2>$LOG_DIR/_7.3.1_gerarGFFMIN.err.txt

    cp \
        geneapp/anotacao.tsv geneapp/cov_all.bed \
        rmats_out/*.MATS.JCEC.txt rmats_out/sign_ev* \
        to3d/transcript_gene_ma* to3d/experimental_design.csv \
        to3d/result/Sig*gene*.csv \
        to3d/result/TPM*.csv \
        multiqc_data/multiqc_general_stats.txt \
        $TMP_DIR/gene2mrna2cds2ptn.csv $TMP_DIR/all_as_isoforms.txt \
        $RESUMO geneapp_data

    cd geneapp_data && for f in *MATS* sign_events_* multiqc*; do mv $f $f.csv; done && cd ..

    cat \
        <(echo 'part=1') \
        <(cd geneapp_data/ && wc -l * | sed 's/^/lines=/') \
        <(cd rmats_out/ && for f in *.bams; do cat $f <(echo {$f}); done | sed 's/^/map=/') \
        <(head -20 gene.gff | grep '#' | sed 's/^/gff=/') \
        <(echo 'part=2') \
        <(cd geneapp_data/ && for file in *; do echo $file=$(echo $file | tr -cd [:alnum:]); done) \
        <(echo 'part=3') \
        <(cd geneapp_data/ && for file in *; do sed "s/^/$(echo $file | tr -cd [:alnum:])=/" "$file"; done) \
        <(echo 'part=4') \
        <(cd geneapp_data/ && grep -m1 . *.csv) \
        >to_app.txt

    python3 <(printf "
        lines = [l for l in open('to_app.txt').readlines()]
        ck = len(lines)//10
        p1, p2, p3 = lines[:ck], lines[ck:-ck], lines[-ck:]
        parts = [p1] + [p2[x::8] for x in range(8)] + [p3]
        [open(f'parte{i}_{len(parts[i])}.geneapp', 'w').writelines(parts[i]) for i in range(10)] " | cut -c9-) \
        1>$LOG_DIR/_7.3.2_gerarPARTS.log.txt 2>$LOG_DIR/_7.3.2_gerarPARTS.err.txt

    zip -r $OUT_DIR/import_geneapp.zip parte*.geneapp \
        1>$LOG_DIR/_7.3.2_gerar.log.txt 2>$LOG_DIR/_7.3.2_gerar.err.txt
    echo "$(date +%D.%H:%M:%S) impport geneapp data salvo em $OUT_DIR/import_geneapp.zip" >>$RESUMO

    log 7 4 1 "compactando resultados"
    zip -r $OUT_DIR/results.zip out_* multqc_out logs geneapp \
        1>$LOG_DIR/_7.4.1.zip.log.txt 2>$LOG_DIR/_7.4.1.zip.err.txt
    echo "$(date +%D.%H:%M:%S) resultados salvo em $OUT_DIR/results.zip" >>$RESUMO

    [ $KEEP_TMP ] || (log 7 5 1 "removendo pasta temporaria $TMP_DIR" && rm -rf $TMP_DIR)
    cd $INI_DIR
}

main() {
    log 0 0 0 "V. $VERSAO ~ $(echo $@)"
    if preparar_ambiente $4 && obter_dados $1 $2 $3; then
        export RECURS_LIM=""
        if processar_sequencias $5 && indexar_sequencias && quantificar_amostras $@ && analisar $@ && finalizar; then
            echo "$(date +%D.%H:%M:%S) terminado." >>$RESUMO
        else
            echo "$(date +%D.%H:%M:%S) houve um erro." >>$RESUMO
        fi
        log 99 99 99 "terminou para $OUT_DIR de $INI_DIR"
    else
        log 0 0 1 "sem dados para quantificar" "WARN"
    fi
}

N_ARGS=$#
if [ $N_ARGS -lt 5 ]; then
    echo "Usage: bash as_data_gen.sh http://...genoma.gz http://...gtf.gz http://...cds.gz dir_temp/ RUN,SAMPLE,FACTOR ... ... RUNn,SAMPLEn,FACTORn"
    echo "Exmaple:"
    echo "bash as_data_gen.sh \\"
    echo "   'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/001/735/GCF_000001735.4_TAIR10.1/GCF_000001735.4_TAIR10.1_genomic.fna.gz' \\"
    echo "   'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/001/735/GCF_000001735.4_TAIR10.1/GCF_000001735.4_TAIR10.1_genomic.gtf.gz' \\"
    echo "   'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/001/735/GCF_000001735.4_TAIR10.1/GCF_000001735.4_TAIR10.1_cds_from_genomic.fna.gz' \\"
    echo "   out_dir \\"
    echo "   SRA_ARG1='--minReadLen' SRA_ARG2='150' SRA_ARG3='-X' SRA_ARG4='999999' \\"
    echo "   SRR21411875,CR1,WILD SRR21411876,CR2,WILD SRR21411877,CR3,WILD \\"
    echo "   SRR21411881,MT1,MUTANT SRR21411882,MT2,MUTANT SRR21411883,MT3,MUTANT \\"
    echo "   RMATS_ARG1='--readLength' RMATS_ARG2='150' KEEP_TMP GEN_NCBI_TABLE"
    exit 1
fi

main $@

## limitatacoes da analise de AS com high throughput short reads
## 1) a amostra pode nao conter o AS
##    exemplo se a mostra de 4Gbp com 1M reads contem 2 AS do gene g
##            uma amostra de 2Gbp tem 50% de probabilidade de ter os 2 AS
##    nesse sentido maior Gbp define a melhor
## 2) mesmo se grande a amostra pode nao conter o AS:
##        se nao captura-lo
##        se o evento nao ocorrer na condicao analisada
##        se nao tiver anotado e nao analisado AS "de novo" (rMATS)
## 3) ao comparar CTRL/CASE amostras com DAS, CTRL pode ter canonico+AS e CASE nenhum
## 4) genes paralogos no genoma podem dificultar encontrar qual locus do gene de AS

## rMATS
## https://rnaseq-mats.sourceforge.net/
## https://github.com/Xinglab/rmats-turbo/blob/v4.1.2/README.md

## MASER
## https://bioconductor.org/packages/release/bioc/html/maser.html
## https://raw.githubusercontent.com/mcfonseca-lab/docker/master/rmats/run_maser.R

## https://github.com/wyguo/ThreeDRNAseq/blob/master/vignettes/user_manuals/3D_RNA-seq_App_manual.md
## https://github.com/wyguo/ThreeDRNAseq/blob/master/vignettes/user_manuals/3D_RNA-seq_command_line_user_manual.md
## https://3drnaseq.hutton.ac.uk/app_direct/3DRNAseq/
