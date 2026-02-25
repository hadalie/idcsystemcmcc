<template>
  <div class="servers-page">
    <!-- 搜索和操作栏 -->
    <a-card class="search-card" :bordered="false">
      <a-row :gutter="16" align="middle">
        <a-col :span="6">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索服务器名称/IP"
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
            <a-select-option value="online">在线</a-select-option>
            <a-select-option value="offline">离线</a-select-option>
            <a-select-option value="maintenance">维护中</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select
            v-model:value="filterGroup"
            placeholder="分组筛选"
            allow-clear
            style="width: 100%"
            @change="handleFilterChange"
          >
            <a-select-option v-for="group in serverGroups" :key="group.id" :value="group.id">
              {{ group.name }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="10" style="text-align: right">
          <a-space>
            <a-button @click="loadData">
              <ReloadOutlined />
              刷新
            </a-button>
            <a-button type="primary" @click="handleAdd">
              <PlusOutlined />
              添加服务器
            </a-button>
            <a-dropdown>
              <a-button>
                更多操作
                <DownOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="import" @click="handleImport">
                    <ImportOutlined />
                    批量导入
                  </a-menu-item>
                  <a-menu-item key="export" @click="handleExport">
                    <ExportOutlined />
                    导出数据
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="delete" @click="handleBatchDelete" :disabled="!selectedRowKeys.length">
                    <DeleteOutlined />
                    批量删除
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 服务器列表 -->
    <a-card class="table-card" :bordered="false">
      <a-table
        :columns="columns"
        :data-source="servers"
        :loading="loading"
        :pagination="pagination"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-badge :status="getStatusBadge(record.status)" :text="getStatusText(record.status)" />
          </template>
          <template v-else-if="column.key === 'group'">
            {{ record.group?.name || '-' }}
          </template>
          <template v-else-if="column.key === 'specs'">
            <a-space direction="vertical" size="small">
              <span><DesktopOutlined /> {{ record.cpuCores || '-' }} 核</span>
              <span><DatabaseOutlined /> {{ record.memoryGb || '-' }} GB</span>
              <span><HddOutlined /> {{ record.diskGb || '-' }} GB</span>
            </a-space>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)">
                <EyeOutlined />
                查看
              </a-button>
              <a-button type="link" size="small" @click="handleEdit(record)">
                <EditOutlined />
                编辑
              </a-button>
              <a-dropdown>
                <a-button type="link" size="small">
                  更多
                  <DownOutlined />
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="monitor" @click="$router.push(`/monitors/${record.id}`)">
                      <LineChartOutlined />
                      监控
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="delete" danger @click="handleDelete(record)">
                      <DeleteOutlined />
                      删除
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 添加/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      width="700px"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="主机名" required>
              <a-input v-model:value="formData.hostname" placeholder="请输入主机名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="IP地址" required>
              <a-input v-model:value="formData.ipAddress" placeholder="请输入IP地址" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="分组">
              <a-select v-model:value="formData.groupId" placeholder="选择分组" allow-clear>
                <a-select-option v-for="group in serverGroups" :key="group.id" :value="group.id">
                  {{ group.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态">
              <a-select v-model:value="formData.status" placeholder="选择状态">
                <a-select-option value="online">在线</a-select-option>
                <a-select-option value="offline">离线</a-select-option>
                <a-select-option value="maintenance">维护中</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="操作系统">
              <a-input v-model:value="formData.os" placeholder="如: CentOS 7.9" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="位置">
              <a-input v-model:value="formData.location" placeholder="如: A区-01机柜" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="CPU核心数">
              <a-input-number v-model:value="formData.cpuCores" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="内存(GB)">
              <a-input-number v-model:value="formData.memoryGb" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="磁盘(GB)">
              <a-input-number v-model:value="formData.diskGb" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="描述">
          <a-textarea v-model:value="formData.description" :rows="3" placeholder="服务器描述信息" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 分组管理弹窗 -->
    <a-modal
      v-model:open="groupModalVisible"
      title="服务器分组管理"
      width="600px"
      :footer="null"
    >
      <a-space style="margin-bottom: 16px">
        <a-input v-model:value="newGroupName" placeholder="分组名称" style="width: 200px" />
        <a-button type="primary" @click="handleAddGroup">
          <PlusOutlined />
          添加分组
        </a-button>
      </a-space>
      <a-table :columns="groupColumns" :data-source="serverGroups" :pagination="false" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEditGroup(record)">
                <EditOutlined />
              </a-button>
              <a-popconfirm
                title="确定删除该分组吗？"
                @confirm="handleDeleteGroup(record.id)"
              >
                <a-button type="link" danger size="small">
                  <DeleteOutlined />
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  ReloadOutlined,
  PlusOutlined,
  DownOutlined,
  ImportOutlined,
  ExportOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  LineChartOutlined,
  DesktopOutlined,
  DatabaseOutlined,
  HddOutlined
} from '@ant-design/icons-vue'
import { getServers, createServer, updateServer, deleteServer, batchDeleteServers } from '@/services/server'
import { getServerGroups, createServerGroup, deleteServerGroup } from '@/services/server'
import type { Server, ServerGroup, PaginationResult } from '@/types'
import { getStatusText } from '@/utils/format'

const router = useRouter()

// 表格列定义
const columns = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '主机名', dataIndex: 'hostname', ellipsis: true },
  { title: 'IP地址', dataIndex: 'ipAddress', width: 130 },
  { title: '分组', key: 'group', width: 120 },
  { title: '状态', key: 'status', width: 100 },
  { title: '配置', key: 'specs', width: 150 },
  { title: '操作系统', dataIndex: 'os', width: 120, ellipsis: true },
  { title: '位置', dataIndex: 'location', width: 120, ellipsis: true },
  { title: '更新时间', dataIndex: 'updatedAt', width: 160 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
]

const groupColumns = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '名称', dataIndex: 'name' },
  { title: '描述', dataIndex: 'description', ellipsis: true },
  { title: '服务器数', dataIndex: 'serverCount', width: 100 },
  { title: '操作', key: 'action', width: 100 }
]

// 状态
const loading = ref(false)
const servers = ref<Server[]>([])
const serverGroups = ref<ServerGroup[]>([])
const selectedRowKeys = ref<number[]>([])
const searchKeyword = ref('')
const filterStatus = ref<string>()
const filterGroup = ref<number>()

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`
})

// 弹窗状态
const modalVisible = ref(false)
const modalTitle = ref('添加服务器')
const isEdit = ref(false)
const formData = reactive<Partial<Server>>({
  id: undefined,
  hostname: '',
  ipAddress: '',
  groupId: undefined,
  status: 'online',
  os: '',
  cpuCores: 4,
  memoryGb: 8,
  diskGb: 100,
  location: '',
  description: ''
})

// 分组管理
const groupModalVisible = ref(false)
const newGroupName = ref('')

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const result: PaginationResult<Server> = await getServers({
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      status: filterStatus.value,
      groupId: filterGroup.value
    })
    servers.value = result.list
    pagination.total = result.total
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadGroups = async () => {
  try {
    serverGroups.value = await getServerGroups()
  } catch (error) {
    console.error('Failed to load groups:', error)
  }
}

// 搜索和筛选
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

const onSelectChange = (keys: number[]) => {
  selectedRowKeys.value = keys
}

// CRUD操作
const resetForm = () => {
  formData.id = undefined
  formData.hostname = ''
  formData.ipAddress = ''
  formData.groupId = undefined
  formData.status = 'online'
  formData.os = ''
  formData.cpuCores = 4
  formData.memoryGb = 8
  formData.diskGb = 100
  formData.location = ''
  formData.description = ''
}

const handleAdd = () => {
  isEdit.value = false
  modalTitle.value = '添加服务器'
  resetForm()
  modalVisible.value = true
}

const handleEdit = (record: Server) => {
  isEdit.value = true
  modalTitle.value = '编辑服务器'
  Object.assign(formData, record)
  modalVisible.value = true
}

const handleView = (record: Server) => {
  router.push(`/servers/${record.id}`)
}

const handleDelete = (record: Server) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除服务器 "${record.hostname}" 吗？`,
    onOk: async () => {
      try {
        await deleteServer(record.id)
        message.success('删除成功')
        loadData()
      } catch {
        message.error('删除失败')
      }
    }
  })
}

const handleBatchDelete = () => {
  if (!selectedRowKeys.value.length) return
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 台服务器吗？`,
    onOk: async () => {
      try {
        await batchDeleteServers(selectedRowKeys.value)
        message.success('批量删除成功')
        selectedRowKeys.value = []
        loadData()
      } catch {
        message.error('批量删除失败')
      }
    }
  })
}

const handleModalOk = async () => {
  if (!formData.hostname || !formData.ipAddress) {
    message.warning('请填写必填项')
    return
  }
  try {
    if (isEdit.value && formData.id) {
      await updateServer(formData.id, formData)
      message.success('更新成功')
    } else {
      await createServer(formData)
      message.success('添加成功')
    }
    modalVisible.value = false
    loadData()
  } catch {
    message.error('操作失败')
  }
}

const handleModalCancel = () => {
  modalVisible.value = false
  resetForm()
}

// 分组管理
const handleAddGroup = async () => {
  if (!newGroupName.value.trim()) {
    message.warning('请输入分组名称')
    return
  }
  try {
    await createServerGroup({ name: newGroupName.value })
    message.success('添加分组成功')
    newGroupName.value = ''
    loadGroups()
  } catch {
    message.error('添加分组失败')
  }
}

const handleEditGroup = (group: ServerGroup) => {
  // 实现编辑分组逻辑
}

const handleDeleteGroup = async (id: number) => {
  try {
    await deleteServerGroup(id)
    message.success('删除分组成功')
    loadGroups()
  } catch {
    message.error('删除分组失败')
  }
}

// 导入导出
const handleImport = () => {
  message.info('批量导入功能开发中')
}

const handleExport = () => {
  message.info('导出功能开发中')
}

// 状态徽章
const getStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    online: 'success',
    offline: 'error',
    maintenance: 'warning'
  }
  return map[status] || 'default'
}

onMounted(() => {
  loadData()
  loadGroups()
})
</script>

<style scoped lang="less">
.servers-page {
  .search-card {
    margin-bottom: 16px;
  }

  .table-card {
    :deep(.ant-table-cell) {
      .anticon {
        margin-right: 4px;
      }
    }
  }
}
</style>
