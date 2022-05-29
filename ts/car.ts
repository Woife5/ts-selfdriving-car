import { Controls } from './controls';
import { Sensor } from './sensor';
import { Point2D } from './utils';

export class Car {
    controls: Controls;
    sensor: Sensor;
    polygon: Point2D[];

    constructor(
        public x: number,
        public y: number,
        public height: number,
        public width: number,
        public speed: number = 0,
        public acceleration: number = 0.2,
        public maxSpeed: number = 3,
        public friction: number = 0.9,
        public angle: number = 0
    ) {
        this.controls = new Controls();
        this.sensor = new Sensor(this);
        this.polygon = [];
    }

    update(dt: number, roadBorders: Point2D[][]) {
        this.move(dt / 5);
        this.polygon = this.createPolygon();
        this.sensor.update(roadBorders);
    }

    private createPolygon() {
        const points: Point2D[] = [];

        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);

        points.push(
            new Point2D(this.x - Math.sin(this.angle - alpha) * rad, this.y - Math.cos(this.angle - alpha) * rad)
        );
        points.push(
            new Point2D(this.x - Math.sin(this.angle + alpha) * rad, this.y - Math.cos(this.angle + alpha) * rad)
        );
        points.push(
            new Point2D(
                this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
                this.y - Math.cos(Math.PI + this.angle - alpha) * rad
            )
        );
        points.push(
            new Point2D(
                this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
                this.y - Math.cos(Math.PI + this.angle + alpha) * rad
            )
        );

        return points;
    }

    private move(dt: number) {
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }

        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }

        if (this.speed < -this.maxSpeed) {
            this.speed = -this.maxSpeed;
        }

        this.speed *= this.friction;

        const flip = this.speed < 0 ? -1 : 1;
        if (this.controls.left) {
            this.angle += 0.009 * flip * dt;
        }

        if (this.controls.right) {
            this.angle -= 0.009 * flip * dt;
        }

        this.x -= Math.sin(this.angle) * this.speed * dt;
        this.y -= Math.cos(this.angle) * this.speed * dt;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.closePath();
        ctx.fill();

        this.sensor.draw(ctx);
    }
}
