# -*- coding: utf-8 -*-
from flask import Flask, request, abort, send_file
#from flask_cors import CORS
import uuid
import os
import shutil
from datetime import datetime

LOCAL = os.getenv('WRKDIR')
LIMIT = int(os.getenv('SLOTS', '0'))
SERVER = int(os.getenv('SERVER', '0'))
assert LIMIT >0 and SERVER >0

print(f"""
starting GeneAPPServer {datetime.today().strftime('%Y-%m-%d')} ....
      ██████╗ ███████╗███╗   ██╗███████╗ █████╗ ██████╗ ██████╗ 
     ██╔════╝ ██╔════╝████╗  ██║██╔════╝██╔══██╗██╔══██╗██╔══██╗
     ██║  ███╗█████╗  ██╔██╗ ██║█████╗  ███████║██████╔╝██████╔╝
     ██║   ██║██╔══╝  ██║╚██╗██║██╔══╝  ██╔══██║██╔═══╝ ██╔═══╝ 
     ╚██████╔╝███████╗██║ ╚████║███████╗██║  ██║██║     ██║     
      ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝     
                   version 1.0 2022 mikeias.net   
  #{SERVER} on {LOCAL} ( ~ {LIMIT} )

""")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 100000000
# CORS(app)


@app.route("/server")
def server():
    return {"servidor": SERVER, "slots": LIMIT-len(os.listdir(f"{LOCAL}/runs"))}


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
    lns = [l for l in open(
        data + '/experimental_design.csv').readlines() if len(l) > 5]
    #assert len(lns) > 1 and len(lns) < 17
    #assert lns[0] == 'RUN,SAMPLE,FACTOR,FOLDER\n'
    #assert all([max(l) < 1000 and l.count(',') == 3 for l in lns])
    open(f"{LOCAL}/runs/{id}", "w").write(f"{data}\n")
    return {
        "projeto":  id,
        "path":  local,
        "servidor": SERVER
    }

# Carregar arquivos


@app.route("/arquivos", methods=["POST"])
def arquivos():
    projeto = request.form['projeto']
    local = request.form['path']
    path = f"{LOCAL}/data/{local}/{projeto}"
    if not os.path.isdir(path):
        abort(400)
    beds = ['cov_'+x.split(',')[1]+'.bed' for x in open(path +
                                                        '/experimental_design.csv').readlines()][1:]
    valid_files = [

        # rMATS
        "A3SS.MATS.JCEC.txt",
        "A5SS.MATS.JCEC.txt",
        "RI.MATS.JCEC.txt",
        "SE.MATS.JCEC.txt",

        # MASER
        "sign_events_A3SS.tsv",
        "sign_events_A5SS.tsv",
        "sign_events_RI.tsv",
        "sign_events_SE.tsv",

        # 3DRNASeq
        "DAS genes testing statistics.csv",
        "DE gene testing statistics.csv",
        "RNAseq info.csv",
        "Significant DAS genes list and statistics.csv",
        "Significant DE genes list and statistics.csv",
        "TPM_genes.csv",
        "TPM_trans.csv",
        "transcript_gene_mapping.csv",

        # interproscan
        "anotacao.tsv",

        # ete3
        "filogenia.txt",

        # deeptools
        "cov_all.bed",

        # multiqc
        "multiqc_general_stats.txt.csv",

        # as_data_gen.sh
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
            open(f"{path}/cov_all.bed",
                 "a").writelines(open(f"{path}/{v}").readlines()+['\n\n'])
        ok = os.listdir(path)
        falta = [x for x in valid_files if not x in ok]
        return {"ok": ok, "falta":  falta}
    abort(400)


# Informar Status
@app.route("/status/<local>/<projeto>")
def status(local, projeto):
    path = f"{LOCAL}/data/{local}/{projeto}"
    if not os.path.isdir(path):
        abort(400)
    sf = f"{LOCAL}/runs/{projeto}"
    # ver se o arq de log existe pq ta rodando
    if os.path.exists(sf):
        return {"status": [l.strip() for l in open(sf).readlines()]}
    # se nao existe retornar o path de resultados se existe
    sf = f"{path}/{projeto}"
    if os.path.exists(sf):
        return {"status": [l.strip() for l in open(sf).readlines()] + os.listdir(f"{path}/public")}
    # se nao existe retonar erro de falha
    return {"status": ["ERROR"]}

# Processar


@app.route("/process/<local>/<projeto>")
def process(local, projeto):
    path = f"{LOCAL}/data/{local}/{projeto}"
    if not os.path.isdir(path):
        abort(400)
    if len(os.listdir(path)) < 3:
        return {"status": "error few files."}
    if len([f for f in os.listdir(path) if 'checkpoint' in f]) < 1:
        open(path+'/checkpoint1', 'w')
    return {"status": "OK"}

# Fornecer todos dados


@app.route("/result/<local>/<projeto>/<filea>/<fileb>")
def result(local, projeto, filea, fileb):
    # limitar consumo diario de dados
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

# Fornecer zip


@app.route("/zip/<local>/<projeto>")
def zipar(local, projeto):
    # limitar consumo diario de dados
    path = f"{LOCAL}/data/{local}/{projeto}/public/all.tbz2"
    assert os.path.exists(path)
    return send_file(path, as_attachment=True)
