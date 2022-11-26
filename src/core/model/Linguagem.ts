
export class Linguagem{
    nome: string
    dicionario: {}
    para_trauzir:string[]
    constructor(nome){
        this.nome = nome
        this.dicionario = {}
        this.para_trauzir = []

    }
    traduzir(texto:string): string{
        if(!texto || texto === ""){
            return texto
        }
        if(this.dicionario[texto]){
            return this.dicionario[texto]
        }
        console.warn("Texto não traduzido: "+texto)
            this.para_trauzir.push(texto)
            return texto
    }
    carregar_dicionario(original:string[], traduzido:string[]){
        original.forEach((k,i)=>(this.dicionario[k.trim()]=traduzido[i].trim()))
    }

}
