declare module 'ogl' {
  export class Renderer {
    constructor(options?: any);
    gl: WebGL2RenderingContext | WebGLRenderingContext;
    dpr: number;
    setSize(width: number, height: number): void;
    render(options: { scene: any; camera?: any }): void;
  }
  export class Program {
    constructor(gl: any, options?: any);
    uniforms: Record<string, { value: any }>;
    remove(): void;
  }
  export class Mesh {
    constructor(gl: any, options?: any);
  }
  export class Triangle {
    constructor(gl: any);
    remove(): void;
  }
  export class Texture {
    constructor(gl: any, options?: any);
    image: any;
    needsUpdate: boolean;
    texture: WebGLTexture;
  }
}
