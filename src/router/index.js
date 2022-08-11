import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('../layout/Index.vue'),
        children: [
            {
                path: '/',
                name: 'home',
                meta: {
                    title: '简单介绍',
                },
                component: () => import('../views/HomeView.vue'),
            },
            {
                path: '/mdStudy',
                name: 'mdStudy',
                meta: {
                    title: 'md介绍',
                },
                component: () => import('../views/mdStudy/MdStudy.vue'),
            },
            {
                path: '/openLayer',
                name: 'openLayer',
                meta: {
                    title: 'openLayer 2D',
                },
                component: () => import('../views/openLayer/Index.vue'),
            },
            {
                path: '/echarts',
                name: 'echarts',
                meta: {
                    title: 'echarts',
                },
                component: () => import('../views/echarts/Index.vue'),
            },
            {
                path: '/leafletDemo',
                name: 'leafletDemo',
                meta: {
                    title: 'leaflet Demo',
                },
                component: () => import('../views/leafletDemo/leafletDemo.vue'),
            },
            {
                path: '/cesiumDemo',
                name: 'cesiumDemo',
                meta: {
                    title: 'cesium Demo',
                },
                component: () => import('../views/cesiumDemo/Index.vue'),
            },
            {
                path: '/TreeHole',
                name: 'TreeHole',
                meta: {
                    title: '因为数据过大踩过的坑',
                },
                component: () => import('../views/bigDateHole/TreeHole.vue'),
            },
        ],
    },
    {
        path: '/SvgList',
        name: 'SvgList',
        component: () => import('../views/devViews/SvgList.vue'),
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
})

export default router
