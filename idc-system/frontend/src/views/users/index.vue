<template>
  <div class="users-page">
    <a-card class="search-card" :bordered="false">
      <a-row :gutter="16" align="middle">
        <a-col :span="8">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索用户名/邮箱"
            allow-clear
            @search="handleSearch"
          />
        </a-col>
        <a-col :span="16" style="text-align: right">
          <a-button type="primary" @click="handleAdd">
            <PlusOutlined />
            添加用户
          </a-button>
        </a-col>
      </a-row>
    </a-card>

    <a-card class="table-card" :bordered="false">
      <a-table
        :columns="columns"
        :data-source="users"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-badge :status="record.status === 'active' ? 'success' : 'error'" :text="getStatusText(record.status)" />
          </template>
          <template v-else-if="column.key === 'role'">
            {{ record.role?.name }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-button type="link" size="small" @click="handleResetPassword(record)">
                重置密码
              </a-button>
              <a-popconfirm
                title="确定删除该用户吗？"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" danger size="small">
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 添加/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form :model="formData" layout="vertical">
        <a-form-item label="用户名" required>
          <a-input v-model:value="formData.username" :disabled="isEdit" />
        </a-form-item>
        <a-form-item label="邮箱" required>
          <a-input v-model:value="formData.email" />
        </a-form-item>
        <a-form-item label="角色" required>
          <a-select v-model:value="formData.roleId" placeholder="选择角色">
            <a-select-option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="formData.status">
            <a-select-option value="active">启用</a-select-option>
            <a-select-option value="inactive">禁用</a-select-option>
            <a-select-option value="locked">锁定</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { User, Role, PaginationResult } from '@/types'
import { getStatusText } from '@/utils/format'

// 模拟数据
const loading = ref(false)
const users = ref<User[]>([])
const roles = ref<Role[]>([
  { id: 1, name: 'admin', description: '管理员' },
  { id: 2, name: 'operator', description: '运维人员' },
  { id: 3, name: 'user', description: '普通用户' }
])
const searchKeyword = ref('')

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '用户名', dataIndex: 'username' },
  { title: '邮箱', dataIndex: 'email' },
  { title: '角色', key: 'role', width: 120 },
  { title: '状态', key: 'status', width: 100 },
  { title: '最后登录', dataIndex: 'lastLogin', width: 160 },
  { title: '创建时间', dataIndex: 'createdAt', width: 160 },
  { title: '操作', key: 'action', width: 200 }
]

const modalVisible = ref(false)
const isEdit = ref(false)
const formData = reactive<Partial<User>>({
  id: undefined,
  username: '',
  email: '',
  roleId: undefined,
  status: 'active'
})

const loadData = async () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    users.value = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: roles.value[0],
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        username: 'operator1',
        email: 'op1@example.com',
        role: roles.value[1],
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: new Date().toISOString()
      }
    ]
    pagination.total = 2
    loading.value = false
  }, 500)
}

const handleSearch = () => {
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
  formData.id = undefined
  formData.username = ''
  formData.email = ''
  formData.roleId = undefined
  formData.status = 'active'
  modalVisible.value = true
}

const handleEdit = (record: User) => {
  isEdit.value = true
  Object.assign(formData, record)
  formData.roleId = record.role?.id
  modalVisible.value = true
}

const handleDelete = async (record: User) => {
  message.success('删除成功')
  loadData()
}

const handleResetPassword = (record: User) => {
  Modal.confirm({
    title: '重置密码',
    content: `确定要重置用户 "${record.username}" 的密码吗？`,
    onOk: () => {
      message.success('密码已重置为默认密码：123456')
    }
  })
}

const handleModalOk = async () => {
  if (!formData.username || !formData.email) {
    message.warning('请填写必填项')
    return
  }
  message.success(isEdit.value ? '更新成功' : '添加成功')
  modalVisible.value = false
  loadData()
}

const handleModalCancel = () => {
  modalVisible.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.users-page {
  .search-card {
    margin-bottom: 16px;
  }
}
</style>
