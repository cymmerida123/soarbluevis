import { update } from 'lodash-es'
import { ref, computed } from 'vue'
import { createStore } from 'vuex'
import Cookie from 'js-cookie'

export default createStore({
    state: {
        type: '',
        graph_id: ''
    },
    mutations: {
        updateType(state, type) {
            state.type = type
            Cookie.set('type', type)
        },
        updateId(state, graph_id) {
            state.graph_id = graph_id
            Cookie.set('graph_id', graph_id)
        },
        getType(state) {
            state.type = state.type || Cookie.get('type')
        },
        getId(state) {
            state.graph_id = state.graph_id || Cookie.get('graph_id')
        }
    }
})
