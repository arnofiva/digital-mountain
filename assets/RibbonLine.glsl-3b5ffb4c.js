import{l as P}from"./typedArrayUtil-70e1d79e.js";import{t as E,n as O}from"./ForwardLinearDepth.glsl-3606f02d.js";import{h as l}from"./Matrix3PassUniform-285be0f9.js";import{u as T}from"./Slice.glsl-e5fdd8d3.js";import{d as F}from"./ObjectAndLayerIdColor.glsl-751e40ac.js";import{b as j,i as W,p as z}from"./MarkerSizing.glsl-1e815ddd.js";import{o as $}from"./OutputDepth.glsl-ccbc6366.js";import{a as N,g as V}from"./LineStipple.glsl-df787c01.js";import{n as I}from"./MultipassTerrainTest.glsl-029ffa3f.js";import{t as U}from"./PiUtils.glsl-9dc0973a.js";import{t as D}from"./AlphaCutoff-96178e0d.js";import{o as x,e as _}from"./TransparencyPassType-a1cb0602.js";import{v as R,e as M}from"./View.glsl-725bf3cf.js";import{e as k}from"./Texture2DPassUniform-1510cbb0.js";import{e as S}from"./Float4PassUniform-52993952.js";import{o as v}from"./FloatPassUniform-8a52db3d.js";import{o as B,a as t}from"./ShaderBuilder-c7fc4a30.js";import{O as m}from"./VertexAttribute-15d1866a.js";import{e as o}from"./JSONSupport-32b5ad86.js";import{r as i}from"./ShaderTechniqueConfiguration-5b4afc58.js";import{s as J}from"./DefaultTechniqueConfiguration-d3c0bf46.js";var f;(function(e){e[e.BUTT=0]="BUTT",e[e.SQUARE=1]="SQUARE",e[e.ROUND=2]="ROUND",e[e.COUNT=3]="COUNT"})(f||(f={}));class r extends J{constructor(){super(...arguments),this.output=l.Color,this.capType=f.BUTT,this.transparencyPassType=x.NONE,this.occluder=!1,this.hasSlicePlane=!1,this.hasPolygonOffset=!1,this.writeDepth=!1,this.draped=!1,this.stippleEnabled=!1,this.stippleOffColorEnabled=!1,this.stippleScaleWithLineWidth=!1,this.stipplePreferContinuous=!0,this.roundJoins=!1,this.applyMarkerOffset=!1,this.vvSize=!1,this.vvColor=!1,this.vvOpacity=!1,this.falloffEnabled=!1,this.innerColorEnabled=!1,this.hasOccludees=!1,this.hasMultipassTerrain=!1,this.cullAboveGround=!1,this.wireframe=!1,this.objectAndLayerIdColorInstanced=!1}}o([i({count:l.COUNT})],r.prototype,"output",void 0),o([i({count:f.COUNT})],r.prototype,"capType",void 0),o([i({count:x.COUNT})],r.prototype,"transparencyPassType",void 0),o([i()],r.prototype,"occluder",void 0),o([i()],r.prototype,"hasSlicePlane",void 0),o([i()],r.prototype,"hasPolygonOffset",void 0),o([i()],r.prototype,"writeDepth",void 0),o([i()],r.prototype,"draped",void 0),o([i()],r.prototype,"stippleEnabled",void 0),o([i()],r.prototype,"stippleOffColorEnabled",void 0),o([i()],r.prototype,"stippleScaleWithLineWidth",void 0),o([i()],r.prototype,"stipplePreferContinuous",void 0),o([i()],r.prototype,"roundJoins",void 0),o([i()],r.prototype,"applyMarkerOffset",void 0),o([i()],r.prototype,"vvSize",void 0),o([i()],r.prototype,"vvColor",void 0),o([i()],r.prototype,"vvOpacity",void 0),o([i()],r.prototype,"falloffEnabled",void 0),o([i()],r.prototype,"innerColorEnabled",void 0),o([i()],r.prototype,"hasOccludees",void 0),o([i()],r.prototype,"hasMultipassTerrain",void 0),o([i()],r.prototype,"cullAboveGround",void 0),o([i()],r.prototype,"wireframe",void 0),o([i({constValue:!0})],r.prototype,"stippleRequiresClamp",void 0),o([i({constValue:!0})],r.prototype,"stippleRequiresStretchMeasure",void 0),o([i({constValue:!0})],r.prototype,"hasVvInstancing",void 0),o([i({constValue:!0})],r.prototype,"hasSliceTranslatedView",void 0),o([i()],r.prototype,"objectAndLayerIdColorInstanced",void 0);const y=1;function H(e){const n=new B,{vertex:a,fragment:p}=n,h=e.hasMultipassTerrain&&(e.output===l.Color||e.output===l.Alpha);n.include(U),n.include(j,e),n.include(N,e);const L=e.applyMarkerOffset&&!e.draped;L&&(a.uniforms.add(new v("markerScale",s=>s.markerScale)),n.include(W,{space:z.World})),e.output===l.Depth&&n.include($,e),n.include(F,e),R(a,e),a.uniforms.add([new M("inverseProjectionMatrix",(s,d)=>d.camera.inverseProjectionMatrix),new k("nearFar",(s,d)=>d.camera.nearFar),new v("miterLimit",s=>s.join!=="miter"?0:s.miterLimit),new S("viewport",(s,d)=>d.camera.fullViewport)]),a.constants.add("LARGE_HALF_FLOAT","float",65500),n.attributes.add(m.POSITION,"vec3"),n.attributes.add(m.SUBDIVISIONFACTOR,"float"),n.attributes.add(m.UV0,"vec2"),n.attributes.add(m.AUXPOS1,"vec3"),n.attributes.add(m.AUXPOS2,"vec3"),n.varyings.add("vColor","vec4"),n.varyings.add("vpos","vec3"),E(n),h&&n.varyings.add("depth","float");const c=e.capType===f.ROUND,b=e.stippleEnabled&&e.stippleScaleWithLineWidth||c;b&&n.varyings.add("vLineWidth","float");const C=e.stippleEnabled&&e.stippleScaleWithLineWidth;C&&n.varyings.add("vLineSizeInv","float");const u=e.innerColorEnabled||c;u&&n.varyings.add("vLineDistance","float");const w=e.stippleEnabled&&c,g=e.falloffEnabled||w;g&&n.varyings.add("vLineDistanceNorm","float"),c&&(n.varyings.add("vSegmentSDF","float"),n.varyings.add("vReverseSegmentSDF","float")),a.code.add(t`#define PERPENDICULAR(v) vec2(v.y, -v.x);
float interp(float ncp, vec4 a, vec4 b) {
return (-ncp - a.z) / (b.z - a.z);
}
vec2 rotate(vec2 v, float a) {
float s = sin(a);
float c = cos(a);
mat2 m = mat2(c, -s, s, c);
return m * v;
}`),a.code.add(t`vec4 projectAndScale(vec4 pos) {
vec4 posNdc = proj * pos;
posNdc.xy *= viewport.zw / posNdc.w;
return posNdc;
}`),O(n),a.code.add(t`
    void clipAndTransform(inout vec4 pos, inout vec4 prev, inout vec4 next, in bool isStartVertex) {
      float vnp = nearFar[0] * 0.99;

      if(pos.z > -nearFar[0]) {
        //current pos behind ncp --> we need to clip
        if (!isStartVertex) {
          if(prev.z < -nearFar[0]) {
            //previous in front of ncp
            pos = mix(prev, pos, interp(vnp, prev, pos));
            next = pos;
          } else {
            pos = vec4(0.0, 0.0, 0.0, 1.0);
          }
        } else {
          if(next.z < -nearFar[0]) {
            //next in front of ncp
            pos = mix(pos, next, interp(vnp, pos, next));
            prev = pos;
          } else {
            pos = vec4(0.0, 0.0, 0.0, 1.0);
          }
        }
      } else {
        //current position visible
        if (prev.z > -nearFar[0]) {
          //previous behind ncp
          prev = mix(pos, prev, interp(vnp, pos, prev));
        }
        if (next.z > -nearFar[0]) {
          //next behind ncp
          next = mix(next, pos, interp(vnp, next, pos));
        }
      }

      ${h?"depth = pos.z;":""}
      linearDepth = calculateLinearDepth(nearFar,pos.z);

      pos = projectAndScale(pos);
      next = projectAndScale(next);
      prev = projectAndScale(prev);
    }
  `),a.uniforms.add(new v("pixelRatio",(s,d)=>d.camera.pixelRatio)),a.code.add(t`
  void main(void) {
    // unpack values from uv0.y
    bool isStartVertex = abs(abs(uv0.y)-3.0) == 1.0;

    float coverage = 1.0;

    // Check for special value of uv0.y which is used by the Renderer when graphics
    // are removed before the VBO is recompacted. If this is the case, then we just
    // project outside of clip space.
    if (uv0.y == 0.0) {
      // Project out of clip space
      gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
    }
    else {
      bool isJoin = abs(uv0.y) < 3.0;

      float lineSize = getSize();
      float lineWidth = lineSize * pixelRatio;

      ${b?t`vLineWidth = lineWidth;`:""}
      ${C?t`vLineSizeInv = 1.0 / lineSize;`:""}

      // convert sub-pixel coverage to alpha
      if (lineWidth < 1.0) {
        coverage = lineWidth;
        lineWidth = 1.0;
      }else{
        // Ribbon lines cannot properly render non-integer sizes. Round width to integer size if
        // larger than one for better quality. Note that we do render < 1 pixels more or less correctly
        // so we only really care to round anything larger than 1.
        lineWidth = floor(lineWidth + 0.5);
      }

      vec4 pos  = view * vec4(position.xyz, 1.0);
      vec4 prev = view * vec4(auxpos1.xyz, 1.0);
      vec4 next = view * vec4(auxpos2.xyz, 1.0);
  `),L&&a.code.add(t`vec4 other = isStartVertex ? next : prev;
bool markersHidden = areWorldMarkersHidden(pos, other);
if(!isJoin && !markersHidden) {
pos.xyz += normalize(other.xyz - pos.xyz) * getWorldMarkerSize(pos) * 0.5;
}`),a.code.add(t`clipAndTransform(pos, prev, next, isStartVertex);
vec2 left = (pos.xy - prev.xy);
vec2 right = (next.xy - pos.xy);
float leftLen = length(left);
float rightLen = length(right);`),(e.stippleEnabled||c)&&a.code.add(t`
      float isEndVertex = float(!isStartVertex);
      vec2 segmentOrigin = mix(pos.xy, prev.xy, isEndVertex);
      vec2 segment = mix(right, left, isEndVertex);
      ${c?t`vec2 segmentEnd = mix(next.xy, pos.xy, isEndVertex);`:""}
    `),a.code.add(t`left = (leftLen > 0.001) ? left/leftLen : vec2(0.0, 0.0);
right = (rightLen > 0.001) ? right/rightLen : vec2(0.0, 0.0);
vec2 capDisplacementDir = vec2(0, 0);
vec2 joinDisplacementDir = vec2(0, 0);
float displacementLen = lineWidth;
if (isJoin) {
bool isOutside = (left.x * right.y - left.y * right.x) * uv0.y > 0.0;
joinDisplacementDir = normalize(left + right);
joinDisplacementDir = PERPENDICULAR(joinDisplacementDir);
if (leftLen > 0.001 && rightLen > 0.001) {
float nDotSeg = dot(joinDisplacementDir, left);
displacementLen /= length(nDotSeg * left - joinDisplacementDir);
if (!isOutside) {
displacementLen = min(displacementLen, min(leftLen, rightLen)/abs(nDotSeg));
}
}
if (isOutside && (displacementLen > miterLimit * lineWidth)) {`),e.roundJoins?a.code.add(t`
        vec2 startDir = leftLen < 0.001 ? right : left;
        startDir = PERPENDICULAR(startDir);

        vec2 endDir = rightLen < 0.001 ? left : right;
        endDir = PERPENDICULAR(endDir);

        float factor = ${e.stippleEnabled?t`min(1.0, subdivisionFactor * ${t.float((y+2)/(y+1))})`:t`subdivisionFactor`};

        float rotationAngle = acos(clamp(dot(startDir, endDir), -1.0, 1.0));
        joinDisplacementDir = rotate(startDir, -sign(uv0.y) * factor * rotationAngle);
      `):a.code.add(t`if (leftLen < 0.001) {
joinDisplacementDir = right;
}
else if (rightLen < 0.001) {
joinDisplacementDir = left;
}
else {
joinDisplacementDir = (isStartVertex || subdivisionFactor > 0.0) ? right : left;
}
joinDisplacementDir = PERPENDICULAR(joinDisplacementDir);`);const A=e.capType!==f.BUTT;return a.code.add(t`
        displacementLen = lineWidth;
      }
    } else {
      // CAP handling ---------------------------------------------------
      joinDisplacementDir = isStartVertex ? right : left;
      joinDisplacementDir = PERPENDICULAR(joinDisplacementDir);

      ${A?t`capDisplacementDir = isStartVertex ? -right : left;`:""}
    }
  `),a.code.add(t`
    // Displacement (in pixels) caused by join/or cap
    vec2 dpos = joinDisplacementDir * sign(uv0.y) * displacementLen + capDisplacementDir * displacementLen;

    ${g||u?t`float lineDistNorm = sign(uv0.y) * pos.w;`:""}

    ${u?t`vLineDistance = lineWidth * lineDistNorm;`:""}
    ${g?t`vLineDistanceNorm = lineDistNorm;`:""}

    pos.xy += dpos;
  `),c&&a.code.add(t`vec2 segmentDir = normalize(segment);
vSegmentSDF = (isJoin && isStartVertex) ? LARGE_HALF_FLOAT : (dot(pos.xy - segmentOrigin, segmentDir) * pos.w) ;
vReverseSegmentSDF = (isJoin && !isStartVertex) ? LARGE_HALF_FLOAT : (dot(pos.xy - segmentEnd, -segmentDir) * pos.w);`),e.stippleEnabled&&(e.draped?a.uniforms.add(new v("worldToScreenRatio",(s,d)=>1/d.screenToPCSRatio)):a.code.add(t`vec3 segmentCenter = mix((auxpos2 + position) * 0.5, (position + auxpos1) * 0.5, isEndVertex);
float worldToScreenRatio = computeWorldToScreenRatio(segmentCenter);`),a.code.add(t`float segmentLengthScreenDouble = length(segment);
float segmentLengthScreen = segmentLengthScreenDouble * 0.5;
float discreteWorldToScreenRatio = discretizeWorldToScreenRatio(worldToScreenRatio);
float segmentLengthRender = length(mix(auxpos2 - position, position - auxpos1, isEndVertex));
vStipplePatternStretch = worldToScreenRatio / discreteWorldToScreenRatio;`),e.draped?a.code.add(t`float segmentLengthPseudoScreen = segmentLengthScreen / pixelRatio * discreteWorldToScreenRatio / worldToScreenRatio;
float startPseudoScreen = uv0.x * discreteWorldToScreenRatio - mix(0.0, segmentLengthPseudoScreen, isEndVertex);`):a.code.add(t`float startPseudoScreen = mix(uv0.x, uv0.x - segmentLengthRender, isEndVertex) * discreteWorldToScreenRatio;
float segmentLengthPseudoScreen = segmentLengthRender * discreteWorldToScreenRatio;`),a.uniforms.add(new v("stipplePatternPixelSize",s=>V(s))),a.code.add(t`
      float patternLength = ${e.stippleScaleWithLineWidth?"lineSize * ":""} stipplePatternPixelSize;

      // Compute the coordinates at both start and end of the line segment, because we need both to clamp to in the fragment shader
      vStippleDistanceLimits = computeStippleDistanceLimits(startPseudoScreen, segmentLengthPseudoScreen, segmentLengthScreen, patternLength);

      vStippleDistance = mix(vStippleDistanceLimits.x, vStippleDistanceLimits.y, isEndVertex);

      // Adjust the coordinate to the displaced position (the pattern is shortened/overextended on the in/outside of joins)
      if (segmentLengthScreenDouble >= 0.001) {
        // Project the actual vertex position onto the line segment. Note that the resulting factor is within [0..1] at the
        // original vertex positions, and slightly outside of that range at the displaced positions
        vec2 stippleDisplacement = pos.xy - segmentOrigin;
        float stippleDisplacementFactor = dot(segment, stippleDisplacement) / (segmentLengthScreenDouble * segmentLengthScreenDouble);

        // Apply this offset to the actual vertex coordinate (can be screen or pseudo-screen space)
        vStippleDistance += (stippleDisplacementFactor - isEndVertex) * (vStippleDistanceLimits.y - vStippleDistanceLimits.x);
      }

      // Cancel out perspective correct interpolation because we want this length the really represent the screen distance
      vStippleDistanceLimits *= pos.w;
      vStippleDistance *= pos.w;

      // Disable stipple distance limits on caps
      vStippleDistanceLimits = isJoin ?
                                 vStippleDistanceLimits :
                                 isStartVertex ?
                                  vec2(-1e038, vStippleDistanceLimits.y) :
                                  vec2(vStippleDistanceLimits.x, 1e038);
    `)),a.code.add(t`
      // Convert back into NDC
      pos.xy = (pos.xy / viewport.zw) * pos.w;

      vColor = getColor();
      vColor.a *= coverage;

      ${e.wireframe&&!e.draped?"pos.z -= 0.001 * pos.w;":""}

      // transform final position to camera space for slicing
      vpos = (inverseProjectionMatrix * pos).xyz;
      gl_Position = pos;
      forwardObjectAndLayerIdColor();
    }
  }
  `),h&&n.include(I,e),n.include(T,e),p.include(_),p.code.add(t`
  void main() {
    discardBySlice(vpos);
    ${h?"terrainDepthTest(gl_FragCoord, depth);":""}
  `),e.wireframe?p.code.add(t`vec4 finalColor = vec4(1.0, 0.0, 1.0, 1.0);`):(c&&p.code.add(t`
      float sdf = min(vSegmentSDF, vReverseSegmentSDF);
      vec2 fragmentPosition = vec2(
        min(sdf, 0.0),
        vLineDistance
      ) * gl_FragCoord.w;

      float fragmentRadius = length(fragmentPosition);
      float fragmentCapSDF = (fragmentRadius - vLineWidth) * 0.5; // Divide by 2 to transform from double pixel scale
      float capCoverage = clamp(0.5 - fragmentCapSDF, 0.0, 1.0);

      if (capCoverage < ${t.float(D)}) {
        discard;
      }
    `),w?p.code.add(t`
      vec2 stipplePosition = vec2(
        min(getStippleSDF() * 2.0 - 1.0, 0.0),
        vLineDistanceNorm * gl_FragCoord.w
      );
      float stippleRadius = length(stipplePosition * vLineWidth);
      float stippleCapSDF = (stippleRadius - vLineWidth) * 0.5; // Divide by 2 to transform from double pixel scale
      float stippleCoverage = clamp(0.5 - stippleCapSDF, 0.0, 1.0);
      float stippleAlpha = step(${t.float(D)}, stippleCoverage);
      `):p.code.add(t`float stippleAlpha = getStippleAlpha();`),p.uniforms.add(new S("intrinsicColor",s=>s.color)),e.output!==l.ObjectAndLayerIdColor&&p.code.add(t`discardByStippleAlpha(stippleAlpha, stippleAlphaColorDiscard);`),p.code.add(t`vec4 color = intrinsicColor * vColor;`),e.innerColorEnabled&&(p.uniforms.add(new S("innerColor",s=>P(s.innerColor,s.color))),p.uniforms.add(new v("innerWidth",(s,d)=>s.innerWidth*d.camera.pixelRatio)),p.code.add(t`float distToInner = abs(vLineDistance * gl_FragCoord.w) - innerWidth;
float innerAA = clamp(0.5 - distToInner, 0.0, 1.0);
float innerAlpha = innerColor.a + color.a * (1.0 - innerColor.a);
color = mix(color, vec4(innerColor.rgb, innerAlpha), innerAA);`)),p.code.add(t`vec4 finalColor = blendStipple(color, stippleAlpha);`),e.falloffEnabled&&(p.uniforms.add(new v("falloff",s=>s.falloff)),p.code.add(t`finalColor.a *= pow(max(0.0, 1.0 - abs(vLineDistanceNorm * gl_FragCoord.w)), falloff);`))),p.code.add(t`
    ${e.output===l.ObjectAndLayerIdColor?t`finalColor.a = 1.0;`:""}

    if (finalColor.a < ${t.float(D)}) {
      discard;
    }

    ${e.output===l.Alpha?t`gl_FragColor = vec4(finalColor.a);`:""}
    ${e.output===l.Color?t`gl_FragColor = highlightSlice(finalColor, vpos);`:""}
    ${e.output===l.Color&&e.transparencyPassType===x.Color?"gl_FragColor = premultiplyAlpha(gl_FragColor);":""}
    ${e.output===l.Highlight?t`gl_FragColor = vec4(1.0);`:""}
    ${e.output===l.Depth?t`outputDepth(linearDepth);`:""}
    ${e.output===l.ObjectAndLayerIdColor?t`outputObjectAndLayerIdColor();`:""}
  }
  `),n}const me=Object.freeze(Object.defineProperty({__proto__:null,RIBBONLINE_NUM_ROUND_JOIN_SUBDIVISIONS:y,build:H},Symbol.toStringTag,{value:"Module"}));export{me as A,H as R,y as j,f as r,r as s};
