import { useState } from 'react';

const ReceiptForm = () => {
  const [tenantName, setTenantName] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState('');

  const handleGenerateReceipt = () => {
    // Lógica para generar el recibo
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Nombre del inquilino"
        value={tenantName}
        onChange={(e) => setTenantName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Monto"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button onClick={handleGenerateReceipt}>Generar Recibo</button>
    </div>
  );
};

export default ReceiptForm;
