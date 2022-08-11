<template>
    <div class="content">
        <div class="page-desc" style="color: red">编写文档的方式可以是html结合CodeShow组件编写，或者引入编写完的md；</div>
        <div class="page-desc mt-16">1.md方式编写（推荐）</div>
        <!-- md编写 -->
        <code-show
            code='//  必须写在<div class="markdown-body">内部
<div class="markdown-body">
    <md></md>
</div>'
        ></code-show>
        <code-show
            code="import md from './mdStudy.md'
components: { md },"
        ></code-show>
        <div class="page-desc mt-16">2.使用CodeShow显示代码</div>
        <!-- md编写 -->
        <code-show
            code="import CodeShow from '@components/CodeShow'
    components: { CodeShow, MapView },

<code-show
    code='import CodeShow from '@components/CodeShow'
    components: { CodeShow, MapView },'
></code-show>"
        ></code-show>
    </div>
</template>

<script>
import CodeShow from '@components/CodeShow'

export default {
    name: 'HomeView',
    components: { CodeShow },
    data() {
        return {
            options: [
                {
                    value: '选项1',
                    label: '黄金糕',
                },
                {
                    value: '选项2',
                    label: '双皮奶',
                },
                {
                    value: '选项3',
                    label: '蚵仔煎',
                },
                {
                    value: '选项4',
                    label: '龙须面',
                },
                {
                    value: '选项5',
                    label: '北京烤鸭',
                },
            ],
            value: '',
            docTxt: '## hello world',
        }
    },
}
</script>
<style lang="less" scoped>
.home {
    background-color: #ffffff;
    height: 100%;
    padding: 24px;
}
.less-test {
    color: @color-text-primary;
    .border-top();
    .margin-left-xl;
}
</style>
