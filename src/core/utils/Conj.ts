export class Conj<T> {

    private values: T[] = new Array<T>();

    constructor(iterable: T[]) {
        iterable.forEach(i => { if (!this.values.includes(i)) this.values.push(i) });
    }

    uniq = (): T[] => this.values;
}