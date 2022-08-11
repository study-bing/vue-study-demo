<!--
 * @Author: virgouss gu.shi.chen15@qq.com
 * @Date: 2022-08-08 17:26:21
 * @LastEditors: virgouss gu.shi.chen15@qq.com
 * @LastEditTime: 2022-08-10 09:28:54
 * @FilePath: /task/src/views/cesiumDemo/Index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
    <div>
        <div class="page-desc">介绍：三维地图cesium，主要内容为数据展示，加载模型，弹窗跟随等</div>
        <div class="page-desc">1.demo演示</div>
        <CesiumDemo></CesiumDemo>
        <div class="page-desc">2.引入依赖</div>
        <div class="page-desc">1.npm 加载</div>
        <code-show
            code="npm install cesium;
import { Viewer } from 'cesium';
import 'cesium/widgets.css';

//同时需要把Assets,ThirdParty,Widgets,Workers资源文件copy进根目录，否则cesium会因找不到资源报404;
npm install copy-webpack-plugin -D
const CopyWebpackPlugin = require('copy-webpack-plugin')
new CopyWebpackPlugin({
                patterns: [
                    { from: path.join(cesiumSource, '../Build/Cesium/Workers'), to: 'Workers' },
                    { from: path.join(cesiumSource, '../Build/Cesium/Assets'), to: 'Assets' },
                    { from: path.join(cesiumSource, '../Build/Cesium/Widgets'), to: 'Widgets' },
                    { from: path.join(cesiumSource, '../Build/Cesium/ThirdParty'), to: 'ThirdParty' },
                ],
            }) // 拷贝Cesium资源、控件、WebWorker到静态目录。
"
        />
        <div class="page-desc mt-16">2.js引入,引入整个cesium包，包含资源文件；</div>
        <code-show
            code="<link rel='stylesheet' href='./Cesium/Widgets/widgets.css' />;
<script type='text/javascript' src='./Cesium/Cesium.js'></script>; "
        />
        <div class="page-desc mt-16">3.初始化地图</div>
        <code-show
            code="this.viewer = new Cesium.Viewer('ceisumCont', {
                animation: false, //是否创建动画小器件，左下角仪表
                homeButton: false, //是否显示Home按钮
                geocoder: false, //是否显示geocoder小器件，右上角查询按钮
                infoBox: false, //是否显示信息框
                fullscreenButton: false, //是否显示全屏按钮
                timeline: false, //是否显示时间轴
                selectionIndicator: false, //是否显示选取指示器组件
                sceneModePicker: false, //是否显示3D/2D选择器
                navigationHelpButton: false, //是否显示右上角的帮助按钮
                scene3DOnly: true, //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
                baseLayerPicker: false,
                sceneMode: 3,
                maxZoom: 18,
            })
            this.mapData.underlyingGraphBlack = new Cesium.UrlTemplateImageryProvider({
                url: 'http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
                minimumLevel: 1,
                maximumLevel: 17,
                // maxminmunLevelk:
            })

            this.viewer.imageryLayers.addImageryProvider(this.mapData.underlyingGraphBlack)
            // 地形地图
            this.mapData.terrainLayer = new Cesium.CesiumTerrainProvider({
                url: 'http://data.mars3d.cn/terrain', // 默认立体地表
                requestWaterMask: true,
                requestVertexNormals: true,
                isSct: false,
            })
            this.viewer.terrainProvider = this.mapData.terrainLayer

            this.viewer._cesiumWidget._creditContainer.style.display = 'none'
            // 右上角层级选择器
            document.getElementsByClassName('cesium-viewer-navigationContainer').item(0).style.display = 'none'
            // 行政边界
            this.mapData.boundaries = new Cesium.WebMapServiceImageryProvider({
                url: 'http://116.62.159.101:8082/geoserver/gwc/service/wms',
                layers: 'pass-ziyan:ctSaas',
                parameters: {
                    service: 'WMS',
                    format: 'image/png',
                    transparent: true,
                },
                proxy: new Cesium.DefaultProxy('/proxy/'),
            })
            this.viewer.imageryLayers.addImageryProvider(this.mapData.boundaries)

            this.viewer.scene.globe.depthTestAgainstTerrain = false // 关闭地形深度 "
        />
        <div class="page-desc mt-16">4.初始化中心点</div>
        <code-show
            code="// 视角飞入某点位
            this.flyOrg()"
        />
        <code-show
            code="// 定位到中心点，默认点位目前在余杭区
        flyOrg(lat, lon, height) {
            let boundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(119.91592959618292, 30.35900199999631, 0), 25000)
            if (lat && lon) {
                boundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(lon, lat, 0), 25000)
            }
            this.viewer.camera.flyToBoundingSphere(boundingSphere, {
                duration: 0,
                complete: () => {
                    this.viewer.entities.remove(boundingSphere)
                },
                offset: {
                    heading: Cesium.Math.toRadians(0),
                    pitch: Cesium.Math.toRadians(-90.0),
                    roll: 0.0,
                },
            })
        }"
        />
        <div class="page-desc mt-16">5.加载点位</div>
        <code-show
            code="loadPoints(param) {
            let vm = this
            let data = JSON.parse(JSON.stringify(param))
            let positions = []
            positions = data.map((it) => {
                return Cesium.Cartesian3.fromDegrees(Number(it.longitude), Number(it.latitude))
            })
            // 将点位坐标匹配到地形地图中
            let promise = Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, positions)
            Cesium.when(promise, (updatedPositions) => {
                data.forEach((it, index) => {
                    // 获取点位图标
                    let pic = ''
                    pic = vm.getImage()
                    // 支持点位显隐
                    let isShow = true
                    // 将点位添加进地图中
                    // 点位属性可根据需要自行添加，类似于data-xx='xxx'
                    let pointsIt = this.viewer.entities.add({
                        id: `point${it.id}`,
                        it: it.id,
                        datas: it,
                        latlng: [Number(it.longitude), Number(it.latitude)],
                        images: pic,
                        show: isShow,
                        position: Cesium.Cartesian3.fromDegrees(Number(it.longitude), Number(it.latitude), updatedPositions[index].height),
                        billboard: {
                            //面板图标
                            image: pic,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            width: 26,
                            height: 26,
                            disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        },
                    })
                    // 添加进数组，方便对同类点位进行批量操作

                    this.points.push(pointsIt)
                })
            })
        },
        getImage() {
            return require('./img/riskArea.png')
        }"
        />
        <div class="page-desc mt-16">6.点击点位</div>
        <code-show
            code="clickGis() {
            let vm = this
            let handler = new Cesium.ScreenSpaceEventHandler(vm.viewer.scene.canvas)
            handler.setInputAction((movement) => {
                // 点击动作
                // 拾取当前点位在地图上的位置
                let pickedFeature = vm.viewer.scene.pick(movement.position)
                // 说明是实打实的点击在了点位上，而不是遮罩层或者图形
                const pickedCont = pickedFeature && pickedFeature.id
                // 会出现不同类型的点位
                if (Object.prototype.hasOwnProperty.call(pickedCont.datas, 'midasUrl')) {
                    vm.midasUrl = pickedCont.datas.midasUrl
                }
                if (vm.curPoint) {
                    // 重置点击过的点位
                    vm.curPoint.billboard.image = require('./img/riskArea.png')
                    vm.curPoint.billboard.width = 26
                    vm.curPoint.billboard.height = 26
                }
                // 设置当前点位
                vm.curPoint = vm.viewer.entities.getById(pickedCont.id)
                // 设置当前点位的图片
                vm.curPoint.billboard.image = require('./img/riskArea-active.png')
                vm.curPoint.billboard.width = 28
                vm.curPoint.billboard.height = 36
                // 保存点位经纬度
                vm.getModalLonlat(pickedCont)

                // 弹出弹窗,存取数据内容
                vm.dialogVisible = true
                vm.pointData = pickedCont.datas
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        }
getModalLonlat(pickedCont) {
            // 获取点位位置
            let scene = this.viewer.scene
            let ellipsoid = scene.globe.ellipsoid
            let height = ellipsoid.cartesianToCartographic(this.viewer.camera.position).height
            this.modalLonlat.lat = Number(pickedCont.datas.latitude)
            this.modalLonlat.height = height
            this.modalLonlat.lon = Number(pickedCont.datas.longitude)

            this.flyOrg(this.modalLonlat.lat, this.modalLonlat.lon, this.modalLonlat.height)
        },"
        />
        <div class="page-desc mt-16">7.获取点位经纬度，弹窗跟随</div>
        <code-show
            code="// 弹窗跟随点位
        getPosition(position) {
            this.modelTop = position?.modelTop || null
            this.modelLeft = position?.modelLeft || null
            this.$nextTick(() => {
                if (document.querySelector('.reservoirsModal')) {
                    document.querySelector('.reservoirsModal').firstChild.style.left = this.modelLeft
                    document.querySelector('.reservoirsModal').firstChild.style.top = this.modelTop
                    document.querySelector('.reservoirsModal').firstChild.style.transform = 'none'
                }
            })
        }
// 监听地图上的行为
            this.viewer.scene.preRender.addEventListener(() => {
                //弹窗跟随
                if (this.modalLonlat.lon && this.modalLonlat.lat) {
                    let position = Cesium.Cartesian3.fromDegrees(this.modalLonlat.lon, this.modalLonlat.lat, 0)
                    // 转坐标为屏幕上的left和top
                    let winPosi = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, position)
                    if (winPosi) {
                        // winPosi.y 为点位的位置

                        this.modelTop = `${winPosi.y - 190}px`
                        this.modelLeft = `${winPosi.x - 640}px`

                        this.getPosition({
                            modelTop: this.modelTop,
                            modelLeft: this.modelLeft,
                        })
                    }
                }
            })"
        />
        <div class="page-desc mt-16">8.加载倾斜摄影</div>
        <code-show
            code="preventAreas() {
            let url = this.midasUrl
            // 添加倾斜射影
            let tileset = this.viewer.scene.primitives.add(
                new Cesium.Cesium3DTileset({
                    url: url,
                    maximumScreenSpaceError: 2,
                    maximumNumberOfLoadedTiles: 1000,
                    isScp: false,
                })
            )
            // 添加进数组，方便批量操作
            this.totalPri.push(tileset)
            // viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -0.5, 0))

            let lng = Number(this.viewer.entities.getById(curPreventAreas.id).datas.longitude)
            let lat = Number(this.viewer.entities.getById(curPreventAreas.id).datas.latitude)
            // 动态飞入此模型，放大地图
            this.viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(lng, lat, 900),
                orientation: {
                    heading: Cesium.Math.toRadians(0),
                    pitch: Cesium.Math.toRadians(-90.0),
                    roll: 0.0,
                },
            })
        }"
        />
    </div>
</template>
<script>
import CesiumDemo from './CesiumTemp.vue'
import CodeShow from '@components/CodeShow'
//例如：import 《组件名称》 from '《组件路径》';
export default {
    //import引入的组件需要注入到对象中才能使用
    name: 'cesiumIndex',
    components: {
        CesiumDemo,
        CodeShow,
    },
    props: {},
    data() {
        //这里存放数据
        return {}
    },
    //监听属性 类似于data概念
    computed: {},
    //监控data中的数据变化
    watch: {},
    //方法集合
    methods: {},
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() {},
    activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
}
</script>
<style lang="less" scoped></style>
