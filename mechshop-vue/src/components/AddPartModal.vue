<script setup>
import { ref } from 'vue'
const emit = defineEmits(['add-part', 'close'])

const name = ref('')
const category = ref('Engine Parts')
const price = ref('')
const stock = ref('')
const error = ref('')

function resetForm() {
  name.value = ''
  category.value = 'Engine Parts'
  price.value = ''
  stock.value = ''
  error.value = ''
}

function handleClose() {
  resetForm()
  emit('close')
}

function handleSubmit() {
  error.value = ''
  if (!name.value || !category.value || !price.value || !stock.value) {
    error.value = 'All fields are required.'
    return
  }
  emit('add-part', {
    name: name.value,
    category: category.value,
    price: Number(price.value),
    stock: Number(stock.value)
  })
  resetForm()
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg w-96">
      <h3 class="text-xl font-bold mb-4">Add New Part</h3>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Part Name</label>
          <input v-model="name" type="text" class="w-full p-2 border rounded" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Category</label>
          <select v-model="category" class="w-full p-2 border rounded" required>
            <option>Engine Parts</option>
            <option>Brake System</option>
            <option>Electrical</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Price</label>
          <input v-model="price" type="number" class="w-full p-2 border rounded" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Initial Stock</label>
          <input v-model="stock" type="number" class="w-full p-2 border rounded" required />
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" @click="handleClose" class="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Part</button>
        </div>
        <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
      </form>
    </div>
  </div>
</template> 