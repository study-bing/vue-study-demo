### 介绍
本 demo 主要简单演示了 leaflet 的点线面的初始化、地图城市边界设置、地图事件监听
   

### 引入相关依赖

```javascript
import CQ from './modules/CQ.json'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
```

### 定义地图容器
```html
<div id="my-map"></div>  
```  
  
   
### 初始化地图
```javascript
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
},
```

### 地图设置边界及区域颜色
[获取地图JSON](http://datav.aliyun.com/portal/school/atlas/area_selector)
- 在此网站可以获取地图相关JSON数据 然后引入文件 生成地图边界
```javascript
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
```

### 基础点、线、面的绘制
```javascript
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
```

### 地图事件监听
[中文文档](https://leafletjs.cn/reference-1.8.0.html#event-objects)
```javascript
// 地图缩放等级监听 还有许多监听事件 可以查看中文文档
this.map.on('zoomend', (e) => {
    this.scale = e.target.getZoom()
    console.log(this.scale)
})
```

未完待续... 后续扩展功能: 海量点添加、聚合、图层切换等