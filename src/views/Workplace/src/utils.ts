import { Graph } from '@antv/x6'
import { TreeNode, TreeEdge, ParamData } from './types'
import { ElMessage } from 'element-plus'

function hasCycle(edges: TreeEdge[], nodes: TreeNode[]): boolean {
    const visited: { [key: string]: boolean } = {}
    const stack: { [key: string]: boolean } = {}

    function dfs(nodeId: string): boolean {
        visited[nodeId] = true
        stack[nodeId] = true

        for (const edge of edges) {
            if (edge.source === nodeId) {
                const targetId = edge.target
                if (!visited[targetId]) {
                    if (dfs(targetId)) {
                        return true
                    }
                } else if (stack[targetId]) {
                    return true
                }
            }
        }

        stack[nodeId] = false
        return false
    }

    for (const node of nodes) {
        if (!visited[node.id]) {
            if (dfs(node.id)) {
                return true
            }
        }
    }

    return false
}

function hasIsolatedNodes(edges: TreeEdge[], nodes: TreeNode[]): TreeNode[] {
    const connectedNodes: { [key: string]: boolean } = {}

    for (const edge of edges) {
        connectedNodes[edge.source] = true
        connectedNodes[edge.target] = true
    }

    const isolatedNodes: TreeNode[] = []

    for (const node of nodes) {
        if (!connectedNodes[node.id]) {
            isolatedNodes.push(node)
        }
    }

    return isolatedNodes
}

function extractEntryNodes(edges: TreeEdge[], nodes: TreeNode[]): TreeNode[] {
    const targetNodes: { [key: string]: boolean } = {}

    for (const edge of edges) {
        targetNodes[edge.target] = true
    }

    const entryNodes: TreeNode[] = []

    for (const node of nodes) {
        if (!targetNodes[node.id]) {
            entryNodes.push(node)
            node.is_root = true
        }
    }

    return entryNodes
}

// 生成树（可以有多个根节点）
// edge的source是父节点,target是子节点
// return
// tree:
// [{...node, 'children': []}, {...node, 'children': []}]
function generateTree(edges: TreeEdge[], nodes: TreeNode[]): TreeNode[] {
    if (hasCycle(edges, nodes)) {
        ElMessage.error('图中不能存在环')
        return []
    }

    for (const node of nodes) {
        node.children = []
    }

    const rootNodes: TreeNode[] = extractEntryNodes(edges, nodes)
    const nodeDict: { [key: string]: TreeNode } = {}

    for (const node of nodes) {
        nodeDict[node.id] = node
    }

    for (const edge of edges) {
        const sourceId = edge.source
        const targetId = edge.target
        if (!nodeDict.hasOwnProperty(sourceId) || !nodeDict.hasOwnProperty(targetId)) {
            continue
        }
        nodeDict[sourceId].children.push(nodeDict[targetId])
    }

    // 根据pos_x和pos_y设置index
    for (const node of nodes) {
        node.children.sort((a, b) => {
            return a.position.x - b.position.x
        })
        node.children.forEach((child, index) => {
            if (!child.hasOwnProperty('data')) {
                return
            }
            child.data.index = index
        })
    }

    return rootNodes
}

export function isPlatform(group: string): boolean {
    return group.startsWith('platform')
}

export function isComposite(group: string): boolean {
    return group.startsWith('composite')
}

export function isVirtual(group: string): boolean {
    return group.startsWith('virtual')
}

export function isNest(group: string): boolean {
    return group.startsWith('nest')
}

export function isAction(group: string): boolean {
    return group.startsWith('action')
}

function isLeaf(node: TreeNode): boolean {
    return node.children.length === 0
}

export class GraphTreeUtil {
    content: string
    graph_dict: any
    cells: any[]
    edges: TreeEdge[] = []
    nodes: TreeNode[] = []
    node_dict: { [key: string]: TreeNode } = {}
    edge_dict: { [key: string]: TreeEdge } = {}
    old_node_dict: { [key: string]: TreeNode } = {} // node_id -> data，保存节点的老数据，用于在节点的数据发生变化时，知道是哪个字段发生了变化

    tree: TreeNode[] = []

    constructor(graph_dict: any) {
        this.reset(graph_dict)
    }

    reset(graph_dict: any) {
        // if (JSON.stringify(graph_dict) === JSON.stringify(this.graph_dict)) {
        //     return
        // }
        this.graph_dict = graph_dict
        this.cells = this.graph_dict.cells || []
        this.nodes = []
        this.node_dict = {}
        this.edges = []
        this.edge_dict = {}
        this.tree = []

        for (const cell of this.cells) {
            if ('source' in cell && 'target' in cell) {
                const edge: TreeEdge = {
                    id: cell.id,
                    source: cell.source.cell,
                    target: cell.target.cell
                }
                this.edges.push(edge)
                this.edge_dict[edge.id] = edge
            } else {
                const node: TreeNode = {
                    id: cell.id,
                    label: cell.attrs.text.text || cell.data.name || cell.data.key,
                    label_font_size: cell.attrs.text.fontSize || 13,
                    shape: cell.shape,
                    data: {
                        index: 0,
                        ...cell.data
                    },
                    is_root: false,
                    position: cell.position,
                    size: cell.size,
                    children: []
                }

                this.nodes.push(node)
                this.node_dict[node.id] = node
            }
        }

        this.tree = generateTree(this.edges, this.nodes)
        this.old_node_dict = JSON.parse(JSON.stringify(this.node_dict))
    }

    // validate(): string {
    //     if (hasCycle(this.edges, this.nodes)) {
    //         return '图中存在环'
    //     }

    //     for (const node of this.tree) {
    //         if (!isPlatform(node.data.type)) {
    //             return '树的根节点必须都是平台节点'
    //         }
    //     }

    //     for (const node of this.nodes) {
    //         if (isComposite(node.data.type)) {
    //             for (const child of node.children) {
    //                 if (isPlatform(child.data.type)) {
    //                     return '组合节点的子节点不能是平台节点'
    //                 }
    //             }
    //         }
    //     }

    //     for (const node of this.nodes) {
    //         if (isAction(node.data.type) && node.children.length > 0) {
    //             return '行为节点不能有子节点'
    //         }
    //     }

    //     return ''
    // }

    get_graph_rect(): { x: number; y: number; width: number; height: number } {
        if (this.tree.length == 0) {
            return { x: 0, y: 0, width: 1024, height: 1024 }
        }
        // 计算图的大小
        const min_x = Math.min(...this.nodes.map((item) => item.position.x))
        const min_y = Math.min(...this.nodes.map((item) => item.position.y))
        const max_x = Math.max(...this.nodes.map((item) => item.position.x + item.size.width))
        const max_y = Math.max(...this.nodes.map((item) => item.position.y + item.size.height))
        const width = Math.max(max_x - min_x, 1) * 10
        const height = Math.max(max_y - min_y, 1) * 10
        const ratio = width / height
        const min_size = 3000
        if (width < height) {
            if (width < min_size) {
                return { x: min_x, y: min_y, width: min_size, height: min_size / ratio }
            }
        } else {
            if (height < min_size) {
                return { x: min_x, y: min_y, width: min_size * ratio, height: min_size }
            }
        }

        return { x: min_x, y: min_y, width, height }
    }
}

export function textRemoveWrap(text: string) {
    return text.replace(/\n/g, '')
}

// 将文本自动换行
export function textAutoWrap(text: string, width: number = 8): string {
    const textArr = text.split('')
    let result = ''
    let temp = ''
    textArr.forEach((item) => {
        if (temp.length < width) {
            temp += item
        } else {
            result += temp + '\n'
            temp = item
        }
    })
    result += temp
    return result
}

export function traverse(
    tree: any[],
    fn: (item: {
        node: any
        parent_node: any
        level: number
        index: number
        level_index: number
    }) => void
) {
    // 遍历树
    const stack = [] // 先进先出
    tree = tree || []

    tree.forEach((item, index) => {
        stack.push({
            node: item,
            parent_node: null,
            level: 0,
            index: index,
            level_index: 0
        })
    })
    const level_index = {}
    while (stack.length) {
        const item = stack.splice(0, 1)[0]
        if (level_index[item.level] === undefined) {
            level_index[item.level] = 0
        } else {
            level_index[item.level] += 1
        }
        item.level_index = level_index[item.level]
        fn(item)
        if (item.node.children) {
            item.node.children.forEach((child, index) => {
                stack.push({
                    node: child,
                    parent_node: item.node,
                    level: item.level + 1,
                    index: index,
                    level_index: 0
                })
            })
        }
    }
}

export function nest_node_id(node_id: string, parent_node_id: string) {
    if (parent_node_id != '') {
        return `${parent_node_id}|${node_id}`
    } else {
        return `${node_id}`
    }
}

export function delay(ms: number): Promise<void> {
    // 延迟函数
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function generateCommanderTree(platforms: TreeNode[]) {
    // 根据node.data.platform.commander生成树
    // 如果commander是另一个node.data.key，则将该node作为另一个node的子节点
    // 否则，将该node作为根节点

    const nodes = JSON.parse(JSON.stringify(platforms)) // 深拷贝
    nodes.forEach((node) => {
        node.children = []
    })

    const node_dict: { [key: string]: TreeNode } = {}
    const root_nodes: TreeNode[] = []
    nodes.forEach((node) => {
        node_dict[node.data.key] = node
    })

    nodes.forEach((node) => {
        if (
            node.data.platform.commander == 'SELF' ||
            !node_dict.hasOwnProperty(node.data.platform.commander)
        ) {
            root_nodes.push(node)
        } else {
            node_dict[node.data.platform.commander].children.push(node)
        }
    })

    return root_nodes
}
