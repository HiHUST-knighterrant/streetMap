<!--
 * @Author: xiongqianqian
 * @Date: 2020-07-09 10:40:18
 * @LastEditTime: 2020-07-09 14:36:39
 * @LastEditors: Please set LastEditors
 * @Description: 基于cesium的二三维转换
 * @FilePath: \cesium-vue-test\src\components\tool\modeSwitcher2.vue
-->
<template>
  <div>
    <!-- 切换2d3d模式 -->
    <div class="dSwitch" id="dSwitchContainer" ref="switcher">
      <el-radio-group v-model="dType" size="mini">
        <el-radio-button label="3D"></el-radio-button>
        <el-radio-button label="2D"></el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>
<script>
import 'cesium/Source/Widgets/widgets.css'
let Cesium = require('cesium/Source/Cesium')

export default {
  data () {
    return {
      dType: '3D',
      sceneModePicker: ''
    }
  },
  mounted () {
    const scene = this.$parent.viewer.scene
    this.sceneModePicker = new Cesium.SceneModePicker('dSwitchContainer', scene, 0)
    this.$refs.switcher.children[1].style.display = 'none'
    this.dType === '3D' ? this.$emit("getSceneMode", '3d') : this.$emit("getSceneMode", '2d')
  },
  methods: {
    sceneModeControl (action) {
      let command
      if (action === '3d') {
        this.$parent.tileset.show = true
        this.$emit("getSceneMode", '3d')
        // 显示影像图
        this.$parent.sitelliteMap.show = true
        this.$parent.customMap.show = true
        this.$parent.labelMap.show = false
        this.$parent.vectorMap.show = false
        command = this.sceneModePicker.viewModel.morphTo3D
      } else if (action === '2d') {
        this.$parent.tileset.show = false
        // 切换二维时保证视图范围大致一致
        let extent = this.get3DExtent()
        this.$parent.viewer.camera.setView({
          destination: Cesium.Rectangle.fromDegrees(extent.west, extent.south, extent.east, extent.north)
        })
        this.$emit("getSceneMode", '2d')
        // 显示天地图矢量地图
        this.$parent.vectorMap.show = true
        this.$parent.labelMap.show = true
        this.$parent.sitelliteMap.show = false
        this.$parent.customMap.show = false
        command = this.sceneModePicker.viewModel.morphTo2D
      }
      if (command.canExecute) {
        command()
      }
    },
    get3DExtent() {
      var rectangle = this.$parent.viewer.camera.computeViewRectangle();
      var west = rectangle.west / Math.PI * 180
      var north = rectangle.north / Math.PI * 180
      var east = rectangle.east / Math.PI * 180
      var south = rectangle.south / Math.PI * 180
      return {
        west: west,
        east: east,
        north: north,
        south: south
      }
    },
  },
  watch: {
    dType () {
      if (this.dType === '3D') {
        // this.$parent.viewer.scene.morphTo3D(1)
        this.sceneModeControl('3d')
      } else {
        // this.$parent.viewer.scene.morphTo2D(1)
        this.sceneModeControl('2d')
      }
    }
  }
}
</script>

<style >
  .dSwitch {
    position: absolute;
    top: 5px;
    right: 5px
  }
</style>
