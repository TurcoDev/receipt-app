import jsPDF from 'jspdf';
import type { Receipt } from '../interfaces/receipt.interface';

const generatePDF = async (receipt: Receipt) => {
  const doc = new jsPDF();
  
  // Configuración de colores
  const primaryColor: [number, number, number] = [41, 128, 185]; // Azul
  const secondaryColor: [number, number, number] = [52, 73, 94]; // Gris oscuro
  const accentColor: [number, number, number] = [1, 92, 39]; // Verde
  const lightGray: [number, number, number] = [236, 240, 241]; // Gris claro
  
  // Header con fondo azul
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 25, 'F');
  
  // Título del recibo
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIBO DE ALQUILER', 105, 12, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprobante de Pago', 105, 20, { align: 'center' });
  
  // Resetear color de texto
  doc.setTextColor(...secondaryColor);
  
  // Información del recibo - EXPANDIDA para incluir datos del bien
  let yPosition = 35;
  
  // Fondo gris claro para información principal - AMPLIADO
  doc.setFillColor(...lightGray);
  doc.rect(15, 30, 180, 100, 'F');
  
  // Bordes decorativos
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.rect(15, 30, 180, 100);
  
  // Información del inquilino y bien
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL PAGO', 20, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Layout en dos columnas
  // Inquilino
  doc.setFont('helvetica', 'bold');
  doc.text('Inquilino:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.tenantName, 50, yPosition);
  
  // Número de recibo
  const receiptNumber = `REC-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  doc.setFont('helvetica', 'bold');
  doc.text('Nº Recibo:', 120, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(receiptNumber, 150, yPosition);
  
  yPosition += 7;
  
  // Domicilio del bien
  doc.setFont('helvetica', 'bold');
  doc.text('Domicilio:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  // Dividir la dirección si es muy larga
  const maxLength = 35;
  if (receipt.propertyAddress.length > maxLength) {
    const words = receipt.propertyAddress.split(' ');
    let firstLine = '';
    let secondLine = '';
    let currentLength = 0;
    
    for (const word of words) {
      if (currentLength + word.length + 1 <= maxLength) {
        firstLine += (firstLine ? ' ' : '') + word;
        currentLength += word.length + 1;
      } else {
        secondLine += (secondLine ? ' ' : '') + word;
      }
    }
    
    doc.text(firstLine, 50, yPosition);
    if (secondLine) {
      yPosition += 5;
      doc.text(secondLine, 50, yPosition);
    }
  } else {
    doc.text(receipt.propertyAddress, 50, yPosition);
  }
  
  // Tipo de bien
  doc.setFont('helvetica', 'bold');
  doc.text('Tipo:', 120, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.propertyType, 135, yPosition);
  
  yPosition += 7;
  
  // Fecha de pago
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha Pago:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  const formattedDate = new Date(receipt.date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  doc.text(formattedDate, 55, yPosition);
  
  // Fecha de emisión
  doc.setFont('helvetica', 'bold');
  doc.text('Emisión:', 120, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }), 145, yPosition);
  
  yPosition += 7;
  
  // Mes de alquiler
  doc.setFont('helvetica', 'bold');
  doc.text('Período:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  const [year, month] = receipt.rentMonth.split('-');
  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  const monthName = monthNames[parseInt(month) - 1];
  doc.text(`${monthName} ${year}`, 50, yPosition);
  
  yPosition += 12;
  
  // Monto - destacado
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColor);
  doc.text('MONTO PAGADO:', 60, yPosition);
  doc.setFontSize(16);
  doc.text(`$${receipt.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 130, yPosition);
  
  // Resetear color
  doc.setTextColor(...secondaryColor);
  
  // Firma digital si existe
  if (receipt.digitalSignature) {
    try {
      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(receipt.digitalSignature!);
      });
      
      yPosition += 20;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Firma:', 20, yPosition);
      
      // Agregar imagen de firma
      doc.addImage(imageData, 'JPEG', 20, yPosition + 2, 30, 15);
    } catch (error) {
      console.warn('No se pudo procesar la firma digital:', error);
    }
  }

  // Footer - Ajustado para estar después del rectángulo (yPosition = 135 + margen)
  yPosition = 135;
  
  // Línea separadora - ajustada al ancho del rectángulo
  // doc.setDrawColor(...primaryColor);
  // doc.setLineWidth(0.5);
  // doc.line(15, yPosition, 195, yPosition);
  
  // yPosition += 8;
  
  // Fondo del footer
  doc.setFillColor(...primaryColor);
  doc.rect(0, yPosition, 210, 15, 'F');
  
  // Texto del footer
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Este documento constituye un comprobante válido', 105, yPosition + 8, { align: 'center' });
  
  // Marcos decorativos en las esquinas - AJUSTADOS AL RECTÁNGULO
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(1.5);
  
  // Esquina superior izquierda del rectángulo
  doc.line(15, 30, 23, 30);
  doc.line(15, 30, 15, 38);
  
  // Esquina superior derecha del rectángulo
  doc.line(187, 30, 195, 30);
  doc.line(195, 30, 195, 38);
  
  // Esquina inferior izquierda del rectángulo
  doc.line(15, 130, 23, 130); // horizontal
  doc.line(15, 122, 15, 130); // vertical
  
  // Esquina inferior derecha del rectángulo
  doc.line(187, 130, 195, 130); // horizontal
  doc.line(195, 122, 195, 130);
  
  // Generar nombre de archivo único
  const currentDate = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
  const fileName = `recibo_${receipt.tenantName.replace(/\s+/g, '_')}_${currentDate}.pdf`;
  
  // Guardar el PDF
  doc.save(fileName);
};

export default generatePDF;
