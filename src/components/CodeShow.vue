<template>
    <prism-editor class="my-editor height-auto" readonly :value="code" aria-disabled :highlight="highlighter" line-numbers :tabSize="4"></prism-editor>
</template>

<script>
import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css'
import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/themes/prism-tomorrow.css'

export default {
    components: {
        PrismEditor,
    },
    props: {
        code: String,
    },
    methods: {
        highlighter(code) {
            return highlight(code, languages.js) //returns html
        },
    },
}
</script>

<style lang="less">
.my-editor {
    background: #2d2d2d;
    color: #ccc;
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 14px;
    line-height: 1.5;
    padding: 5px;
}

.prism-editor__textarea:focus {
    outline: none;
}

/* 非必须 */
.height-auto {
    height: auto;
}
</style>
