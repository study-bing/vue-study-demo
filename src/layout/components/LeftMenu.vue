<template>
    <div>
        <el-menu :default-active="$route.path" class="el-menu-vertical" router background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
            <el-submenu index="1">
                <template slot="title">
                    <i class="el-icon-s-home"></i>
                    <span>demo</span>
                </template>
                <el-menu-item index="/">编写方式</el-menu-item>
                <el-menu-item index="/mdStudy">md学习</el-menu-item>
                <el-menu-item index="/openLayer">openLayer 2D</el-menu-item>
                <el-menu-item index="/echarts">echarts</el-menu-item>
                <el-menu-item index="/cesiumDemo">走进cesium</el-menu-item>
                <el-menu-item index="/TreeHole">数据量踩过的坑</el-menu-item>
                <el-menu-item index="/leafletDemo">leaflet</el-menu-item>
            </el-submenu>
        </el-menu>
    </div>
</template>
<script>
export default {}
</script>
<style lang="less" scoped>
.el-menu-vertical {
    flex-shrink: 0;
    height: 100%;
    width: 200px;
}
.el-menu {
    border-right: none;
}
</style>
