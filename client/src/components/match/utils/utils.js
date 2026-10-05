import { 
    FIELD_WIDTH, FIELD_HEIGHT,
    HALF_WIDTH, HALF_HEIGHT, 
    NEG_HALF_WIDTH, NEG_HALF_HEIGHT 
} from "../../../config";

export function stayInBounds(value, min, max) {
    if (value < min) return min;

    if (value > max) return max;
    else return value;
}

export function toLeft(x) {
    const xInBounds = stayInBounds(x, NEG_HALF_WIDTH, HALF_WIDTH);
    return `${((xInBounds + HALF_WIDTH) / FIELD_WIDTH) * 100}%`;
}

export function toTop(y) {
    const yInBounds = stayInBounds(y, NEG_HALF_HEIGHT, HALF_HEIGHT);
    return `${((HALF_HEIGHT - yInBounds) / FIELD_HEIGHT) * 100}%`;
}

export function formatMatchTime(tick = 0) {
    const totalSeconds = Math.floor(tick * 0.1);
    const actualMinutes = Math.floor(totalSeconds / 60);
    const actualSeconds = totalSeconds % 60;

    const formattedMinutes = String(actualMinutes).padStart(2, "0");
    const formattedSeconds = String(actualSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

