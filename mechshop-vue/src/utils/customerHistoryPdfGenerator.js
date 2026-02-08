import { jsPDF } from 'jspdf';

const generateCustomerHistoryPdf = (customer, history) => {
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
      
      // Add title
      y += 20;
      doc.setFontSize(16);
      doc.text('CUSTOMER HISTORY', 15, y);
      
      // Add customer info
      y += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Details:', 15, y);
      doc.setFont('helvetica', 'normal');
      y += 8;
      doc.text(`Name: ${customer.name || 'N/A'}`, 20, y);
      y += 6;
      doc.text(`Contact: ${customer.contact || 'N/A'}`, 20, y);
      y += 6;
      doc.text(`Member Since: ${new Date(customer.created_at).toLocaleDateString() || 'N/A'}`, 20, y);
      
      // Add history section
      y += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('Service History', 15, y);
      y += 10;
      
      // Add table header
      doc.setFillColor(240, 240, 240);
      doc.rect(15, y - 5, 180, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Date', 16, y + 2);
      doc.text('Service', 60, y + 2);
      doc.text('Amount', 160, y + 2, { align: 'right' });
      
      // Add history items
      doc.setFont('helvetica', 'normal');
      y += 10;
      
      if (history.length === 0) {
        doc.text('No history available', 20, y + 10);
      } else {
        let totalSpent = 0;
        
        history.forEach((item, index) => {
          if (y > 250) {
            doc.addPage();
            y = 20;
          }
          
          const date = new Date(item.date || item.created_at).toLocaleDateString();
          const amount = Number(item.total) || 0;
          totalSpent += amount;
          
          doc.text(date, 16, y + 5);
          doc.text(item.items || 'Service/Product', 60, y + 5);
          doc.text(`₹${amount.toFixed(2)}`, 180, y + 5, { align: 'right' });
          
          y += 8;
          doc.line(15, y, 195, y);
          y += 5;
        });
        
        // Add total
        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Total Spent:', 150, y, { align: 'right' });
        doc.text(`₹${totalSpent.toFixed(2)}`, 180, y, { align: 'right' });
      }
      
      // Add footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Thank you for choosing MechShop!', 105, 280, { align: 'center' });
      
      // Generate and return the PDF as a base64 string
      const pdfOutput = doc.output('datauristring');
      const base64Data = pdfOutput.split(',')[1];
      
      if (!base64Data) {
        throw new Error('Failed to generate PDF data');
      }
      
      resolve(base64Data);
    } catch (error) {
      console.error('Error in customer history PDF generation:', error);
      reject(error);
    }
  });
};

export default { generateCustomerHistoryPdf };
