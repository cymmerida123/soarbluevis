import { createRouter, createWebHashHistory } from 'vue-router'
import type { App } from 'vue'
import { Layout } from '@/utils/routerHelper'
import type { RouteRecordRaw } from 'vue-router'
import { useI18n } from '@/hooks/web/useI18n'

const { t } = useI18n()

export const constantRouterMap: AppRouteRecordRaw[] = [
    {
        path: '/',
        component: Layout,
        redirect: '/home',
        name: 'Root',
        meta: {
            hidden: true
        }
    },
    {
        path: '/redirect',
        component: Layout,
        name: 'Redirect',
        children: [
            {
                path: '/redirect/:path(.*)',
                name: 'Redirect',
                component: () => import('@/views/Redirect/Redirect.vue'),
                meta: {}
            }
        ],
        meta: {
            hidden: true,
            noTagsView: true
        }
    },
    {
        path: '/404',
        component: () => import('@/views/Error/404.vue'),
        name: 'NoFind',
        meta: {
            hidden: true,
            title: '404',
            noTagsView: true
        }
    },
    {
        path: '/home',
        component: Layout,
        name: 'Home',
        meta: {},
        children: [
            {
                path: '',
                component: () => import('@/views/Home/Home.vue'),
                name: 'HomeIndex',
                meta: {
                    title: t('router.home'),
                    icon: 'svg-icon:home'
                }
            }
        ]
    },
    {
        path: '/scenario/:id',
        component: Layout,
        name: 'Scenario',
        meta: {
            hidden: true
        },
        children: [
            {
                path: '',
                component: () => import('@/views/Workplace/Workplace.vue'),
                name: 'ScenarioIndex',
                meta: {
                    title: t('router.scenario'),
                    icon: 'svg-icon:dashboard-filled',
                    hidden: true,
                    noCache: true
                }
            }
        ]
    },
    {
        path: '/nest/:id',
        component: Layout,
        name: 'Nest',
        meta: {
            hidden: true
        },
        children: [
            {
                path: '',
                component: () => import('@/views/Workplace/Workplace.vue'),
                name: 'NestIndex',
                meta: {
                    title: t('router.nest'),
                    icon: 'svg-icon:dashboard-filled',
                    hidden: true,
                    noCache: true
                }
            }
        ]
    },
    {
        path: '/guide',
        component: Layout,
        name: 'Guide',
        meta: {},
        children: [
            {
                path: 'index',
                component: () => import('@/views/Guide/Guide.vue'),
                name: 'GuideDemo',
                meta: {
                    title: t('router.guide'),
                    icon: 'svg-icon:telegram-plane'
                }
            }
        ]
    },
    {
        path: '/:path(.*)*',
        redirect: '/home',
        name: 'Any',
        meta: {
            hidden: true
        }
    }
]

export const asyncRouterMap: AppRouteRecordRaw[] = []

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    strict: true,
    routes: constantRouterMap as RouteRecordRaw[],
    scrollBehavior: () => ({ left: 0, top: 0 })
})

export const resetRouter = (): void => {
    const resetWhiteNameList = ['Redirect', 'Login', 'NoFind', 'Root']
    router.getRoutes().forEach((route) => {
        const { name } = route
        if (name && !resetWhiteNameList.includes(name as string)) {
            router.hasRoute(name) && router.removeRoute(name)
        }
    })
}

export const setupRouter = (app: App<Element>) => {
    app.use(router)
}

export default router
