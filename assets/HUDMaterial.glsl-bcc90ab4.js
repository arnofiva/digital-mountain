import{r as g}from"./typedArrayUtil-70e1d79e.js";import{r as x,a as F}from"./vec2-8acac370.js";import{i as D,n as A}from"./vec2f64-f35767d6.js";import{l as O}from"./vec4f64-6d0e93be.js";import{e as _}from"./sdfPrimitives-16d07d48.js";import{h as c}from"./Matrix3PassUniform-285be0f9.js";import{u as T}from"./Slice.glsl-e5fdd8d3.js";import{d as $}from"./ObjectAndLayerIdColor.glsl-751e40ac.js";import{b as B,c as H,u as E}from"./HUD.glsl-03dc2889.js";import{a as L}from"./ReadLinearDepth.glsl-9abddde9.js";import{a as S}from"./RgbaFloatEncoding.glsl-31b2b966.js";import{u as M,a as h,e as v,i as V,f as I}from"./Texture2DPassUniform-1510cbb0.js";import{a as t,o as R}from"./ShaderBuilder-c7fc4a30.js";import{a as U}from"./OutputHighlight.glsl-569dde3f.js";import{s as k}from"./VisualVariables.glsl-655a358f.js";import{t as m,o as C}from"./AlphaCutoff-96178e0d.js";import{e as G,o as q}from"./TransparencyPassType-a1cb0602.js";import{c as W,t as J,i as K}from"./VerticalOffset.glsl-2b654767.js";import{e as u}from"./Float4PassUniform-52993952.js";import{J as N,K as b,z as X}from"./VisualVariablePassParameters-ded3d86d.js";import{o as P}from"./FloatPassUniform-8a52db3d.js";import{O as p}from"./VertexAttribute-15d1866a.js";function Z(e,o){const{vertex:a,fragment:r}=e;o.hasMultipassGeometry&&a.include(B),o.hasMultipassTerrain&&e.varyings.add("depth","float"),a.code.add(t`
  void main(void) {
    vec4 posProjCenter;
    if (dot(position, position) > 0.0) {
      // Render single point to center of the pixel to avoid subpixel
      // filtering to affect the marker color
      ProjectHUDAux projectAux;
      vec4 posProj = projectPositionHUD(projectAux);
      posProjCenter = alignToPixelCenter(posProj, viewport.zw);

      ${o.hasMultipassGeometry?t`
        // Don't draw vertices behind geometry
        if(geometryDepthTest(.5 + .5 * posProjCenter.xy / posProjCenter.w, projectAux.posView.z)){
          posProjCenter = vec4(1e038, 1e038, 1e038, 1.0);
        }`:""}

      ${o.hasMultipassTerrain?"depth = projectAux.posView.z;":""}
      vec3 vpos = projectAux.posModel;
      if (rejectBySlice(vpos)) {
        // Project out of clip space
        posProjCenter = vec4(1e038, 1e038, 1e038, 1.0);
      }

    } else {
      // Project out of clip space
      posProjCenter = vec4(1e038, 1e038, 1e038, 1.0);
    }

    gl_Position = posProjCenter;
    gl_PointSize = 1.0;
  }
  `),o.hasMultipassTerrain&&r.include(L),o.hasMultipassTerrain&&r.uniforms.add([...M("terrainDepthTexture",(l,n)=>n.multipassTerrain.linearDepthTexture,o.hasWebGL2Context?h.None:h.InvSize),new v("nearFar",(l,n)=>n.camera.nearFar)]),r.include(S),r.code.add(t`
  void main() {
    gl_FragColor = vec4(1, 1, 1, 1);
    ${o.hasMultipassTerrain?t`
          vec2 uv = gl_FragCoord.xy;

          // Read the rgba data from the texture linear depth
          vec4 terrainDepthData = ${V(o,"terrainDepthTexture","uv")};

          float terrainDepth = linearDepthFromFloat(rgba2float(terrainDepthData), nearFar);

          // If HUD vertex is behind terrain and the terrain depth is not the initialize value (e.g. we are not looking at the sky)
          // Mark the HUD vertex as occluded by transparent terrain
          if(depth < terrainDepth && terrainDepthData != vec4(0,0,0,1)){
            gl_FragColor.g = 0.5;
          }`:""}
  }
  `)}function Q(e){const o=new R,a=e.signedDistanceFieldEnabled;if(o.include(H),o.include(E,e),o.include(T,e),e.occlusionPass)return o.include(Z,e),o;const{vertex:r,fragment:l}=o;o.include(W),l.include(S),l.include(G),o.include(k,e),o.include($,e),o.varyings.add("vcolor","vec4"),o.varyings.add("vtc","vec2"),o.varyings.add("vsize","vec2"),e.binaryHighlightOcclusionEnabled&&o.varyings.add("voccluded","float"),r.uniforms.add([new u("viewport",(i,s)=>s.camera.fullViewport),new v("screenOffset",(i,s)=>x(w,2*i.screenOffset[0]*s.camera.pixelRatio,2*i.screenOffset[1]*s.camera.pixelRatio)),new v("anchorPosition",i=>j(i)),new u("materialColor",i=>i.color),new P("pixelRatio",(i,s)=>s.camera.pixelRatio)]),a&&(r.uniforms.add(new u("outlineColor",i=>i.outlineColor)),l.uniforms.add([new u("outlineColor",i=>z(i)?i.outlineColor:O),new P("outlineSize",i=>z(i)?i.outlineSize:0)])),e.hasScreenSizePerspective&&(J(r),K(r)),(e.debugDrawLabelBorder||e.binaryHighlightOcclusionEnabled)&&o.varyings.add("debugBorderCoords","vec4"),o.attributes.add(p.UV0,"vec2"),o.attributes.add(p.COLOR,"vec4"),o.attributes.add(p.SIZE,"vec2"),o.attributes.add(p.AUXPOS2,"vec4"),r.code.add(t`
    void main(void) {
      ProjectHUDAux projectAux;
      vec4 posProj = projectPositionHUD(projectAux);
      forwardObjectAndLayerIdColor();

      if (rejectBySlice(projectAux.posModel)) {
        // Project outside of clip plane
        gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
        return;
      }
      vec2 inputSize;
      ${e.hasScreenSizePerspective?t`
      inputSize = screenSizePerspectiveScaleVec2(size, projectAux.absCosAngle, projectAux.distanceToCamera, screenSizePerspective);
      vec2 screenOffsetScaled = screenSizePerspectiveScaleVec2(screenOffset, projectAux.absCosAngle, projectAux.distanceToCamera, screenSizePerspectiveAlignment);
         `:t`
      inputSize = size;
      vec2 screenOffsetScaled = screenOffset;`}

      ${e.vvSize?"inputSize *= vvScale(auxpos2).xx;":""}

      vec2 combinedSize = inputSize * pixelRatio;
      vec4 quadOffset = vec4(0.0);

      ${e.occlusionTestEnabled||e.binaryHighlightOcclusionEnabled?"bool visible = testVisibilityHUD(posProj);":""}

      ${e.binaryHighlightOcclusionEnabled?"voccluded = visible ? 0.0 : 1.0;":""}
    `);const n=t`vec2 uv01 = floor(uv0);
vec2 uv = uv0 - uv01;
quadOffset.xy = ((uv01 - anchorPosition) * 2.0 * combinedSize + screenOffsetScaled) / viewport.zw * posProj.w;`,y=e.pixelSnappingEnabled?a?t`posProj = alignToPixelOrigin(posProj, viewport.zw) + quadOffset;`:t`posProj += quadOffset;
if (inputSize.x == size.x) {
posProj = alignToPixelOrigin(posProj, viewport.zw);
}`:t`posProj += quadOffset;`;e.vvColor&&r.uniforms.add([new N("vvColorColors",i=>i.vvColorColors,b),new X("vvColorValues",i=>i.vvColorValues,b)]),r.uniforms.add(new v("textureCoordinateScaleFactor",i=>g(i.texture)&&g(i.texture.descriptor.textureCoordinateScaleFactor)?i.texture.descriptor.textureCoordinateScaleFactor:D)),r.code.add(t`
    ${e.occlusionTestEnabled?"if (visible) {":""}
    ${n}
    ${e.vvColor?"vcolor = vvGetColor(auxpos2, vvColorValues, vvColorColors) * materialColor;":"vcolor = color / 255.0 * materialColor;"}

    ${e.output===c.ObjectAndLayerIdColor?t`vcolor.a = 1.0;`:""}

    bool alphaDiscard = vcolor.a < ${t.float(m)};
    ${a?`alphaDiscard = alphaDiscard && outlineColor.a < ${t.float(m)};`:""}
    if (alphaDiscard) {
      // "early discard" if both symbol color (= fill) and outline color (if applicable) are transparent
      gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
      return;
    } else {
      ${y}
      gl_Position = posProj;
    }

    vtc = uv * textureCoordinateScaleFactor;

    ${e.debugDrawLabelBorder?"debugBorderCoords = vec4(uv01, 1.5 / combinedSize);":""}
    vsize = inputSize;
    ${e.occlusionTestEnabled?t`} else { vtc = vec2(0.0);
      ${e.debugDrawLabelBorder?"debugBorderCoords = vec4(0.5, 0.5, 1.5 / combinedSize);}":"}"}`:""}
  }
  `),l.uniforms.add(new I("tex",i=>i.texture));const f=e.debugDrawLabelBorder?t`(isBorder > 0.0 ? 0.0 : ${t.float(C)})`:t.float(C),d=t`
    ${e.debugDrawLabelBorder?t`
      float isBorder = float(any(lessThan(debugBorderCoords.xy, debugBorderCoords.zw)) || any(greaterThan(debugBorderCoords.xy, 1.0 - debugBorderCoords.zw)));`:""}

    ${a?t`
      vec4 fillPixelColor = vcolor;

      // Attempt to sample texel centers to avoid that thin cross outlines
      // disappear with large symbol sizes.
      // see: https://devtopia.esri.com/WebGIS/arcgis-js-api/issues/7058#issuecomment-603041
      const float txSize = ${t.float(_)};
      const float texelSize = 1.0 / txSize;
      // Calculate how much we have to add/subtract to/from each texel to reach the size of an onscreen pixel
      vec2 scaleFactor = (vsize - txSize) * texelSize;
      vec2 samplePos = vtc + (vec2(1.0, -1.0) * texelSize) * scaleFactor;

      // Get distance and map it into [-0.5, 0.5]
      float d = rgba2float(texture2D(tex, samplePos)) - 0.5;

      // Distance in output units (i.e. pixels)
      float dist = d * vsize.x;

      // Create smooth transition from the icon into its outline
      float fillAlphaFactor = clamp(0.5 - dist, 0.0, 1.0);
      fillPixelColor.a *= fillAlphaFactor;

      if (outlineSize > 0.25) {
        vec4 outlinePixelColor = outlineColor;
        float clampedOutlineSize = min(outlineSize, 0.5*vsize.x);

        // Create smooth transition around outline
        float outlineAlphaFactor = clamp(0.5 - (abs(dist) - 0.5*clampedOutlineSize), 0.0, 1.0);
        outlinePixelColor.a *= outlineAlphaFactor;

        if (
          outlineAlphaFactor + fillAlphaFactor < ${f} ||
          fillPixelColor.a + outlinePixelColor.a < ${t.float(m)}
        ) {
          discard;
        }

        // perform un-premultiplied over operator (see https://en.wikipedia.org/wiki/Alpha_compositing#Description)
        float compositeAlpha = outlinePixelColor.a + fillPixelColor.a * (1.0 - outlinePixelColor.a);
        vec3 compositeColor = vec3(outlinePixelColor) * outlinePixelColor.a +
          vec3(fillPixelColor) * fillPixelColor.a * (1.0 - outlinePixelColor.a);

        gl_FragColor = vec4(compositeColor, compositeAlpha);
      } else {
        if (fillAlphaFactor < ${f}) {
          discard;
        }

        gl_FragColor = premultiplyAlpha(fillPixelColor);
      }

      // visualize SDF:
      // gl_FragColor = vec4(clamp(-dist/vsize.x*2.0, 0.0, 1.0), clamp(dist/vsize.x*2.0, 0.0, 1.0), 0.0, 1.0);
      `:t`
          vec4 texColor = texture2D(tex, vtc, -0.5);
          if (texColor.a < ${f}) {
            discard;
          }
          gl_FragColor = texColor * premultiplyAlpha(vcolor);
          `}

    // Draw debug border with transparency, so that original texels along border are still partially visible
    ${e.debugDrawLabelBorder?t`gl_FragColor = mix(gl_FragColor, vec4(1.0, 0.0, 1.0, 1.0), isBorder * 0.5);`:""}
  `;return e.output===c.Alpha&&l.code.add(t`
      void main() {
        ${d}
        gl_FragColor = vec4(gl_FragColor.a);
      }
      `),e.output===c.ObjectAndLayerIdColor&&l.code.add(t`
      void main() {
        ${d}
        outputObjectAndLayerIdColor();
      }
      `),e.output===c.Color&&l.code.add(t`
    void main() {
      ${d}
      ${e.transparencyPassType===q.FrontFace?"gl_FragColor.rgb /= gl_FragColor.a;":""}
    }
    `),e.output===c.Highlight&&(o.include(U,e),l.code.add(t`
    void main() {
      ${d}
      ${e.binaryHighlightOcclusionEnabled?t`
          if (voccluded == 1.0) {
            gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
          } else {
            gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
          }`:"outputHighlight();"}
    }
    `)),o}function z(e){return e.outlineColor[3]>0&&e.outlineSize>0}function j(e,o=w){return e.textureIsSignedDistanceField?Y(e.anchorPosition,e.distanceFieldBoundingBox,o):F(o,e.anchorPosition),o}function Y(e,o,a){g(o)?x(a,e[0]*(o[2]-o[0])+o[0],e[1]*(o[3]-o[1])+o[1]):x(a,0,0)}const w=A(),ze=Object.freeze(Object.defineProperty({__proto__:null,build:Q,calculateAnchorPosForRendering:j},Symbol.toStringTag,{value:"Module"}));export{Q as B,j as H,ze as V};
