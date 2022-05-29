import { Car } from './car';
import { Road } from './road';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = 300;

const ctx = canvas.getContext('2d')!;

const road = new Road(canvas.width / 2, canvas.width * 0.9, 4);

const car = new Car(road.getLaneCenter(2), 100, 50, 30);

window.requestAnimationFrame(animate);

let lastTime = 0;
function animate(timestamp: number) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    canvas.height = window.innerHeight;
    car.update(dt, road.borders);

    ctx.save();
    ctx.translate(0, -car.y + canvas.height * 0.7);
    road.draw(ctx);
    car.draw(ctx);
    ctx.restore();
    window.requestAnimationFrame(animate);
}
