import { Controls, ControlType } from './controls';
import { NeuralNetwork } from './network';
import { Sensor } from './sensor';
import { getIntersection, Point2D, polysIntersect } from './utils';

export class Car {
    static readonly friction = 0.9;

    controls: Controls;
    sensor?: Sensor;
    brain?: NeuralNetwork;
    polygon: Point2D[];
    damaged: boolean;

    speed: number;
    angle: number;

    constructor(
        public x: number,
        public y: number,
        public height: number,
        public width: number,
        public controlType: ControlType,
        public maxSpeed: number = 3,
        public acceleration: number = 0.2
    ) {
        this.controls = new Controls(controlType);
        this.polygon = [];
        this.damaged = false;

        if (this.controlType === 'AI') {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
        }

        this.speed = 0;
        this.angle = 0;
    }

    update(dt: number, roadBorders: Point2D[][], traffic: Car[]) {
        if (!this.damaged) {
            this.move(dt / 5);
            this.polygon = this.createPolygon();
            this.damaged = this.assessDamage(roadBorders, traffic);
        }

        if (this.sensor && this.brain) {
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map(s => (s === null ? 0 : 1 - s.offset));
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            if (this.controlType === 'AI') {
                this.controls.forward = !!outputs[0];
                this.controls.left = !!outputs[1];
                this.controls.right = !!outputs[2];
                this.controls.reverse = !!outputs[3];
            }
        }
    }

    private assessDamage(roadBorders: Point2D[][], traffic: Car[]) {
        for (let i = 0; i < roadBorders.length; i++) {
            const intersection = polysIntersect(this.polygon, roadBorders[i]);
            if (intersection) {
                return true;
            }
        }
        for (let i = 0; i < traffic.length; i++) {
            const intersection = polysIntersect(this.polygon, traffic[i].polygon);
            if (intersection) {
                return true;
            }
        }
        return false;
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

        this.speed *= Car.friction;

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

    draw(ctx: CanvasRenderingContext2D, color: string, drawSensors: boolean = false) {
        if (this.damaged) {
            ctx.fillStyle = 'gray';
        } else {
            ctx.fillStyle = color;
        }

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.closePath();
        ctx.fill();

        if (drawSensors && this.sensor) {
            this.sensor.draw(ctx);
        }
    }
}
