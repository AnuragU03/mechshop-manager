<script setup>
import { ref } from 'vue'
import { sendNotification } from '../api.js'

const message = ref('')
const result = ref('')

async function send() {
  const res = await sendNotification({ message: message.value })
  result.value = res.message || 'Sent!'
}
</script>
<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Send Notification</h2>
    <div class="bg-white p-4 rounded-lg shadow flex gap-2">
      <input v-model="message" placeholder="Message" class="p-2 border rounded flex-1" />
      <button @click="send" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send</button>
    </div>
    <div v-if="result" class="mt-2 text-green-600">{{ result }}</div>
  </div>
</template> 