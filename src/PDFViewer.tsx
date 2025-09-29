import React from 'react';
import jsPDF from 'jspdf';

const PDFViewer = () => {
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Contenido del recibo en PDF', 10, 10);
    doc.save('recibo.pdf');
  };

  return (
    <div>
      <button onClick={generatePDF}>Generar PDF</button>
    </div>
  );
};

export default PDFViewer;
