/*
 * @Author: zhaoqian
 * @Date: 2020-05-21 14:09:13
 * @LastEditTime: 2020-07-08 16:44:41
 * @LastEditors: Please set LastEditors
 * @Description:  圆形动态扩散波纹
 * @FilePath: \cesium-vue\static\libs\cesium\ellipsoidFadeMarterialProperty.js
 */ 
let Cesium = require('cesium/Source/Cesium')


function EllipsoidFadeMaterialProperty(color, duration) {
  this._definitionChanged = new Cesium.Event();
  this._color = undefined;
  this._colorSubscription = undefined;
  this.color = color;
  this.duration = duration;
  this._time = (new Date()).getTime();
}
Object.defineProperties(EllipsoidFadeMaterialProperty.prototype, {
    isConstant: {
        get: function () {
            return false
        }
    },
    definitionChanged: {
        get: function () {
            return this._definitionChanged
        }
    },
    color: Cesium.createPropertyDescriptor('color')
})
EllipsoidFadeMaterialProperty.prototype.getType = function (time) {
  return 'EllipsoidFade';
}
EllipsoidFadeMaterialProperty.prototype.getValue = function (time, result) {
      if (!Cesium.defined(result)) {
          result = {};
      }
      result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.ColorWHITE, result.color);
      result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
      return result;
  }
EllipsoidFadeMaterialProperty.prototype.equals = function (other) {
    return this === other || 
        (other instanceof EllipsoidFadeMaterialProperty && Cesium.Property.equals(this._color, other._color))
}

Cesium.Material.EllipsoidFadeType = "EllipsoidFade";
// 自定义着色器
Cesium.Material.EllipsoidFadeSource =
  "czm_material czm_getMaterial(czm_materialInput materialInput)\n" +
  "{\n" +
  "  czm_material material = czm_getDefaultMaterial(materialInput);\n" + 
  "  material.diffuse = 1.5 * color.rgb;\n" + 
  "  vec2 st = materialInput.st;\n" +
  "  float dis = distance(st, vec2(0.5, 0.5));\n" +
  "  float per = fract(time);\n" +
  "  if(dis > per * 0.3) {\n" +
  // "    material.alpha = 0.0;\n" +
  "    discard;\n" + 
  "  }else{\n" +
  "    material.alpha = color.a * dis / per / 0.5;\n" +
  "  }\n" +
  "  return material;\n"+
  "}";
Cesium.Material._materialCache.addMaterial(Cesium.Material.EllipsoidFadeType, {
  fabric: {
      type: Cesium.Material.EllipsoidFadeType,
      uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1),
          time: 0
      },
      source: Cesium.Material.EllipsoidFadeSource 
        
  },
  translucent: function (material) { 
      return true;
  }
})

Cesium.EllipsoidFadeMaterialProperty = EllipsoidFadeMaterialProperty
