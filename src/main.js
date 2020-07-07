/*
 * @Author: your name
 * @Date: 2019-12-16 11:14:53
 * @LastEditTime: 2020-06-20 15:57:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-vue\src\main.js
 */ 
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import { sendGET, sendPOST, getThirdUrl } from "./axios/http";
import Global from "./uitl/global";
import Common from "./uitl/common";

Vue.use(ElementUI)
Vue.prototype.$axios = axios
Vue.prototype.$post = sendPOST;
Vue.prototype.$get = sendGET;
Vue.prototype.$thirdUrl = getThirdUrl;
Vue.prototype.GLOBAL = Global;
Vue.prototype.COMMON = Common;
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App } 
})