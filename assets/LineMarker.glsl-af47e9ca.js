import{p as d,b as h,i as u,s as g,t as v,o as S,e as y}from"./MarkerSizing.glsl-1e815ddd.js";import{t as x,n as z}from"./ForwardLinearDepth.glsl-3606f02d.js";import{h as i}from"./Matrix3PassUniform-285be0f9.js";import{u as P}from"./Slice.glsl-e5fdd8d3.js";import{o as w}from"./OutputDepth.glsl-ccbc6366.js";import{n as $}from"./MultipassTerrainTest.glsl-029ffa3f.js";import{t as b}from"./AlphaCutoff-96178e0d.js";import{e as L,o as D}from"./TransparencyPassType-a1cb0602.js";import{a as N}from"./RgbaFloatEncoding.glsl-31b2b966.js";import{v as k,d as M,e as T}from"./View.glsl-725bf3cf.js";import{e as O,f as A}from"./Texture2DPassUniform-1510cbb0.js";import{e as m}from"./Float4PassUniform-52993952.js";import{o as f}from"./FloatPassUniform-8a52db3d.js";import{o as W,a as r}from"./ShaderBuilder-c7fc4a30.js";import{O as l}from"./VertexAttribute-15d1866a.js";function j(e){const o=new W,p=e.hasMultipassTerrain&&(e.output===i.Color||e.output===i.Alpha),n=e.space===d.World;e.hasTip&&n&&o.extensions.add("GL_OES_standard_derivatives"),o.include(h,e),o.include(u,e),e.output===i.Depth&&o.include(w,e);const{vertex:a,fragment:c}=o;return c.include(N),k(a,e),o.attributes.add(l.POSITION,"vec3"),o.attributes.add(l.UV0,"vec2"),o.attributes.add(l.AUXPOS1,"vec3"),o.varyings.add("vColor","vec4"),o.varyings.add("vpos","vec3"),o.varyings.add("vUV","vec2"),o.varyings.add("vSize","float"),x(o),p&&o.varyings.add("depth","float"),e.hasTip&&o.varyings.add("vLineWidth","float"),a.uniforms.add([new O("nearFar",(s,t)=>t.camera.nearFar),new m("viewport",(s,t)=>t.camera.fullViewport)]),a.code.add(r`vec4 projectAndScale(vec4 pos) {
vec4 posNdc = proj * pos;
posNdc.xy *= viewport.zw / posNdc.w;
return posNdc;
}`),a.code.add(r`void clip(vec4 pos, inout vec4 prev) {
float vnp = nearFar[0] * 0.99;
if (prev.z > -nearFar[0]) {
float interpolation = (-vnp - pos.z) / (prev.z - pos.z);
prev = mix(pos, prev, interpolation);
}
}`),n?(o.attributes.add(l.NORMAL,"vec3"),M(a),a.constants.add("tiltThreshold","float",.7),a.code.add(r`vec3 perpendicular(vec3 v) {
vec3 n = (viewNormal * vec4(normal.xyz, 1.0)).xyz;
vec3 n2 = cross(v, n);
vec3 forward = vec3(0.0, 0.0, 1.0);
float tiltDot = dot(forward, n);
return abs(tiltDot) < tiltThreshold ? n : n2;
}`)):a.code.add(r`vec2 perpendicular(vec2 v) {
return vec2(v.y, -v.x);
}`),a.code.add(r`
      #define vecN ${n?"vec3":"vec2"}

      vecN normalizedSegment(vecN pos, vecN prev) {
        vecN segment = pos - prev;
        float segmentLen = length(segment);

        // normalize or zero if too short
        return (segmentLen > 0.001) ? segment / segmentLen : ${n?"vec3(0.0, 0.0, 0.0)":"vec2(0.0, 0.0)"};
      }

      vecN displace(vecN pos, vecN prev, float displacementLen) {
        vecN segment = normalizedSegment(pos, prev);

        vecN displacementDirU = perpendicular(segment);
        vecN displacementDirV = segment;

        ${e.anchor===g.Tip?"pos -= 0.5 * displacementLen * displacementDirV;":""}

        return pos + displacementLen * (uv0.x * displacementDirU + uv0.y * displacementDirV);
      }
    `),e.space===d.Screen&&(a.uniforms.add(new T("inverseProjectionMatrix",(s,t)=>t.camera.inverseProjectionMatrix)),a.code.add(r`vec3 inverseProject(vec4 posScreen) {
posScreen.xy = (posScreen.xy / viewport.zw) * posScreen.w;
return (inverseProjectionMatrix * posScreen).xyz;
}`),a.code.add(r`bool rayIntersectPlane(vec3 rayDir, vec3 planeOrigin, vec3 planeNormal, out vec3 intersection) {
float cos = dot(rayDir, planeNormal);
float t = dot(planeOrigin, planeNormal) / cos;
intersection = t * rayDir;
return abs(cos) > 0.001 && t > 0.0;
}`),a.uniforms.add(new f("perScreenPixelRatio",(s,t)=>t.camera.perScreenPixelRatio)),a.code.add(r`
      vec4 toFront(vec4 displacedPosScreen, vec3 posLeft, vec3 posRight, vec3 prev, float lineWidth) {
        // Project displaced position back to camera space
        vec3 displacedPos = inverseProject(displacedPosScreen);

        // Calculate the plane that we want the marker to lie in. Note that this will always be an approximation since ribbon lines are generally
        // not planar and we do not know the actual position of the displaced prev vertices (they are offset in screen space, too).
        vec3 planeNormal = normalize(cross(posLeft - posRight, posLeft - prev));
        vec3 planeOrigin = posLeft;

        ${e.hasCap?`
                if(prev.z > posLeft.z) {
                  vec2 diff = posLeft.xy - posRight.xy;
                  planeOrigin.xy += perpendicular(diff) / 2.0;
                }
              `:""};

        // Move the plane towards the camera by a margin dependent on the line width (approximated in world space). This tolerance corrects for the
        // non-planarity in most cases, but sharp joins can place the prev vertices at arbitrary positions so markers can still clip.
        float offset = lineWidth * perScreenPixelRatio;
        planeOrigin *= (1.0 - offset);

        // Intersect camera ray with the plane and make sure it is within clip space
        vec3 rayDir = normalize(displacedPos);
        vec3 intersection;
        if (rayIntersectPlane(rayDir, planeOrigin, planeNormal, intersection) && intersection.z < -nearFar[0] && intersection.z > -nearFar[1]) {
          return vec4(intersection.xyz, 1.0);
        }

        // Fallback: use depth of pos or prev, whichever is closer to the camera
        float minDepth = planeOrigin.z > prev.z ? length(planeOrigin) : length(prev);
        displacedPos *= minDepth / length(displacedPos);
        return vec4(displacedPos.xyz, 1.0);
      }
  `)),a.uniforms.add(new f("pixelRatio",(s,t)=>t.camera.pixelRatio)),z(o),a.code.add(r`void main(void) {
if (uv0.y == 0.0) {
gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
}
else {
float lineWidth = getLineWidth();
float screenMarkerSize = getScreenMarkerSize();
vec4 pos  = view * vec4(position.xyz, 1.0);
vec4 prev = view * vec4(auxpos1.xyz, 1.0);
clip(pos, prev);`),n?(e.hideOnShortSegments&&a.code.add(r`if (areWorldMarkersHidden(pos, prev)) {
gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
return;
}`),a.code.add(r`pos.xyz = displace(pos.xyz, prev.xyz, getWorldMarkerSize(pos));
vec4 displacedPosScreen = projectAndScale(pos);`)):(a.code.add(r`vec4 posScreen = projectAndScale(pos);
vec4 prevScreen = projectAndScale(prev);
vec4 displacedPosScreen = posScreen;
displacedPosScreen.xy = displace(posScreen.xy, prevScreen.xy, screenMarkerSize);`),e.space===d.Screen&&a.code.add(r`vec2 displacementDirU = perpendicular(normalizedSegment(posScreen.xy, prevScreen.xy));
vec3 lineRight = inverseProject(posScreen + lineWidth * vec4(displacementDirU.xy, 0.0, 0.0));
vec3 lineLeft = pos.xyz + (pos.xyz - lineRight);
pos = toFront(displacedPosScreen, lineLeft, lineRight, prev.xyz, lineWidth);
displacedPosScreen = projectAndScale(pos);`)),a.code.add(r`
        ${p?"depth = pos.z;":""}
        linearDepth = calculateLinearDepth(nearFar,pos.z);

        // Convert back into NDC
        displacedPosScreen.xy = (displacedPosScreen.xy / viewport.zw) * displacedPosScreen.w;

        // Convert texture coordinate into [0,1]
        vUV = (uv0 + 1.0) / 2.0;

        ${n?"":"vUV *= displacedPosScreen.w;"}

        ${e.hasTip?"vLineWidth = lineWidth;":""}

        vSize = screenMarkerSize;
        vColor = getColor();

        // Use camera space for slicing
        vpos = pos.xyz;

        gl_Position = displacedPosScreen;
      }
    }
  `),p&&o.include($,e),o.include(P,e),c.uniforms.add([new m("intrinsicColor",s=>s.color),new A("tex",s=>s.texture)]),c.include(L),o.constants.add("texelSize","float",1/v),c.code.add(r`float markerAlpha(vec2 samplePos) {
samplePos += vec2(0.5, -0.5) * texelSize;
float sdf = rgba2float(texture2D(tex, samplePos)) - 0.5;
float distance = sdf * vSize;
distance -= 0.5;
return clamp(0.5 - distance, 0.0, 1.0);
}`),e.hasTip&&(o.constants.add("relativeMarkerSize","float",S/v),o.constants.add("relativeTipLineWidth","float",y),c.code.add(r`
    float tipAlpha(vec2 samplePos) {
      // Convert coordinates s.t. they are in pixels and relative to the tip of an arrow marker
      samplePos -= vec2(0.5, 0.5 + 0.5 * relativeMarkerSize);
      samplePos *= vSize;

      float halfMarkerSize = 0.5 * relativeMarkerSize * vSize;
      float halfTipLineWidth = 0.5 * max(1.0, relativeTipLineWidth * vLineWidth);

      ${n?"halfTipLineWidth *= fwidth(samplePos.y);":""}

      float distance = max(abs(samplePos.x) - halfMarkerSize, abs(samplePos.y) - halfTipLineWidth);
      return clamp(0.5 - distance, 0.0, 1.0);
    }
  `)),o.constants.add("symbolAlphaCutoff","float",b),c.code.add(r`
  void main() {
    discardBySlice(vpos);
    ${p?"terrainDepthTest(gl_FragCoord, depth);":""}

    vec4 finalColor = intrinsicColor * vColor;

    ${n?"vec2 samplePos = vUV;":"vec2 samplePos = vUV * gl_FragCoord.w;"}

    ${e.hasTip?"finalColor.a *= max(markerAlpha(samplePos), tipAlpha(samplePos));":"finalColor.a *= markerAlpha(samplePos);"}

    ${e.output===i.ObjectAndLayerIdColor?r`finalColor.a = 1.0;`:""}

    if (finalColor.a < symbolAlphaCutoff) {
      discard;
    }

    ${e.output===i.Alpha?r`gl_FragColor = vec4(finalColor.a);`:""}
    ${e.output===i.Color?r`gl_FragColor = highlightSlice(finalColor, vpos);`:""}
    ${e.output===i.Color&&e.transparencyPassType===D.Color?"gl_FragColor = premultiplyAlpha(gl_FragColor);":""}
    ${e.output===i.Highlight?r`gl_FragColor = vec4(1.0);`:""}
    ${e.output===i.Depth?r`outputDepth(linearDepth);`:""}
  }
  `),o}const Q=Object.freeze(Object.defineProperty({__proto__:null,build:j},Symbol.toStringTag,{value:"Module"}));export{j as C,Q as M};
