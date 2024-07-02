import { Cell, Graph, Node, Shape, Point, EdgeView, Path } from '@antv/x6'

// 路由参数
interface FlowchartRouterArgs {
    padding?: number
}

function flowchartRouter(vertices: Point.PointLike[], args: FlowchartRouterArgs, view: EdgeView) {
    const padding = args.padding || 10
    const points = vertices.map((p) => Point.create(p))

    // 添加一些逻辑来定义非随机的连线路由，例如直线或曲线
    // 以下是一个简单的示例，将连线从源节点到目标节点的中心点。
    const sourceCenter = view.sourceBBox.getCenter()
    const targetCenter = view.targetBBox.getCenter()

    // 如果两个点的 x 或 y 坐标相同，则直接相连

    points.push(sourceCenter)
    points.push(targetCenter)

    return points
}

Graph.registerRouter('flowchart', flowchartRouter)

// 注册连线
Graph.registerConnector(
    'curveConnectorHorizontal',
    (sourcePoint, targetPoint) => {
        const hgap = Math.abs(targetPoint.x - sourcePoint.x)
        const path = new Path()
        path.appendSegment(Path.createSegment('M', sourcePoint.x - 4, sourcePoint.y))
        path.appendSegment(Path.createSegment('L', sourcePoint.x + 12, sourcePoint.y))
        // 水平三阶贝塞尔曲线
        path.appendSegment(
            Path.createSegment(
                'C',
                sourcePoint.x < targetPoint.x ? sourcePoint.x + hgap / 2 : sourcePoint.x - hgap / 2,
                sourcePoint.y,
                sourcePoint.x < targetPoint.x ? targetPoint.x - hgap / 2 : targetPoint.x + hgap / 2,
                targetPoint.y,
                targetPoint.x - 6,
                targetPoint.y
            )
        )
        path.appendSegment(Path.createSegment('L', targetPoint.x + 2, targetPoint.y))

        return path.serialize()
    },
    true
)

Graph.registerConnector(
    'curveConnectorVertical',
    (sourcePoint, targetPoint) => {
        const vgap = Math.abs(targetPoint.y - sourcePoint.y)
        const path = new Path()
        path.appendSegment(Path.createSegment('M', sourcePoint.x, sourcePoint.y - 4))
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
                targetPoint.y + 6
            )
        )
        path.appendSegment(Path.createSegment('L', targetPoint.x, targetPoint.y + 2))

        return path.serialize()
    },
    true
)
