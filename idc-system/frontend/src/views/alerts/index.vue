<template>
  <div class="alerts-page">
    <!-- 搜索和操作栏 -->
    <a-card class="search-card" :bordered="false">
      <a-row :gutter="16" align="middle">
        <a-col :span="4">
          <a-select
            v-model:value="filterLevel"
            placeholder="告警级别"
            allow-clear
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="info">信息</a-select-option>
            <a-select-option value="warning">警告</a-select-option>
            <a-select-option value="critical">严重</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="filterStatus"
            placeholder="处理状态"
            allow-clear
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="triggered">未处理</a-select-option>
            <a-select-option value="resolved">已处理</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="8">
          <a-range-picker
            v-model:value="dateRange"
            show-time
            style="width: 100%"
            @change="handleFilterChange"
          />
        </a-col>
        <a-col :span="8" style="text-align: right">
          <a-space>
            <a-button @click="loadData">
              <ReloadOutlined />
              刷新
            </a-button>
            <a-button @click="showRules = true">
              <SettingOutlined />
              告警规则
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 告警列表 -->
    <a-card class="table-card" :bordered="false">
      <a-table
        :columns="columns"
        :data-source="alerts"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <a-tag :color="getAlertLevelColor(record.alertLevel)">
              {{ getAlertLevelText(record.alertLevel) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-badge
              :status="record.status === 'triggered' ? 'error' : 'success'"
              :text="record.status === 'triggered' ? '未处理' : '已处理'"
            />
          </template>
          <template v-else-if="column.key === 'server'">
            {{ record.server?.hostname }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button
                v-if="record.status === 'triggered'"
                type="primary"
                size="small"
                @click="handleResolve(record)"
              >
                处理
              </a-button>
              <a-button type="link" size="small" @click="handleViewDetail(record)">
                详情
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 告警规则弹窗 -->
    <a-modal
      v-model:open="showRules"
      title="告警规则配置"
      width="800px"
      :footer="null"
    >
      <AlertRules />
    </a-modal>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="告警详情"
      :footer="null"
    >
      <a-descriptions :column="1" v-if="selectedAlert">
        <a-descriptions-item label="告警ID">{{ selectedAlert.id }}</a-descriptions-item>
        <a-descriptions-item label="告警级别">
          <a-tag :color="getAlertLevelColor(selectedAlert.alertLevel)">
            {{ getAlertLevelText(selectedAlert.alertLevel) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="服务器">{{ selectedAlert.server?.hostname }}</a-descriptions-item>
        <a-descriptions-item label="告警内容">{{ selectedAlert.message }}</a-descriptions-item>
        <a-descriptions-item label="触发时间">{{ formatDate(selectedAlert.createdAt) }}</a-descriptions-item>
        <a-descriptions-item label="处理状态">
          <a-badge
            :status="selectedAlert.status === 'triggered' ? 'error' : 'success'"
            :text="selectedAlert.status === 'triggered' ? '未处理' : '已处理'"
          />
        </a-descriptions-item>
        <a-descriptions-item v-if="selectedAlert.resolvedAt" label="处理时间">
          {{ formatDate(selectedAlert.resolvedAt) }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { message, Modal } from 'ant-design-vue'
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { getAlertHistory, resolveAlert } from '@/services/alert'
import AlertRules from './rules.vue'
import type { AlertHistory, PaginationResult } from '@/types'
import { formatDate, getAlertLevelColor, getAlertLevelText } from '@/utils/format'

const loading = ref(false)
const alerts = ref<AlertHistory[]>([])
const filterLevel = ref<string>()
const filterStatus = ref<string>()
const dateRange = ref<[Dayjs, Dayjs]>()

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '级别', key: 'level', width: 80 },
  { title: '服务器', key: 'server' },
  { title: '告警内容', dataIndex: 'message', ellipsis: true },
  { title: '状态', key: 'status', width: 100 },
  { title: '触发时间', dataIndex: 'createdAt', width: 160 },
  { title: '操作', key: 'action', width: 150 }
]

const showRules = ref(false)
const detailVisible = ref(false)
const selectedAlert = ref<AlertHistory>()

const loadData = async () => {
  loading.value = true
  try {
    const result: PaginationResult<AlertHistory> = await getAlertHistory({
      page: pagination.current,
      pageSize: pagination.pageSize,
      level: filterLevel.value,
      status: filterStatus.value,
      startTime: dateRange.value?.[0]?.toISOString(),
      endTime: dateRange.value?.[1]?.toISOString()
    })
    alerts.value = result.list
    pagination.total = result.total
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.current = 1
  loadData()
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

const handleResolve = (record: AlertHistory) => {
  Modal.confirm({
    title: '确认处理',
    content: '确定要处理该告警吗？',
    onOk: async () => {
      try {
        await resolveAlert(record.id)
        message.success('处理成功')
        loadData()
      } catch {
        message.error('处理失败')
      }
    }
  })
}

const handleViewDetail = (record: AlertHistory) => {
  selectedAlert.value = record
  detailVisible.value = true
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.alerts-page {
  .search-card {
    margin-bottom: 16px;
  }
}
</style>
