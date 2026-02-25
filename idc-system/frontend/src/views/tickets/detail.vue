<template>
  <div class="ticket-detail-page">
    <a-button type="link" @click="$router.back()">
      <LeftOutlined />
      返回列表
    </a-button>

    <a-row :gutter="16" class="detail-content">
      <a-col :span="16">
        <a-card title="工单详情" :loading="loading">
          <a-descriptions :column="2">
            <a-descriptions-item label="工单编号">#{{ ticket?.id }}</a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="getStatusColor(ticket?.status)">
                {{ getStatusText(ticket?.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="类型">{{ getTypeText(ticket?.type) }}</a-descriptions-item>
            <a-descriptions-item label="优先级">
              <a-tag :color="getPriorityColor(ticket?.priority)">
                {{ getPriorityText(ticket?.priority) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="创建人">{{ ticket?.requester?.username }}</a-descriptions-item>
            <a-descriptions-item label="处理人">{{ ticket?.assignee?.username || '未分配' }}</a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ formatDate(ticket?.createdAt) }}</a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ formatDate(ticket?.updatedAt) }}</a-descriptions-item>
          </a-descriptions>
          <a-divider />
          <h4>问题描述</h4>
          <p>{{ ticket?.description }}</p>
        </a-card>

        <!-- 评论列表 -->
        <a-card title="处理记录" class="comments-card">
          <a-timeline>
            <a-timeline-item v-for="comment in comments" :key="comment.id">
              <p>{{ comment.content }}</p>
              <p class="comment-meta">
                {{ comment.author?.username }} · {{ formatDate(comment.createdAt) }}
              </p>
            </a-timeline-item>
          </a-timeline>

          <!-- 添加评论 -->
          <div class="add-comment">
            <a-textarea
              v-model:value="newComment"
              :rows="3"
              placeholder="添加处理记录..."
            />
            <a-button type="primary" style="margin-top: 8px" @click="handleAddComment">
              提交
            </a-button>
          </div>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card title="操作">
          <a-space direction="vertical" style="width: 100%">
            <a-button
              v-if="ticket?.status === 'open'"
              type="primary"
              block
              @click="handleStart"
            >
              开始处理
            </a-button>
            <a-button
              v-if="ticket?.status === 'in_progress'"
              type="primary"
              block
              @click="handleResolve"
            >
              标记为已解决
            </a-button>
            <a-button
              v-if="ticket?.status === 'resolved'"
              block
              @click="handleClose"
            >
              关闭工单
            </a-button>
            <a-button block @click="showAssignModal = true">
              {{ ticket?.assignee ? '重新分配' : '分配工单' }}
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>

    <!-- 分配弹窗 -->
    <a-modal
      v-model:open="showAssignModal"
      title="分配工单"
      @ok="handleAssign"
    >
      <a-select v-model:value="selectedUserId" placeholder="选择处理人" style="width: 100%">
        <a-select-option v-for="user in users" :key="user.id" :value="user.id">
          {{ user.username }}
        </a-select-option>
      </a-select>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { LeftOutlined } from '@ant-design/icons-vue'
import { getTicket, startTicket, resolveTicket, closeTicket, assignTicket, getTicketComments, addTicketComment } from '@/services/ticket'
import type { Ticket, TicketComment, User } from '@/types'
import { formatDate, getStatusColor, getStatusText, getPriorityColor, getPriorityText } from '@/utils/format'

const route = useRoute()
const ticketId = parseInt(route.params.id as string)

const loading = ref(false)
const ticket = ref<Ticket>()
const comments = ref<TicketComment[]>([])
const newComment = ref('')
const showAssignModal = ref(false)
const selectedUserId = ref<number>()
const users = ref<User[]>([])

const loadTicket = async () => {
  loading.value = true
  try {
    ticket.value = await getTicket(ticketId)
    comments.value = await getTicketComments(ticketId)
  } finally {
    loading.value = false
  }
}

const getTypeText = (type?: string) => {
  const map: Record<string, string> = {
    incident: '故障',
    request: '请求',
    maintenance: '维护'
  }
  return map[type || ''] || type
}

const handleStart = async () => {
  try {
    await startTicket(ticketId)
    message.success('已开始处理')
    loadTicket()
  } catch {
    message.error('操作失败')
  }
}

const handleResolve = () => {
  Modal.confirm({
    title: '确认解决',
    content: '确定要标记该工单为已解决吗？',
    onOk: async () => {
      try {
        await resolveTicket(ticketId)
        message.success('工单已解决')
        loadTicket()
      } catch {
        message.error('操作失败')
      }
    }
  })
}

const handleClose = async () => {
  try {
    await closeTicket(ticketId)
    message.success('工单已关闭')
    loadTicket()
  } catch {
    message.error('操作失败')
  }
}

const handleAssign = async () => {
  if (!selectedUserId.value) {
    message.warning('请选择处理人')
    return
  }
  try {
    await assignTicket(ticketId, selectedUserId.value)
    message.success('分配成功')
    showAssignModal.value = false
    loadTicket()
  } catch {
    message.error('分配失败')
  }
}

const handleAddComment = async () => {
  if (!newComment.value.trim()) {
    message.warning('请输入内容')
    return
  }
  try {
    await addTicketComment(ticketId, newComment.value)
    message.success('添加成功')
    newComment.value = ''
    comments.value = await getTicketComments(ticketId)
  } catch {
    message.error('添加失败')
  }
}

onMounted(() => {
  loadTicket()
})
</script>

<style scoped lang="less">
.ticket-detail-page {
  .detail-content {
    margin-top: 16px;
  }

  .comments-card {
    margin-top: 16px;

    .comment-meta {
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
    }

    .add-comment {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }
  }
}
</style>
