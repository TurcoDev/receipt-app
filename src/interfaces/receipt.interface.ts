export interface TaxItem {
	name: string;
	amount: number;
}

export interface Receipt {
	tenantName: string;
	rentAmount: number; // Monto de alquiler base
	taxes: TaxItem[]; // Impuestos y adicionales
	date: string; // Fecha de pago
	rentMonth: string; // Mes de alquiler que se paga (formato YYYY-MM)
	digitalSignature?: File | null; // Archivo de firma digital
	propertyAddress: string; // Domicilio del bien
	propertyType: string; // Tipo de bien (dpto, casa, oficina)
}
