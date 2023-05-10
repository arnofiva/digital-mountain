import{r as g}from"./typedArrayUtil-ce39e5f4.js";import{r as s}from"./vec2-8acac370.js";import{n as S}from"./vec2f64-f35767d6.js";import{l as h}from"./vec4f64-6d0e93be.js";import{u}from"./Slice.glsl-7975394d.js";import{c as v,u as m,b as x}from"./HUD.glsl-79bd614f.js";import{i as b}from"./VerticalOffset.glsl-5354e013.js";import{e as l}from"./Texture2DPassUniform-70e1e126.js";import{e as d}from"./Float4PassUniform-7f3c3ce8.js";import{o as c}from"./FloatPassUniform-e3702139.js";import{o as z,a as r}from"./ShaderBuilder-7bfc11d2.js";import{O as w}from"./VertexAttribute-15d1866a.js";function A(e){const t=new z;t.include(v),t.include(m,e),t.include(u,e),t.attributes.add(w.UV0,"vec2");const{vertex:n,fragment:a}=t;return n.uniforms.add([new d("viewport",(i,o)=>o.camera.fullViewport),new c("lineSize",(i,o)=>Math.ceil(i.size)*o.camera.pixelRatio),new l("pixelToNDC",(i,o)=>s(f,2/o.camera.fullViewport[2],2/o.camera.fullViewport[3])),new c("borderSize",(i,o)=>g(i.borderColor)?o.camera.pixelRatio:0),new l("screenOffset",(i,o)=>s(f,i.screenOffset[0]*o.camera.pixelRatio,i.screenOffset[1]*o.camera.pixelRatio))]),t.varyings.add("coverageSampling","vec4"),t.varyings.add("lineSizes","vec2"),e.hasMultipassGeometry&&t.varyings.add("depth","float"),e.hasScreenSizePerspective&&b(n),n.code.add(r`
    void main(void) {
      ProjectHUDAux projectAux;
      vec4 endPoint = projectPositionHUD(projectAux);

      vec3 vpos = projectAux.posModel;
      if (rejectBySlice(vpos)) {
        gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
        return;
      }
    ${e.occlusionTestEnabled?r`
      if (!testVisibilityHUD(endPoint)) {
        gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
        return;
      }`:""}

    ${e.hasScreenSizePerspective?r`
      vec4 perspectiveFactor = screenSizePerspectiveScaleFactor(projectAux.absCosAngle, projectAux.distanceToCamera, screenSizePerspectiveAlignment);
      vec2 screenOffsetScaled = applyScreenSizePerspectiveScaleFactorVec2(screenOffset, perspectiveFactor);
        `:r`
      vec2 screenOffsetScaled = screenOffset;
        `}
      // Add view dependent polygon offset to get exact same original starting point. This is mostly
      // used to get the correct depth value
      vec3 posView = (view * vec4(position, 1.0)).xyz;
      ${e.hasMultipassGeometry?"depth = posView.z;":""}

      applyHUDViewDependentPolygonOffset(auxpos1.w, projectAux.absCosAngle, posView);
      vec4 startPoint = proj * vec4(posView, 1.0);
      // Apply screen offset to both start and end point
      vec2 screenOffsetNorm = screenOffsetScaled * 2.0 / viewport.zw;
      startPoint.xy += screenOffsetNorm * startPoint.w;
      endPoint.xy += screenOffsetNorm * endPoint.w;
      // Align start and end to pixel origin
      vec4 startAligned = alignToPixelOrigin(startPoint, viewport.zw);
      vec4 endAligned = alignToPixelOrigin(endPoint, viewport.zw);
    ${e.depthHudEnabled?e.depthHudAlignStartEnabled?r`endAligned = vec4(endAligned.xy / endAligned.w * startAligned.w, startAligned.zw);`:r`startAligned = vec4(startAligned.xy / startAligned.w * endAligned.w, endAligned.zw);`:""}
      vec4 projectedPosition = mix(startAligned, endAligned, uv0.y);
      // The direction of the line in screen space
      vec2 screenSpaceDirection = normalize(endAligned.xy / endAligned.w - startAligned.xy / startAligned.w);
      vec2 perpendicularScreenSpaceDirection = vec2(screenSpaceDirection.y, -screenSpaceDirection.x);
    ${e.hasScreenSizePerspective?r`
      float lineSizeScaled = applyScreenSizePerspectiveScaleFactorFloat(lineSize, perspectiveFactor);
      float borderSizeScaled = applyScreenSizePerspectiveScaleFactorFloat(borderSize, perspectiveFactor);
        `:r`
      float lineSizeScaled = lineSize;
      float borderSizeScaled = borderSize;
        `}
      float halfPixelSize = lineSizeScaled * 0.5;
      // Calculate a pixel offset from the edge of the pixel, s.t. we keep the line aligned
      // to pixels if it has a full pixel size. Since pixel aligned biases to the bottom-left,
      // we bias the size to the right (for odd sizes) to balance out the bias. Grow sub-pixel
      // sizes towards the left or right s.t. there is a smooth transition (e.g. from 2 to 3 px).
      float halfWholePixelSize = floor(lineSizeScaled) * 0.5;
      float halfPixelSizeInt = floor(halfWholePixelSize);

      // Sub-pixel offset if we need to grow sub-pixels to the left
      float subpixelOffset = -fract(lineSizeScaled) * float(halfWholePixelSize > 0.0);

      // Pixel offset aligning to whole pixels and adding subpixel offset if needed
      float pixelOffset = -halfPixelSizeInt + subpixelOffset;

      // Compute full ndc offset, adding 1px padding for doing anti-aliasing and the border size
      float padding = 1.0 + borderSizeScaled;
      vec2 ndcOffset = (pixelOffset - padding + uv0.x * (lineSizeScaled + padding + padding)) * pixelToNDC;

      // Offset x/y from the center of the line in screen space
      projectedPosition.xy += perpendicularScreenSpaceDirection * ndcOffset * projectedPosition.w;

      // Compute a coverage varying which we can use in the fragment shader to determine
      // how much a pixel is actually covered by the line (i.e. to anti alias the line).
      // This works by computing two coordinates that can be linearly interpolated and then
      // subtracted to find out how far away from the line edge we are.
      float edgeDirection = (uv0.x * 2.0 - 1.0);

      float halfBorderSize = 0.5 * borderSizeScaled;
      float halfPixelSizeAndBorder = halfPixelSize + halfBorderSize;
      float outerEdgeCoverageSampler = edgeDirection * (halfPixelSizeAndBorder + halfBorderSize + 1.0);

      float isOneSided = float(lineSizeScaled < 2.0 && borderSize < 2.0);

      coverageSampling = vec4(
        // Edge coordinate
        outerEdgeCoverageSampler,

        // Border edge coordinate
        outerEdgeCoverageSampler - halfPixelSizeAndBorder * isOneSided,

        // Line offset
        halfPixelSize - 0.5,

        // Border offset
        halfBorderSize - 0.5 + halfPixelSizeAndBorder * (1.0 - isOneSided)
      );

      lineSizes = vec2(lineSizeScaled, borderSizeScaled);

      gl_Position = projectedPosition;
    }
  `),a.uniforms.add([new d("uColor",i=>p(i.color)),new d("borderColor",i=>p(i.borderColor))]),e.hasMultipassGeometry&&(a.include(x,e),a.uniforms.add(new l("inverseViewport",(i,o)=>o.inverseViewport))),a.code.add(r`
    void main() {
      ${e.hasMultipassGeometry?"if( geometryDepthTest(gl_FragCoord.xy * inverseViewport, depth) ){ discard; }":""}

      // Mix between line and border coverage offsets depending on whether we need
      // a border (based on the sidedness).
      vec2 coverage = min(1.0 - clamp(abs(coverageSampling.xy) - coverageSampling.zw, 0.0, 1.0), lineSizes);

      // Mix between border and line color based on the line coverage (conceptually the line
      // blends on top of the border background).
      //
      // Anti-alias by blending final result using the full (including optional border) coverage
      // and the color alpha
      float borderAlpha = uColor.a * borderColor.a * coverage.y;
      float colorAlpha = uColor.a * coverage.x;

      float finalAlpha = mix(borderAlpha, 1.0, colorAlpha);

    ${e.depthHudEnabled?r`
      if (finalAlpha < 0.01) {
        discard;
      }
      `:r`
      vec3 finalRgb = mix(borderColor.rgb * borderAlpha, uColor.rgb, colorAlpha);
      gl_FragColor = vec4(finalRgb, finalAlpha);
      `}
  }
  `),t}function p(e){return g(e)?e:h}const f=S(),E=Object.freeze(Object.defineProperty({__proto__:null,build:A},Symbol.toStringTag,{value:"Module"}));export{A as S,E as u};
