<!--
 * @Author: zhaoqian
 * @Date: 2020-05-21 09:12:49
 * @LastEditTime: 2020-06-08 09:17:58
 * @LastEditors: Please set LastEditors
 * @Description: 三维基站的显示
 * @FilePath: \cesium-vue\src\components\5g_stations\site5g.vue
--> 

<template>
    <div class="map">
      <div id="cContainer"></div>
      <div class="button">
        <el-button-group>
          <el-button size="mini" @click="addStations()">5g基站</el-button>
          <el-button size="mini" @click="clear()">清除</el-button>
        </el-button-group>
      </div>
        
      <div class="infobox" v-if="infoBoxVisible==true">
        <div class="divpoint divpoint-theme-197090">
          <div class="divpoint-wrap">
            <div class="area">
              <div class="arrow-lt"></div>
              <div class="b-t"></div>
              <div class="b-r"></div>
              <div class="b-b"></div>
              <div class="b-l"></div>
              <div class="arrow-rb"></div>
              <div class="label-wrap">
                <div class="title">
                  <div>基站详情</div>
                  <div class="close" @click="closeInfoBox">×</div>
                </div>
                <div class="label-content">
                  <table>
                    <tr v-for="(val, key) in pickedModel.properties"
                        v-if="val && key!='index'">
                      <td class="key">{{ title[key] }}</td>
                      <td>{{ val }}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
            <div class="b-t-l"></div>
            <div class="b-b-r"></div>
          </div>
          <div class="arrow"></div>
        </div>
      </div>
    </div>
</template>
<script>
import 'cesium/Widgets/widgets.css';
// let Cesium = require('cesium/Cesium');
let Cesium = require('../../static/libs/cesium/ellipsoidFadeMarterialProperty')
import data from '../../static/SampleData/5g/5g_stations.json' 
import signalTower from '../../static/3dModel/signalTower-oversize.gltf'

export default {
  components: {
    
  },
  data () {
    return {
      cViewer: '',
      infoBoxVisible: false,
      windowPosition: '',
      entityDatasource: null,
      primitiveCollection: null,
      title: {
        province: '省份',
        city: '地市',
        district: '区市',
        type: '类型',
        name: '名称',
        locate_community: '位置',
        lng: '经度',
        lat: '纬度',
        operators: '运营商'
      }
    }
  },
  mounted () {
    this.initViewer()
  },
  methods: {
    initViewer () {
      // this.initUserInfo();
      this.initCViewer()
    },
    /**
     * @description: 初始化cesium地图
     * @param {type} 
     * @return: 
     */
    initCViewer () {
      // 初始化Viewer之前，将token加入，可避免报错{"code":"InvalidCredentials","message":"Invalid access token"}
      Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ZDliYjU2OS03YTA0LTQ4NjUtYWE4Zi1iZTMzOTEzOGI5NmIiLCJpZCI6MTg0MzQsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzM4MDA2MzR9.TiRGDlgKIT4SB2apFIwEAWyqp5Ad_qSqh3zrpE0l8h4'
      this.cViewer = new Cesium.Viewer('cContainer',{
        animation: false, //关闭动画
        timeline: false, //关闭时间线
        navigationHelpButton: false,  //关闭显示默认的相机控制提示
        fullscreenButton: false, //关闭全屏按钮
        geocoder: false, //关闭geocoder小部件
        selectionIndicator: false,
        infoBox: false,  //点击要素之后显示的信息,默认true
        baseLayerPicker: false, //是否显示图层选择控件
        sceneModePicker: false, //是否显示投影方式控件
        homeButton: false,  //是否显示默认定位点的控件
      });
      this.cViewer._cesiumWidget._creditContainer.style.display = 'none';  // 默认去除版权信息
      this.cViewer.imageryLayers.get(0).show = false;  // 默认不加载影像
      this.cViewer.scene.skyBox.show = false  // 默认不显示背景图片
      this.cViewer.scene.backgroundColor = new Cesium.Color(0.0, 0.0, 0.0, 0.0) //默认将背景颜色设置为黑色
      this.cViewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK) // 屏蔽默认双击事件
      
      this.ellipsoid = this.cViewer.scene.globe.ellipsoid;
      
      // this.addCBasicMap()
      this.addCSitelliteMap()
      
      this.directLocation()
    },
    /**
     * @description: 直接定位至目标区域
     * @param {type} 
     * @return: 
     */
    directLocation () {
      const position = new Cesium.Cartesian3.fromDegrees(113.73089959,34.755, 60000) // 经度、纬度、高度形成的笛卡尔三维坐标
      const orientation = new Cesium.HeadingPitchRoll.fromDegrees(0, -90, 0)
      const homeCameraView = {
        destination: position,
        orientation: {
          heading: orientation.heading,
          pitch: orientation.pitch,
          roll: orientation.roll
        },
        duration: 0
      }
      this.cViewer.scene.camera.setView(homeCameraView)
    },
    /**
     * @description: 地球转动定位至目标区域并放大至合适视野
     * @param {type} 
     * @return: 
     */
    rotationLocation () {
      const position = new Cesium.Cartesian3.fromDegrees(113.73089959,34.755, 1000000.0) // 经度、纬度、高度形成的笛卡尔三维坐标
      const orientation = new Cesium.HeadingPitchRoll.fromDegrees(0, -90, 0)
      const startView = {
        destination: position,
        duration: 25,
        flyOverLongitude: 1,
        orientation: {
          heading: orientation.heading,
          pitch: orientation.pitch,
          roll: orientation.roll
        }
      }
      const endView = {
        destination: Cesium.Cartesian3.fromDegrees(113.73089959,34.755, 100000.0),
        orientation: {
          heading: orientation.heading,
          pitch: orientation.pitch,
          roll: orientation.roll
        }
      }
      startView.complete = () => {
        this.cViewer.camera.flyTo(endView)
      }
      this.cViewer.camera.flyTo(startView)
    },
    /**
     * @description: 默认添加NaturalEarthII为底图
     * @param {type} 
     * @return: 
     */
    addCBasicMap () {
      const baseMapP = new Cesium.TileMapServiceImageryProvider({
        url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
      });
      const baseMap = new Cesium.ImageryLayer(baseMapP, {
        show: true
      })
      this.cViewer.imageryLayers.add(baseMap)
    },
    /**
     * @description: 默认添加高德卫星影像（加了偏移）
     * @param {type} 
     * @return: 
     */
    addCSitelliteMap () {
      const aSitellitP = new Cesium.UrlTemplateImageryProvider({
        url: "https://wprd{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&style=6",
        subdomains:["01","02","03","04"] //多域名请求
      });
      const aSitellite =  new Cesium.ImageryLayer(aSitellitP, {
        show: true
      });
      this.cViewer.imageryLayers.add(aSitellite, 2);
    },
    addOfflineTile () {
      let layers = this.$parent.viewer.scene.imageryLayers
      let layer = layers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: '../../../地图瓦片/河南/v101/Layers/_alllayers/{z}/{x}/{y}.png',
          fileExtension: 'png',
          minimumLevel: 1,
          maximumLevel: 18,
          tileWidth: 256,
          tileHeight: 256,
        })
      )
    },
    addStations () {
      if (this.primitiveCollection) {
        this.primitiveCollection.show = true
        return
      }
      let stations = data.stations
      let extent = {}
      
      // this.primitiveCollection = this.cViewer.scene.primitives.add(new Cesium.PrimitiveCollection())
      let instances = []
      
      stations.forEach( (item, index) => {
        item.index = index

        /* primitive方式显示3d模型*/
        // this.add3dModel(item, this.primitiveCollection) 

        /* entity方式显示3d模型*/
        // this.add3dEntity(item, entityDatasource2)
        
        let position = Cesium.Cartesian3.fromDegrees(item.lng, item.lat, 0)
        let scale = 20

        let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, new Cesium.HeadingPitchRoll(0, 0, 0));
        Cesium.Matrix4.multiplyByUniformScale(modelMatrix, scale, modelMatrix);

        let modelInstance = new Cesium.ModelInstance(this.primitiveCollection, modelMatrix, index)

        instances.push(modelInstance)
        
        // if (index === 0) {
        //   extent = {
        //     east: item.lng,
        //     west: item.lng,
        //     north: item.lat,
        //     south: item.lat
        //   }
        // } else {
        //   if (item.lng > extent.lng) {
        //     extent.east = item.lng
        //   } else {
        //     extent.west = item.lng
        //   }
        //   if (item.lat > extent.lat) {
        //     extent.north = item.lat
        //   } else {
        //     extent.south = item.lat
        //   }
        // }
      })
      
      this.primitiveCollection = this.cViewer.scene.primitives.add(new Cesium.ModelInstanceCollection({
        url: signalTower,
        instances: instances,
        imageBasedLightingFactor: new Cesium.Cartesian2(1, 1),
        lightColor: new Cesium.Cartesian3(50, 50, 50),
      }))

      // let center = {
      //   lng: (extent.east + extent.west)/2 + (extent.east - extent.west)/2, 
      //   lat: extent.south - (extent.north - extent.south)*32
      // }
      // this.cViewer.camera.flyTo({
      //   destination : Cesium.Cartesian3.fromDegrees(center.lng,center.lat, 6000.0),//经纬度坐标转换为 笛卡尔坐标(世界坐标)
      //   orientation: {
      //       heading : Cesium.Math.toRadians(-10), // east, default value is 0.0 (north) //东西南北朝向
      //       pitch : Cesium.Math.toRadians(-30),    // default value (looking down)  //俯视仰视视觉
      //       roll : 0                    // default value
      //   },
      // })

      this.cViewer.camera.flyToBoundingSphere(this.primitiveCollection._boundingSphere, {
        offset: {
            heading : Cesium.Math.toRadians(-20), // east, default value is 0.0 (north) //东西南北朝向
            pitch : Cesium.Math.toRadians(-30),    // default value (looking down)  //俯视仰视视觉
            roll : Cesium.Math.toRadians(10)                 // default value
        }
      })
      this.scenePick()
    },
    /**
     * @description: 添加Primitive的3d模型
     * @param {type} Object 基站信息
     * @param {type} Object Primitive集合
     * @return: 
     */    
    add3dModel (item, primitiveCollection) {
      let model = primitiveCollection.add(Cesium.Model.fromGltf({
        id: `gtlf-${item.index}`,
        url: signalTower,
        show: true,
        scale: 20,
        minimumPixelSize: 72,
        maximumScale: 20,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
          Cesium.Cartesian3.fromDegrees(item.lng, item.lat, 0.0)
        ),
      }))
      model.properties = item
      return model
    },
    /**
     * @description: 添加entity的3d模型
     * @param {type} Object 基站信息
     * @param {type} Object entity集合
     * @return: 
     */ 
    add3dEntity (item, datasource) {
      let entity = datasource.entities.add({
        id: `entity-gtlf-${item.index}`,
        name: 'signalTower-oversize.gltf',
        position: Cesium.Cartesian3.fromDegrees(item.lng, item.lat, 0.0),
        model: {
          uri: signalTower,
          scale: 20,
          minimumPixelSize: 72,
          maximumScale: 20,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      })
      entity.properties = {}
      for (let key in item) {
        entity.properties[key] = item[key] 
      }
      return entity
    },
    /**
     * @description: 在地图上添加点击函数，使点击Model，绘制动态扩散效果、添加info窗体
     * @param {type} 
     * @return: 
     */
    scenePick() {
      let viewer = this.cViewer
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      this.entityDatasource = new Cesium.CustomDataSource('sinal')
      this.cViewer.dataSources.add(this.entityDatasource)
      
      handler.setInputAction( (e) => {
        
        let picked = viewer.scene.pick(e.position)
        if (picked) {
          // 获取点击点的坐标
          // this.pickedModel = picked.primitive
          // let modelMatrix = picked.primitive.modelMatrix
          // let cartesian = new Cesium.Cartesian3(modelMatrix[12], modelMatrix[13], modelMatrix[14])

          this.pickedModel = picked
          let modelMatrix = picked._modelMatrix
          let cartesian = new Cesium.Cartesian3(modelMatrix[12], modelMatrix[13], modelMatrix[14])
          this.pickedModel.properties = data.stations.find((item, index) => picked._instanceId === index)

          // // 添加动态扩散效果 
          this.dynamicDiffusion({
            step: 20,
            maxR: 50 * 10,
            cartesian: cartesian,  // 注意：这里是世界坐标
            height: 150
          }, this.entityDatasource)
          
          // TODO: primitive添加info框
          this.infoBoxVisible = true
          this.initInfobox(cartesian)
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    },
    /**
     * @description: 动态扩散动画
     * @param {type} Object 参数对象
     * @param {type} Object entity数据源
     * @return: 
     */
    dynamicDiffusion2d (data, entityDatasource) {
      // 添加中心圆
      let r = 0
      let _changeR = function () {
        r = r + data.step/10
        if (r >= data.maxR/10) {
          r = data.maxR/10
        }
        return r
      }
      entityDatasource.entities.add({
        position: data.cartesian,
        show: true,
        ellipse: {
          semiMinorAxis: data.maxR/10,
          semiMajorAxis: data.maxR/10,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          height: data.height,
          material: Cesium.Color.RED
        }
      })
      
      // 添加外层扩散圆
      let r1 = 0, count1 = 1
      function _changeR1 () {
        r1 = r1 + data.step
        if (r1 >= data.maxR) {
          r1 = 0
          count1 += 1
        }
        return r1
      }
      
      entityDatasource.entities.add({
        position: data.cartesian,
        show: true,
        ellipse: {
          semiMinorAxis: new Cesium.CallbackProperty(_changeR1, false),
          semiMajorAxis: new Cesium.CallbackProperty(_changeR1, false),
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          height: data.height,
          material: new Cesium.ImageMaterialProperty({
            image: data.imgUrl,
            repeat:new Cesium.Cartesian2(1.0, 1.0),
            transparent: false,
            color: new Cesium.CallbackProperty(function () {
              if (count1 == 1) {
                return Cesium.Color.WHITE.withAlpha(0)
              }
              let alp = 1 - r1/ data.maxR
              return Cesium.Color.WHITE.withAlpha(alp)
            }, false)
          })
        }
      })  

      // 添加内层扩散圆
      let _this = this
      let r2 = 0, count2 = 1
      setTimeout (function () {
        function _changeR2 () {
          r2 = r2 + data.step
          if (r2 >= data.maxR) {
            r2 = 0
            count2 += 1
          }
          return r2
        }
        
        entityDatasource.entities.add({
          position: data.cartesian,
          show: true,
          ellipse: {
            semiMinorAxis: new Cesium.CallbackProperty(_changeR2, false),
            semiMajorAxis: new Cesium.CallbackProperty(_changeR2, false),
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            height: data.height,
            material: new Cesium.ImageMaterialProperty({
              image: data.imgUrl,
              repeat:new Cesium.Cartesian2(1.0, 1.0),
              transparent: false,
              color: new Cesium.CallbackProperty(function () {
                if (count2 == 1) {
                  return Cesium.Color.WHITE.withAlpha(0)
                }
                let alp = 1 - r2/ data.maxR
                return Cesium.Color.WHITE.withAlpha(alp)
              }, false)
            })
          }
        })  
      }, data.eachInterval)
    },
    /**
     * @description: 动态扩散动画
     * @param {type} Object 参数对象
     * @param {type} Object entity数据源
     * @return: 
     */
    dynamicDiffusion (data, entityDatasource) {
      entityDatasource.entities.add({
        name: 'ellipsoidFade',
        position: data.cartesian,
        ellipse: {
          semiMinorAxis: data.maxR,
          semiMajorAxis: data.maxR,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          height: data.height,
          material: new Cesium.EllipsoidFadeMaterialProperty(Cesium.Color.fromCssColorString('#0738ee'), 2000)
        }
      })
    },
    /**
     * @description: 初始化信息窗体的位置
     * @param {type} Cartesian3 世界坐标
     */
    initInfobox (cartesian) {
      this.windowPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.cViewer.scene, cartesian) //世界转化为屏幕坐标
      let removeHandler = this.cViewer.scene.postRender.addEventListener( () => {
        this.windowPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.cViewer.scene, cartesian)
      })
    },
    /**
     * @description: 关闭信息窗体
     */
    closeInfoBox () {
      this.infoBoxVisible = false
    },
    /**
     * @description: 删除绘制的primitive、entity
     * @param {type} 
     * @return: 
     */
    clear () {
      this.entityDatasource.entities.removeAll()
      this.primitiveCollection.show = false
      this.infoBoxVisible = false
    }
  },
  watch: {
    windowPosition (val) {
      if (this.infoBoxVisible) {
        let infobox = this.$el.getElementsByClassName("infobox")[0]
        if (infobox) {
          infobox.style.left = val.x + 50 + 'px'
          infobox.style.top = val.y - infobox.offsetHeight - 50 + 'px'
        }
      }
    }
  }
}
</script>

<style scoped>
.map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
#cContainer {
  width: 100%;
  height: 100%;
}
.button {
  position: absolute;
  left: 10px;
  top: 10px;
}
.infobox {
  position: absolute;
  left: 50%;
  top: 50%;
}
.divpoint {
  /* position: absolute; */
  padding: 30px;
  overflow: hidden;
}
.divpoint .area {
    position: relative;
    min-width: 180px;
    max-width: 600px;
}

.divpoint .b-t { /* 上边的渐变线 */
    position: absolute;
    top: 0;
    left: 44px;
    right: 0;
    height: 1px;
    z-index: 10
}


.divpoint .b-r { /* 右边的渐变线 */
    position: absolute;
    top: 0;
    right: 0;
    bottom: 44px;
    width: 1px;
    z-index: 10
}

.divpoint .b-b { /* 底边的渐变线 */
    position: absolute;
    left: 0;
    right: 44px;
    bottom: 0;
    height: 1px;
    z-index: 10
}

.divpoint .b-l { /* 左边的渐变线 */
    position: absolute;
    top: 44px;
    left: 0;
    bottom: 0;
    width: 1px;
    z-index: 10
}

.divpoint .b-t-l { /* 左上角边线 */
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 62px;
    /* transform: rotate(45deg) translate(-52px,22px); */
    transform: rotate(45deg) translate(65px,-7px);
    
    z-index: 10
}

.divpoint .b-b-r { /* 右下角边线 */
    position: absolute;
    bottom: 0;
    right: 0;
    width: 1px;
    height: 62px;
    transform: rotate(45deg) translate(-52px,22px);
    z-index: 10
}

.divpoint .label-wrap { /* 文字部分 */
    padding-left: 12px;
    color: #fff;
    font-size: 16px;
    /* white-space: nowrap;
    overflow: hidden */
}


.divpoint .title {
    margin-top: 20px;
    padding: 0 12px 0 30px;
    height: 36px;
    line-height: 36px;
    position: relative
}

.divpoint .title::before {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    z-index: 10;
    height: 2px
}
.divpoint .title .close {
    font-size: 30px;
    position: absolute;
    right: 0;
    top: 0;
    height: 30px;
    width: 30px;
    text-align: center;
    line-height: 30px;
    cursor: pointer;
}

.divpoint .label-content {
    padding: 15px 0
}


.data-value,.divpoint .data-label {
    display: inline-block
}

.divpoint .data-value {
    font-size: 14px
}


.divpoint .arrow { /*原本是一条横线 */
    position: absolute;
    bottom: 0;
    left: 0;
    width: 45px;
    height: 2px;
    transform: rotate(-45deg) translate(5px,-15px)
}
.label-content .key {
  width: 80px;
}
.divpoint-theme-29baf1 .b-b,.divpoint-theme-29baf1 .b-b-r,.divpoint-theme-29baf1 .b-l,.divpoint-theme-29baf1 .b-r,.divpoint-theme-29baf1 .b-t,.divpoint-theme-29baf1 .b-t-l {
    background-color: #29baf1;
    box-shadow: 0 0 10px 2px #29baf1
}

.divpoint-theme-29baf1 .area {
    background-image: linear-gradient(135deg,transparent 30px,#28bbf06c 30px,#28bbf06c 50%,transparent 50%),linear-gradient(-45deg,transparent 30px,#28bbf06c 30px,#28bbf06c 50.1%,transparent 50%)
}

.divpoint-theme-29baf1 .title {
    background-image: linear-gradient(135deg,transparent 25px,#29baf1 25px)
}

.divpoint-theme-29baf1 .arrow,.divpoint-theme-29baf1 .title::before {
    background-color: #28bbf0
}

.divpoint-theme-06e34a .b-b,.divpoint-theme-06e34a .b-b-r,.divpoint-theme-06e34a .b-l,.divpoint-theme-06e34a .b-r,.divpoint-theme-06e34a .b-t,.divpoint-theme-06e34a .b-t-l {
    background-color: #06e34a;
    box-shadow: 0 0 10px 2px #06e34a
}

.divpoint-theme-06e34a .area {
    background-image: linear-gradient(135deg,transparent 30px,#06e3486c 30px,#06e3486c 50%,transparent 50%),linear-gradient(-45deg,transparent 30px,#06e3486c 30px,#06e3486c 50.1%,transparent 50%)
}

.divpoint-theme-06e34a .title {
    background-image: linear-gradient(135deg,transparent 25px,#06e34a 25px)
}

.divpoint-theme-06e34a .arrow,.divpoint-theme-06e34a .title::before {
    background-color: #06e34a
}

.divpoint-theme-e3064f .b-b,.divpoint-theme-e3064f .b-b-r,.divpoint-theme-e3064f .b-l,.divpoint-theme-e3064f .b-r,.divpoint-theme-e3064f .b-t,.divpoint-theme-e3064f .b-t-l {
    background-color: #e3064f;
    box-shadow: 0 0 10px 2px #e3064f
}

.divpoint-theme-e3064f .area { 
    background-image: linear-gradient(135deg,transparent 30px,#e306506c 30px,#e306506c 50%,transparent 50%),
                      linear-gradient(-45deg,transparent 30px,#e306506c 30px,#e306506c 50%,transparent 50%)
}

.divpoint-theme-e3064f .title {
    background-image: linear-gradient(135deg,transparent 25px,#e3064f 25px)
}

.divpoint-theme-e3064f .arrow,.divpoint-theme-e3064f .title::before {
    background-color: #e3064f
}

.divpoint-theme-e9b709 .b-b,.divpoint-theme-e9b709 .b-b-r,.divpoint-theme-e9b709 .b-l,.divpoint-theme-e9b709 .b-r,.divpoint-theme-e9b709 .b-t,.divpoint-theme-e9b709 .b-t-l {
    background-color: #e9b709;
    box-shadow: 0 0 10px 2px #e9b709
}

.divpoint-theme-e9b709 .area {
    background-image: linear-gradient(135deg,transparent 30px,#e9b9096c 30px,#e9b9096c 50%,transparent 50%),linear-gradient(-45deg,transparent 30px,#e9b9096c 30px,#e9b9096c 50%,transparent 50%)
}

.divpoint-theme-e9b709 .title {
    background-image: linear-gradient(135deg,transparent 25px,#e9b709 25px)
}

.divpoint-theme-e9b709 .arrow,.divpoint-theme-e9b709 .title::before {
    background-color: #e9b709
}
.divpoint-theme-197090 .b-b,.divpoint-theme-197090 .b-b-r,.divpoint-theme-197090 .b-l,.divpoint-theme-197090 .b-r,.divpoint-theme-197090 .b-t,.divpoint-theme-197090 .b-t-l {
    background-color: #0738ee;
    box-shadow: 0 0 10px 2px #0738ee
}

.divpoint-theme-197090 .area {
    background-image: linear-gradient(135deg,transparent 30px,#6666ff8a 30px,#6666ff8a 50%,transparent 50%),linear-gradient(-45deg,transparent 30px,#6666ff8a 30px,#6666ff8a 50%,transparent 50%)
}

.divpoint-theme-197090 .title {
    background-image: linear-gradient(135deg,transparent 25px,#0738ee 25px)
}

.divpoint-theme-197090 .arrow,.divpoint-theme-197090 .title::before {
    background-color: #0738ee
}
</style>
