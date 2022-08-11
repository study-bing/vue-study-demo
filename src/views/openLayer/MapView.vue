<template>
    <div class="map-content">
        <div id="map" ref="map"></div>
        <div class="ope-box" :class="{ 'is-full': isFull }">
            <div class="box-bg">
                <el-select v-model="mapType" @change="resetMap" size="small">
                    <el-option v-for="item in dataType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
                <div class="reset-box" @click="resetMap">
                    <svg-icon icon-class="map-reset" width="16" height="16"></svg-icon>
                    <span class="reset-txt">复位</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import 'ol/ol.css'
import { Map, View, Feature } from 'ol'
import { XYZ, Vector as VectorSource } from 'ol/source'
import { fromLonLat } from 'ol/proj'
import { Tile, Heatmap, Vector as VectorLayer, WebGLPoints as WebGL } from 'ol/layer'
import { Fill, Style, Stroke, Text, Icon } from 'ol/style'
import { defaults as defaultControls } from 'ol/control'
import GeoJSON from 'ol/format/GeoJSON'
import { fromExtent } from 'ol/geom/Polygon'
import { LinearRing, Point } from 'ol/geom'
import Overlay from 'ol/Overlay'
import { jhData, rlData } from './modules/data'
let map = null
let baseLayer = null // 地图底图
let monitorLayer = null // 数据图层
let areaLayer = null // 区域图层
let countLayer = null // 区域值图层
let monitorPoint = null // 点击的监测点
let devicePoint = null // 点击的设备
let deviceLayer = null // 设备点位图层
export default {
    data() {
        return {
            dataType: [
                { label: '基本点位', value: 2 },
                { label: 'WEBGL站点', value: 1 },
                { label: '热力', value: 3 },
            ],
            mapType: 2,
            zoom: 7, // 缩放等级
            isFull: false,
            deviceList: [],
            monitorActive: {},
            deviceActive: {},
            areaData: [],
            listenZoom: false,
            showModal: {
                isShow: false,
            },
        }
    },
    methods: {
        // 生成地图
        initMap() {
            baseLayer = new Tile({
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
            })
            // 添加遮罩层
            this.addCover()
            // 添加浙江省高亮
            this.addArea()
            // 初始化显示聚合
            this.resetMap()
            // 添加监听事件
            this.addMapListener()
        },
        // 添加浙江省区域线
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
        },
        // 添加遮罩层
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
        // 获取地图数据返回图层
        getMapData() {
            let data = []
            switch (this.mapType) {
                case 2:
                    data = jhData
                    break
                case 1:
                case 3:
                    data = rlData
                    break
                default:
                    break
            }
            return new Promise((resolve) => {
                const features = []
                data.forEach((el) => {
                    features.push(
                        new Feature({
                            geometry: new Point(fromLonLat([el.longitude, el.latitude])),
                            ...el,
                        })
                    )
                })
                let vectorSource = new VectorSource({ features: features })
                resolve(vectorSource)
            })
        },
        // 清除所有图层
        clearMap() {
            let pointList = [devicePoint, monitorPoint]
            pointList.forEach((el) => {
                if (el) {
                    map.removeOverlay(el)
                }
            })
            let layers = [areaLayer, countLayer, monitorLayer, deviceLayer]
            layers.forEach((el) => {
                if (el) {
                    map.removeLayer(el)
                    el.dispose()
                }
            })
        },
        // 获取聚合图层
        async getPolymerization(zoom) {
            let vectorSource = await this.getMapData(zoom)
            areaLayer = new VectorLayer({
                zIndex: 99,
                source: vectorSource,
                style: function (feature) {
                    let thisText = feature.get('name') //获取各个个体的名字
                    let style = null
                    style = new Style({
                        text: new Text({
                            text: thisText, //文本
                            font: '20px YouSheBiaoTiHei-Regular, YouSheBiaoTiHei', //字体大小和字体
                            fill: new Fill({
                                //文字填充颜色
                                color: '#FFFFFF',
                            }),
                        }),
                    })
                    return [style]
                },
            })
            countLayer = new VectorLayer({
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
            // map.addLayer(areaLayer)
            map.addLayer(countLayer)
        },
        // 获取站点数据
        async getStationData() {
            let vectorSource = await this.getMapData(11)
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
                    },
                },
                zIndex: 99,
            })
            map.addLayer(monitorLayer)
        },
        // 获取热力数据
        async getDensityData() {
            let vectorSource = await this.getMapData(11)
            monitorLayer = new Heatmap({
                source: vectorSource,
                blur: 15,
                radius: 5,
                weight: () => {
                    return 0.5
                },
                zIndex: 99,
            })
            map.addLayer(monitorLayer)
        },
        // 监听地图点击事件
        addMapListener() {
            // 监听缩放并获取缩放倍数
            map.on('moveend', () => {
                this.zoom = map.getView().getZoom()
            })
            // 鼠标经过点时变成手
            map.on('pointermove', (e) => {
                let isInvalid =
                    (this.zoom < 11 && this.mapType === 2 && !this.monitorActive.monitorPointId) || (this.mapType === 3 && !this.monitorActive.monitorPointId)
                if (isInvalid) {
                    return false
                }
                const pixel = e.pixel
                map.getTargetElement().style.cursor = 'unset'
                map.forEachFeatureAtPixel(pixel, () => {
                    map.getTargetElement().style.cursor = 'pointer'
                })
            })
            // 点击点打开弹窗
            map.on('singleclick', (e) => {
                let isInvalid =
                    (this.zoom < 11 && this.mapType === 2 && !this.monitorActive.monitorPointId) || (this.mapType === 3 && !this.monitorActive.monitorPointId)
                if (isInvalid) {
                    return false
                }
                map.forEachFeatureAtPixel(e.pixel, (feature) => {
                    let data = feature.values_
                    if (feature.values_.monitorPointId) {
                        this.monitorClick(data)
                    } else if (feature.values_.id) {
                        this.deviceClick(data)
                        this.positionDeviceDetail(data)
                    }
                })
            })
        },
        // 监测点点击
        monitorClick(data) {
            if (monitorPoint) {
                map.removeOverlay(monitorPoint)
            }
            this.monitorActive = data
            let mapDom = this.$refs.map
            let oDiv = document.createElement('span')
            oDiv.id = 'monitorActive'
            oDiv.className = 'monitor-active'
            mapDom.appendChild(oDiv)
            this.$nextTick(() => {
                monitorPoint = new Overlay({
                    position: fromLonLat([data.longitude, data.latitude]),
                    element: document.getElementById('monitorActive'),
                    positioning: 'center-center',
                    stopEvent: false,
                })
                map.addOverlay(monitorPoint)
            })
        },
        // 根据设备数据设置图层
        setDeviceLayer(data) {
            if (devicePoint) {
                map.removeOverlay(devicePoint)
            }
            if (deviceLayer) {
                map.removeLayer(deviceLayer)
                deviceLayer.dispose()
            }
            const features = []
            data.forEach((el) => {
                features.push(
                    new Feature({
                        geometry: new Point(fromLonLat([el.longitude, el.latitude])),
                        ...el,
                    })
                )
            })
            let vectorSource = new VectorSource({ features: features })
            deviceLayer = new WebGL({
                source: vectorSource,
                style: {
                    symbol: {
                        symbolType: 'image',
                        src: require('./img/device.png'),
                        rotateWithView: false,
                        offset: [0, 0],
                        size: [32, 32],
                    },
                },
                zIndex: 100,
            })
            map.addLayer(deviceLayer)
        },
        // 设备点点击
        deviceClick(data) {
            if (devicePoint) {
                map.removeOverlay(devicePoint)
            }
            if (!data.longitude) {
                return false
            }
            this.deviceActive = data
            let mapDom = this.$refs.map
            let oDiv = document.createElement('span')
            oDiv.id = 'deviceActive'
            oDiv.className = 'device-active'
            mapDom.appendChild(oDiv)
            this.$nextTick(() => {
                devicePoint = new Overlay({
                    position: fromLonLat([data.longitude, data.latitude]),
                    element: document.getElementById('deviceActive'),
                    positioning: 'center-center',
                    stopEvent: false,
                })
                map.addOverlay(devicePoint)
            })
        },
        // 选择数据： 站点、聚合、热力
        changeMapData() {
            switch (this.mapType) {
                case 1: {
                    this.getStationData()
                    break
                }
                case 2: {
                    this.getPolymerization()
                    break
                }
                case 3: {
                    this.getDensityData()
                    break
                }
            }
        },
        // 点击复位
        resetMap() {
            this.listenZoom = false
            this.clearMap()
            this.changeMapData()
            map.getView().animate({
                // 只设置需要的属性即可
                center: fromLonLat([120.454493, 29.082613]),
                zoom: 7,
            })
            // 清空监测点
            this.monitorActive = {}
            this.deviceActive = {}
            setTimeout(() => {
                this.listenZoom = true
            }, 1000)
        },
        // 监测点弹框点击，地图变成站点
        async monitorPositionClick(item) {
            if (item.monitorPointId === this.monitorActive.monitorPointId) {
                return false
            }
            if (item.longitude) {
                // 如果点击监测点变化 不用再次重置图层
                if (!this.monitorActive.monitorPointId) {
                    this.clearMap()
                    await this.getStationData()
                } else {
                    if (deviceLayer) {
                        map.removeLayer(deviceLayer)
                        deviceLayer.dispose()
                    }
                }
                map.getView().animate({
                    center: fromLonLat([item.longitude, item.latitude]),
                })
                this.monitorClick(item)
            } else {
                if (monitorPoint) {
                    map.removeOverlay(monitorPoint)
                }
                if (deviceLayer) {
                    map.removeLayer(deviceLayer)
                    deviceLayer.dispose()
                }
            }
        },
        // 设备列表设备点击
        positionDeviceClick(item) {
            map.getView().animate({
                center: fromLonLat([item.longitude, item.latitude]),
            })
            this.deviceClick(item)
        },
        positionDeviceDetail(item) {
            this.deviceActive = item
            this.showModal.isShow = true
        },
    },
    mounted() {
        this.$nextTick(this.initMap)
    },
    beforeDestroy() {
        map = null
        baseLayer = null // 地图底图
        areaLayer = null // 区域图层
        countLayer = null // 区域值图层
        monitorLayer = null
        monitorPoint = null
        deviceLayer = null
        devicePoint = null
    },
}
</script>

<style lang="less" scoped>
.map-content,
#map {
    position: relative;
    width: 100%;
    height: 500px;
}
:deep(.monitor-active) {
    display: block;
    width: 80px;
    height: 80px;
    background: url('./img/monitor.png') no-repeat;
    background-size: 80px 80px;
}
:deep(.device-active) {
    display: block;
    width: 36px;
    height: 36px;
    background: url('./img/device-active.png') no-repeat;
    background-size: 36px 36px;
    z-index: 999;
}
.ope-box {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    z-index: 9;
    .box-bg {
        border-radius: 4px 4px 4px 4px;
        padding: 0 8px;
        margin-right: 8px;
        height: 32px;
        display: flex;
        align-items: center;
        cursor: pointer;
        position: relative;
        .select-icon {
            position: absolute;
            left: 12px;
            z-index: 3;
        }
    }
    .reset-box {
        padding: 4px 6px;
        border-radius: 4px 4px 4px 4px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        &:hover {
            background: linear-gradient(180deg, rgba(0, 135, 255, 0.25) 0%, rgba(0, 135, 255, 0.52) 100%);
        }
    }
    .reset-txt {
        font-size: 12px;
        font-family: PingFang SC-Regular, PingFang SC;
        color: #69cbf5;
        margin-left: 4px;
        &:hover {
            color: #ffffff;
        }
    }
}
</style>
