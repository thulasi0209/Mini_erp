const API_BASE = 'http://127.0.0.1:8000';

const vendorForm = document.getElementById('vendor-form');
const orderForm = document.getElementById('order-form');
const vendorList = document.getElementById('vendor-list');
const orderList = document.getElementById('order-list');
const inventoryList = document.getElementById('inventory-list');

async function fetchJson(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const errorMessage = data?.detail || data?.message || response.statusText;
      throw new Error(errorMessage || 'Server error');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
}

async function loadVendors() {
  try {
    const vendors = await fetchJson(`${API_BASE}/vendors`);
    vendorList.innerHTML = vendors.length
      ? vendors.map(renderVendorItem).join('')
      : '<li class="list-item"><div class="item-meta">No vendors available.</div></li>';
  } catch (error) {
    alert(`Unable to load vendors: ${error.message}`);
  }
}

function renderVendorItem(vendor) {
  return `
    <li class="list-item">
      <div class="item-row">
        <span class="item-title">${escapeHtml(vendor.name)}</span>
        <span class="item-meta">ID: ${vendor.id}</span>
      </div>
      <div class="item-meta">Phone: ${escapeHtml(vendor.phone)}</div>
    </li>
  `;
}

async function loadOrders() {
  try {
    const orders = await fetchJson(`${API_BASE}/orders`);
    orderList.innerHTML = orders.length
      ? orders.map(renderOrderItem).join('')
      : '<li class="list-item"><div class="item-meta">No orders available.</div></li>';
  } catch (error) {
    alert(`Unable to load orders: ${error.message}`);
  }
}

function renderOrderItem(order) {
  const status = order.received ? 'received' : 'pending';
  const buttonMarkup = order.received
    ? ''
    : `<button class="action-button" data-order-id="${order.id}">Mark Received</button>`;

  return `
    <li class="list-item">
      <div class="item-row">
        <div>
          <div class="item-title">${escapeHtml(order.item_name)}</div>
          <div class="item-meta">Vendor ID: ${order.vendor_id} · Quantity: ${order.quantity}</div>
        </div>
        <span class="badge ${status}">${status === 'received' ? 'Received' : 'Pending'}</span>
      </div>
      <div class="item-row">
        <div class="item-meta">Order ID: ${order.id}</div>
        ${buttonMarkup}
      </div>
    </li>
  `;
}

async function loadInventory() {
  try {
    const inventory = await fetchJson(`${API_BASE}/inventory`);
    inventoryList.innerHTML = inventory.length
      ? inventory.map(renderInventoryItem).join('')
      : '<li class="list-item"><div class="item-meta">No inventory items found.</div></li>';
  } catch (error) {
    alert(`Unable to load inventory: ${error.message}`);
  }
}

function renderInventoryItem(item) {
  return `
    <li class="list-item">
      <div class="item-row">
        <span class="item-title">${escapeHtml(item.name)}</span>
        <span class="item-meta">Quantity: ${item.quantity}</span>
      </div>
      ${item.vendor_id ? `<div class="item-meta">Vendor ID: ${item.vendor_id}</div>` : ''}
    </li>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

vendorForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('vendor-name').value.trim();
  const phone = document.getElementById('vendor-phone').value.trim();

  if (!name || !phone) {
    alert('Please provide both name and phone for the vendor.');
    return;
  }

  try {
    await fetchJson(`${API_BASE}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    });

    alert('Vendor created successfully.');
    vendorForm.reset();
    loadVendors();
  } catch (error) {
    alert(`Failed to create vendor: ${error.message}`);
  }
});

orderForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const vendorId = parseInt(document.getElementById('order-vendor-id').value, 10);
  const itemName = document.getElementById('order-item').value.trim();
  const quantity = parseInt(document.getElementById('order-quantity').value, 10);

  if (!vendorId || !itemName || quantity <= 0) {
    alert('Please provide vendor ID, item name, and quantity.');
    return;
  }

  try {
    await fetchJson(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor_id: vendorId, item_name: itemName, quantity }),
    });

    alert('Order created successfully.');
    orderForm.reset();
    loadOrders();
  } catch (error) {
    alert(`Failed to create order: ${error.message}`);
  }
});

orderList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-order-id]');
  if (!button) return;

  const orderId = button.getAttribute('data-order-id');
  if (!orderId) return;

  try {
    await fetchJson(`${API_BASE}/orders/${orderId}/receive`, {
      method: 'POST',
    });

    alert('Order marked as received.');
    loadOrders();
    loadInventory();
  } catch (error) {
    alert(`Failed to mark order received: ${error.message}`);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  loadVendors();
  loadOrders();
  loadInventory();
});
