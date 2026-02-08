import { API_URL, authHeaders } from './config';

/**
 * Save an invoice PDF to the server
 * @param {number} saleId - The ID of the sale
 * @param {string} pdfData - Base64 encoded PDF data
 * @returns {Promise<{success: boolean, message?: string, error?: string}>} Response from the server
 */
export async function saveInvoice(saleId, pdfData) {
  try {
    if (!saleId || !pdfData) {
      throw new Error('Missing required parameters: saleId and pdfData are required');
    }

    // Ensure the PDF data is in the correct format
    const formattedPdfData = pdfData.startsWith('data:') 
      ? pdfData 
      : `data:application/pdf;base64,${pdfData}`;

    const res = await fetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({
        sale_id: saleId,
        pdf_data: formattedPdfData
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error saving invoice:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to save invoice',
      details: error
    };
  }
}

/**
 * Get an invoice by sale ID
 * @param {number} saleId - The ID of the sale
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>} Invoice data
 */
export async function getInvoiceBySaleId(saleId) {
  try {
    if (!saleId) {
      throw new Error('saleId is required');
    }

    const res = await fetch(`${API_URL}/invoices/${saleId}`, {
      headers: authHeaders()
    });

    if (!res.ok) {
      if (res.status === 404) {
        return { success: true, data: null }; // Invoice not found
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to fetch invoice',
      details: error
    };
  }
}

/**
 * Download the PDF for an invoice
 * @param {number} saleId - The ID of the sale
 * @returns {Promise<{success: boolean, blob?: Blob, error?: string}>} PDF blob
 */
export async function downloadInvoicePdf(saleId) {
  try {
    if (!saleId) {
      throw new Error('saleId is required');
    }

    const res = await fetch(`${API_URL}/invoices/${saleId}/pdf`, {
      headers: authHeaders()
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    const blob = await res.blob();
    return { success: true, blob };
  } catch (error) {
    console.error('Error downloading invoice PDF:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to download invoice PDF',
      details: error
    };
  }
}

/**
 * Get invoice data for a sale (sale + customer info)
 * @param {number} saleId - The ID of the sale
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>} Invoice data including sale and customer info
 */
export async function getInvoiceData(saleId) {
  try {
    if (!saleId) {
      throw new Error('saleId is required');
    }

    const res = await fetch(`${API_URL}/sales/${saleId}/invoice`, {
      headers: authHeaders()
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to fetch invoice data',
      details: error
    };
  }
  if (!res.ok) {
    throw new Error('Failed to fetch invoice data');
  }
  return await res.json();
}
