
export class Arquivo {
    files = null;

    static importData(fn_data) {
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = _ => {
            for (let index = 0; index < input.files.length; index++) {
                const file = input.files[index];
                var reader = new FileReader();
                reader.onload = (reader) => {
                    fn_data(reader.target.result);
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    static download(filename, data, type = 'text/txt') {
        const blob = new Blob([data], { type });
        if ((window.navigator as any).msSaveOrOpenBlob) {
            (window.navigator as any).msSaveBlob(blob, filename);
        }
        else {
            const elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = filename;
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);
        }
    }
}