import { lerp } from './utils';

export class NeuralNetwork {
    levels: Level[];

    constructor(neuronCounts: number[]) {
        this.levels = [];

        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
        }
    }

    static feedForward(inputs: number[], network: NeuralNetwork) {
        let outputs = Level.feedForward(inputs, network.levels[0]);

        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(outputs, network.levels[i]);
        }

        return outputs;
    }

    static mutate(network: NeuralNetwork, mutationRate: number = 1) {
        network.levels.forEach(level => {
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] = lerp(level.biases[i], Math.random() * 2 - 1, mutationRate);
            }

            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j] = lerp(level.weights[i][j], Math.random() * 2 - 1, mutationRate);
                }
            }
        });
    }
}

export class Level {
    inputs: number[];
    outputs: number[];
    biases: number[];
    weights: number[][];

    constructor(public inputCount: number, public outputCount: number) {
        this.inputs = new Array<number>(inputCount);
        this.outputs = new Array<number>(outputCount);
        this.biases = new Array<number>(outputCount);

        this.weights = new Array<number[]>(inputCount);
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array<number>(outputCount);
        }

        Level.randomize(this);
    }

    private static randomize(level: Level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    static feedForward(inputs: number[], level: Level) {
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = inputs[i];
        }

        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < level.outputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }

            level.outputs[i] = sum > level.biases[i] ? 1 : 0;
        }

        return level.outputs;
    }
}
