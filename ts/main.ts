import { Car } from './car';
import { Road } from './road';
import { Visualizr } from './visualizr';

const carCanvas = document.getElementById('carCanvas') as HTMLCanvasElement;
carCanvas.width = 200;
const carCtx = carCanvas.getContext('2d')!;

const networkCanvas = document.getElementById('networkCanvas') as HTMLCanvasElement;
networkCanvas.width = 300;
const networkCtx = networkCanvas.getContext('2d')!;

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, 3);

const cars = generateCars(100);

const traffic: Car[] = [new Car(road.getLaneCenter(1), -300, 50, 30, 'DUMMY', 0.7)];

window.requestAnimationFrame(animate);

function generateCars(number: number) {
    const cars: Car[] = [];
    for (let i = 0; i < number; i++) {
        cars.push(new Car(road.getLaneCenter(1), -100, 50, 30, 'AI', 1));
    }
    return cars;
}

let bestCar: Car = cars[0];

if (localStorage.getItem('bestBrain')) {
    bestCar.brain = JSON.parse(localStorage.getItem('bestBrain')!);
}

document.getElementById('save-button')?.addEventListener('click', save);
document.getElementById('delete-button')?.addEventListener('click', discard);

function save() {
    localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain));
}

function discard() {
    localStorage.removeItem('bestBrain');
}

let lastTime = 0;
function animate(timestamp: number) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    bestCar = cars.find(c => c.y === Math.min(...cars.map(c => c.y)))!;

    for (const car of traffic) {
        car.update(dt, road.borders, []);
    }

    for (let i = 0; i < cars.length; i++) {
        cars[i].update(dt, road.borders, traffic);
    }

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);
    road.draw(carCtx);
    for (const car of traffic) {
        car.draw(carCtx, 'darkred');
    }

    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx, 'darkblue');
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, 'darkblue', true);
    carCtx.restore();

    networkCtx.lineDashOffset = -timestamp / 50;
    Visualizr.drawNetwork(networkCtx, bestCar.brain!);
    window.requestAnimationFrame(animate);
}
