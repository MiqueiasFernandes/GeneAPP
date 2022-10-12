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

    mx(mx: number): Margin {
        return new Margin(this.top, mx, this.bottom, mx);
    }

    my(my: number, mb?: number): Margin {
        return new Margin(my, this.right, mb || my, this.left);
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
        this.with(view || new Size(300, 200), Margin.simetric(margin || 0));
    }

    getX = () => this.x;
    getY = () => this.y;
    getX1 = () => this.x1;
    getY1 = () => this.y1;
    getMargin = () => this.margin;
    getView = () => this.view;
    getBox = () => this.box;

    withMargin(margin: Margin): ViewBox {
        this.margin = margin;
        this.box = this.margin.process(this.view);
        this.x = margin.left;
        this.y = margin.top;
        this.x1 = this.x + this.box.width;
        this.y1 = this.y + this.box.height;
        return this;
    }

    with(view: Size, margin?: Margin): ViewBox {
        this.view = view;
        this.withMargin(margin || this.margin);
        return this;
    }

    withWidth(width: number): ViewBox {
        return this.with(new Size(width, this.view.height));
    }

    withHeight(height: number): ViewBox {
        return this.with(new Size(this.view.width, height));
    }

    withMX(mx: number): ViewBox {
        return this.withMargin(this.margin.mx(mx));
    }
    withMY(my: number, mb?: number): ViewBox {
        return this.withMargin(this.margin.my(my, mb));
    }

}
