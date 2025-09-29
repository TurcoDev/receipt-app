import jsPDF from 'jspdf';
import type { Receipt } from './interfaces/receipt.interface';

const PDFViewer = (receipt: Receipt) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Recibo de Alquiler`, 10, 10);
    doc.text(`Inquilino: ${receipt.tenantName}`, 10, 20);
    doc.text(`Monto: $${receipt.amount}`, 10, 30);
    doc.text(`Fecha: ${receipt.date}`, 10, 40);
    
    const currentDate = new Date().toISOString().replace(/[-:.]/g, '');
    const fileName = `recibo_${currentDate}.pdf`;
    
    doc.save(`exports_pdf/${fileName}`);
  };

  return (
    <div>
      <button onClick={generatePDF}>Generar PDF</button>
    </div>
  );
};

export default PDFViewer;
