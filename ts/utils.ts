export function lerp(left: number, right: number, t: number) {
    return left + (right - left) * t;
}

export class Point2D {
    constructor(public x: number, public y: number) {}
}

export class Point2DWithOffset extends Point2D {
    constructor(point: Point2D, public offset: number) {
        super(point.x, point.y);
    }
}

export function getIntersection(A: Point2D, B: Point2D, C: Point2D, D: Point2D) {
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    if (bottom === 0) {
        return null;
    }

    const T = tTop / bottom;
    const U = uTop / bottom;

    if (T >= 0 && T <= 1 && U >= 0 && U <= 1) {
        return new Point2DWithOffset(new Point2D(lerp(A.x, B.x, T), lerp(A.y, B.y, T)), T);
    }

    return null;
}
