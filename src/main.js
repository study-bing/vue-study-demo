/*
 * @Author: virgouss gu.shi.chen15@qq.com
 * @Date: 2022-08-05 13:44:03
 * @LastEditors: virgouss gu.shi.chen15@qq.com
 * @LastEditTime: 2022-08-09 20:21:32
 * @FilePath: /task/src/main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 引入全局组件
import './components'
// 引入element组件库
import './plugins/element'
// 引入常用插件
import './plugins/commonUse'
// 引入svg
import './assets/icons/index'
// 引入样式
import './style/index.less'
// markdown样式
import 'github-markdown-css'
// 代码高亮
import 'highlight.js/styles/github.css'

Vue.config.productionTip = false
new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount('#app')
