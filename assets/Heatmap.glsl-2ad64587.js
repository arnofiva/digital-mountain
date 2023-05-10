import{o as s}from"./ScreenSpacePass.glsl-fee70090.js";import{d}from"./DiscardOrAdjustAlphaBlend.glsl-f19054e7.js";import{o as e}from"./FloatPassUniform-e3702139.js";import{o as m,a as n}from"./ShaderBuilder-7bfc11d2.js";import{f as r}from"./Texture2DPassUniform-70e1e126.js";function l(a){const o=new m;o.include(s),o.include(d);const{usesHalfFloat:i}=a;return o.fragment.uniforms.add([new r("densityMap",t=>t.densityMap),new r("tex",t=>t.colorRamp),new e("densityNormalizer",t=>1/(t.maxDensity-t.minDensity)),new e("minDensity",t=>t.minDensity)]),o.fragment.uniforms.add(new e("densityMultiplier",t=>3/(t.searchRadius*t.searchRadius*Math.PI))),i&&o.constants.add("compressionFactor","float",4),o.fragment.code.add(n`
    void main() {
      float density = texture2D(densityMap, uv).r * densityMultiplier${i?n` * compressionFactor`:""};
      float densityRatio = (density - minDensity) * densityNormalizer;

      vec4 color = texture2D(tex, vec2(clamp(densityRatio, 0.0, 1.0), 0.5));

      discardOrAdjustAlpha(color);
      gl_FragColor = color;
    }
  `),o}const g=Object.freeze(Object.defineProperty({__proto__:null,build:l},Symbol.toStringTag,{value:"Module"}));export{g as a,l as t};
