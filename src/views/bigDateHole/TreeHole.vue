<!--
 * @Author: tangwenyan
 * @Date: 2022-08-09 14:12:26
 * @LastEditTime: 2022-08-09 18:04:00
 * @LastEditors: tangwenyan
 * @Description: 树踩过的坑
 * @FilePath: /web-demo/src/views/devViews/tree.vue
-->
<template>
    <div class="markdown-body">
        <md class="mt-20"></md>
        <el-tree
            :data="productTree"
            :props="treeProps"
            node-key="id"
            @node-click="selectTree"
            :default-checked-keys="[selectProduct]"
            :default-expanded-keys="checkIds"
            :load="checkTree"
            lazy
            key="2"
        >
            <template slot-scope="{ data }">
                <div :title="data.name" :class="selectProduct === data.id ? 'normal-node treeSelect' : 'normal-node'">
                    {{ data.name }}
                </div>
            </template>
        </el-tree>
    </div>
</template>

<script>
import md from './bigDateHole.md'
export default {
    components: { md },
    data() {
        return {
            productTree: [],
            treeProps: {
                label: 'name',
                children: 'children',
                isLeaf: 'isLeaf',
            },
            checkIds: [1],
            selectProduct: 11,
            groupTree: [
                {
                    id: 1,
                    name: '11',
                },
                {
                    id: 2,
                    name: '22',
                },
            ],
            children: [
                {
                    id: 11,
                    name: '11-111',
                },
                {
                    id: 22,
                    name: '22-222',
                },
            ],
        }
    },
    methods: {
        /**
         * 树渲染---同构后端接口拿到初始数据
         */
        // getDeviceTypeTree() {
        //     this.deviceParams.type = this.leftTabIndex
        //     getDeviceTypeTree(this.deviceParams).then((res) => {
        //         let data = res.data || []
        //         if (this.leftTabIndex === 0) {
        // -------------------data.checkIds是用来记录需要默认展开的数据的id数组的--------------------
        //             this.checkIds = data.checkIds
        //             this.groupTree = data.tree
        // -------------------selectId是用来记录需要默认选中的选项的id-----------------------------
        //             this.selectId = data.checkIds.pop()
        //             this.checkId = this.selectId
        //         } else {
        //             this.checkIds = data.checkIds
        //             this.productTree = data.tree
        //             this.selectProduct = data.checkIds.pop()
        //             this.checkId = this.selectProduct
        //         }
        //         if (this.deviceParams.searchKey) {
        //             this.checkId = ''
        //             this.selectId = ''
        //             this.selectProduct = ''
        //         }
        //     })
        // },
        /**
         * 懒加载
         */
        checkTree(node, resolve) {
            // 打印出来查看返回的node数据，数据存储在node的data对象中而不是直接给的，同时给的还有他的孩子数据和父节点数据
            console.log(node)
            // 有接口的代码长这样
            // let data = node.data
            // -------刚进来的时候进行第一层数据的渲染-------
            // if (node.level === 0) {
            //     return resolve(this.leftTabIndex === 0 ? this.groupTree : this.productTree)
            // }
            // if (!data.id) {
            //     return false
            // }
            // getChildDevices({
            //     type: this.leftTabIndex,
            //     objectId: node.data.id,
            // }).then((res) => {
            //     let childrenList = res.data || []
            // -------这里是后端对数据进行了过滤处理，需要前端在过滤回来（这里是沟通的不到位的问题，多进行了无用的操作，后期需要避免）-------
            //     if (childrenList.length) {
            //         let arr = data.children || []
            //         arr = arr.filter((el) => !el.isLeaf)
            //         data.children = [...arr, ...childrenList]
            //     }
            //     resolve(data.children)
            // })

            // 无接口
            let data = node.data
            // 刚进来的时候进行第一层数据的渲染
            if (node.level === 0) {
                return resolve(this.groupTree)
            }
            if (!data.id) {
                return false
            }
            // 在每一次点击结点的时候进行数据渲染
            resolve(this.children)
        },
        /**
         * 树选择
         */
        selectTree(val) {
            this.selectId = val.id
            sessionStorage.setItem('checkId', val.id)
        },
    },
    created() {},
}
</script>

<style lang="less" scoped>
.normal-node {
    overflow: hidden; /*超出隐藏*/
    text-overflow: ellipsis; /*隐藏后添加省略号*/
    white-space: nowrap; /*强制不换行*/
}
.treeSelect {
    background: #fce8bd;
    border-radius: 0px 0px 0px 0px;
    border: 1px solid #f9b531;
}
</style>
