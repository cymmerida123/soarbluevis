import type { App } from 'vue'

// 需要全局引入一些组件，如ElScrollbar，不然一些下拉项样式有问题
import ElementPlus, { ElLoading, ElScrollbar } from 'element-plus'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// const plugins = [ElLoading]

// const components = [ElScrollbar]

export const setupElementPlus = (app: App<Element>) => {
    app.use(ElementPlus)
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
        app.component(key, component)
    }

    // plugins.forEach((plugin) => {
    //     app.use(plugin)
    // })

    // components.forEach((component) => {
    //     app.component(component.name, component)
    // })
}
