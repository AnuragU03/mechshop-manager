import PDFDocument from 'pdfkit';
import fs from 'fs';

class PDFGenerator {
  constructor() {
    this.doc = new PDFDocument({ margin: 50 });
  }

  generateHeader(doc, invoice) {
    doc
      .image('public/logo.png', 50, 45, { width: 50 })
      .fillColor('#444444')
      .fontSize(20)
      .text('MechShop', 110, 57)
      .fontSize(10)
      .text('123 Auto Street', 200, 65, { align: 'right' })
      .text('Mechanic City, 10001', 200, 80, { align: 'right' })
      .moveDown();
  }

  generateCustomerInformation(doc, invoice) {
    doc
      .fillColor('#444444')
      .fontSize(20)
      .text('Invoice', 50, 160);

    this.generateHr(doc, 185);

    const customerInformationTop = 200;

    doc
      .fontSize(10)
      .text('Invoice Number:', 50, customerInformationTop)
      .font('Helvetica-Bold')
      .text(invoice.invoiceNumber, 150, customerInformationTop)
      .font('Helvetica')
      .text('Invoice Date:', 50, customerInformationTop + 15)
      .text(this.formatDate(new Date()), 150, customerInformationTop + 15)
      .text('Balance Due:', 50, customerInformationTop + 30)
      .text(
        this.formatCurrency(invoice.total),
        150,
        customerInformationTop + 30
      )
      .font('Helvetica-Bold')
      .text(
        invoice.customer.name,
        300,
        customerInformationTop
      )
      .font('Helvetica')
      .text(invoice.customer.contact, 300, customerInformationTop + 15)
      .moveDown();

    this.generateHr(doc, 252);
  }

  generateInvoiceTable(doc, invoice) {
    let i;
    const invoiceTableTop = 300;

    doc.font('Helvetica-Bold');
    this.generateTableRow(
      doc,
      invoiceTableTop,
      'Item',
      'Description',
      'Unit Cost',
      'Quantity',
      'Line Total'
    );
    this.generateHr(doc, invoiceTableTop + 20);
    doc.font('Helvetica');

    for (i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      const position = invoiceTableTop + (i + 1) * 30;
      this.generateTableRow(
        doc,
        position,
        item.name,
        item.description || '-',
        this.formatCurrency(item.price),
        item.quantity,
        this.formatCurrency(item.price * item.quantity)
      );
      this.generateHr(doc, position + 20);
    }

    const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    this.generateTableRow(
      doc,
      subtotalPosition,
      '',
      '',
      'Subtotal',
      '',
      this.formatCurrency(invoice.subtotal)
    );

    const taxPosition = subtotalPosition + 20;
    this.generateTableRow(
      doc,
      taxPosition,
      '',
      '',
      'Tax',
      '',
      this.formatCurrency(invoice.tax)
    );

    const totalPosition = taxPosition + 25;
    doc.font('Helvetica-Bold');
    this.generateTableRow(
      doc,
      totalPosition,
      '',
      '',
      'Total',
      '',
      this.formatCurrency(invoice.total)
    );
    doc.font('Helvetica');
  }

  generateTableRow(doc, y, item, description, unitCost, quantity, lineTotal) {
    doc
      .fontSize(10)
      .text(item, 50, y)
      .text(description, 150, y, { width: 200, align: 'left' })
      .text(unitCost, 350, y, { width: 90, align: 'right' })
      .text(quantity, 440, y, { width: 50, align: 'right' })
      .text(lineTotal, 0, y, { align: 'right' });
  }

  generateHr(doc, y) {
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }

  formatCurrency(amount) {
    return '₹' + amount.toFixed(2);
  }

  formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return day + '/' + month + '/' + year;
  }

  async generate(invoice, path) {
    return new Promise((resolve, reject) => {
      const doc = this.doc;
      const stream = fs.createWriteStream(path);
      
      doc.pipe(stream);
      
      this.generateHeader(doc, invoice);
      this.generateCustomerInformation(doc, invoice);
      this.generateInvoiceTable(doc, invoice);
      
      doc.end();
      
      stream.on('finish', () => resolve(path));
      stream.on('error', reject);
    });
  }

  async generateBase64(invoice) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      const doc = this.doc;
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const result = Buffer.concat(chunks).toString('base64');
        resolve(result);
      });
      doc.on('error', reject);
      
      this.generateHeader(doc, invoice);
      this.generateCustomerInformation(doc, invoice);
      this.generateInvoiceTable(doc, invoice);
      
      doc.end();
    });
  }
}

export default new PDFGenerator();
