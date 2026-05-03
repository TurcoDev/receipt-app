import { useState, useEffect } from 'react';
import type { Receipt, TaxItem } from './interfaces/receipt.interface';
import './ReceiptForm.css';
import generatePDF from './functions/PDFViewer';

const ReceiptForm = () => {
  const [tenantName, setTenantName] = useState('Neurocenter SRL');
  const [rentAmount, setRentAmount] = useState(750000);
  const [taxes, setTaxes] = useState<TaxItem[]>([{ name: 'Servicios Urbanos', amount: 5473 }]);
  const [paymentDate, setPaymentDate] = useState('');
  const [rentMonth, setRentMonth] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('Moreno 3121');
  const [propertyType, setPropertyType] = useState('Casa');
  const [digitalSignature, setDigitalSignature] = useState<File | null>(null);
  const [signatureName, setSignatureName] = useState('default.png');

  const totalAmount = rentAmount + taxes.reduce((sum, t) => sum + (t.amount || 0), 0);

  const handleAddTax = () => {
    setTaxes([...taxes, { name: '', amount: 0 }]);
  };

  const handleTaxChange = (index: number, field: keyof TaxItem, value: string) => {
    const updated = taxes.map((t, i) =>
      i === index ? { ...t, [field]: field === 'amount' ? Number(value) : value } : t
    );
    setTaxes(updated);
  };

  const handleRemoveTax = (index: number) => {
    setTaxes(taxes.filter((_, i) => i !== index));
  };

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
    if (!tenantName || !rentAmount || !paymentDate || !rentMonth || !propertyAddress || !propertyType) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    const receipt: Receipt = {
      tenantName,
      rentAmount,
      taxes,
      date: paymentDate,
      rentMonth,
      propertyAddress,
      propertyType,
      digitalSignature
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
        <label htmlFor="rentAmount">Alquiler *</label>
        <input
          id="rentAmount"
          type="number"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={rentAmount || ''}
          onChange={(e) => setRentAmount(Number(e.target.value))}
          required
        />
      </div>

      <div className="form-group">
        <label>Impuestos y Adicionales</label>
        {taxes.map((tax, index) => (
          <div key={index} className="tax-row">
            <input
              type="text"
              placeholder="Ej: ABL, Expensas, Agua..."
              value={tax.name}
              onChange={(e) => handleTaxChange(index, 'name', e.target.value)}
            />
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={tax.amount || ''}
              onChange={(e) => handleTaxChange(index, 'amount', e.target.value)}
            />
            <button type="button" className="remove-tax-btn" onClick={() => handleRemoveTax(index)}>✕</button>
          </div>
        ))}
        <button type="button" className="add-tax-btn" onClick={handleAddTax}>+ Agregar impuesto</button>
      </div>

      <div className="total-summary">
        <div className="total-row">
          <span>Alquiler</span>
          <span>${rentAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </div>
        {taxes.map((tax, index) => (
          tax.name || tax.amount > 0 ? (
            <div key={index} className="total-row">
              <span>{tax.name || `Adicional ${index + 1}`}</span>
              <span>${(tax.amount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
          ) : null
        ))}
        <div className="total-row total-final">
          <span>Total</span>
          <span>${totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </div>
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
