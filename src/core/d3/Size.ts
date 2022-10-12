export class Size {
    width: number;
    height: number;
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}

export class Margin {
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

    static simetric = (m: number): Margin => new Margin(m, m, m, m);

    process(size: Size): Size {
        return new Size(
            size.width - (this.left + this.right),
            size.height - (this.top + this.bottom));
    }
}

export class ViewBox {
    private x: number;
    private y: number;
    private x1: number;
    private y1: number;
    private margin: Margin;
    private view: Size;
    private box: Size;

    constructor(view?: Size, margin?: number) {
        this.with(view || new Size(300, 200), margin);
    }

    getX = () => this.x;
    getY = () => this.y;
    getX1 = () => this.x1;
    getY1 = () => this.y1;
    getMargin = () => this.margin;
    getView = () => this.view;
    getBox = () => this.box;

    with(view: Size, margin?: number): ViewBox {
        this.view = view;
        this.withMargin(margin ? Margin.simetric(margin) : (this.margin || Margin.simetric(0)));
        return this;
    }

    withWidth(width: number): ViewBox {
        return this.with(new Size(width, this.view.height));
    }

    withHeight(height: number): ViewBox {
        return this.with(new Size(this.view.width, height));
    }

    withMargin(margin: Margin): ViewBox {
        this.margin = margin;
        this.box = this.margin.process(this.view);
        this.x = margin.left;
        this.y = margin.top;
        this.x1 = this.x + this.box.width;
        this.y1 = this.y + this.box.height;
        return this;
    }

}
