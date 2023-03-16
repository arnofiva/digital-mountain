import{h as l}from"./Matrix3PassUniform-285be0f9.js";import{u as c}from"./Slice.glsl-e5fdd8d3.js";import{r as m}from"./Transform.glsl-e6366353.js";import{e as v}from"./VertexColor.glsl-e2eb2da5.js";import{a as g}from"./OutputHighlight.glsl-569dde3f.js";import{a as f,g as S}from"./LineStipple.glsl-df787c01.js";import{t as u}from"./AlphaCutoff-96178e0d.js";import{v as h}from"./View.glsl-725bf3cf.js";import{e as p}from"./Float4PassUniform-52993952.js";import{o as d}from"./FloatPassUniform-8a52db3d.js";import{o as x,a as o}from"./ShaderBuilder-c7fc4a30.js";import{O as s}from"./VertexAttribute-15d1866a.js";function P(e){const i=new x,{vertex:t,fragment:n}=i;return i.include(m,e),i.include(v,e),i.include(f,e),h(t,e),e.stippleEnabled&&(i.attributes.add(s.UV0,"vec2"),i.attributes.add(s.AUXPOS1,"vec3"),t.uniforms.add(new p("viewport",(r,a)=>a.camera.fullViewport))),i.attributes.add(s.POSITION,"vec3"),i.varyings.add("vpos","vec3"),t.code.add(o`void main(void) {
vpos = position;
forwardNormalizedVertexColor();
gl_Position = transformPosition(proj, view, vpos);`),e.stippleEnabled&&(t.code.add(o`vec4 vpos2 = transformPosition(proj, view, auxpos1);
vec2 ndcToPixel = viewport.zw * 0.5;
float lineSegmentPixelSize = length((vpos2.xy / vpos2.w - gl_Position.xy / gl_Position.w) * ndcToPixel);`),e.draped?t.uniforms.add(new d("worldToScreenRatio",(r,a)=>1/a.screenToPCSRatio)):t.code.add(o`vec3 segmentCenter = (position + auxpos1) * 0.5;
float worldToScreenRatio = computeWorldToScreenRatio(segmentCenter);`),t.code.add(o`float discreteWorldToScreenRatio = discretizeWorldToScreenRatio(worldToScreenRatio);`),e.draped?t.code.add(o`float startPseudoScreen = uv0.y * discreteWorldToScreenRatio - mix(0.0, lineSegmentPixelSize, uv0.x);
float segmentLengthPseudoScreen = lineSegmentPixelSize;`):t.code.add(o`float segmentLengthRender = length(position - auxpos1);
float startPseudoScreen = mix(uv0.y, uv0.y - segmentLengthRender, uv0.x) * discreteWorldToScreenRatio;
float segmentLengthPseudoScreen = segmentLengthRender * discreteWorldToScreenRatio;`),t.uniforms.add(new d("stipplePatternPixelSize",r=>S(r))),t.code.add(o`vec2 stippleDistanceLimits = computeStippleDistanceLimits(startPseudoScreen, segmentLengthPseudoScreen, lineSegmentPixelSize, stipplePatternPixelSize);
vStippleDistance = mix(stippleDistanceLimits.x, stippleDistanceLimits.y, uv0.x);
vStippleDistance *= gl_Position.w;`)),t.code.add(o`}`),e.output===l.Highlight&&i.include(g,e),i.include(c,e),n.uniforms.add(new d("alphaCoverage",(r,a)=>Math.min(1,r.width*a.camera.pixelRatio))),e.hasVertexColors||n.uniforms.add(new p("constantColor",r=>r.color)),n.code.add(o`
  void main() {
    discardBySlice(vpos);

    vec4 color = ${e.hasVertexColors?"vColor":"constantColor"};

    float stippleAlpha = getStippleAlpha();
    discardByStippleAlpha(stippleAlpha, stippleAlphaColorDiscard);

    vec4 finalColor = blendStipple(vec4(color.rgb, color.a * alphaCoverage), stippleAlpha);

    ${e.output===l.ObjectAndLayerIdColor?o`finalColor.a = 1.0;`:""}

    if (finalColor.a < ${o.float(u)}) {
      discard;
    }

    ${e.output===l.Color?o`gl_FragColor = highlightSlice(finalColor, vpos);`:""}
    ${e.output===l.Highlight?o`outputHighlight();`:""}
  }
  `),i}const D=Object.freeze(Object.defineProperty({__proto__:null,build:P},Symbol.toStringTag,{value:"Module"}));export{P as u,D as v};
