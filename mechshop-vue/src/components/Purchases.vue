<script setup>
import { ref, onMounted } from 'vue'
import { getPurchases, addPurchase, getInventory } from '../api.js'

const props = defineProps({ setLoading: Function })
const purchases = ref([])
const showAdd = ref(false)
const inventory = ref([])
const newPurchase = ref({ items: '', quantity: 1, date_of_purchase: '', wholesale_amount: 0, sales_price: 0 })

async function loadPurchases() {
  props.setLoading(true)
  purchases.value = await getPurchases()
  props.setLoading(false)
}
async function loadInventory() {
  inventory.value = await getInventory()
}

function onItemChange() {
  const item = inventory.value.find(i => i.name === newPurchase.value.items)
  if (item) {
    newPurchase.value.sales_price = item.sales_price
    newPurchase.value.wholesale_amount = item.wholesale_price
  }
}

async function handleAddPurchase() {
  props.setLoading(true)
  await addPurchase({
    supplier: '', // No supplier field now
    items: newPurchase.value.items,
    quantity: newPurchase.value.quantity,
    date_of_purchase: newPurchase.value.date_of_purchase,
    wholesale_amount: newPurchase.value.wholesale_amount,
    sales_price: newPurchase.value.sales_price
  })
  await loadPurchases()
  showAdd.value = false
  newPurchase.value = { items: '', quantity: 1, date_of_purchase: '', wholesale_amount: 0, sales_price: 0 }
  props.setLoading(false)
}

onMounted(() => {
  loadPurchases()
  loadInventory()
})
</script>
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Purchases</h2>
      <button @click="showAdd = !showAdd" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Purchase</button>
    </div>
    <div v-if="showAdd" class="bg-white p-4 rounded mb-4">
      <form @submit.prevent="handleAddPurchase" class="flex flex-wrap gap-2 items-end">
        <select v-model="newPurchase.items" @change="onItemChange" class="p-2 border rounded" required>
          <option value="" disabled>Select Item</option>
          <option v-for="item in inventory" :key="item.id" :value="item.name">{{ item.name }}</option>
        </select>
        <input v-model.number="newPurchase.quantity" type="number" min="1" placeholder="Qty" class="p-2 border rounded w-20" required />
        <input v-model="newPurchase.date_of_purchase" type="date" class="p-2 border rounded w-36" required />
        <input v-model.number="newPurchase.wholesale_amount" type="number" placeholder="Wholesale" class="p-2 border rounded w-28" required />
        <input v-model.number="newPurchase.sales_price" type="number" placeholder="Sales Price" class="p-2 border rounded w-28" required />
        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
      </form>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2">Item</th>
              <th class="text-left py-2">Qty</th>
              <th class="text-left py-2">Date</th>
              <th class="text-left py-2">Wholesale</th>
              <th class="text-left py-2">Sales Price</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="purchase in purchases" :key="purchase.id" class="border-b">
              <td class="py-2">{{ purchase.items }}</td>
              <td>{{ purchase.quantity }}</td>
              <td>{{ purchase.date_of_purchase }}</td>
              <td>₹{{ purchase.wholesale_amount }}</td>
              <td>₹{{ purchase.sales_price }}</td>
            </tr>
            <tr v-if="purchases.length === 0">
              <td colspan="5" class="text-center py-4 text-gray-400">No purchases found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template> 