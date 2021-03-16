/*
 * @Author: your name
 * @Date: 2019-12-16 11:14:53
 * @LastEditTime: 2020-07-07 10:34:39
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-vue\src\router\index.js
 */
import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/components/login'

import Dongqu from '@/components/dongqu'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'cesiumViewer',
      redirect: '/dongqu'
    },
    {path: '/dongqu', name: 'dongqu', component: Dongqu},
    {path: '/login', name: 'login', component: Login}
  ]
})
