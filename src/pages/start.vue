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
      <template #titulo><Texto>1. Experimental design</Texto></template>
      <template #subtitulo><Texto>Como fazer analise de DAS?</Texto></template>
      <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <ButtonLink :href="'https://www.ncbi.nlm.nih.gov/'"><Texto>Conhecer o NCBI</Texto></ButtonLink>
      </div>
    </Titulo>
    <div class="mx-auto max-w-screen-xl sm:px-6 lg:px-8 text-justify  lg:flex lg:items-center lg:justify-between ">
      <div>
        <p class="indent-3">
          <Texto>O processamento alternativo do RNA mensageiro transcrito do gene nuclear, denominado alternative splicing (AS), é a transformação do transcrito primário em diferentes isoformas pelo spliceossomo ao alternar sítios do pre-mRNA entre essas isoformas.</Texto>
          <Texto>Esse mecanismo habilita os eucariotos, em seus genes multi-exons, estender a diversidade de seu transcriptoma e proteoma por meio de diferentes isoformas mesmo com um número limitado de genes.</Texto>
          <Texto>O splicing alternativo diferencial (DAS) é obtido pelacomparacao do AS de 2 condicoes.</Texto>
          <Texto>Para encontrar DAS, em primeiro momento sao obtidas replicatas biologicas do transcriptoma que sao sequenciadas e i) mapeadas ao genoma (mapeamento) ou ii) alinhadas ao transcriptoma para quantificar as isoformas.</Texto>
          <Texto>Essa analise exige bioinformatica especialmente na etapas finais finais de geracao de dados e exploracao dos resultados.</Texto>
          <Texto>Limitatacoes da analise de AS com high throughput short reads 1) a amostra pode nao conter o AS exemplo se a mostra de 4Gbp com 1M reads contem 2 AS do gene g uma amostra de 2Gbp tem 50% de probabilidade de ter os 2 AS nesse sentido maior Gbp define a melhor 2) mesmo se grande a amostra pode nao conter o AS: se nao captura-lo se o evento nao ocorrer na condicao analisada se nao tiver anotado e nao analisado AS "de novo" (rMATS) 3) ao comparar CTRL/CASE amostras com DAS, CTRL pode ter canonico+AS e CASE nenhum 4) genes paralogos no genoma podem dificultar encontrar qual locus do gene de AS.</Texto>
          
        </p>
        <p class="indent-3">
          <Texto>Tendo em vista que as analises de DAS exigem alta profundidade de sequenciamento e considerando que decadas atras o custo para gerar esse volume de dados com tecnologias de highthrougthput era alto as analises de DAS nao eram tao comumns quando comparada as de expresssao diferencial (DE).</Texto>
          <Texto>Assim é possivel encontrar dados onde so foram analisados DE que podemos usar para tentar descobrir DAS extendendo as analised de DE.</Texto>
          <Texto>Nesse exemplo vamos utilizar parte dos dados brutos de um experimento publicado no NCBI de uma analise em Arabidosis thaliana. voce pode encontrar dados de plantas em bancos de dados publicos como ncbi, phytozome, ensemble e outros organism-spefice como solnetwork, guavadb ...</Texto>
          <Texto>Selecione os dados que voce vai precisar para sua analise de splicing alternativo diferencial (DAS), a partir do NCBI ou de uma pasta local.</Texto>
        </p>

        <ul class="mt-2">
          <li>
            <span class="font-bold"><Texto>Genoma:</Texto></span>
            <span class="font-mono">GCF_000001735.4_TAIR10.1_genomic.fna.gz</span>
          </li>
          <li><span class="font-bold"><Texto>Anotacao:</Texto></span> <span
              class="font-mono">GCF_000001735.4_TAIR10.1_genomic.gtf.gz</span></li>
          <li><span class="font-bold"><Texto>Transcritos:</Texto></span> <span
              class="font-mono">GCF_000001735.4_TAIR10.1_cds_from_genomic.fna.gz</span></li>
          <li><span class="font-bold"><Texto>Amostras:</Texto></span> <span class="font-mono">
              SRR21411875 SRR21411876 SRR21411877 SRR21411881 SRR21411882 SRR21411883
            </span></li>
        </ul>
      </div>
      <img src="/img/asexp.png" width="400" class="mx-3 mt-3" />
    </div>
  </div>

  <div class="bg-gray-50 py-4">
    <Titulo>
      <template #titulo><Texto>2. Gene APP Data Generation</Texto></template>
      <template #subtitulo><Texto>Como gerar dados para o GeneAPP?</Texto></template>
      <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <ButtonLink :href="'https://github.com/MiqueiasFernandes/GeneAPP/blob/main/public/data/Generate_AS_data.ipynb'"
          :icon="false">
          <ClipboardListIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          <Texto>Clonar Notebook no Colab </Texto>
        </ButtonLink>
        <ButtonLink :href="'/data/as_data_gen.sh.zip'" :icon="false" :acent="false" class="mx-2">
          <DownloadIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          <Texto>Baixar Script</Texto>
        </ButtonLink>
      </div>
    </Titulo>
    <div class="mx-auto max-w-screen-xl sm:px-6 lg:px-8 text-justify  lg:flex lg:items-center lg:justify-between ">
      <div>
        <p class="indent-3">
          <Texto>Com os dados definidos sera necerraio rodar softesres para descobrir o DAS e gerar consolidar os resultados para importar no GeneAPP.</Texto>
          <Texto>O GeneAPP pode explorar resultados de software de abordagem event=based (como rMTAS) e isoform-based (como 3DRNASeq). Para auxiliar na execucao dessas analises que exeige muitas linhas de comando para configuracao do ambiente e execucao dos programas, desenvolvi o pipeline as_data_gen.sh em bash script.</Texto>
          <Texto>Esse script pode ser obtido e executado em uma maquina local com s.o. LINUX, na nuvem, em cluster ou como nesse exemplo no Colab.</Texto>
          <Texto>Para executar esse script o usuario deve passar os argumentos epxlicados a seguir.</Texto>
          <Texto>A proxima imagem e um print do codigo que deve ser digitado no Colab, para testar, pode-se clonar esse notebook pelo botao ao lado.</Texto>
          <Texto>Importante observar que o script foi desenvolvido apenas para auxiliar o usuario, sendo necessario altrea-lo de acordo com as necessidades de cada experimento.</Texto>
          <Texto>Os softesres executados pelos scirpt possuem sua propria licenca, o usuario deve observar cada uma sob sua responsabilidade.</Texto>
        </p>
        <img src="/img/datagen.png" width="800" class="my-4" />
        <ol class="list-none">
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">1</span> 
            <Texto>Nesta linha o script é obtido diretamente do repositorio para rodar.</Texto>
          </li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">2</span> 
            <Texto>o primeiro arqumento é a localizacao do genoma, pode passar a URL para que ele seja baixado ou o caminho do arquivo fasta que contem as sequencias de nucleotideos do genoma no computafdor onde o script sera executado.</Texto>
          </li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">3</span> 
            <Texto>agora eh o caminho do aruqivo da anotacao GTF, se houver no mesmo local um aqrquivo GFF ele sera baixado tambem, seus nomes precisam ser identicos variando apenas a extensao (.gtf / .gff)</Texto>
          </li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">4</span> 
            <Texto>por ultimo dados do organismo precisa passar as sequencias dos transcritos, recomendo usar as sequencias da CDS</Texto>
          </li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">5</span> 
            <Texto>informar o caminho do diretorio para persistir os resultados, no COlab pode-se conectar ao G. Drive e informar aqui o cominho dentro dele, sera explicado melhor a seguir</Texto>
          </li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">6</span> 
            <Texto>informar argumentos para o sra-tools, aqui, por exemplo estou limitando as reads ate o spot 999,999 nao e necessario baixar o arquivo FASTQ completo para essa analise de teste</Texto>
          </li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">7</span> 
            <Texto>informar cada uma das amostras pelo padrao RUN,NOME,FATOR com espaco</Texto>
          </li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">8</span> 
            <Texto>informar parametros para passar ao programas rMATS, nesse exemplo estou informando o parametro obrigatorio --read-length com o valor 150. Informar outros parametros opcionais no script, o argumento KEEP_TEMP indica para nao apagar a pasta demporaria.</Texto>
          </li>
          <li><span class=" font-bold bg-sky-500 rounded-full text-white px-2 py-1">9</span> 
            <Texto>esses dois ultimos argumentos sao opcionais</Texto>
          </li>
        </ol>
        <p class="indent-3 mt-3">
          <Texto>As etapas de preparacao do ambiente, download dos daods brutos, controle de qualidade, mapeamento e anotacao sao onerosas podendo levar dias para executar, nesse exemplo custam ~5hrs.</Texto>
          <Texto>TEndo em visata isso, e que euando o Colab reclica o ambiente por falta de interacao ele apaga todos os dados, o script foi projetado para retornar onde parou em cada etapa/amostra os dados processaos pelo que persiste no diretorio de saida.</Texto>
          <Texto>Assim caso o ususario queira reproduzir esse caso de uso recomendo que conecte o notebook ao G Drive e aponte a pasta de saida para uma pasta dentro do G Drive. Caso contrario sera necessario acompanhar o andamento da execucao do script.</Texto>
          <Texto>Caso o usario tente reproduzir em localhost deve observar o limite de RAM, DISCO e as configuracoes no sistema que o scriot tenta realizar em modo administrador, oque faz necessario executar em maquina virtual ou subsistema para nao afetar as configuracoes atuais e permiitr acesso de superususario sudo.</Texto>
        </p>
        <p class="indent-3 mt-3">
          <Texto>Serao gerados varios outputs de programas, log de cada execucao e os dados para ser importados no GeneAPP.</Texto>
          <Texto>entre os arquivos salvos na pasta de output o to3d.zip, rmats_out.zip e results.zip sao os mais importantes.</Texto>
          <Texto>consulte o arquivo com controle de qualidade de cada amostra em unico arquivo gerado pelo multiqc na pasta results.</Texto>
          <Texto>a taxa de mapeamento no genoma pode ser encontrada pelo arquivo summary.txt salvo na pasta de output tambem.</Texto>
          <Texto>no arquiv compatado rmats_out.zip estao todo outupt do rMATS e do MASER, contendo alguns graficos.</Texto>
          <Texto>no arquivo compatado to3d.zip sao guardados todos arquivos necessarios para executar as analises no servidor web do 3DRNaseq.</Texto>
          <Texto>COmo o script executa o 3DRNASeq tambem nesse arquivo estao os resultados de uma analise padrao no 3DRNASeq, reitero que os parametros do programa devem ser customizados para cada analsie.</Texto>
          <Texto>nesse caso de uso foram utilizados muitos parametro default para os programas.</Texto>
          <Texto>Ao descompactar o arquivo import_geneapp.zip o ususario tera acesso a pasta geneapp que contem os arquivos necessarios para analise nesse aplicativo GeneAPP.</Texto>
        </p>
      </div>
    </div>
  </div>

  <div class="bg-gray-100 py-4">
    <Titulo>
      <template #titulo><Texto>3. Screening dados de AS por diferentes abordagens</Texto></template>
      <template #subtitulo><Texto>Como usar o GeneAPP?</Texto></template>
      <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <ButtonLink :href="'https://1drv.ms/u/s!AjOYiVKI0SsQtIsS1hL_4SB-T4dLjQ?e=30FWnv'" :icon="false">
          <FolderDownloadIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          <Texto>Baixar dados de amostra</Texto>
        </ButtonLink>
      </div>
    </Titulo>
    <div class="mx-auto max-w-screen-xl sm:px-6 lg:px-8 text-justify  lg:flex lg:items-center lg:justify-between ">
      <div>
        <p class="indent-3">
          <Texto>Apos a analise do pipeline as_data_gen.sh ter sido executado com sucesso o usuario tera acesso ao arquivo import_geneapp.zip que precisa ser descompactado antes de ser carregado pela página NOVO para explorar no GeneAPP.</Texto>
          <Texto>Um exemplo desse arquivo compactado gerado pelos dados de amostra no Colab pode ser obtido pelo botao "Download data sample" acima.</Texto>
        </p>
        <p class="indent-3">
          <Texto>Ao importar os dados com sucesso no GeneAPP, se todos dados foram processados o usuario terá acesso aos seguintes recursos:</Texto>
        </p>
        <ul class="mt-2">
          <li><span class="font-bold"><Texto>Overview:</Texto></span> 
            <Texto>pagina com dados da execucao das analises de AS</Texto>
          </li>
          <li><span class="font-bold"><Texto>Experimental design:</Texto></span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">1</button> 
              <Texto>Tabela com a lista de amostras processadas, metricas de controle de qualidade e mapemaneto.</Texto></li>
          <li><span class="font-bold"><Texto>Resultados do Pipeline:</Texto></span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">2</button> 
              <Texto>Tabela com metadados de arquivos usados nas analises e principais numeros de resultados das analises</Texto></li>
          <li><span class="font-bold"><Texto>Repertorio de genes:</Texto></span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">3</button> 
              <Texto>Tabela similar a um GFF para acesso rapido a informacoes estruturais dos genes e mRNAS</Texto>
            </li>
          <li><span class="font-bold"><Texto>Graphicos:</Texto></span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">4</button> 
              <Texto>graficos da visao geral de quantitativos da analise e da estrutura de genes</Texto>
           </li>
          <li><span class="font-bold"><Texto>Evevntos:</Texto></span> 
            <Texto>pagina contendo informacoes sobre os eventos de AS identificados nas analises</Texto>
          </li>
          <li><span class="font-bold"><Texto>Detalhes de AS:</Texto></span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">5</button> 
              <Texto>tabela contendo varias informacoes para evento de AS identificado</Texto>
           </li>
          <li><span class="font-bold"><Texto>Tabela de anotacao:</Texto></span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">6</button> 
              <Texto>tabela da anotaçao dos genes contendo ontologia, descricao do InterPro e Pathways identificadas</Texto>
           </li>
          <li><span class="font-bold"><Texto>Graphicos:</Texto></span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">7</button> 
              <texto>graficos dos eventos de AS, da anotacao e de expressao diferencial</texto>
           </li>
          <li><span class="font-bold"><Texto>Genes:</Texto></span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">8</button>
              <Texto>pagina que exibe gene a gene sua estrutura e anotaçao funcional</Texto> 
           </li>
          <li><span class="font-bold"><Texto>Genomico:</Texto></span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">9</button> 
              <Texto>sequencia de nucleotideos do gene que pode ser colorida pelos exons e CDS</Texto>
           </li>
          <li><span class="font-bold"><Texto>Proteina:</Texto></span> <button
              class="rounded-full bg-sky-600 text-white h-8 w-8">0</button> 
              <Texto>sequencia de aminoacidos que pode ser anotada pelo Uniprot para explorar por preinas similar mapeada</Texto>
           </li>
        </ul>
      </div>
    </div>
    <div class="w-full flex justify-center">
          <img src="/img/results.png" width="800" class="my-4" />
    </div>
  
  </div>

  <div class="bg-gray-50 py-4">
    <Titulo>
      <template #titulo><Texto>4. Export and Share your results</Texto></template>
      <template #subtitulo><Texto>Como extrair as informacoes?</Texto></template>
      <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <ButtonLink :href="'https://1drv.ms/u/s!AjOYiVKI0SsQtIsTZGA7ESo-ckdlbA?e=NQWniJ'" :icon="false">
          <FolderDownloadIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          <Texto>Baixar resultados</Texto>
        </ButtonLink>
      </div>
    </Titulo>
    <div class="mx-auto max-w-screen-xl sm:px-6 lg:px-8 text-justify  lg:flex lg:items-center lg:justify-between ">
      <div>
        <p class="indent-3">
          <Texto>O usuario pode baixar os resultados ou compartilhar o gene com as anotaçoes de eventos de AS identificados.</Texto>
          <Texto> No botao acima esta disponibilizado os arquivos que podem ser obtidos ao explorar a analise de teste do GeneAPP.</Texto>
          <Texto>As figuras sao geradas no formato vetorial que permite rasterizar em qualidade de impressao.</Texto>
          <Texto>As tabelas sao exportadas no formato TSV.</Texto>
        </p>
        <p class="indent-3">
          <Texto>O principal proposito do GeneAPP é axuxiliar o usuario na escolha de alvos para realizar a validacao experimental, uma vez que muitos genes sao identificados com AS pelas diferentes abordagens.</Texto>
          <Texto>O usuario pode utilizar uma documentacao mais elaborada no trabalho: (DOI publicacao geneapp).</Texto>
        </p>
      </div>
    </div>
  </div>

  <div class="bg-gray-100 py-4">
    <Titulo>
      <template #titulo><Texto>5. Explore others features</Texto></template>
      <template #subtitulo><Texto>Quais os proximos passos?</Texto></template>
    </Titulo>
    <div class="mx-auto max-w-screen-xl sm:px-6 lg:px-8 text-justify  lg:flex lg:items-center lg:justify-between ">
      <div>
        <p class="indent-3">
          <Texto>Experimente visualizar um gene do NCBI pelo seu GID, plotar uma arvore filogenetica ou uma rede de anotaçao por um projeto customizado.</Texto>
          <br/>
          <Texto>Exemplo de gene:</Texto> <a class="text-sky-500" :href="host">{{host}}</a>
        </p>
        <p class="indent-3">
          <Texto>Tambem é possivel usar o docker pelo comando</Texto> <b class="font-mono">docker pull mikeiasfernandes93/geneapp </b> <Texto>exemplo de comando:</Texto>
          <br>
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
           <br/>
           <Texto>Não é recomendado a execuçao em localhost pela demanda de recursos. (>8GB ram/>10GB disco).</Texto>
        </p>
      </div>
    </div>
  </div>

</template>
  
