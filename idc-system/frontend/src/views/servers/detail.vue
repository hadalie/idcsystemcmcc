<template>
  <div class="server-detail-page">
    <!-- 返回按钮 -->
    <a-button type="link" @click="$router.back()">
      <LeftOutlined />
      返回列表
    </a-button>

    <!-- 基本信息 -->
    <a-card title="基本信息" class="detail-card" :loading="loading">
      <a-descriptions :column="3">
        <a-descriptions-item label="ID">{{ server?.id }}</a-descriptions-item>
        <a-descriptions-item label="主机名">{{ server?.hostname }}</a-descriptions-item>
        <a-descriptions-item label="IP地址">{{ server?.ipAddress }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-badge :status="getStatusBadge(server?.status)" :text="getStatusText(server?.status)" />
        </a-descriptions-item>
        <a-descriptions-item label="分组">{{ server?.group?.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="位置">{{ server?.location || '-' }}</a-descriptions-item>
        <a-descriptions-item label="操作系统">{{ server?.os || '-' }}</a-descriptions-item>
        <a-descriptions-item label="CPU">{{ server?.cpuCores }} 核</a-descriptions-item>
        <a-descriptions-item label="内存">{{ server?.memoryGb }} GB</a-descriptions-item>
        <a-descriptions-item label="磁盘">{{ server?.diskGb }} GB</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ formatDate(server?.createdAt) }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ formatDate(server?.updatedAt) }}</a-descriptions-item>
      </a-descriptions>
      <a-divider />
      <div class="description">{{ server?.description || '暂无描述' }}</div>
    </a-card>

    <!-- 实时监控 -->
    <a-card title="实时监控" class="detail-card">
      <a-row :gutter="16">
        <a-col :span="6">
          <div class="metric-card">
            <div class="metric-label">CPU使用率</div>
            <a-progress
              type="dashboard"
              :percent="latestData?.cpuUsage || 0"
              :status="getProgressStatus(latestData?.cpuUsage)"
            />
          </div>
        </a-col>
        <a-col :span="6">
          <div class="metric-card">
            <div class="metric-label">内存使用率</div>
            <a-progress
              type="dashboard"
              :percent="latestData?.memoryUsage || 0"
              :status="getProgressStatus(latestData?.memoryUsage)"
            />
          </div>
        </a-col>
        <a-col :span="6">
          <div class="metric-card">
            <div class="metric-label">磁盘使用率</div>
            <a-progress
              type="dashboard"
              :percent="latestData?.diskUsage || 0"
              :status="getProgressStatus(latestData?.diskUsage)"
            />
          </div>
        </a-col>
        <a-col :span="6">
          <div class="metric-card">
            <div class="metric-label">温度</div>
            <div class="temperature-value" :class="getTempClass(latestData?.temperature)">
              {{ latestData?.temperature || 0 }}°C
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- 网络流量 -->
      <a-divider />
      <div class="network-stats">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-statistic title="网络流入" :value="latestData?.networkIn || 0" suffix="B/s">
              <template #prefix>
                <ArrowDownOutlined />
              </template>
            </a-statistic>
          </a-col>
          <a-col :span="12">
            <a-statistic title="网络流出" :value="latestData?.networkOut || 0" suffix="B/s">
              <template #prefix>
                <ArrowUpOutlined />
              </template>
            </a-statistic>
          </a-col>
        </a-row>
      </div>
    </a-card>

    <!-- 历史监控图表 -->
    <a-card title="历史监控" class="detail-card">
      <template #extra>
        <a-range-picker v-model:value="dateRange" show-time @change="loadMonitorData" />
      </template>
      <div ref="monitorChartRef" class="monitor-chart"></div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import {
  LeftOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { getServer } from '@/services/server'
import { getMonitorData, getLatestMonitorData } from '@/services/monitor'
import type { Server, MonitorData } from '@/types'
import { formatDate, getStatusText } from '@/utils/format'

const route = useRoute()
const serverId = parseInt(route.params.id as string)

const loading = ref(false)
const server = ref<Server>()
const latestData = ref<MonitorData>()
const monitorData = ref<MonitorData[]>([])
const dateRange = ref<[Dayjs, Dayjs]>([dayjs().subtract(24, 'hour'), dayjs()])

const monitorChartRef = ref<HTMLElement>()
let monitorChart: ECharts | null = null

// 加载服务器信息
const loadServer = async () => {
  loading.value = true
  try {
    server.value = await getServer(serverId)
  } finally {
    loading.value = false
  }
}

// 加载最新监控数据
const loadLatestData = async () => {
  try {
    latestData.value = await getLatestMonitorData(serverId)
  } catch (error) {
    console.error('Failed to load latest data:', error)
  }
}

// 加载历史监控数据
const loadMonitorData = async () => {
  try {
    const result = await getMonitorData(serverId, {
      startTime: dateRange.value[0].toISOString(),
      endTime: dateRange.value[1].toISOString(),
      page: 1,
      pageSize: 1000
    })
    monitorData.value = result.list
    updateChart()
  } catch (error) {
    console.error('Failed to load monitor data:', error)
  }
}

// 更新图表
const updateChart = () => {
  if (!monitorChart) return

  const timestamps = monitorData.value.map(d => formatDate(d.timestamp, 'HH:mm'))
  const cpuData = monitorData.value.map(d => d.cpuUsage)
  const memoryData = monitorData.value.map(d => d.memoryUsage)
  const diskData = monitorData.value.map(d => d.diskUsage)

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['CPU', '内存', '磁盘'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: timestamps },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      { name: 'CPU', type: 'line', smooth: true, data: cpuData, itemStyle: { color: '#1890ff' } },
      { name: '内存', type: 'line', smooth: true, data: memoryData, itemStyle: { color: '#52c41a' } },
      { name: '磁盘', type: 'line', smooth: true, data: diskData, itemStyle: { color: '#faad14' } }
    ]
  }
  monitorChart.setOption(option)
}

// 工具函数
const getStatusBadge = (status?: string) => {
  const map: Record<string, string> = {
    online: 'success',
    offline: 'error',
    maintenance: 'warning'
  }
  return map[status || ''] || 'default'
}

const getProgressStatus = (value?: number) => {
  if (!value) return 'normal'
  if (value > 90) return 'exception'
  if (value > 70) return 'normal'
  return 'success'
}

const getTempClass = (temp?: number) => {
  if (!temp) return 'normal'
  if (temp > 80) return 'danger'
  if (temp > 60) return 'warning'
  return 'normal'
}

onMounted(async () => {
  await loadServer()
  await loadLatestData()
  await nextTick()
  if (monitorChartRef.value) {
    monitorChart = echarts.init(monitorChartRef.value)
    await loadMonitorData()
  }

  // 定时刷新
  const timer = setInterval(loadLatestData, 5000)
  onUnmounted(() => clearInterval(timer))
})

onUnmounted(() => {
  monitorChart?.dispose()
})
</script>

<style scoped lang="less">
.server-detail-page {
  .detail-card {
    margin-top: 16px;
  }

  .description {
    color: rgba(0, 0, 0, 0.65);
  }

  .metric-card {
    text-align: center;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 8px;

    .metric-label {
      margin-bottom: 16px;
      font-weight: 500;
    }

    .temperature-value {
      font-size: 32px;
      font-weight: bold;
      padding: 20px 0;

      &.normal {
        color: #52c41a;
      }

      &.warning {
        color: #faad14;
      }

      &.danger {
        color: #ff4d4f;
      }
    }
  }

  .network-stats {
    .ant-statistic {
      text-align: center;
    }
  }

  .monitor-chart {
    height: 350px;
  }
}
</style>
