// Preview page JavaScript
(function() {
  // Global variables
  let billData = null;
  
  // Get auth token from localStorage
  function getAuthToken() {
    return localStorage.getItem('access_token');
  }
  
  // Fetch bill data from API
  async function fetchBillData(billNumber) {
    try {
      const token = getAuthToken();
      const headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE}/bill/share/${billNumber}`, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status_code === 200) {
        return result.data;
      } else {
        window.location.href = '/bill/share/not-found';
      }
    } catch (error) {
      console.error('Error fetching bill data:', error);
      throw error;
    }
  }
  
  // Transform API data to display format
  function transformApiDataToDisplay(apiData) {
    return {
      subtotal: parseFloat(apiData.subtotal) || 0,
      tax: parseFloat(apiData.tax_amount) || 0,
      taxPercentage: parseFloat(apiData.tax_percent) || 0,
      tip: parseFloat(apiData.tip_amount) || 0,
      tipPercentage: parseFloat(apiData.tip_percent) || 0,
      total: parseFloat(apiData.total) || 0,
      currency: apiData.currency || 'USD',
      timestamp: apiData.created_at,
      people: apiData.bill_participants.map(participant => ({
        name: participant.name || 'Anonymous',
        email: participant.email || null,
        amount: parseFloat(participant.amount) || 0,
        paid: participant.payment_flag || false,
        description: participant.description || null
      })),
      billFileUrl: apiData.bill_file_url,
      paymentFileUrl: apiData.payment_file_url,
      paymentMethod: apiData.payment_method,
      paymentFlag: apiData.payment_flag,
      shareType: apiData.share_type,
      type: apiData.type
    };
  }

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


  // Display bill data
  function displayBillData(billData) {
    console.log('displayBillData called with:', billData);
    const symbol = currencySymbols[billData.currency] || '$';
    
    // Update currency display
    const currencyDisplay = document.getElementById('currency-display');
    console.log('currency-display element:', currencyDisplay);
    if (currencyDisplay) currencyDisplay.textContent = billData.currency;
    
    // Update bill summary
    const subtotalElement = document.getElementById('bill-subtotal');
    if (subtotalElement) subtotalElement.textContent = formatCurrency(billData.subtotal, billData.currency);
    
    // Display tax section
    const taxElement = document.getElementById('bill-tax');
    if (taxElement) {
      const taxContainer = taxElement.closest('.text-center');
      taxElement.textContent = formatCurrency(billData.tax, billData.currency);
      const taxLabel = taxContainer.querySelector('p:first-child');
      if (billData.tax > 0 && billData.taxPercentage > 0) {
        if (taxLabel) taxLabel.textContent = `Tax (${billData.taxPercentage}%)`;
      } else {
        if (taxLabel) taxLabel.textContent = 'Tax';
      }
      taxContainer.style.display = 'block';
    }
    
    // Display tip section
    const tipElement = document.getElementById('bill-tip');
    if (tipElement) {
      const tipContainer = tipElement.closest('.text-center');
      tipElement.textContent = formatCurrency(billData.tip, billData.currency);
      const tipLabel = tipContainer.querySelector('p:first-child');
      if (billData.tip > 0 && billData.tipPercentage > 0) {
        if (tipLabel) tipLabel.textContent = `Tip (${billData.tipPercentage}%)`;
      } else {
        if (tipLabel) tipLabel.textContent = 'Tip';
      }
      tipContainer.style.display = 'block';
    }
    
    const totalElement = document.getElementById('bill-total');
    if (totalElement) totalElement.textContent = formatCurrency(billData.total, billData.currency);
    
    const participantsElement = document.getElementById('total-participants');
    if (participantsElement) participantsElement.textContent = billData.people.length;
    
    const totalAmountElement = document.getElementById('total-amount');
    if (totalAmountElement) totalAmountElement.textContent = formatCurrency(billData.total, billData.currency);
    
    // Update bill date
    const billDateElement = document.getElementById('bill-date');
    if (billDateElement) {
      const billDate = new Date(billData.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      billDateElement.textContent = billDate;
    }
    
    // Show/hide view bill button based on bill file availability
    const viewBillBtn = document.getElementById('view-uploaded-bill');
    if (viewBillBtn) {
      if (billData.billFileUrl) {
        viewBillBtn.style.display = 'inline-flex';
      } else {
        viewBillBtn.style.display = 'none';
      }
    }
    
    // Hide payment method section since we display it in participant cards
    const paymentMethodSection = document.getElementById('payment-method-section');
    if (paymentMethodSection) {
      paymentMethodSection.style.display = 'none';
    }
    
    // Display participants
    displayParticipants(billData.people, billData.currency, billData.paymentMethod, billData.paymentFileUrl);
  }

  // Display payment method
  function displayPaymentMethod(paymentMethod, paymentFileUrl, currency) {
    const paymentMethodSection = document.getElementById('payment-method-section');
    const paymentMethodContent = document.getElementById('payment-method-content');
    
    if (!paymentMethodSection || !paymentMethodContent) return;
    
    let content = '';
    
    if (paymentMethod === 0) {
      // QR Code payment method
      content = `
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-slate-900">QR Code Payment</h4>
            <p class="text-sm text-slate-600">Scan QR code to pay</p>
          </div>
        </div>
      `;
      
      if (paymentFileUrl) {
        content += `
          <button onclick="showPaymentModal('${paymentFileUrl}')" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            View QR Code
          </button>
        `;
      }
    } else if (paymentMethod === 1) {
      // Cash payment method
      content = `
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-slate-900">Cash Payment</h4>
            <p class="text-sm text-slate-600">Pay with cash</p>
          </div>
        </div>
      `;
      
      if (paymentFileUrl) {
        content += `
          <button onclick="showPaymentModal('${paymentFileUrl}')" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            View Payment Info
          </button>
        `;
      }
    }
    
    paymentMethodContent.innerHTML = content;
    paymentMethodSection.style.display = 'block';
  }

  // Display participants in grid
  function displayParticipants(people, currency, paymentMethod, paymentFileUrl) {
    const participantsGrid = document.getElementById('participants-grid');
    if (!participantsGrid) return;
    
    participantsGrid.innerHTML = '';
    
    people.forEach((person, index) => {
      const participantCard = document.createElement('div');
      participantCard.className = 'bg-slate-50 rounded-xl p-4 sm:p-6 border border-slate-200';
      participantCard.innerHTML = `
        <div class="text-center">
          <!-- Avatar -->
          <div class="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span class="text-xl font-semibold text-brand-700">${person.name ? person.name.charAt(0).toUpperCase() : '?'}</span>
          </div>
          
          <!-- Name and Email -->
          <h3 class="font-semibold text-slate-900 mb-1">${person.name || 'Anonymous'}</h3>
          ${person.email ? `<p class="text-sm text-slate-600 mb-3">${person.email}</p>` : ''}
          
          <!-- Amount -->
          <div class="bg-white rounded-lg p-3 mb-4 border border-slate-200">
            <p class="text-sm text-slate-600">Amount to pay</p>
            <p class="text-xl font-bold text-slate-900">${formatCurrency(person.amount, currency)}</p>
          </div>
          
          
          <!-- Payment Method -->
          ${paymentMethod === 0 && paymentFileUrl ? `
            <div class="mb-4">
              <p class="text-xs text-slate-600 mb-2">QR Code Payment</p>
              <div class="bg-white rounded-lg p-2 border border-slate-200 inline-block">
                <img src="${paymentFileUrl}" 
                     alt="QR Code for ${person.name}" 
                     class="w-20 h-20 mx-auto"
                     onerror="this.parentElement.innerHTML='<p class=\\'text-xs text-red-500\\'>Failed to load QR</p>'">
              </div>
            </div>
          ` : ''}
          
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
    if (billData && billData.people) {
      billData.people[index].paid = isPaid;
      updatePaymentSummary();
      
      // Update label
      const label = document.querySelector(`label[for="paid-${index}"]`);
      if (label) {
        label.textContent = isPaid ? 'Paid' : 'Mark as paid';
      }
    }
  }

  // Update payment summary
  function updatePaymentSummary() {
    if (billData && billData.people) {
      const paidCount = billData.people.filter(person => person.paid).length;
      const pendingCount = billData.people.length - paidCount;
      
      const paidCountElement = document.getElementById('paid-count');
      if (paidCountElement) paidCountElement.textContent = paidCount;
      
      const pendingCountElement = document.getElementById('pending-count');
      if (pendingCountElement) pendingCountElement.textContent = pendingCount;
    }
  }

  // Print functionality
  function setupPrintFunctionality() {
    document.getElementById('print-bill')?.addEventListener('click', () => {
      window.print();
    });
  }

  // Setup share functionality
  function setupShareFunctionality() {
    const shareBillBtn = document.getElementById('share-bill');
    const shareUrlInput = document.getElementById('share-url');
    const openUrlBtn = document.getElementById('open-url');
    const copyUrlBtn = document.getElementById('copy-url');
    const shareFacebookBtn = document.getElementById('share-facebook');
    const shareTwitterBtn = document.getElementById('share-twitter');
    const shareWhatsappBtn = document.getElementById('share-whatsapp');
    const shareMessengerBtn = document.getElementById('share-messenger');
    const qrCodeContainer = document.getElementById('qr-code');
    
    // Set the current URL
    const currentUrl = window.location.href;
    if (shareUrlInput) {
      shareUrlInput.value = currentUrl;
    }
    
    // Generate QR code
    if (qrCodeContainer) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`;
      qrCodeContainer.innerHTML = `<img src="${qrUrl}" alt="QR Code" class="w-32 h-32 mx-auto">`;
    }
    
    // Share button functionality
    shareBillBtn?.addEventListener('click', () => {
      if (navigator.share) {
        // Use native share API if available
        navigator.share({
          title: 'Split Bill',
          text: 'Check out this bill split',
          url: currentUrl
        }).catch(err => console.log('Error sharing:', err));
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(currentUrl).then(() => {
          // Show success message
          const originalText = shareBillBtn.innerHTML;
          shareBillBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Copied!
          `;
          setTimeout(() => {
            shareBillBtn.innerHTML = originalText;
          }, 2000);
        }).catch(err => {
          console.log('Error copying to clipboard:', err);
          // Fallback to prompt
          prompt('Copy this link:', currentUrl);
        });
      }
    });
    
    // Open URL button
    openUrlBtn?.addEventListener('click', () => {
      window.open(currentUrl, '_blank');
    });
    
    // Copy URL button
    copyUrlBtn?.addEventListener('click', () => {
      navigator.clipboard.writeText(currentUrl).then(() => {
        // Show success message
        const originalText = copyUrlBtn.innerHTML;
        copyUrlBtn.innerHTML = `
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span class="text-sm">Copied!</span>
        `;
        setTimeout(() => {
          copyUrlBtn.innerHTML = originalText;
        }, 2000);
      }).catch(err => {
        console.log('Error copying to clipboard:', err);
        // Fallback to prompt
        prompt('Copy this link:', currentUrl);
      });
    });
    
    // Social share buttons
    shareFacebookBtn?.addEventListener('click', () => {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
      window.open(facebookUrl, '_blank', 'width=600,height=400');
    });
    
    shareTwitterBtn?.addEventListener('click', () => {
      const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=Check out this bill split`;
      window.open(twitterUrl, '_blank', 'width=600,height=400');
    });
    
    shareWhatsappBtn?.addEventListener('click', () => {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent('Check out this bill split: ' + currentUrl)}`;
      window.open(whatsappUrl, '_blank');
    });
    
    shareMessengerBtn?.addEventListener('click', () => {
      const messengerUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(currentUrl)}&app_id=YOUR_APP_ID`;
      window.open(messengerUrl, '_blank', 'width=600,height=400');
    });
  }

  // Setup payment view functionality
  function setupPaymentViewFunctionality() {
    const paymentViewModal = document.getElementById('payment-view-modal');
    const closePaymentModal = document.getElementById('close-payment-modal');
    const paymentContent = document.getElementById('payment-content');

    closePaymentModal?.addEventListener('click', () => {
      paymentViewModal?.classList.add('hidden');
      paymentViewModal?.classList.remove('flex');
    });

    // Hide modal when clicking outside
    paymentViewModal?.addEventListener('click', (e) => {
      if (e.target === paymentViewModal) {
        paymentViewModal?.classList.add('hidden');
        paymentViewModal?.classList.remove('flex');
      }
    });

    // Global function for showing payment modal
    window.showPaymentModal = function(fileUrl) {
      // Determine file type from URL extension (handle query parameters)
      const urlWithoutParams = fileUrl.split('?')[0]; // Remove query parameters
      const fileExtension = urlWithoutParams.split('.').pop().toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
      const isPdf = fileExtension === 'pdf';
      
      if (isImage) {
        // Display image
        paymentContent.innerHTML = `
          <div class="space-y-4">
            <div class="bg-white rounded-lg border border-slate-200 p-4">
              <img src="${fileUrl}" 
                   alt="Payment QR Code" 
                   class="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-sm"
                   onerror="this.parentElement.innerHTML='<p class=\\'text-center text-red-500\\'>Failed to load image</p>'">
            </div>
            <div class="flex justify-center gap-3">
              <button onclick="downloadPayment('${fileUrl}')" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download
              </button>
              <button onclick="printPayment('${fileUrl}')" class="inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Print
              </button>
            </div>
          </div>
        `;
      } else if (isPdf) {
        // Display PDF
        paymentContent.innerHTML = `
          <div class="space-y-4">
            <div class="bg-white rounded-lg border border-slate-200 p-4">
              <iframe src="${fileUrl}" 
                      class="w-full h-96 rounded-lg border border-slate-200"
                      title="Payment Information PDF">
              </iframe>
            </div>
            <div class="flex justify-center gap-3">
              <button onclick="downloadPayment('${fileUrl}')" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download
              </button>
              <button onclick="printPayment('${fileUrl}')" class="inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Print
              </button>
            </div>
          </div>
        `;
      } else {
        // Unsupported file type
        paymentContent.innerHTML = `
          <div class="text-center py-8">
            <p class="text-slate-600">Unsupported file type</p>
            <a href="${fileUrl}" target="_blank" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-4">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              Open in New Tab
            </a>
          </div>
        `;
      }
      
      // Show modal
      paymentViewModal?.classList.remove('hidden');
      paymentViewModal?.classList.add('flex');
    };

    // Global functions for download and print payment
    window.downloadPayment = function(fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = 'payment';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    window.printPayment = function(fileUrl) {
      const urlWithoutParams = fileUrl.split('?')[0]; // Remove query parameters
      const fileExtension = urlWithoutParams.split('.').pop().toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
      const isPdf = fileExtension === 'pdf';
      
      if (isImage) {
        // For images, open in new window and print
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Payment</title>
              <style>
                body { margin: 0; padding: 20px; text-align: center; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <img src="${fileUrl}" alt="Payment QR Code">
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      } else if (isPdf) {
        // For PDFs, open in new window and print
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Payment</title>
              <style>
                body { margin: 0; padding: 0; }
                iframe { width: 100%; height: 100vh; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${fileUrl}"></iframe>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 1000);
      }
    };
  }

  // Setup bill view functionality
  function setupBillViewFunctionality() {
    const viewUploadedBillBtn = document.getElementById('view-uploaded-bill');
    const billViewModal = document.getElementById('bill-view-modal');
    const closeBillModal = document.getElementById('close-bill-modal');
    const billContent = document.getElementById('bill-content');

    viewUploadedBillBtn?.addEventListener('click', () => {
      if (billData && billData.billFileUrl) {
        showBillModal(billData.billFileUrl);
      }
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

    function showBillModal(fileUrl) {
      // Determine file type from URL extension (handle query parameters)
      const urlWithoutParams = fileUrl.split('?')[0]; // Remove query parameters
      const fileExtension = urlWithoutParams.split('.').pop().toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
      const isPdf = fileExtension === 'pdf';
      
      if (isImage) {
        // Display image
        billContent.innerHTML = `
          <div class="space-y-4">
            <div class="bg-white rounded-lg border border-slate-200 p-4">
              <img src="${fileUrl}" 
                   alt="Uploaded Bill" 
                   class="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-sm"
                   onerror="this.parentElement.innerHTML='<p class=\\'text-center text-red-500\\'>Failed to load image</p>'">
            </div>
            <div class="flex justify-center gap-3">
              <button onclick="downloadBill('${fileUrl}')" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download
              </button>
              <button onclick="printBill('${fileUrl}')" class="inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Print
              </button>
            </div>
          </div>
        `;
      } else if (isPdf) {
        // Display PDF
        billContent.innerHTML = `
          <div class="space-y-4">
            <div class="bg-white rounded-lg border border-slate-200 p-4">
              <iframe src="${fileUrl}" 
                      class="w-full h-96 rounded-lg border border-slate-200"
                      title="Uploaded Bill PDF">
              </iframe>
            </div>
            <div class="flex justify-center gap-3">
              <button onclick="downloadBill('${fileUrl}')" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download
              </button>
              <button onclick="printBill('${fileUrl}')" class="inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Print
              </button>
            </div>
          </div>
        `;
      } else {
        // Unsupported file type
        billContent.innerHTML = `
          <div class="text-center py-8">
            <p class="text-slate-600">Unsupported file type</p>
            <a href="${fileUrl}" target="_blank" class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-4">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              Open in New Tab
            </a>
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
    window.downloadBill = function(fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = 'bill';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    window.printBill = function(fileUrl) {
      const urlWithoutParams = fileUrl.split('?')[0]; // Remove query parameters
      const fileExtension = urlWithoutParams.split('.').pop().toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
      const isPdf = fileExtension === 'pdf';
      
      if (isImage) {
        // For images, open in new window and print
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Bill</title>
              <style>
                body { margin: 0; padding: 20px; text-align: center; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <img src="${fileUrl}" alt="Bill">
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      } else if (isPdf) {
        // For PDFs, open in new window and print
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Bill</title>
              <style>
                body { margin: 0; padding: 0; }
                iframe { width: 100%; height: 100vh; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${fileUrl}"></iframe>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 1000);
      }
    };
  }

  // Show error message
  function showErrorMessage(message) {
    // Hide loading message first
    hideLoadingMessage();
    
    // Create error overlay
    const errorOverlay = document.createElement('div');
    errorOverlay.id = 'error-overlay';
    errorOverlay.className = 'fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50';
    errorOverlay.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-4">
        <div class="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-red-900 mb-2">Error Loading Bill</h2>
        <p class="text-red-700 mb-4">${message}</p>
        <button onclick="window.location.reload()" class="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Retry
        </button>
      </div>
    `;
    
    document.body.appendChild(errorOverlay);
  }

  // Show loading message
  function showLoadingMessage() {
    const main = document.querySelector('main');
    if (!main) {
      console.log('Main element not found for loading message');
      return;
    }
    
    console.log('Showing loading message');
    
    // Hide existing content and show loading overlay
    const existingContent = main.querySelector('.max-w-7xl');
    if (existingContent) {
      existingContent.style.display = 'none';
    }
    
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.className = 'fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50';
    loadingOverlay.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8 text-center">
        <div class="flex items-center justify-center w-12 h-12 bg-brand-100 rounded-full mx-auto mb-4">
          <svg class="w-6 h-6 text-brand-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-slate-900 mb-2">Loading Bill Details</h2>
        <p class="text-slate-600">Please wait while we fetch the bill information...</p>
      </div>
    `;
    
    document.body.appendChild(loadingOverlay);
  }
  
  // Hide loading message
  function hideLoadingMessage() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
    
    // Show existing content
    const main = document.querySelector('main');
    if (main) {
      const existingContent = main.querySelector('.max-w-7xl');
      if (existingContent) {
        existingContent.style.display = 'block';
      }
    }
  }

  // Initialize page
  async function initializePage() {
    try {
      showLoadingMessage();
      
      let billNumber = BILL_NUMBER;
      console.log('Bill number from template:', billNumber);
      const apiData = await fetchBillData(billNumber);
      
      billData = transformApiDataToDisplay(apiData);
      console.log('Transformed data:', billData);
      
      console.log('Starting to display bill data...');
      displayBillData(billData);
      console.log('Bill data displayed successfully');
      
      console.log('Setting up print functionality...');
      setupPrintFunctionality();
      console.log('Print functionality setup complete');
      
      console.log('Setting up share functionality...');
      setupShareFunctionality();
      console.log('Share functionality setup complete');
      
      console.log('Setting up bill view functionality...');
      setupBillViewFunctionality();
      console.log('Bill view functionality setup complete');
      
      console.log('Setting up payment view functionality...');
      setupPaymentViewFunctionality();
      console.log('Payment view functionality setup complete');
      
      // Hide loading message
      hideLoadingMessage();
      console.log('Loading message hidden');
    } catch (error) {
      console.error('Failed to initialize page:', error);
      showErrorMessage(error.message || 'Failed to load bill details. Please check the URL and try again.');
    }
  }

  // Initialize when page loads
  document.addEventListener('DOMContentLoaded', function() {
    initializePage();
  });
})();
