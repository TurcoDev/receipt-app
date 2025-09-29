import { useState, useEffect } from 'react';
import type { Receipt } from './interfaces/receipt.interface';
import './ReceiptForm.css';
import generatePDF from './functions/PDFViewer';

const ReceiptForm = () => {
  const [tenantName, setTenantName] = useState('');
  const [amount, setAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState('');
  const [rentMonth, setRentMonth] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [digitalSignature, setDigitalSignature] = useState<File | null>(null);
  const [signatureName, setSignatureName] = useState('default.png');

  // Cargar firma por defecto al montar el componente
  useEffect(() => {
    const loadDefaultSignature = async () => {
      try {
        const response = await fetch('/src/assets/firmas/default.png');
        const blob = await response.blob();
        const file = new File([blob], 'default.png', { type: 'image/png' });
        setDigitalSignature(file);
      } catch (error) {
        console.warn('No se pudo cargar la firma por defecto:', error);
      }
    };

    loadDefaultSignature();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (validTypes.includes(file.type)) {
        setDigitalSignature(file);
        setSignatureName(file.name);
      } else {
        alert('Por favor, selecciona un archivo de imagen válido (JPEG, PNG, GIF)');
        e.target.value = '';
      }
    }
  };

  const handleRemoveSignature = () => {
    setDigitalSignature(null);
    setSignatureName('');
    const fileInput = document.getElementById('digitalSignature') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleGenerateReceipt = () => {
    // Validación básica
    if (!tenantName || !amount || !paymentDate || !rentMonth || !propertyAddress || !propertyType) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    const receipt: Receipt = {
      tenantName: tenantName,
      amount: amount,
      date: paymentDate,
      rentMonth: rentMonth,
      propertyAddress: propertyAddress,
      propertyType: propertyType,
      digitalSignature: digitalSignature
    };
    console.log('Recibo generado:', receipt);

    generatePDF(receipt);
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Generador de Recibos</h2>
      
      <div className="form-group">
        <label htmlFor="tenantName">Nombre del Inquilino *</label>
        <input
          id="tenantName"
          type="text"
          placeholder="Ingresa el nombre del inquilino"
          value={tenantName}
          onChange={(e) => setTenantName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="propertyAddress">Domicilio del Bien *</label>
        <input
          id="propertyAddress"
          type="text"
          placeholder="Ej: Av. Corrientes 1234, CABA"
          value={propertyAddress}
          onChange={(e) => setPropertyAddress(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="propertyType">Tipo de Bien *</label>
        <select
          id="propertyType"
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          required
        >
          <option value="">Selecciona el tipo de bien</option>
          <option value="Departamento">Departamento</option>
          <option value="Casa">Casa</option>
          <option value="Oficina">Oficina</option>
          <option value="Local Comercial">Local Comercial</option>
          <option value="Cochera">Cochera</option>
          <option value="Depósito">Depósito</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="amount">Monto *</label>
        <input
          id="amount"
          type="number"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="paymentDate">Fecha de Pago *</label>
        <input
          id="paymentDate"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="rentMonth">Mes de Alquiler que se Paga *</label>
        <input
          id="rentMonth"
          type="month"
          value={rentMonth}
          onChange={(e) => setRentMonth(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="digitalSignature">Firma Digital</label>
        <input
          id="digitalSignature"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="file-input"
        />
        {digitalSignature && (
          <div className="file-preview">
            <span className="file-name">📄 {signatureName}</span>
            <button 
              type="button" 
              className="remove-file"
              onClick={handleRemoveSignature}
            >
              ✕
            </button>
          </div>
        )}
        <small className="file-help">
          Se cargó una firma por defecto. Puedes cambiarla seleccionando otro archivo.
        </small>
      </div>

      <button onClick={handleGenerateReceipt} className="generate-btn">
        Generar Recibo
      </button>
    </div>
  );
};

export default ReceiptForm;
