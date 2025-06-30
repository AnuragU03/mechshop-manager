<script setup>
import { ref } from 'vue'
const emit = defineEmits(['add-part', 'close'])

const name = ref('')
const category = ref('Engine Parts')
const price = ref('')
const stock = ref('')
const wholesale_price = ref('')
const sales_price = ref('')
const low_stock_threshold = ref('10')
const batch = ref('')
const expiry_date = ref('')
const error = ref('')

function resetForm() {
  name.value = ''
  category.value = 'Engine Parts'
  price.value = ''
  stock.value = ''
  wholesale_price.value = ''
  sales_price.value = ''
  low_stock_threshold.value = '10'
  batch.value = ''
  expiry_date.value = ''
  error.value = ''
}

function handleClose() {
  resetForm()
  emit('close')
}

function formatDateToYMD(dateStr) {
  if (!dateStr) return null;
  // If already in YYYY-MM-DD, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Try to parse DD-MM-YYYY or DD/MM/YYYY
  const match = dateStr.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
  if (match) {
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
  }
  return dateStr; // fallback
}

function isValidYMD(dateStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

function handleSubmit() {
  error.value = ''
  if (!name.value || !category.value || !wholesale_price.value || !sales_price.value || !stock.value) {
    error.value = 'All fields are required.'
    return
  }
  if (expiry_date.value && !isValidYMD(expiry_date.value)) {
    error.value = 'Expiry date must be in YYYY-MM-DD format.'
    return
  }
  emit('add-part', {
    name: name.value,
    category: category.value,
    stock: Number(stock.value),
    wholesale_price: Number(wholesale_price.value),
    sales_price: Number(sales_price.value),
    low_stock_threshold: Number(low_stock_threshold.value),
    batch: batch.value,
    expiry_date: expiry_date.value || null
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
          <label class="block text-sm font-medium mb-1">Wholesale Price</label>
          <input v-model="wholesale_price" type="number" class="w-full p-2 border rounded" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Sales Price</label>
          <input v-model="sales_price" type="number" class="w-full p-2 border rounded" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Initial Stock</label>
          <input v-model="stock" type="number" class="w-full p-2 border rounded" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Low Stock Threshold</label>
          <input v-model="low_stock_threshold" type="number" class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Batch</label>
          <input v-model="batch" type="text" class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Expiry Date</label>
          <input v-model="expiry_date" type="date" class="w-full p-2 border rounded" required @keydown.prevent />
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