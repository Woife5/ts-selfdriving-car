import { Car } from './car';
import { NeuralNetwork } from './network';
import { Road } from './road';
import { randomInt } from './utils';
import { Visualizr } from './visualizr';

const carCanvas = document.getElementById('carCanvas') as HTMLCanvasElement;
carCanvas.width = 200;
const carCtx = carCanvas.getContext('2d')!;

const networkCanvas = document.getElementById('networkCanvas') as HTMLCanvasElement;
networkCanvas.width = 300;
const networkCtx = networkCanvas.getContext('2d')!;

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, 3);

const cars = generateCars(1000);
function generateCars(number: number) {
    const cars: Car[] = [];
    for (let i = 0; i < number; i++) {
        cars.push(new Car(road.getLaneCenter(1), -100, 50, 30, 'AI', 1));
    }
    return cars;
}

const traffic = generateRandomDummys(50);

window.requestAnimationFrame(animate);

let bestCar: Car = cars[0];

if (localStorage.getItem('bestBrain')) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem('bestBrain')!);
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain!, 0.05);
        }
    }
}

if (localStorage.getItem('autorefresh')) {
    setAutoRefresh(true);
} else {
    setAutoRefresh(false);
}

document.getElementById('save-button')?.addEventListener('click', save);
document.getElementById('delete-button')?.addEventListener('click', discard);
document.getElementById('autorefresh-button')?.addEventListener('click', toggleAutorefresh);

function save() {
    localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain));
}

function discard() {
    localStorage.removeItem('bestBrain');
}

function toggleAutorefresh() {
    setAutoRefresh(!localStorage.getItem('autorefresh'));
}

let refreshTimeout: number;
function setAutoRefresh(value: boolean) {
    if (value) {
        localStorage.setItem('autorefresh', 'true');
        document.getElementById('autorefresh-button')!.innerText = '🔃';
        refreshTimeout = window.setTimeout(() => {
            save();
            window.location.reload();
        }, 1000 * 60);
    } else {
        localStorage.removeItem('autorefresh');
        document.getElementById('autorefresh-button')!.innerText = '⛔';
        window.clearTimeout(refreshTimeout);
    }
}

let lastTime = 0;
function animate(timestamp: number) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    bestCar = cars.find(c => c.brain!.fitness === Math.max(...cars.map(c => c.brain!.fitness)))!;

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

function generateRandomDummys(number: number) {
    const dummys: Car[] = [];
    for (let i = 0; i < number; i++) {
        const lane = randomInt(0, road.laneCount);
        dummys.push(new Car(road.getLaneCenter(lane), -200 + -150 * i, 50, 30, 'DUMMY', 0.6));

        if (Math.random() > 0.5 && i < number - 1) {
            dummys.push(new Car(road.getLaneCenter(lane + 1), -200 + -150 * i, 50, 30, 'DUMMY', 0.6));
            i += 1;
        }
    }

    return dummys;
}
