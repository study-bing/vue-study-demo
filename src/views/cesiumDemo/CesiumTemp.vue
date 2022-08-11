<!--
 * @Author: virgouss gu.shi.chen15@qq.com
 * @Date: 2022-08-08 17:35:06
 * @LastEditors: virgouss gu.shi.chen15@qq.com
 * @LastEditTime: 2022-08-10 09:48:36
 * @FilePath: /task/src/views/cesiumDemo/cesium.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
    <div>
        <div id="ceisumCont" class="cesium-cont"></div>
        <el-dialog class="reservoirsModal" :title="'内容'" :visible.sync="dialogVisible" width="300px">
            <p>防范区名称：{{ pointData.areasName }}</p>
            <p>中心点坐标：经度 {{ pointData.longitude }} 纬度 {{ pointData.latitude }}</p>
            <p>风险防范区编号：{{ pointData.serialNumber }}</p>
            <p>风险等级：{{ pointData.level }}</p>
            <el-button v-if="pointData.midasUrl" @click="preventAreas" size="small">查看</el-button>
        </el-dialog>
    </div>
</template>
<script>
//例如：import 《组件名称》 from '《组件路径》';
// import { Viewer } from 'cesium'
// import 'cesium/widgets.css'
export default {
    //import引入的组件需要注入到对象中才能使用
    components: {},
    props: {},
    data() {
        //这里存放数据
        return {
            mapData: {
                underlyingGraphBlack: null,
                terrainLayer: null,
                boundaries: null,
            },
            viewer: null,
            points: [],
            curPoint: null,
            dialogVisible: false,
            pointData: {},
            totalPri: [],
            midasUrl: '', //模型地址
            modalLonlat: {},
        }
    },
    //监听属性 类似于data概念
    computed: {},
    //监控data中的数据变化
    watch: {},
    //方法集合
    methods: {
        // 地图初始化
        initMap() {
            this.viewer = new Cesium.Viewer('ceisumCont', {
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

            this.viewer.scene.globe.depthTestAgainstTerrain = false // 关闭地形深度

            // 视角飞入某点位
            this.flyOrg()
            // 点击事件
            this.clickGis()

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
            })

            let data = [
                {
                    id: 1,
                    name: '鸬鸟镇仙陌坑村余家背自然村风险防范区',
                    serialNumber: '330110FF0017',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110111000,
                    areasCode: 330110111000,
                    areasName: '鸬鸟镇',
                    latitude: 30.456128,
                    longitude: 119.730525,
                    level: '一般',
                    houseNumber: 10,
                    familyNumber: 37,
                    residentNumber: 23,
                    entryNumber: 28,
                    avoidDisasterPlaces: '仙佰坑村委',
                },
                {
                    id: 2,
                    name: '鸬鸟镇太上路自然村73号风险防范区',
                    serialNumber: '330110FF0018',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110111000,
                    areasCode: 330110111000,
                    areasName: '鸬鸟镇',
                    latitude: 30.431438,
                    longitude: 119.741309,
                    level: '一般',
                    houseNumber: 1,
                    familyNumber: 4,
                    residentNumber: 4,
                    entryNumber: 4,
                    avoidDisasterPlaces: '太平上村委',
                },
                {
                    id: 3,
                    name: '鸬鸟镇祝家湾自然村33-37、52-54号风险防范区',
                    serialNumber: '330110FF0019',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110111000,
                    areasCode: 330110111000,
                    areasName: '鸬鸟镇',
                    latitude: 30.431851,
                    longitude: 119.749659,
                    level: '一般',
                    houseNumber: 7,
                    familyNumber: 29,
                    residentNumber: 21,
                    entryNumber: 29,
                    avoidDisasterPlaces: '太平山村委',
                },
                {
                    id: 4,
                    name: '鸬鸟镇仙佰坑村后畈吉毛坞61号、64号房屋东侧崩塌，63号、66号房屋西侧崩塌',
                    serialNumber: '330110FF0020',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110111000,
                    areasCode: 330110111000,
                    areasName: '鸬鸟镇',
                    latitude: 30.456391,
                    longitude: 119.711193,
                    level: '重点',
                    houseNumber: 4,
                    familyNumber: 16,
                    residentNumber: 15,
                    entryNumber: 16,
                    avoidDisasterPlaces: '仙佰坑村委',
                },
                {
                    id: 5,
                    name: '鸬鸟镇仙佰坑村沈家堂自然村风险防范区',
                    serialNumber: '330110FF0021',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110111000,
                    areasCode: 330110111000,
                    areasName: '鸬鸟镇',
                    latitude: 30.468643,
                    longitude: 119.711072,
                    level: '重点',
                    houseNumber: 9,
                    familyNumber: 40,
                    residentNumber: 34,
                    entryNumber: 34,
                    avoidDisasterPlaces: '仙佰坑村委',
                },
                {
                    id: 6,
                    name: '鸬鸟镇前庄村窑厂自然村22-33号风险防范区',
                    serialNumber: '330110FF0022',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110111000,
                    areasCode: 330110111000,
                    areasName: '鸬鸟镇',
                    latitude: 30.457828,
                    longitude: 119.739521,
                    level: '一般',
                    houseNumber: 6,
                    familyNumber: 23,
                    residentNumber: 8,
                    entryNumber: 21,
                    avoidDisasterPlaces: '前庄村委',
                },
                {
                    id: 7,
                    name: '鸬鸟镇祝家庄、俞家塘风险防范区',
                    serialNumber: '330110FF0024',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110111000,
                    areasCode: 330110111000,
                    areasName: '鸬鸟镇',
                    latitude: 30.425836,
                    longitude: 119.764271,
                    level: '一般',
                    houseNumber: 13,
                    familyNumber: 50,
                    residentNumber: 35,
                    entryNumber: 50,
                    avoidDisasterPlaces: '太平山村委',
                },
                {
                    id: 8,
                    name: '鸬鸟镇前庄村赵家自然村2、3、4号风险防范区',
                    serialNumber: '330110FF0025',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110111000,
                    areasCode: 330110111000,
                    areasName: '鸬鸟镇',
                    latitude: 30.463778,
                    longitude: 119.741854,
                    level: '一般',
                    houseNumber: 3,
                    familyNumber: 13,
                    residentNumber: 8,
                    entryNumber: 12,
                    avoidDisasterPlaces: '前庄村委',
                },
                {
                    id: 9,
                    name: '鸬鸟镇前庄村15组芝坞里1号屋后风险防范区',
                    serialNumber: '330110FF0026',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110111000,
                    areasCode: 330110111000,
                    areasName: '鸬鸟镇',
                    latitude: 30.453781,
                    longitude: 119.736574,
                    level: '重点',
                    houseNumber: 2,
                    familyNumber: 9,
                    residentNumber: 7,
                    entryNumber: 8,
                    avoidDisasterPlaces: '前庄村委',
                    midasUrl: 'http://192.168.0.73/ctdownload/qz/tileset.json',
                },
                {
                    id: 10,
                    name: '鸬鸟镇太平山村金鸡山6号陈生荣屋后滑坡',
                    serialNumber: '330110FF0052',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110111000,
                    areasCode: 330110111000,
                    areasName: '鸬鸟镇',
                    latitude: 30.435157,
                    longitude: 119.749843,
                    level: '重点',
                    houseNumber: 1,
                    familyNumber: 7,
                    residentNumber: 4,
                    entryNumber: 7,
                    avoidDisasterPlaces: '太平山村委',
                    midasUrl: 'http://192.168.0.73/ctdownload/tp/tileset.json',
                },
                {
                    id: 11,
                    name: '径山村桐桥57号附房后风险防范区',
                    serialNumber: '330110FF0051',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110111000,
                    areasCode: 330110111000,
                    areasName: '鸬鸟镇',
                    latitude: 30.385518,
                    longitude: 119.77538,
                    level: '重点',
                    houseNumber: 1,
                    familyNumber: 5,
                    residentNumber: 5,
                    entryNumber: 3,
                    avoidDisasterPlaces: '桐桥驿站',
                },
                {
                    id: 12,
                    name: '径山镇泗岭村乾皇自然村2号风险防范区',
                    serialNumber: '330110FF0050',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110111000,
                    areasCode: 330110111000,
                    areasName: '鸬鸟镇',
                    latitude: 30.418904,
                    longitude: 119.789595,
                    level: '一般',
                    houseNumber: 1,
                    familyNumber: 4,
                    residentNumber: 4,
                    entryNumber: 2,
                    avoidDisasterPlaces: '四岭村委',
                },
                {
                    id: 13,
                    name: '良渚街道安溪村下塘14号房后风险防范区',
                    serialNumber: '330110FF0001',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110010000,
                    areasCode: 330110010000,
                    areasName: '良渚街道',
                    latitude: 30.432566,
                    longitude: 120.033198,
                    level: '重点',
                    houseNumber: 1,
                    familyNumber: 4,
                    residentNumber: 4,
                    entryNumber: 8,
                    avoidDisasterPlaces: '安溪村委',
                },
                {
                    id: 14,
                    name: '中泰街道新泰村19组马岭脚68-1号吴海峰屋后风险防范区',
                    serialNumber: '330110FF0004',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110014000,
                    areasCode: 330110014000,
                    areasName: '中泰街道',
                    latitude: 30.217264,
                    longitude: 119.887702,
                    level: '重点',
                    houseNumber: 1,
                    familyNumber: 6,
                    residentNumber: 6,
                    entryNumber: 6,
                    avoidDisasterPlaces: '新泰村村委会避灾点',
                },
                {
                    id: 15,
                    name: '中泰街道紫荆村二十四组黄家坎73-74号风险防范区',
                    serialNumber: '330110FF0005',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110014000,
                    areasCode: 330110014000,
                    areasName: '中泰街道',
                    latitude: 30.189687,
                    longitude: 119.857427,
                    level: '重点',
                    houseNumber: 2,
                    familyNumber: 8,
                    residentNumber: 8,
                    entryNumber: 7,
                    avoidDisasterPlaces: '紫荆村村委会避灾点',
                },
                {
                    id: 16,
                    name: '余杭街道竹园村响山5号风险防范区',
                    serialNumber: '330110FF0013',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110013000,
                    areasCode: 330110013000,
                    areasName: '余杭街道',
                    latitude: 30.267414,
                    longitude: 119.875166,
                    level: '一般',
                    houseNumber: 1,
                    familyNumber: 4,
                    residentNumber: 6,
                    entryNumber: 4,
                    avoidDisasterPlaces: '竹园村村委',
                },
                {
                    id: 17,
                    name: '余杭街道竹园村攀弓岭25号风险防范区',
                    serialNumber: '330110FF0010',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110013000,
                    areasCode: 330110013000,
                    areasName: '余杭街道',
                    latitude: 30.279272,
                    longitude: 119.853299,
                    level: '一般',
                    houseNumber: 1,
                    familyNumber: 4,
                    residentNumber: 6,
                    entryNumber: 1,
                    avoidDisasterPlaces: '竹园村村委',
                },
                {
                    id: 18,
                    name: '余杭街道下陡门村仇山风险防范区',
                    serialNumber: '330110FF0012',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110013000,
                    areasCode: 330110013000,
                    areasName: '余杭街道',
                    latitude: 30.339836,
                    longitude: 119.904923,
                    level: '重点',
                    houseNumber: 1,
                    familyNumber: 10,
                    residentNumber: 4,
                    entryNumber: 3,
                    avoidDisasterPlaces: '村委',
                },
                {
                    id: 19,
                    name: '余杭街道宝塔社区杭州市余杭区种子公司风险防范区',
                    serialNumber: '330110FF0011',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110013000,
                    areasCode: 330110013000,
                    areasName: '余杭街道',
                    latitude: 30.271095,
                    longitude: 119.939146,
                    level: '一般',
                    houseNumber: 1,
                    familyNumber: 7,
                    residentNumber: 7,
                    entryNumber: 8,
                    avoidDisasterPlaces: '宝塔社区办公楼',
                },
                {
                    id: 20,
                    name: '黄湖镇赐壁村铜山头13号风险防范区',
                    serialNumber: '330110FF0031',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110113000,
                    areasCode: 330110113000,
                    areasName: '黄湖镇',
                    latitude: 30.463193,
                    longitude: 119.823893,
                    level: '一般',
                    houseNumber: 1,
                    familyNumber: 5,
                    residentNumber: 5,
                    entryNumber: 5,
                    avoidDisasterPlaces: '青铜里老年活动室',
                },
                {
                    id: 21,
                    name: '百丈镇半山村里半山自然村7号风险防范区',
                    serialNumber: '330110FF0027',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110112000,
                    areasCode: 330110112000,
                    areasName: '百丈镇',
                    latitude: 30.546382,
                    longitude: 119.712736,
                    level: '一般',
                    houseNumber: 1,
                    familyNumber: 3,
                    residentNumber: 3,
                    entryNumber: 3,
                    avoidDisasterPlaces: '半山村',
                },
                {
                    id: 22,
                    name: '百丈镇半山村牙山自然村8号风险防范区',
                    serialNumber: '330110FF0028',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110112000,
                    areasCode: 330110112000,
                    areasName: '百丈镇',
                    latitude: 30.556356,
                    longitude: 119.695065,
                    level: '一般',
                    houseNumber: 1,
                    familyNumber: 4,
                    residentNumber: 4,
                    entryNumber: 1,
                    avoidDisasterPlaces: '半山村',
                },
                {
                    id: 23,
                    name: '百丈镇仙岩村王家堂自然村111号风险防范区',
                    serialNumber: '330110FF0029',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110112000,
                    areasCode: 330110112000,
                    areasName: '百丈镇',
                    latitude: 30.49966,
                    longitude: 119.714759,
                    level: '一般',
                    houseNumber: 1,
                    familyNumber: 5,
                    residentNumber: 5,
                    entryNumber: 5,
                    avoidDisasterPlaces: '仙岩村',
                },
                {
                    id: 24,
                    name: '闲林街道里项村龙庆寺8-1，9号、7号风险防范区',
                    serialNumber: '330110FF0008',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110011000,
                    areasCode: 330110011000,
                    areasName: '闲林街道',
                    latitude: 30.211168,
                    longitude: 119.973377,
                    level: '一般',
                    houseNumber: 3,
                    familyNumber: 15,
                    residentNumber: 14,
                    entryNumber: 15,
                    avoidDisasterPlaces: '村委',
                },
                {
                    id: 25,
                    name: '闲林街道联荣社区五杰钢制品有限公司风险防范区',
                    serialNumber: '330110FF0007',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110011000,
                    areasCode: 330110011000,
                    areasName: '闲林街道',
                    latitude: 30.216651,
                    longitude: 119.967956,
                    level: '一般',
                    houseNumber: 1,
                    familyNumber: 5,
                    residentNumber: 0,
                    entryNumber: 5,
                    avoidDisasterPlaces: '村委',
                },
                {
                    id: 26,
                    name: '瓶窑镇彭公村卸车上村25、29号南侧风险防范区',
                    serialNumber: '330110FF0042',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110110000,
                    areasCode: 330110110000,
                    areasName: '瓶窑镇',
                    latitude: 30.448435,
                    longitude: 119.90223,
                    level: '一般',
                    houseNumber: 2,
                    familyNumber: 7,
                    residentNumber: 7,
                    entryNumber: 7,
                    avoidDisasterPlaces: '卸车文化礼堂',
                },
                {
                    id: 27,
                    name: '瓶窑镇奇鹤村金家角10，11，16，19号风险防范区',
                    serialNumber: '330110FF0041',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110110000,
                    areasCode: 330110110000,
                    areasName: '瓶窑镇',
                    latitude: 30.454461,
                    longitude: 119.8788,
                    level: '一般',
                    houseNumber: 4,
                    familyNumber: 20,
                    residentNumber: 20,
                    entryNumber: 20,
                    avoidDisasterPlaces: '奇鹤村委',
                },
                {
                    id: 28,
                    name: '瓶窑镇奇鹤村方加文、方正法屋后风险防范区',
                    serialNumber: '330110FF0049',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110110000,
                    areasCode: 330110110000,
                    areasName: '瓶窑镇',
                    latitude: 30.451883,
                    longitude: 119.884815,
                    level: '重点',
                    houseNumber: 2,
                    familyNumber: 8,
                    residentNumber: 6,
                    entryNumber: 6,
                    avoidDisasterPlaces: '奇鹤村委',
                },
                {
                    id: 29,
                    name: '瓶窑镇奇鹤村里村25号风险防范区',
                    serialNumber: '330110FF0044',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110110000,
                    areasCode: 330110110000,
                    areasName: '瓶窑镇',
                    latitude: 30.439322,
                    longitude: 119.89422,
                    level: '一般',
                    houseNumber: 1,
                    familyNumber: 5,
                    residentNumber: 4,
                    entryNumber: 4,
                    avoidDisasterPlaces: '奇鹤村委',
                },
                {
                    id: 30,
                    name: '瓶窑镇塘埠村陆家堂自然村19号风险防范区',
                    serialNumber: '330110FF0037',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110110000,
                    areasCode: 330110110000,
                    areasName: '瓶窑镇',
                    latitude: 30.464989,
                    longitude: 119.859881,
                    level: '一般',
                    houseNumber: 1,
                    familyNumber: 3,
                    residentNumber: 2,
                    entryNumber: 3,
                    avoidDisasterPlaces: '王家村九间头',
                },
                {
                    id: 31,
                    name: '瓶窑镇塘埠村东坞自然村37号风险防范区',
                    serialNumber: '330110FF0038',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110110000,
                    areasCode: 330110110000,
                    areasName: '瓶窑镇',
                    latitude: 30.433638,
                    longitude: 119.878824,
                    level: '一般',
                    houseNumber: 1,
                    familyNumber: 5,
                    residentNumber: 5,
                    entryNumber: 5,
                    avoidDisasterPlaces: '塘埠村委',
                },
                {
                    id: 32,
                    name: '瓶窑镇塘埠村许家口自然村13号风险防范区',
                    serialNumber: '330110FF0047',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110110000,
                    areasCode: 330110110000,
                    areasName: '瓶窑镇',
                    latitude: 30.456196,
                    longitude: 119.855031,
                    level: '一般',
                    houseNumber: 1,
                    familyNumber: 3,
                    residentNumber: 3,
                    entryNumber: 3,
                    avoidDisasterPlaces: '王家村九间头',
                },
                {
                    id: 33,
                    name: '瓶窑镇塘埠村王家村自然村9-1号风险防范区',
                    serialNumber: '330110FF0048',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110110000,
                    areasCode: 330110110000,
                    areasName: '瓶窑镇',
                    latitude: 30.451589,
                    longitude: 119.854775,
                    level: '一般',
                    houseNumber: 1,
                    familyNumber: 7,
                    residentNumber: 5,
                    entryNumber: 5,
                    avoidDisasterPlaces: '王家村九间头',
                },
                {
                    id: 34,
                    name: '瓶窑镇杨梅坞社区窑山北路66、71号风险防范区',
                    serialNumber: '330110FF0045',
                    provinceCode: 330000,
                    cityCode: 330100,
                    districtCode: 330110,
                    streetCode: 330110110000,
                    areasCode: 330110110000,
                    areasName: '瓶窑镇',
                    latitude: 30.400978,
                    longitude: 119.959608,
                    level: '一般',
                    houseNumber: 4,
                    familyNumber: 3,
                    residentNumber: 2,
                    entryNumber: 11,
                    avoidDisasterPlaces: '社区服务中心',
                },
            ]

            this.loadPoints(data, 'preventAreas')
        },
        // 定位到中心点，默认点位目前在余杭区
        flyOrg(lat, lon) {
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
        },
        preventAreas() {
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

            let lng = Number(this.viewer.entities.getById(this.curPoint.id).datas.longitude)
            let lat = Number(this.viewer.entities.getById(this.curPoint.id).datas.latitude)
            // 动态飞入此模型，放大地图
            this.viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(lng, lat, 900),
                orientation: {
                    heading: Cesium.Math.toRadians(0),
                    pitch: Cesium.Math.toRadians(-90.0),
                    roll: 0.0,
                },
            })
        },
        clickGis() {
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
        },
        getModalLonlat(pickedCont) {
            // 获取点位位置
            let scene = this.viewer.scene
            let ellipsoid = scene.globe.ellipsoid
            let height = ellipsoid.cartesianToCartographic(this.viewer.camera.position).height
            this.modalLonlat.lat = Number(pickedCont.datas.latitude)
            this.modalLonlat.height = height
            this.modalLonlat.lon = Number(pickedCont.datas.longitude)

            this.flyOrg(this.modalLonlat.lat, this.modalLonlat.lon, this.modalLonlat.height)
        },
        // 弹窗跟随点位
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
        },
        loadPoints(param) {
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
        },
    },
    //生命周期 - 创建完成（可以访问当前this实例）
    created() {},
    //生命周期 - 挂载完成（可以访问DOM元素）
    mounted() {
        this.initMap()
    },
    activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
}
</script>
<style lang="less" scoped></style>
