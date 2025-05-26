const mockInvoiceData = {
  invoiceNumber: "twA63I31dsrG0V",
  date: "2025-05-26",
  dueDate: "2025-06-25",
  company: {
    name: "HIBOUTIK",
    address: "30 place du Centre, 01234 MAVILLE",
    phone: "01 23 45 67 89",
    website: "hiboutik",
    email: "contact@hiboutik.com",
  },
  client: {
    name: "Pierre",
    address: "456 Client Ave, Business City, BC 67890",
    email: "accounts@acme.com",
  },
  items: [
    {
      description: "Pizza",
      quantity: 1,
      unitPrice: "12.00",
      total: "12.00",
    },
  ],
  tax: "0.63",
  taxRate: "5.5",
  totalAmount: "12.00",
  subtotal: "12.00",
  paymentMethod: "ESP", // Payment method (ESP = Espèces/Cash)
  amountGiven: "15.00",
  amountReturned: "3.00",
  ticketNumber: "5232",
  // Helper function for current date formatting
  currentDate: function (format: string) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    if (format === "YYYY-MM-DD") {
      return `${year}-${month}-${day}`;
    } else if (format === "DD/MM/YYYY") {
      return `${day}/${month}/${year}`;
    }
    return `${day}/${month}/${year}`;
  },
};

export { mockInvoiceData };
