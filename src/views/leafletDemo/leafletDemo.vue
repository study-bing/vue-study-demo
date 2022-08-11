<!--
 * @Author: longjie
 * @Date: 2022-08-09 14:45:02
 * @LastEditTime: 2022-08-09 14:52:23
 * @LastEditors: longjie
 * @Description: leaflet demo
 * @FilePath: /web-demo/src/views/leafletDemo/leafletDemo.vue
-->
<template>
    <div class="demo-container content">
        <div id="my-map"></div>
        <el-select v-model="value" placeholder="请选择" class="my-select" @change="selectChange">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <div class="markdown-body mt-20">
            <md></md>
        </div>
    </div>
</template>
<script>
import md from './modules/leaflet.md'
import CQ from './modules/CQ.json'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
export default {
    components: {
        md,
    },
    data() {
        return {
            map: null,
            polygons: null,
            polyline: null,
            markers: null,
            scale: '',
            options: [
                {
                    value: 1,
                    label: '点',
                },
                {
                    value: 2,
                    label: '线',
                },
                {
                    value: 3,
                    label: '面',
                },
            ],
            value: 1,
        }
    },
    methods: {
        selectChange(val) {
            switch (val) {
                case 1:
                    this.markers ? this.map.removeLayer(this.markers) : null
                    this.polygons ? this.map.removeLayer(this.markers) : null
                    this.polyline ? this.map.removeLayer(this.polyline) : null
                    this.addMarker()
                    break
                case 2:
                    this.markers ? this.map.removeLayer(this.markers) : null
                    this.polygons ? this.map.removeLayer(this.polygons) : null
                    this.addLine()
                    break
                case 3:
                    this.markers ? this.map.removeLayer(this.markers) : null
                    this.polyline ? this.map.removeLayer(this.polyline) : null
                    this.addPolygons()
                    break
                default:
                    break
            }
        },
        initMap() {
            let map = L.map('my-map', {
                minZoom: 3,
                maxZoom: 14,
                center: [29.54098, 106.45773],
                zoom: 9, // 缩放级别
                zoomControl: false, // 缩放组件
                attributionControl: false, //去掉右下角logo
            })
            this.map = map
            L.tileLayer('http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}').addTo(map)
            this.addAreaColor()
            this.addMarker()
            this.map.on('zoomend', (e) => {
                this.scale = e.target.getZoom()
                console.log(this.scale)
            })
        },
        //绘制区域颜色
        addAreaColor() {
            //区域样式
            let style = {
                color: '#0000ff', //边框颜色
                weight: 3, //边框粗细
                opacity: 0.4, //透明度
                fillColor: '#55ff7f', //区域填充颜色
                fillOpacity: 0.5, //区域填充颜色的透明
            }
            L.geoJSON(CQ, { style: style }).addTo(this.map)
        },
        // 设置边界
        drawMapBoundary() {
            this.drawBoundary(CQ.features[0].geometry.coordinates[0])
            let style = {
                color: '#26BAFF', //边框颜色
                weight: 2, //边框粗细
                fillColor: 'transparent', //区域填充颜色
                fillOpacity: 0.2, //区域填充颜色的透明
            }
            L.geoJSON(CQ, { style }).addTo(this.map)
        },
        // 添加多个点并绑定popup
        addMarker() {
            // 自定义icon
            let myIcon = L.icon({
                iconUrl: require('./img/大气五参.png'),
                iconSize: [60, 60],
            })
            this.markers = L.marker([29.551359, 106.455116], {
                icon: myIcon,
            })
                .addTo(this.map)
                .bindPopup('<h3>我是一个点</h3>')
        },
        addPolygons() {
            this.polygons = L.polygon(
                [
                    [29.586147044633254, 106.77217456323243],
                    [29.597342363013972, 106.79637881738282],
                    [29.54359350914312, 106.78496333581543],
                ],
                { color: '#e070eb' }
            ).addTo(this.map)
        },
        addLine() {
            this.polyline = L.polyline(
                [
                    [29.01829199909053, 106.38313270312501],
                    [29.435355367957538, 108.13819862109376],
                ],
                { color: '#e070eb' }
            ).addTo(this.map)
        },
        reset() {
            this.map.removeLayer(this.marker)
        },
    },
    mounted() {
        this.initMap()
    },
}
</script>

<style scoped lang="less">
.demo-container {
    position: relative;
    #my-map {
        width: 100%;
        height: 500px;
    }
    .my-select {
        position: absolute;
        left: 23px;
        top: 24px;
        z-index: 999;
    }
}
.mt-20 {
    margin-top: 20px;
}
</style>
