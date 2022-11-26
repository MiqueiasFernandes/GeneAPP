import { reactive, ref } from "vue";
import { Projeto } from "./model";
import { Linguagem } from "./model/Linguagem";

// https://vuejs.org/guide/scaling-up/state-management.html#simple-state-management-with-reactivity-api
export const PROJETO = reactive(new Projeto("AS Experiment"));
export const MODALS = reactive([])
export const NOTIFICACOES = ref([])
export const EMAIL = ref(null)
export const CACHE = ref({})


const INGLES = new Linguagem("ingles")
INGLES.carregar_dicionario(
    ["O GeneAPP está preparado para trabalhar com multi-exons coding genes para os tipos de AS RI e SE principalmente.","Este site usa cookies, ao continuar possui seu consentimento."],
    ["GeneAPP is prepared to work with multi-exon coding genes for AS RI and SE types mainly.","This website uses cookies, by continuing it has your consent."]
    )

const ESPANHOL = new Linguagem("espanhol")
ESPANHOL.carregar_dicionario(
    ["O GeneAPP está preparado para trabalhar com multi-exons coding genes para os tipos de AS RI e SE principalmente.","Este site usa cookies, ao continuar possui seu consentimento."],
    ["GeneAPP está preparado para trabajar con genes que codifican multiexones para los tipos AS RI y SE principalmente.","Este sitio utiliza cookies, al continuar tienes tu consentimiento."]
    )

const PORTUGUES = new Linguagem("portugues")
PORTUGUES.carregar_dicionario(
    ["O GeneAPP está preparado para trabalhar com multi-exons coding genes para os tipos de AS RI e SE principalmente.","Este site usa cookies, ao continuar possui seu consentimento."],
    ["O GeneAPP está preparado para trabalhar com multi-exons coding genes para os tipos de AS RI e SE principalmente.","Este site usa cookies, ao continuar possui seu consentimento."]
    )

export const IDIOMAS  = [INGLES, ESPANHOL, PORTUGUES]
export const LINGUAGEM = ref(INGLES)



    
export const notificar = (msg, color = 'success', timeout?) => {
    NOTIFICACOES.value = NOTIFICACOES.value.filter(n => !n.close)
    const id = Date.now() + Math.random()
    NOTIFICACOES.value.push({ msg, color, timeout, id })

}

export const remove = (id) => {
    const ns = NOTIFICACOES.value.filter(n => n.id === id)
    if (ns && ns.length > 0) ns[0].close = true
}
