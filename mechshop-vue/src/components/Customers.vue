<script setup>
import { ref, onMounted } from 'vue'
import { getCustomers, addOrGetCustomer, getCustomerHistory, deleteCustomer } from '../api.js'

const props = defineProps({ setLoading: Function })
const customers = ref([])
const showAdd = ref(false)
const newCustomer = ref({ name: '', contact: '', phone: '' })
const showHistory = ref(false)
const history = ref([])
const historyCustomer = ref(null)
const userRole = localStorage.getItem('role') || 'admin'

async function loadCustomers() {
  props.setLoading(true)
  customers.value = await getCustomers()
  props.setLoading(false)
}

async function handleAddCustomer() {
  props.setLoading(true)
  await addOrGetCustomer(newCustomer.value)
  await loadCustomers()
  showAdd.value = false
  newCustomer.value = { name: '', contact: '', phone: '' }
  props.setLoading(false)
}

async function viewHistory(membership_no) {
  history.value = await getCustomerHistory(membership_no)
  historyCustomer.value = customers.value.find(c => c.membership_no === membership_no)
  showHistory.value = true
}

async function handleDeleteCustomer(membership_no) {
  if (confirm('Are you sure you want to delete this customer?')) {
    props.setLoading(true)
    await deleteCustomer(membership_no)
    await loadCustomers()
    props.setLoading(false)
  }
}

onMounted(loadCustomers)
</script>
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Customers</h2>
      <button @click="showAdd = !showAdd" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Customer</button>
    </div>
    <div v-if="showAdd" class="bg-white p-4 rounded mb-4">
      <form @submit.prevent="handleAddCustomer" class="flex flex-wrap gap-2 items-end">
        <input v-model="newCustomer.name" placeholder="Name" class="p-2 border rounded" required />
        <input v-model="newCustomer.contact" placeholder="Contact" class="p-2 border rounded" required />
        <input v-model="newCustomer.phone" placeholder="Phone" class="p-2 border rounded" required />
        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
      </form>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2">Membership #</th>
              <th class="text-left py-2">Name</th>
              <th class="text-left py-2">Contact</th>
              <th class="text-left py-2">Phone</th>
              <th class="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in customers" :key="customer.membership_no" class="border-b">
              <td class="py-2">{{ customer.membership_no }}</td>
              <td>{{ customer.name }}</td>
              <td>{{ customer.contact }}</td>
              <td>{{ customer.phone }}</td>
              <td>
                <button @click="viewHistory(customer.membership_no)" class="text-blue-600 hover:text-blue-800">History</button>
                <button v-if="userRole === 'admin'" @click="handleDeleteCustomer(customer.membership_no)" class="text-red-600 hover:text-red-800 ml-2">Delete</button>
              </td>
            </tr>
            <tr v-if="customers.length === 0">
              <td colspan="5" class="text-center py-4 text-gray-400">No customers found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <template v-if="showHistory">
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg w-96">
          <h3 class="text-xl font-bold mb-4">Purchase History for {{ historyCustomer?.name }}</h3>
          <ul>
            <li v-for="sale in history" :key="sale.id">
              {{ sale.date }} - {{ sale.items }} (Qty: {{ sale.quantity }}) - ₹{{ sale.total }}
            </li>
          </ul>
          <button @click="showHistory = false" class="mt-4 px-4 py-2 border rounded">Close</button>
        </div>
      </div>
    </template>
  </div>
</template> 