import { Car } from './car';
import { getIntersection, lerp, Point2D, Point2DWithOffset } from './utils';

export class Sensor {
    rays: Point2D[][];
    readings: (Point2DWithOffset | null)[];

    constructor(
        private car: Car,
        public rayCount: number = 10,
        private rayLength: number = 200,
        private raySpread: number = Math.PI / 2
    ) {
        this.rays = [];
        this.readings = [];
    }

    update(roadBorders: Point2D[][], traffic: Car[]) {
        this.castRays();

        this.readings = [];
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push(this.getReading(this.rays[i], roadBorders, traffic));
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.rayCount; i++) {
            const end = this.readings[i] ?? this.rays[i][1];

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'yellow';
            ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black';
            ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    }

    private castRays() {
        this.rays = [];

        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle =
                lerp(this.raySpread / 2, -this.raySpread / 2, this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)) +
                this.car.angle;

            const start = new Point2D(this.car.x, this.car.y);
            const end = new Point2D(
                this.car.x - Math.sin(rayAngle) * this.rayLength,
                this.car.y - Math.cos(rayAngle) * this.rayLength
            );

            this.rays.push([start, end]);
        }
    }

    private getReading(ray: Point2D[], roadBorders: Point2D[][], traffic: Car[]) {
        let touches: Point2DWithOffset[] = [];

        for (const border of roadBorders) {
            const touch = getIntersection(ray[0], ray[1], border[0], border[1]);

            if (touch) {
                touches.push(touch);
            }
        }

        for (const car of traffic) {
            for (let j = 0; j < car.polygon.length; j++) {
                const touch = getIntersection(
                    ray[0],
                    ray[1],
                    car.polygon[j],
                    car.polygon[(j + 1) % car.polygon.length]
                );

                if (touch) {
                    touches.push(touch);
                }
            }
        }

        if (touches.length === 0) {
            return null;
        }

        const offsets = touches.map(e => e.offset);
        const minOffset = Math.min(...offsets);
        return touches.find(e => e.offset === minOffset) ?? null;
    }
}
