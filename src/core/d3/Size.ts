export class Size {
    width: number;
    height: number;
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}

export class Padding {
    top: number;
    right: number;
    bottom: number;
    left: number;

    constructor(top = 0, right = 0, bottom = 0, left = 0) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }

    static simetric = (m: number): Padding => new Padding(m, m, m, m);
    static zero = () => Padding.simetric(0);

    getBox(size: Size): Size {
        return new Size(
            size.width - (this.left + this.right),
            size.height - (this.top + this.bottom));
    }
}

export class ViewBox {

    private viewSize: Size;
    private viewPadding: Padding;
    private boxSize: Size;

    constructor(viewSize?: Size, padding?: Padding) {
        this.viewSize = viewSize || new Size(300, 200);
        this.viewPadding = padding || Padding.zero();
        this.boxSize = this.viewPadding.getBox(this.viewSize);
    }

    static fromSize = (width: number, height: number, padding?: Padding) => new ViewBox(new Size(width, height), padding);

    getViewSize = () => this.viewSize;
    getBoxSize = () => this.boxSize;

    getBoxX0 = () => this.viewPadding.left;
    getBoxX1 = () => this.getBoxX0() + this.boxSize.width;

    getBoxY0 = () => this.viewPadding.top;
    getBoxY1 = () => this.getBoxY0() + this.boxSize.height;

    withWidth = (width: number, offsetX = 0) => new ViewBox(
        new Size(this.viewSize.width, this.viewSize.height),
        new Padding(this.viewPadding.top,
            this.viewPadding.right - offsetX + (this.viewSize.width - width),
            this.viewPadding.bottom,
            this.viewPadding.left + offsetX
        )
    )

    withHeight = (height: number, offsetY = 0) => new ViewBox(
        new Size(this.viewSize.width, this.viewSize.height),
        new Padding(this.viewPadding.top + offsetY,
            this.viewPadding.right,
            this.viewPadding.bottom + (this.viewSize.height - height) - offsetY,
            this.viewPadding.left
        )
    )

    withPX = (p: number, l?: number) => this.withWidth(this.getBoxSize().width - p, l);
    withMPY = (p: number, t?: number) => this.withHeight(this.getBoxSize().height - p, t);

    splitX(cols: number = 2): ViewBox[] {
        const parts = new Array();
        const width = this.boxSize.width / cols;
        for (let c = 0; c < cols; c++) {
            parts.push(this.withWidth(width, (c) * width))
        }
        return parts;
    }

}
