import {
    AxiosConfig,
    AxiosResponse,
    AxiosRequestHeaders,
    AxiosError,
    InternalAxiosRequestConfig
} from './types'
import { ElMessage } from 'element-plus'
import qs from 'qs'

const config: AxiosConfig = {
    /**
     * 接口成功返回状态码
     */
    code: 0,

    /**
     * 接口请求超时时间
     */
    timeout: 60000,

    /**
     * 默认接口请求类型
     * 可选值：application/x-www-form-urlencoded multipart/form-data
     */
    defaultHeaders: 'application/x-www-form-urlencoded',

    interceptors: {
        //请求拦截
        // requestInterceptors: (config) => {
        //   return config
        // },
        // 响应拦截器
        // responseInterceptors: (result: AxiosResponse) => {
        //   return result
        // }
    }
}

const defaultRequestInterceptors = (config: InternalAxiosRequestConfig) => {
    console.log(`Request ${config.method} ${config.url}`, config)
    if (
        config.method === 'post' &&
        (config.headers as AxiosRequestHeaders)['Content-Type'] ===
            'application/x-www-form-urlencoded'
    ) {
        config.data = qs.stringify(config.data)
    }
    if (config.method === 'get' && config.params) {
        let url = config.url as string
        url += '?'
        const keys = Object.keys(config.params)
        for (const key of keys) {
            if (config.params[key] !== void 0 && config.params[key] !== null) {
                url += `${key}=${encodeURIComponent(config.params[key])}&`
            }
        }
        url = url.substring(0, url.length - 1)
        config.params = {}
        config.url = url
    }
    return config
}
;(error: AxiosError) => {
    console.log('defaultRequestInterceptors Error' + error) // for debug
    console.log(error)
    ElMessage.error(error.message)
    Promise.reject(error)
}

export class ApiError extends Error {
    message = ''
    code = 0
    mode: string | 'error' | 'warning' = 'error'
    constructor(message: string, code: number, mode: string = 'error') {
        super(message)
        this.name = 'ApiError'
        this.message = message
        this.code = code
        this.mode = mode
    }
}

const defaultResponseInterceptors = (response: AxiosResponse<any>) => {
    const tag = `Response ${response.config.method} ${response.config.url}`
    console.log(tag, response.data)

    if (response?.config?.responseType === 'blob') {
        // 如果是文件流，直接过
        return response
    }

    if (!response.data) {
        console.error(
            tag,
            '接口请求失败（可能是后端出现异常或没有开启后端），请查看程序运行窗口的提示'
        )
        ElMessage.error(
            '接口请求失败（可能是后端出现异常或没有开启后端），请查看程序运行窗口的提示'
        )
        return Promise.reject(
            new ApiError(
                '接口请求失败（可能是后端出现异常或没有开启后端），请查看程序运行窗口的提示',
                500
            )
        )
    }
    if (response.data.msg) {
        switch (response.data.mode) {
            case 'warning':
                console.warn(tag, response.data.msg)
                ElMessage.warning(response.data.msg)
                break
            case 'info':
                console.info(tag, response.data.msg)
                ElMessage.info(response.data.msg)
                break
            case 'success':
                console.log(tag, response.data.msg)
                ElMessage.success(response.data.msg)
                break
            default:
                console.error(tag, response.data.msg)
                ElMessage.error(response.data.msg)
                break
        }
    }

    if (response.data.code === config.code) {
        return response.data
    } else {
        return Promise.reject(new ApiError(response.data.msg, response.data.code))
    }
}

;(error: AxiosError) => {
    console.log('defaultResponseInterceptors Error' + error) // for debug
    ElMessage.error(error.message)
    return Promise.reject(error)
}

export { defaultResponseInterceptors, defaultRequestInterceptors }
export default config
