<template>
    <section class="view-content">
        <left-menu-vue></left-menu-vue>
        <transition name="move" mode="out-in">
            <div class="wrap-content">
                <div class="page-title">{{ $route.meta.title }}</div>
                <router-view :key="$route.fullPath"></router-view>
            </div>
        </transition>
    </section>
</template>

<script>
import LeftMenuVue from './components/LeftMenu.vue'
export default {
    name: 'layoutPage',
    components: {
        LeftMenuVue,
    },
    data() {
        return {}
    },
}
</script>
<style scoped lang="less">
.view-content {
    height: 100%;
    overflow: auto;
    display: flex;
}
.wrap-content {
    height: 100%;
    overflow: auto;
    padding: 16px;
    background-color: #f8f8f8;
    flex: 1;
    display: flex;
    flex-direction: column;
}
</style>
