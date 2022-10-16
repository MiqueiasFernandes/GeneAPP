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
    static left = (x: number) => new Padding(0, 0, 0, x);
    toLeft = (x: number) => new Padding(this.top, this.right, this.bottom, this.left + x)
    toTop = (y: number) => new Padding(this.top + y, this.right, this.bottom, this.left)
    toBottom = (y: number) => new Padding(this.top, this.right, this.bottom + y, this.left)

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

    getBoxCenter = () => [this.getBoxSize().width / 2 + this.getBoxX0(), this.getBoxSize().height / 2 + this.getBoxY0()];

    getBoxX0 = () => this.viewPadding.left;
    getBoxX1 = () => this.getBoxX0() + this.boxSize.width;

    getBoxY0 = () => this.viewPadding.top;
    getBoxY1 = () => this.getBoxY0() + this.boxSize.height;

    withWidth = (width: number, offsetX = 0) => new ViewBox(
        new Size(this.viewSize.width, this.viewSize.height),
        new Padding(
            this.viewPadding.top,
            this.viewPadding.right + this.boxSize.width - width - offsetX,
            this.viewPadding.bottom,
            this.viewPadding.left + offsetX
        )
    )

    withHeight = (height: number, offsetY = 0) => new ViewBox(
        new Size(this.viewSize.width, this.viewSize.height),
        new Padding(
            this.viewPadding.top + offsetY,
            this.viewPadding.right,
            this.viewPadding.bottom + this.boxSize.height - height - offsetY,
            this.viewPadding.left
        )
    )

    addPadding = (x: number, y: number): ViewBox => new ViewBox(
        new Size(this.viewSize.width, this.viewSize.height),
        new Padding(
            this.viewPadding.top + y,
            this.viewPadding.right + x,
            this.viewPadding.bottom,
            this.viewPadding.left
        )
    )

    toPadding = (p: Padding) => new ViewBox(
        new Size(this.viewSize.width, this.viewSize.height),
        new Padding(
            this.viewPadding.top + p.top,
            this.viewPadding.right + p.right,
            this.viewPadding.bottom + p.bottom,
            this.viewPadding.left + p.left
        ))

    addPaddingX = (x: number): ViewBox => this.addPadding(x, 0);
    addPaddingY = (y: number): ViewBox => this.addPadding(0, y);

    splitX(cols: number = 2, padding: number = 0): ViewBox[] {
        const parts = new Array();
        const width = this.boxSize.width / cols;
        for (let c = 0; c < cols; c++) {
            parts.push(this.withWidth(width, c * width).addPaddingX(padding))
        }
        return parts;
    }

    splitY(rows: number = 2, padding: number = 0): ViewBox[] {
        const parts = new Array();
        const height = this.boxSize.height / rows;
        for (let r = 0; r < rows; r++) {
            parts.push(this.withHeight(height, r * height).addPaddingY(padding))
        }
        return parts;
    }

}
