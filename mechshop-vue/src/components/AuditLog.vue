<script setup>
import { ref, onMounted } from 'vue'
import { getAuditLog } from '../api.js'

const logs = ref([])

async function loadLogs() {
  logs.value = await getAuditLog()
}

onMounted(loadLogs)
</script>
<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Audit Log</h2>
    <div class="bg-white p-4 rounded-lg shadow">
      <table class="w-full">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Action</th>
            <th>Details</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ log.user_id }}</td>
            <td>{{ log.action }}</td>
            <td>{{ log.details }}</td>
            <td>{{ log.created_at }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template> 