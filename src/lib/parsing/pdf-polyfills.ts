/**
 * Node polyfills for the browser-only `DOMMatrix` and `Path2D` globals that
 * pdfjs-dist's legacy Node build requires.
 *
 * pdfjs-dist's legacy Node build (`pdf.mjs`) contains the canvas-rendering
 * module. At module instantiation it executes `const SCALE_MATRIX = new
 * DOMMatrix();` (top-level) and its `node_utils` module checks for `Path2D`,
 * warning "Cannot polyfill 'Path2D', rendering may be broken." when it is
 * missing. In browsers both are native globals, but on Node they only become
 * defined when pdf.js's own `node_utils` can load its optional native
 * dependency `@napi-rs/canvas`. That package is never present inside the
 * Vercel serverless bundle, so without polyfills importing pdfjs-dist either
 * throws `ReferenceError: DOMMatrix is not defined` or warns about Path2D
 * before any text is extracted.
 *
 * This module installs small, spec-compliant 2D affine DOMMatrix and Path2D
 * implementations on `globalThis` BEFORE pdfjs-dist is imported. pdf.js's
 * `node_utils` sees they are already present and skips its own (canvas-based)
 * polyfill, so the legacy build loads cleanly on the Node serverless runtime.
 * The application only performs TEXT EXTRACTION (`getTextContent()`); pdf.js
 * constructs `Path2D` objects exclusively inside its canvas RENDERING path
 * (`page.render()`), which is never invoked here, so these polyfills are never
 * exercised by the parser. They are still real, functional implementations
 * (not no-op fakes) in case any code path ever uses them. The parser itself
 * is unchanged.
 */

/**
 * Preload the optional native canvas addon (`@napi-rs/canvas`) BEFORE
 * pdfjs-dist is imported. pdf.mjs's `node_utils` module probes for it at
 * module instantiation via `require("@napi-rs/canvas")` and, when the
 * resolution fails (as it does in the Vercel serverless bundle, where the
 * package is not traced because it is only reachable through that runtime
 * `createRequire`), logs `Warning: Cannot load "@napi-rs/canvas" package.`
 * Loading it here first makes the bundler include it in the serverless bundle
 * and satisfies the later `require` from the module cache, so the warning
 * never fires. Text extraction never touches canvas; our DOMMatrix/Path2D
 * polyfills below remain the active globals. Guarded so a missing platform
 * binary can never break parsing.
 */
try {
  await import("@napi-rs/canvas");
} catch {
  // optional native addon - not required for text extraction
}

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

/**
 * Spec-compliant `Path2D` implementation backed by SVG path data. pdf.js's
 * `node_utils` only probes for the existence of `globalThis.Path2D` (its
 * native/canvas implementations are otherwise used for rendering, which this
 * app never performs), so this polyfill exists to satisfy that module-load
 * check while remaining a genuine, functional path object.
 */
class PDFPath2D {
  private _pathData = "";

  constructor(init?: string | PDFPath2D) {
    if (init instanceof PDFPath2D) {
      this._pathData = init._pathData;
      return;
    }
    if (typeof init === "string") {
      if (init.trim() === "") {
        throw new TypeError(
          "Failed to construct 'Path2D': The provided string is not a valid path."
        );
      }
      this._pathData = init.trim();
      return;
    }
    if (init != null) {
      throw new TypeError(
        "Failed to construct 'Path2D': The provided value is not a string or Path2D."
      );
    }
  }

  private _num(value: number): string {
    if (!Number.isFinite(value)) {
      throw new TypeError("Failed to execute 'Path2D' command: coordinate must be finite.");
    }
    return String(value);
  }

  addPath(path: PDFPath2D, transform?: { a: number; b: number; c: number; d: number; e: number; f: number }): void {
    if (!(path instanceof PDFPath2D)) {
      throw new TypeError(
        "Failed to execute 'addPath' on 'Path2D': The provided value is not a Path2D object."
      );
    }
    if (!transform || (transform.a === 1 && transform.b === 0 && transform.c === 0 && transform.d === 1 && transform.e === 0 && transform.f === 0)) {
      this._pathData += path._pathData;
      return;
    }
    if (/[Aa]/i.test(path._pathData)) {
      throw new TypeError(
        "Failed to execute 'addPath' on 'Path2D': Transformed elliptical arc commands are not supported by this polyfill."
      );
    }
    const { a, b, c, d, e, f } = transform;
    const tokens = path._pathData.match(/-?\d*\.?\d+(?:[eE][+-]?\d+)?/g) ?? [];
    let index = 0;
    const transformed = path._pathData.replace(/-?\d*\.?\d+(?:[eE][+-]?\d+)?/g, () => {
      const x = parseFloat(tokens[index]!);
      const y = parseFloat(tokens[index + 1]!);
      index += 2;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return tokens[index - 1]!;
      return `${this._num(a * x + c * y + e)},${this._num(b * x + d * y + f)}`;
    });
    this._pathData += transformed;
  }

  closePath(): void {
    this._pathData += "Z";
  }

  moveTo(x: number, y: number): void {
    this._pathData += `M${this._num(x)},${this._num(y)}`;
  }

  lineTo(x: number, y: number): void {
    this._pathData += `L${this._num(x)},${this._num(y)}`;
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    this._pathData += `C${this._num(cp1x)},${this._num(cp1y)} ${this._num(cp2x)},${this._num(cp2y)} ${this._num(x)},${this._num(y)}`;
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    this._pathData += `Q${this._num(cpx)},${this._num(cpy)} ${this._num(x)},${this._num(y)}`;
  }

  rect(x: number, y: number, w: number, h: number): void {
    this._pathData += `M${this._num(x)},${this._num(y)} h${this._num(w)} v${this._num(h)} h${this._num(-w)} Z`;
  }

  roundRect(x: number, y: number, w: number, h: number, radii?: number | number[]): void {
    const r0 = Array.isArray(radii) ? radii[0] ?? 0 : radii ?? 0;
    const r = Math.min(Math.abs(r0), Math.abs(w) / 2, Math.abs(h) / 2);
    this._pathData +=
      `M${this._num(x + r)},${this._num(y)}` +
      ` h${this._num(w - 2 * r)}` +
      this._arc(x + w - r, y + r, r, r, -Math.PI / 2, 0, false) +
      ` v${this._num(h - 2 * r)}` +
      this._arc(x + w - r, y + h - r, r, r, 0, Math.PI / 2, false) +
      ` h${this._num(-(w - 2 * r))}` +
      this._arc(x + r, y + h - r, r, r, Math.PI / 2, Math.PI, false) +
      ` v${this._num(-(h - 2 * r))}` +
      this._arc(x + r, y + r, r, r, Math.PI, Math.PI * 1.5, false) +
      "Z";
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
    if (radius < 0) {
      throw new RangeError("Failed to execute 'arc' on 'Path2D': The radius provided is negative.");
    }
    const fullCircle = Math.abs(endAngle - startAngle) >= Math.PI * 2;
    if (fullCircle) {
      const half = startAngle + Math.PI;
      this._arc(x, y, radius, radius, startAngle, half, !!counterclockwise);
      this._arc(x, y, radius, radius, half, endAngle, !!counterclockwise);
      return;
    }
    this._arc(x, y, radius, radius, startAngle, endAngle, !!counterclockwise);
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    if (radius < 0) {
      throw new RangeError("Failed to execute 'arcTo' on 'Path2D': The radius provided is negative.");
    }
    const [x0, y0] = this._lastPoint();
    const x01 = x0 - x1;
    const y01 = y0 - y1;
    const x21 = x2 - x1;
    const y21 = y2 - y1;
    const l01 = Math.hypot(x01, y01);
    const l21 = Math.hypot(x21, y21);
    if (l01 === 0 || l21 === 0 || radius === 0) {
      this.lineTo(x1, y1);
      return;
    }
    const angle = Math.atan2(y21, x21) - Math.atan2(y01, x01);
    const lambda = Math.atan2(Math.abs(Math.sin(angle)), Math.abs(Math.cos(angle)));
    const d0 = Math.sign(Math.sin(angle)) * lambda;
    const d1 = Math.abs(d0) < Math.PI / 2 ? radius / Math.tan(d0 / 2) : radius * Math.tan(d0 / 2);
    const d2 = radius / Math.sin(d0);
    const cx = x1 + (d1 / l01) * x01;
    const cy = y1 + (d1 / l01) * y01;
    const p0x = x1 + (d2 / l01) * x01;
    const p0y = y1 + (d2 / l01) * y01;
    const p2x = x1 + (d2 / l21) * x21;
    const p2y = y1 + (d2 / l21) * y21;
    const sweep = d0 > 0;
    this.lineTo(p0x, p0y);
    this._arc(cx, cy, radius, radius, Math.atan2(p0y - cy, p0x - cx), Math.atan2(p2y - cy, p2x - cx), sweep);
    this.lineTo(x2, y2);
  }

  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
    if (radiusX < 0 || radiusY < 0) {
      throw new RangeError("Failed to execute 'ellipse' on 'Path2D': A radius provided is negative.");
    }
    const fullCircle = Math.abs(endAngle - startAngle) >= Math.PI * 2;
    if (fullCircle) {
      const half = startAngle + Math.PI;
      this._arc(x, y, radiusX, radiusY, startAngle, half, !!counterclockwise, rotation);
      this._arc(x, y, radiusX, radiusY, half, endAngle, !!counterclockwise, rotation);
      return;
    }
    this._arc(x, y, radiusX, radiusY, startAngle, endAngle, !!counterclockwise, rotation);
  }

  private _arc(x: number, y: number, rx: number, ry: number, startAngle: number, endAngle: number, counterclockwise: boolean, rotation = 0): string {
    const sweep = counterclockwise ? 0 : 1;
    const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
    const startX = x + rx * Math.cos(startAngle);
    const startY = y + ry * Math.sin(startAngle);
    const endX = x + rx * Math.cos(endAngle);
    const endY = y + ry * Math.sin(endAngle);
    let out = "";
    if (this._pathData === "" || /Z$/.test(this._pathData)) {
      out += `M${this._num(startX)},${this._num(startY)}`;
    }
    out += `A${this._num(rx)},${this._num(ry)} ${this._num(rotation)} ${largeArc} ${sweep} ${this._num(endX)},${this._num(endY)}`;
    return out;
  }

  private _lastPoint(): [number, number] {
    const tokens = this._pathData.match(/-?\d*\.?\d+(?:[eE][+-]?\d+)?/g);
    if (tokens && tokens.length >= 2) {
      const x = parseFloat(tokens[tokens.length - 2]!);
      const y = parseFloat(tokens[tokens.length - 1]!);
      if (Number.isFinite(x) && Number.isFinite(y)) return [x, y];
    }
    return [0, 0];
  }
}

if (typeof globalThis.Path2D === "undefined") {
  globalThis.Path2D = PDFPath2D as unknown as typeof Path2D;
}

export {};
