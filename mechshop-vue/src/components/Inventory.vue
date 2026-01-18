<script setup>
import { ref, onMounted, computed } from 'vue'
import AddPartModal from './AddPartModal.vue'
import {
  getInventory,
  addInventory,
  updateInventory,
  deleteInventory
} from '../api.js'

const props = defineProps({ setLoading: Function })

const inventory = ref([])
const showModal = ref(false)
const editId = ref(null)
const editPart = ref({})
const search = ref('')
const filterCategory = ref('')

async function loadInventory() {
  props.setLoading(true)
  inventory.value = await getInventory()
  props.setLoading(false)
}

function showAddPartModal() {
  showModal.value = true
}
function hideAddPartModal() {
  showModal.value = false
}

async function handleAddPart(newPart) {
  props.setLoading(true)
  // Ensure all required fields for backend
  const part = {
    name: newPart.name,
    category: newPart.category,
    stock: newPart.stock,
    wholesale_price: newPart.price || 0, // Use price as wholesale_price
    sales_price: newPart.price || 0,     // Use price as sales_price
    low_stock_threshold: 10,             // Default threshold
    batch: '',                           // Default empty
    expiry_date: null                    // Default null
  }
  await addInventory(part)
  await loadInventory()
  hideAddPartModal()
  props.setLoading(false)
}

function startEdit(part) {
  editId.value = part.id
  editPart.value = { ...part }
}
function cancelEdit() {
  editId.value = null
  editPart.value = {}
}
async function saveEdit() {
  props.setLoading(true)
  await updateInventory(editId.value, editPart.value)
  await loadInventory()
  cancelEdit()
  props.setLoading(false)
}

async function handleDelete(id) {
  if (confirm('Are you sure you want to delete this part?')) {
    props.setLoading(true)
    await deleteInventory(id)
    await loadInventory()
    props.setLoading(false)
  }
}

const filteredInventory = computed(() => {
  let items = inventory.value
  if (search.value) {
    items = items.filter(i => i.name.toLowerCase().includes(search.value.toLowerCase()))
  }
  if (filterCategory.value) {
    items = items.filter(i => i.category === filterCategory.value)
  }
  return items
})

onMounted(loadInventory)
</script>

<template>
  <div>
    <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
      <h2 class="text-2xl font-bold">Inventory Management</h2>
      <div class="flex gap-2">
        <input v-model="search" type="text" placeholder="Search parts..." class="p-2 border rounded" />
        <select v-model="filterCategory" class="p-2 border rounded">
          <option value="">All Categories</option>
          <option>Engine Parts</option>
          <option>Brake System</option>
          <option>Electrical</option>
        </select>
        <button @click="showAddPartModal" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add New Part
        </button>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2">Part Name</th>
              <th class="text-left py-2">Category</th>
              <th class="text-left py-2">Stock</th>
              <th class="text-left py-2">Batch</th>
              <th class="text-left py-2">Expiry</th>
              <th class="text-left py-2">Low Stock Threshold</th>
              <th class="text-left py-2">Prices</th>
              <th class="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredInventory" :key="item.id" :class="item.stock < item.low_stock_threshold ? 'bg-red-100' : ''">
              <td class="py-2">
                <template v-if="editId === item.id">
                  <input v-model="editPart.name" class="p-1 border rounded w-full" />
                </template>
                <template v-else>{{ item.name }}</template>
              </td>
              <td>
                <template v-if="editId === item.id">
                  <select v-model="editPart.category" class="p-1 border rounded w-full">
                    <option>Engine Parts</option>
                    <option>Brake System</option>
                    <option>Electrical</option>
                  </select>
                </template>
                <template v-else>{{ item.category }}</template>
              </td>
              <td>
                <template v-if="editId === item.id">
                  <input v-model.number="editPart.stock" type="number" class="p-1 border rounded w-full" />
                </template>
                <template v-else>
                  <span :class="item.stock < 10 ? 'text-red-500' : ''">{{ item.stock }}</span>
                </template>
              </td>
              <td>
                <template v-if="editId === item.id">
                  <input v-model="editPart.batch" class="p-1 border rounded w-full" />
                </template>
                <template v-else>{{ item.batch }}</template>
              </td>
              <td>
                <template v-if="editId === item.id">
                  <input v-model="editPart.expiry_date" type="date" class="p-1 border rounded w-full" />
                </template>
                <template v-else>{{ item.expiry_date }}</template>
              </td>
              <td>
                <template v-if="editId === item.id">
                  <input v-model.number="editPart.low_stock_threshold" type="number" class="p-1 border rounded w-full" />
                </template>
                <template v-else>{{ item.low_stock_threshold }}</template>
              </td>
              <td>
                <template v-if="editId === item.id">
                  <input v-model.number="editPart.wholesale_price" type="number" class="p-1 border rounded w-full" placeholder="Wholesale" />
                  <input v-model.number="editPart.sales_price" type="number" class="p-1 border rounded w-full mt-1" placeholder="Sales Price" />
                </template>
                <template v-else>
                  <div>Wholesale: ₹{{ item.wholesale_price }}</div>
                  <div>Sales: ₹{{ item.sales_price }}</div>
                </template>
              </td>
              <td>
                <template v-if="editId === item.id">
                  <button @click="saveEdit" class="text-green-600 hover:text-green-800 mr-2"><i class="bi bi-check-lg"></i></button>
                  <button @click="cancelEdit" class="text-gray-600 hover:text-gray-800"><i class="bi bi-x-lg"></i></button>
                </template>
                <template v-else>
                  <button @click="startEdit(item)" class="text-blue-600 hover:text-blue-800 mr-2"><i class="bi bi-pencil"></i></button>
                  <button @click="handleDelete(item.id)" class="text-red-600 hover:text-red-800"><i class="bi bi-trash"></i></button>
                </template>
              </td>
            </tr>
            <tr v-if="filteredInventory.length === 0">
              <td colspan="8" class="text-center py-4 text-gray-400">No parts found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AddPartModal v-if="showModal" @close="hideAddPartModal" @add-part="handleAddPart" />
  </div>
</template>