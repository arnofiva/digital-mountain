import{r as t}from"./vec4f64-6d0e93be.js";import{u as r,a as g,i as d}from"./Texture2DPassUniform-1510cbb0.js";import{a as i}from"./ShaderBuilder-c7fc4a30.js";const l=t(1,1,0,1),h=t(1,0,1,1);function u(o,e){o.fragment.uniforms.add(r("depthTex",(c,a)=>a.highlightDepthTexture,e.hasWebGL2Context?g.None:g.InvSize)),o.fragment.constants.add("occludedHighlightFlag","vec4",l).add("unoccludedHighlightFlag","vec4",h),o.fragment.code.add(i`
    void outputHighlight() {
      vec3 fragCoord = gl_FragCoord.xyz;

      float sceneDepth = ${d(e,"depthTex","fragCoord.xy")}.x;
      if (fragCoord.z > sceneDepth + 5e-7) {
        gl_FragColor = occludedHighlightFlag;
      }
      else {
        gl_FragColor = unoccludedHighlightFlag;
      }
    }
  `)}export{u as a,h as i};
