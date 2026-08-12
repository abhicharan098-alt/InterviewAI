/**
 * Node polyfill for the browser-only `DOMMatrix` global.
 *
 * pdfjs-dist's legacy Node build (`pdf.mjs`) contains the canvas-rendering
 * module, which executes `const SCALE_MATRIX = new DOMMatrix();` at module
 * instantiation (top-level). In browsers `DOMMatrix` is a native global, but
 * on Node it only becomes defined when pdf.js's own `node_utils` can load its
 * optional native dependency `@napi-rs/canvas`. That package is never present
 * inside the Vercel serverless bundle, so importing pdfjs-dist throws
 * `ReferenceError: DOMMatrix is not defined` before any text is extracted.
 *
 * This module installs a small, spec-compliant 2D affine DOMMatrix on
 * `globalThis` BEFORE pdfjs-dist is imported. pdf.js's `node_utils` sees it is
 * already present and skips its own (canvas-based) polyfill, so the legacy
 * build loads cleanly on the Node serverless runtime and text extraction
 * works. It is only a polyfill for an API the chosen parser requires at
 * module-load time; the parser itself is unchanged.
 */

class PDFDOMMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;

  constructor(init?: PDFDOMMatrix | ReadonlyArray<number> | { [K in "a" | "b" | "c" | "d" | "e" | "f"]?: number } | string) {
    if (init instanceof PDFDOMMatrix) {
      this.a = init.a;
      this.b = init.b;
      this.c = init.c;
      this.d = init.d;
      this.e = init.e;
      this.f = init.f;
      return;
    }

    if (typeof init === "string") {
      const match = /matrix\(\s*([^)]+)\)/.exec(init);
      if (match) {
        const values = match[1].split(",").map((v) => parseFloat(v.trim()));
        if (values.length === 6) {
          this.a = values[0];
          this.b = values[1];
          this.c = values[2];
          this.d = values[3];
          this.e = values[4];
          this.f = values[5];
          return;
        }
      }
      throw new TypeError(`Failed to construct 'DOMMatrix': Invalid matrix string '${init}'.`);
    }

    if (Array.isArray(init)) {
      if (init.length === 6 && init.every((v) => typeof v === "number")) {
        this.a = init[0];
        this.b = init[1];
        this.c = init[2];
        this.d = init[3];
        this.e = init[4];
        this.f = init[5];
        return;
      }
      throw new TypeError("Failed to construct 'DOMMatrix': The provided sequence must contain 6 numbers.");
    }

    if (init && typeof init === "object") {
      const valueOf = (v: unknown): number | undefined => (typeof v === "number" ? v : undefined);
      const a = valueOf((init as Record<string, unknown>).a);
      const b = valueOf((init as Record<string, unknown>).b);
      const c = valueOf((init as Record<string, unknown>).c);
      const d = valueOf((init as Record<string, unknown>).d);
      const e = valueOf((init as Record<string, unknown>).e);
      const f = valueOf((init as Record<string, unknown>).f);
      if (a !== undefined && b !== undefined && c !== undefined && d !== undefined && e !== undefined && f !== undefined) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        return;
      }
      throw new TypeError("Failed to construct 'DOMMatrix': The provided object does not contain a..f.");
    }

    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
  }

  get isIdentity(): boolean {
    return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.e === 0 && this.f === 0;
  }

  multiply(other: PDFDOMMatrix): PDFDOMMatrix {
    return new PDFDOMMatrix(this).multiplySelf(other);
  }

  multiplySelf(other: PDFDOMMatrix): this {
    const { a, b, c, d, e, f } = this;
    const { a: oa, b: ob, c: oc, d: od, e: oe, f: of } = other;
    this.a = a * oa + c * ob;
    this.b = b * oa + d * ob;
    this.c = a * oc + c * od;
    this.d = b * oc + d * od;
    this.e = a * oe + c * of + e;
    this.f = b * oe + d * of + f;
    return this;
  }

  preMultiplySelf(other: PDFDOMMatrix): this {
    const { a, b, c, d, e, f } = this;
    const { a: oa, b: ob, c: oc, d: od, e: oe, f: of } = other;
    this.a = oa * a + oc * b;
    this.b = ob * a + od * b;
    this.c = oa * c + oc * d;
    this.d = ob * c + od * d;
    this.e = oa * e + oc * f + oe;
    this.f = ob * e + od * f + of;
    return this;
  }

  translate(tx: number, ty: number): PDFDOMMatrix {
    return new PDFDOMMatrix(this).translateSelf(tx, ty);
  }

  translateSelf(tx: number, ty: number): this {
    this.e += tx * this.a + ty * this.c;
    this.f += tx * this.b + ty * this.d;
    return this;
  }

  scale(scaleX: number, scaleY: number): PDFDOMMatrix {
    return new PDFDOMMatrix(this).scaleSelf(scaleX, scaleY);
  }

  scaleSelf(scaleX: number, scaleY: number): this {
    this.a *= scaleX;
    this.b *= scaleY;
    this.c *= scaleX;
    this.d *= scaleY;
    return this;
  }

  invertSelf(): this {
    const determinant = this.a * this.d - this.b * this.c;
    if (determinant === 0) {
      throw new TypeError("Failed to execute 'invertSelf' on 'DOMMatrix': The matrix is not invertible.");
    }
    const { a, b, c, d, e, f } = this;
    this.a = d / determinant;
    this.b = -b / determinant;
    this.c = -c / determinant;
    this.d = a / determinant;
    this.e = (c * f - d * e) / determinant;
    this.f = (b * e - a * f) / determinant;
    return this;
  }

  toString(): string {
    return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
  }
}

if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = PDFDOMMatrix as unknown as typeof DOMMatrix;
}
