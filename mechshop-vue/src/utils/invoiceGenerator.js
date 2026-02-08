import easyinvoice from 'easyinvoice';

// Format date to DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const generateInvoice = async (sale, customer, items) => {
  console.log('[invoiceGenerator] Starting invoice generation');
  console.log('[invoiceGenerator] Sale data:', JSON.stringify(sale, null, 2));
  console.log('[invoiceGenerator] Customer data:', JSON.stringify(customer, null, 2));
  console.log('[invoiceGenerator] Items data:', JSON.stringify(items, null, 2));
  
  try {
    // Ensure sale ID is a string and has a default value
    const saleId = (sale?.id || '0').toString();
    console.log('[invoiceGenerator] Using sale ID:', saleId);
    
    // Prepare items for the invoice
    const invoiceItems = (items || []).map((item, index) => {
      try {
        console.log(`[invoiceGenerator] Processing item ${index}:`, item);
        
        // Ensure all values are numbers and have proper fallbacks
        const quantity = Math.max(1, Number(item.quantity) || 1);
        const price = Math.max(0, Number(item.rate) || Number(item.price) || 0);
        const itemTotal = Math.max(0, Number(item.total) || (quantity * price) || 0);
        
        const processedItem = {
          quantity: quantity,
          description: String(item.description || item.name || 'Service/Product').substring(0, 100),
          price: price,
          'tax-rate': 0,
          total: itemTotal
        };
        
        console.log(`[invoiceGenerator] Processed item ${index}:`, processedItem);
        return processedItem;
      } catch (e) {
        console.error(`[invoiceGenerator] Error processing item ${index}:`, e, 'Item:', item);
        // Return a default item if there's an error
        return {
          quantity: 1,
          description: 'Service/Product',
          price: 0,
          'tax-rate': 0,
          total: 0
        };
      }
    });

    console.log('[invoiceGenerator] Processed all items:', invoiceItems);

    // Calculate totals with proper fallbacks
    const subtotal = invoiceItems.reduce((sum, item) => {
      const itemTotal = Number(item.quantity) * Number(item.price);
      console.log(`[invoiceGenerator] Adding to subtotal: ${item.quantity} x ${item.price} = ${itemTotal}`);
      return sum + itemTotal;
    }, 0);
    
    console.log('[invoiceGenerator] Subtotal:', subtotal);
    
    const taxRate = 0; // 0% tax as per example
    const tax = 0; // No tax in the example
    const total = subtotal + tax;
    
    console.log('[invoiceGenerator] Calculated total:', total);

    // Prepare invoice data
    console.log('[invoiceGenerator] Preparing invoice data...');
    
    const invoiceData = {
      images: {
        // Optional: Add your logo here
        // logo: "data:image/png;base64,...",
      },
      // Sender information
      sender: {
        company: "MechShop",
        address: "123 Auto Street, Mechanic City",
        zip: "10001",
        city: "Mechanic City",
        country: "India",
        custom1: "GSTIN: 22ABCDE1234F1Z5",
        custom2: "PAN: ABCDE1234F"
      },
      // Customer information with fallbacks
      client: {
        company: customer?.name || 'Walk-in Customer',
        custom1: `Membership: ${customer?.membership_no || 'N/A'}`,
        custom2: `Contact: ${customer?.contact || 'N/A'}`,
        custom3: `Email: ${customer?.email || 'N/A'}`
      },
      // Invoice information
      information: {
        number: `INV-${saleId.padStart(6, '0')}`,
        date: formatDate(sale?.date || new Date()),
        'due-date': formatDate(new Date())
      },
      // Invoice items
      products: invoiceItems,
      // Bottom notice
      'bottom-notice': 'Thank you for shopping with us!',
      // Settings
      settings: {
        currency: 'INR',
        'tax-notation': 'GST',
        'margin-top': 50,
        'margin-right': 50,
        'margin-left': 50,
        'margin-bottom': 50,
        'format': 'A4',
        'height': '210mm',
        'width': '100%',
        'orientation': 'portrait',
      },
      // Customize the appearance
      'custom': {
        'header': {
          'title': 'TAX INVOICE',
          'style': {
            'font-size': 16,
            'font-weight': 'bold',
            'text-align': 'center',
            'margin-bottom': '20px'
          }
        },
        'table': {
          'header': {
            'style': {
              'background-color': '#f5f5f5',
              'font-weight': 'bold'
            }
          },
          'body': {
            'style': {
              'border': '1px solid #ddd'
            }
          }
        },
        'total': {
          'style': {
            'font-weight': 'bold',
            'border-top': '2px solid #000',
            'border-bottom': '2px solid #000'
          }
        }
      }
    };
    
    console.log('[invoiceGenerator] Invoice data prepared:', JSON.stringify(invoiceData, null, 2));
    
    // Generate the invoice
    console.log('[invoiceGenerator] Starting PDF generation with data:', JSON.stringify({
      ...invoiceData,
      products: invoiceData.products.map(p => ({
        ...p,
        // Truncate long descriptions for logging
        description: p.description ? `${p.description.substring(0, 30)}${p.description.length > 30 ? '...' : ''}` : ''
      }))
    }, null, 2));
    
    const result = await easyinvoice.createInvoice(invoiceData);
    
    if (!result) {
      throw new Error('No result returned from easyinvoice.createInvoice()');
    }
    
    console.log('[invoiceGenerator] PDF generation result:', {
      hasPdf: !!result.pdf,
      pdfLength: result.pdf ? result.pdf.length : 0,
      resultKeys: Object.keys(result)
    });
    
    if (!result.pdf) {
      throw new Error('Generated PDF is empty or invalid');
    }
    
    // Verify the PDF data looks like a valid base64 string
    if (!/^[A-Za-z0-9+/=]+$/.test(result.pdf)) {
      console.error('[invoiceGenerator] Invalid PDF data format:', result.pdf.substring(0, 100));
      throw new Error('Generated PDF data is not in valid base64 format');
    }
    
    console.log('[invoiceGenerator] PDF generated successfully');
    return result.pdf;
    
  } catch (error) {
    console.error('[invoiceGenerator] Error in invoice generation:', {
      error: error.toString(),
      message: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to generate invoice: ${error.message}`);
  }
};

export const downloadInvoice = (base64Pdf, filename = 'invoice.pdf') => {
  // Create a link element
  const link = document.createElement('a');
  
  // Set the href to the base64 PDF
  link.href = `data:application/pdf;base64,${base64Pdf}`;
  
  // Set the download attribute with the filename
  link.download = filename;
  
  // Append the link to the body
  document.body.appendChild(link);
  
  // Trigger a click on the link
  link.click();
  
  // Remove the link from the document
  document.body.removeChild(link);
};
