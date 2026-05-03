import jsPDF from 'jspdf';
import type { Receipt } from '../interfaces/receipt.interface';

const generatePDF = async (receipt: Receipt) => {
  const doc = new jsPDF();

  // Colores
  const primaryColor: [number, number, number] = [41, 128, 185];
  const secondaryColor: [number, number, number] = [52, 73, 94];
  const accentColor: [number, number, number] = [1, 92, 39];
  const lightGray: [number, number, number] = [236, 240, 241];

  // Calcular total
  const taxTotal = receipt.taxes.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalAmount = receipt.rentAmount + taxTotal;

  // Pre-calcular altura del rectángulo principal:
  // Info: título(8) + inquilino(7) + domicilio(7) + fecha+período(10) = 32
  // Separador(4) + tabla header(7) + alquiler(7) + taxes(7 cada uno) + total(8) = 26 + taxes*7
  // MONTO PAGADO(12) + separador(6) = 18
  const infoHeight = 8 + 7 + 7 + 10;
  const tableHeight = 4 + 7 + 7 + (receipt.taxes.length * 7) + 8;
  const montoHeight = 18;
  const boxHeight = infoHeight + tableHeight + montoHeight + 4;
  const boxTop = 30;

  // Header
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

  // Fondo gris y borde (dibujado ANTES del texto)
  doc.setFillColor(...lightGray);
  doc.rect(15, boxTop, 180, boxHeight, 'F');
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.rect(15, boxTop, 180, boxHeight);

  doc.setTextColor(...secondaryColor);
  let yPosition = boxTop + 5;

  // --- INFORMACIÓN DEL PAGO ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL PAGO', 20, yPosition);
  yPosition += 8;
  doc.setFontSize(10);

  // Inquilino + Nº recibo
  const receiptNumber = `REC-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  doc.setFont('helvetica', 'bold');
  doc.text('Inquilino:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.tenantName, 50, yPosition);
  doc.setFont('helvetica', 'bold');
  doc.text('Nº Recibo:', 120, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(receiptNumber, 150, yPosition);
  yPosition += 7;

  // Domicilio + Tipo
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
    if (secondLine) { yPosition += 5; doc.text(secondLine, 50, yPosition); }
  } else {
    doc.text(receipt.propertyAddress, 50, yPosition);
  }
  
  // Tipo de bien
  doc.setFont('helvetica', 'bold');
  doc.text('Tipo:', 120, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.propertyType, 135, yPosition);
  yPosition += 7;

  // Fecha pago + Período (misma fila)
  const [dateYear, dateMonth, dateDay] = receipt.date.split('-').map(Number);
  const dateMonthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const formattedDate = `${dateDay} ${dateMonthNames[dateMonth - 1]} ${dateYear}`;
  const [year, month] = receipt.rentMonth.split('-');
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha Pago:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(formattedDate, 50, yPosition);
  doc.setFont('helvetica', 'bold');
  doc.text('Período:', 120, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(`${monthNames[parseInt(month) - 1]} ${year}`, 145, yPosition);
  yPosition += 10;

  // --- TABLA DE DETALLE ---
  yPosition += 4; // separador
  const tableX = 20;
  const tableWidth = 170;
  const colLabelX = tableX + 4;
  const colAmountX = tableX + tableWidth - 4;

  // Encabezado de tabla
  doc.setFillColor(...primaryColor);
  doc.rect(tableX, yPosition, tableWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CONCEPTO', colLabelX, yPosition + 5);
  doc.text('IMPORTE', colAmountX, yPosition + 5, { align: 'right' });
  yPosition += 7;

  // Fila alquiler
  doc.setFillColor(255, 255, 255);
  doc.rect(tableX, yPosition, tableWidth, 7, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.rect(tableX, yPosition, tableWidth, 7);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Alquiler', colLabelX, yPosition + 5);
  doc.text(`$${receipt.rentAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, colAmountX, yPosition + 5, { align: 'right' });
  yPosition += 7;

  // Filas de impuestos
  let altRow = false;
  for (const tax of receipt.taxes) {
    const r = altRow ? 248 : 255;
    const g = altRow ? 249 : 255;
    const b = altRow ? 250 : 255;
    doc.setFillColor(r, g, b);
    doc.rect(tableX, yPosition, tableWidth, 7, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.rect(tableX, yPosition, tableWidth, 7);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.text(tax.name || 'Adicional', colLabelX, yPosition + 5);
    doc.text(`$${(tax.amount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, colAmountX, yPosition + 5, { align: 'right' });
    yPosition += 7;
    altRow = !altRow;
  }
  yPosition += 8; // espacio antes de monto total

  // --- MONTO PAGADO ---
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColor);
  doc.text('MONTO PAGADO:', 40, yPosition);
  doc.setFontSize(16);
  doc.text(`$${totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 130, yPosition);

  yPosition = boxTop + boxHeight + 5;
  doc.setTextColor(...secondaryColor);

  // Firma digital
  if (receipt.digitalSignature) {
    try {
      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(receipt.digitalSignature!);
      });
      yPosition += 3;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Firma:', 20, yPosition);
      doc.addImage(imageData, 'JPEG', 20, yPosition + 2, 30, 15);
      yPosition += 20;
    } catch (error) {
      console.warn('No se pudo procesar la firma digital:', error);
    }
  }

  // Footer
  const footerY = yPosition;
  doc.setFillColor(...primaryColor);
  doc.rect(0, footerY, 210, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Este documento constituye un comprobante válido', 105, footerY + 8, { align: 'center' });

  // Marcos decorativos
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(1.5);
  doc.line(15, boxTop, 23, boxTop);      doc.line(15, boxTop, 15, boxTop + 8);
  doc.line(187, boxTop, 195, boxTop);    doc.line(195, boxTop, 195, boxTop + 8);
  const boxBottom = boxTop + boxHeight;
  doc.line(15, boxBottom, 23, boxBottom);   doc.line(15, boxBottom - 8, 15, boxBottom);
  doc.line(187, boxBottom, 195, boxBottom); doc.line(195, boxBottom - 8, 195, boxBottom);

  // Guardar PDF
  const currentDate = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
  const fileName = `recibo_${receipt.tenantName.replace(/\s+/g, '_')}_${receipt.propertyAddress.replace(/\s+/g, '_')}_${currentDate}.pdf`;
  doc.save(fileName);
};

export default generatePDF;


// const generatePDF = async (receipt: Receipt) => {
//   const doc = new jsPDF();

//   // Colores
//   const primaryColor: [number, number, number] = [41, 128, 185];
//   const secondaryColor: [number, number, number] = [52, 73, 94];
//   const accentColor: [number, number, number] = [1, 92, 39];
//   const lightGray: [number, number, number] = [236, 240, 241];

//   // Header
//   doc.setFillColor(...primaryColor);
//   doc.rect(0, 0, 210, 25, 'F');
//   doc.setTextColor(255, 255, 255);
//   doc.setFontSize(18);
//   doc.setFont('helvetica', 'bold');
//   doc.text('RECIBO DE ALQUILER', 105, 12, { align: 'center' });
//   doc.setFontSize(10);
//   doc.setFont('helvetica', 'normal');
//   doc.text('Comprobante de Pago', 105, 20, { align: 'center' });

//   doc.setTextColor(...secondaryColor);

//   let yPosition = 35;

//   // Sección info
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   doc.text('INFORMACIÓN DEL PAGO', 20, yPosition);

//   yPosition += 8;
//   doc.setFontSize(10);

//   // Inquilino + Nº recibo
//   const receiptNumber = `REC-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
//   doc.setFont('helvetica', 'bold');
//   doc.text('Inquilino:', 20, yPosition);
//   doc.setFont('helvetica', 'normal');
//   doc.text(receipt.tenantName, 50, yPosition);
//   doc.setFont('helvetica', 'bold');
//   doc.text('Nº Recibo:', 120, yPosition);
//   doc.setFont('helvetica', 'normal');
//   doc.text(receiptNumber, 150, yPosition);
//   yPosition += 7;

//   // Domicilio + Tipo
//   doc.setFont('helvetica', 'bold');
//   doc.text('Domicilio:', 20, yPosition);
//   doc.setFont('helvetica', 'normal');
//   const maxLength = 35;
//   if (receipt.propertyAddress.length > maxLength) {
//     const words = receipt.propertyAddress.split(' ');
//     let firstLine = '';
//     let secondLine = '';
//     let currentLength = 0;
//     for (const word of words) {
//       if (currentLength + word.length + 1 <= maxLength) {
//         firstLine += (firstLine ? ' ' : '') + word;
//         currentLength += word.length + 1;
//       } else {
//         secondLine += (secondLine ? ' ' : '') + word;
//       }
//     }
//     doc.text(firstLine, 50, yPosition);
//     if (secondLine) { yPosition += 5; doc.text(secondLine, 50, yPosition); }
//   } else {
//     doc.text(receipt.propertyAddress, 50, yPosition);
//   }
//   doc.setFont('helvetica', 'bold');
//   doc.text('Tipo:', 120, yPosition);
//   doc.setFont('helvetica', 'normal');
//   doc.text(receipt.propertyType, 135, yPosition);
//   yPosition += 7;

//   // Fecha pago + Emisión
//   const formattedDate = new Date(receipt.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
//   doc.setFont('helvetica', 'bold');
//   doc.text('Fecha Pago:', 20, yPosition);
//   doc.setFont('helvetica', 'normal');
//   doc.text(formattedDate, 55, yPosition);
//   doc.setFont('helvetica', 'bold');
//   doc.text('Emisión:', 120, yPosition);
//   doc.setFont('helvetica', 'normal');
//   doc.text(new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }), 145, yPosition);
//   yPosition += 7;

//   // Período
//   const [year, month] = receipt.rentMonth.split('-');
//   const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
//   doc.setFont('helvetica', 'bold');
//   doc.text('Período:', 20, yPosition);
//   doc.setFont('helvetica', 'normal');
//   doc.text(`${monthNames[parseInt(month) - 1]} ${year}`, 50, yPosition);
//   yPosition += 10;

//   // Calcular alturas de la tabla
//   const infoSectionHeight = yPosition - 30;
//   const tableSectionHeight = 7 + 7 + (receipt.taxes.length * 7) + 8; // header + alquiler + taxes + total
//   const totalBoxHeight = infoSectionHeight + tableSectionHeight + 8;

//   // Fondo gris y borde para toda la sección
//   doc.setFillColor(...lightGray);
//   doc.rect(15, 30, 180, totalBoxHeight, 'F');
//   doc.setDrawColor(...primaryColor);
//   doc.setLineWidth(0.5);
//   doc.rect(15, 30, 180, totalBoxHeight);

//   // Volver a dibujar el texto sobre el fondo (jsPDF dibuja en orden, necesitamos re-render)
//   // En lugar de eso: la tabla de detalle se dibuja dentro del rect

//   // Tabla de detalle de pago
//   const tableX = 20;
//   const tableWidth = 170;
//   const colLabelX = tableX + 4;
//   const colAmountX = tableX + tableWidth - 4;
//   const taxTotal = receipt.taxes.reduce((sum, t) => sum + (t.amount || 0), 0);
//   const totalAmount = receipt.rentAmount + taxTotal;

//   // Encabezado de tabla
//   doc.setFillColor(...primaryColor);
//   doc.rect(tableX, yPosition, tableWidth, 7, 'F');
//   doc.setTextColor(255, 255, 255);
//   doc.setFontSize(9);
//   doc.setFont('helvetica', 'bold');
//   doc.text('CONCEPTO', colLabelX, yPosition + 5);
//   doc.text('IMPORTE', colAmountX, yPosition + 5, { align: 'right' });
//   yPosition += 7;

//   // Fila alquiler
//   doc.setFillColor(248, 249, 250);
//   doc.rect(tableX, yPosition, tableWidth, 7, 'F');
//   doc.setDrawColor(220, 220, 220);
//   doc.setLineWidth(0.3);
//   doc.rect(tableX, yPosition, tableWidth, 7);
//   doc.setTextColor(...secondaryColor);
//   doc.setFont('helvetica', 'normal');
//   doc.text('Alquiler', colLabelX, yPosition + 5);
//   doc.text(`$${receipt.rentAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, colAmountX, yPosition + 5, { align: 'right' });
//   yPosition += 7;

//   // Filas de impuestos
//   let altRow = false;
//   for (const tax of receipt.taxes) {
//     doc.setFillColor(altRow ? 248 : 255, altRow ? 249 : 255, altRow ? 250 : 255);
//     doc.rect(tableX, yPosition, tableWidth, 7, 'F');
//     doc.setDrawColor(220, 220, 220);
//     doc.setLineWidth(0.3);
//     doc.rect(tableX, yPosition, tableWidth, 7);
//     doc.setTextColor(...secondaryColor);
//     doc.setFont('helvetica', 'normal');
//     doc.text(tax.name || 'Adicional', colLabelX, yPosition + 5);
//     doc.text(`$${(tax.amount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, colAmountX, yPosition + 5, { align: 'right' });
//     yPosition += 7;
//     altRow = !altRow;
//   }

//   // Fila total
//   doc.setFillColor(...accentColor);
//   doc.rect(tableX, yPosition, tableWidth, 8, 'F');
//   doc.setTextColor(255, 255, 255);
//   doc.setFont('helvetica', 'bold');
//   doc.setFontSize(10);
//   doc.text('TOTAL', colLabelX, yPosition + 5.5);
//   doc.text(`$${totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, colAmountX, yPosition + 5.5, { align: 'right' });
//   yPosition += 8;

//   doc.setTextColor(...secondaryColor);

//   // Firma digital
//   if (receipt.digitalSignature) {
//     try {
//       const reader = new FileReader();
//       const imageData = await new Promise<string>((resolve) => {
//         reader.onload = () => resolve(reader.result as string);
//         reader.readAsDataURL(receipt.digitalSignature!);
//       });
//       yPosition += 8;
//       doc.setFontSize(9);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Firma:', 20, yPosition);
//       doc.addImage(imageData, 'JPEG', 20, yPosition + 2, 30, 15);
//       yPosition += 20;
//     } catch (error) {
//       console.warn('No se pudo procesar la firma digital:', error);
//     }
//   }

//   // Footer dinámico
//   const footerY = yPosition + 10;
//   doc.setFillColor(...primaryColor);
//   doc.rect(0, footerY, 210, 15, 'F');
//   doc.setTextColor(255, 255, 255);
//   doc.setFontSize(9);
//   doc.setFont('helvetica', 'normal');
//   doc.text('Este documento constituye un comprobante válido', 105, footerY + 8, { align: 'center' });

//   // Marcos decorativos
//   doc.setDrawColor(...accentColor);
//   doc.setLineWidth(1.5);
//   doc.line(15, 30, 23, 30); doc.line(15, 30, 15, 38);
//   doc.line(187, 30, 195, 30); doc.line(195, 30, 195, 38);

//   const boxBottom = 30 + totalBoxHeight;
//   doc.line(15, boxBottom, 23, boxBottom); doc.line(15, boxBottom - 8, 15, boxBottom);
//   doc.line(187, boxBottom, 195, boxBottom); doc.line(195, boxBottom - 8, 195, boxBottom);

//   // Guardar PDF
//   const currentDate = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
//   const fileName = `recibo_${receipt.tenantName.replace(/\s+/g, '_')}_${currentDate}.pdf`;
//   doc.save(fileName);
// };

// export default generatePDF;
