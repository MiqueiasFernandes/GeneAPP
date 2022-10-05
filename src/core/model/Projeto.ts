
class Fator {
    nome: String;
    cor: String;
    constructor(nome) {
        this.nome = nome;
        this.cor = "#fd177e";
    }
}

export class Projeto {
    nome: String;
    fatores: Fator[];

    constructor(nome) {
        this.nome = nome;
        this.fatores = new Array<Fator>();
    }

    add_fator(nome: string) {
        !nome || nome.length < 1 || this.fatores.some(f => f.nome === nome) || this.fatores.push(new Fator(nome));
        this.fatores.length > 1 ? this.fatores[1].cor = "#1cb9fd" : null;
    }
}