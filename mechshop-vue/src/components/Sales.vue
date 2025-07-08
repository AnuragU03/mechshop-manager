<script setup>
import { ref, onMounted, computed } from 'vue'
import { getSales, addSale, getInventory, getCustomerByContact, getCustomerById, addOrGetCustomer, deleteSale } from '../api'
import { saveInvoice, getInvoiceBySaleId, downloadInvoicePdf } from '../api/invoices'
import pdfGenerator from '../utils/browserPdfGenerator'

const props = defineProps({ setLoading: Function })
const sales = ref([])
const showAdd = ref(false)
const inventory = ref([])
const customerContact = ref('')
const customer = ref({ membership_no: '', name: '', contact: '' })
const newSale = ref({ items: '', quantity: 1, rate: 0, total: 0 })
const customerNotFound = ref(false)
const showInvoice = ref(false)
const invoice = ref(null)
const userRole = localStorage.getItem('role') || 'admin'

async function loadSales() {
  props.setLoading(true)
  sales.value = await getSales()
  props.setLoading(false)
}
async function loadInventory() {
  inventory.value = await getInventory()
}

async function onContactChange() {
  if (!customerContact.value) return
  const found = await getCustomerByContact(customerContact.value)
  if (found) {
    customer.value = found
    customerNotFound.value = false
  } else {
    customer.value = { membership_no: '', name: '', contact: customerContact.value }
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
  try {
    props.setLoading(true)
    
    // Ensure customer exists or create a new one
    let customerData = { ...customer.value }
    if (customerNotFound.value) {
      customerData = await addOrGetCustomer(customer.value)
      customer.value = customerData
    }
    let cust = customer.value
    if (!cust.membership_no) {
      cust = await addOrGetCustomer({ name: cust.name, contact: cust.contact })
    }
    
    // Create the sale
    const sale = await addSale({
      membership_no: customerData.membership_no,
      customer: customerData.name,
      items: newSale.value.items,
      quantity: newSale.value.quantity,
      rate: newSale.value.rate,
      total: newSale.value.total
    })

    try {
      // Generate invoice data
      const invoiceResult = await generateInvoice(
        {
          id: sale.id,
          date: new Date().toISOString().split('T')[0],
          invoice_number: `INV-${sale.id}-${Date.now()}`,
          total: newSale.value.total
        },
        {
          ...customerData,
          name: customerData.name || 'Walk-in Customer',
          contact: customerData.contact || ''
        },
        [{
          name: newSale.value.items,
          description: newSale.value.items,
          quantity: Number(newSale.value.quantity) || 1,
          price: Number(newSale.value.rate) || 0,
          total: Number(newSale.value.total) || 0
        }]
      );

      if (invoiceResult && sale && sale.id) {
        try {
          // Save the invoice PDF to the server
          console.log('Saving invoice for sale ID:', sale.id);
          const saveResult = await saveInvoice(sale.id, invoiceResult);
          
          if (saveResult && saveResult.success) {
            console.log('Invoice saved successfully, downloading...');
            // Download the invoice
            const downloadResult = await downloadInvoicePdf(sale.id);
            if (downloadResult && downloadResult.success && downloadResult.blob) {
              const url = window.URL.createObjectURL(downloadResult.blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `invoice_${sale.id}.pdf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
              return;
            } else {
              console.warn('Download result was not as expected:', downloadResult);
            }
          } else {
            console.warn('Failed to save invoice, saving locally instead:', saveResult?.error);
          }
          
          // Fallback to local download if server save/download fails
          const pdfBase64 = invoiceResult.startsWith('data:') 
            ? invoiceResult.split('base64,')[1] 
            : invoiceResult;
            
          console.log('Attempting local download with base64 data');
          const a = document.createElement('a');
          a.href = `data:application/pdf;base64,${pdfBase64}`;
          a.download = `invoice_${sale.id}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
        } catch (error) {
          console.error('Error in invoice handling:', error);
          // Try to save locally even if there's an error
          try {
            const pdfBase64 = invoiceResult.startsWith('data:') 
              ? invoiceResult.split('base64,')[1] 
              : invoiceResult;
            const a = document.createElement('a');
            a.href = `data:application/pdf;base64,${pdfBase64}`;
            a.download = `invoice_${sale.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            alert('Invoice downloaded locally due to an error');
          } catch (localError) {
            console.error('Failed to save invoice locally:', localError);
            alert('Failed to process invoice. Please try again.');
          }
          throw error;
        }
      }
    } catch (error) {
      console.error('Error in invoice process:', error);
      // Continue with the sale even if invoice generation fails
    }
    
    // Reset form and reload sales
    await loadSales()
    showAdd.value = false
    customerContact.value = ''
    customer.value = { membership_no: '', name: '', contact: '' }
    newSale.value = { items: '', quantity: 1, rate: 0, total: 0 }
    customerNotFound.value = false
  } catch (error) {
    console.error('Error creating sale:', error)
    alert('Failed to create sale. Please try again.')
  } finally {
    props.setLoading(false)
  }
}

// Track loading state for the invoice generation
const invoiceLoading = ref({});

async function viewInvoice(saleId) {
  try {
    // Set loading state for this specific invoice
    invoiceLoading.value[saleId] = true;
    
    // Show loading indicator
    props.setLoading(true, 'Loading sale details...');
    
    // Get the sale details
    const sale = sales.value.find(s => s.id == saleId);
    if (!sale) {
      throw new Error('Sale not found');
    }
    
    // First try to get the invoice from the server
    const { success: hasInvoice, data: existingInvoice } = await getInvoiceBySaleId(saleId);
    
    if (hasInvoice && existingInvoice?.pdf_data) {
      try {
        // If we have saved invoice data, display it
        const pdfDataUrl = `data:application/pdf;base64,${existingInvoice.pdf_data}`;
        window.open(pdfDataUrl, '_blank');
        return;
      } catch (error) {
        console.warn('Error displaying saved invoice, generating new one:', error);
        // Continue to generate a new one if display fails
      }
    }
    
    // Get customer details if available
    let customerData = {
      name: 'Walk-in Customer',
      contact: 'N/A'
    };
    
    if (sale.customer_id) {
      try {
        console.log(`Fetching customer with ID: ${sale.customer_id}`);
        const customerResponse = await getCustomerById(sale.customer_id);
        console.log('Customer response:', customerResponse);
        
        if (customerResponse) {
          customerData = {
            name: customerResponse.name || 'Walk-in Customer',
            contact: customerResponse.contact || 'N/A',
            ...customerResponse
          };
        }
      } catch (error) {
        console.warn('Error fetching customer:', error);
      }
    } else if (sale.contact) {
      // Fallback to contact if customer_id is not available
      customerData.contact = sale.contact;
    }
    
    // Prepare items array for the invoice
    let items = [];
    try {
      if (Array.isArray(sale.items)) {
        items = sale.items;
      } else if (typeof sale.items === 'string' && sale.items.trim().startsWith('[')) {
        items = JSON.parse(sale.items);
      } else {
        items = [{
          name: sale.items || 'Service/Product',
          description: sale.description || 'Service/Product',
          quantity: Number(sale.quantity) || 1,
          rate: Number(sale.rate) || 0,
          total: Number(sale.total) || 0
        }];
      }
    } catch (e) {
      console.error('Error parsing items:', e);
      items = [{
        name: 'Service/Product',
        description: 'Service/Product',
        quantity: Number(sale.quantity) || 1,
        rate: Number(sale.rate) || 0,
        total: Number(sale.total) || 0
      }];
    }
    
    // Generate invoice data
    const invoiceData = {
      id: sale.id,
      invoice_number: `INV-${sale.id.toString().padStart(6, '0')}`,
      date: sale.date || new Date().toISOString(),
      total: Number(sale.total) || 0
    };
    
    console.log('Generating invoice with data:', { 
      invoiceData, 
      customer: customerData, 
      items,
      itemsType: items.map(i => ({
        name: typeof i.name,
        quantity: typeof i.quantity,
        rate: typeof i.rate,
        total: typeof i.total
      }))
    });
    
    try {
      // Generate the PDF
      props.setLoading(true, 'Generating invoice...');
      console.log('Calling pdfGenerator.generateInvoice...');
      
      const pdfBase64 = await pdfGenerator.generateInvoice(invoiceData, customerData, items);
      console.log('PDF generated, base64 length:', pdfBase64?.length);
      
      if (!pdfBase64) {
        throw new Error('Failed to generate invoice PDF: No PDF data returned');
      }
      
      // Save the generated invoice
      try {
        props.setLoading(true, 'Saving invoice...');
        console.log('Saving invoice to database...');
        const saveResult = await saveInvoice(sale.id, pdfBase64);
        console.log('Save result:', saveResult);
        
        if (!saveResult?.success) {
          throw new Error(saveResult?.error || 'Failed to save invoice');
        }
      } catch (saveError) {
        console.warn('Error saving invoice, but will still display it:', saveError);
        // Continue to show the PDF even if saving fails
      }
      
      // Display the generated PDF
      console.log('Preparing to display PDF...');
      const pdfDataUrl = `data:application/pdf;base64,${pdfBase64}`;
      console.log('PDF data URL created, length:', pdfDataUrl.length);
      
      // Try to open in a new tab
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Invoice ${invoiceData.invoice_number}</title></head>
            <body style="margin: 0; padding: 0;">
              <iframe 
                src="${pdfDataUrl}" 
                style="width: 100%; height: 100vh; border: none;"
              ></iframe>
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        // Fallback to direct download
        console.warn('Popup blocked, falling back to download');
        const link = document.createElement('a');
        link.href = pdfDataUrl;
        link.download = `invoice-${invoiceData.invoice_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new Error(`Failed to generate invoice: ${error.message}`);
    }
    
  } catch (error) {
    console.error('Error in viewInvoice:', error);
    alert(`Error: ${error.message}`);
  } finally {
    // Clear loading state
    invoiceLoading.value[saleId] = false;
    props.setLoading(false);
  }
}

async function handleDeleteSale(id) {
  if (confirm('Are you sure you want to delete this sale?')) {
    props.setLoading(true)
    await deleteSale(id)
    await loadSales()
    props.setLoading(false)
  }
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
        <input v-model="customerContact" @blur="onContactChange" placeholder="Customer Contact (Phone/Email)" class="p-2 border rounded" required />
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
              <th class="text-left py-2">Actions</th>
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
              <td class="flex items-center space-x-2">
                <button 
                  @click="viewInvoice(sale.id)" 
                  :disabled="invoiceLoading[sale.id]"
                  class="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="invoiceLoading[sale.id]" class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ invoiceLoading[sale.id] ? 'Processing...' : 'View Invoice' }}</span>
                </button>
                <button 
                  v-if="userRole === 'admin'" 
                  @click="handleDeleteSale(sale.id)" 
                  class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                >
                  Delete
                </button>
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
            <div>Customer: {{ invoice.customer ? invoice.customer.name : 'Deleted Customer' }}</div>
            <div>Contact: {{ invoice.customer ? invoice.customer.contact : 'N/A' }}</div>
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