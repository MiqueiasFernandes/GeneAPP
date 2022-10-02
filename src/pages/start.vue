<route lang="json">
  {
    "meta": {
      "title": "Start",
      "description": "Get started on GeneAPP",
      "ordem": 1
    }
  }
  </route>
  
  <template>
  
  
    <div class="bg-gray-50">
      <div class="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
        
        
        <h2 class="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
          1. Experimental design
          <br />
          <h4><span class="text-indigo-600">Como fazer analise de DAS?</span></h4>
        </h2>
  
  
  
        <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
  
          <ButtonLink :href="'https://www.ncbi.nlm.nih.gov/'">Go To NCBI</ButtonLink>
        </div>
      </div>
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        Selecione os dados que voce vai precisar, a partir do NCBI ou de uma pasta local.
        Nesse exemplo vamos utilizar parte dos dados brutos de um experimento publicado no NCBI
        de uma analise em Arabidosis thaliana.<br /> voce pode encontrsr seus dados em ncbi, phytozome ...
        <ol class="mx-3 px-2" style="border-left: 1px solid lightgray;">
          <li>
            Genoma:
            https://ftp.ncbi ... GCF_000001735.4_TAIR10.1_genomic.fna.gz
          </li>
          <li>
            Anotacao:
          </li>
          <li>
            Transcritos:
          </li>
          <li>
            Amostra:
          </li>
        </ol>
  
      </div>
    </div>
  
  
    <div class="bg-gray-50">
      <div class="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
        <h2 class="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
          2. Gene APP Data Generation
          <br />
          <h4><span class="text-indigo-600">Como gerar dados para o GeneAPP?</span></h4>
        </h2>
        <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div class="inline-flex rounded-md shadow">
            <router-link to="/about"
              class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium leading-6 text-white transition duration-150 ease-in-out hover:bg-indigo-500 focus:outline-none">
              Clone Colab Notebook</router-link>
          </div>
        </div>
      </div>
  
  
      <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
        Serao gerados varios outputs de programas, explicar os outputs do , tempo, rodar em localhost, memoria
        <img src="/img/datagen.png" width="600" />
        <ol>
          <li>
            Genoma:
            https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/001/735/GCF_000001735.4_TAIR10.1/GCF_000001735.4_TAIR10.1_genomic.fna.gz
          </li>
          <li>
            Anotacao:
          </li>
          <li>
            Transcritos:
          </li>
          <li>
            Amostra:
          </li>
        </ol>
  
      </div>
    </div>
  
  
    <div class="bg-gray-50">
      <div class="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
        <h2 class="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
          3. Screening AS Data from multiple approach
          <br />
          <h4><span class="text-indigo-600">Como usar o GeneAPP?</span></h4>
        </h2>
        <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div class="inline-flex rounded-md shadow">
            <router-link to="/about"
              class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium leading-6 text-white transition duration-150 ease-in-out hover:bg-indigo-500 focus:outline-none">
              Download data Sample</router-link>
          </div>
        </div>
      </div>
    </div>
  
    <div class="bg-gray-50 pb-24">
      <div class="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
        <h2 class="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
          4. Export and Share your results
          <br />
          <h4><span class="text-indigo-600">Quais os proximos passos?</span></h4>
        </h2>
        <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div class="inline-flex rounded-md shadow">
            <router-link to="/about"
              class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium leading-6 text-white transition duration-150 ease-in-out hover:bg-indigo-500 focus:outline-none">
              Download Results</router-link>
          </div>
        </div>
      </div>
      <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
        validacao experimental, minha tese
        </div>
    </div>
  
  
  
  </template>
  
