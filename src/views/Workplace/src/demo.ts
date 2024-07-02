import { type Model } from '@antv/x6'

const demoData: Model.FromJSONData = {
    nodes: [
        {
            id: 'node1',
            shape: 'custom-node',
            x: 40,
            y: 40,
            label: 'hello',
            ports: {
                items: [
                    {
                        id: 'port_top',
                        group: 'top'
                    },
                    {
                        id: 'port_bottom',
                        group: 'bottom'
                    },
                    {
                        id: 'port_left',
                        group: 'left'
                    },
                    {
                        id: 'port_right',
                        group: 'right'
                    }
                ]
            }
        },
        {
            id: 'node2',
            shape: 'custom-node',
            x: 160,
            y: 180,
            label: 'world',
            ports: {
                items: [
                    {
                        id: 'port_top',
                        group: 'top'
                    },
                    {
                        id: 'port_bottom',
                        group: 'bottom'
                    },
                    {
                        id: 'port_left',
                        group: 'left'
                    },
                    {
                        id: 'port_right',
                        group: 'right'
                    }
                ]
            }
        }
    ]
}

export { demoData }
