import { defineStore } from 'pinia'
import { store } from '../index'
import { setCssVar, humpToUnderline } from '@/utils'
import { ElMessage, type ComponentSize } from 'element-plus'
import { useStorage } from '@/hooks/web/useStorage'

const { getStorage, setStorage } = useStorage()
import { initAppState } from '@/config'
import { getConfigApi } from '@/api'

interface AppState {
    project_name: string
    project_version: string
    project_info: string

    breadcrumb: boolean
    breadcrumbIcon: boolean
    collapse: boolean
    uniqueOpened: boolean
    hamburger: boolean
    screenfull: boolean
    size: boolean
    locale: boolean
    tagsView: boolean
    tagsViewIcon: boolean
    logo: boolean
    fixedHeader: boolean
    greyMode: boolean
    dynamicRouter: boolean
    serverDynamicRouter: boolean
    pageLoading: boolean
    layout: LayoutType
    title: string
    userInfo: string
    isDark: boolean
    currentSize: ComponentSize
    sizeMap: ComponentSize[]
    mobile: boolean
    footer: boolean
    theme: ThemeTypes
    fixedMenu: boolean
}

export const useAppStore = defineStore('app', {
    state: (): AppState => {
        return {
            project_name: getStorage('project_name') || '',
            project_info: getStorage('project_info') || '',
            project_version: getStorage('project_version') || '',

            userInfo: 'soarblue', // 登录信息存储字段-建议每个项目换一个字段，避免与其它项目冲突
            sizeMap: ['default', 'large', 'small'],
            mobile: false, // 是否是移动端
            title: import.meta.env.VITE_APP_TITLE, // 标题
            pageLoading: false, // 路由跳转loading
            breadcrumb: initAppState.breadcrumb, // 面包屑
            breadcrumbIcon: initAppState.breadcrumbIcon, // 面包屑图标
            collapse: false, // 折叠菜单
            uniqueOpened: initAppState.uniqueOpened, // 是否只保持一个子菜单的展开
            hamburger: initAppState.hamburger, // 折叠图标
            screenfull: initAppState.screenfull, // 全屏图标
            size: initAppState.size, // 尺寸图标
            locale: initAppState.locale, // 多语言图标
            tagsView: initAppState.tagsView, // 标签页
            tagsViewIcon: initAppState.getTagsViewIcon, // 是否显示标签图标
            logo: initAppState.logo, // logo
            fixedHeader: initAppState.fixedHeader, // 固定toolheader
            footer: initAppState.footer, // 显示页脚
            greyMode: initAppState.greyMode, // 是否开始灰色模式，用于特殊悼念日
            dynamicRouter: false, // 是否动态路由
            serverDynamicRouter: false, // 是否服务端渲染动态路由
            fixedMenu: false, // 是否固定菜单

            layout: getStorage('layout') || initAppState.layout, // layout布局
            isDark: getStorage('isDark'), // 是否是暗黑模式
            currentSize: getStorage('default') || initAppState.currentSize, // 组件尺寸
            theme: getStorage('theme') || {
                // 主题色
                elColorPrimary: initAppState.theme.elColorPrimary,
                // 左侧菜单边框颜色
                leftMenuBorderColor: initAppState.theme.leftMenuBorderColor,
                // 左侧菜单背景颜色
                leftMenuBgColor: initAppState.theme.leftMenuBgColor,
                // 左侧菜单浅色背景颜色
                leftMenuBgLightColor: initAppState.theme.leftMenuBgLightColor,
                // 左侧菜单选中背景颜色
                leftMenuBgActiveColor: 'var(--el-color-primary)',
                // 左侧菜单收起选中背景颜色
                leftMenuCollapseBgActiveColor: 'var(--el-color-primary)',
                // 左侧菜单字体颜色
                leftMenuTextColor: initAppState.theme.leftMenuTextColor,
                // 左侧菜单选中字体颜色
                leftMenuTextActiveColor: initAppState.theme.leftMenuTextActiveColor,
                // logo字体颜色
                logoTitleTextColor: initAppState.theme.logoTitleTextColor,
                // logo边框颜色
                logoBorderColor: initAppState.theme.logoBorderColor,
                // 头部背景颜色
                topHeaderBgColor: initAppState.theme.topHeaderBgColor,
                // 头部字体颜色
                topHeaderTextColor: initAppState.theme.topHeaderTextColor,
                // 头部悬停颜色
                topHeaderHoverColor: initAppState.theme.topHeaderHoverColor,
                // 头部边框颜色
                topToolBorderColor: initAppState.theme.topToolBorderColor
            }
        }
    },
    getters: {
        getBreadcrumb(): boolean {
            return this.breadcrumb
        },
        getBreadcrumbIcon(): boolean {
            return this.breadcrumbIcon
        },
        getCollapse(): boolean {
            return this.collapse
        },
        getUniqueOpened(): boolean {
            return this.uniqueOpened
        },
        getHamburger(): boolean {
            return this.hamburger
        },
        getScreenfull(): boolean {
            return this.screenfull
        },
        getSize(): boolean {
            return this.size
        },
        getLocale(): boolean {
            return this.locale
        },
        getTagsView(): boolean {
            return this.tagsView
        },
        getTagsViewIcon(): boolean {
            return this.tagsViewIcon
        },
        getLogo(): boolean {
            return this.logo
        },
        getFixedHeader(): boolean {
            return this.fixedHeader
        },
        getGreyMode(): boolean {
            return this.greyMode
        },
        getDynamicRouter(): boolean {
            return this.dynamicRouter
        },
        getServerDynamicRouter(): boolean {
            return this.serverDynamicRouter
        },
        getFixedMenu(): boolean {
            return this.fixedMenu
        },
        getPageLoading(): boolean {
            return this.pageLoading
        },
        getLayout(): LayoutType {
            return this.layout
        },
        getTitle(): string {
            return this.title
        },
        getUserInfo(): string {
            // 默认直接登录了用户
            return 'SoarBlue'
            // return this.userInfo
        },
        getIsDark(): boolean {
            return this.isDark
        },
        getCurrentSize(): ComponentSize {
            return this.currentSize
        },
        getSizeMap(): ComponentSize[] {
            return this.sizeMap
        },
        getMobile(): boolean {
            return this.mobile
        },
        getTheme(): ThemeTypes {
            return this.theme
        },
        getFooter(): boolean {
            return this.footer
        },
        getProjectInfo(): string {
            return this.project_info
        },
        getProjectName(): string {
            return this.project_name
        },
        getProjectVersion(): string {
            return this.project_version
        }
    },
    actions: {
        async fetchConfig() {
            getConfigApi().then((res) => {
                const { project_name, project_info, project_version } = res.data
                this.setProjectName(project_name)
                this.setProjectInfo(project_info)
                this.setProjectVersion(project_version)
                this.setTitle(project_name)
            })
        },
        setProjectName(project_name: string) {
            this.project_name = project_name
            setStorage('project_name', this.project_name)
        },
        setProjectInfo(project_info: string) {
            this.project_info = project_info
            setStorage('project_info', this.project_info)
        },
        setProjectVersion(project_version: string) {
            this.project_version = project_version
            setStorage('project_version', this.project_version)
        },
        setBreadcrumb(breadcrumb: boolean) {
            this.breadcrumb = breadcrumb
        },
        setBreadcrumbIcon(breadcrumbIcon: boolean) {
            this.breadcrumbIcon = breadcrumbIcon
        },
        setCollapse(collapse: boolean) {
            this.collapse = collapse
        },
        setUniqueOpened(uniqueOpened: boolean) {
            this.uniqueOpened = uniqueOpened
        },
        setHamburger(hamburger: boolean) {
            this.hamburger = hamburger
        },
        setScreenfull(screenfull: boolean) {
            this.screenfull = screenfull
        },
        setSize(size: boolean) {
            this.size = size
        },
        setLocale(locale: boolean) {
            this.locale = locale
        },
        setTagsView(tagsView: boolean) {
            this.tagsView = tagsView
        },
        setTagsViewIcon(tagsViewIcon: boolean) {
            this.tagsViewIcon = tagsViewIcon
        },
        setLogo(logo: boolean) {
            this.logo = logo
        },
        setFixedHeader(fixedHeader: boolean) {
            this.fixedHeader = fixedHeader
        },
        setGreyMode(greyMode: boolean) {
            this.greyMode = greyMode
        },
        setDynamicRouter(dynamicRouter: boolean) {
            setStorage('dynamicRouter', dynamicRouter)
            this.dynamicRouter = dynamicRouter
        },
        setServerDynamicRouter(serverDynamicRouter: boolean) {
            setStorage('serverDynamicRouter', serverDynamicRouter)
            this.serverDynamicRouter = serverDynamicRouter
        },
        setFixedMenu(fixedMenu: boolean) {
            setStorage('fixedMenu', fixedMenu)
            this.fixedMenu = fixedMenu
        },
        setPageLoading(pageLoading: boolean) {
            this.pageLoading = pageLoading
        },
        setLayout(layout: LayoutType) {
            if (this.mobile && layout !== 'classic') {
                ElMessage.warning('移动端模式下不支持切换其它布局')
                return
            }
            this.layout = layout
            setStorage('layout', this.layout)
        },
        setTitle(title: string) {
            this.title = title
        },
        setIsDark(isDark: boolean) {
            this.isDark = isDark
            if (this.isDark) {
                document.documentElement.classList.add('dark')
                document.documentElement.classList.remove('light')
            } else {
                document.documentElement.classList.add('light')
                document.documentElement.classList.remove('dark')
            }
            setStorage('isDark', this.isDark)
        },
        setCurrentSize(currentSize: ComponentSize) {
            this.currentSize = currentSize
            setStorage('currentSize', this.currentSize)
        },
        setMobile(mobile: boolean) {
            this.mobile = mobile
        },
        setTheme(theme: ThemeTypes) {
            this.theme = Object.assign(this.theme, theme)
            setStorage('theme', this.theme)
        },
        setCssVarTheme() {
            for (const key in this.theme) {
                setCssVar(`--${humpToUnderline(key)}`, this.theme[key])
            }
        },
        setFooter(footer: boolean) {
            this.footer = footer
        }
    }
})

export const useAppStoreWithOut = () => {
    return useAppStore(store)
}
