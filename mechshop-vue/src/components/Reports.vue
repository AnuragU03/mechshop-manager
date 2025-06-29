<script setup>
import { ref, onMounted } from 'vue'
import { getReports } from '../api.js'

const props = defineProps({ setLoading: Function })
const filter = ref({ start: '', end: '', customer: '', item: '' })
const reports = ref({ total_sales: 0, total_purchases: 0, profit: 0, best_selling: null, low_stock: [] })

async function loadReports() {
  props.setLoading(true)
  reports.value = await getReports(filter.value)
  props.setLoading(false)
}

function exportCSV() {
  // Implement CSV export logic here
  alert('CSV export not implemented in this demo.');
}

onMounted(loadReports)
</script>
<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Reports</h2>
    <div class="flex gap-2 mb-4">
      <input v-model="filter.start" type="date" class="p-2 border rounded" />
      <input v-model="filter.end" type="date" class="p-2 border rounded" />
      <input v-model="filter.customer" placeholder="Membership #" class="p-2 border rounded" />
      <input v-model="filter.item" placeholder="Item" class="p-2 border rounded" />
      <button @click="loadReports" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Filter</button>
      <button @click="exportCSV" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Export CSV</button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-gray-500 text-sm">Total Sales</h3>
        <p class="text-2xl font-bold">₹{{ reports.total_sales }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-gray-500 text-sm">Total Purchases</h3>
        <p class="text-2xl font-bold">₹{{ reports.total_purchases }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-gray-500 text-sm">Profit</h3>
        <p class="text-2xl font-bold">₹{{ reports.profit }}</p>
      </div>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h3 class="text-lg font-semibold mb-2">Best Selling Item</h3>
      <div v-if="reports.best_selling">
        <p><strong>{{ reports.best_selling.items }}</strong> ({{ reports.best_selling.qty }} sold)</p>
      </div>
      <div v-else class="text-gray-400">No sales data.</div>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <h3 class="text-lg font-semibold mb-2">Low Stock Items</h3>
      <table class="w-full">
        <thead>
          <tr class="border-b">
            <th class="text-left py-2">Item</th>
            <th class="text-left py-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in reports.low_stock" :key="item.id" class="border-b">
            <td class="py-2">{{ item.name }}</td>
            <td>{{ item.stock }}</td>
          </tr>
          <tr v-if="reports.low_stock.length === 0">
            <td colspan="2" class="text-center py-4 text-gray-400">No low stock items.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template> 