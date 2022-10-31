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
</script>
  
<template>

  <div class="py-4">
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
          <span class=" font-extrabold">O </span>processamento alternativo do RNA mensageiro transcrito do gene nuclear,
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
          <li><span class="font-medium">Genoma:</span> <span class="font-mono">teste de fonte</span></li>
          <li><span class="font-medium">Anotacao:</span> <span class="font-mono">teste de fonte</span></li>
          <li><span class="font-medium">Transcritos:</span> <span class="font-mono">teste de fonte</span></li>
          <li><span class="font-medium">Amostra:</span> <span class="font-mono">teste de fonte</span></li>
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
          de qualidade, mapeamento e anotacao sao onerosas podendo levar dias para executar, nesse exemplo custam XXhrs.
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
          Ao descompactar o arquivo results.zip o ususario tera acesso a pasta <span class="font-mono">geneapp</span>
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
        <ButtonLink :href="'https://1drv.ms/u/s!AjOYiVKI0SsQtIkmHdZdB_CPX3coIA?e=nGgsiz'" :icon="false">
          <FolderDownloadIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Download data Sample
        </ButtonLink>
      </div>
    </Titulo>
    <div class="mx-auto max-w-screen-xl sm:px-6 lg:px-8 text-justify  lg:flex lg:items-center lg:justify-between ">
      <div>
        <p class="indent-3">
          <span class=" font-extrabold">O </span>processament
        </p>
        <p class="indent-3">
          <span class=" font-extrabold">T</span>endo em vista que as a
        </p>
        <ul class="mt-2">
          <li><span class="font-medium">Genoma:</span> <span class="font-mono">teste de fonte</span></li>
          <li><span class="font-medium">Anotacao:</span> <span class="font-mono">teste de fonte</span></li>
          <li><span class="font-medium">Transcritos:</span> <span class="font-mono">teste de fonte</span></li>
          <li><span class="font-medium">Amostra:</span> <span class="font-mono">teste de fonte</span></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="bg-gray-50 py-4">
    <Titulo>
      <template #titulo>4. Export and Share your results</template>
      <template #subtitulo>Quais os proximos passos?</template>
      <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <ButtonLink :href="'https://www.ncbi.nlm.nih.gov/'" :icon="false">
          <FolderDownloadIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Download Results
        </ButtonLink>
      </div>
    </Titulo>
    <div class="mx-auto max-w-screen-xl sm:px-6 lg:px-8 text-justify  lg:flex lg:items-center lg:justify-between ">
      <div>
        <p class="indent-3">
          <span class=" font-extrabold">O </span>processament esse app foi desenv para encondtrar alvos apra validacao
        </p>
        <p class="indent-3">
          <span class=" font-extrabold">T</span>validacao experimental, minha tese
        </p>
      </div>
    </div>
  </div>

  <div class="bg-gray-100 py-4">
    <Titulo>
      <template #titulo>4. Export and Share your results</template>
      <template #subtitulo>Quais os proximos passos?</template>
      <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <ButtonLink :href="'https://www.ncbi.nlm.nih.gov/'" :icon="false">
          <FolderDownloadIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Download Results
        </ButtonLink>
      </div>
    </Titulo>
    <div class="mx-auto max-w-screen-xl sm:px-6 lg:px-8 text-justify  lg:flex lg:items-center lg:justify-between ">
      <div>
        <p class="indent-3">
          <span class=" font-extrabold">O </span>processament esse app foi desenv para encondtrar alvos apra validacao
        </p>
        <p class="indent-3">
          <span class=" font-extrabold">T</span>validacao experimental, minha tese
        </p>
      </div>
    </div>
  </div>

</template>
  
