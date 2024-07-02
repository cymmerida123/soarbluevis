import { Cell, Graph, Node, Path, Edge } from '@antv/x6'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Clipboard } from '@antv/x6-plugin-clipboard'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Selection } from '@antv/x6-plugin-selection'
import { History } from '@antv/x6-plugin-history'
import { Scroller } from '@antv/x6-plugin-scroller'
import { MiniMap } from '@antv/x6-plugin-minimap'
import { Export } from '@antv/x6-plugin-export'
import { Stencil } from '@antv/x6-plugin-stencil'
import insertCss from 'insert-css'

import {
    getGraphDetailApi,
    updateGraphApi,
    getGraphTreeApi,
    getExecInfoApi,
    startExecApi,
    pauseExecApi,
    resumeExecApi,
    stopExecApi,
    getUiConfigApi,
    getStencilConfigApi,
    validateGraphApi,
    generateProjectApi,
    openFileApi,
    getConfigApi,
    resetGraphEnvApi,
    resetNodeApi,
    exportGraphDbApi,
    importGraphDbApi
} from '@/api'
import type { ExecInfo, GetConfigResponse, StencilConfigResponse } from '@/api/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nextTick } from 'vue'
import { GraphModelData } from '@/api/types'
import { downloadText, debounceFn, advancedSearch } from '@/utils'
import {
    GraphTreeUtil,
    delay,
    generateCommanderTree,
    nest_node_id,
    textAutoWrap,
    traverse
} from './utils'
import { EXEC_STATUS } from './constants'
import { TreeNode, createEmptyTreeNode } from './types'
import { useTagsViewStore } from '@/store/modules/tagsView'

import router from '@/router'
import { root } from 'postcss'
const tagsViewStore = useTagsViewStore()

const browserId = Math.random().toString(36).slice(2)

// 定义路由方式
Graph.registerConnector(
    'curveConnector',
    (sourcePoint, targetPoint) => {
        const vgap = Math.abs(targetPoint.y - sourcePoint.y)
        const path = new Path()
        path.appendSegment(Path.createSegment('M', sourcePoint.x, sourcePoint.y))
        path.appendSegment(Path.createSegment('L', sourcePoint.x, sourcePoint.y + 12))
        // 垂直三阶贝塞尔曲线
        path.appendSegment(
            Path.createSegment(
                'C',
                sourcePoint.x,
                sourcePoint.y < targetPoint.y ? sourcePoint.y + vgap / 2 : sourcePoint.y - vgap / 2,
                targetPoint.x,
                sourcePoint.y < targetPoint.y ? targetPoint.y - vgap / 2 : targetPoint.y + vgap / 2,
                targetPoint.x,
                targetPoint.y - 8
            )
        )
        path.appendSegment(Path.createSegment('L', targetPoint.x, targetPoint.y - 2))

        return path.serialize()
    },
    true
)

const EDGE_STROKE_WIDTH = 2 // 边的粗度

// 定义边
Edge.config({
    markup: [
        {
            tagName: 'path',
            selector: 'wrap',
            attrs: {
                fill: 'none',
                cursor: 'pointer',
                stroke: 'transparent',
                strokeLinecap: 'round'
            }
        },
        {
            tagName: 'path',
            selector: 'line',
            attrs: {
                fill: 'none',
                pointerEvents: 'none'
            }
        }
    ],
    connector: { name: 'curveConnector' },
    attrs: {
        wrap: {
            connection: true,
            strokeWidth: 10,
            strokeLinejoin: 'round'
        },
        line: {
            connection: true,
            stroke: '#000',
            strokeWidth: EDGE_STROKE_WIDTH,
            targetMarker: {
                name: 'classic',
                size: 6
            }
        }
    },
    zIndex: -1
})

const EDGE_SHAPE = 'data-processing-curve'
Graph.registerEdge(EDGE_SHAPE, Edge, true)

class GraphManager {
    sidebar: HTMLElement | null = null
    stencil: Stencil | null = null

    parent_graph_id: string = '' // 父图id 嵌套图使用
    parent_node_id: string = '' // 父节点ID 嵌套图使用
    graph_id: string = ''
    graph: Graph | null = null
    route_path: string = ''

    tree_util: GraphTreeUtil = new GraphTreeUtil({})

    can_undo = false
    can_redo = false
    // 是否有未更新的改动
    is_modified: boolean = false

    scaleFactor = 1

    selected: string | 'node' | 'edge' = ''

    // 选中的边
    selected_edge: Cell | null = null
    selected_edge_data: { id: string; source: TreeNode; target: TreeNode } = {
        id: '',
        source: createEmptyTreeNode(),
        target: createEmptyTreeNode()
    }

    selected_node: Cell | null = null
    selected_node_data: TreeNode = createEmptyTreeNode()
    selected_status: string = EXEC_STATUS.NOT_RUN

    sidebar_visible: boolean = true
    infobar_visible: boolean = true
    infobar_active_tab: string = 'env'

    config: GetConfigResponse = {
        project_name: '',
        default_graph_env: '',
        project_info: '',
        project_version: '',
        use_zmq: false,
        scripts_dir: '',
        dev: false
    }

    exec_info: ExecInfo = {
        graph_id: '',
        node_status: [],
        status: 'not_run'
    }

    graph_data: GraphModelData = {
        id: '',
        name: '',
        desc: '',
        type: '',
        tree: '',
        env: '',
        content: '',
        create_time: 0,
        update_time: 0,
        deleted: 0,
        node_count: 0,
        edge_count: 0
    }

    delaySave: any = null
    delayUpdate: any = null

    // delaySave: any = throttleFn(() => {
    //     console.log('throttleSave')
    //     this.onSave({ toast: false, change_title: true })
    // }, 500)

    interval_ids: any[] = []

    stencil_config: StencilConfigResponse = {
        groups: []
    }
    stencil_nodes: any[] = []

    destroy() {
        this.graph.clearKeys()
        this.onSave()
        this.interval_ids.forEach((id) => {
            clearInterval(id)
        })
    }

    visible = true
    onVisibleChage(visible: boolean) {
        this.visible = visible
        if (visible) {
            this.initData(this.graph_id)
        } else {
            this.onSave({ toast: false, change_title: false })
        }
    }

    async initView(
        route_path: string,
        graph_id: any,
        sidebar: HTMLElement | null,
        content: HTMLElement | null,
        minimap: HTMLElement | null,
        parent_graph_id: any = '',
        parent_node_id: any = ''
    ) {
        console.log('initView', route_path, graph_id, sidebar, content, minimap)
        this.route_path = route_path
        this.graph_id = graph_id

        this.parent_graph_id = parent_graph_id
        this.parent_node_id = parent_node_id
        this.sidebar = sidebar
        this.delaySave = debounceFn(
            this,
            () => {
                console.log('debounceSave')
                this.onSave({ toast: false, change_title: true })
            },
            500
        )

        this.delayUpdate = debounceFn(
            this,
            () => {
                console.log('debounceUpdate')
                this.onGraphUpdate()
            },
            200
        )

        // init window hook
        // @ts-ignore
        window.__x6_instances__ = []
        const graph: Graph = new Graph({
            // @ts-ignore
            container: content,
            autoResize: true,
            panning: false,
            width: 1200,
            height: 800,
            mousewheel: {
                enabled: true,
                modifiers: 'Ctrl',
                maxScale: 4,
                minScale: 0.2
            },
            grid: {
                visible: true,
                type: 'doubleMesh',
                args: [
                    {
                        color: '#eee', // 主网格线颜色
                        thickness: 1 // 主网格线宽度
                    },
                    {
                        color: '#ddd', // 次网格线颜色
                        thickness: 1, // 次网格线宽度
                        factor: 4 // 主次网格线间隔
                    }
                ]
            },
            connecting: {
                allowNode: false,
                allowLoop: false,
                allowBlank: false,
                allowEdge: false,
                allowPort: true,
                allowMulti: false,
                // router: {
                //     name: 'manhattan',
                //     // name: 'curveConnectorVertical',
                //     args: {
                //         padding: 10
                //     }
                // },
                // connector: {
                //     name: 'rounded',
                //     // name: 'curveConnector',
                //     args: {
                //         radius: 8
                //     }
                // },
                // sourceAnchor: {
                //     name: 'top',
                //     args: {
                //         dy: Platform.IS_SAFARI ? 4 : 8
                //     }
                // },
                // targetAnchor: {
                //     name: 'bottom',
                //     args: {
                //         dy: Platform.IS_SAFARI ? 4 : -8
                //     }
                // },
                anchor: 'center',
                connectionPoint: 'anchor',
                snap: {
                    radius: 20
                },
                createEdge() {
                    return graph.createEdge({
                        shape: EDGE_SHAPE
                    })
                },
                // createEdge() {
                //     return new Shape.Edge({
                //         attrs: {
                //             line: {
                //                 stroke: '#A2B1C3',
                //                 strokeWidth: 2,
                //                 targetMarker: {
                //                     name: 'block',
                //                     width: 12,
                //                     height: 8
                //                 }
                //             }
                //         },
                //         zIndex: 0
                //     })
                // }
                // validateConnection({ targetMagnet }) {
                //     return !!targetMagnet
                // },
                // 连接桩校验
                validateConnection({ sourceMagnet, targetMagnet }) {
                    // 只能从输出链接桩创建连接
                    if (!sourceMagnet || sourceMagnet.getAttribute('port-group') === 'top') {
                        ElMessage('只能从节点底部链接桩创建连接')
                        return false
                    }
                    // 只能连接到输入链接桩
                    if (!targetMagnet || targetMagnet.getAttribute('port-group') !== 'top') {
                        ElMessage('只能连接到节点顶部接桩')
                        return false
                    }
                    return true
                }
            },
            highlighting: {
                // // 连接桩可以被连接时在连接桩外围围渲染一个包围框
                // magnetAvailable: {
                //     name: 'stroke',
                //     args: {
                //         attrs: {
                //             fill: '#fff',
                //             stroke: '#A4DEB1',
                //             strokeWidth: 4
                //         }
                //     }
                // },
                // // 连接桩吸附连线时在连接桩外围围渲染一个包围框
                // magnetAdsorbed: {
                //     name: 'stroke',
                //     args: {
                //         attrs: {
                //             fill: '#fff',
                //             stroke: '#31d0c6',
                //             strokeWidth: 4
                //         }
                //     }
                // }
            },
            interacting: {
                nodeMovable: true,
                edgeMovable: true,
                magnetConnectable: true,
                edgeLabelMovable: true,
                arrowheadMovable: true,
                vertexMovable: true,
                vertexAddable: true,
                vertexDeletable: true
            }
        })
        this.graph = graph

        graph
            .use(
                new Snapline({
                    enabled: true
                })
            )
            .use(
                new Scroller({
                    enabled: true,
                    pannable: true,
                    autoResize: true,
                    modifiers: ['ctrl', 'meta']
                })
            )
            .use(
                new Clipboard({
                    enabled: true
                })
            )
            .use(
                new Keyboard({
                    enabled: true,
                    global: true
                })
            )
            .use(
                new Selection({
                    enabled: true,
                    showNodeSelectionBox: true,
                    multiple: true,
                    multipleSelectionModifiers: ['ctrl', 'meta'],
                    rubberband: true,
                    strict: false,
                    movable: true,
                    showEdgeSelectionBox: true,
                    pointerEvents: 'none'
                })
            )
            .use(
                new History({
                    enabled: true
                })
            )
            .use(new Export())
        // .use(
        //     new Transform({
        //         resizing: true,
        //         rotating: true
        //     })
        // )
        if (minimap != null) {
            graph.use(
                new MiniMap({
                    container: minimap,
                    width: 200,
                    height: 160,
                    padding: 10
                })
            )
        }

        // @ts-ignore
        window.__x6_instances__.push(graph)

        this.graph.on('history:change', ({ cmds }) => {
            this.delayUpdate()
        })

        // this.graph.on('history:undo', ({ cmds }) => {
        //     this.onGraphUpdate()
        // })

        // this.graph.on('history:redo', ({ cmds }) => {
        //     this.onGraphUpdate()
        // })

        this.graph.bindKey(['ctrl+c', 'command+c'], () => {
            this.onCopy()
            return false
        })
        this.graph.bindKey(['ctrl+x', 'command+x'], () => {
            this.onCut()
            return false
        })
        this.graph.bindKey(['ctrl+v', 'command+v'], () => {
            this.onPaste()
            return false
        })
        this.graph.bindKey(['delete', 'backspace'], () => {
            this.onDelete()
            return false
        })

        this.graph.bindKey(['ctrl+z', 'command+z'], () => {
            this.onUndo()
            return false
        })

        this.graph.bindKey(['ctrl+a', 'command+a'], () => {
            this.onSelectAll()
            return false
        })

        this.graph.bindKey(['ctrl+shift+z', 'command+shift+z'], () => {
            this.onRedo()
            return false
        })

        this.graph.bindKey(['ctrl+s', 'command+s'], () => {
            console.log('ctrl+s', this.graph_id)
            this.onSave()
            return false
        })
        this.graph.on('node:selected', ({ node }) => {
            try {
                console.log('node:selected', node)
                this.selected_node_data = this.tree_util.node_dict[node.id]
                // @ts-ignore
                this.selected_node = node
                this.selected = 'node'
            } catch (e) {
                console.log(e)
                ElMessage.error(e)
            }
        })

        this.graph.on('node:unselected', ({ node }) => {
            try {
                console.log('node:unselected', node)
                if (this.selected == 'node') {
                    this.selected = ''
                }
            } catch (e) {
                console.log(e)
                ElMessage.error(e)
            }
        })

        this.graph.on('edge:selected', ({ edge }) => {
            try {
                // @ts-ignore
                if (!this.tree_util.node_dict.hasOwnProperty(edge.source.cell)) {
                    return
                }
                // @ts-ignore
                if (!this.tree_util.node_dict.hasOwnProperty(edge.target.cell)) {
                    return
                }
                console.log('edge:selected', edge)

                this.selected_edge_data = {
                    id: edge.id,
                    // @ts-ignore
                    source: this.tree_util.node_dict[edge.source.cell],
                    // @ts-ignore
                    target: this.tree_util.node_dict[edge.target.cell]
                }

                this.selected_edge = edge
                this.selected = 'edge'
            } catch (e) {
                console.log(e)
                ElMessage.error(e)
            }
        })

        this.graph.on('edge:unselected', ({ edge }) => {
            try {
                if (this.selected == 'edge') {
                    this.selected = ''
                }
            } catch (e) {
                console.log(e)
                ElMessage.error(e)
            }
        })

        // 控制连接桩显示/隐藏
        const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
            for (let i = 0, len = ports.length; i < len; i += 1) {
                ports[i].style.visibility = show ? 'visible' : 'hidden'
            }
        }
        graph.on('cell:mouseenter', () => {
            const ports = content.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>
            showPorts(ports, true)
        })
        graph.on('cell:mouseleave', () => {
            const ports = content.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>
            showPorts(ports, false)
        })

        graph.on('node:dblclick', ({ node }) => {
            const node_data = this.tree_util.node_dict[node.id]
            console.log('node:dblclick', node_data)
            if (node_data.data.type == 'nest') {
                // 打开子图页面
                router.push({
                    path: `/nest/${node_data.data.nest_id}`,
                    query: {
                        parent_graph_id: this.graph_id,
                        parent_node_id: node_data.id
                    }
                })
                // const routerData = router.resolve({
                //     path: `/nest/${node_data.data.nest_id}`
                // })
                // window.open(routerData.href, '_blank')
            }
        })

        // 初始化侧边栏
        const uiConfig = (await getUiConfigApi()).data

        uiConfig.register_nodes.forEach((it) => {
            Graph.registerNode(it.key, it.config, it.force)
        })

        await this.initStencil()

        this.config = (await getConfigApi()).data

        await this.initData(this.graph_id, { centerContent: true })

        this.interval_ids.push(
            // 每隔一段时间自动保存一次，8s间隔
            setInterval(() => {
                console.log('每隔一段时间自动保存一次')
                if (this.is_modified) {
                    this.delaySave()
                }
            }, 8000)
        )

        this.interval_ids.push(
            // 每隔一段时间获取一次最近的执行记录
            setInterval(async () => {
                await this.onRefreshExecInfo()
            }, 1000)
        )
    }

    async refreshStencilConfig() {
        this.stencil_config = (await getStencilConfigApi({ graph_id: this.graph_id })).data
        const stencil_nodes = []
        this.stencil_config.groups.forEach((group) => {
            stencil_nodes.push(...group.nodes)
        })
        this.stencil_nodes = stencil_nodes
    }

    async initStencil() {
        await this.refreshStencilConfig()
        const stencil = new Stencil({
            title: '节点列表',
            placeholder: '搜索节点',
            notFoundText: '\n未找到匹配的节点',
            collapsable: false,
            stencilGraphHeight: 0,
            stencilGraphWidth: 230,
            ...this.stencil_config,
            target: this.graph,
            search: (cell: Node, keyword: string): boolean => {
                // 检索完自动滚动到顶部
                const stencilContent = stencil.container.querySelector('.x6-widget-stencil-content')
                if (stencilContent && stencilContent.scrollTop > 0) {
                    stencilContent.scrollTo({
                        top: 0
                    })
                }

                return (
                    // @ts-ignore
                    advancedSearch(cell.attrs.text.text, keyword) ||
                    advancedSearch(cell.data.key, keyword) ||
                    advancedSearch(cell.data.name, keyword) ||
                    cell.id == keyword
                )
            },
            groups: this.stencil_config.groups.map((it) => {
                return {
                    ...it
                }
            })
            // groups: [
            //     { name: 'composite', title: '组合节点' },
            //     ...sidebarData.map((it) => {
            //         return {
            //             name: it.name,
            //             title: it.title
            //         }
            //     })
            // ]
        })

        for (const group of this.stencil_config.groups) {
            const nodes = group.nodes.map((item: any) => {
                return this.graph.createNode({
                    ...item,
                    group_name: group.name,
                    group_title: group.title
                })
            })
            stencil.load(nodes, group.name)
        }
        if (this.stencil != null) {
            this.sidebar.removeChild(this.stencil.container)
        }
        this.sidebar.appendChild(stencil.container)
        this.stencil = stencil
    }

    async initData(id: any, payload: { centerContent: boolean } = { centerContent: false }) {
        // if (this.is_modified && this.graph_data.id != id) {
        //     await this.onSave({
        //         toast: false,
        //         change_title: false
        //     })
        // }
        if (!id) {
            return
        }
        console.log('event:onChangeGraphId', id)
        this.graph_id = id
        try {
            this.graph_data = (
                await getGraphDetailApi({
                    graph_id: id,
                    parent_graph_id: this.parent_graph_id,
                    parent_node_id: this.parent_node_id
                })
            ).data
            const jsonData = JSON.parse(this.graph_data.content)
            if (jsonData.hasOwnProperty('cells')) {
                this.graph.fromJSON(jsonData)
            } else {
                ElMessage.error('线上的图数据格式错误')
            }

            this.onGraphUpdate({ is_modified: false })

            if (document.title != this.graph_data.name) {
                document.title = this.graph_data.name
                tagsViewStore.setTitle(this.graph_data.name, this.route_path)
            }

            this.is_modified = false
            if (payload.centerContent) {
                await nextTick()
                this.graph.centerContent()
            }
        } catch (e) {}
    }

    skip_graph_update = false // 跳过图更新事件

    // 图更新事件
    onGraphUpdate(payload: { is_modified: boolean } = { is_modified: true }) {
        if (this.skip_graph_update) {
            return
        }

        for (const edge of this.graph.getEdges()) {
            // 修复边的zIndex，防止边遮挡节点
            edge.zIndex = -1
        }

        try {
            console.log('event:onGraphUpdate')
            this.is_modified = payload.is_modified
            this.can_undo = this.graph.canUndo()
            this.can_redo = this.graph.canRedo()
            this.tree_util.reset(this.graph.toJSON())
        } catch (e) {
            console.error(e)
            ElMessage.error(e)
        }

        // 修改所有节点的index

        // this.tree_util.nodes.forEach((node) => {
        //     const cell = this.graph.getCellById(node.id)
        //     if (cell.data.index != node.data.index) {
        //         cell.data.index = node.data.index
        //         cell.prop('data', cell.data)
        //     }
        // })
    }

    async onNodeUpdate(node: TreeNode) {
        console.log('event:onNodeUpdate', node?.data?.key)

        if (!node.id) {
            return
        }
        this.skip_graph_update = true

        try {
            const is_key_changed = this.tree_util.old_node_dict[node.id].data.key != node.data.key
            const is_disabled_changed =
                this.tree_util.old_node_dict[node.id].data.disabled != node.data.disabled
            // 如果old_data的key和new_data的key不一样，就需要切换节点

            const cell = this.graph.getCellById(node.id)
            if (cell == null) {
                ElMessage.error('当前节点未在图上找到')
                return
            }

            if (is_key_changed) {
                console.log(
                    'event:onUpdateNodeData 切换节点的key',
                    node.data.key,
                    node.data.type,
                    this.stencil_nodes.filter((it) => {
                        return it.data.key == node.data.key && it.data.type == node.data.type
                    })
                )
                const stencil_node = this.stencil_nodes.find((it) => {
                    return it.data.key == node.data.key && it.data.type == node.data.type
                })
                console.log('event:onNodeUpdate 切换节点的key', stencil_node)
                if (!stencil_node) {
                    ElMessage.error('切换节点出现错误，未找到对应的预设节点')
                } else {
                    node.data = JSON.parse(JSON.stringify(stencil_node.data))
                    node.label = stencil_node.label
                    cell.attr('body/fill', stencil_node.attrs.body.fill)
                }
            }

            if (is_disabled_changed) {
                traverse([node], (item) => {
                    const cell = this.graph.getCellById(item.node.id)
                    if (cell == null) {
                        ElMessage.error('有部分节点未在图上找到')
                        return
                    }
                    item.node.data.disabled = node.data.disabled
                    cell.data = item.node.data
                    cell.prop('data', item.node.data)
                    cell.attr({
                        body: {
                            opacity: item.node.data.disabled ? 0.3 : 1
                        }
                    })
                    const edges = this.graph.getIncomingEdges(item.node.id) || []
                    for (const edge of edges) {
                        edge.attr({
                            line: {
                                opacity: item.node.data.disabled ? 0.3 : 1
                            }
                        })
                    }
                })
            }

            cell.data = node.data
            cell.prop('data', node.data)
            const label = node.label || node.data.name || node.data.key
            cell.attr('text/text', label)
            cell.attr('text/fontSize', node.label_font_size)
            // @ts-ignore
            cell.position(node.position.x, node.position.y)
            // @ts-ignore
            cell.size(node.size)
            this.is_modified = true
            this.delaySave()
        } catch (e) {
            console.error(e)
            ElMessage.error(e)
        }
        this.skip_graph_update = false
        this.onGraphUpdate()
    }

    getGraph() {
        return this.graph
    }

    onSelectAll() {
        this.graph.resetSelection(this.graph.getCells())
    }

    onUndo() {
        if (this.graph.canUndo()) {
            this.graph.undo()
        }
        return false
    }

    onRedo() {
        if (this.graph.canRedo()) {
            this.graph.redo()
        }
        return false
    }

    async onChangeNameDescEnv() {
        console.log('event:onChangeNameDescEnv update_time=', this.graph_data.update_time)
        if (this.graph_data.name == '') {
            return
        }
        this.delaySave()
    }

    // 保存
    async onSave(
        params: {
            toast: boolean
            change_title: boolean
        } = { toast: true, change_title: true }
    ) {
        try {
            console.log('event:onSave', this.graph_data)
            if (!this.graph_data.id) {
                // 图的id不能为空
                return
            }
            this.tree_util.reset(this.graph.toJSON())
            const content = JSON.stringify(this.tree_util.graph_dict)
            const tree = JSON.stringify(this.tree_util.tree)

            const { update_time } = (
                await updateGraphApi({
                    id: this.graph_data.id,
                    content: content,
                    tree: tree,
                    name: this.graph_data.name,
                    desc: this.graph_data.desc,
                    env: this.graph_data.env,
                    update_time: this.graph_data.update_time,
                    // @ts-ignore
                    browser_id: browserId
                })
            ).data

            if (update_time > 0) {
                this.graph_data.update_time = update_time
            } else {
                await this.initData(this.graph_id)
            }

            this.is_modified = false
            if (params.toast) {
                ElMessage({
                    message: '保存成功',
                    type: 'success'
                })
            }

            if (params.change_title) {
                document.title = this.graph_data.name
                tagsViewStore.setTitle(this.graph_data.name, this.route_path)
            }
        } catch (e) {
            console.error(e)
            ElMessage.error(e)
            this.initData(this.graph_id)
        }
    }

    onClear() {
        this.graph.removeCells(this.graph.getCells())
        ElMessage({
            message: '清空成功',
            type: 'success'
        })
    }

    onImport() {
        // 上传JSON文件
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = () => {
            const file = input.files![0]
            const reader = new FileReader()
            reader.onload = async () => {
                await importGraphDbApi({
                    data: reader.result as string,
                    graph_id: this.graph_id
                })

                await this.initData(this.graph_id)
                ElMessage.success('导入成功')
                // const data = JSON.parse(reader.result as string)
                // this.graph.fromJSON(data)
                // this.onGraphUpdate()
                // await nextTick()
                // this.graph.centerContent()
                // ElMessage({
                //     message: '导入成功',
                //     type: 'success'
                // })
            }
            reader.readAsText(file)
        }
        input.click()
    }

    async onValidate(payload: { toast?: boolean } = { toast: true }) {
        try {
            await this.onSave({ toast: false, change_title: false })

            await validateGraphApi({ graph_id: this.graph_id })
            if (payload.toast) {
                ElMessage({
                    message: '校验成功',
                    type: 'success'
                })
            }
            return true
        } catch (e) {
            console.error(e)
            ElMessage.error(e)
            return false
        }
    }

    onChangeRate() {
        ElMessage({
            message: '正在开发中',
            type: 'info'
        })
    }

    async onExport(type: 'graph' | 'svg' | 'png' | 'jpeg' | 'tree') {
        await this.onSave({ toast: false, change_title: false })
        await delay(200)
        const bounding = JSON.parse(JSON.stringify(this.graph.getAllCellsBBox()))
        console.log('onExport', type, bounding)

        bounding.width = Math.min(bounding.width * 10, 8000)
        bounding.height = Math.min(bounding.height * 10, 8000)

        switch (type) {
            case 'graph': {
                // downloadText(
                //     JSON.stringify(this.graph.toJSON(), null, 2),
                //     this.graph_data.name + '_graph' + '.json',
                //     'application/json'
                // )
                const text = (
                    await exportGraphDbApi({
                        graph_ids: this.graph_id
                    })
                ).data

                // 下载text为export.json
                downloadText(text, 'export.json', 'application/json')
                break
            }
            case 'svg':
                this.graph.exportSVG(this.graph_data.name + '.svg', {
                    preserveDimensions: false,
                    copyStyles: false,
                    viewBox: {
                        x: bounding.x,
                        y: bounding.y,
                        width: bounding.width,
                        height: bounding.height
                    }
                })
                break
            case 'png':
                this.graph.exportPNG(this.graph_data.name + '.png', {
                    width: bounding.width,
                    height: bounding.height,
                    quality: 1,
                    copyStyles: false,
                    padding: 10
                })
                break
            case 'jpeg':
                this.graph.exportJPEG(this.graph_data.name + '.jpeg', {
                    width: bounding.width,
                    height: bounding.height,
                    quality: 1,
                    copyStyles: false,
                    padding: 10
                })
                break
            case 'tree':
                // 展开的树
                let tree = (await getGraphTreeApi({ graph_id: this.graph_data.id })).data

                tree = JSON.parse(JSON.stringify(tree))

                // 移除所有的ports
                // traverse(tree, (item) => {
                //     item.node.ports = undefined
                // })
                downloadText(
                    JSON.stringify(tree, null, 2),
                    this.graph_data.name + '_tree' + '.json',
                    'application/json'
                )
                break
        }
    }

    onZoom(factor: number) {
        this.graph.zoom(factor)
    }

    onZoomTo(factor: number) {
        this.graph.zoomTo(1)
    }

    onZoomToFit() {
        this.graph.zoomToFit({ maxScale: 2 })
    }

    onCopy() {
        const cells = this.graph.getSelectedCells()
        if (cells && cells.length) {
            this.graph.copy(cells, {
                useLocalStorage: true,
                deep: true
            })
            ElMessage({
                message: '复制成功',
                type: 'success'
            })
        } else {
            ElMessage({
                message: '请先选中节点再复制',
                type: 'info'
            })
        }
    }

    onDelete() {
        const cells = this.graph.getSelectedCells()
        if (cells && cells.length) {
            this.graph.removeCells(cells)
            ElMessage({
                message: '删除成功',
                type: 'success'
            })
        } else {
            ElMessage({
                message: '请先选中节点再删除',
                type: 'info'
            })
        }
        return false
    }

    onPaste() {
        const cells = this.graph.paste({
            useLocalStorage: true
        })
        if (!cells) {
            ElMessage({
                message: '请先复制节点再粘贴',
                type: 'info'
            })
            return false
        }

        this.graph.resetSelection(cells)
        this.graph.centerCell(cells[0])

        ElMessage({
            message: '粘贴成功',
            type: 'success'
        })
        return false
    }

    onCut() {
        const cells = this.graph.getSelectedCells()
        if (cells && cells.length) {
            this.graph.cut(cells, {
                useLocalStorage: true,
                deep: true
            })
            ElMessage({
                message: '剪切成功',
                type: 'success'
            })
        } else {
            ElMessage({
                message: '请先选中节点再剪切',
                type: 'info'
            })
        }
        return false
    }

    last_refresh_exec_info_time = 0
    async onRefreshExecInfo() {
        try {
            this.exec_info = this.exec_info || {
                graph_id: this.graph_id,
                node_status: [],
                status: 'not_run'
            }
            if (
                this.exec_info.status != EXEC_STATUS.RUNNING &&
                Date.now() - this.last_refresh_exec_info_time < 3000
            ) {
                // 如果当前没有在运行，就3000s更新一次
                return
            }
            this.last_refresh_exec_info_time = Date.now()
            const exec_info = (
                await getExecInfoApi({
                    graph_id: this.graph_id,
                    parent_graph_id: this.parent_graph_id,
                    parent_node_id: this.parent_node_id
                })
            ).data
            console.log('获取exec_info', exec_info)
            if (exec_info != null) {
                this.exec_info.graph_id = exec_info.graph_id
                this.exec_info.status = exec_info.status
                this.exec_info.node_status = exec_info.node_status
            } else {
                console.error('无法获取exec_info', exec_info)
                return
            }

            const node_status_dict = {}
            this.exec_info.node_status.forEach((node_item) => {
                node_status_dict[node_item.id] = node_item
            })

            // 刷新边的运行动画
            if (this.exec_info.status == EXEC_STATUS.RUNNING) {
                this.graph.getEdges().forEach((edge) => {
                    const cell_id = nest_node_id(edge.getTargetCellId(), this.parent_node_id)

                    const node_item = node_status_dict[cell_id] || {}
                    switch (node_item.status) {
                        case EXEC_STATUS.SUCCESS:
                            edge.attr({
                                line: {
                                    stroke: '#409EFF'
                                }
                            })
                            edge.attr('line/strokeDasharray', 5)
                            edge.attr('line/style/animation', 'running-line 30s infinite linear')
                            break
                        case EXEC_STATUS.FAIL:
                            edge.attr({
                                line: {
                                    stroke: '#F56C6C'
                                }
                            })
                            edge.attr('line/strokeDasharray', 5)
                            edge.attr('line/style/animation', 'running-line 30s infinite linear')
                            break
                        case EXEC_STATUS.KILLED:
                            edge.attr('line/strokeDasharray', 0)
                            edge.attr('line/style/animation', '')
                            edge.attr({
                                line: {
                                    stroke: '#000'
                                }
                            })
                            break
                        default:
                            edge.attr({
                                line: {
                                    stroke: '#909399'
                                }
                            })
                            edge.attr('line/strokeDasharray', 5)
                            edge.attr('line/style/animation', 'running-line 30s infinite linear')
                            break
                    }
                })
                if (this.selected_node != null) {
                    const selected_cell_id = nest_node_id(
                        this.selected_node.id,
                        this.parent_node_id
                    )
                    this.selected_status =
                        node_status_dict[selected_cell_id]?.status || EXEC_STATUS.NOT_RUN
                } else if (this.selected_edge != null) {
                    const selected_cell_id = nest_node_id(
                        // @ts-ignore
                        this.selected_edge.target.cell,
                        this.parent_node_id
                    )
                    this.selected_status =
                        // @ts-ignore
                        node_status_dict[selected_cell_id]?.status || EXEC_STATUS.NOT_RUN
                } else {
                    this.selected_status = EXEC_STATUS.NOT_RUN
                }
            } else {
                // 关闭边的运行动画
                this.graph.getEdges().forEach((edge) => {
                    edge.attr('line/strokeDasharray', 0)
                    edge.attr('line/style/animation', '')
                    edge.attr({
                        line: {
                            stroke: '#000'
                        }
                    })
                })
                this.selected_status = EXEC_STATUS.NOT_RUN
            }
        } catch (e) {
            console.error(e)
            ElMessage.error(e)
        }
    }

    get workplace_path(): string {
        const paths = this.graph_data.env.split('\n').filter((it) => !!it)
        return paths[paths.length - 1] || './'
    }

    // project_name: string = ''
    // async inputProjectName() {
    //     // 移除空白字符、:等特殊字符
    //     this.project_name = this.project_name || 'main.txt'

    //     const { value } = await ElMessageBox.prompt('请输入项目主文件名称', {
    //         confirmButtonText: 'OK',
    //         cancelButtonText: 'Cancel',
    //         // 必须是个合法的文件名，不能包含空格等特殊字符
    //         inputValidator: (value) => {
    //             if (value == '') {
    //                 return '请输入项目主文件名称'
    //             }
    //             if (value.indexOf(' ') != -1) {
    //                 return '项目主文件名称不能包含空格'
    //             }
    //             if (value.indexOf(':') != -1) {
    //                 return '项目主文件名称不能包含:'
    //             }
    //             return true
    //         },
    //         inputValue: this.project_name
    //     })
    //     this.project_name = value
    // }

    async resetAllNode() {
        // await this.onSave({ toast: false, change_title: false })
        ElMessageBox.confirm('确定要重置所有节点参数为默认吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            center: true
        })
            .then(async () => {
                await resetNodeApi({ graph_id: this.graph_id, node_id: '' })
                await this.initData(this.graph_id)
                ElMessage.success('已恢复默认')
            })
            .catch(() => {})
    }

    project_filepath: string = ''
    open_project_dialog_visible = false

    async onGenerateProject() {
        const valid = await this.onValidate({ toast: false })
        if (!valid) {
            return
        }
        await ElMessageBox.confirm('确定生成项目吗, 原来的项目会挪到__history__目录下', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            center: true
        })

        try {
            const { filepath } = (
                await generateProjectApi({
                    graph_id: this.graph_data.id
                })
            ).data

            this.project_filepath = filepath
            this.open_project_dialog_visible = true
        } catch (e) {
            console.error(e)
            ElMessage.error(e)
        }

        // ElMessage({
        //     type: 'success',
        //     message: filepath
        // })
    }

    async openProject(open_with: string) {
        // 打开项目
        try {
            await openFileApi({
                open_with: open_with,
                graph_id: this.graph_id
            })
            this.open_project_dialog_visible = false
        } catch (e) {
            console.error(e)
            ElMessage.error(e)
        }
    }

    async onStartExec() {
        // 校验
        try {
            const valid = await this.onValidate({ toast: false })
            if (!valid) {
                return
            }
            this.open_project_dialog_visible = false
            if (this.exec_info.status == EXEC_STATUS.RUNNING) {
                ElMessage.info('已经在运行中了')
                return
            }
            this.exec_info.status = EXEC_STATUS.RUNNING
            await startExecApi({ graph_id: this.graph_data.id })
            await this.onRefreshExecInfo()
            ElMessage({
                message: '已开始仿真',
                type: 'success'
            })
        } catch (e) {
            console.error(e)
            ElMessage.error(e)
            return
        }
    }

    async onPauseExec() {
        try {
            if (this.exec_info.status == EXEC_STATUS.PAUSED) {
                return
            }
            this.exec_info.status = EXEC_STATUS.PAUSED

            await pauseExecApi({ graph_id: this.graph_id })
            await this.onRefreshExecInfo()
            ElMessage({
                message: '已暂停仿真',
                type: 'success'
            })
        } catch (e) {
            console.error(e)
            ElMessage.error(e)
        }
    }

    async onResumeExec() {
        try {
            if (this.exec_info.status == EXEC_STATUS.RUNNING) {
                return
            }
            this.exec_info.status = EXEC_STATUS.RUNNING

            await resumeExecApi({ graph_id: this.graph_id })
            await this.onRefreshExecInfo()

            ElMessage({
                message: '已恢复仿真',
                type: 'success'
            })
        } catch (e) {
            console.error(e)
            ElMessage.error(e)
        }
    }

    async onStopExec() {
        try {
            if (
                this.exec_info.status == EXEC_STATUS.SUCCESS ||
                this.exec_info.status == EXEC_STATUS.FAIL
            ) {
                return
            }
            this.exec_info.status = EXEC_STATUS.SUCCESS
            await stopExecApi({ graph_id: this.graph_id })
            await this.onRefreshExecInfo()
            ElMessage({
                message: '已停止仿真',
                type: 'success'
            })
        } catch (e) {
            console.error(e)
            ElMessage.error(e)
        }
    }

    async onResetEnv() {
        try {
            console.log('重置', this.graph_id)
            const { env } = (
                await resetGraphEnvApi({
                    graph_id: this.graph_id
                })
            ).data
            this.graph_data.env = env
            ElMessage({
                message: '重置环境变量成功',
                type: 'success'
            })
            this.initStencil()
        } catch (e) {
            console.error(e)
            ElMessage.error(e)
        }
    }

    async onDeleteChildren(node: TreeNode) {
        console.log('onGenerateDefaultTree', node)
        this.skip_graph_update = true
        try {
            traverse(this.tree_util.node_dict[node.id].children, (item) => {
                this.graph.removeNode(item.node.id)
            })
        } catch (e) {
            console.log(e)
            ElMessage.error(e)
        }
        this.skip_graph_update = false
        this.onGraphUpdate()
    }

    async onSelectChildren(node: TreeNode) {
        console.log('onGenerateDefaultTree', node)
        const children = []
        this.graph.unselect(node.id)
        traverse(this.tree_util.node_dict[node.id].children, (item) => {
            children.push(item.node.id)
        })
        this.graph.select(children)
        this.graph.select(node.id)
    }

    async graphAddTree(payload: {
        center: { x: number; y: number }
        tree: any[]
        root_id: string
    }) {
        const node_dict = {}

        this.stencil_nodes.forEach((node) => {
            node_dict[node.data.type + '-' + node.data.key] = node
        })

        console.log('graphAddTree', payload.tree)

        // 生成树的初始化位置
        payload.center = JSON.parse(JSON.stringify(payload.center))
        // 每一层的节点数量
        const level_count = {}
        // 计算每一层的节点数量
        traverse(payload.tree, (item) => {
            if (!level_count.hasOwnProperty(item.level)) {
                level_count[item.level] = 0
            }
            level_count[item.level] += 1
        })
        // 计算每一层的最大节点数量
        let max_level_count = 0
        for (const level in level_count) {
            if (level_count[level] > max_level_count) {
                max_level_count = level_count[level]
            }
        }
        // 生成节点
        traverse(payload.tree, (item) => {
            const y =
                payload.center.y + this.config.auto_generate_graph_interval.y * (item.level + 1)
            const x =
                payload.center.x +
                (item.level_index - (level_count[item.level] - 1) / 2) *
                    ((this.config.auto_generate_graph_interval.x * 1.3 * max_level_count) /
                        level_count[item.level])
            const node = item.node
            const node_unique_key = node.data.type + '-' + node.data.key
            const bn = node_dict[node_unique_key]
            if (bn == undefined) {
                console.error('生成节点时未找到节点', node, node_unique_key)
                ElMessage.error(
                    '生成节点时未找到节点' + node.data.label || node.data.name || node.data.key
                )
                return
            }
            const added = this.graph.addNode({
                ...bn,
                id: undefined,
                x: x - bn.width / 2,
                y: y - bn.height / 2
            })
            item.node.id = added.id
        })

        // 生成边
        traverse(payload.tree, (item) => {
            this.graph.addEdge({
                shape: EDGE_SHAPE,
                source: {
                    cell: item.parent_node?.id || payload.root_id,
                    port: 'bottom'
                },
                target: {
                    cell: item.node.id,
                    port: 'top'
                }
            })
        })
    }

    async onGenerateDefaultBehaviorTree(
        root_id: string,
        payload: { remove_children: boolean } = { remove_children: true }
    ) {
        // 移除所有以node为source的边
        console.log('onGenerateDefaultTree', root_id)

        try {
            if (payload.remove_children) {
                const root = this.tree_util.node_dict[root_id]
                if (!root) {
                    ElMessage.error('未找到根节点')
                    return
                }
                traverse(root.children || [], (item) => {
                    this.graph.removeNode(item.node.id)
                })
            }

            const root_cell = this.graph.getCellById(root_id)
            // @ts-ignore
            const root_position = root_cell.position()
            // @ts-ignore
            const root_size = root_cell.size()
            console.log('root_cell', root_cell, root_position)
            // const edges = cells.filter((it) => it.isEdge() && it.getSourceCellId() == node.id)
            // this.graph.removeCells(edges)
            await this.refreshStencilConfig()

            // 获取节点保存的源代码树
            let behavior_tree = root_cell.data.quantum_tasker_processor?.behavior_tree || []

            this.stencil_nodes.forEach((node) => {
                if (node.data.key == root_cell.data.key && node.data.type == root_cell.data.type) {
                    behavior_tree = node.data.quantum_tasker_processor?.behavior_tree || []
                }
            })

            this.graphAddTree({
                center: {
                    // @ts-ignore
                    x: root_position.x + root_size.width / 2,
                    // @ts-ignore
                    y: root_position.y + root_size.height / 2
                },
                tree: behavior_tree,
                root_id: root_id
            })
        } catch (e) {
            console.error(e)
            ElMessage.error(e)
        }
    }

    async onGenerateDefaultGraph() {
        // 生成所有的树

        // 清空图
        this.graph.removeCells(this.graph.getCells())

        await this.refreshStencilConfig()

        const platform_nodes = this.stencil_nodes.filter((it) => it.data.type == 'platform')

        const max_width = Math.max(...platform_nodes.map((it) => it.width))
        const max_height = Math.max(...platform_nodes.map((it) => it.height))

        console.log('platform_nodes', platform_nodes)
        // 添加平台节点

        const init_center = { x: 0, y: 0 }

        // 先生成指挥链的树
        const commander_tree = generateCommanderTree(platform_nodes)
        console.log('commander_tree', commander_tree)
        for (const platform_node of commander_tree) {
            // 添加平台节点到图上
            const added = this.graph.addNode({
                ...platform_node,
                id: undefined,
                // @ts-ignore
                x: init_center.x - platform_node.width / 2,
                // @ts-ignore
                y: init_center.y - platform_node.height / 2
            })

            console.log('添加平台节点到图上', added.id)
            await this.onGraphUpdate()

            // 添加指挥链
            await this.graphAddTree({
                center: init_center,
                tree: platform_node['children'],
                root_id: added.id
            })

            // 获取当前图上的所有节点
            const bounding = this.graph.getAllCellsBBox()
            // 获取当前图上所有节点的最小x和最小y,最大x和最大y
            init_center.y =
                bounding.bottomCenter.y +
                // @ts-ignore
                platform_node.height / 2 +
                this.config.auto_generate_graph_interval.y
        }

        const bounding = this.graph.getAllCellsBBox()

        init_center.x = bounding.bottomCenter.x
        init_center.y =
            bounding.bottomCenter.y + max_height / 2 + this.config.auto_generate_graph_interval.y

        for (const platform_node of platform_nodes) {
            // 添加平台节点到图上
            const added = this.graph.addNode({
                ...platform_node,
                id: undefined,
                x: init_center.x - platform_node.width / 2,
                y: init_center.y - platform_node.height / 2
            })
            console.log('添加平台节点到图上', added.id)
            await this.onGraphUpdate()

            // 生成默认树
            await this.onGenerateDefaultBehaviorTree(added.id, { remove_children: false })

            // 获取当前图上的所有节点
            const bounding = this.graph.getAllCellsBBox()
            // 获取当前图上所有节点的最小x和最小y,最大x和最大y
            // @ts-ignore
            init_center.y =
                bounding.bottomCenter.y +
                platform_node.height / 2 +
                this.config.auto_generate_graph_interval.y
        }
    }
}

export { GraphManager }

insertCss(`
 @keyframes running-line {
    to {
      stroke-dashoffset: -1000;
    }
  }
`)
