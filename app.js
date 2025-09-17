// app.js (ganti seluruh file dengan ini)

// elemen form
const paketSelect = document.getElementById("paket");
const hargaInput = document.getElementById("harga");
const modalInput = document.getElementById("modal");

// data offline profit per paket (sudah ada)
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

// update harga/modal saat paket dipilih
paketSelect.addEventListener("change", function() {
  const option = this.options[this.selectedIndex];
  hargaInput.value = option.getAttribute("data-harga") || "";
  modalInput.value = option.getAttribute("data-modal") || "";
});

// variabel untuk edit
let currentEditRow = null;

// ====== TAMBAH DATA ======
function tambahData() {
  const today = new Date();
  const tanggal = today.toISOString().split("T")[0];

  const paket = paketSelect.value;
  const jumlah = parseInt(document.getElementById("jumlah").value) || 1;
  const hargaPerBox = parseFloat(hargaInput.value) || 0;
  const harga = hargaPerBox * jumlah;
  const modalPerBox = parseFloat(modalInput.value) || 0;
  const modal = modalPerBox * jumlah;
  const komisi = parseFloat(document.getElementById("komisi").value) || 0;
  const fee = parseFloat(document.getElementById("fee").value) || 0;

  if (!paket) {
    alert("Harap pilih paket.");
    return;
  }

  const potonganKomisi = (komisi / 100) * (harga / jumlah); // per box
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
    <td data-harga="${harga}">Rp ${harga.toLocaleString()}</td>
    <td data-komisi="${komisi}">${komisi}%</td>
    <td data-fee="${fee}">Rp ${fee.toLocaleString()}</td>
    <td data-potongan="${totalPotongan}">Rp ${totalPotongan.toLocaleString()}</td>
    <td data-omzet="${omzetBersih}">Rp ${omzetBersih.toLocaleString()}</td>
    <td data-modal="${modal}">Rp ${modal.toLocaleString()}</td>
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

// ====== EDIT ROW (buka modal) ======
function editRow(btn) {
  currentEditRow = btn.closest("tr");
  if (!currentEditRow) return;

  // isi pilihan paket di modal (clone option text + data)
  const editPaket = document.getElementById("editPaket");
  editPaket.innerHTML = "";
  Array.from(paketSelect.options).forEach(opt => {
    const o = document.createElement("option");
    o.value = opt.textContent;
    o.text = opt.textContent;
    if (opt.dataset.harga) o.dataset.harga = opt.dataset.harga;
    if (opt.dataset.modal) o.dataset.modal = opt.dataset.modal;
    editPaket.appendChild(o);
  });

  const cells = currentEditRow.querySelectorAll("td");
  const paketText = cells[1].textContent;
  // pilih paket yang sesuai
  Array.from(editPaket.options).forEach(o => {
    o.selected = (o.text === paketText);
  });

  // isi nilai pada modal
  const jumlah = currentEditRow.querySelector("td[data-box]")?.getAttribute("data-box") || cells[2].textContent;
  document.getElementById("editJumlah").value = parseInt(jumlah) || 1;

  const komisi = currentEditRow.querySelector("td[data-komisi]")?.getAttribute("data-komisi") || cells[4].textContent.replace("%","").trim();
  document.getElementById("editKomisi").value = parseFloat(komisi) || 0;

  const fee = currentEditRow.querySelector("td[data-fee]")?.getAttribute("data-fee") || cells[5].textContent.replace(/[^\d]/g,"");
  document.getElementById("editFee").value = parseFloat(fee) || 0;

  // tampilkan modal
  document.getElementById("editModal").style.display = "flex";
  document.getElementById("editModal").setAttribute("aria-hidden", "false");
}

// ====== SIMPAN HASIL EDIT ======
function saveEdit() {
  if (!currentEditRow) return;

  const editPaketEl = document.getElementById("editPaket");
  const paket = editPaketEl.value;
  const jumlah = parseInt(document.getElementById("editJumlah").value) || 1;
  const komisi = parseFloat(document.getElementById("editKomisi").value) || 0;
  const fee = parseFloat(document.getElementById("editFee").value) || 0;

  // dapatkan harga/modal per box dari option dataset jika tersedia
  const selectedOpt = editPaketEl.selectedOptions[0];
  const hargaPerBox = parseFloat(selectedOpt.dataset.harga) || parseFloat(hargaInput.value) || 0;
  const modalPerBox = parseFloat(selectedOpt.dataset.modal) || parseFloat(modalInput.value) || 0;

  const harga = hargaPerBox * jumlah;
  const modal = modalPerBox * jumlah;
  const potonganKomisi = (komisi / 100) * (harga / jumlah);
  const totalPotongan = (potonganKomisi + fee) * jumlah;
  const omzetBersih = harga - totalPotongan;
  const profitOnline = omzetBersih - modal;
  const profitOffline = (profitOfflineData[paket] || 0) * jumlah;
  const totalProfit = profitOnline + profitOffline;

  // update currentEditRow cells (sama struktur seperti tambahData)
  const tds = currentEditRow.querySelectorAll("td");
  tds[1].textContent = paket;
  tds[2].setAttribute("data-box", jumlah); tds[2].textContent = jumlah;
  tds[3].setAttribute("data-harga", harga); tds[3].textContent = `Rp ${harga.toLocaleString()}`;
  tds[4].setAttribute("data-komisi", komisi); tds[4].textContent = `${komisi}%`;
  tds[5].setAttribute("data-fee", fee); tds[5].textContent = `Rp ${fee.toLocaleString()}`;
  tds[6].setAttribute("data-potongan", totalPotongan); tds[6].textContent = `Rp ${totalPotongan.toLocaleString()}`;
  tds[7].setAttribute("data-omzet", omzetBersih); tds[7].textContent = `Rp ${omzetBersih.toLocaleString()}`;
  tds[8].setAttribute("data-modal", modal); tds[8].textContent = `Rp ${modal.toLocaleString()}`;
  tds[9].setAttribute("data-online", profitOnline); tds[9].textContent = `Rp ${profitOnline.toLocaleString()}`;
  tds[10].setAttribute("data-offline", profitOffline); tds[10].textContent = `Rp ${profitOffline.toLocaleString()}`;
  tds[11].setAttribute("data-total", totalProfit); tds[11].textContent = `Rp ${totalProfit.toLocaleString()}`;

  // tutup modal
  document.getElementById("editModal").style.display = "none";
  document.getElementById("editModal").setAttribute("aria-hidden", "true");
  currentEditRow = null;

  // update rekap & simpan
  updateRekap();
  saveToLocalStorage();
  // notif singkat
  alert("Baris berhasil disimpan.");
}

// ====== BATAL EDIT ======
function cancelEdit() {
  currentEditRow = null;
  document.getElementById("editModal").style.display = "none";
  document.getElementById("editModal").setAttribute("aria-hidden", "true");
}

// ====== HAPUS ROW ======
function hapusRow(btn) {
  btn.closest("tr").remove();
  updateRekap();
  saveToLocalStorage(); // pastikan simpan setelah hapus
}

// ====== UPDATE REKAP ======
function updateRekap() {
  let totalBox = 0, totalOnline = 0, totalOffline = 0, totalAll = 0;
  const rows = document.querySelectorAll("#dataTable tbody tr");

  rows.forEach(row => {
    totalBox += parseInt(row.querySelector("td[data-box]")?.getAttribute("data-box")) || 0;
    totalOnline += parseFloat(row.querySelector("td[data-online]")?.getAttribute("data-online")) || 0;
    totalOffline += parseFloat(row.querySelector("td[data-offline]")?.getAttribute("data-offline")) || 0;
    totalAll += parseFloat(row.querySelector("td[data-total]")?.getAttribute("data-total")) || 0;
  });

  document.getElementById("totalBox").textContent = "Total Box Terjual: " + totalBox.toLocaleString();
  document.getElementById("totalOnline").textContent = "Total Profit Online: Rp " + totalOnline.toLocaleString();
  document.getElementById("totalOffline").textContent = "Total Profit Offline: Rp " + totalOffline.toLocaleString();
  document.getElementById("totalAll").textContent = "Total Profit Keseluruhan: Rp " + totalAll.toLocaleString();

  // simpan rekap juga
  saveToLocalStorage();
}

// ====== SIMPAN & AMBIL DATA DARI LOCAL STORAGE ======
function saveToLocalStorage() {
  const rows = document.querySelectorAll("#dataTable tbody tr");
  const data = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells.length > 0) {
      // ambil nilai numerik dari data attributes bila ada
      const obj = {
        tanggal: cells[0].textContent,
        paket: cells[1].textContent,
        jumlah: parseInt(cells[2].getAttribute("data-box")) || parseInt(cells[2].textContent) || 0,
        harga: parseFloat(cells[3].getAttribute("data-harga")) || parseFloat(cells[3].textContent.replace(/[^\d.-]/g,'')) || 0,
        komisi: parseFloat(cells[4].getAttribute("data-komisi")) || parseFloat(cells[4].textContent.replace("%","")) || 0,
        fee: parseFloat(cells[5].getAttribute("data-fee")) || parseFloat(cells[5].textContent.replace(/[^\d.-]/g,'')) || 0,
        potongan: parseFloat(cells[6].getAttribute("data-potongan")) || parseFloat(cells[6].textContent.replace(/[^\d.-]/g,'')) || 0,
        omzet: parseFloat(cells[7].getAttribute("data-omzet")) || parseFloat(cells[7].textContent.replace(/[^\d.-]/g,'')) || 0,
        modal: parseFloat(cells[8].getAttribute("data-modal")) || parseFloat(cells[8].textContent.replace(/[^\d.-]/g,'')) || 0,
        profitOnline: parseFloat(cells[9].getAttribute("data-online")) || parseFloat(cells[9].textContent.replace(/[^\d.-]/g,'')) || 0,
        profitOffline: parseFloat(cells[10].getAttribute("data-offline")) || parseFloat(cells[10].textContent.replace(/[^\d.-]/g,'')) || 0,
        totalProfit: parseFloat(cells[11].getAttribute("data-total")) || parseFloat(cells[11].textContent.replace(/[^\d.-]/g,'')) || 0
      };
      data.push(obj);
    }
  });

  // simpan rekap numeric juga
  const recap = {
    totalBox: parseInt(document.getElementById("totalBox").textContent.replace(/[^\d]/g,'')) || 0,
    totalOnline: parseFloat(document.getElementById("totalOnline").textContent.replace(/[^\d]/g,'')) || 0,
    totalOffline: parseFloat(document.getElementById("totalOffline").textContent.replace(/[^\d]/g,'')) || 0,
    totalAll: parseFloat(document.getElementById("totalAll").textContent.replace(/[^\d]/g,'')) || 0
  };

  localStorage.setItem("gofoodData", JSON.stringify(data));
  localStorage.setItem("gofoodRecap", JSON.stringify(recap));
}

// ambil data dari localStorage dan tampilkan di tabel
function loadFromLocalStorage() {
  const stored = localStorage.getItem("gofoodData");
  const recapStored = localStorage.getItem("gofoodRecap");
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  if (stored) {
    const data = JSON.parse(stored);
    data.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.tanggal}</td>
        <td>${item.paket}</td>
        <td data-box="${item.jumlah}">${item.jumlah}</td>
        <td data-harga="${item.harga}">Rp ${Number(item.harga).toLocaleString()}</td>
        <td data-komisi="${item.komisi}">${item.komisi}%</td>
        <td data-fee="${item.fee}">Rp ${Number(item.fee).toLocaleString()}</td>
        <td data-potongan="${item.potongan}">Rp ${Number(item.potongan).toLocaleString()}</td>
        <td data-omzet="${item.omzet}">Rp ${Number(item.omzet).toLocaleString()}</td>
        <td data-modal="${item.modal}">Rp ${Number(item.modal).toLocaleString()}</td>
        <td data-online="${item.profitOnline}">Rp ${Number(item.profitOnline).toLocaleString()}</td>
        <td data-offline="${item.profitOffline}">Rp ${Number(item.profitOffline).toLocaleString()}</td>
        <td data-total="${item.totalProfit}">Rp ${Number(item.totalProfit).toLocaleString()}</td>
        <td class="actions">
          <button onclick="editRow(this)">Edit</button>
          <button onclick="hapusRow(this)">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

if (recapStored) {
  const recap = JSON.parse(recapStored);
  document.getElementById("totalBox").textContent = (recap.totalBox || 0).toLocaleString();
  document.getElementById("totalOnline").textContent = (recap.totalOnline || 0).toLocaleString();
  document.getElementById("totalOffline").textContent = (recap.totalOffline || 0).toLocaleString();
  document.getElementById("totalAll").textContent = (recap.totalAll || 0).toLocaleString();
  } else {
    updateRekap(); // hitung ulang jika belum ada recap tersimpan
  }
}

// ====== HAPUS SEMUA DATA LOCAL STORAGE ======
function clearLocalStorage() {
  if (confirm("Yakin ingin menghapus semua data?")) {
    localStorage.removeItem("gofoodData");
    localStorage.removeItem("gofoodRecap");
    document.querySelector("#dataTable tbody").innerHTML = "";
    document.getElementById("totalBox").textContent = "Total Box Terjual: 0";
    document.getElementById("totalOnline").textContent = "Total Profit Online: Rp 0";
    document.getElementById("totalOffline").textContent = "Total Profit Offline: Rp 0";
    document.getElementById("totalAll").textContent = "Total Profit Keseluruhan: Rp 0";
  }
}

// ====== EXPORT EXCEL (tanpa kolom Aksi, tambahkan baris TOTAL) ======
function exportExcel() {
  const table = document.getElementById("dataTable");
  const clone = table.cloneNode(true);

  // hapus kolom aksi (last cell) di semua baris
  clone.querySelectorAll("tr").forEach(row => {
    if (row.lastElementChild) row.removeChild(row.lastElementChild);
  });

  const sheet = XLSX.utils.table_to_sheet(clone);

  // ambil total dari rekap (yang sudah formatted string)
  const totalBox = document.getElementById("totalBox").textContent.replace("Total Box Terjual: ", "");
  const totalOnline = document.getElementById("totalOnline").textContent.replace("Total Profit Online: Rp ", "");
  const totalOffline = document.getElementById("totalOffline").textContent.replace("Total Profit Offline: Rp ", "");
  const totalAll = document.getElementById("totalAll").textContent.replace("Total Profit Keseluruhan: Rp ", "");

  // tempatkan TOTAL beberapa baris setelah terakhir
  const range = XLSX.utils.decode_range(sheet["!ref"]);
  const lastRow = range.e.r + 2; // 1 baris kosong lalu total

  XLSX.utils.sheet_add_aoa(sheet, [
    [],
    ["TOTAL", "", totalBox, "", "", "", "", "", "", `Rp ${totalOnline}`, `Rp ${totalOffline}`, `Rp ${totalAll}`]
  ], { origin: `A${lastRow}` });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Profit");

  const today = new Date().toISOString().split("T")[0];
  const fileName = `laporan_GoFood_${today}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

// panggil loadFromLocalStorage saat halaman selesai dimuat
window.addEventListener("load", loadFromLocalStorage);

// tutup modal kalau klik di luar konten modal
window.addEventListener("click", function(e) {
  const modal = document.getElementById("editModal");
  if (modal && modal.style.display === "flex" && e.target === modal) {
    cancelEdit();
  }
});
