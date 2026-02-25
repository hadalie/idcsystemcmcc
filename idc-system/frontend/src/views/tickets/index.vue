<template>
  <div class="tickets-page">
    <!-- 搜索和操作栏 -->
    <a-card class="search-card" :bordered="false">
      <a-row :gutter="16" align="middle">
        <a-col :span="6">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索工单标题/编号"
            allow-clear
            @search="handleSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="filterStatus"
            placeholder="状态筛选"
            allow-clear
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="open">待处理</a-select-option>
            <a-select-option value="assigned">已分配</a-select-option>
            <a-select-option value="in_progress">处理中</a-select-option>
            <a-select-option value="resolved">已解决</a-select-option>
            <a-select-option value="closed">已关闭</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="filterPriority"
            placeholder="优先级筛选"
            allow-clear
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option value="low">低</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="high">高</a-select-option>
            <a-select-option value="urgent">紧急</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="10" style="text-align: right">
          <a-button type="primary" @click="handleCreate">
            <PlusOutlined />
            新建工单
          </a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- 工单列表 -->
    <a-card class="table-card" :bordered="false">
      <a-table
        :columns="columns"
        :data-source="tickets"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="getPriorityColor(record.priority)">
              {{ getPriorityText(record.priority) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'type'">
            {{ getTypeText(record.type) }}
          </template>
          <template v-else-if="column.key === 'requester'">
            {{ record.requester?.username }}
          </template>
          <template v-else-if="column.key === 'assignee'">
            {{ record.assignee?.username || '未分配' }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)">
                查看
              </a-button>
              <a-button
                v-if="record.status === 'open'"
                type="link"
                size="small"
                @click="handleAssign(record)"
              >
                分配
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 创建工单弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      title="新建工单"
      width="600px"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form :model="formData" layout="vertical">
        <a-form-item label="标题" required>
          <a-input v-model:value="formData.title" placeholder="请输入工单标题" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="类型" required>
              <a-select v-model:value="formData.type" placeholder="选择类型">
                <a-select-option value="incident">故障</a-select-option>
                <a-select-option value="request">请求</a-select-option>
                <a-select-option value="maintenance">维护</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="优先级" required>
              <a-select v-model:value="formData.priority" placeholder="选择优先级">
                <a-select-option value="low">低</a-select-option>
                <a-select-option value="medium">中</a-select-option>
                <a-select-option value="high">高</a-select-option>
                <a-select-option value="urgent">紧急</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="描述" required>
          <a-textarea v-model:value="formData.description" :rows="4" placeholder="请详细描述问题" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getTickets, createTicket } from '@/services/ticket'
import type { Ticket, PaginationResult } from '@/types'
import { getStatusColor, getStatusText, getPriorityColor, getPriorityText } from '@/utils/format'

const router = useRouter()

const loading = ref(false)
const tickets = ref<Ticket[]>([])
const searchKeyword = ref('')
const filterStatus = ref<string>()
const filterPriority = ref<string>()

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '标题', dataIndex: 'title', ellipsis: true },
  { title: '类型', key: 'type', width: 80 },
  { title: '优先级', key: 'priority', width: 80 },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建人', key: 'requester', width: 100 },
  { title: '处理人', key: 'assignee', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', width: 160 },
  { title: '操作', key: 'action', width: 120 }
]

const modalVisible = ref(false)
const formData = reactive<Partial<Ticket>>({
  title: '',
  description: '',
  type: 'incident',
  priority: 'medium'
})

const loadData = async () => {
  loading.value = true
  try {
    const result: PaginationResult<Ticket> = await getTickets({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      status: filterStatus.value,
      priority: filterPriority.value
    })
    tickets.value = result.list
    pagination.total = result.total
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
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

const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    incident: '故障',
    request: '请求',
    maintenance: '维护'
  }
  return map[type] || type
}

const handleCreate = () => {
  formData.title = ''
  formData.description = ''
  formData.type = 'incident'
  formData.priority = 'medium'
  modalVisible.value = true
}

const handleView = (record: Ticket) => {
  router.push(`/tickets/${record.id}`)
}

const handleAssign = (record: Ticket) => {
  // 实现分配逻辑
}

const handleModalOk = async () => {
  if (!formData.title || !formData.description) {
    message.warning('请填写必填项')
    return
  }
  try {
    await createTicket(formData)
    message.success('创建成功')
    modalVisible.value = false
    loadData()
  } catch {
    message.error('创建失败')
  }
}

const handleModalCancel = () => {
  modalVisible.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.tickets-page {
  .search-card {
    margin-bottom: 16px;
  }
}
</style>
