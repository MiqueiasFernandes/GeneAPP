import { Arquivo } from "./Arquivo";

export class CSV {

    private data: string[][] = null;
    private rows = [];
    private cols = [];

    constructor(raw: string, sep = ",", header = []) {
        this.data = raw.split('\n').map(r => r.split(sep));
        if (header.length < 1) {
            this.cols = this.data[0];
            this.rows = this.data.filter((v, i) => i > 0);
        } else {
            this.cols = header;
            this.rows = this.data;
        }
        this.cols = this.cols.map(x => (x.trim().replaceAll('"', '') || '@'));
        this.rows = this.rows.map(r => Object.fromEntries(this.cols.map((c, i) => [c, r[i]])));
    }

    get_header(): string[] {
        return this.cols;
    }

    get_col(name): string[] {
        return this.rows.map(r => r[name]);
    }

    get_row(index): string[] {
        return this.data[index];
    }

    getRows = (t = null) => this.rows.map(r => Object.fromEntries(this.cols.map(c => [c, t && t[c] ? t[c](r[c]) : r[c]])));

    static open(fn, sep = ",", header = []) {
        Arquivo.importData(raw => fn(new CSV(raw, sep, header)))
    }

    static fromLines(lines: string[], sep = ',', header = []): CSV {
        return new CSV(lines.join('\n'), sep, header);
    }
}