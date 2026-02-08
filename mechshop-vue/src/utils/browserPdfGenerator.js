import { jsPDF } from 'jspdf';

const generateInvoice = (invoice, customer, items) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Set initial y position
      let y = 20;
  
      // Add header
      doc.setFontSize(20);
      doc.text('MechShop', 15, y);
      doc.setFontSize(10);
      doc.text('123 Auto Street', 160, y, { align: 'right' });
      doc.text('Mechanic City, 10001', 160, y + 5, { align: 'right' });
      
      // Add invoice title
      y += 20;
      doc.setFontSize(20);
      doc.text('INVOICE', 15, y);
      
      // Add invoice info
      y += 20;
      doc.setFontSize(10);
      doc.text(`Invoice #: ${invoice.invoice_number}`, 15, y);
      doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 15, y + 5);
      
      // Add customer info
      doc.text('Bill To:', 15, y + 20);
      doc.setFont('helvetica', 'bold');
      doc.text(customer?.name || 'Walk-in Customer', 15, y + 27);
      doc.setFont('helvetica', 'normal');
      doc.text(`Contact: ${customer?.contact || 'N/A'}`, 15, y + 32);
      
      // Add items table header
      y += 60;
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(240, 240, 240);
      doc.rect(15, y - 10, 180, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Item', 16, y - 3);
      doc.text('Description', 60, y - 3);
      doc.text('Qty', 120, y - 3, { align: 'right' });
      doc.text('Rate', 150, y - 3, { align: 'right' });
      doc.text('Total', 180, y - 3, { align: 'right' });
      
      // Add items
      doc.setFont('helvetica', 'normal');
      let total = 0;
      
      items.forEach((item, index) => {
        const itemY = y + (index * 10);
        const itemTotal = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
        total += itemTotal;
        
        doc.text(String(item.name || 'Service/Product'), 16, itemY + 15);
        doc.text(String(item.description || '-'), 60, itemY + 15);
        doc.text(String(Number(item.quantity) || 0), 120, itemY + 15, { align: 'right' });
        doc.text(`₹${(Number(item.rate) || 0).toFixed(2)}`, 150, itemY + 15, { align: 'right' });
        doc.text(`₹${itemTotal.toFixed(2)}`, 180, itemY + 15, { align: 'right' });
        
        // Add separator line
        doc.line(15, itemY + 20, 195, itemY + 20);
      });
      
      // Add total
      const totalY = y + (items.length * 10) + 25;
      doc.setFont('helvetica', 'bold');
      doc.text('Total:', 150, totalY, { align: 'right' });
      doc.text(`₹${(Number(invoice.total) || 0).toFixed(2)}`, 180, totalY, { align: 'right' });
  
      // Add footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Thank you for your business!', 105, 280, { align: 'center' });
      
      // Generate and return the PDF as a base64 string
      const pdfOutput = doc.output('datauristring');
      // Extract just the base64 part from the data URL
      const base64Data = pdfOutput.split(',')[1];
      
      // Make sure we have valid base64 data
      if (!base64Data) {
        throw new Error('Failed to generate PDF data');
      }
      
      resolve(base64Data);
    } catch (error) {
      console.error('Error in PDF generation:', error);
      reject(error);
    }
  });
};

export default { generateInvoice };
