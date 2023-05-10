import{i as g,t as h}from"./ForwardLinearDepth.glsl-a0929473.js";import{h as a}from"./Matrix3PassUniform-0b3b1bba.js";import{u as w}from"./Slice.glsl-7975394d.js";import{r as S}from"./Transform.glsl-7294c426.js";import{e as y}from"./VertexColor.glsl-79a8c465.js";import{o as $}from"./OutputDepth.glsl-f581dcdd.js";import{a as C}from"./OutputHighlight.glsl-08aacdf4.js";import{n as D}from"./MultipassTerrainTest.glsl-43f42334.js";import{t as T}from"./AlphaCutoff-96178e0d.js";import{e as P,o as R}from"./TransparencyPassType-a6b20292.js";import{v as b,c as j}from"./View.glsl-03db830e.js";import{e as V}from"./Float4PassUniform-7f3c3ce8.js";import{o as p}from"./FloatPassUniform-e3702139.js";import{o as z,a as o}from"./ShaderBuilder-7bfc11d2.js";import{O as v}from"./VertexAttribute-15d1866a.js";var r;(function(e){e[e.Horizontal=0]="Horizontal",e[e.Vertical=1]="Vertical",e[e.Cross=2]="Cross",e[e.ForwardDiagonal=3]="ForwardDiagonal",e[e.BackwardDiagonal=4]="BackwardDiagonal",e[e.DiagonalCross=5]="DiagonalCross",e[e.COUNT=6]="COUNT"})(r||(r={}));const u=.70710678118,f=u,O=.08715574274;function A(e){const t=new z,n=e.hasMultipassTerrain&&(e.output===a.Color||e.output===a.Alpha);e.draped||t.extensions.add("GL_OES_standard_derivatives");const{vertex:i,fragment:l}=t;b(i,e),t.include(S,e),t.include(y,e),e.draped?i.uniforms.add(new p("worldToScreenRatio",(d,c)=>1/c.screenToPCSRatio)):t.attributes.add(v.BOUNDINGRECT,"mat3"),t.attributes.add(v.POSITION,"vec3"),t.attributes.add(v.UVMAPSPACE,"vec4"),t.varyings.add("vpos","vec3"),t.varyings.add("vuv","vec2"),n&&t.varyings.add("depth","float");const s=e.style===r.ForwardDiagonal||e.style===r.BackwardDiagonal||e.style===r.DiagonalCross;s&&i.code.add(o`
      const mat2 rotate45 = mat2(${o.float(u)}, ${o.float(-f)},
                                 ${o.float(f)}, ${o.float(u)});
    `),e.draped||(j(i,e),i.uniforms.add(new p("worldToScreenPerDistanceRatio",(d,c)=>1/c.camera.perScreenPixelRatio)),i.code.add(o`vec3 projectPointToLineSegment(vec3 center, vec3 halfVector, vec3 point) {
float projectedLength = dot(halfVector, point - center) / dot(halfVector, halfVector);
return center + halfVector * clamp(projectedLength, -1.0, 1.0);
}`),i.code.add(o`vec3 intersectRayPlane(vec3 rayDir, vec3 rayOrigin, vec3 planeNormal, vec3 planePoint) {
float d = dot(planeNormal, planePoint);
float t = (d - dot(planeNormal, rayOrigin)) / dot(planeNormal, rayDir);
return rayOrigin + t * rayDir;
}`),i.code.add(o`
      float boundingRectDistanceToCamera() {
        vec3 center = vec3(boundingRect[0][0], boundingRect[0][1], boundingRect[0][2]);
        vec3 halfU = vec3(boundingRect[1][0], boundingRect[1][1], boundingRect[1][2]);
        vec3 halfV = vec3(boundingRect[2][0], boundingRect[2][1], boundingRect[2][2]);
        vec3 n = normalize(cross(halfU, halfV));

        vec3 viewDir = - vec3(view[0][2], view[1][2], view[2][2]);

        float viewAngle = dot(viewDir, n);
        float minViewAngle = ${o.float(O)};

        if (abs(viewAngle) < minViewAngle) {
          // view direction is (almost) parallel to plane -> clamp it to min angle
          float normalComponent = sign(viewAngle) * minViewAngle - viewAngle;
          viewDir = normalize(viewDir + normalComponent * n);
        }

        // intersect view direction with infinite plane that contains bounding rect
        vec3 planeProjected = intersectRayPlane(viewDir, cameraPosition, n, center);

        // clip to bounds by projecting to u and v line segments individually
        vec3 uProjected = projectPointToLineSegment(center, halfU, planeProjected);
        vec3 vProjected = projectPointToLineSegment(center, halfV, planeProjected);

        // use to calculate the closest point to camera on bounding rect
        vec3 closestPoint = uProjected + vProjected - center;

        return length(closestPoint - cameraPosition);
      }
    `)),i.code.add(o`
    vec2 scaledUV() {
      vec2 uv = uvMapSpace.xy ${s?" * rotate45":""};
      vec2 uvCellOrigin = uvMapSpace.zw ${s?" * rotate45":""};

      ${e.draped?"":o`
            float distanceToCamera = boundingRectDistanceToCamera();
            float worldToScreenRatio = worldToScreenPerDistanceRatio / distanceToCamera;
          `}

      // Logarithmically discretize ratio to avoid jittering
      float step = 0.1;
      float discreteWorldToScreenRatio = log(worldToScreenRatio);
      discreteWorldToScreenRatio = ceil(discreteWorldToScreenRatio / step) * step;
      discreteWorldToScreenRatio = exp(discreteWorldToScreenRatio);

      vec2 uvOffset = mod(uvCellOrigin * discreteWorldToScreenRatio, ${o.float(e.patternSpacing)});
      return uvOffset + (uv * discreteWorldToScreenRatio);
    }
  `);const m=e.output===a.Depth;return m&&(t.include($,e),g(t),h(t)),i.code.add(o`
    void main(void) {
      vuv = scaledUV();
      vpos = position;
      ${n?"depth = (view * vec4(vpos, 1.0)).z;":""}
      forwardNormalizedVertexColor();
      gl_Position = ${m?o`transformPositionWithDepth(proj, view, vpos, nearFar, linearDepth);`:o`transformPosition(proj, view, vpos);`}
    }
  `),t.include(w,e),l.include(P),e.draped&&l.uniforms.add(new p("texelSize",(d,c)=>1/c.camera.pixelRatio)),e.output===a.Highlight&&t.include(C,e),n&&t.include(D,e),e.output!==a.Highlight&&(l.code.add(o`
      const float lineWidth = ${o.float(e.lineWidth)};
      const float spacing = ${o.float(e.patternSpacing)};
      const float spacingINV = ${o.float(1/e.patternSpacing)};

      float coverage(float p, float txlSize) {
        p = mod(p, spacing);

        float halfTxlSize = txlSize / 2.0;

        float start = p - halfTxlSize;
        float end = p + halfTxlSize;

        float coverage = (ceil(end * spacingINV) - floor(start * spacingINV)) * lineWidth;
        coverage -= min(lineWidth, mod(start, spacing));
        coverage -= max(lineWidth - mod(end, spacing), 0.0);

        return coverage / txlSize;
      }
    `),e.draped||l.code.add(o`const int maxSamples = 5;
float sample(float p) {
vec2 dxdy = abs(vec2(dFdx(p), dFdy(p)));
float fwidth = dxdy.x + dxdy.y;
ivec2 samples = 1 + ivec2(clamp(dxdy, 0.0, float(maxSamples - 1)));
vec2 invSamples = 1.0 / vec2(samples);
float accumulator = 0.0;
for (int j = 0; j < maxSamples; j++) {
if(j >= samples.y) {
break;
}
for (int i = 0; i < maxSamples; i++) {
if(i >= samples.x) {
break;
}
vec2 step = vec2(i,j) * invSamples - 0.5;
accumulator += coverage(p + step.x * dxdy.x + step.y * dxdy.y, fwidth);
}
}
accumulator /= float(samples.x * samples.y);
return accumulator;
}`)),l.uniforms.add(new V("uColor",d=>d.color)),l.code.add(o`
    void main() {
      discardBySlice(vpos);
      ${n?"terrainDepthTest(gl_FragCoord, depth);":""}
      vec4 color = ${e.hasVertexColors?"vColor * uColor;":"uColor;"}
      color = highlightSlice(color, vpos);

      ${e.output!==a.Highlight?o`color.a *= ${N(e)};`:""}

      ${e.output===a.ObjectAndLayerIdColor?o`color.a = 1.0;`:""}

      if (color.a < ${o.float(T)}) {
        discard;
      }

      ${e.output===a.Alpha?o`gl_FragColor = vec4(color.a);`:""}

      ${e.output===a.Color?o`gl_FragColor = color; ${e.transparencyPassType===R.Color?"gl_FragColor = premultiplyAlpha(gl_FragColor);":""}`:""}
      ${e.output===a.Highlight?o`outputHighlight();`:""}
      ${e.output===a.Depth?o`outputDepth(linearDepth);`:""};
    }
  `),t}function N(e){function t(n){return e.draped?o`coverage(vuv.${n}, texelSize)`:o`sample(vuv.${n})`}switch(e.style){case r.ForwardDiagonal:case r.Horizontal:return t("y");case r.BackwardDiagonal:case r.Vertical:return t("x");case r.DiagonalCross:case r.Cross:return o`
        1.0 - (1.0 - ${t("x")}) * (1.0 - ${t("y")})
      `;default:return"0.0"}}const K=Object.freeze(Object.defineProperty({__proto__:null,build:A},Symbol.toStringTag,{value:"Module"}));export{K as T,r as a,A as x};
