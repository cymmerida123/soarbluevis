export const EXEC_STATUS = {
    NOT_RUN: 'not_run',
    RUNNING: 'running',
    PAUSED: 'paused',
    SUCCESS: 'success',
    FAIL: 'fail',
    KILLED: 'killed'
}

export function formatExecStatus(status: string) {
    switch (status) {
        case EXEC_STATUS.NOT_RUN:
            return '未运行'
        case EXEC_STATUS.RUNNING:
            return '运行中'
        case EXEC_STATUS.PAUSED:
            return '已暂停'
        case EXEC_STATUS.SUCCESS:
            return '成功'
        case EXEC_STATUS.FAIL:
            return '失败'
        default:
            return '未运行'
    }
}

export const NODE_TYPE = {
    platform: 'platform',
    action: 'action',
    composite: 'composite',
    virtual: 'virtual',
    nest: 'nest'
}

export function formatNodeType(node_type: string) {
    switch (node_type) {
        case NODE_TYPE.platform:
            return '平台节点'
        case NODE_TYPE.action:
            return '动作节点'
        case NODE_TYPE.composite:
            return '组合节点'
        case NODE_TYPE.virtual:
            return '虚拟节点'
        case NODE_TYPE.nest:
            return '嵌套节点'
        default:
            return ''
    }
}
