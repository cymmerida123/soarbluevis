import Mock from 'mockjs'
import workplaceApi from './mockData/workplace' // 工作台数据

Mock.mock(/api\/get_optim_list/, 'get', workplaceApi.getListData)
Mock.mock(/api\/get_optim_detail/, 'get', workplaceApi.getChartData)
Mock.mock(/api\/get_realtime_data/, 'get', workplaceApi.getRealtimeData)
Mock.mock(/api\/create_optim/, 'post', workplaceApi.postOptimData)
