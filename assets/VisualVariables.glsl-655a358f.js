import{a as t}from"./View.glsl-725bf3cf.js";import{K as a,z as n,J as l}from"./VisualVariablePassParameters-ded3d86d.js";import{a as r}from"./ShaderBuilder-c7fc4a30.js";import{e as s}from"./Matrix3PassUniform-285be0f9.js";import{O as c}from"./VertexAttribute-15d1866a.js";function z(i,o){o.hasVvInstancing&&(o.vvSize||o.vvColor)&&i.attributes.add(c.INSTANCEFEATUREATTRIBUTE,"vec4");const v=i.vertex;o.vvSize?(v.uniforms.add(new t("vvSizeMinSize",e=>e.vvSizeMinSize)),v.uniforms.add(new t("vvSizeMaxSize",e=>e.vvSizeMaxSize)),v.uniforms.add(new t("vvSizeOffset",e=>e.vvSizeOffset)),v.uniforms.add(new t("vvSizeFactor",e=>e.vvSizeFactor)),v.uniforms.add(new s("vvSymbolRotationMatrix",e=>e.vvSymbolRotationMatrix)),v.uniforms.add(new t("vvSymbolAnchor",e=>e.vvSymbolAnchor)),v.code.add(r`vec3 vvScale(vec4 _featureAttribute) {
return clamp(vvSizeOffset + _featureAttribute.x * vvSizeFactor, vvSizeMinSize, vvSizeMaxSize);
}
vec4 vvTransformPosition(vec3 position, vec4 _featureAttribute) {
return vec4(vvSymbolRotationMatrix * ( vvScale(_featureAttribute) * (position + vvSymbolAnchor)), 1.0);
}`),v.code.add(r`
      const float eps = 1.192092896e-07;
      vec4 vvTransformNormal(vec3 _normal, vec4 _featureAttribute) {
        vec3 vvScale = clamp(vvSizeOffset + _featureAttribute.x * vvSizeFactor, vvSizeMinSize + eps, vvSizeMaxSize);
        return vec4(vvSymbolRotationMatrix * _normal / vvScale, 1.0);
      }

      ${o.hasVvInstancing?r`
      vec4 vvLocalNormal(vec3 _normal) {
        return vvTransformNormal(_normal, instanceFeatureAttribute);
      }

      vec4 localPosition() {
        return vvTransformPosition(position, instanceFeatureAttribute);
      }`:""}
    `)):v.code.add(r`vec4 localPosition() { return vec4(position, 1.0); }
vec4 vvLocalNormal(vec3 _normal) { return vec4(_normal, 1.0); }`),o.vvColor?(v.constants.add("vvColorNumber","int",a),o.hasVvInstancing&&v.uniforms.add([new n("vvColorValues",e=>e.vvColorValues,a),new l("vvColorColors",e=>e.vvColorColors,a)]),v.code.add(r`
      vec4 vvGetColor(vec4 featureAttribute, float values[vvColorNumber], vec4 colors[vvColorNumber]) {
        float value = featureAttribute.y;
        if (value <= values[0]) {
          return colors[0];
        }

        for (int i = 1; i < vvColorNumber; ++i) {
          if (values[i] >= value) {
            float f = (value - values[i-1]) / (values[i] - values[i-1]);
            return mix(colors[i-1], colors[i], f);
          }
        }
        return colors[vvColorNumber - 1];
      }

      ${o.hasVvInstancing?r`
      vec4 vvColor() {
        return vvGetColor(instanceFeatureAttribute, vvColorValues, vvColorColors);
      }`:""}
    `)):v.code.add(r`vec4 vvColor() { return vec4(1.0); }`)}export{z as s};
