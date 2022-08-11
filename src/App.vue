<template>
    <div id="app">
        <transition name="fade" mode="out-in" appear>
            <router-view />
        </transition>
    </div>
</template>
<script>
export default {
    data() {
        return {}
    },
}
</script>
<style lang="less"></style>
