<template>
  <div class="monitors-page">
    <a-card title="实时监控概览" :bordered="false">
      <!-- 服务器选择 -->
      <a-select
        v-model:value="selectedServerId"
        placeholder="选择服务器"
        style="width: 300px; margin-bottom: 16px"
        @change="handleServerChange"
        allow-clear
      >
        <a-select-option v-for="server in servers" :key="server.id" :value="server.id">
          {{ server.hostname }} ({{ server.ipAddress }})
        </a-select-option>
      </a-select>

      <a-divider />

      <!-- 监控卡片 -->
      <a-row :gutter="16">
        <a-col :span="6" v-for="metric in metrics" :key="metric.key">
          <a-card class="metric-card" :bordered="false">
            <div class="metric-header">
              <span class="metric-name">{{ metric.name }}</span>
              <a-tag :color="metric.color">{{ metric.value }}{{ metric.unit }}</a-tag>
            </div>
            <div ref="chartRefs" class="mini-chart"></div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 详细图表 -->
      <a-row :gutter="16" style="margin-top: 16px">
        <a-col :span="12">
          <a-card title="资源使用趋势" :bordered="false">
            <div ref="resourceChartRef" class="chart-container"></div>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="网络流量" :bordered="false">
            <div ref="networkChartRef" class="chart-container"></div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>

    <!-- 服务器列表监控 -->
    <a-card title="服务器列表" class="table-card" :bordered="false">
      <a-table
        :columns="columns"
        :data-source="serverMonitorData"
        :loading="loading"
        :pagination="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'cpuUsage'">
            <a-progress :percent="record.cpuUsage" size="small" :status="getProgressStatus(record.cpuUsage)" />
          </template>
          <template v-else-if="column.key === 'memoryUsage'">
            <a-progress :percent="record.memoryUsage" size="small" :status="getProgressStatus(record.memoryUsage)" />
          </template>
          <template v-else-if="column.key === 'diskUsage'">
            <a-progress :percent="record.diskUsage" size="small" :status="getProgressStatus(record.diskUsage)" />
          </template>
          <template v-else-if="column.key === 'network'">
            <div>↓ {{ formatBytes(record.networkIn) }}/s</div>
            <div>↑ {{ formatBytes(record.networkOut) }}/s</div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="$router.push(`/monitors/${record.id}`)">
              详情
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { getServers } from '@/services/server'
import { getBatchLatestData } from '@/services/monitor'
import { wsService } from '@/services/websocket'
import type { Server, MonitorData } from '@/types'
import { formatBytes } from '@/utils/format'

const servers = ref<Server[]>([])
const selectedServerId = ref<number>()
const serverMonitorData = ref<Array<Server & MonitorData>>([])
const loading = ref(false)

const resourceChartRef = ref<HTMLElement>()
const networkChartRef = ref<HTMLElement>()
let resourceChart: ECharts | null = null
let networkChart: ECharts | null = null

const metrics = ref([
  { key: 'cpu', name: 'CPU使用率', value: 0, unit: '%', color: 'blue', data: [] as number[] },
  { key: 'memory', name: '内存使用率', value: 0, unit: '%', color: 'green', data: [] as number[] },
  { key: 'disk', name: '磁盘使用率', value: 0, unit: '%', color: 'orange', data: [] as number[] },
  { key: 'network', name: '网络流量', value: 0, unit: 'MB/s', color: 'purple', data: [] as number[] }
])

const columns = [
  { title: '服务器', dataIndex: 'hostname' },
  { title: 'IP地址', dataIndex: 'ipAddress' },
  { title: 'CPU', key: 'cpuUsage', width: 150 },
  { title: '内存', key: 'memoryUsage', width: 150 },
  { title: '磁盘', key: 'diskUsage', width: 150 },
  { title: '网络', key: 'network' },
  { title: '操作', key: 'action', width: 80 }
]

// 加载服务器列表
const loadServers = async () => {
  const result = await getServers({ page: 1, pageSize: 1000 })
  servers.value = result.list
}

// 加载监控数据
const loadMonitorData = async () => {
  if (servers.value.length === 0) return
  loading.value = true
  try {
    const serverIds = servers.value.map(s => s.id)
    const monitorData = await getBatchLatestData(serverIds)
    
    serverMonitorData.value = servers.value.map(server => {
      const data = monitorData.find(m => m.serverId === server.id)
      return {
        ...server,
        ...data,
        cpuUsage: data?.cpuUsage || 0,
        memoryUsage: data?.memoryUsage || 0,
        diskUsage: data?.diskUsage || 0,
        networkIn: data?.networkIn || 0,
        networkOut: data?.networkOut || 0
      }
    } as Array<Server & MonitorData>)
  } finally {
    loading.value = false
  }
}

const handleServerChange = (value: number) => {
  selectedServerId.value = value
  // 加载单个服务器的详细监控数据
}

const getProgressStatus = (value: number) => {
  if (value > 90) return 'exception'
  if (value > 70) return 'normal'
  return 'success'
}

// WebSocket消息处理
const handleWebSocketMessage = (data: any) => {
  // 更新监控数据
  if (data.type === 'monitor') {
    const index = serverMonitorData.value.findIndex(s => s.id === data.serverId)
    if (index !== -1) {
      serverMonitorData.value[index] = {
        ...serverMonitorData.value[index],
        ...data.metrics
      }
    }
  }
}

onMounted(async () => {
  await loadServers()
  await loadMonitorData()
  await nextTick()
  
  if (resourceChartRef.value) {
    resourceChart = echarts.init(resourceChartRef.value)
  }
  if (networkChartRef.value) {
    networkChart = echarts.init(networkChartRef.value)
  }

  // 连接WebSocket
  wsService.connect()
  wsService.subscribeMonitor(handleWebSocketMessage)

  // 定时刷新
  const timer = setInterval(loadMonitorData, 30000)
  onUnmounted(() => clearInterval(timer))
})

onUnmounted(() => {
  wsService.disconnect()
  resourceChart?.dispose()
  networkChart?.dispose()
})
</script>

<style scoped lang="less">
.monitors-page {
  .metric-card {
    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .metric-name {
        font-weight: 500;
      }
    }

    .mini-chart {
      height: 80px;
    }
  }

  .chart-container {
    height: 300px;
  }

  .table-card {
    margin-top: 16px;
  }
}
</style>
