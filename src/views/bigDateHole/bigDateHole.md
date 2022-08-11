# 遇到后端返回的数据量过大的问题

## 如果 ui 图给的是穿梭框，需要对数据进行分页处理

    1. 因为组件本身不带分页的，对组件直接拆分重写，加上分页。在前端无法对已穿梭的数据进行返回原位处理的情况下，重新调一次接口
    ** 浙江省物联网平台代码有实现过的页面-----智能运维-联动加报的绑定设备功能弹窗（因为不是本人写的所以不放代码，可以去参考这个弹窗的代码，本人写的拆分组件过于垃圾弃用改成第二种方法了） **
    2. 直接改成树结构
       在保证项目能够及时交付的情况下，有清晰重写组件思路的用第一种，没有直接和产品沟通改成树结构，早定早轻松。

## 树结构遇到的坑 （TreeHole.vue）

    对于树结构数据量过大的时候通常会使用懒加载，和后端沟通好在点击结点的时候，直接返回该节点下的所有子节点，不用进行数据过滤。
    checkTree(node, resolve) {
            有接口的代码长这样
            let data = node.data
            if (node.level === 0) {
                return resolve(this.leftTabIndex === 0 ? this.groupTree : this.productTree)
            }
            if (!data.id) {
                return false
            }
            getChildDevices({
                type: this.leftTabIndex,
                objectId: node.data.id,
            }).then((res) => {
                let childrenList = res.data || []
            -------这里是后端对数据进行了过滤处理，需要前端在过滤回来（这里是沟通的不到位的问题，多进行了无用的操作，后期需要避免）-------
                if (childrenList.length) {
                    let arr = data.children || []
                    arr = arr.filter((el) => !el.isLeaf)
                    data.children = [...arr, ...childrenList]
                }
                resolve(data.children)
            })
        }

---

## 注意点：对于 element 组件和 ivew 组件在树结构上的不同

### 对于控制树展开的方式不一样

    1. element组件需要前端去控制树的默认展开和关闭
         如果需要默认展开某一项需要后端返回这些项和他的上级对应的结点key值，组件有相对应的属性去控制展开
         全部展开和关闭也是前端去控制，组件有相对应的属性
    2. ivew组件是有后端通过expand属性去控制树的展开还是关闭，expand属性对element组件的树是不起作用的

## 代码运行
* 这里是默认展开和选中了第一项，懒加载不要做默认展开全部选择，否则页面会一直掉用子节点数据接口，会造成页面就卡顿或者直接卡死，如果要默认展开全部建议换颗树写，直接让后端返回所有数据进行渲染，接口可能会慢点
 ### 运行结果如下所示