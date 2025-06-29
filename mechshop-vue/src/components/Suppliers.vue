<script setup>
import { ref, onMounted } from 'vue'
import { getSuppliers, addSupplier } from '../api.js'

const props = defineProps({ setLoading: Function })
const suppliers = ref([])
const showAdd = ref(false)
const newSupplier = ref({ name: '', contact: '' })

async function loadSuppliers() {
  props.setLoading(true)
  suppliers.value = await getSuppliers()
  props.setLoading(false)
}

async function handleAddSupplier() {
  props.setLoading(true)
  await addSupplier(newSupplier.value)
  await loadSuppliers()
  showAdd.value = false
  newSupplier.value = { name: '', contact: '' }
  props.setLoading(false)
}

onMounted(loadSuppliers)
</script>
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Suppliers</h2>
      <button @click="showAdd = !showAdd" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Supplier</button>
    </div>
    <div v-if="showAdd" class="bg-white p-4 rounded mb-4">
      <form @submit.prevent="handleAddSupplier" class="flex flex-wrap gap-2 items-end">
        <input v-model="newSupplier.name" placeholder="Name" class="p-2 border rounded" required />
        <input v-model="newSupplier.contact" placeholder="Contact" class="p-2 border rounded" required />
        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
      </form>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2">Name</th>
              <th class="text-left py-2">Contact</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="supplier in suppliers" :key="supplier.id" class="border-b">
              <td class="py-2">{{ supplier.name }}</td>
              <td>{{ supplier.contact }}</td>
            </tr>
            <tr v-if="suppliers.length === 0">
              <td colspan="2" class="text-center py-4 text-gray-400">No suppliers found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template> 