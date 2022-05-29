import { lerp, Point2D } from './utils';

export class Road {
    left: number;
    right: number;
    top: number;
    bottom: number;
    borders: Point2D[][];

    constructor(public x: number, public width: number, public laneCount: number = 3) {
        this.left = x - width / 2;
        this.right = x + width / 2;

        this.top = -1000000;
        this.bottom = 1000000;

        const topLeft = new Point2D(this.left, -Number.MAX_SAFE_INTEGER);
        const bottomLeft = new Point2D(this.left, Number.MAX_SAFE_INTEGER);
        const topRight = new Point2D(this.right, -Number.MAX_SAFE_INTEGER);
        const bottomRight = new Point2D(this.right, Number.MAX_SAFE_INTEGER);

        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight],
        ];
    }

    getLaneCenter(lane: number) {
        const laneWidth = this.width / this.laneCount;
        return this.left + laneWidth * Math.min(lane, this.laneCount - 1) + laneWidth / 2;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'white';

        for (let i = 1; i <= this.laneCount - 1; i++) {
            const x = lerp(this.left, this.right, i / this.laneCount);

            ctx.setLineDash([20, 20]);

            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }

        ctx.setLineDash([]);

        for (const border of this.borders) {
            ctx.beginPath();
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        }
    }
}
