import { Car } from './car';
import { Road } from './road';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = 300;

const ctx = canvas.getContext('2d')!;

const road = new Road(canvas.width / 2, canvas.width * 0.9, 4);

const car = new Car(road.getLaneCenter(2), 100, 50, 30, 'KEYS');

const traffic: Car[] = [new Car(road.getLaneCenter(1), -100, 50, 30, 'DUMMY', 0.9)];

window.requestAnimationFrame(animate);

let lastTime = 0;
function animate(timestamp: number) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    canvas.height = window.innerHeight;

    for (const car of traffic) {
        car.update(dt, road.borders, []);
    }
    car.update(dt, road.borders, traffic);

    ctx.save();
    ctx.translate(0, -car.y + canvas.height * 0.7);
    road.draw(ctx);
    for (const car of traffic) {
        car.draw(ctx, 'darkred');
    }
    car.draw(ctx, 'darkblue');
    ctx.restore();
    window.requestAnimationFrame(animate);
}
