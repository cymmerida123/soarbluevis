import request from '@/config/axios'
import type {
    GetGraphDetailParams,
    GetGraphDetailResponse,
    GetGraphListParams,
    GetGraphListResponse,
    UpdateGraphParams,
    CreateGraphParams,
    GraphModelData,
    ExecInfo,
    StencilConfigResponse,
    GetUIConfigResponse,
    GetConfigResponse
} from './types'

export function getGraphListApi(
    params: GetGraphListParams
): Promise<IResponse<GetGraphListResponse>> {
    return request.get({ url: 'get_graph_list', params })
}

// # 接口: 创建空场景图
// # POST /api/create_graph
export function createGraphApi(data: CreateGraphParams): Promise<IResponse<GraphModelData>> {
    return request.post({ url: 'create_graph', data })
}

// # 接口: 更新场景图
// # POST /api/update_graph
export function updateGraphApi(
    data: UpdateGraphParams
): Promise<IResponse<{ update_time: number }>> {
    return request.post({ url: 'update_graph', data })
}

// # 接口: 删除场景图
// # POST /api/delete_graph
export function deleteGraphApi(data: { graph_id: any }): Promise<IResponse<GraphModelData>> {
    return request.post({ url: 'delete_graph', data })
}

// # 接口: 获取场景图详情
// # GET /api/get_graph_detail
export function getGraphDetailApi(
    params: GetGraphDetailParams
): Promise<IResponse<GetGraphDetailResponse>> {
    return request.get({ url: 'get_graph_detail', params })
}

export function getEnvOptionsApi(): Promise<
    IResponse<{
        list: string[]
    }>
> {
    return request.get({ url: 'get_env_options' })
}

// # 接口: 获取stencil配置
// # GET /api/get_stencil_config
export function getStencilConfigApi(params: {
    graph_id: any
}): Promise<IResponse<StencilConfigResponse>> {
    return request.get({ url: 'get_stencil_config', params })
}
// # 接口: 获取默认节点配置
// # GET /api/get_default_node_config
export function getDefaultNodeConfigApi(params: {
    graph_id: any
    node_key: any
    node_path: any
}): Promise<IResponse<any>> {
    return request.get({ url: 'get_default_node_config', params })
}

// # 接口: 获取UI配置
// # GET /api/get_ui_config
export function getUiConfigApi(): Promise<IResponse<GetUIConfigResponse>> {
    return request.get({ url: 'get_ui_config' })
}

// 接口：获取图的树形结构
// POST /api/get_graph_tree
export function getGraphTreeApi(params: { graph_id: any }): Promise<IResponse<any>> {
    return request.get({ url: 'get_graph_tree', params })
}

// 接口：验证图
// POST /validate_graph
export function generateProjectApi(data: {
    graph_id: any
}): Promise<IResponse<{ filepath: string }>> {
    return request.post({ url: 'generate_project', data })
}

// 接口：验证图
// POST /validate_graph
export function validateGraphApi(data: { graph_id: any }): Promise<IResponse<any>> {
    return request.post({ url: 'validate_graph', data })
}

// 接口：开始执行场景图
// POST /start_graph_exec
export function startExecApi(data: { graph_id: any }): Promise<IResponse<any>> {
    return request.post({ url: 'start_exec', data })
}

// 接口：暂停场景图执行
// POST /pause_graph_exec
export function pauseExecApi(data: { graph_id: any }): Promise<IResponse<any>> {
    return request.post({ url: 'pause_exec', data })
}

// 接口：恢复场景图执行
// POST /resume_graph_exec
export function resumeExecApi(data: { graph_id: any }): Promise<IResponse<any>> {
    return request.post({ url: 'resume_exec', data })
}

// 接口：停止场景图执行
// POST /stop_graph_exec
export function stopExecApi(data: { graph_id: any }): Promise<IResponse<any>> {
    return request.post({ url: 'stop_exec', data })
}

// // 接口：根据图ID获取图运行日志列表
// // GET /get_exec_logs_by_node_id/:graphId
// export function getExecLogsByNodeIdApi(graphId: string): Promise<IResponse<any>> {
//     return request.get({ url: `get_exec_logs_by_node_id/${graphId}` })
// }

// // 接口：根据图ID获取节点运行日志列表
// // GET /get_exec_logs_by_graph_id/:graphId
// export function getExecLogsByGraphIdApi(graphId: string): Promise<IResponse<any>> {
//     return request.get({ url: `get_exec_logs_by_graph_id/${graphId}` })
// }

// 接口：根据图ID获取最近一次运行记录，如果没有，则返回空
// GET /get_exec_info
export function getExecInfoApi(params: {
    graph_id: string
    parent_graph_id: string
    parent_node_id: string
}): Promise<IResponse<ExecInfo>> {
    return request.get({ url: 'get_exec_info', params })
}

// GET /export_graph_db
export function exportGraphDbApi(params: {
    graph_ids: string
}): Promise<IResponse<{ data: string }>> {
    return request.get({ url: 'export_graph_db', params })
}

// POST /import_graph_db
export function importGraphDbApi(data: { data: string; graph_id: any }): Promise<IResponse<any>> {
    return request.post({ url: 'import_graph_db', data })
}

// POST /open_file
export function openFileApi(data: {
    open_with: string
    graph_id: string
}): Promise<IResponse<any>> {
    return request.post({ url: 'open_file', data })
}

// GET /get_guide
export function getGuideApi(): Promise<IResponse<string>> {
    return request.get({ url: 'get_guide' })
}

export function getConfigApi(): Promise<IResponse<GetConfigResponse>> {
    return request.get({ url: 'get_config' })
}

export function resetGraphEnvApi(data: { graph_id: any }): Promise<IResponse<{ env: string }>> {
    return request.post({ url: 'reset_graph_env', data })
}

export function resetNodeApi(data: {
    graph_id: any
    node_id: any
}): Promise<IResponse<{ env: string }>> {
    return request.post({ url: 'reset_node', data })
}
