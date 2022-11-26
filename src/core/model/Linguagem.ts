
export class Linguagem {
    nome: string
    bandeira: string
    dicionario: {}
    para_trauzir: string[]
    constructor(nome, bandeira: string = '🏁', dic: string[] = []) {
        this.nome = nome
        this.bandeira = bandeira
        this.dicionario = {}
        this.para_trauzir = []
        if (dic && dic.length > 0) {
            dic.forEach((t, i) => i % 2 > 0  && (this.dicionario[dic[i - 1].trim()] = t.trim()))
        }
    }
    traduzir(texto: string): string {
        if (!texto || texto === "") {
            return texto
        }
        if (this.dicionario[texto]) {
            return this.dicionario[texto]
        }
        if (!this.para_trauzir.includes(texto)) {
            console.warn("[" + this.nome + "] Texto não traduzido: " + texto)
            this.para_trauzir.push(texto)
        }
        return texto
    }
    carregar_dicionario(original: string[], traduzido: string[]) {
        original.forEach((k, i) => (this.dicionario[k.trim()] = traduzido[i].trim()))
    }

}
