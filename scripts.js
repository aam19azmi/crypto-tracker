const API_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=idr&order=market_cap_desc&per_page=50&page=1&sparkline=false';

const tableBody = document.getElementById('cryptoTable');
const loading = document.getElementById('loading');
const errorMsg = document.getElementById('error-msg');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('searchInput');

let cryptoData = [];
let debounceTimer;

async function fetchCrypto() {
    loading.classList.remove('hidden');
    errorMsg.classList.add('hidden');

    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('API Error');
        cryptoData = await res.json();
        renderTable(cryptoData);
    } catch {
        errorMsg.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}

function renderTable(data) {
    tableBody.innerHTML = '';
    emptyState.classList.toggle('hidden', data.length !== 0);

    const highestChange = Math.max(...data.map(c => c.price_change_percentage_24h || 0));

    data.forEach((coin, index) => {
        const change = coin.price_change_percentage_24h || 0;
        const isTrending = change === highestChange && change > 0;

        tableBody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div class="coin-info">
                        <img src="${coin.image}" alt="Logo ${coin.name}" width="28" height="28">
                        <div>
                            <span class="coin-name">
                                ${coin.name}
                                ${isTrending ? '<span class="badge-trending">Hot</span>' : ''}
                            </span>
                            <span class="coin-symbol">${coin.symbol.toUpperCase()}</span>
                        </div>
                    </div>
                </td>
                <td><span class="pulse-icon"></span>${formatRupiah(coin.current_price)}</td>
                <td class="${change >= 0 ? 'text-green' : 'text-red'}">
                    ${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%
                </td>
                <td class="hide-mobile">Rp ${formatShort(coin.total_volume)}</td>
                <td class="hide-mobile">Rp ${formatShort(coin.market_cap)}</td>
            </tr>
        `);
    });
}

function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(num);
}

function formatShort(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + ' T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + ' M';
    return num.toLocaleString('id-ID');
}

searchInput.addEventListener('input', e => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const q = e.target.value.toLowerCase();
        renderTable(
            cryptoData.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.symbol.toLowerCase().includes(q)
            )
        );
    }, 300);
});

fetchCrypto();
setInterval(fetchCrypto, 60000);
