
## 标题
使用 # 号可表示 1-6 级标题，一级标题对应一个 # 号，二级标题对应两个 # 号，以此类推


```md
# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题
```
## 段落
Markdown 段落没有特殊的格式，直接编写文字就好，段落的换行是使用两个以上空格加上回车  
当然也可以在段落后面使用一个空行来表示重新开始一个段落。

## 字体
加粗：要加粗的文字左右分别用两个\*号包起来  
斜体：要倾斜的文字左右分别用一个\*号包起来  
斜体加粗：要倾斜和加粗的文字左右分别用三个\*号包起来  
删除线：要加删除线的文字左右分别用两个~~号包起来  

```md
**这是加粗的文字**  
*这是倾斜的文字*`  
***这是斜体加粗的文字***  
~~这是加删除线的文字~~  
```
**这是加粗的文字**  
*这是倾斜的文字*`  
***这是斜体加粗的文字***  
~~这是加删除线的文字~~  

## 分割线
你可以在一行中用三个以上的星号、减号、底线来建立一个分隔线，行内不能有其他东西。你也可以在星号或是减号中间插入空格。下面每种写法都可以建立分隔线
```md
***

* * *

*****

- - -

----------
```
***

* * *

*****

- - -

----------  

## 列表
Markdown 支持有序列表和无序列表。

无序列表使用星号(*)、加号(+)或是减号(-)作为列表标记，这些标记后面要添加一个空格，然后再填写内容：
```md
* 第一项
* 第二项
* 第三项

+ 第一项
+ 第二项
+ 第三项


- 第一项
- 第二项
- 第三项
```
* 第一项
* 第二项
* 第三项

+ 第一项
+ 第二项
+ 第三项


- 第一项
- 第二项
- 第三项
有序列表使用数字并加上 . 号来表示，如
```md
1. 第一项
2. 第二项
3. 第三项
```
1. 第一项
2. 第二项
3. 第三项
### 列表嵌套
列表嵌套只需在子列表中的选项前面添加四个空格即可：
```md
1. 第一项：
    - 第一项嵌套的第一个元素
    - 第一项嵌套的第二个元素
2. 第二项：
    - 第二项嵌套的第一个元素
    - 第二项嵌套的第二个元素
```
1. 第一项：
    - 第一项嵌套的第一个元素
    - 第一项嵌套的第二个元素
2. 第二项：
    - 第二项嵌套的第一个元素
    - 第二项嵌套的第二个元素

## 区块
区块引用是在段落开头使用 > 符号 ，然后后面紧跟一个空格符号：
```md
> 区块引用
> 菜鸟教程
> 学的不仅是技术更是梦想
```
> 区块引用  
> 菜鸟教程  
> 学的不仅是技术更是梦想  
### 区块层级
另外区块是可以嵌套的，一个 > 符号是最外层，两个 > 符号是第一层嵌套，以此类推：
```md 
> 最外层
> > 第一层嵌套
> > > 第二层嵌套
```
> 最外层
> > 第一层嵌套
> > > 第二层嵌套
## 代码
如果是段落上的一个函数或片段的代码可以用反引号把它包起来（`），例如：
```md
`printf()` 函数
```
`printf()` 函数
### 代码区块
``` 包裹一段代码，并指定一种语言
```md
```
```
这是```包裹的地方
```

## 链接
```md
[链接名称](链接地址)

或者

<链接地址>
```
[百度](http://wwww.baidu.com)

或者

<http://wwww.baidu.com>

## 图片
开头一个感叹号 !  
接着一个方括号，里面放上图片的替代文字  
接着一个普通括号，里面放上图片的网址，最后还可以用引号包住并加上选择性的 'title' 属性的文字。  
```md
![艾斯](./img/as.jpeg)
```
![艾斯](./img/as.jpeg)
## 表格
Markdown 制作表格使用 | 来分隔不同的单元格，使用 - 来分隔表头和其他行。
```md
|  表头   | 表头  |
|  ----  | ----  |
| 单元格  | 单元格 |
| 单元格  | 单元格 |
```
|  表头   | 表头  |
|  ----  | ----  |
| 单元格  | 单元格 |
| 单元格  | 单元格 |
### 对齐方式
我们可以设置表格的对齐方式：  
-: 设置内容和标题栏居右对齐。  
:- 设置内容和标题栏居左对齐。  
:-: 设置内容和标题栏居中对齐。  
```md
| 左对齐 | 右对齐 | 居中对齐 |
| :-----| ----: | :----: |
| 单元格 | 单元格 | 单元格 |
| 单元格 | 单元格 | 单元格 |
```
| 左对齐 | 右对齐 | 居中对齐 |
| :-----| ----: | :----: |
| 单元格 | 单元格 | 单元格 |
| 单元格 | 单元格 | 单元格 |
## 转义
Markdown 使用了很多特殊符号来表示特定的意义，如果需要显示特定的符号则需要使用转义字符，Markdown 使用反斜杠转义特殊字符：  
```md
**文本加粗** 
\*\* 正常显示星号 \*\*
```
**文本加粗**   
\*\* 正常显示星号 \*\*
一下需要转移
```md
\   反斜线
`   反引号
*   星号
_   下划线
{}  花括号
[]  方括号
()  小括号
#   井字号
+   加号
-   减号
.   英文句点
!   感叹号
```