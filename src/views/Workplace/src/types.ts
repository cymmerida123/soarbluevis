export interface TreeNodePlatformInfo {
    side: string | 'red' | 'blue'
    type: string
    index: number
    commander: string
}
export interface TreeNodeDataQuantumTaskerProcessor {
    key: string
    name: string
    code: string
    behavior_tree: TreeNode[]
}
export interface TreeNode {
    id: string
    shape: string
    label: string
    label_font_size?: number
    position: { x: number; y: number }
    size: { width: number; height: number }
    is_root: boolean
    data: {
        type: string
        key: string
        name: string
        desc: string
        params: ParamData[]
        group: {
            name: string
            title: string
        }
        index: number
        disabled?: boolean
        platform?: TreeNodePlatformInfo
        quantum_tasker_processor?: TreeNodeDataQuantumTaskerProcessor
        nest_id?: any
        path: string
    }
    children: TreeNode[]
}

export interface ParamTreeNode {
    id: string
    shape?: string
    label: string
    label_font_size?: number
    position?: { x: number; y: number }
    size?: { width: number; height: number }
    is_root?: boolean
    isPenultimate?: boolean
    data?: {
        type: string
        key: string
        name: string
        desc: string
        params: ParamData[]
        group: {
            name: string
            title: string
        }
        index: number
        disabled?: boolean
        platform?: TreeNodePlatformInfo
        quantum_tasker_processor?: TreeNodeDataQuantumTaskerProcessor
        nest_id?: any
        path: string
    }
    children: ParamTreeNode[]
}

export function createEmptyTreeNode(): TreeNode {
    return {
        id: '',
        shape: '',
        label: '',
        position: { x: 0, y: 0 },
        size: { width: 0, height: 0 },
        is_root: false,
        data: {
            type: '',
            key: '',
            name: '',
            desc: '',
            params: [],
            group: {
                name: '',
                title: ''
            },
            index: 0,
            path: ''
        },
        children: []
    }
}

export interface TreeEdge {
    id: string
    source: string // node id
    target: string // node id
}

export interface ParamData {
    name: string
    key: string
    type: string
    default: string
    desc: string
    value: string
    options?: ParamOption[]
}

export interface ParamOption {
    name: string
    value: string
}
