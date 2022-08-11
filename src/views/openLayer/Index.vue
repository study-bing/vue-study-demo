<!--
 * @Author: linBin
 * @Date: 2022-08-03 10:52:11
 * @LastEditTime: 2022-08-04 16:56:12
 * @LastEditors: linBin
 * @Description: openLayer结合天地图相关demo
 * @FilePath: /web-demo/src/views/openLayer/Index.vue
-->
<template>
    <div class="content">
        <div class="page-desc">介绍：openLayer结合天地图展示2D地图demo，主要内容为图层遮罩、图层切换、大数据展示、复位等</div>
        <div class="page-desc">1.demo演示</div>
        <map-view class="mb-16"></map-view>
        <div class="page-desc">2.引入依赖</div>
        <code-show
            code="import 'ol/ol.css' // 样式
import { Map, View, Feature } from 'ol' // 地图
import { XYZ, Vector as VectorSource } from 'ol/source' // 数据源
import { fromLonLat } from 'ol/proj' // 坐标转换
import { Tile, Heatmap, Vector as VectorLayer, WebGLPoints as WebGL } from 'ol/layer' // 图层
import { Fill, Style, Stroke, Text, Icon } from 'ol/style' // 点位等样式
import { defaults as defaultControls } from 'ol/control' // 控制
import GeoJSON from 'ol/format/GeoJSON'
import { fromExtent } from 'ol/geom/Polygon'
import { LinearRing, Point } from 'ol/geom'
import Overlay from 'ol/Overlay'"
        ></code-show>
        <div class="page-desc mt-16">3.初始化地图,通过new Tile设定底图（demo为天地图底图）</div>
        <code-show
            code="baseLayer = new Tile({
    title: '天地图底图',
    source: new XYZ({
        url: 'https://t3.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=f1505a0a1a7e30e2f5eae28658111f0b',
        crossOrigin: 'anonymous',
    }),
    })
    map = new Map({
    target: 'map',
    controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: false,
    }),
    view: new View({
        projection: 'EPSG:3857',
        center: fromLonLat([120.454493, 29.082613]),
        zoom: this.zoom,
        maxZoom: 15,
        minZoom: 5,
    }),
    layers: [baseLayer],
    })"
        ></code-show>
        <div class="page-desc mt-16">4.添加基础事件，缩放、鼠标经过时、点击点位时</div>
        <code-show
            code=" // 监听缩放并获取缩放倍数
map.on('moveend', () => {
    this.zoom = map.getView().getZoom()
})
// 鼠标经过点时变成手
map.on('pointermove', (e) => {
    const pixel = e.pixel
    map.getTargetElement().style.cursor = 'unset'
    map.forEachFeatureAtPixel(pixel, () => {
        map.getTargetElement().style.cursor = 'pointer'
    })
})
// 点击点打开弹窗
map.on('singleclick', (e) => {
    map.forEachFeatureAtPixel(e.pixel, (feature) => {
        // feature：点位信息
        console.log(feature)
    })
})"
        ></code-show>
        <div class="page-desc mt-16">
            5.添加遮罩层：遮罩层的添加需要有除了非遮罩区的json数据，以demo为例，除了浙江之外都需要有遮罩，所以获取了浙江省的.json文件，
            <span class="fs-bold">需要注意的是，这个json不能有子区域，</span>否则会出现只高亮了某一个子区域
            <p>获取json的链接：http://datav.aliyun.com/portal/school/atlas/area_selector</p>
        </div>
        <code-show
            code="// 添加遮罩层
addCover() {
    // 遮罩样式
    const shadeStyle = new Style({
        fill: new Fill({
            color: 'rgba(25, 78, 132, 0.6)',
        }),
        stroke: new Stroke({
            width: 5,
            color: '#06d9ff',
        }),
    })
    // 遮罩数据源
    const vtSource = new VectorSource()
    // 遮罩图层
    const vtLayer = new VectorLayer({
        source: vtSource,
        style: shadeStyle,
    })
    map.addLayer(vtLayer)
    //!! 遮罩层的json不能函有子地区 否则清除的时候有问题
    let data = require('./modules/zjs-no-area.json')
    // 3857 则需要new GeoJSON({ featureProjection: 'EPSG:3857' }).readFeatures(data)
    let features = new GeoJSON({ featureProjection: 'EPSG:3857' }).readFeatures(data)
    let ft = features[0]
    let coverGeom = this.erase(ft.getGeometry())
    let convertFt = new Feature({
        geometry: coverGeom,
    })
    vtLayer.getSource().addFeature(convertFt)
},
//擦除操作，生产遮罩范围
erase(geom) {
    // 4326 : [-180, -90, 180, 90] ; 3857: map.getView().getProjection().getExtent()
    const extent = map.getView().getProjection().getExtent()
    const polygonRing = fromExtent(extent)
    const coords = geom.getCoordinates()
    coords.forEach((coord) => {
        const linearRing = new LinearRing(coord[0])
        polygonRing.appendLinearRing(linearRing)
    })
    return polygonRing
},
    "
        ></code-show>
        <div class="page-desc mt-16">6.添加遮罩层后需要让浙江省内部各个区域边界线显示，则需要添加区域图层</div>
        <code-show
            code="// 添加浙江省区域线
addArea() {
    let json = require('./modules/zjs.json')
    let features = new GeoJSON({ featureProjection: 'EPSG:3857' }).readFeatures(json)
    let vectorSource = new VectorSource({ features: features })
    const areaStyle = new Style({
        stroke: new Stroke({
            width: 2,
            color: '#06d9ff',
        }),
    })
    let lineLayer = new VectorLayer({
        zIndex: 99,
        source: vectorSource,
        style: areaStyle,
    })
    map.addLayer(lineLayer) // 把图层添加到地图
}, "
        ></code-show>
        <div class="page-desc mt-16">
            7.渲染大数据点位，通过WebGL可以加快点位的渲染
            <p>参考demo：https://openlayers.org/en/latest/examples/webgl-points-layer.html</p>
        </div>
        <code-show
            code="const features = []
    data.forEach((el) => {
        features.push(
            new Feature({
                geometry: new Point(fromLonLat([el.longitude, el.latitude])),
                ...el,
            })
        )
    })
    let vectorSource = new VectorSource({ features: features })
    let size = this.zoom >= 11 ? 16 : 12
monitorLayer = new WebGL({
    source: vectorSource,
    style: {
        symbol: {
            symbolType: 'image',
            src: this.zoom >= 11 ? require('./img/16.png') : require('./img/12.png'),
            size: size,
            rotateWithView: false,
            offset: [-2, 0],
            // 根据指定属性显示点位颜色不同
            // symbolType: 'triangle',
            // size: size,
            // color: ['interpolate', ['linear'], ['get', 'monitorPointId'], 0, '#ff14c3', 300, '#ffed02', 600, '#00ff67'],
        },
    },
    zIndex: 99,
})
map.addLayer(monitorLayer)"
        ></code-show>
        <div class="page-desc mt-16">8.热力图显示</div>
        <code-show
            code="const features = []
    data.forEach((el) => {
        features.push(
            new Feature({
                geometry: new Point(fromLonLat([el.longitude, el.latitude])),
                ...el, // 添加自己需要的信息
            })
        )
    })
    let vectorSource = new VectorSource({ features: features })
    monitorLayer = new Heatmap({
    source: vectorSource,
    blur: 15, // 调整模糊度
    radius: 5,
    weight: () => {
        return 0.5
    },
    zIndex: 99,
})
map.addLayer(monitorLayer)"
        ></code-show>
        <div class="page-desc mt-16">9.基本点位显示</div>
        <code-show
            code="countLayer = new VectorLayer({
    zIndex: 99,
    source: vectorSource,
    style: function (feature) {
        let thisText = feature.get('monitorNumber') > 99 ? '99+' : String(feature.get('monitorNumber')) //获取各个个体的名字
        let style = null
        style = new Style({
            image: new Icon({
                src: require('./img/point-box.png'),
                anchor: [0.5, 1.4],
            }),
            text: new Text({
                text: thisText, //文本
                font: '14px PingFang SC-Semibold, PingFang SC', //字体大小和字体
                fill: new Fill({
                    //文字填充颜色
                    color: '#1D7464',
                }),
                offsetY: -40,
            }),
        })
        return [style]
    },
})
map.addLayer(countLayer)"
        ></code-show>
    </div>
</template>

<script>
import CodeShow from '@components/CodeShow'
import MapView from './MapView.vue'
export default {
    name: 'openLayerDemo',
    components: { CodeShow, MapView },
    data() {
        return {
            importCode: '',
        }
    },
}
</script>
<style lang="less" scoped></style>
