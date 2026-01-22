const categoriesColors = {
  food:'#f97316', transport:'#06b6d4', entertainment:'#ec4899',
  freelance:'#a78bfa', salary:'#3b82f6', default:'#9ca3af'
};

let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

function saveTransactions() { localStorage.setItem('transactions', JSON.stringify(transactions)); }

function renderTransactions() {
  const container = document.getElementById('transactions');
  container.innerHTML='';
  const sorted = transactions.sort((a,b)=>new Date(b.date)-new Date(a.date));
  sorted.slice(0,5).forEach(t=>{
    const div = document.createElement('div');
    div.className='transaction';
    const iconColor = categoriesColors[t.category] || categoriesColors.default;
    div.innerHTML=`
      <div class="transaction-left">
        <div class="icon" style="background:${iconColor}">💰</div>
        <div>
          <div class="desc">${t.description || '-'}</div>
          <div class="date-cat">${new Date(t.date).toLocaleDateString()} · ${t.category || 'General'}</div>
        </div>
      </div>
      <div class="amount ${t.type}">${t.type==='income'?'+':'-'}$${parseFloat(t.amount).toFixed(2)}</div>
    `;
    container.appendChild(div);
  });
  if(sorted.length===0) container.innerHTML='<p style="color:#6b7280; text-align:center;">No transactions yet</p>';
}

function renderStats() {
  const income = transactions.filter(t=>t.type==='income').reduce((s,t)=>s+parseFloat(t.amount),0);
  const expenses = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+parseFloat(t.amount),0);
  document.getElementById('income').textContent=`$${income.toFixed(2)}`;
  document.getElementById('expenses').textContent=`$${expenses.toFixed(2)}`;
  document.getElementById('balance').textContent=`$${(income-expenses).toFixed(2)}`;
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
  return color;
}

let categoryChart;
function renderCategories() {
  const ctx = document.getElementById('categoryChart').getContext('2d');
  const catTotals = {};
  
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category || 'General';
    if (!catTotals[cat]) catTotals[cat] = 0;
    catTotals[cat] += parseFloat(t.amount);
  });

  const labels = Object.keys(catTotals);
  const data = Object.values(catTotals);
  const backgroundColors = labels.map((c, i) => categoriesColors[c] || getRandomColor());

  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors
      }]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = data.reduce((sum, val) => sum + val, 0);
              const value = context.raw;
              const percent = ((value / total) * 100).toFixed(1);
              return `${context.label}: $${value.toFixed(2)} (${percent}%)`;
            }
          }
        }
      }
    }
  });
}


function openModal(){ document.getElementById('modal').classList.add('active'); }
function closeModal(){ document.getElementById('modal').classList.remove('active'); }

function addTransaction() {
  const type = document.getElementById('type').value;
  const description = document.getElementById('description').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value.trim();
  const date = document.getElementById('date').value;
  const notes = document.getElementById('notes').value.trim();

  if (!amount || amount <= 0) { alert('Amount must be a number greater than 0'); return; }
  if (!date) { alert('Date is required'); return; }

  transactions.push({ type, description, amount, category, date, notes });
  saveTransactions();
  renderTransactions();
  renderStats();
  renderCategories();
  closeModal();

  document.getElementById('description').value = '';
  document.getElementById('amount').value = '';
  document.getElementById('category').value = '';
  document.getElementById('type').value = 'expense';
  document.getElementById('date').value = '';
  document.getElementById('notes').value = '';
}

document.getElementById('date').value=new Date().toISOString().split('T')[0];
renderTransactions(); renderStats(); renderCategories();

function clearAllTransactions() {
  if(confirm("Are you sure you want to delete all transactions?")) {
    transactions = [];
    saveTransactions();
    renderTransactions();
    renderStats();
    renderCategories();
  }
}
