<template>
  <div class="alert-rules-page">
    <a-space style="margin-bottom: 16px">
      <a-button type="primary" @click="handleAdd">
        <PlusOutlined />
        添加规则
      </a-button>
    </a-space>

    <a-table
      :columns="columns"
      :data-source="rules"
      :loading="loading"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'metric'">
          {{ getMetricText(record.metric) }}
        </template>
        <template v-else-if="column.key === 'condition'">
          {{ record.metric }} {{ record.operator }} {{ record.threshold }}
        </template>
        <template v-else-if="column.key === 'enabled'">
          <a-switch
            :checked="record.enabled"
            @change="(checked: boolean) => handleToggle(record, checked)"
          />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">
              <EditOutlined />
              编辑
            </a-button>
            <a-popconfirm
              title="确定删除该规则吗？"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" danger size="small">
                <DeleteOutlined />
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 添加/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑规则' : '添加规则'"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form :model="formData" layout="vertical">
        <a-form-item label="规则名称" required>
          <a-input v-model:value="formData.name" placeholder="请输入规则名称" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="监控指标" required>
              <a-select v-model:value="formData.metric" placeholder="选择指标">
                <a-select-option value="cpu_usage">CPU使用率</a-select-option>
                <a-select-option value="memory_usage">内存使用率</a-select-option>
                <a-select-option value="disk_usage">磁盘使用率</a-select-option>
                <a-select-option value="temperature">温度</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="运算符" required>
              <a-select v-model:value="formData.operator" placeholder="选择运算符">
                <a-select-option value=">">大于</a-select-option>
                <a-select-option value="<">小于</a-select-option>
                <a-select-option value=">=">大于等于</a-select-option>
                <a-select-option value="<=">小于等于</a-select-option>
                <a-select-option value="==">等于</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="阈值" required>
              <a-input-number v-model:value="formData.threshold" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="持续时间(分钟)" required>
              <a-input-number v-model:value="formData.duration" :min="1" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="启用">
          <a-switch v-model:checked="formData.enabled" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { getAlertRules, createAlertRule, updateAlertRule, deleteAlertRule, toggleAlertRule } from '@/services/alert'
import type { AlertRule } from '@/types'

const loading = ref(false)
const rules = ref<AlertRule[]>([])

const columns = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '规则名称', dataIndex: 'name' },
  { title: '监控指标', key: 'metric' },
  { title: '触发条件', key: 'condition' },
  { title: '持续时间', dataIndex: 'duration', customRender: ({ text }: { text: number }) => `${text}分钟` },
  { title: '状态', key: 'enabled', width: 80 },
  { title: '操作', key: 'action', width: 150 }
]

const modalVisible = ref(false)
const isEdit = ref(false)
const formData = reactive<Partial<AlertRule>>({
  id: undefined,
  name: '',
  metric: 'cpu_usage',
  operator: '>',
  threshold: 80,
  duration: 5,
  enabled: true
})

const loadData = async () => {
  loading.value = true
  try {
    const result = await getAlertRules({ page: 1, pageSize: 100 })
    rules.value = result.list
  } catch (error) {
    message.error('加载规则失败')
  } finally {
    loading.value = false
  }
}

const getMetricText = (metric: string) => {
  const map: Record<string, string> = {
    cpu_usage: 'CPU使用率',
    memory_usage: '内存使用率',
    disk_usage: '磁盘使用率',
    temperature: '温度'
  }
  return map[metric] || metric
}

const resetForm = () => {
  formData.id = undefined
  formData.name = ''
  formData.metric = 'cpu_usage'
  formData.operator = '>'
  formData.threshold = 80
  formData.duration = 5
  formData.enabled = true
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  modalVisible.value = true
}

const handleEdit = (record: AlertRule) => {
  isEdit.value = true
  Object.assign(formData, record)
  modalVisible.value = true
}

const handleDelete = async (record: AlertRule) => {
  try {
    await deleteAlertRule(record.id)
    message.success('删除成功')
    loadData()
  } catch {
    message.error('删除失败')
  }
}

const handleToggle = async (record: AlertRule, enabled: boolean) => {
  try {
    await toggleAlertRule(record.id, enabled)
    message.success('状态更新成功')
    loadData()
  } catch {
    message.error('状态更新失败')
  }
}

const handleModalOk = async () => {
  if (!formData.name) {
    message.warning('请输入规则名称')
    return
  }
  try {
    if (isEdit.value && formData.id) {
      await updateAlertRule(formData.id, formData)
      message.success('更新成功')
    } else {
      await createAlertRule(formData)
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

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.alert-rules-page {
  padding: 0;
}
</style>
