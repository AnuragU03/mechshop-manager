<script setup>
import { ref, onMounted } from 'vue'
import Inventory from './Inventory.vue'
import Sales from './Sales.vue'
import Customers from './Customers.vue'
import Reports from './Reports.vue'
import { getDashboard } from '../api.js'

const props = defineProps({
  user: Object,
  setLoading: Function
})
const emit = defineEmits(['logout'])

const currentSection = ref('home')
const dashboard = ref({
  total_sales: 0,
  inventory_count: 0,
  today_orders: 0,
  active_customers: 0,
  recent_sales: []
})

function showSection(section) {
  currentSection.value = section
}
function handleLogout() {
  emit('logout')
}

async function loadDashboard() {
  props.setLoading(true)
  dashboard.value = await getDashboard()
  props.setLoading(false)
}

onMounted(() => {
  if (currentSection.value === 'home') loadDashboard()
})
</script>

<template>
  <div>
    <!-- Top Navigation -->
    <nav class="bg-white shadow-sm h-16 flex items-center justify-between px-4">
      <div class="flex items-center">
        <h1 class="text-xl font-bold">MechShop Manager</h1>
      </div>
      <div class="flex items-center gap-4">
        <span class="font-medium">{{ props.user.username }}</span>
        <button @click="handleLogout" class="text-gray-600 hover:text-gray-800">
          <i class="bi bi-box-arrow-right text-xl"></i>
        </button>
      </div>
    </nav>

    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-sm sidebar no-print">
        <nav class="p-4 space-y-2">
          <button @click="showSection('home')" class="w-full text-left p-3 rounded hover:bg-gray-100 flex items-center gap-2">
            <i class="bi bi-house"></i> Dashboard
          </button>
          <button @click="showSection('inventory')" class="w-full text-left p-3 rounded hover:bg-gray-100 flex items-center gap-2">
            <i class="bi bi-box"></i> Inventory
          </button>
          <button @click="showSection('sales')" class="w-full text-left p-3 rounded hover:bg-gray-100 flex items-center gap-2">
            <i class="bi bi-cart"></i> Sales
          </button>
          <button @click="showSection('customers')" class="w-full text-left p-3 rounded hover:bg-gray-100 flex items-center gap-2">
            <i class="bi bi-people"></i> Customers
          </button>
          <button @click="showSection('reports')" class="w-full text-left p-3 rounded hover:bg-gray-100 flex items-center gap-2">
            <i class="bi bi-graph-up"></i> Reports
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-6">
        <section v-show="currentSection === 'home'">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-6 rounded-lg shadow-sm">
              <h3 class="text-gray-500 text-sm">Total Sales</h3>
              <p class="text-2xl font-bold">₹{{ dashboard.total_sales }}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm">
              <h3 class="text-gray-500 text-sm">Inventory Items</h3>
              <p class="text-2xl font-bold">{{ dashboard.inventory_count }}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm">
              <h3 class="text-gray-500 text-sm">Today's Orders</h3>
              <p class="text-2xl font-bold">{{ dashboard.today_orders }}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-sm">
              <h3 class="text-gray-500 text-sm">Active Customers</h3>
              <p class="text-2xl font-bold">{{ dashboard.active_customers }}</p>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-sm mt-6">
            <h3 class="text-lg font-semibold mb-4">Recent Sales</h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b">
                    <th class="text-left py-2">Bill No</th>
                    <th class="text-left py-2">Customer</th>
                    <th class="text-left py-2">Items</th>
                    <th class="text-left py-2">Amount</th>
                    <th class="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sale in dashboard.recent_sales" :key="sale.id" class="border-b">
                    <td class="py-2">#{{ sale.id }}</td>
                    <td>{{ sale.customer }}</td>
                    <td>{{ sale.items }}</td>
                    <td>₹{{ sale.total }}</td>
                    <td>{{ sale.date }}</td>
                  </tr>
                  <tr v-if="dashboard.recent_sales && dashboard.recent_sales.length === 0">
                    <td colspan="5" class="text-center py-4 text-gray-400">No sales found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <section v-show="currentSection === 'inventory'">
          <Inventory :set-loading="props.setLoading" />
        </section>
        <section v-show="currentSection === 'sales'">
          <Sales :set-loading="props.setLoading" />
        </section>
        <section v-show="currentSection === 'customers'">
          <Customers :set-loading="props.setLoading" />
        </section>
        <section v-show="currentSection === 'reports'">
          <Reports :set-loading="props.setLoading" />
        </section>
      </main>
    </div>
  </div>
</template>

<style>
.sidebar { height: calc(100vh - 64px); }
@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }
}
</style> 