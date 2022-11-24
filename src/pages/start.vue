<route lang="json">
{
  "meta": {
    "title": "Start",
    "description": "Get started on GeneAPP",
    "ordem": 1
  }
}
</route>

<script setup>
import { ClipboardListIcon, FolderDownloadIcon } from '@heroicons/vue/solid'
import { DownloadIcon } from '@heroicons/vue/outline'
useHead({ title: 'Get started on GeneAPP' })

const host =window.location.href.replace('/start', '/gene?id=836163')

</script>
  
<template>

  <div class="py-4 text-slate-800">
    <Titulo>
      <template #titulo>1. Experimental design</template>
      <template #subtitulo>Como fazer analise de DAS?</template>
      <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <ButtonLink :href="'https://www.ncbi.nlm.nih.gov/'">Go to NCBI</ButtonLink>
      </div>
    </Titulo>
    <div class="mx-auto max-w-screen-xl sm:px-6 lg:px-8 text-justify  lg:flex lg:items-center lg:justify-between ">
      <div>
        <p class="indent-3">
          <span class=" font-extrabold">
            O </span>processamento alternativo do RNA mensageiro transcrito do gene nuclear,
          denominado <i>alternative splicing (</i>AS),
          é a transformação do transcrito primário em diferentes isoformas pelo spliceossomo ao alternar sítios do
          pre-mRNA entre essas isoformas.
          Esse mecanismo habilita os eucariotos, em seus genes multi-exons, estender a diversidade
          de seu transcriptoma e proteoma por meio de diferentes isoformas
          mesmo com um número limitado de genes.
          O <span class="font-semibold">splicing alternativo diferencial (DAS)</span> é obtido pelacomparacao do AS de 2
          condicoes.
          Para encontrar DAS, em primeiro momento sao obtidas replicatas biologicas do transcriptoma que sao
          sequenciadas
          e i) mapeadas ao genoma (mapeamento) ou ii) alinhadas ao transcriptoma para quantificar as isoformas.
          Essa analise exige bioinformatica especialmente na etapas finais finais de geracao de dados e exploracao dos
          resultados.
          limitatacoes da analise de AS com high throughput short reads 1) a amostra pode nao conter o AS
          exemplo se a mostra de 4Gbp com 1M reads contem 2 AS do gene g uma amostra de 2Gbp tem 50% de probabilidade de
          ter
          os 2 AS
          nesse sentido maior Gbp define a melhor 2) mesmo se grande a amostra pode nao conter o AS:
          se nao captura-lo se o evento nao ocorrer na condicao analisada se nao tiver anotado e nao analisado AS "de
          novo"
          (rMATS)
          3) ao comparar CTRL/CASE amostras com DAS, CTRL pode ter canonico+AS e CASE nenhum
          4) genes paralogos no genoma podem dificultar encontrar qual locus do gene de AS.
        </p>
        <p class="indent-3">
          <span class=" font-extrabold">T</span>endo em vista que as analises de DAS exigem alta profundidade de
          sequenciamento e considerando que decadas
          atras
          o custo para gerar esse volume de dados com tecnologias de highthrougthput era alto as analises de DAS nao
          eram tao comumns
          quando comparada as de <span class="font-semibold">expresssao diferencial (DE)</span>. Assim é possivel
          encontrar dados onde so foram
          analisados DE que podemos usar para tentar descobrir DAS extendendo as analised de DE.
          Nesse exemplo vamos utilizar parte dos dados brutos de um experimento publicado no NCBI
          de uma analise em Arabidosis thaliana. voce pode encontrar dados de plantas em bancos de
          dados publicos como ncbi, phytozome, ensemble e outros organism-spefice como solnetwork, guavadb ...
          Selecione os dados que voce vai precisar para sua analise de splicing alternativo diferencial (DAS), a partir
          do
          NCBI ou de uma pasta local.
        </p>

        <ul class="mt-2">
          <li><span class="font-bold">Genoma:</span> <span
              class="font-mono">GCF_000001735.4_TAIR10.1_genomic.fna.gz</span></li>
          <li><span class="font-bold">Anotacao:</span> <span
              class="font-mono">GCF_000001735.4_TAIR10.1_genomic.gtf.gz</span></li>
          <li><span class="font-bold">Transcritos:</span> <span
              class="font-mono">GCF_000001735.4_TAIR10.1_cds_from_genomic.fna.gz</span></li>
          <li><span class="font-bold">Amostra:</span> <span class="font-mono">
              SRR21411875 SRR21411876 SRR21411877 SRR21411881 SRR21411882 SRR21411883
            </span></li>
        </ul>
      </div>
      <img src="/img/asexp.png" width="400" class="mx-3 mt-3" />
    </div>
  </div>

  <div class="bg-gray-50 py-4">
    <Titulo>
      <template #titulo> 2. Gene APP Data Generation</template>
      <template #subtitulo>Como gerar dados para o GeneAPP?</template>
      <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <ButtonLink :href="'https://github.com/MiqueiasFernandes/GeneAPP/blob/main/public/data/Generate_AS_data.ipynb'"
          :icon="false">
          <ClipboardListIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Clone Colab Notebook
        </ButtonLink>
        <ButtonLink :href="'/data/as_data_gen.sh.zip'" :icon="false" :acent="false" class="mx-2">
          <DownloadIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Download Script
        </ButtonLink>
      </div>
    </Titulo>
    <div class="mx-auto max-w-screen-xl sm:px-6 lg:px-8 text-justify  lg:flex lg:items-center lg:justify-between ">
      <div>
        <p class="indent-3">
          <span class=" font-extrabold">C</span>om os dados definidos sera necerraio rodar softesres para descobrir o
          DAS e gerar consolidar os resultados
          para importar no GeneAPP. O GeneAPP pode explorar resultados de software de abordagem event=based (como rMTAS)
          e isoform-based (como 3DRNASeq). Para auxiliar na execucao dessas analises que exeige muitas linhas de comando
          para
          configuracao do ambiente e execucao dos programas, desenvolvi o pipeline as_data_gen.sh em bash script. esse
          script
          pode ser obtido e executado em uma maquina local com s.o. LINUX, na nuvem, em cluster ou como nesse exemplo no
          Colab.
          Para executar esse script o usuario deve passar os argumentos epxlicados a seguir. A proxima imagem e um print
          do codigo
          que deve ser digitado no Colab, para testar, pode-se clonar esse notebook pelo botao ao lado. importante
          observar que o script
          foi desenvolvido apenas para auxiliar o usuario, sendo necessario altrea-lo de acordo com as necessidades de
          cada experimento.
          Os softesres executados pelos scirpt possuem sua propria licenca, o usuario deve observar cada uma sob sua
          responsabilidade.
        </p>
        <img src="/img/datagen.png" width="800" class="my-4" />
        <ol class="list-none">
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">1</span> nesta linha o script é
            obtido diretamente do repositorio para rodar.</li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">2</span> o primeiro arqumento é a
            localizacao do genoma, pode passar a URL para que ele seja baixado ou o caminho do arquivo fasta que contem
            as sequencias de nucleotideos do genoma no computafdor onde o script sera executado.</li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">3</span> agora eh o caminho do
            aruqivo da anotacao GTF, se houver no mesmo local um aqrquivo GFF ele sera baixado tambem, seus nomes
            precisam ser identicos variando apenas a extensao (.gtf / .gff)</li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">4</span> por ultimo dados do
            organismo precisa passar as sequencias dos transcritos, recomendo usar as sequencias da CDS</li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">5</span> informar o caminho do
            diretorio para persistir os resultados, no COlab pode-se conectar ao G. Drive e informar aqui o cominho
            dentro dele, sera explicado melhor a seguir</li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">6</span> informar argumentos para o
            sra-tools, aqui, por exemplo estou limitando as reads ate o spot 999,999 nao e necessario baixar o arquivo
            FASTQ completo para essa analise de teste</li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">7</span> informar cada uma das
            amostras pelo padrao <span class="font-mono">RUN,NOME,FATOR</span> com espaco</li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">8</span> informar parametros para
            passar ao programas rMATS, nesse exemplo estou informando o parametro obrigatorio <span
              class="font-mono">--read-length</span> com o valor 150. Informar outros parametros opcionais no script, o
            argumento <span class="font-mono">KEEP_TEMP</span> indica para nao apagar a pasta demporaria,</li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">9</span> esses dois ultimos
            argumentos sao opcionais</li>
        </ol>
        <p class="indent-3 mt-3">
          <span class=" font-extrabold">A</span>s etapas de preparacao do ambiente, download dos daods brutos, controle
          de qualidade, mapeamento e anotacao sao onerosas podendo levar dias para executar, nesse exemplo custam ~5hrs.
          TEndo em visata isso, e que euando o Colab reclica o ambiente por falta de interacao ele apaga todos os dados,
          o script foi projetado para retornar onde parou em cada etapa/amostra os dados processaos pelo que persiste no
          diretorio de saida.
          Assim caso o ususario queira reproduzir esse caso de uso recomendo que conecte o notebook ao G Drive e aponte
          a pasta de saida para uma pasta dentro do G Drive. Caso contrario sera necessario acompanhar o andamento da
          execucao do script.
          Caso o usario tente reproduzir em localhost deve observar o limite de RAM, DISCO e as configuracoes no sistema
          que o scriot tenta realizar em modo administrador, oque faz necessario executar em maquina virtual ou
          subsistema para nao afetar as configuracoes atuais e permiitr acesso de superususario sudo.
        </p>
        <p class="indent-3 mt-3"><span class=" font-extrabold">S</span>erao gerados varios outputs de programas,
          log de cada execucao e os dados para ser importados no GeneAPP. entre os arquivos salvos na pasta de output o
          to3d.zip, rmats_out.zip e results.zip sao os mais importantes.
          consulte o arquivo com controle de qualidade de cada amostra em unico arquivo gerado pelo multiqc na pasta
          results.
          a taxa de mapeamento no genoma pode ser encontrada pelo arquivo summary.txt salvo na pasta de output tambem.
          no arquiv compatado rmats_out.zip estao todo outupt do rMATS e do MASER, contendo alguns graficos.
          no arquivo compatado to3d.zip sao guardados todos arquivos necessarios para executar as analises no servidor
          web do 3DRNaseq.
          COmo o script executa o 3DRNASeq tambem nesse arquivo estao os resultados de uma analise padrao no 3DRNASeq,
          reitero que os parametros do programa devem ser customizados para cada analsie.
          nesse caso de uso foram utilizados muitos parametro default para os programas.
          Ao descompactar o arquivo <b class="font-mono">import_geneapp.zip</b> o ususario tera acesso a pasta <span
            class="font-mono">geneapp</span>
          que contem os arquivos necessarios para analise nesse aplicativo GeneAPP.
        </p>
      </div>
    </div>
  </div>

  <div class="bg-gray-100 py-4">
    <Titulo>
      <template #titulo>3. Screening AS Data from multiple approach</template>
      <template #subtitulo>Como usar o GeneAPP?</template>
      <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <ButtonLink :href="'https://1drv.ms/u/s!AjOYiVKI0SsQtIsS1hL_4SB-T4dLjQ?e=30FWnv'" :icon="false">
          <FolderDownloadIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Download data Sample
        </ButtonLink>
      </div>
    </Titulo>
    <div class="mx-auto max-w-screen-xl sm:px-6 lg:px-8 text-justify  lg:flex lg:items-center lg:justify-between ">
      <div>
        <p class="indent-3">
          <span class=" font-extrabold">A</span>pos a analise do pipeline as_data_gen.sh ter sido executado com sucesso
          o usuario tera acesso ao arquivo <b class="font-mono">import_geneapp.zip</b> que precisa ser descompactado
          antes
          de ser carregado pela página <a class="p-1 bg-indigo-500 rounded text-white shadow" href="/new">New</a> para
          explorar no GeneAPP.
          Um exemplo desse arquivo compactado gerado pelos dados de amostra no Colab pode ser obtido pelo botao
          "Download data sample" acima.
        </p>
        <p class="indent-3">
          <span class=" font-extrabold">A</span>o importar os dados com sucesso no GeneAPP,
          se todos dados foram processados o usuario terá acesso aos seguintes recursos:
        </p>
        <ul class="mt-2">
          <li><span class="font-bold">Overview:</span> pagina com dados da execucao das analises de AS</li>
          <li><span class="font-bold">Experimental design:</span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">1</button> Tabela com a lista de amostras processadas,
            metricas de controle de qualidade e mapemaneto.</li>
          <li><span class="font-bold">Pipeline results:</span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">2</button> Tabela com metadados de arquivos usados nas
            analises e principais numeros de resultados das analises</li>
          <li><span class="font-bold">Gene repertory:</span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">3</button> Tabela similar a um GFF para acesso rapido a
            informacoes estruturais dos genes e mRNAS</li>
          <li><span class="font-bold">Graphics:</span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">4</button> graficos da visao geral de quantitativos da
            analise e da estrutura de genes</li>
          <li><span class="font-bold">Evevnts:</span> pagina contendo informacoes sobre os eventos de AS identificados
            nas analises</li>
          <li><span class="font-bold">AS Detais:</span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">5</button> tabela contendo varias informacoes para
            evento de AS identificado</li>
          <li><span class="font-bold">Annotation table:</span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">6</button> tabela da anotaçao dos genes contendo
            ontologia, descricao do InterPro e Pathways identificadas</li>
          <li><span class="font-bold">Graphics:</span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">7</button> graficos dos eventos de AS, da anotacao e de
            expressao diferencial</li>
          <li><span class="font-bold">Genes:</span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">8</button> pagina que exibe gene a gene sua estrutura e
            anotaçao funcional</li>
          <li><span class="font-bold">Genomic:</span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">9</button> sequencia de nucleotideos do gene que pode
            ser colorida pelos exons e CDS</li>
          <li><span class="font-bold">Protein:</span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">0</button> sequencia de aminoacidos que pode ser
            anotada pelo Uniprot para explorar por preinas similar mapeada</li>
        </ul>
      </div>
    </div>
    <div class="w-full flex justify-center">
          <img src="/img/results.png" width="800" class="my-4" />
    </div>
  
  </div>

  <div class="bg-gray-50 py-4">
    <Titulo>
      <template #titulo>4. Export and Share your results</template>
      <template #subtitulo>Como extrair as informacoes?</template>
      <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <ButtonLink :href="'https://1drv.ms/u/s!AjOYiVKI0SsQtIsTZGA7ESo-ckdlbA?e=NQWniJ'" :icon="false">
          <FolderDownloadIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Download Results
        </ButtonLink>
      </div>
    </Titulo>
    <div class="mx-auto max-w-screen-xl sm:px-6 lg:px-8 text-justify  lg:flex lg:items-center lg:justify-between ">
      <div>
        <p class="indent-3">
          <span class=" font-extrabold">O </span>usuario pode baixar os resultados ou compartilhar o gene com as anotaçoes 
          de eventos de AS identificados. No botao acima esta disponibilizado os arquivos que podem ser obtidos ao explorar 
          a analise de teste do GeneAPP. As figuras sao geradas no formato vetorial que permite rasterizar em qualidade de impressao.
          As tabelas sao exportadas no formato TSV.
        </p>
        <p class="indent-3">
          <span class=" font-extrabold">O</span> principal proposito do GeneAPP é axuxiliar o usuario na escolha de alvos
          para realizar a validacao experimental, uma vez que muitos genes sao identificados com AS pelas diferentes abordagens.
          O usuario pode utilizar uma documentacao mais elaborada no trabalho:.
        </p>
      </div>
    </div>
  </div>

  <div class="bg-gray-100 py-4">
    <Titulo>
      <template #titulo>5. Explore others features</template>
      <template #subtitulo>Quais os proximos passos?</template>
    </Titulo>
    <div class="mx-auto max-w-screen-xl sm:px-6 lg:px-8 text-justify  lg:flex lg:items-center lg:justify-between ">
      <div>
        <p class="indent-3">
          <span class=" font-extrabold">E</span>xperimente visualizar um gene do NCBI pelo seu GID, plotar uma 
          arvore filogenetica ou uma rede de anotaçao
          por um projeto customizado. <br/>Exemplo de gene: <a class="text-sky-500" :href="host">{{host}}</a>
        </p>
        <p class="indent-3">
          <span class=" font-extrabold">T</span>ambem é possivel usar o docker
          pelo comando <b>docker pull mikeiasfernandes93/geneapp</b> exemplo de comando:<br>
          <pre class="font-mono text-xs break-all">
  docker run -v `pwd`:/data -w /data mikeiasfernandes93/geneapp bash /geneapp/as_data_gen.sh \
    ... ... _TAIR10.1_genomic.fna.gz' \
    ... ... _TAIR10.1_genomic.gtf.gz' \
    ... ... _TAIR10.1_cds_from_genomic.fna.gz' \
    /data/results                                                                \
    SRA_ARG1='--minReadLen' SRA_ARG2='150' SRA_ARG3='-X' SRA_ARG4='999999'       \
    SRR21411875,CR1,WILD SRR21411876,CR2,WILD SRR21411877,CR3,WILD               \
    SRR21411881,MT1,MUTANT SRR21411882,MT2,MUTANT SRR21411883,MT3,MUTANT         \
    RMATS_ARG1='--readLength' RMATS_ARG2='150' KEEP_TMP GEN_NCBI_TABLE
          </pre>
           <br/>Não é recomendado a execuçao em localhost pela demanda de recursos. (>8GB ram/>10GB disco)
        </p>
      </div>
    </div>
  </div>

</template>
  
