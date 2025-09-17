// Preview page JavaScript
(function() {
  // Hardcoded mock data
  const mockBillData = {
    subtotal: 150.00,
    tax: 15.00,
    taxPercentage: 10,
    tip: 22.50,
    tipPercentage: 15,
    total: 187.50,
    perPerson: 62.50,
    people: [
      {
        name: "Nguyễn Văn A",
        email: "nguyenvana@email.com",
        amount: 62.50,
        paid: false
      },
      {
        name: "Trần Thị B",
        email: "tranthib@email.com",
        amount: 62.50,
        paid: false
      },
      {
        name: "Lê Văn C",
        email: "levanc@email.com",
        amount: 62.50,
        paid: false
      }
    ],
    paymentMethods: [
      {
        type: "qr",
        qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIvPgogIDx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UVIgQ29kZTwvdGV4dD4KPC9zdmc+"
      },
      {
        type: "cash"
      }
    ],
    currency: "VND",
    timestamp: "2024-01-15T10:30:00.000Z"
  };

  // Currency symbols mapping
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'VND': '₫',
    'AUD': '$'
  };

  // Format currency
  function formatCurrency(amount, currency = 'VND') {
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  }

  // Generate individual QR code for each person
  function generateIndividualQR(personName, amount, currency) {
    const qrData = `Payment for ${personName}: ${formatCurrency(amount, currency)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}`;
    return qrUrl;
  }

  // Display bill data
  function displayBillData(billData) {
    const symbol = currencySymbols[billData.currency] || '$';
    
    // Update currency display
    document.getElementById('currency-display').textContent = billData.currency;
    
    // Update bill summary
    document.getElementById('bill-subtotal').textContent = formatCurrency(billData.subtotal, billData.currency);
    document.getElementById('bill-tax').textContent = formatCurrency(billData.tax, billData.currency);
    document.getElementById('bill-tip').textContent = formatCurrency(billData.tip, billData.currency);
    document.getElementById('bill-total').textContent = formatCurrency(billData.total, billData.currency);
    document.getElementById('total-participants').textContent = billData.people.length;
    document.getElementById('total-amount').textContent = formatCurrency(billData.total, billData.currency);
    
    // Update bill date
    const billDate = new Date(billData.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    document.getElementById('bill-date').textContent = billDate;
    
    // Display participants
    displayParticipants(billData.people, billData.currency);
  }

  // Display participants in grid
  function displayParticipants(people, currency) {
    const participantsGrid = document.getElementById('participants-grid');
    participantsGrid.innerHTML = '';
    
    people.forEach((person, index) => {
      const participantCard = document.createElement('div');
      participantCard.className = 'bg-slate-50 rounded-xl p-4 sm:p-6 border border-slate-200';
      participantCard.innerHTML = `
        <div class="text-center">
          <!-- Avatar -->
          <div class="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span class="text-xl font-semibold text-brand-700">${person.name.charAt(0)}</span>
          </div>
          
          <!-- Name and Email -->
          <h3 class="font-semibold text-slate-900 mb-1">${person.name}</h3>
          <p class="text-sm text-slate-600 mb-3">${person.email}</p>
          
          <!-- Amount -->
          <div class="bg-white rounded-lg p-3 mb-4 border border-slate-200">
            <p class="text-sm text-slate-600">Amount to pay</p>
            <p class="text-xl font-bold text-slate-900">${formatCurrency(person.amount, currency)}</p>
          </div>
          
          <!-- QR Code -->
          <div class="mb-4">
            <p class="text-xs text-slate-600 mb-2">Scan to pay</p>
            <div class="bg-white rounded-lg p-2 border border-slate-200 inline-block">
              <img src="${generateIndividualQR(person.name, person.amount, currency)}" 
                   alt="QR Code for ${person.name}" 
                   class="w-24 h-24 mx-auto">
            </div>
          </div>
          
          <!-- Payment Status -->
          <div class="flex items-center justify-center gap-2">
            <input type="checkbox" 
                   id="paid-${index}" 
                   class="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                   ${person.paid ? 'checked' : ''}
                   onchange="updatePaymentStatus(${index}, this.checked)">
            <label for="paid-${index}" class="text-sm font-medium text-slate-700">
              ${person.paid ? 'Paid' : 'Mark as paid'}
            </label>
          </div>
        </div>
      `;
      participantsGrid.appendChild(participantCard);
    });
    
    updatePaymentSummary();
  }

  // Update payment status
  function updatePaymentStatus(index, isPaid) {
    mockBillData.people[index].paid = isPaid;
    updatePaymentSummary();
    
    // Update label
    const label = document.querySelector(`label[for="paid-${index}"]`);
    label.textContent = isPaid ? 'Paid' : 'Mark as paid';
  }

  // Update payment summary
  function updatePaymentSummary() {
    const paidCount = mockBillData.people.filter(person => person.paid).length;
    const pendingCount = mockBillData.people.length - paidCount;
    
    document.getElementById('paid-count').textContent = paidCount;
    document.getElementById('pending-count').textContent = pendingCount;
  }

  // Print functionality
  function setupPrintFunctionality() {
    document.getElementById('print-bill')?.addEventListener('click', () => {
      window.print();
    });
  }

  // Setup bill view functionality
  function setupBillViewFunctionality() {
    const viewUploadedBillBtn = document.getElementById('view-uploaded-bill');
    const billViewModal = document.getElementById('bill-view-modal');
    const closeBillModal = document.getElementById('close-bill-modal');
    const billContent = document.getElementById('bill-content');

    // Mock uploaded bill data - in real app, this would come from localStorage or server
    const mockUploadedBill = {
      name: 'restaurant-bill.jpg',
      size: 245760, // 240KB
      type: 'image/jpeg',
      data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A'
    };

    viewUploadedBillBtn?.addEventListener('click', () => {
      showBillModal(mockUploadedBill);
    });

    closeBillModal?.addEventListener('click', () => {
      billViewModal?.classList.add('hidden');
      billViewModal?.classList.remove('flex');
    });

    // Hide modal when clicking outside
    billViewModal?.addEventListener('click', (e) => {
      if (e.target === billViewModal) {
        billViewModal?.classList.add('hidden');
        billViewModal?.classList.remove('flex');
      }
    });

    function showBillModal(file) {
      const fileType = file.type;
      
      if (fileType.startsWith('image/')) {
        // Display image
        billContent.innerHTML = `
          <div class="space-y-4">
            <div class="bg-slate-50 rounded-lg p-4">
              <h3 class="text-sm font-medium text-slate-700 mb-2">File: ${file.name}</h3>
              <p class="text-xs text-slate-500">Size: ${formatFileSize(file.size)}</p>
            </div>
            <div class="bg-white rounded-lg border border-slate-200 p-4">
              <img src="${file.data}" 
                   alt="Uploaded Bill" 
                   class="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-sm">
            </div>
            <div class="flex justify-center gap-3">
              <button onclick="downloadBill()" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download
              </button>
              <button onclick="printBill()" class="inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Print
              </button>
            </div>
          </div>
        `;
      } else if (fileType === 'application/pdf') {
        // Display PDF
        billContent.innerHTML = `
          <div class="space-y-4">
            <div class="bg-slate-50 rounded-lg p-4">
              <h3 class="text-sm font-medium text-slate-700 mb-2">File: ${file.name}</h3>
              <p class="text-xs text-slate-500">Size: ${formatFileSize(file.size)}</p>
            </div>
            <div class="bg-white rounded-lg border border-slate-200 p-4">
              <iframe src="${file.data}" 
                      class="w-full h-96 rounded-lg border border-slate-200"
                      title="Uploaded Bill PDF">
              </iframe>
            </div>
            <div class="flex justify-center gap-3">
              <button onclick="downloadBill()" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download
              </button>
              <button onclick="printBill()" class="inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Print
              </button>
            </div>
          </div>
        `;
      }
      
      // Show modal
      billViewModal?.classList.remove('hidden');
      billViewModal?.classList.add('flex');
    }

    // Format file size
    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Global functions for download and print
    window.downloadBill = function() {
      const link = document.createElement('a');
      link.href = mockUploadedBill.data;
      link.download = mockUploadedBill.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    window.printBill = function() {
      const fileType = mockUploadedBill.type;
      if (fileType.startsWith('image/')) {
        // For images, open in new window and print
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Bill - ${mockUploadedBill.name}</title>
              <style>
                body { margin: 0; padding: 20px; text-align: center; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <img src="${mockUploadedBill.data}" alt="Bill">
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      } else if (fileType === 'application/pdf') {
        // For PDFs, open in new window and print
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Bill - ${mockUploadedBill.name}</title>
              <style>
                body { margin: 0; padding: 0; }
                iframe { width: 100%; height: 100vh; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${mockUploadedBill.data}"></iframe>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 1000);
      }
    };
  }

  // Initialize page
  function initializePage() {
    displayBillData(mockBillData);
    setupPrintFunctionality();
    setupBillViewFunctionality();
  }

  // Initialize when page loads
  document.addEventListener('DOMContentLoaded', initializePage);
})();
