<script setup>
import { ref, onMounted } from 'vue'
import { getSales, addSale, getInventory, getCustomerByPhone, addOrGetCustomer, getInvoice } from '../api.js'

const props = defineProps({ setLoading: Function })
const sales = ref([])
const showAdd = ref(false)
const inventory = ref([])
const customerPhone = ref('')
const customer = ref({ membership_no: '', name: '', contact: '', phone: '' })
const newSale = ref({ items: '', quantity: 1, rate: 0, total: 0 })
const customerNotFound = ref(false)
const showInvoice = ref(false)
const invoice = ref(null)

async function loadSales() {
  props.setLoading(true)
  sales.value = await getSales()
  props.setLoading(false)
}
async function loadInventory() {
  inventory.value = await getInventory()
}

async function onPhoneChange() {
  if (!customerPhone.value) return
  const found = await getCustomerByPhone(customerPhone.value)
  if (found) {
    customer.value = found
    customerNotFound.value = false
  } else {
    customer.value = { membership_no: '', name: '', contact: '', phone: customerPhone.value }
    customerNotFound.value = true
  }
}

function onItemChange() {
  const item = inventory.value.find(i => i.name === newSale.value.items)
  newSale.value.rate = item ? item.sales_price : 0
  updateTotal()
}
function updateTotal() {
  newSale.value.total = newSale.value.rate * newSale.value.quantity
}

async function handleAddSale() {
  props.setLoading(true)
  let cust = customer.value
  if (!cust.membership_no) {
    cust = await addOrGetCustomer({ name: cust.name, contact: cust.contact, phone: cust.phone })
  }
  await addSale({
    membership_no: cust.membership_no,
    items: newSale.value.items,
    quantity: newSale.value.quantity
  })
  await loadSales()
  showAdd.value = false
  customerPhone.value = ''
  customer.value = { membership_no: '', name: '', contact: '', phone: '' }
  newSale.value = { items: '', quantity: 1, rate: 0, total: 0 }
  customerNotFound.value = false
  props.setLoading(false)
}

async function viewInvoice(saleId) {
  invoice.value = await getInvoice(saleId)
  showInvoice.value = true
}

onMounted(() => {
  loadSales()
  loadInventory()
})
</script>
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Sales</h2>
      <button @click="showAdd = !showAdd" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Sale</button>
    </div>
    <div v-if="showAdd" class="bg-white p-4 rounded mb-4">
      <form @submit.prevent="handleAddSale" class="flex flex-wrap gap-2 items-end">
        <input v-model="customerPhone" @blur="onPhoneChange" placeholder="Customer Phone" class="p-2 border rounded" required />
        <input v-model="customer.name" :readonly="!customerNotFound" placeholder="Customer Name" class="p-2 border rounded" required />
        <input v-model="customer.contact" :readonly="!customerNotFound" placeholder="Contact" class="p-2 border rounded" required />
        <span v-if="customer.membership_no" class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Membership #: {{ customer.membership_no }}</span>
        <select v-model="newSale.items" @change="onItemChange" class="p-2 border rounded" required>
          <option value="" disabled>Select Item</option>
          <option v-for="item in inventory" :key="item.id" :value="item.name">{{ item.name }}</option>
        </select>
        <input v-model.number="newSale.quantity" @input="updateTotal" type="number" min="1" placeholder="Qty" class="p-2 border rounded w-20" required />
        <input v-model="newSale.rate" type="number" class="p-2 border rounded w-24" readonly placeholder="Rate" />
        <input v-model="newSale.total" type="number" class="p-2 border rounded w-28" readonly placeholder="Total" />
        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
      </form>
      <div v-if="customerNotFound" class="text-yellow-600 text-sm mt-2">New customer. Please enter name and contact.</div>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2">Bill No</th>
              <th class="text-left py-2">Membership #</th>
              <th class="text-left py-2">Customer</th>
              <th class="text-left py-2">Item</th>
              <th class="text-left py-2">Qty</th>
              <th class="text-left py-2">Rate</th>
              <th class="text-left py-2">Total</th>
              <th class="text-left py-2">Date</th>
              <th class="text-left py-2">Invoice</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in sales" :key="sale.id" class="border-b">
              <td class="py-2">#{{ sale.id }}</td>
              <td>{{ sale.customer }}</td>
              <td><!-- Optionally fetch/display customer name here --></td>
              <td>{{ sale.items }}</td>
              <td>{{ sale.quantity }}</td>
              <td>₹{{ sale.rate }}</td>
              <td>₹{{ sale.total }}</td>
              <td>{{ sale.date }}</td>
              <td>
                <button @click="viewInvoice(sale.id)" class="text-blue-600 hover:text-blue-800">Invoice</button>
              </td>
            </tr>
            <tr v-if="sales.length === 0">
              <td colspan="9" class="text-center py-4 text-gray-400">No sales found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <template v-if="showInvoice">
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg w-96">
          <h3 class="text-xl font-bold mb-4">Invoice</h3>
          <div v-if="invoice">
            <div>Bill No: #{{ invoice.sale.id }}</div>
            <div>Customer: {{ invoice.customer.name }}</div>
            <div>Phone: {{ invoice.customer.phone }}</div>
            <div>Date: {{ invoice.sale.date }}</div>
            <div>Item: {{ invoice.sale.items }}</div>
            <div>Qty: {{ invoice.sale.quantity }}</div>
            <div>Rate: ₹{{ invoice.sale.rate }}</div>
            <div>Total: ₹{{ invoice.sale.total }}</div>
          </div>
          <button @click="showInvoice = false" class="mt-4 px-4 py-2 border rounded">Close</button>
        </div>
      </div>
    </template>
  </div>
</template> 