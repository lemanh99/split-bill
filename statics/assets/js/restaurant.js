// Restaurant Bill Calculator JavaScript
class RestaurantBillCalculator {
  constructor() {
    this.currency = 'USD';
    this.currencySymbol = '$';
    this.orderItems = [];
    this.diners = [];
    this.taxRate = 0;
    this.serviceRate = 0;
    this.tipRate = 0;
    this.taxEnabled = false;
    this.serviceEnabled = false;
    this.tipEnabled = false;
    
    this.initializeEventListeners();
    this.initializeDefaultDiners();
    this.updateDisplay();
  }

  initializeEventListeners() {
    // Currency change
    document.getElementById('currency').addEventListener('change', (e) => {
      this.currency = e.target.value;
      this.updateCurrencySymbol();
      this.updateDisplay();
    });

    // Add item button
    document.getElementById('add-item').addEventListener('click', () => {
      this.showItemModal();
    });

    // Item modal events
    document.getElementById('close-item-modal').addEventListener('click', () => this.hideItemModal());
    document.getElementById('cancel-item').addEventListener('click', () => this.hideItemModal());
    document.getElementById('item-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addItem();
    });

    // Tax controls
    document.getElementById('toggle-tax').addEventListener('change', (e) => {
      this.taxEnabled = e.target.checked;
      this.toggleSection('tax-wrap', this.taxEnabled);
      this.updateDisplay();
    });

    document.querySelectorAll('.tax-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.taxRate = parseFloat(e.target.dataset.tax);
        document.getElementById('tax').value = this.taxRate;
        this.updateDisplay();
      });
    });

    document.getElementById('tax').addEventListener('input', (e) => {
      this.taxRate = parseFloat(e.target.value) || 0;
      this.updateDisplay();
    });

    // Service charge controls
    document.getElementById('toggle-service').addEventListener('change', (e) => {
      this.serviceEnabled = e.target.checked;
      this.toggleSection('service-wrap', this.serviceEnabled);
      this.updateDisplay();
    });

    document.querySelectorAll('.service-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.serviceRate = parseFloat(e.target.dataset.service);
        document.getElementById('service').value = this.serviceRate;
        this.updateDisplay();
      });
    });

    document.getElementById('service').addEventListener('input', (e) => {
      this.serviceRate = parseFloat(e.target.value) || 0;
      this.updateDisplay();
    });

    // Tip controls
    document.getElementById('toggle-tip').addEventListener('change', (e) => {
      this.tipEnabled = e.target.checked;
      this.toggleSection('tip-wrap', this.tipEnabled);
      this.updateDisplay();
    });

    document.querySelectorAll('.tip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.tipRate = parseFloat(e.target.dataset.tip);
        document.getElementById('tip').value = this.tipRate;
        this.updateDisplay();
      });
    });

    document.getElementById('tip').addEventListener('input', (e) => {
      this.tipRate = parseFloat(e.target.value) || 0;
      this.updateDisplay();
    });

    // People controls
    document.getElementById('inc-people').addEventListener('click', () => this.addPerson());
    document.getElementById('dec-people').addEventListener('click', () => this.removePerson());
    document.getElementById('people-count').addEventListener('input', (e) => {
      const count = parseInt(e.target.value) || 1;
      this.setPeopleCount(count);
    });

    // Add person button
    document.getElementById('add-person').addEventListener('click', () => this.addPerson());

    // Share and print buttons
    document.getElementById('share-bill').addEventListener('click', () => this.showShareModal());
    document.getElementById('print-bill').addEventListener('click', () => this.printBill());
    document.getElementById('reset-all').addEventListener('click', () => this.resetAll());

    // Share modal events
    document.getElementById('close-share-modal').addEventListener('click', () => this.hideShareModal());
    document.getElementById('copy-url').addEventListener('click', () => this.copyShareUrl());

    // Mobile menu
    document.getElementById('mobile-menu-btn').addEventListener('click', () => this.toggleMobileMenu());
    document.getElementById('mobile-login-btn').addEventListener('click', () => this.showLoginModal());
    document.getElementById('login-btn').addEventListener('click', () => this.showLoginModal());
  }

  initializeDefaultDiners() {
    this.diners = [
      { id: 1, name: 'Person 1', items: [] },
      { id: 2, name: 'Person 2', items: [] }
    ];
    this.updateDinersDisplay();
  }

  updateCurrencySymbol() {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'VND': '₫',
      'AUD': '$'
    };
    this.currencySymbol = symbols[this.currency] || '$';
    
    // Update all currency symbols in the UI
    document.querySelectorAll('.currency-symbol').forEach(el => {
      el.textContent = this.currencySymbol;
    });
  }

  showItemModal() {
    this.populateAssignees();
    document.getElementById('item-modal').classList.remove('hidden');
    document.getElementById('item-modal').classList.add('flex');
    document.getElementById('item-name').focus();
  }

  populateAssignees() {
    const container = document.getElementById('item-assignees');
    container.innerHTML = this.diners.map(diner => `
      <label class="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" id="assignee-${diner.id}" class="h-4 w-4 rounded border-slate-300 text-restaurant-600 focus:ring-restaurant-500">
        <span>${diner.name}</span>
      </label>
    `).join('');
  }

  hideItemModal() {
    document.getElementById('item-modal').classList.add('hidden');
    document.getElementById('item-modal').classList.remove('flex');
    document.getElementById('item-form').reset();
    
    // Reset form submit to add new items
    const form = document.getElementById('item-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      this.addItem();
    };
  }

  addItem() {
    const name = document.getElementById('item-name').value.trim();
    const price = parseFloat(document.getElementById('item-price').value) || 0;
    const quantity = parseInt(document.getElementById('item-quantity').value) || 1;
    const category = document.getElementById('item-category').value;
    const isShared = document.getElementById('item-shared').checked;

    if (!name || price <= 0) {
      alert('Please enter a valid item name and price.');
      return;
    }

    // Get assigned diners
    const assignees = [];
    if (!isShared) {
      this.diners.forEach(diner => {
        const checkbox = document.getElementById(`assignee-${diner.id}`);
        if (checkbox && checkbox.checked) {
          assignees.push(diner.id);
        }
      });
      
      if (assignees.length === 0) {
        alert('Please select at least one person who ordered this item, or mark it as shared.');
        return;
      }
    }

    const item = {
      id: Date.now(),
      name,
      price,
      quantity,
      category,
      total: price * quantity,
      isShared,
      assignees: isShared ? this.diners.map(d => d.id) : assignees
    };

    this.orderItems.push(item);
    this.hideItemModal();
    this.updateOrderItemsDisplay();
    this.updateDisplay();
  }

  removeItem(itemId) {
    this.orderItems = this.orderItems.filter(item => item.id !== itemId);
    this.updateOrderItemsDisplay();
    this.updateDisplay();
  }

  editItem(itemId) {
    const item = this.orderItems.find(i => i.id === itemId);
    if (!item) return;

    // Populate the form with existing data
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-quantity').value = item.quantity;
    document.getElementById('item-category').value = item.category;
    document.getElementById('item-shared').checked = item.isShared;

    // Populate assignees
    this.populateAssignees();
    this.diners.forEach(diner => {
      const checkbox = document.getElementById(`assignee-${diner.id}`);
      if (checkbox) {
        checkbox.checked = item.assignees.includes(diner.id);
      }
    });

    // Show modal
    document.getElementById('item-modal').classList.remove('hidden');
    document.getElementById('item-modal').classList.add('flex');
    document.getElementById('item-name').focus();

    // Update the form submit to edit instead of add
    const form = document.getElementById('item-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      this.updateItem(itemId);
    };
  }

  updateItem(itemId) {
    const name = document.getElementById('item-name').value.trim();
    const price = parseFloat(document.getElementById('item-price').value) || 0;
    const quantity = parseInt(document.getElementById('item-quantity').value) || 1;
    const category = document.getElementById('item-category').value;
    const isShared = document.getElementById('item-shared').checked;

    if (!name || price <= 0) {
      alert('Please enter a valid item name and price.');
      return;
    }

    // Get assigned diners
    const assignees = [];
    if (!isShared) {
      this.diners.forEach(diner => {
        const checkbox = document.getElementById(`assignee-${diner.id}`);
        if (checkbox && checkbox.checked) {
          assignees.push(diner.id);
        }
      });
      
      if (assignees.length === 0) {
        alert('Please select at least one person who ordered this item, or mark it as shared.');
        return;
      }
    }

    // Update the item
    const itemIndex = this.orderItems.findIndex(i => i.id === itemId);
    if (itemIndex !== -1) {
      this.orderItems[itemIndex] = {
        ...this.orderItems[itemIndex],
        name,
        price,
        quantity,
        category,
        total: price * quantity,
        isShared,
        assignees: isShared ? this.diners.map(d => d.id) : assignees
      };
    }

    this.hideItemModal();
    this.updateOrderItemsDisplay();
    this.updateDisplay();

    // Reset form submit to add new items
    const form = document.getElementById('item-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      this.addItem();
    };
  }

  getItemAssigneesDisplay(item) {
    if (item.isShared) {
      return '<span class="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">Everyone</span>';
    }
    
    return item.assignees.map(assigneeId => {
      const diner = this.diners.find(d => d.id === assigneeId);
      return diner ? `<span class="text-xs px-2 py-1 bg-restaurant-100 text-restaurant-600 rounded-full">${diner.name}</span>` : '';
    }).join('');
  }

  updateOrderItemsDisplay() {
    const container = document.getElementById('order-items');
    
    if (this.orderItems.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-slate-500">
          <svg class="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <p class="text-sm">No items added yet</p>
          <p class="text-xs text-slate-400">Click "Add Item" to start building your order</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.orderItems.map(item => `
      <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-900">${item.name}</span>
            <span class="text-xs px-2 py-1 bg-slate-200 text-slate-600 rounded-full">${item.category}</span>
            ${item.isShared ? '<span class="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">Shared</span>' : ''}
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-slate-900">${this.currencySymbol}${item.total.toFixed(2)}</span>
            <button onclick="restaurantCalculator.editItem(${item.id})" class="text-slate-400 hover:text-blue-600 p-1" title="Edit item">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button onclick="restaurantCalculator.removeItem(${item.id})" class="text-slate-400 hover:text-red-600 p-1" title="Remove item">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="text-xs text-slate-500 mb-2">
          ${this.currencySymbol}${item.price.toFixed(2)} × ${item.quantity}
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-600">Ordered by:</span>
          <div class="flex flex-wrap gap-1">
            ${this.getItemAssigneesDisplay(item)}
          </div>
        </div>
      </div>
    `).join('');
  }

  addPerson() {
    const newId = Math.max(...this.diners.map(d => d.id), 0) + 1;
    this.diners.push({
      id: newId,
      name: `Person ${newId}`,
      items: []
    });
    this.updatePeopleCount();
    this.updateDinersDisplay();
    this.updateDisplay();
  }

  removePerson() {
    if (this.diners.length > 1) {
      this.diners.pop();
      this.updatePeopleCount();
      this.updateDinersDisplay();
      this.updateDisplay();
    }
  }

  setPeopleCount(count) {
    if (count < 1) count = 1;
    if (count > 20) count = 20; // Reasonable limit
    
    while (this.diners.length < count) {
      this.addPerson();
    }
    while (this.diners.length > count) {
      this.removePerson();
    }
    
    this.updateDinersDisplay();
    this.updateDisplay();
  }

  updatePeopleCount() {
    document.getElementById('people-count').value = this.diners.length;
  }

  updateDinersDisplay() {
    const container = document.getElementById('diners-list');
    container.innerHTML = this.diners.map(diner => `
      <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
        <div class="w-8 h-8 bg-restaurant-100 text-restaurant-700 rounded-full flex items-center justify-center text-sm font-medium">
          ${diner.id}
        </div>
        <input type="text" value="${diner.name}" class="flex-1 text-sm bg-transparent border-none focus:outline-none focus:ring-0" 
               onchange="restaurantCalculator.updateDinerName(${diner.id}, this.value)">
      </div>
    `).join('');
  }

  updateDinerName(id, name) {
    const diner = this.diners.find(d => d.id === id);
    if (diner) {
      diner.name = name.trim() || `Person ${id}`;
    }
  }

  toggleSection(sectionId, show) {
    const section = document.getElementById(sectionId);
    if (show) {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  }

  calculateTotals() {
    const subtotal = this.orderItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = this.taxEnabled ? (subtotal * this.taxRate / 100) : 0;
    const serviceAmount = this.serviceEnabled ? (subtotal * this.serviceRate / 100) : 0;
    const tipAmount = this.tipEnabled ? (subtotal * this.tipRate / 100) : 0;
    const total = subtotal + taxAmount + serviceAmount + tipAmount;

    // Calculate per-person amounts based on their items
    const perPersonAmounts = this.calculatePerPersonAmounts(subtotal, taxAmount, serviceAmount, tipAmount);

    return {
      subtotal,
      taxAmount,
      serviceAmount,
      tipAmount,
      total,
      perPersonAmounts
    };
  }

  calculatePerPersonAmounts(subtotal, taxAmount, serviceAmount, tipAmount) {
    const perPersonAmounts = {};
    
    // Initialize all diners with 0
    this.diners.forEach(diner => {
      perPersonAmounts[diner.id] = {
        name: diner.name,
        itemsTotal: 0,
        taxAmount: 0,
        serviceAmount: 0,
        tipAmount: 0,
        total: 0
      };
    });

    // Calculate each person's item total
    this.orderItems.forEach(item => {
      const itemPerPerson = item.total / item.assignees.length;
      item.assignees.forEach(assigneeId => {
        if (perPersonAmounts[assigneeId]) {
          perPersonAmounts[assigneeId].itemsTotal += itemPerPerson;
        }
      });
    });

    // Calculate proportional tax, service, and tip for each person
    this.diners.forEach(diner => {
      const personData = perPersonAmounts[diner.id];
      if (personData.itemsTotal > 0) {
        const proportion = personData.itemsTotal / subtotal;
        personData.taxAmount = taxAmount * proportion;
        personData.serviceAmount = serviceAmount * proportion;
        personData.tipAmount = tipAmount * proportion;
        personData.total = personData.itemsTotal + personData.taxAmount + personData.serviceAmount + personData.tipAmount;
      }
    });

    return perPersonAmounts;
  }

  updateDisplay() {
    const totals = this.calculateTotals();
    
    // Update summary
    document.getElementById('out-subtotal').textContent = `${this.currencySymbol}${totals.subtotal.toFixed(2)}`;
    document.getElementById('out-tax').textContent = `${this.currencySymbol}${totals.taxAmount.toFixed(2)}`;
    document.getElementById('out-service').textContent = `${this.currencySymbol}${totals.serviceAmount.toFixed(2)}`;
    document.getElementById('out-tip').textContent = `${this.currencySymbol}${totals.tipAmount.toFixed(2)}`;
    document.getElementById('out-total').textContent = `${this.currencySymbol}${totals.total.toFixed(2)}`;

    // Update per person breakdown
    this.updatePerPersonDisplay(totals);
  }

  updatePerPersonDisplay(totals) {
    const container = document.getElementById('per-person-breakdown');
    
    container.innerHTML = this.diners.map(diner => {
      const personData = totals.perPersonAmounts[diner.id];
      const hasItems = personData.itemsTotal > 0;
      
      return `
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-slate-700">${diner.name}</span>
            <span class="text-sm font-semibold text-slate-900">${this.currencySymbol}${personData.total.toFixed(2)}</span>
          </div>
          ${hasItems ? `
            <div class="text-xs text-slate-500 space-y-1">
              <div class="flex justify-between">
                <span>Items:</span>
                <span>${this.currencySymbol}${personData.itemsTotal.toFixed(2)}</span>
              </div>
              ${this.taxEnabled ? `
                <div class="flex justify-between">
                  <span>Tax:</span>
                  <span>${this.currencySymbol}${personData.taxAmount.toFixed(2)}</span>
                </div>
              ` : ''}
              ${this.serviceEnabled ? `
                <div class="flex justify-between">
                  <span>Service:</span>
                  <span>${this.currencySymbol}${personData.serviceAmount.toFixed(2)}</span>
                </div>
              ` : ''}
              ${this.tipEnabled ? `
                <div class="flex justify-between">
                  <span>Tip:</span>
                  <span>${this.currencySymbol}${personData.tipAmount.toFixed(2)}</span>
                </div>
              ` : ''}
            </div>
          ` : `
            <div class="text-xs text-slate-400 italic">No items ordered</div>
          `}
        </div>
      `;
    }).join('');
  }

  showShareModal() {
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(JSON.stringify(this.getShareData()))}`;
    document.getElementById('share-url').value = shareUrl;
    document.getElementById('share-modal').classList.remove('hidden');
    document.getElementById('share-modal').classList.add('flex');
    
    // Generate QR code (simplified - in real app you'd use a QR library)
    this.generateQRCode(shareUrl);
  }

  hideShareModal() {
    document.getElementById('share-modal').classList.add('hidden');
    document.getElementById('share-modal').classList.remove('flex');
  }

  generateQRCode(url) {
    const qrContainer = document.getElementById('qr-code');
    qrContainer.innerHTML = `
      <div class="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
        <div class="text-center">
          <svg class="w-8 h-8 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
          </svg>
          <p class="text-xs text-slate-500">QR Code</p>
        </div>
      </div>
    `;
  }

  copyShareUrl() {
    const urlInput = document.getElementById('share-url');
    urlInput.select();
    urlInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
      document.execCommand('copy');
      // Show success feedback
      const button = document.getElementById('copy-url');
      const originalText = button.innerHTML;
      button.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  printBill() {
    const totals = this.calculateTotals();
    const restaurantName = document.getElementById('restaurant-name').value || 'Restaurant';
    
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="text-align: center; margin-bottom: 20px;">${restaurantName}</h2>
        
        <div style="margin-bottom: 20px;">
          <h3>Order Items:</h3>
          ${this.orderItems.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>${item.name} (${item.quantity}x)</span>
              <span>${this.currencySymbol}${item.total.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        
        <div style="border-top: 1px solid #ccc; padding-top: 10px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Subtotal:</span>
            <span>${this.currencySymbol}${totals.subtotal.toFixed(2)}</span>
          </div>
          ${this.taxEnabled ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Tax (${this.taxRate}%):</span>
              <span>${this.currencySymbol}${totals.taxAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          ${this.serviceEnabled ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Service (${this.serviceRate}%):</span>
              <span>${this.currencySymbol}${totals.serviceAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          ${this.tipEnabled ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Tip (${this.tipRate}%):</span>
              <span>${this.currencySymbol}${totals.tipAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; font-weight: bold; border-top: 1px solid #ccc; padding-top: 5px; margin-top: 10px;">
            <span>Total:</span>
            <span>${this.currencySymbol}${totals.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3>Per Person Breakdown:</h3>
          ${this.diners.map(diner => {
            const personData = totals.perPersonAmounts[diner.id];
            const hasItems = personData.itemsTotal > 0;
            
            return `
              <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px;">
                  <span>${diner.name}:</span>
                  <span>${this.currencySymbol}${personData.total.toFixed(2)}</span>
                </div>
                ${hasItems ? `
                  <div style="font-size: 12px; color: #6b7280; margin-left: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                      <span>Items:</span>
                      <span>${this.currencySymbol}${personData.itemsTotal.toFixed(2)}</span>
                    </div>
                    ${this.taxEnabled ? `
                      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span>Tax:</span>
                        <span>${this.currencySymbol}${personData.taxAmount.toFixed(2)}</span>
                      </div>
                    ` : ''}
                    ${this.serviceEnabled ? `
                      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span>Service:</span>
                        <span>${this.currencySymbol}${personData.serviceAmount.toFixed(2)}</span>
                      </div>
                    ` : ''}
                    ${this.tipEnabled ? `
                      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span>Tip:</span>
                        <span>${this.currencySymbol}${personData.tipAmount.toFixed(2)}</span>
                      </div>
                    ` : ''}
                  </div>
                ` : `
                  <div style="font-size: 12px; color: #9ca3af; font-style: italic; margin-left: 10px;">
                    No items ordered
                  </div>
                `}
              </div>
            `;
          }).join('')}
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #666; margin-top: 30px;">
          Generated by Restaurant Bill Splitter
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }

  resetAll() {
    if (confirm('Are you sure you want to reset everything? This will clear all items and settings.')) {
      this.orderItems = [];
      this.diners = [
        { id: 1, name: 'Person 1', items: [] },
        { id: 2, name: 'Person 2', items: [] }
      ];
      this.taxRate = 0;
      this.serviceRate = 0;
      this.tipRate = 0;
      this.taxEnabled = false;
      this.serviceEnabled = false;
      this.tipEnabled = false;
      
      // Reset UI
      document.getElementById('restaurant-name').value = '';
      document.getElementById('toggle-tax').checked = false;
      document.getElementById('toggle-service').checked = false;
      document.getElementById('toggle-tip').checked = false;
      document.getElementById('tax').value = '';
      document.getElementById('service').value = '';
      document.getElementById('tip').value = '';
      
      this.toggleSection('tax-wrap', false);
      this.toggleSection('service-wrap', false);
      this.toggleSection('tip-wrap', false);
      
      // Reset form submit to add new items
      const form = document.getElementById('item-form');
      form.onsubmit = (e) => {
        e.preventDefault();
        this.addItem();
      };
      
      this.updateOrderItemsDisplay();
      this.updateDinersDisplay();
      this.updatePeopleCount();
      this.updateDisplay();
    }
  }

  getShareData() {
    return {
      orderItems: this.orderItems,
      diners: this.diners,
      taxRate: this.taxRate,
      serviceRate: this.serviceRate,
      tipRate: this.tipRate,
      taxEnabled: this.taxEnabled,
      serviceEnabled: this.serviceEnabled,
      tipEnabled: this.tipEnabled,
      currency: this.currency,
      restaurantName: document.getElementById('restaurant-name').value
    };
  }

  loadShareData(data) {
    this.orderItems = data.orderItems || [];
    this.diners = data.diners || this.diners;
    this.taxRate = data.taxRate || 0;
    this.serviceRate = data.serviceRate || 0;
    this.tipRate = data.tipRate || 0;
    this.taxEnabled = data.taxEnabled || false;
    this.serviceEnabled = data.serviceEnabled || false;
    this.tipEnabled = data.tipEnabled || false;
    this.currency = data.currency || 'USD';
    
    // Update UI
    document.getElementById('restaurant-name').value = data.restaurantName || '';
    document.getElementById('currency').value = this.currency;
    document.getElementById('toggle-tax').checked = this.taxEnabled;
    document.getElementById('toggle-service').checked = this.serviceEnabled;
    document.getElementById('toggle-tip').checked = this.tipEnabled;
    document.getElementById('tax').value = this.taxRate;
    document.getElementById('service').value = this.serviceRate;
    document.getElementById('tip').value = this.tipRate;
    
    this.toggleSection('tax-wrap', this.taxEnabled);
    this.toggleSection('service-wrap', this.serviceEnabled);
    this.toggleSection('tip-wrap', this.tipEnabled);
    
    this.updateCurrencySymbol();
    this.updateOrderItemsDisplay();
    this.updateDinersDisplay();
    this.updatePeopleCount();
    this.updateDisplay();
  }

  toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
  }

  showLoginModal() {
    // This would show a login modal - placeholder for now
    alert('Login functionality would be implemented here');
  }
}

// Initialize the calculator when the page loads
let restaurantCalculator;

document.addEventListener('DOMContentLoaded', () => {
  restaurantCalculator = new RestaurantBillCalculator();
  
  // Check for shared data in URL
  const urlParams = new URLSearchParams(window.location.search);
  const shareData = urlParams.get('data');
  if (shareData) {
    try {
      const data = JSON.parse(decodeURIComponent(shareData));
      restaurantCalculator.loadShareData(data);
    } catch (e) {
      console.error('Failed to load shared data:', e);
    }
  }
});

// Make calculator globally available for inline event handlers
window.restaurantCalculator = restaurantCalculator;
