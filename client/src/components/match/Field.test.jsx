import { describe, test, expect } from 'vitest';
import { FIELD_WIDTH, FIELD_HEIGHT } from "../../config"
import { stayInBounds } from "./Field";

describe('stayInBounds', () => {
    test('limita valores negativos a 0', () => {
        expect(stayInBounds(-5, 0, FIELD_WIDTH)).toBe(0);
        expect(stayInBounds(-10, 0, FIELD_HEIGHT)).toBe(0);
    });

    test('limita valores superiores al máximo', () => {
        expect(stayInBounds(45, 0, FIELD_WIDTH)).toBe(FIELD_WIDTH); // 45 -> 40
        expect(stayInBounds(30, 0, FIELD_HEIGHT)).toBe(FIELD_HEIGHT); // 30 -> 20
    });

    test('mantiene intactos valores dentro del rango válido', () => {
        expect(stayInBounds(20, 0, FIELD_WIDTH)).toBe(20);
        expect(stayInBounds(10, 0, FIELD_HEIGHT)).toBe(10);
    });
});