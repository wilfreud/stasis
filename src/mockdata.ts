const mockInvoiceData = {
  invoiceNumber: "INV-2024-001",
  date: "2024-05-26",
  dueDate: "2024-06-25",
  company: {
    name: "Tech Solutions Inc.",
    address: "123 Business St, Tech City, TC 12345",
    email: "billing@techsolutions.com",
  },
  client: {
    name: "Acme Corporation",
    address: "456 Client Ave, Business City, BC 67890",
    email: "accounts@acme.com",
  },
  items: [
    {
      description: "Web Development Services",
      quantity: 40,
      unitPrice: "125.00",
      total: "5000.00",
    },
    {
      description: "UI/UX Design",
      quantity: 20,
      unitPrice: "100.00",
      total: "2000.00",
    },
    {
      description: "Project Management",
      quantity: 10,
      unitPrice: "150.00",
      total: "1500.00",
    },
  ],
  totalAmount: "8500.00",
  paymentTerms: "Net 30 days",
};

export { mockInvoiceData };
