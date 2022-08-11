/*
 * @Author: virgouss gu.shi.chen15@qq.com
 * @Date: 2022-08-05 13:44:03
 * @LastEditors: virgouss gu.shi.chen15@qq.com
 * @LastEditTime: 2022-08-09 20:18:02
 * @FilePath: /task/vue.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { defineConfig } = require('@vue/cli-service')
const TerserPlugin = require('terser-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const path = require('path')
const webpack = require('webpack') // 访问内置的插件
const CopyWebpackPlugin = require('copy-webpack-plugin')
const cesiumSource = 'node_modules/cesium/Source' // Cesium源码路径。
function resolve(dir) {
    return path.join(__dirname, dir) //path.join(_dirname)设置绝对路径
}

module.exports = defineConfig({
    transpileDependencies: true,
    pluginOptions: {
        'style-resources-loader': {
            preProcessor: 'less',
            patterns: [resolve('src/style/variables.less')],
        },
    },
    configureWebpack: (config) => {
        if (process.env.NODE_ENV === 'production') {
            config.plugins.push(
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_debugger: true, // console
                            drop_console: true,
                            pure_funcs: ['console.log'], // 移除console
                        },
                    },
                    sourceMap: false,
                    parallel: true,
                })
            )
            config.plugins.push(
                new CompressionWebpackPlugin({
                    filename: '[file].gz[query]',
                    algorithm: 'gzip',
                    test: new RegExp(`\\.(${['js', 'css'].join('|')})$`),
                    threshold: 10240,
                    minRatio: 0.8,
                })
            )
        }
        // 然后运行start脚本调试，页面并未正常显示，控制栏报错：DeveloperError: Unable to determine Cesium base URL automatically, try defining a global variable called CESIUM_BASE_URL。原来Cesium中有动态路径存在，使用webpack打包后CESIUM_BASE_URL的值就取不到了
        config.plugins.push(
            new webpack.DefinePlugin({
                CESIUM_BASE_URL: JSON.stringify(''),
            })
        )
        config.plugins.push(
            new CopyWebpackPlugin({
                patterns: [
                    { from: path.join(cesiumSource, '../Build/Cesium/Workers'), to: 'Workers' },
                    { from: path.join(cesiumSource, '../Build/Cesium/Assets'), to: 'Assets' },
                    { from: path.join(cesiumSource, '../Build/Cesium/Widgets'), to: 'Widgets' },
                    { from: path.join(cesiumSource, '../Build/Cesium/ThirdParty'), to: 'ThirdParty' },
                ],
            }) // 拷贝Cesium资源、控件、WebWorker到静态目录。
        )
    },
    //压缩图片
    chainWebpack: (config) => {
        config.module.rule('svg').exclude.add(path.resolve('./src/assets/icons/svg')).end()
        config.module
            .rule('assets')
            .test(/\.svg$/)
            .include.add(path.resolve('./src/assets/icons/svg'))
            .end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                symbolId: 'icon-[name]',
            })
            .end()
        config.module
            .rule('md')
            .test(/\.md/)
            .use('vue-loader')
            .loader('vue-loader')
            .end()
            .use('vue-markdown-loader')
            .loader('vue-markdown-loader/lib/markdown-compiler')
            .options({
                raw: true,
            })
        config.resolve.alias
            //第一个参数：别名 第二个参数：路径
            .set('@components', resolve('src/components'))
            .set('@api', resolve('src/api'))
            .set('@views', resolve('src/views'))
            .set('@modules', resolve('src/modules'))
    },
    devServer: {
        historyApiFallback: true,
        allowedHosts: 'all',
        port: 8887,
        proxy: {
            '^/web/': {
                target: 'http://121.40.139.139:108',
                ws: false,
                pathRewrite: {
                    '^/web': '',
                },
            },
        },
    },
})
