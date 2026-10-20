// --- CẤU HÌNH THÔNG TIN SMART CONTRACT ---
const CONTRACT_ADDRESS = "0x28428b974E80c7C9267adf914C02bAA76D1E5AB2"; 
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
body { background-color: #f0f4f8; color: #333; line-height: 1.6; }

const CONTRACT_ABI = [
    {
      "inputs": [{"internalType":"uint256","name":"maSo","type":"uint256"},{"internalType":"uint256","name":"dienTich","type":"uint256"},{"internalType":"address","name":"chuDauTien","type":"address"}],
      "name": "dangKyThuaDat",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType":"uint256","name":"maSo","type":"uint256"},{"internalType":"address","name":"chuMoi","type":"address"}],
      "name": "chuyenNhuong",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType":"uint256","name":"maSo","type":"uint256"}],
      "name": "xemChuSoHuu",
      "outputs": [{"internalType":"address","name":"","type":"address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType":"uint256","name":"maSo","type":"uint256"}],
      "name": "xemDienTich",
      "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType":"uint256","name":"maSo","type":"uint256"}],
      "name": "xemLichSuChuyenNhuong",
      "outputs": [{"components":[{"internalType":"address","name":"chuCu","type":"address"},{"internalType":"address","name":"chuMoi","type":"address"},{"internalType":"uint256","name":"thoiGian","type":"uint256"}], "internalType":"struct QuanLyDatDai.ChuyenNhuong[]", "name":"","type":"tuple[]"}],
      "stateMutability": "view",
      "type": "function"
    }
];
/* Header & Navbar - Xanh biển đậm */
.navbar { background: #0d3b66; color: white; display: flex; justify-content: space-between; align-items: center; padding: 1rem 5%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.brand { font-size: 1.3rem; font-weight: bold; letter-spacing: 0.5px; }
.navbar nav a { color: #caf0f8; text-decoration: none; margin: 0 15px; font-weight: 500; transition: color 0.2s; }
.navbar nav a:hover { color: #00b4d8; }
.network { background: #0077b6; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 500; }

let provider;
let signer;
/* Hero Section - Gradient xanh biển */
.hero { background: linear-gradient(135deg, #0077b6, #0d3b66); color: white; text-align: center; padding: 4.5rem 1rem; }
.eyebrow { font-size: 0.85rem; letter-spacing: 2px; color: #90e0ef; margin-bottom: 10px; font-weight: 600; }
.hero h1 { font-size: 2.4rem; margin-bottom: 15px; font-weight: 700; }
.hero p { margin-bottom: 25px; color: #caf0f8; font-size: 1.05rem; }

async function getContractWithSigner() {
    if (!window.ethereum) {
        alert("Vui lòng cài đặt ví MetaMask!");
        throw new Error("MetaMask not found");
    }
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
/* Nút "Bắt đầu tra cứu" mới cực kỳ nổi bật */
.hero-button {
    display: inline-block;
    background: #00b4d8;
    color: white;
    padding: 12px 28px;
    border-radius: 30px;
    text-decoration: none;
    font-weight: bold;
    font-size: 1rem;
    box-shadow: 0 4px 15px rgba(0, 180, 216, 0.4);
    transition: all 0.3s ease;
}
.hero-button:hover {
    background: #90e0ef;
    color: #0d3b66;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 180, 216, 0.6);
}

// Tra cứu thửa đất
document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const maSo = document.getElementById('searchId').value.trim();
    const resultDiv = document.getElementById('landInfo');
    resultDiv.innerHTML = "⏳ Đang truy vấn trên mạng Sepolia...";
    
    try {
        const readProvider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : new ethers.providers.JsonRpcProvider("https://rpc.sepolia.org");
        const readContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readProvider);
        
        const chuSoHuu = await readContract.xemChuSoHuu(maSo);
        const dienTich = await readContract.xemDienTich(maSo);
        const lichSu = await readContract.xemLichSuChuyenNhuong(maSo);
/* Container & Cards */
.container { max-width: 1000px; margin: -35px auto 40px; padding: 0 20px; position: relative; }
.stats { display: flex; gap: 20px; margin-bottom: 30px; }
.stat { background: white; flex: 1; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center; border-bottom: 4px solid #0077b6; }
.stat span { display: block; font-size: 0.85rem; color: #666; margin-bottom: 5px; }
.stat strong { font-size: 1.6rem; color: #0d3b66; }

        let historyHtml = lichSu.length === 0 ? "<li>Chưa có lịch sử chuyển nhượng</li>" : lichSu.map(item => `<li>Từ: <code>${item.chuCu}</code> ➔ Đến: <code>${item.chuMoi}</code></li>`).join('');
/* Panel Styling */
.panel { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 30px; }
.panel h2 { margin-bottom: 8px; color: #0d3b66; font-size: 1.4rem; font-weight: 600; }
.panel p { color: #666; font-size: 0.95rem; margin-bottom: 20px; }

        resultDiv.innerHTML = `
            ✅ <strong>Thông tin thửa đất số ${maSo}:</strong><br>
            - <strong>Diện tích:</strong> ${dienTich.toString()} m²<br>
            - <strong>Chủ sở hữu hiện tại:</strong> <code>${chuSoHuu}</code><br>
            - <strong>Lịch sử giao dịch:</strong><ul>${historyHtml}</ul>
        `;
    } catch (err) {
        resultDiv.innerHTML = `❌ Không tìm thấy thửa đất số ${maSo} hoặc lỗi hệ thống!`;
    }
});
/* Two Columns Layout */
.two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
label { display: block; margin-top: 15px; margin-bottom: 6px; font-weight: 600; font-size: 0.9rem; color: #444; }
input { width: 100%; height: 45px; padding: 0 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem; transition: border-color 0.2s; }
input:focus { border-color: #0077b6; outline: none; }

// Đăng ký thửa đất
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const maSo = document.getElementById('landId').value.trim();
    const dienTich = document.getElementById('area').value.trim();
    const chuDauTien = document.getElementById('firstOwner').value.trim();
button[type="submit"].full-button { 
    margin-top: 20px; 
    background: #0077b6; 
    color: white; 
    border: none; 
    height: 48px; 
    border-radius: 8px; 
    font-weight: bold; 
    font-size: 1rem; 
    cursor: pointer; 
    width: 100%; 
    transition: background 0.2s; 
}
button[type="submit"].full-button:hover { background: #0d3b66; }

    try {
        const contractWithSigner = await getContractWithSigner();
        alert("⏳ Vui lòng xác nhận giao dịch trên MetaMask...");
        const tx = await contractWithSigner.dangKyThuaDat(maSo, dienTich, chuDauTien);
        alert("🚀 Đã gửi giao dịch! TxHash: " + tx.hash);
        await tx.wait();
        alert("🎉 Đăng ký thửa đất thành công!");
    } catch (err) {
        alert("❌ Lỗi: " + (err.data?.message || err.message));
    }
});
/* Result Box */
.result { margin-top: 20px; background: #e0f2fe; padding: 20px; border-radius: 8px; border-left: 5px solid #0077b6; font-size: 0.98rem; color: #0d3b66; }
.result ul { margin-top: 10px; padding-left: 20px; }
.result li { margin-bottom: 5px; }

// Chuyển nhượng thửa đất
document.getElementById('transferForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const maSo = document.getElementById('transferId').value.trim();
    const chuMoi = document.getElementById('newOwner').value.trim();
.notice { text-align: center; font-size: 0.85rem; color: #777; margin-top: 25px; }
footer { text-align: center; padding: 25px; color: #666; font-size: 0.9rem; border-top: 1px solid #eaeaea; background: white; margin-top: 40px; }

    try {
        const contractWithSigner = await getContractWithSigner();
        alert("⏳ Vui lòng xác nhận giao dịch chuyển nhượng trên MetaMask...");
        const tx = await contractWithSigner.chuyenNhuong(maSo, chuMoi);
        alert("🚀 Đã gửi giao dịch chuyển nhượng! TxHash: " + tx.hash);
        await tx.wait();
        alert("🎉 Chuyển nhượng thành công!");
    } catch (err) {
        alert("❌ Lỗi: " + (err.data?.message || err.message));
    }
});
@media (max-width: 768px) {
    .two-columns { grid-template-columns: 1fr; }
    .stats { flex-direction: column; }
}
