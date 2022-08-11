<template>
    <div class="content">
        <div class="page-desc mt-16" style="color: red">1.md的基本知识点</div>
        <div class="markdown-body">
            <md></md>
        </div>
    </div>
</template>

<script>
import md from './mdStudy.md'
export default {
    name: 'mdStudy',
    components: { md },
    data() {
        return {}
    },
}
</script>
<style lang="less" scoped></style>
