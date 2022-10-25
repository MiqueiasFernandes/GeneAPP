import { Projeto } from "./model";

// https://vuejs.org/guide/scaling-up/state-management.html#simple-state-management-with-reactivity-api
export const PROJETO = reactive(new Projeto("AS Experiment"));
export const MODALS = reactive([])