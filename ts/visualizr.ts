import { NeuralNetwork } from './network';
import { getRGBA, lerp } from './utils';

export class Visualizr {
    static drawNetwork(ctx: CanvasRenderingContext2D, network: NeuralNetwork) {
        const margin = 50;
        const left = margin;
        const top = margin + 50;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2 - 50;

        const levelHeight = height / network.levels.length;

        for (let i = network.levels.length - 1; i >= 0; i--) {
            const levelTop =
                top + lerp(height - levelHeight, 0, network.levels.length == 1 ? 0.5 : i / (network.levels.length - 1));

            ctx.setLineDash([7, 3]);
            Visualizr.drawLevel(
                ctx,
                network.levels[i],
                left,
                levelTop,
                width,
                levelHeight,
                i == network.levels.length - 1 ? ['🠉', '🠈', '🠊', '🠋'] : []
            );
        }

        ctx.save();
        ctx.font = '10px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('Fitness', ctx.canvas.width / 2, 35);
        ctx.fillText(network.fitness.toFixed(0), ctx.canvas.width / 2, 50);
        ctx.restore();
    }

    static drawLevel(ctx: any, level: any, left: any, top: any, width: any, height: any, outputLabels: any) {
        const right = left + width;
        const bottom = top + height;

        const { inputs, outputs, weights, biases } = level;

        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < outputs.length; j++) {
                ctx.beginPath();
                ctx.moveTo(Visualizr.getNodeX(inputs, i, left, right), bottom);
                ctx.lineTo(Visualizr.getNodeX(outputs, j, left, right), top);
                ctx.lineWidth = 2;
                ctx.strokeStyle = getRGBA(weights[i][j]);
                ctx.stroke();
            }
        }

        const nodeRadius = 18;
        for (let i = 0; i < inputs.length; i++) {
            const x = Visualizr.getNodeX(inputs, i, left, right);
            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = getRGBA(inputs[i]);
            ctx.fill();
        }

        for (let i = 0; i < outputs.length; i++) {
            const x = Visualizr.getNodeX(outputs, i, left, right);
            ctx.beginPath();
            ctx.arc(x, top, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = getRGBA(outputs[i]);
            ctx.fill();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2);
            ctx.strokeStyle = getRGBA(biases[i]);
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            if (outputLabels[i]) {
                ctx.beginPath();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';
                ctx.strokeStyle = 'white';
                ctx.font = nodeRadius * 1.5 + 'px Arial';
                ctx.fillText(outputLabels[i], x, top + nodeRadius * 0.1);
                ctx.lineWidth = 0.5;
                ctx.strokeText(outputLabels[i], x, top + nodeRadius * 0.1);
            }
        }
    }

    private static getNodeX(nodes: any, index: any, left: any, right: any) {
        return lerp(left, right, nodes.length == 1 ? 0.5 : index / (nodes.length - 1));
    }
}
