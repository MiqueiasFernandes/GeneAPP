import { reactive, ref } from "vue";
import { Projeto } from "./model";

// https://vuejs.org/guide/scaling-up/state-management.html#simple-state-management-with-reactivity-api
export const PROJETO = reactive(new Projeto("AS Experiment"));
export const MODALS = reactive([])
export const NOTIFICACOES = reactive([])
const UUID = ref(1);

export const notificar = (msg, color = 'success', timeout = 3) => NOTIFICACOES.push({ msg, color, timeout, id: UUID.value++ })