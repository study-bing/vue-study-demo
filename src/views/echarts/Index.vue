<!--
 * @Author: zhaoyuge
 * @Date: 2022-08-09 13:40:11
 * @LastEditTime: 2022-08-09 13:40:11
 * @LastEditors: zhaoyuge
 * @Description: echarts 部分场景demo
 * @FilePath: /web-demo/src/views/echarts/Demo.vue
-->
<template>
    <div class="content">
        <div class="mb-12 flex flex-s-b flex-a-c">
            <span>图表列表</span>
            <div>
                <el-switch v-model="contrast" class="ml-10" @change="closeContrast" />
                开启对比分析
            </div>
        </div>
        <el-row class="chart-box" :gutter="12">
            <template v-for="(item, i) in chartData">
                <!--  地下水图表  -->
                <el-col v-if="item.type === 'L3_DX'" :span="24" :key="i" :class="`DX-${i}`">
                    <div class="every-chart">
                        <div class="dx-header flex flex-s-b flex-a-c">
                            <div class="title">{{ item.sensorName }}</div>
                            <div class="chart-header">
                                <el-checkbox v-model="maxShow[i]" :disabled="btnDisable[i]" @change="(e) => showMaxMin(e, i)"> 极值点标注 </el-checkbox>
                                <el-checkbox v-model="warnShow[i]" :disabled="btnDisable[i]" class="ml-10" @change="(e) => showWarnLines(e, i)">
                                    预警线展示
                                </el-checkbox>
                                <el-button class="ml-10" @click="downLoadImg(`.DX-${i}`, item.sensorName)">下载</el-button>
                            </div>
                        </div>
                        <div :class="`flex chart-${i}`">
                            <div class="dx-water-temperature"></div>
                            <div class="dx-water-stage"></div>
                            <div class="dx-height">
                                <div style="text-align: center">水位(m)</div>
                                <div class="flex water-box">
                                    <div class="rule">
                                        <span>0</span>
                                        <span>{{ DXHeight[i] }}</span>
                                    </div>
                                    <div class="water">
                                        <div class="real" :style="`height: ${typeof DXHeightRate[i] === 'number' ? DXHeightRate[i] * 193 : 193}px`"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-col>
                <!-- 普通类型图表 -->
                <el-col v-else :span="12" :key="i">
                    <div class="chart-header">
                        <el-checkbox @change="(e) => showMaxMin(e, i)" v-model="maxShow[i]" :disabled="btnDisable[i]"> 极值点标注 </el-checkbox>
                        <el-checkbox @change="(e) => showWarnLines(e, i)" v-model="warnShow[i]" :disabled="btnDisable[i]" class="ml-10">
                            预警线展示
                        </el-checkbox>
                        <el-button class="ml-10" @click="downLoadImg(`.chart-${i}`, item.sensorName)">下载</el-button>
                    </div>
                    <div :class="`every-chart chart-${i}`"></div>
                </el-col>
            </template>
        </el-row>
    </div>
</template>

<script>
import data0 from './data'
import html2canvas from 'html2canvas'
import * as echarts from 'echarts'
import { normalOption, dxOption, manyColors, colorIndexArr } from './chartOptions'
const colors = colorIndexArr(100).map((val) => manyColors[val]) // 线条颜色数组

export default {
    name: 'echartsDemo',
    data() {
        return {
            chartData: [],
            contrast: false,
            chartList: [], // 图表实例合集
            showLines: [], // 记录每个图表当前显示的线条 -- 记录线条名称
            btnDisable: [], // 记录每个图表的复选框是否可点击
            warnShow: [], // 是否显示预警线
            maxShow: [], // 是否显示极值
            DXHeight: [], // 记录地下水位高度范围
            DXHeightRate: [], // 记录地下水位的高度比率,
            DXTimer: null, // 地下水位高度变化定时器
        }
    },
    created() {
        this.getData()
    },
    methods: {
        // 处理数据
        getData() {
            this.chartData.forEach((data, i) => {
                if (this.chartList[i] && data.type !== 'L3_DX') {
                    this.chartList[i].dispose()
                }
                if (this.chartList[i] && data.type === 'L3_DX') {
                    if (this.chartList[i][0]) {
                        this.chartList[i][0].dispose()
                    }
                    if (this.chartList[i][1]) {
                        this.chartList[i][1].dispose()
                    }
                }
            })
            // 清除本地数据
            this.chartData.splice(0, this.chartData.length)
            this.chartList.splice(0, this.chartList.length)
            this.btnDisable.splice(0, this.btnDisable.length)
            this.showLines.splice(0, this.showLines.length)
            this.warnShow.splice(0, this.warnShow.length)
            this.maxShow.splice(0, this.maxShow.length)
            this.DXHeight.splice(0, this.DXHeight.length)
            this.DXHeightRate.splice(0, this.DXHeightRate.length)
            this.chartData = data0.map((dd) => {
                return {
                    // 传感器信息 -- 图表
                    sensorName: dd.sensorName,
                    sensorId: dd.sensorId,
                    type: dd.monitorStandardType,
                    lineNames: dd.unitNameList,
                    deviceDataList: dd.deviceDataList.map((mm) => {
                        return {
                            name: mm.unitName, // 线条名字
                            unit: mm.unit, // 单位
                            maxId: mm.maxId,
                            minId: mm.minId,
                            code: mm.unitCode ? mm.unitCode : null, // 地表位移特有，标识X轴位移与Y轴位移用
                            lightId: null,
                            lines: mm.lines.map((el) => {
                                // 三条预警线
                                return {
                                    ...el,
                                    alarmValue: Number.parseFloat(el.alarmValue),
                                }
                            }),
                            data: mm.detailDatas.map((el) => {
                                return {
                                    ...el,
                                    monitorValue: Number.parseFloat(el.monitorValue),
                                }
                            }),
                        }
                    }),
                    // 下面为深部位移专有数据
                    holeName: dd.holeName, // 孔名
                    holeDepth: dd.holeDepth, // 孔深
                    depth: dd.depth, // 当前设备深度
                    depthList: dd.depthList, // 孔内传感器埋深
                }
            })
            this.initChart()
        },
        // 构建全部图表
        initChart() {
            this.$nextTick(() => {
                this.chartData.forEach((item, i) => {
                    if (item.type === 'L3_DX') {
                        // 地下水图表
                        this.initDXChart(i)
                    } else {
                        this.setNormalOption(i)
                    }
                })
            })
        },
        // 构建某个含全部曲线的图表
        setNormalOption(i) {
            const chartData = this.chartData[i]
            if (this.chartList[i]) {
                this.chartList[i].dispose()
            }
            const box = document.querySelector(`.chart-${i}`)
            this.chartList[i] = echarts.init(box)
            this.btnDisable[i] = chartData.lineNames.length !== 1
            if (chartData.lineNames.length === 1) {
                this.showLines[i] = chartData.lineNames[0]
            }
            this.btnDisable = JSON.parse(JSON.stringify(this.btnDisable))
            // 通用图的option
            const option = {
                ...normalOption,
                title: {
                    text: chartData.sensorName,
                    padding: [20, 0, 0, 24],
                    textStyle: {
                        fontSize: 14,
                    },
                },
                legend: {
                    data: chartData.lineNames,
                    bottom: 12,
                    type: 'scroll',
                    icon: 'roundRect',
                    itemWidth: 8,
                    itemHeight: 8,
                },
                color: colors,
                series: chartData.deviceDataList.map((el) => {
                    return {
                        name: el.name,
                        type: 'line',
                        tooltip: {
                            valueFormatter: (val) => `${val}${el.unit || ''}`,
                        },
                        smooth: chartData.type === 'L1_GP',
                        showSymbol: Boolean(el.lightId),
                        data: el.data.map((item) => {
                            if (el.lightId === item.id) {
                                return {
                                    value: [item.monitorTime, item.monitorValue],
                                    symbol: 'circle',
                                    symbolSize: 10,
                                    itemStyle: {
                                        color: '#CB3629',
                                    },
                                }
                            } else {
                                return {
                                    value: [item.monitorTime, item.monitorValue],
                                }
                            }
                        }),
                    }
                }),
            }
            this.chartList[i].setOption(option)
            this.chartList[i].on('legendselectchanged', (e) => this.onOffLine(e, i))
            this.chartList[i].on('click', this.clickChart)
        },
        // 切换线条显示
        onOffLine(e, i) {
            // 判断第i张图还剩几条线在显示，如果仅剩1条，记录该条线名称，并将该项的复选框解除禁用，反之禁用（但无需删除名称）
            let [a, n] = [0, '']
            for (let k in e.selected) {
                if (e.selected[k]) {
                    a++
                    n = k
                }
            }
            if (a === 1) {
                this.btnDisable[i] = false
                this.showLines[i] = n
                this.btnDisable = JSON.parse(JSON.stringify(this.btnDisable))
            } else {
                this.btnDisable[i] = true
                this.btnDisable = JSON.parse(JSON.stringify(this.btnDisable))
            }
        },
        // 显示极值点
        showMaxMin(e, i) {
            console.log(e)
            this.maxShow[i] = e
            if (['L3_DX'].includes(this.chartData[i].type)) {
                // 地下水位需特殊处理
                this.initDXChart(i)
            } else if (e || this.warnShow[i]) {
                // 如果显示极值和显示预警线有一个被选，则组成特殊单线条option
                this.setPointLine(i)
            } else {
                // 如果两者皆未选，则组成普通的option
                this.setNormalOption(i)
            }
        },
        // 显示预警线
        showWarnLines(e, i) {
            this.warnShow[i] = e
            if (['L3_DX'].includes(this.chartData[i].type)) {
                // 地下水位需特殊处理
                this.initDXChart(i)
            } else if (e || this.maxShow[i]) {
                // 如果显示极值和显示预警线有一个被选，则组成特殊单线条option
                this.setPointLine(i)
            } else {
                // 如果两者皆未选，则组成普通的option
                this.setNormalOption(i)
            }
        },
        // 构建某个含极值点预警线的一条曲线的图表
        setPointLine(i) {
            this.chartList[i].dispose()
            const box = document.querySelector(`.chart-${i}`)
            this.chartList[i] = echarts.init(box)
            const chartData = this.chartData[i]
            let [it, showIndex] = [{}, null]
            chartData.deviceDataList.forEach((item, c) => {
                if (item.name === this.showLines[i]) {
                    it = item
                    showIndex = c
                }
            })
            const maxMin = []
            const useData = it.data.map((item) => {
                if (this.maxShow[i] && [it.maxId, it.minId].includes(item.id)) {
                    // 最大值最小值点
                    maxMin.push({
                        xAxis: item.monitorTime,
                        yAxis: item.monitorValue,
                    })
                }
                if (it.lightId === item.id) {
                    return {
                        value: [item.monitorTime, item.monitorValue],
                        symbol: 'circle',
                        symbolSize: 10,
                    }
                } else {
                    return {
                        value: [item.monitorTime, item.monitorValue],
                        symbolSize: 0,
                    }
                }
            })

            // 通用图的含极值点预警线的option
            const option = {
                ...normalOption,
                title: {
                    text: chartData.sensorName,
                    padding: [20, 0, 0, 24],
                    textStyle: {
                        fontSize: 14,
                    },
                },
                color: [colors[showIndex]],
                series: [
                    {
                        name: it.name,
                        type: 'line',
                        smooth: chartData.type === 'L1_GP',
                        tooltip: {
                            valueFormatter: (val) => `${val}${it.unit || ''}`,
                        },
                        data: useData,
                        markPoint: {
                            type: 'circle',
                            symbolSize: 20,
                            itemStyle: {
                                color: '#CB3629',
                            },
                            label: {
                                position: 'top',
                                show: true,
                                color: '#CB3629',
                                formatter: (params) => params.data.yAxis,
                            },
                            data: maxMin,
                        },
                        markLine: this.warnShow[i]
                            ? {
                                  symbol: ['none', 'none'], //去掉箭头
                                  silent: true,
                                  label: {
                                      show: false,
                                  },
                                  data: it.lines.map((el) => {
                                      return {
                                          yAxis: el.alarmValue,
                                          lineStyle: {
                                              type: 'dashed',
                                              color: el.alarmLeaLeavel === 1 ? '#EA3323' : el.alarmLeaLeavel === 2 ? '#FF923A' : '#F7CF47',
                                          },
                                      }
                                  }),
                              }
                            : false,
                    },
                ],
            }
            this.chartList[i].setOption(option)
            this.chartList[i].on('click', this.clickChart)
        },
        // 开启对比分析时点击图表事件
        clickChart(e) {
            if (!this.contrast) return
            let baseTime = new Date(e.data.value[0]).getTime() // 拿到时间点
            // 标记每个图表数据的对应时间点
            this.chartData.forEach((data) => {
                // 需要标记出来并组成相应的option
                data.deviceDataList.forEach((line) => {
                    // 线条级 -- 给每条线的maxId同级加一个lightId
                    for (let iii = 0; iii < line.data.length - 1; iii++) {
                        const nowTime = new Date(line.data[iii].monitorTime).getTime()
                        const nextTime = new Date(line.data[iii + 1].monitorTime).getTime()
                        if (nowTime === baseTime) {
                            line.lightId = line.data[iii].id
                            return false
                        } else if (nextTime === baseTime) {
                            line.lightId = line.data[iii + 1].id
                            return false
                        } else if (nowTime < baseTime && nextTime > baseTime) {
                            const a = baseTime * 2 > nowTime + nextTime
                            line.lightId = a ? line.data[iii + 1].id : line.data[iii].id
                            return false
                        }
                    }
                })
            })
            this.resetAllChart()
        },
        // 关闭对比分析时 -- 删除全部的lightId并重构图表
        closeContrast(e) {
            if (!e) {
                // 删除lightId
                // 标记每个图表数据的对应时间点
                this.chartData.forEach((data) => {
                    // 需要标记出来并组成相应的option
                    data.deviceDataList.forEach((line) => {
                        // 线条级 -- 删除lightId
                        delete line.lightId
                    })
                })
                this.resetAllChart()
            }
        },
        // 重构（除深度位移外）全部图表
        resetAllChart() {
            this.chartData.forEach((item, i) => {
                if (item.type === 'L3_DX') {
                    // 地下水位需要特殊操作
                    this.initDXChart(i)
                } else if (this.warnShow[i] || this.maxShow[i]) {
                    // 带极值点的需要特殊操作
                    this.setPointLine(i)
                } else {
                    // 其它
                    this.setNormalOption(i)
                }
            })
        },
        // 构建地下水图表 -- 需要构建两份，且容器名发生了改变，数据可视为与 极值点&&预警线 相似
        initDXChart(i) {
            if (!this.chartData[i].deviceDataList[0]) return
            const chartData = this.chartData[i]
            if (this.chartList[i] && this.chartList[i][0]) {
                this.chartList[i][0].dispose()
                this.chartList[i][1].dispose()
            }
            const temperatureBox = document.querySelector(`.chart-${i} .dx-water-temperature`)
            const stageBox = document.querySelector(`.chart-${i} .dx-water-stage`)
            // 找出水温项
            const tempIndex = Number(chartData.deviceDataList[0].code !== 'temp')
            this.chartList[i] = []
            const tempData = chartData.deviceDataList[tempIndex]
            const levelData = chartData.deviceDataList[1 - tempIndex]

            // 渲染极值点
            const leftMaxMin = []
            const leftData = tempData.data.map((item) => {
                if (this.maxShow[i] && [tempData.maxId, tempData.minId].includes(item.id)) {
                    // 最大值最小值点
                    leftMaxMin.push({
                        xAxis: item.monitorTime,
                        yAxis: item.monitorValue,
                    })
                }
                if (tempData.lightId === item.id) {
                    return {
                        value: [item.monitorTime, item.monitorValue],
                        symbol: 'circle',
                        symbolSize: 10,
                        itemStyle: {
                            color: '#CB3629',
                        },
                    }
                } else {
                    return {
                        value: [item.monitorTime, item.monitorValue],
                    }
                }
            })
            // 构建左侧水温图
            const temperatureOption = {
                ...dxOption,
                legend: {
                    data: ['温度'],
                    bottom: 0,
                    icon: 'roundRect',
                    itemWidth: 8,
                    itemHeight: 8,
                },
                color: ['#5096FF'],
                series: [
                    {
                        name: '温度',
                        type: 'line',
                        tooltip: {
                            valueFormatter: (val) => `${val}${tempData.unit}`,
                        },
                        showSymbol: Boolean(tempData.lightId),
                        data: leftData,
                        markPoint: {
                            type: 'circle',
                            symbolSize: 20,
                            itemStyle: {
                                color: '#CB3629',
                            },
                            label: {
                                position: 'top',
                                show: true,
                                color: '#CB3629',
                                formatter: (params) => params.data.yAxis,
                            },
                            data: leftMaxMin,
                        },
                        markLine: this.warnShow[i]
                            ? {
                                  symbol: ['none', 'none'], //去掉箭头
                                  silent: true,
                                  label: {
                                      show: false,
                                  },
                                  data: tempData.lines.map((el) => {
                                      return {
                                          yAxis: el.alarmValue,
                                          lineStyle: {
                                              type: 'dashed',
                                              color: el.alarmLeaLeavel === 1 ? '#EA3323' : el.alarmLeaLeavel === 2 ? '#FF923A' : '#F7CF47',
                                          },
                                      }
                                  }),
                              }
                            : false,
                    },
                ],
            }
            this.chartList[i][0] = echarts.init(temperatureBox)
            this.chartList[i][0].setOption(temperatureOption)
            // 渲染极值点
            const rightMaxMin = []
            const rightData = levelData.data.map((item) => {
                if (this.maxShow[i] && [levelData.maxId, levelData.minId].includes(item.id)) {
                    // 最大值最小值点
                    rightMaxMin.push({
                        xAxis: item.monitorTime,
                        yAxis: item.monitorValue,
                    })
                }
                if (levelData.lightId === item.id) {
                    return {
                        value: [item.monitorTime, item.monitorValue],
                        symbol: 'circle',
                        symbolSize: 10,
                        itemStyle: {
                            color: '#CB3629',
                        },
                    }
                } else {
                    return {
                        value: [item.monitorTime, item.monitorValue],
                    }
                }
            })
            // 构建右侧水位图
            const stageOption = {
                ...dxOption,
                legend: {
                    data: ['水位'],
                    bottom: 0,
                    icon: 'roundRect',
                    itemWidth: 8,
                    itemHeight: 8,
                },
                xAxis: {
                    ...dxOption.xAxis,
                    position: 'top',
                },
                yAxis: {
                    type: 'value',
                    inverse: true,
                    min: 0,
                    max: chartData.holeDepth || 'dataMax',
                    boundaryGap: [0, '5%'],
                },
                color: ['#A055FF'],
                series: [
                    {
                        name: '水位',
                        type: 'line',
                        tooltip: {
                            valueFormatter: (val) => {
                                // 为水位图添加鼠标事件，实时改变副图水位高度
                                this.changeDXHeight(val, i)
                                return `${val}${levelData.unit}`
                            },
                        },
                        showSymbol: Boolean(levelData.lightId),
                        data: rightData,
                        markPoint: {
                            type: 'circle',
                            symbolSize: 20,
                            itemStyle: {
                                color: '#CB3629',
                            },
                            label: {
                                position: 'top',
                                distance: 3,
                                show: true,
                                color: '#CB3629',
                                formatter: (params) => params.data.yAxis,
                            },
                            data: rightMaxMin,
                        },
                        markLine: this.warnShow[i]
                            ? {
                                  symbol: ['none', 'none'], //去掉箭头
                                  silent: true,
                                  label: {
                                      show: false,
                                  },
                                  data: levelData.lines.map((el) => {
                                      return {
                                          yAxis: el.alarmValue,
                                          lineStyle: {
                                              type: 'dashed',
                                              color: el.alarmLeaLeavel === 1 ? '#EA3323' : el.alarmLeaLeavel === 2 ? '#FF923A' : '#F7CF47',
                                          },
                                      }
                                  }),
                              }
                            : false,
                    },
                ],
            }
            this.DXHeight[i] = chartData.holeDepth || 0
            this.DXHeight = JSON.parse(JSON.stringify(this.DXHeight))
            this.chartList[i][1] = echarts.init(stageBox)
            this.chartList[i][1].setOption(stageOption)
            // 为两张图添加点击事件，开启对比分析用
            this.chartList[i][0].on('click', this.clickChart)
            this.chartList[i][1].on('click', this.clickChart)
        },
        // 地下水副图水位高度发生变化
        changeDXHeight(e, i) {
            if (!e || !this.DXHeight[i]) return
            if (!this.DXTimer) {
                this.DXTimer = setTimeout(() => {
                    this.DXHeightRate[i] = e / this.DXHeight[i]
                    this.DXHeightRate = JSON.parse(JSON.stringify(this.DXHeightRate))
                    this.DXTimer = null
                }, 100)
            }
        },
        // 下载
        downLoadImg(className, name) {
            console.log(className)
            window.pageYoffset = 0
            document.documentElement.scrollTop = 0
            document.body.scrollTop = 0
            const node = document.querySelector(className)
            const header = node.querySelector('.chart-header')
            let display
            if (header) {
                display = header.style.display
                header.style.display = 'none'
            }
            html2canvas(node, {
                width: node.offsetWidth, //dom宽
                height: node.offsetHeight, //dom高
                backgroundColor: '#FFF', //背景颜色 为null是透明
                dpi: window.devicePixelRatio * 2, //按屏幕像素比增加像素
                scale: 2,
                X: 0,
                Y: 0,
                scrollX: 0, //如果左边多个白边 设置该偏移-3 或者更多
                scrollY: 0,
                useCORS: true, //是否使用CORS从服务器加载图像 !!!
                allowTaint: true, //是否允许跨域图像污染画布  !!!
            }).then((canvas) => {
                const url = canvas.toDataURL() //这里上面不设值cors会报错
                const a = document.createElement('a') //创建一个a标签 用来下载
                a.download = name //设置下载的图片名称
                const event = new MouseEvent('click') //增加一个点击事件
                a.href = url //此处的url为base64格式的图片资源
                a.dispatchEvent(event) //触发a的单击事件 即可完成下载
                if (header) {
                    header.style.display = display
                }
            })
        },
    },
}
</script>

<style scoped lang="less">
.content {
    background-color: #f7f8fc;
    .el-checkbox {
        margin-right: 10px;
    }
    .el-col {
        position: relative;
    }
    .chart-box {
        overflow: auto;
        padding: 12px;
        background-color: #fff;
        & > .el-col {
            position: relative;
            margin-top: 12px;
        }
        .chart-header {
            position: absolute;
            z-index: 1;
            top: 12px;
            right: 24px;
            display: flex;
            align-items: center;
        }
        .dx-header {
            padding: 0 24px;
            height: 60px;
            font-size: 14px;
            .title {
                font-weight: 500;
            }
        }
        .dx-water-temperature {
            flex: 3;
            margin-bottom: 18px;
            height: 250px;
        }
        .dx-water-stage {
            flex: 3;
            margin-bottom: 18px;
            height: 250px;
            border-left: #eee 1px solid;
        }
        .dx-height {
            flex: 2;
            margin-bottom: 18px;
            height: 250px;
            border-left: #eee 1px solid;
        }
    }
    .every-chart {
        width: 100%;
        height: 330px;
        border-radius: 12px;
        border: #eee 1px solid;
    }
    .every-weiyi {
        width: 100%;
        height: 270px;
    }
}
.water-box {
    height: 195px;
    justify-content: center;
    margin-top: 11px;
    .rule {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-right: 5px;
        padding-right: 5px;
        width: 50px;
        height: 100%;
        text-align: right;
        border-right: #ddd 1px solid;
    }
    .water {
        position: relative;
        width: 40px;
        height: 100%;
        background-color: #21aeea;
        border: #21aeea 1px solid;
        .real {
            width: 100%;
            background-color: #fff;
            transition: all linear 0.3s;
        }
        .depth {
            position: absolute;
            z-index: 1;
            left: 0;
            width: 38px;
            height: 4px;
            background-color: #ffa620;
        }
        .depth-device {
            position: absolute;
            z-index: 1;
            left: 14px;
        }
    }
}
.ml-10 {
    margin-left: 10px;
}
.mb-12 {
    margin-bottom: 12px;
}
</style>
