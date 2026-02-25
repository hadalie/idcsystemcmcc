<template>
  <div class="assets-page">
    <!-- 资产统计 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card :bordered="false">
          <a-statistic title="机柜总数" :value="stats.racks" suffix="个">
            <template #prefix>
              <DatabaseOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false">
          <a-statistic title="IP地址" :value="stats.ips" suffix="个">
            <template #prefix>
              <GlobalOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false">
          <a-statistic title="带宽资源" :value="stats.bandwidth" suffix="Mbps">
            <template #prefix>
              <WifiOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false">
          <a-statistic title="硬件设备" :value="stats.hardware" suffix="台">
            <template #prefix>
              <DesktopOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 资产列表 -->
    <a-card title="资产列表" class="table-card" :bordered="false">
      <template #extra>
        <a-space>
          <a-select
            v-model:value="filterType"
            placeholder="类型筛选"
            allow-clear
            style="width: 120px"
            @change="handleFilterChange"
          >
            <a-select-option value="rack">机柜</a-select-option>
            <a-select-option value="ip">IP</a-select-option>
            <a-select-option value="bandwidth">带宽</a-select-option>
            <a-select-option value="hardware">硬件</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleAdd">
            <PlusOutlined />
            添加资产
          </a-button>
        </a-space>
      </template>

      <a-table
        :columns="columns"
        :data-source="assets"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag>{{ getTypeText(record.type) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-badge :status="getStatusBadge(record.status)" :text="getStatusText(record.status)" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-button type="link" danger size="small" @click="handleDelete(record)">
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 添加/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑资产' : '添加资产'"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form :model="formData" layout="vertical">
        <a-form-item label="资产名称" required>
          <a-input v-model:value="formData.name" placeholder="请输入资产名称" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="类型" required>
              <a-select v-model:value="formData.type" placeholder="选择类型">
                <a-select-option value="rack">机柜</a-select-option>
                <a-select-option value="ip">IP</a-select-option>
                <a-select-option value="bandwidth">带宽</a-select-option>
                <a-select-option value="hardware">硬件</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" required>
              <a-select v-model:value="formData.status" placeholder="选择状态">
                <a-select-option value="available">可用</a-select-option>
                <a-select-option value="in_use">使用中</a-select-option>
                <a-select-option value="reserved">预留</a-select-option>
                <a-select-option value="retired">退役</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="值/规格">
          <a-input v-model:value="formData.value" placeholder="如：192.168.1.1 或 1000Mbps" />
        </a-form-item>
        <a-form-item label="位置">
          <a-input v-model:value="formData.location" placeholder="资产所在位置" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="formData.description" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  DatabaseOutlined,
  GlobalOutlined,
  WifiOutlined,
  DesktopOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import { getAssets, createAsset, updateAsset, deleteAsset, getAssetStats } from '@/services/asset'
import type { Asset, PaginationResult } from '@/types'
import { getStatusText } from '@/utils/format'

const loading = ref(false)
const assets = ref<Asset[]>([])
const stats = reactive({ racks: 0, ips: 0, bandwidth: 0, hardware: 0 })
const filterType = ref<string>()

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '资产名称', dataIndex: 'name' },
  { title: '类型', key: 'type', width: 100 },
  { title: '值/规格', dataIndex: 'value', ellipsis: true },
  { title: '状态', key: 'status', width: 100 },
  { title: '位置', dataIndex: 'location', ellipsis: true },
  { title: '操作', key: 'action', width: 120 }
]

const modalVisible = ref(false)
const isEdit = ref(false)
const formData = reactive<Partial<Asset>>({
  id: undefined,
  name: '',
  type: 'hardware',
  status: 'available',
  value: '',
  location: '',
  description: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const result: PaginationResult<Asset> = await getAssets({
      page: pagination.current,
      pageSize: pagination.pageSize,
      type: filterType.value
    })
    assets.value = result.list
    pagination.total = result.total
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const data = await getAssetStats()
    Object.assign(stats, data)
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    rack: '机柜',
    ip: 'IP',
    bandwidth: '带宽',
    hardware: '硬件'
  }
  return map[type] || type
}

const getStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    available: 'success',
    in_use: 'processing',
    reserved: 'warning',
    retired: 'default'
  }
  return map[status] || 'default'
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

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: undefined,
    name: '',
    type: 'hardware',
    status: 'available',
    value: '',
    location: '',
    description: ''
  })
  modalVisible.value = true
}

const handleEdit = (record: Asset) => {
  isEdit.value = true
  Object.assign(formData, record)
  modalVisible.value = true
}

const handleDelete = (record: Asset) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除资产 "${record.name}" 吗？`,
    onOk: async () => {
      try {
        await deleteAsset(record.id)
        message.success('删除成功')
        loadData()
        loadStats()
      } catch {
        message.error('删除失败')
      }
    }
  })
}

const handleModalOk = async () => {
  if (!formData.name) {
    message.warning('请输入资产名称')
    return
  }
  try {
    if (isEdit.value && formData.id) {
      await updateAsset(formData.id, formData)
      message.success('更新成功')
    } else {
      await createAsset(formData)
      message.success('添加成功')
    }
    modalVisible.value = false
    loadData()
    loadStats()
  } catch {
    message.error('操作失败')
  }
}

const handleModalCancel = () => {
  modalVisible.value = false
}

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<style scoped lang="less">
.assets-page {
  .stats-row {
    margin-bottom: 16px;
  }
}
</style>
