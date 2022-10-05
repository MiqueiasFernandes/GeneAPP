<route lang="json">
{
  "meta": {
    "title": "New",
    "description": "New project",
    "ordem": 2
  }
}
</route>
      
<script setup>
import { ColorSwatchIcon } from '@heroicons/vue/solid'
import { CSV } from "../core/utils/CSV";
import { Projeto } from "../core/model/Projeto";

useHead({ title: 'New Project' });
const proj_name_ref = ref()
const projeto = ref(new Projeto(proj_name_ref));

function setExperimento() {
  CSV.open(dt => {
    dt.get_col("FACTOR").forEach(f => projeto.value.add_fator(f));
  });
}

</script>


<template>
  {{projeto}}
  <div class="w-full px-4 pt-4">
    <div class="mx-auto w-full max-w-xl rounded-2xl bg-white p-2">


      <Sanfona titulo="Configurar o projeto">
        <FormRow grid="6">
          <FormCol span="2">
            <FormInputText label="Nome do projeto" ref="proj_name_ref" content="AS Experiment" />
          </FormCol>
          <FormCol span="2">
            <Button color="acent" @click="setExperimento">Experiment</Button>
          </FormCol>
        </FormRow>



        <FormRow grid="6" v-for="fator in projeto.fatores">
          <FormCol span="2">
            <FormInputText :label="'Label of ' + fator.nome" :content="fator.nome" />
          </FormCol>
          <FormCol span="2">
            <ColorSwatchIcon :style="{ color: fator.cor}" class="w-8 h-8 inline-flex rounded-full cursor-pointer border-4 border-white 
              focus:outline-none focus:shadow-outline" @click="fator.show_cor = !fator.show_cor" />
            <input type="color" v-model="fator.cor" :hidden="!fator.show_cor">
          </FormCol>
        </FormRow>

      </Sanfona>


      <Sanfona titulo="Carregar dados obrigatorios">

      </Sanfona>




      <Sanfona titulo="Carregar dados complementares">
        <div class="antialiased text-gray-900 px-6">
          <div class="max-w-8xl mx-auto py-2 divide-y md:max-w-4xl">
            <div class="max-w-md">



              <FormRow>
                <Button>teste de botao</Button>
                <Button color="acent">teste de botao</Button>
                <Button color="blue">teste de botao</Button>
                <Button color="rose">teste de botao</Button>
              </FormRow>


              <FormRow grid="6">
                <FormCol span="4">
                  <label for="city" class="block text-sm font-medium text-gray-700">col1</label>
                  <FormInputText />
                </FormCol>
                <FormCol span="2" end>
                  <Button :color="'rose'">color do ge</Button>
                </FormCol>
              </FormRow>








              <div>
                <label class="block text-sm font-medium text-gray-700">Photo</label>
                <div class="mt-1 flex items-center">
                  <span class="inline-block h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                    <svg class="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z">
                      </path>
                    </svg>
                  </span>
                  <button type="button"
                    class="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Change
                    to. new photo</button>
                </div>
              </div>

              <div class="grid grid-cols-6 gap-6">



                <div>
                  <label class="block text-sm font-medium text-gray-700">Photo</label>
                  <div class="mt-1 flex items-center">
                    <span class="inline-block h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                      <svg class="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z">
                        </path>
                      </svg>
                    </span>
                    <button type="button"
                      class="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Change
                      to. new photo</button>
                  </div>
                </div>




                <FormInputText class="col-span-6" label="Nome do projeto" placeholder="Awesome" />


                <Button>Teste</Button>


                <div class="col-span-6">
                  <label for="street-address" class="block text-sm font-medium text-gray-700">Street address</label>
                  <input type="text" name="street-address" id="street-address" autocomplete="street-address"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                </div>

                <div class="col-span-6 sm:col-span-6 lg:col-span-2">
                  <label for="city" class="block text-sm font-medium text-gray-700">City</label>
                  <input type="text" name="city" id="city" autocomplete="address-level2"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                </div>

                <div class="col-span-6 sm:col-span-3 lg:col-span-2">
                  <label for="region" class="block text-sm font-medium text-gray-700">State / Province</label>
                  <input type="text" name="region" id="region" autocomplete="address-level1"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                </div>

                <div class="col-span-6 sm:col-span-3 lg:col-span-2">
                  <label for="postal-code" class="block text-sm font-medium text-gray-700">ZIP / Postal code</label>
                  <input type="text" name="postal-code" id="postal-code" autocomplete="postal-code"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                </div>




                <label class="block">
                  <span class="text-gray-700">Full name</span>
                  <input type="text" class="
                    mt-1
                    block
                    w-full
                    rounded-md
                    bg-gray-100
                    border-transparent
                    focus:border-gray-500 focus:bg-white focus:ring-0
                  " placeholder="" />
                </label>
                <label class="block">
                  <span class="text-gray-700">Email address</span>
                  <input type="email" class="
                    mt-1
                    block
                    w-full
                    rounded-md
                    bg-gray-100
                    border-transparent
                    focus:border-gray-500 focus:bg-white focus:ring-0
                  " placeholder="john@example.com" />
                </label>
                <label class="block">
                  <span class="text-gray-700">When is your event?</span>
                  <input type="date" class="
                    mt-1
                    block
                    w-full
                    rounded-md
                    bg-gray-100
                    border-transparent
                    focus:border-gray-500 focus:bg-white focus:ring-0
                  " />
                </label>
                <label class="block">
                  <span class="text-gray-700">What type of event is it?</span>
                  <select class="
                    block
                    w-full
                    mt-1
                    rounded-md
                    bg-gray-100
                    border-transparent
                    focus:border-gray-500 focus:bg-white focus:ring-0
                  ">
                    <option>Corporate event</option>
                    <option>Wedding</option>
                    <option>Birthday</option>
                    <option>Other</option>
                  </select>
                </label>
                <label class="block">
                  <span class="text-gray-700">Additional details</span>
                  <textarea class="
                    mt-1
                    block
                    w-full
                    rounded-md
                    bg-gray-100
                    border-transparent
                    focus:border-gray-500 focus:bg-white focus:ring-0
                  " rows="3"></textarea>
                </label>
                <div class="block">
                  <div class="mt-2">
                    <div>
                      <label class="inline-flex items-center">
                        <input type="checkbox" class="
                          rounded
                          bg-gray-200
                          border-transparent
                          focus:border-transparent focus:bg-gray-200
                          text-gray-700
                          focus:ring-1 focus:ring-offset-2 focus:ring-gray-500
                        " />
                        <span class="ml-2">Email me news and special offers</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Sanfona>


    </div>
  </div>
</template>


