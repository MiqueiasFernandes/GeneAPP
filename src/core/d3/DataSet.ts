import { CSV } from "../utils/CSV";

export interface IDataSet {
    data: Array<any>;
    variavs: string[];

    fromCSV(csv: CSV);
    range(variav: string): number[];
}

export class InlineDataSet implements IDataSet {
    data: Array<any>;
    variavs: string[];

    constructor(csv: CSV) {
        this.fromCSV(csv);
    }

    fromCSV(csv: CSV) {
        this.data = csv.getRows();
        this.variavs = csv.get_header();
    }

    range(variav: string): number[] {
        return [Math.min(...this.data.map(x => x[variav] as number)), Math.max(...this.data.map(x => x[variav] as number))];
    }

}