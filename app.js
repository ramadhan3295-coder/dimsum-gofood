  const paketSelect = document.getElementById("paket");
  const hargaInput = document.getElementById("harga");
  const modalInput = document.getElementById("modal");

  const profitOfflineData = {
    "Dimsum medium frozen 5 pcs": 4000,
    "Dimsum medium frozen 10 pcs": 7000,
    "Dimsum medium frozen 20 pcs": 12000,
    "Dimsum medium frozen 25 pcs": 12500,
    "Dimsum medium mentai 5 pcs": 4100,
    "Dimsum medium mentai 10 pcs": 8600,
    "Dimsum medium mentai 20 pcs": 15800,
    "Dimsum medium mentai 25 pcs": 18800,
    "Dimsum medium original 5 pcs": 2800,
    "Dimsum medium original 10 pcs": 6000,
    "Dimsum medium original 20 pcs": 12800,
    "Dimsum medium original 25 pcs": 16800
  };

  paketSelect.addEventListener("change", function() {
    const option = this.options[this.selectedIndex];
    hargaInput.value = option.getAttribute("data-harga") || "";
    modalInput.value = option.getAttribute("data-modal") || "";
  });

  function tambahData() {
    const today = new Date();
    const tanggal = today.toISOString().split("T")[0];

    const paket = paketSelect.value;
    const jumlah = parseInt(document.getElementById("jumlah").value) || 1;
    const harga = (parseFloat(hargaInput.value) || 0) * jumlah;
    const modal = (parseFloat(modalInput.value) || 0) * jumlah;
    const komisi = parseFloat(document.getElementById("komisi").value) || 0;
    const fee = parseFloat(document.getElementById("fee").value) || 0;

    if (!paket) {
      alert("Harap pilih paket.");
      return;
    }

    const potonganKomisi = (komisi/100) * (harga / jumlah); // per box
    const totalPotongan = (potonganKomisi + fee) * jumlah;
    const omzetBersih = harga - totalPotongan;
    const profitOnline = omzetBersih - modal;
    const profitOffline = (profitOfflineData[paket] || 0) * jumlah;
    const totalProfit = profitOnline + profitOffline;

    const table = document.getElementById("dataTable").getElementsByTagName("tbody")[0];
    const row = table.insertRow();

    row.innerHTML = `
      <td>${tanggal}</td>
      <td>${paket}</td>
      <td data-box="${jumlah}">${jumlah}</td>
      <td>Rp ${harga.toLocaleString()}</td>
      <td>${komisi}%</td>
      <td>Rp ${fee.toLocaleString()}</td>
      <td>Rp ${totalPotongan.toLocaleString()}</td>
      <td>Rp ${omzetBersih.toLocaleString()}</td>
      <td>Rp ${modal.toLocaleString()}</td>
      <td data-online="${profitOnline}">Rp ${profitOnline.toLocaleString()}</td>
      <td data-offline="${profitOffline}">Rp ${profitOffline.toLocaleString()}</td>
      <td data-total="${totalProfit}">Rp ${totalProfit.toLocaleString()}</td>
      <td class="actions">
        <button onclick="editRow(this)">Edit</button>
        <button onclick="hapusRow(this)">Hapus</button>
      </td>
    `;

    updateRekap();
    saveToLocalStorage(); // simpan setelah tambah
  }

  function editRow(btn) {
    const row = btn.closest("tr");
    const cells = row.querySelectorAll("td");
    document.getElementById("paket").value = cells[1].textContent;
    document.getElementById("jumlah").value = cells[2].getAttribute("data-box");
    document.getElementById("harga").value = cells[3].textContent.replace(/[^\d]/g, "");
    document.getElementById("komisi").value = cells[4].textContent.replace("%","");
    document.getElementById("fee").value = cells[5].textContent.replace(/[^\d]/g, "");
    document.getElementById("modal").value = cells[8].textContent.replace(/[^\d]/g, "");
    row.remove();
    updateRekap();
  }

function hapusRow(btn) {
  btn.closest("tr").remove();
  updateRekap();          // hitung ulang total
  saveToLocalStorage();   // simpan perubahan
}

function updateRekap() {
  let totalBox = 0;
  let totalOnline = 0;
  let totalOffline = 0;
  let totalAll = 0;

  const rows = document.querySelectorAll("#dataTable tbody tr");

  rows.forEach(row => {
    const box = parseInt(row.querySelector("td[data-box]")?.getAttribute("data-box")) || 0;
    const online = parseFloat(row.querySelector("td[data-online]")?.getAttribute("data-online")) || 0;
    const offline = parseFloat(row.querySelector("td[data-offline]")?.getAttribute("data-offline")) || 0;
    const total = parseFloat(row.querySelector("td[data-total]")?.getAttribute("data-total")) || 0;

    totalBox += box;
    totalOnline += online;
    totalOffline += offline;
    totalAll += total;
  });

  document.getElementById("totalBox").textContent =
    "Total Box Terjual: " + totalBox.toLocaleString();

  document.getElementById("totalOnline").textContent =
    "Total Profit Online: Rp " + totalOnline.toLocaleString();

  document.getElementById("totalOffline").textContent =
    "Total Profit Offline: Rp " + totalOffline.toLocaleString();

  document.getElementById("totalAll").textContent =
    "Total Profit Keseluruhan: Rp " + totalAll.toLocaleString();

  // simpan nilai terbaru ke localStorage
  saveToLocalStorage();
}
  
// ====== SIMPAN & AMBIL DATA DARI LOCAL STORAGE ======
// simpan array data transaksi ke localStorage
function saveToLocalStorage() {
  // simpan isi tabel
  const rows = document.querySelectorAll("#dataTable tbody tr");
  const data = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells.length > 0) {
      data.push({
        tanggal: cells[0].textContent,
        paket: cells[1].textContent,
        jumlah: cells[2].getAttribute("data-box") || cells[2].textContent,
        harga: cells[3].textContent,
        komisi: cells[4].textContent,
        fee: cells[5].textContent,
        potongan: cells[6].textContent,
        omzet: cells[7].textContent,
        modal: cells[8].textContent,
        profitOnline: cells[9].textContent,
        profitOffline: cells[10].textContent,
        totalProfit: cells[11].textContent
      });
    }
  });

  // simpan nilai rekap
  const recap = {
    totalBox: document.getElementById("totalBox").textContent,
    totalOnline: document.getElementById("totalOnline").textContent,
    totalOffline: document.getElementById("totalOffline").textContent,
    totalAll: document.getElementById("totalAll").textContent
  };

  localStorage.setItem("gofoodData", JSON.stringify(data));
  localStorage.setItem("gofoodRecap", JSON.stringify(recap));
}

function loadFromLocalStorage() {
  const stored = localStorage.getItem("gofoodData");
  const recapStored = localStorage.getItem("gofoodRecap");

  // tampilkan tabel
  if (stored) {
    const data = JSON.parse(stored);
    const tbody = document.querySelector("#dataTable tbody");
    tbody.innerHTML = "";

    data.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.tanggal}</td>
        <td>${item.paket}</td>
        <td data-box="${item.jumlah}">${item.jumlah}</td>
        <td>${item.harga}</td>
        <td>${item.komisi}</td>
        <td>${item.fee}</td>
        <td>${item.potongan}</td>
        <td>${item.omzet}</td>
        <td>${item.modal}</td>
        <td data-online="${item.profitOnline}">${item.profitOnline}</td>
        <td data-offline="${item.profitOffline}">${item.profitOffline}</td>
        <td data-total="${item.totalProfit}">${item.totalProfit}</td>
        <td class="actions">
          <button onclick="editRow(this)">Edit</button>
          <button onclick="hapusRow(this)">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // tampilkan rekap
  if (recapStored) {
    const recap = JSON.parse(recapStored);
    document.getElementById("totalBox").textContent = recap.totalBox;
    document.getElementById("totalOnline").textContent = recap.totalOnline;
    document.getElementById("totalOffline").textContent = recap.totalOffline;
    document.getElementById("totalAll").textContent = recap.totalAll;
  } else {
    updateRekap(); // kalau belum ada, hitung ulang
  }
}

// ====== HAPUS SEMUA DATA LOCAL STORAGE ======
function clearLocalStorage() {
  if (confirm("Yakin ingin menghapus semua data?")) {
    localStorage.removeItem("gofoodData");
    localStorage.removeItem("gofoodRecap"); // hapus juga rekap

    document.querySelector("#dataTable tbody").innerHTML = "";

    document.getElementById("totalBox").textContent = "Total Box Terjual: 0";
    document.getElementById("totalOnline").textContent = "Total Profit Online: Rp 0";
    document.getElementById("totalOffline").textContent = "Total Profit Offline: Rp 0";
    document.getElementById("totalAll").textContent = "Total Profit Keseluruhan: Rp 0";
  }
}

function exportExcel() {
  const table = document.getElementById("dataTable");

  // --- 1. buat salinan tabel tanpa kolom aksi ---
  const clone = table.cloneNode(true);
  clone.querySelectorAll("tr").forEach(row => {
    if (row.lastElementChild) {
      row.removeChild(row.lastElementChild);
    }
  });

  // --- 2. convert ke sheet ---
  const sheet = XLSX.utils.table_to_sheet(clone);

  // --- 3. ambil data total dari rekap ---
  const totalBox = document.getElementById("totalBox").textContent.replace("Total Box Terjual: ", "");
  const totalOnline = document.getElementById("totalOnline").textContent.replace("Total Profit Online: ", "");
  const totalOffline = document.getElementById("totalOffline").textContent.replace("Total Profit Offline: ", "");
  const totalAll = document.getElementById("totalAll").textContent.replace("Total Profit Keseluruhan: ", "");

  // cari jumlah baris yang sudah ada (untuk tahu posisi baris total)
  const range = XLSX.utils.decode_range(sheet["!ref"]);
  const lastRow = range.e.r + 2; // baris terakhir + 2 (supaya ada jarak 1 baris kosong)

  // --- 4. tambahkan judul dan nilai total ---
  XLSX.utils.sheet_add_aoa(sheet, [
    ["TOTAL", "", totalBox, "", "", "", "", "", "", totalOnline, totalOffline, totalAll]
  ], { origin: `A${lastRow}` });

  // --- 5. buat workbook & simpan ---
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Profit");

  const today = new Date().toISOString().split("T")[0];
  const fileName = `laporan_GoFood_${today}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

// panggil loadFromLocalStorage saat halaman selesai dimuat
window.addEventListener("load", loadFromLocalStorage);