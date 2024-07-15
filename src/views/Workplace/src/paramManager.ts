import { ElMessage, ElMessageBox } from 'element-plus'
import { getOptimDetailApi, getOptimNewApi } from '@/api'
import type { OptimDetailItem, GraphModelData, OptimNewItem } from '@/api/types'
class ParamManager {
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
    optim_id: string
    optim_data: OptimDetailItem[]
    isTerminal: boolean = false
    constructor(id: string) {
        this.optim_id = id
    }
    async getOptimDetail(): OptimDetailItem[] {
        const res = (await getOptimDetailApi({ optim_id: this.optim_id })).data
        this.graph_data = res.graph_data
        this.optim_data = res.optim_data
        this.isTerminal = res.is_terminal
        for (const li of res.optim_data) {
            if (li.steps.length !== li.params.length || li.targets.length !== li.params.length) {
                ElMessage.error(`${this.optim_id}-${li.target_name}:inconsistent data length`)
            }
        }
        return res.optim_data
    }

    async getOptimRealtimeData(ack: number): OptimNewItem {
        const res = (await getOptimNewApi({ optim_id: this.optim_id, ack: ack })).data
        return res
    }
}

export { ParamManager }
