import PDFDocument from 'pdfkit';

const generateHeader = (doc) => {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('MechShop', 50, 57)
    .fontSize(10)
    .text('123 Auto Street', 200, 65, { align: 'right' })
    .text('Mechanic City, 10001', 200, 80, { align: 'right' })
    .moveDown();
};

const generateCustomerInformation = (doc, invoice, customer) => {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('Invoice', 50, 160)
    .fontSize(10)
    .text(`Invoice Number: ${invoice.invoice_number}`, 50, 200)
    .text(`Invoice Date: ${new Date(invoice.date).toLocaleDateString()}`, 50, 215)
    .text(`Balance Due: ₹${invoice.total.toFixed(2)}`, 50, 230)
    .font('Helvetica-Bold')
    .text(customer?.name || 'Walk-in Customer', 300, 200)
    .font('Helvetica')
    .text(`Contact: ${customer?.contact || 'N/A'}`, 300, 215)
    .text(`Email: ${customer?.email || 'N/A'}`, 300, 230)
    .moveDown();
};

const generateTableRow = (doc, y, item, description, unitCost, quantity, lineTotal) => {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y, { width: 200, align: 'left' })
    .text(unitCost, 350, y, { width: 90, align: 'right' })
    .text(quantity, 440, y, { width: 50, align: 'right' })
    .text(lineTotal, 0, y, { align: 'right' });
};

const generateInvoiceTable = (doc, invoice, items) => {
  let i;
  const invoiceTableTop = 300;

  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    invoiceTableTop,
    'Item',
    'Description',
    'Unit Cost',
    'Quantity',
    'Total'
  );

  doc.font('Helvetica');
  
  // Add items
  items.forEach((item, index) => {
    const position = invoiceTableTop + (index + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.name,
      item.description || '-',
      `₹${item.rate.toFixed(2)}`,
      item.quantity,
      `₹${(item.rate * item.quantity).toFixed(2)}`
    );
  });

  // Add total
  const totalPosition = invoiceTableTop + (items.length + 1) * 30;
  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    totalPosition,
    '',
    '',
    'Total',
    '',
    `₹${invoice.total.toFixed(2)}`
  );
  doc.font('Helvetica');
};

const generateFooter = (doc) => {
  doc
    .fontSize(10)
    .text('Thank you for your business!', 50, 700, { align: 'center' });
};

const generateInvoice = async (invoice, customer, items) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    
    // Collect PDF data in chunks
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      // Combine chunks into a single buffer
      const result = Buffer.concat(chunks);
      resolve(result.toString('base64'));
    });

    // Add content to the PDF
    generateHeader(doc);
    generateCustomerInformation(doc, invoice, customer);
    generateInvoiceTable(doc, invoice, items);
    generateFooter(doc);
    
    // Finalize the PDF
    doc.end();
  });
};

export default {
  generateInvoice
};
