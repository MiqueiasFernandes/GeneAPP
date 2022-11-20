# Install the base requirements for the app.
# SRA FASTQ DUMP precisa do `--platform=linux/amd64` ... qemu-x86_64: Could not open '/lib64/ld-linux-x86-64.so.2
FROM --platform=linux/amd64 debian:sid AS base
WORKDIR /geneapp
RUN apt update -y && apt upgrade -y
RUN apt install -y curl wget sra-toolkit trimmomatic python3-pip r-base salmon samtools bamtools hisat2 fastqc
RUN curl "http://ftp.ebi.ac.uk/pub/software/unix/iprscan/5/5.59-91.0/interproscan-5.59-91.0-64-bit.tar.gz" > /tmp/interproscan.tar.gz
RUN wget https://raw.githubusercontent.com/MiqueiasFernandes/GeneAPP/main/public/data/as_data_gen.sh && \
    bash as_data_gen.sh x x x x x && cd /geneapp && echo INSTALL OK

# docker run -v `pwd`:/data -w /data geneapp bash /geneapp/as_data_gen.sh \
#      'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/001/735/GCF_000001735.4_TAIR10.1/GCF_000001735.4_TAIR10.1_genomic.fna.gz' \
#      'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/001/735/GCF_000001735.4_TAIR10.1/GCF_000001735.4_TAIR10.1_genomic.gtf.gz' \
#      'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/001/735/GCF_000001735.4_TAIR10.1/GCF_000001735.4_TAIR10.1_cds_from_genomic.fna.gz' \
#      /data/results                                                                \
#      SRA_ARG1='--minReadLen' SRA_ARG2='150' SRA_ARG3='-X' SRA_ARG4='999999'       \
#      SRR21411875,CR1,WILD SRR21411876,CR2,WILD SRR21411877,CR3,WILD               \
#      SRR21411881,MT1,MUTANT SRR21411882,MT2,MUTANT SRR21411883,MT3,MUTANT         \
#      RMATS_ARG1='--readLength' RMATS_ARG2='150' KEEP_TMP GEN_NCBI_TABLE          
