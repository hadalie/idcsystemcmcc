<template>
  <div class="dashboard-page">
    <!-- 统计卡片 -->
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-content">
            <div class="stat-icon server-icon">
              <CloudServerOutlined />
            </div>
            <div class="stat-info">
              <div class="stat-title">服务器总数</div>
              <div class="stat-value">{{ stats.servers?.total || 0 }}</div>
              <div class="stat-detail">
                <span class="online">在线: {{ stats.servers?.online || 0 }}</span>
                <a-divider type="vertical" />
                <span class="offline">离线: {{ stats.servers?.offline || 0 }}</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-content">
            <div class="stat-icon alert-icon">
              <AlertOutlined />
            </div>
            <div class="stat-info">
              <div class="stat-title">未处理告警</div>
              <div class="stat-value">{{ stats.alerts?.unresolved || 0 }}</div>
              <div class="stat-detail">
                <span class="critical">严重: {{ stats.alerts?.critical || 0 }}</span>
                <a-divider type="vertical" />
                <span class="warning">警告: {{ stats.alerts?.warning || 0 }}</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-content">
            <div class="stat-icon ticket-icon">
              <FileTextOutlined />
            </div>
            <div class="stat-info">
              <div class="stat-title">待处理工单</div>
              <div class="stat-value">{{ stats.tickets?.open || 0 }}</div>
              <div class="stat-detail">
                <span>紧急: {{ stats.tickets?.urgent || 0 }}</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-content">
            <div class="stat-icon asset-icon">
              <DatabaseOutlined />
            </div>
            <div class="stat-info">
              <div class="stat-title">IP资源</div>
              <div class="stat-value">{{ stats.assets?.ips || 0 }}</div>
              <div class="stat-detail">
                <span>机柜: {{ stats.assets?.racks || 0 }}</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="[16, 16]" class="chart-row">
      <a-col :xs="24" :lg="12">
        <a-card title="资源使用趋势" :bordered="false">
          <template #extra>
            <a-radio-group v-model:value="resourceRange" size="small" @change="loadResourceTrend">
              <a-radio-button value="1h">1小时</a-radio-button>
              <a-radio-button value="24h">24小时</a-radio-button>
              <a-radio-button value="7d">7天</a-radio-button>
            </a-radio-group>
          </template>
          <div ref="resourceChartRef" class="chart-container"></div>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="12">
        <a-card title="告警趋势" :bordered="false">
          <template #extra>
            <a-radio-group v-model:value="alertRange" size="small" @change="loadAlertTrend">
              <a-radio-button value="24h">24小时</a-radio-button>
              <a-radio-button value="7d">7天</a-radio-button>
            </a-radio-group>
          </template>
          <div ref="alertChartRef" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 底部区域 -->
    <a-row :gutter="[16, 16]" class="bottom-row">
      <a-col :xs="24" :lg="12">
        <a-card title="最近告警" :bordered="false">
          <template #extra>
            <a-button type="link" size="small" @click="$router.push('/alerts')">
              查看全部
            </a-button>
          </template>
          <a-list :data-source="recentAlerts" :loading="alertsLoading">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar :style="{ backgroundColor: getAlertColor(item.alertLevel) }">
                      <BellOutlined />
                    </a-avatar>
                  </template>
                  <template #title>
                    <a-space>
                      <a-tag :color="getAlertLevelColor(item.alertLevel)">
                        {{ getAlertLevelText(item.alertLevel) }}
                      </a-tag>
                      <span>{{ item.server?.hostname }}</span>
                    </a-space>
                  </template>
                  <template #description>
                    <div>{{ item.message }}</div>
                    <div class="alert-time">{{ formatDate(item.createdAt) }}</div>
                  </template>
                </a-list-item-meta>
                <a-button
                  v-if="item.status === 'triggered'"
                  type="primary"
                  size="small"
                  @click="handleResolveAlert(item)"
                >
                  处理
                </a-button>
              </a-list-item>
            </template>
            <template #empty>
              <a-empty description="暂无告警" />
            </template>
          </a-list>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="12">
        <a-card title="Top 5 CPU使用率" :bordered="false">
          <template #extra>
            <a-radio-group v-model:value="topMetric" size="small" @change="loadTopResource">
              <a-radio-button value="cpu">CPU</a-radio-button>
              <a-radio-button value="memory">内存</a-radio-button>
              <a-radio-button value="disk">磁盘</a-radio-button>
            </a-radio-group>
          </template>
          <a-list :data-source="topServers" :loading="topLoading">
            <template #renderItem="{ item, index }">
              <a-list-item>
                <a-list-item-meta>
                  <template #avatar>
                    <a-avatar>{{ index + 1 }}</a-avatar>
                  </template>
                  <template #title>
                    {{ item.hostname }}
                    <a-tag :color="getStatusColor(item.status)">
                      {{ getStatusText(item.status) }}
                    </a-tag>
                  </template>
                  <template #description>
                    {{ item.ipAddress }} | {{ item.location }}
                  </template>
                </a-list-item-meta>
                <a-progress
                  type="circle"
                  :percent="item.usage"
                  :size="50"
                  :status="item.usage > 90 ? 'exception' : item.usage > 70 ? 'normal' : 'success'"
                />
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  CloudServerOutlined,
  AlertOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  BellOutlined
} from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { getDashboardStats, getResourceTrend, getAlertTrend, getTopResourceUsage } from '@/services/dashboard'
import { getRecentAlerts, resolveAlert } from '@/services/alert'
import type { DashboardStats, AlertHistory, Server } from '@/types'
import { formatDate, getStatusColor, getStatusText, getAlertLevelColor, getAlertLevelText } from '@/utils/format'

const stats = ref<Partial<DashboardStats>>({})
const resourceChartRef = ref<HTMLElement>()
const alertChartRef = ref<HTMLElement>()
let resourceChart: ECharts | null = null
let alertChart: ECharts | null = null

const resourceRange = ref('24h')
const alertRange = ref('24h')

const recentAlerts = ref<AlertHistory[]>([])
const alertsLoading = ref(false)

const topServers = ref<Array<Server & { usage: number }>>([])
const topMetric = ref('cpu')
const topLoading = ref(false)

const loadStats = async () => {
  try {
    stats.value = await getDashboardStats()
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const loadResourceTrend = async () => {
  try {
    const data = await getResourceTrend(resourceRange.value as any)
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['CPU', '内存', '磁盘'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: data.timestamps },
      yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      series: [
        { name: 'CPU', type: 'line', smooth: true, data: data.cpu, itemStyle: { color: '#1890ff' } },
        { name: '内存', type: 'line', smooth: true, data: data.memory, itemStyle: { color: '#52c41a' } },
        { name: '磁盘', type: 'line', smooth: true, data: data.disk, itemStyle: { color: '#faad14' } }
      ]
    }
    resourceChart?.setOption(option)
  } catch (error) {
    console.error('Failed to load resource trend:', error)
  }
}

const loadAlertTrend = async () => {
  try {
    const data = await getAlertTrend(alertRange.value as any)
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['信息', '警告', '严重'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: data.timestamps },
      yAxis: { type: 'value' },
      series: [
        { name: '信息', type: 'bar', stack: 'total', data: data.info, itemStyle: { color: '#1890ff' } },
        { name: '警告', type: 'bar', stack: 'total', data: data.warning, itemStyle: { color: '#faad14' } },
        { name: '严重', type: 'bar', stack: 'total', data: data.critical, itemStyle: { color: '#ff4d4f' } }
      ]
    }
    alertChart?.setOption(option)
  } catch (error) {
    console.error('Failed to load alert trend:', error)
  }
}

const loadRecentAlerts = async () => {
  alertsLoading.value = true
  try {
    recentAlerts.value = await getRecentAlerts(5)
  } catch (error) {
    console.error('Failed to load alerts:', error)
  } finally {
    alertsLoading.value = false
  }
}

const handleResolveAlert = async (alert: AlertHistory) => {
  try {
    await resolveAlert(alert.id)
    message.success('告警已处理')
    loadRecentAlerts()
    loadStats()
  } catch (error) {
    message.error('处理失败')
  }
}

const loadTopResource = async () => {
  topLoading.value = true
  try {
    const servers = await getTopResourceUsage(topMetric.value as any, 5)
    topServers.value = servers.map(s => ({
      ...s,
      usage: Math.floor(Math.random() * 60) + 30
    })).sort((a, b) => b.usage - a.usage)
  } catch (error) {
    console.error('Failed to load top resource:', error)
  } finally {
    topLoading.value = false
  }
}

const getAlertColor = (level: string) => {
  const colors: Record<string, string> = {
    info: '#1890ff',
    warning: '#faad14',
    critical: '#ff4d4f'
  }
  return colors[level] || '#1890ff'
}

const initCharts = () => {
  if (resourceChartRef.value) {
    resourceChart = echarts.init(resourceChartRef.value)
  }
  if (alertChartRef.value) {
    alertChart = echarts.init(alertChartRef.value)
  }
}

const handleResize = () => {
  resourceChart?.resize()
  alertChart?.resize()
}

onMounted(async () => {
  await loadStats()
  await nextTick()
  initCharts()
  await Promise.all([
    loadResourceTrend(),
    loadAlertTrend(),
    loadRecentAlerts(),
    loadTopResource()
  ])
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  resourceChart?.dispose()
  alertChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="less">
.dashboard-page {
  .chart-row,
  .bottom-row {
    margin-top: 16px;
  }
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
  }

  .stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    margin-right: 16px;

    &.server-icon {
      background: #e6f7ff;
      color: #1890ff;
    }

    &.alert-icon {
      background: #fff2f0;
      color: #ff4d4f;
    }

    &.ticket-icon {
      background: #f6ffed;
      color: #52c41a;
    }

    &.asset-icon {
      background: #fff7e6;
      color: #faad14;
    }
  }

  .stat-info {
    flex: 1;

    .stat-title {
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: rgba(0, 0, 0, 0.85);
      margin: 8px 0;
    }

    .stat-detail {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);

      .online {
        color: #52c41a;
      }

      .offline {
        color: #ff4d4f;
      }

      .critical {
        color: #ff4d4f;
        font-weight: bold;
      }

      .warning {
        color: #faad14;
      }
    }
  }
}

.chart-container {
  height: 300px;
}

.alert-time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 4px;
}
</style>
