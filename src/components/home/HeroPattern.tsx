"use client";
import { useEffect, useRef } from 'react';

export default function HeroPattern() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) return;

    const vert = `
    attribute vec2 p;
    void main() {
      gl_Position = vec4(p, 0.0, 1.0);
    }
    `;

    const frag = `
    precision highp float;

    uniform vec2  r;
    uniform float t;

    float field(vec2 p) {
      float v = 0.0;
      v += sin(p.x * 3.0 + t);
      v += sin(p.y * 4.0 - t * 1.2);
      v += sin((p.x + p.y) * 2.0);
      v += sin(length(p) * 6.0 - t);
      return v;
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * r) / r.y;
      
      float f = field(uv * 2.5);

      // dense contour lines
      float lines = abs(fract(f * 1.0) - 0.5);
      float mask  = smoothstep(0.45, 0.48, lines);

      vec3 col = vec3(mask);
      // use slightly transparent gold/white or just the user's mask, the user had vec4(col, 0.49)
      gl_FragColor = vec4(col, 0.49);
    }
    `;

    function compile(type: number, src: string) {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const vShader = compile(gl.VERTEX_SHADER, vert);
    const fShader = compile(gl.FRAGMENT_SHADER, frag);
    
    if (!vShader || !fShader) return;

    const prog = gl.createProgram();
    if (!prog) return;

    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1
      ]),
      gl.STATIC_DRAW
    );

    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const ur = gl.getUniformLocation(prog, "r");
    const ut = gl.getUniformLocation(prog, "t");

    function resize() {
      if (!canvas || !gl) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener("resize", resize);
    resize();

    let animationFrameId: number;
    const start = performance.now();

    function draw(now: number) {
      if (!canvas || !gl) return;
      gl.uniform2f(ur, canvas.width, canvas.height);
      gl.uniform1f(ut, (now - start) * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(draw);
    }
    draw(performance.now());

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-30 mix-blend-luminosity pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
