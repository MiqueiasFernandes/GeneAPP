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
  import { ClipboardListIcon } from '@heroicons/vue/solid'
</script>
  
<template>

  <div class="bg-gray-50 py-4">
    <Titulo>
      <template #titulo>1. Experimental design</template>
      <template #subtitulo>Como fazer analise de DAS?</template>
      <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <ButtonLink :href="'https://www.ncbi.nlm.nih.gov/'">Go To NCBI</ButtonLink>
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
          O splicing alternativo diferencial (DAS) é obtido pelacomparacao do AS de 2 condicoes.
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
          quando comparada as de expresssao diferencial (DE). Assim é possivel encontrar dados onde so foram analisados
          DE que podemos usar
          para tentar descobrir DAS extendendo as analised de DE.
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
      <img src="img/asexp.png" width="400" class="mx-3 mt-3" />
    </div>
  </div>

  <div class="bg-gray-100 py-4">
    <Titulo>
      <template #titulo> 2. Gene APP Data Generation</template>
      <template #subtitulo>Como gerar dados para o GeneAPP?</template>
      <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <ButtonLink :href="'https://www.ncbi.nlm.nih.gov/'" :icon="false">
          <ClipboardListIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Clone Colab Notebook</ButtonLink>
      </div>
    </Titulo>
    <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
      Com os dados definidos
      Serao gerados varios outputs de programas, explicar os outputs do , tempo, rodar em localhost, memoria
      <img src="/img/datagen.png" width="600" />
    </div>
  </div>

  <div class="bg-gray-50 py-4">
    <Titulo>
      <template #titulo>3. Screening AS Data from multiple approach</template>
      <template #subtitulo>Como usar o GeneAPP?</template>
      <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <ButtonLink :href="'https://www.ncbi.nlm.nih.gov/'">Download data Sample</ButtonLink>
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
      <img src="img/asexp.png" width="400" class="mx-3 mt-3" />
    </div>
  </div>

  <div class="bg-gray-100 py-4">
    <Titulo>
      <template #titulo>4. Export and Share your results</template>
      <template #subtitulo>Quais os proximos passos?</template>
      <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
        <ButtonLink :href="'https://www.ncbi.nlm.nih.gov/'">Download Results</ButtonLink>
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
        <ul class="mt-2">
          <li><span class="font-medium">Genoma:</span> <span class="font-mono">teste de fonte</span></li>
          <li><span class="font-medium">Anotacao:</span> <span class="font-mono">teste de fonte</span></li>
          <li><span class="font-medium">Transcritos:</span> <span class="font-mono">teste de fonte</span></li>
          <li><span class="font-medium">Amostra:</span> <span class="font-mono">teste de fonte</span></li>
        </ul>
      </div>
      <img src="img/asexp.png" width="400" class="mx-3 mt-3" />
    </div>
  </div>

</template>
  
