import { Arquivo } from "./Arquivo";

export class CSV {
    data: string[][] = null;
    rows = [];
    cols = [];
    constructor(raw: string, sep = ",", header = []) {
        this.data = raw.split('\n').map(r => r.split(sep));
        if (header.length < 1) {
            this.cols = this.data[0];
            this.rows = this.data.filter((v, i) => i > 0);
        } else {
            this.cols = header;
            this.rows = this.data;
        }
    }

    get_header(): string[] {
        return this.cols;
    }

    get_col(name): string[] {
        const c = this.cols.indexOf(name);
        return this.rows.map(r => r[c]);
    }

    get_row(index): string[] {
        return this.data[index];
    }

    static open(fn, sep = ",", header = []) {
        Arquivo.importData(raw => fn(new CSV(raw, sep, header)))
    }
}