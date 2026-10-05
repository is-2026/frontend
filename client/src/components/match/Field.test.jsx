import { describe, test, expect } from "vitest";
import { stayInBounds, toLeft, toTop } from "./Field";

describe("stayInBounds", () => {
  test("limita valores por debajo del mínimo", () => {
    expect(stayInBounds(-50, -20, 20)).toBe(-20);
  });

  test("limita valores por encima del máximo", () => {
    expect(stayInBounds(50, -20, 20)).toBe(20);
  });

  test("mantiene intactos valores dentro del rango", () => {
    expect(stayInBounds(5, -20, 20)).toBe(5);
  });
});

describe("toLeft / toTop", () => {
  test("el centro de la cancha (0, 0) queda en el centro del contenedor", () => {
    expect(toLeft(0)).toBe("50%");
    expect(toTop(0)).toBe("50%");
  });

  test("los límites reales de x (-20 / 20) quedan en los bordes (0% / 100%)", () => {
    expect(toLeft(-20)).toBe("0%");
    expect(toLeft(20)).toBe("100%");
  });

  test("los límites reales de y (-10 / 10) quedan en los bordes (100% / 0%, eje invertido)", () => {
    expect(toTop(-10)).toBe("100%");
    expect(toTop(10)).toBe("0%");
  });

  test("porcentaje para valores de x dentro del rango", () => {
    expect(toLeft(10)).toBe("75%"); // (10+20)/40 * 100
    expect(toLeft(-10)).toBe("25%"); // (-10+20)/40 * 100
  });

  test("porcentaje para valores de y dentro del rango", () => {
    expect(toTop(8)).toBe("10%"); // (10-8)/20 * 100
    expect(toTop(-8)).toBe("90%"); // (10-(-8))/20 * 100
  });

  test("recorta valores fuera de rango al borde correspondiente", () => {
    expect(toLeft(-35)).toBe("0%");
    expect(toLeft(45)).toBe("100%");
    expect(toTop(-15)).toBe("100%");
    expect(toTop(30)).toBe("0%");
  });
});
