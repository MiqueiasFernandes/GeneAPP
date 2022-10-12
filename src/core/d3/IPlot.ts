import { Canvas } from "./Canvas";

export interface IPlot<T> {
    plot(data: T): Canvas;
}