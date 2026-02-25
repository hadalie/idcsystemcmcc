<template>
  <div class="settings-page">
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="general" tab="通用设置">
        <a-card :bordered="false">
          <a-form :model="generalSettings" layout="vertical">
            <a-form-item label="系统名称">
              <a-input v-model:value="generalSettings.siteName" />
            </a-form-item>
            <a-form-item label="系统Logo">
              <a-upload
                v-model:file-list="logoFileList"
                list-type="picture-card"
                :max-count="1"
              >
                <div>
                  <PlusOutlined />
                  <div style="margin-top: 8px">上传</div>
                </div>
              </a-upload>
            </a-form-item>
            <a-form-item label="时区">
              <a-select v-model:value="generalSettings.timezone">
                <a-select-option value="Asia/Shanghai">Asia/Shanghai</a-select-option>
                <a-select-option value="UTC">UTC</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="saveGeneral">保存</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-tab-pane>

      <a-tab-pane key="security" tab="安全设置">
        <a-card :bordered="false">
          <a-form :model="securitySettings" layout="vertical">
            <a-form-item label="密码最小长度">
              <a-input-number v-model:value="securitySettings.minPasswordLength" :min="6" :max="32" />
            </a-form-item>
            <a-form-item label="登录失败锁定次数">
              <a-input-number v-model:value="securitySettings.maxLoginAttempts" :min="3" :max="10" />
            </a-form-item>
            <a-form-item label="会话超时时间(分钟)">
              <a-input-number v-model:value="securitySettings.sessionTimeout" :min="10" :max="480" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="saveSecurity">保存</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-tab-pane>

      <a-tab-pane key="notification" tab="通知设置">
        <a-card :bordered="false">
          <a-form :model="notificationSettings" layout="vertical">
            <a-form-item label="邮件服务器">
              <a-input v-model:value="notificationSettings.smtpServer" placeholder="smtp.example.com" />
            </a-form-item>
            <a-form-item label="SMTP端口">
              <a-input-number v-model:value="notificationSettings.smtpPort" :min="1" :max="65535" />
            </a-form-item>
            <a-form-item label="发件人邮箱">
              <a-input v-model:value="notificationSettings.smtpUser" />
            </a-form-item>
            <a-form-item label="发件人密码">
              <a-input-password v-model:value="notificationSettings.smtpPassword" />
            </a-form-item>
            <a-form-item>
              <a-button @click="testEmail">测试邮件</a-button>
              <a-button type="primary" style="margin-left: 8px" @click="saveNotification">保存</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { UploadProps } from 'ant-design-vue'

const activeTab = ref('general')
const logoFileList = ref<UploadProps['fileList']>([])

const generalSettings = reactive({
  siteName: 'IDC机房管理系统',
  timezone: 'Asia/Shanghai'
})

const securitySettings = reactive({
  minPasswordLength: 8,
  maxLoginAttempts: 5,
  sessionTimeout: 30
})

const notificationSettings = reactive({
  smtpServer: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPassword: ''
})

const saveGeneral = () => {
  message.success('通用设置已保存')
}

const saveSecurity = () => {
  message.success('安全设置已保存')
}

const saveNotification = () => {
  message.success('通知设置已保存')
}

const testEmail = () => {
  message.info('测试邮件已发送')
}
</script>

<style scoped lang="less">
.settings-page {
  max-width: 800px;
}
</style>
