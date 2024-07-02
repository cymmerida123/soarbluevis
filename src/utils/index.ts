// import type { Plugin } from 'vue'

import { ElMessage } from 'element-plus'

/**
 *
 * @param component 需要注册的组件
 * @param alias 组件别名
 * @returns any
 */
export const withInstall = <T>(component: T, alias?: string) => {
    const comp = component as any
    comp.install = (app: any) => {
        app.component(comp.name || comp.displayName, component)
        if (alias) {
            app.config.globalProperties[alias] = component
        }
    }
    return component as T & Plugin
}

/**
 * @param str 需要转下划线的驼峰字符串
 * @returns 字符串下划线
 */
export const humpToUnderline = (str: string): string => {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

/**
 * @param str 需要转驼峰的下划线字符串
 * @returns 字符串驼峰
 */
export const underlineToHump = (str: string): string => {
    if (!str) return ''
    return str.replace(/\-(\w)/g, (_, letter: string) => {
        return letter.toUpperCase()
    })
}

/**
 * 驼峰转横杠
 */
export const humpToDash = (str: string): string => {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export const setCssVar = (prop: string, val: any, dom = document.documentElement) => {
    dom.style.setProperty(prop, val)
}

/**
 * 查找数组对象的某个下标
 * @param {Array} ary 查找的数组
 * @param {Functon} fn 判断的方法
 */
// eslint-disable-next-line
export const findIndex = <T = Recordable>(ary: Array<T>, fn: Fn): number => {
    if (ary.findIndex) {
        return ary.findIndex(fn)
    }
    let index = -1
    ary.some((item: T, i: number, ary: Array<T>) => {
        const ret: T = fn(item, i, ary)
        if (ret) {
            index = i
            return ret
        }
    })
    return index
}

export const trim = (str: string) => {
    return str.replace(/(^\s*)|(\s*$)/g, '')
}

/**
 * @param {Date | number | string} time 需要转换的时间
 * @param {String} fmt 需要转换的格式 如 yyyy-MM-dd、yyyy-MM-dd HH:mm:ss
 */
export function formatTime(time: Date | number | string, fmt: string) {
    if (!time) return ''
    else {
        const date = new Date(time)
        const o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'H+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds(),
            'q+': Math.floor((date.getMonth() + 3) / 3),
            S: date.getMilliseconds()
        }
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
        }
        for (const k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(
                    RegExp.$1,
                    RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
                )
            }
        }
        return fmt
    }
}

/**
 * 生成随机字符串
 */
export function toAnyString() {
    const str: string = 'xxxxx-xxxxx-4xxxx-yxxxx-xxxxx'.replace(/[xy]/g, (c: string) => {
        const r: number = (Math.random() * 16) | 0
        const v: number = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString()
    })
    return str
}

/**
 * 首字母大写
 */
export function firstUpperCase(str: string) {
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
}

async function asyncDelay(ms: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve() // 延时结束后，将 Promise 标记为已解决
        }, ms)
    })
}

export function downloadText(text, filename = 'data.json', type: string = 'application/json') {
    const blob = new Blob([text], { type: type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', filename)
    a.click()
    URL.revokeObjectURL(url)
}

export function copyToClipboard(text: string, toast: string = '已复制') {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                if (toast) {
                    ElMessage.success(toast)
                }
            })
            .catch((err) => {
                console.error('复制失败:', err)
                ElMessage.error(`复制失败: ${err}`)
            })
    } else {
        const input = document.createElement('input')
        input.setAttribute('value', text)
        document.body.appendChild(input)
        input.select()
        if (document.execCommand('copy')) {
            document.execCommand('copy')
        }
        document.body.removeChild(input)
        if (toast) {
            ElMessage.success(toast)
        }
    }
}

export const debounceFn = (pointer: any, func: () => void, delay: number) => {
    let timeoutId: NodeJS.Timeout | null

    return () => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => {
            func.apply(pointer)
            timeoutId = null
        }, delay)
    }
}

export const throttleFn = (pointer: any, func: () => void, delay: number) => {
    let timeoutId: NodeJS.Timeout | null

    return () => {
        if (timeoutId) {
            return
        }

        timeoutId = setTimeout(() => {
            func.apply(pointer)
            timeoutId = null
        }, delay)
    }
}

export function advancedSearch(text: string, keyword: string): boolean {
    // 高级搜索 用于搜索框 关键词搜索
    return ((text || '') + '')
        .replaceAll('\n', '')
        .replaceAll(/\s+/g, '')
        .includes(((keyword || '') + '').replaceAll('\n', '').replaceAll(/\s+/g, ''))
}
