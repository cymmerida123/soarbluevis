import exp from 'constants'

export interface GraphModelData {
    id: string
    name: string
    desc: string
    type: string
    tree: string
    content: string
    create_time: number
    update_time: number
    deleted: number
    env: string
    node_count: number
    edge_count: number
}

export interface StencilConfigGroupsItem {
    name: string
    title: string
    layoutOptions?: any
    nodes: any[]
}

export interface StencilConfigResponse {
    title?: string
    placeholder?: string
    notFoundText?: string
    collapsable?: boolean
    stencilGraphHeight?: number
    groups: StencilConfigGroupsItem[]
}

export interface GetGraphListParams {
    page: number
    limit: number
    q: string
    type: string
}

export interface GetGraphListResponse extends ListResponseData<GraphModelData> { }

export interface GetGraphDetailParams {
    graph_id: any
    parent_graph_id: any
    parent_node_id: any
}

export interface GetGraphDetailResponse extends GraphModelData { }

export interface CreateGraphParams {
    name: string
    desc: string
    type: string
    content: string
}

export interface UpdateGraphParams {
    id: any
    name: string
    desc: string
    content: string
    tree: string
    update_time: number
    env: string
    browser_id: string // 当前更新时使用的浏览器id
}

export interface ActionNodeParamItem {
    name: string
    key: string
    type: string
    default: string
    desc: string
    value: string
}

export interface ActionNodeItem {
    key: string
    name: string
    desc: string
    group: string
    params: ActionNodeParamItem[]
}

export interface ActionGroupItem {
    name: string
    title: string
}

export interface PlatformItem {
    index: number
    key: string
    name: string
    desc: string
    side: string | 'red' | 'blue'
    type: string
}

export interface ExecInfo {
    graph_id: any
    status: string
    node_status: NodeStatusItem[]
}

export interface NodeStatusItem {
    id: string
    status: number
    log: string
}

export interface GetUIConfigResponse {
    register_nodes: {
        key: string
        config: any
        force: boolean
    }[]
}

export interface GetConfigResponse {
    project_name: string
    default_graph_env: string
    project_info: string
    project_version: string
    use_zmq: boolean
    scripts_dir: string
    dev: boolean
    auto_generate_graph_interval: { x: number; y: number }
}

export interface OptimItem {
    optim_id: string
    optim_name: string
}

export interface GetOptimListParams {
    page: number
    limit: number
    q: string
    graph_id: string
}

export interface OptimDetailItem {
    steps: number[]
    targets: number[]
    params: any
    target_name: string
}

export interface OptimTotalItem {
    optim_data: OptimDetailItem[]
    graph_data: GraphModelData
    is_terminal: boolean
}

export interface OptimNewItem {
    optim_data: OptimDetailItem[]
    is_terminal: boolean
}

export interface GetOptimListResponse extends ListResponseData<OptimItem> { }
