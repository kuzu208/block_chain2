```javascript
// =====================================================
// ĐẤTCHAIN - QUẢN LÝ QUYỀN SỬ DỤNG ĐẤT
// Sử dụng ethers.js v5.7.2 và MetaMask
// Mạng thử nghiệm: Ethereum Sepolia
// =====================================================

// 1. CẤU HÌNH SMART CONTRACT
const CONTRACT_ADDRESS = "0x28428b974E80c7C9267adf914C02bAA76D1E5AB2";

const SEPOLIA_CHAIN_ID = "0xaa36a7";
const SEPOLIA_RPC = "https://rpc.sepolia.org";
const EXPLORER_URL = "https://sepolia.etherscan.io";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// ABI phải khớp với smart contract đã triển khai.
const CONTRACT_ABI = [
    {
        inputs: [
            { internalType: "uint256", name: "maSo", type: "uint256" },
            { internalType: "uint256", name: "dienTich", type: "uint256" },
            { internalType: "address", name: "chuDauTien", type: "address" }
        ],
        name: "dangKyThuaDat",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "maSo", type: "uint256" },
            { internalType: "address", name: "chuMoi", type: "address" }
        ],
        name: "chuyenNhuong",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "maSo", type: "uint256" }
        ],
        name: "xemChuSoHuu",
        outputs: [
            { internalType: "address", name: "", type: "address" }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "maSo", type: "uint256" }
        ],
        name: "xemDienTich",
        outputs: [
            { internalType: "uint256", name: "", type: "uint256" }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint256", name: "maSo", type: "uint256" }
        ],
        name: "xemLichSuChuyenNhuong",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "chuCu",
                        type: "address"
                    },
                    {
                        internalType: "address",
                        name: "chuMoi",
                        type: "address"
                    },
                    {
                        internalType: "uint256",
                        name: "thoiGian",
                        type: "uint256"
                    }
                ],
                internalType: "struct QuanLyDatDai.ChuyenNhuong[]",
                name: "",
                type: "tuple[]"
            }
        ],
        stateMutability: "view",
        type: "function"
    }
];

// 2. KHỞI TẠO PROVIDER ĐỌC DỮ LIỆU
// Dùng RPC Sepolia để tra cứu mà không bắt buộc kết nối ví.
const readProvider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);

const readContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    readProvider
);

// 3. BIẾN TRẠNG THÁI GIAO DIỆN
// Đây là số giao dịch thành công trong phiên hiện tại,
// không phải tổng số thửa đất hoặc giao dịch toàn blockchain.
let sessionRegistered = 0;
let sessionTransferred = 0;

// 4. CÁC HÀM HỖ TRỢ
function getElement(id) {
    const element = document.getElementById(id);

    if (!element) {
        throw new Error("Không tìm thấy phần tử HTML: " + id);
    }

    return element;
}

function showMessage(message, status = "info") {
    const result = getElement("landInfo");

    result.replaceChildren();
    result.className = "result";

    if (status === "success") {
        result.classList.add("status-success");
    } else if (status === "error") {
        result.classList.add("status-error");
    } else if (status === "loading") {
        result.classList.add("status-loading");
    }

    result.textContent = message;
}

function createElement(tag, text, className) {
    const element = document.createElement(tag);

    // Dùng textContent để tránh chèn HTML từ dữ liệu đầu vào.
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    return element;
}

function appendTransactionLink(parent, hash) {
    const link = document.createElement("a");

    link.href = EXPLORER_URL + "/tx/" + encodeURIComponent(hash);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Xem giao dịch trên Sepolia Etherscan";

    parent.appendChild(link);
}

function getErrorMessage(error) {
    if (error && error.code === 4001) {
        return "Bạn đã từ chối giao dịch trên MetaMask.";
    }

    if (error && error.code === "ACTION_REJECTED") {
        return "Bạn đã từ chối giao dịch.";
    }

    if (error && error.code === "NETWORK_ERROR") {
        return "Không thể kết nối mạng. Hãy kiểm tra Internet và RPC Sepolia.";
    }

    if (error && error.code === "CALL_EXCEPTION") {
        return "Smart contract từ chối yêu cầu hoặc dữ liệu không hợp lệ.";
    }

    return (
        error?.reason ||
        error?.data?.message ||
        error?.error?.message ||
        error?.message ||
        "Đã xảy ra lỗi không xác định."
    );
}

function validatePositiveInteger(value, label) {
    const normalized = String(value).trim();

    if (!/^\d+$/.test(normalized)) {
        throw new Error(label + " phải là số nguyên dương.");
    }

    // ethers.js v5 hỗ trợ số nguyên lớn thông qua BigNumber.
    // Không chuyển sang Number để tránh mất độ chính xác.
    const parsed = ethers.BigNumber.from(normalized);

    if (parsed.lte(0)) {
        throw new Error(label + " phải lớn hơn 0.");
    }

    if (parsed.gt(ethers.constants.MaxUint256)) {
        throw new Error(label + " vượt giới hạn uint256.");
    }

    return parsed;
}

function validateAddress(address, label) {
    const normalized = String(address).trim();

    if (!ethers.utils.isAddress(normalized)) {
        throw new Error(label + " không phải địa chỉ Ethereum hợp lệ.");
    }

    const checksumAddress = ethers.utils.getAddress(normalized);

    if (checksumAddress.toLowerCase() === ZERO_ADDRESS.toLowerCase()) {
        throw new Error(label + " không được là địa chỉ ví 0x000...000.");
    }

    return checksumAddress;
}

function setButtonLoading(form, loading, loadingText) {
    const button = form.querySelector('button[type="submit"]');

    if (!button) return;

    if (loading) {
        button.dataset.originalText = button.textContent;
        button.textContent = loadingText;
        button.disabled = true;
    } else {
        button.textContent = button.dataset.originalText || button.textContent;
        button.disabled = false;
        delete button.dataset.originalText;
    }
}

function updateStats() {
    getElement("totalLand").textContent = String(sessionRegistered);
    getElement("totalTransfer").textContent = String(sessionTransferred);
}

// 5. KẾT NỐI METAMASK
async function getContractWithSigner() {
    if (!window.ethereum) {
        throw new Error(
            "Không tìm thấy MetaMask. Hãy cài MetaMask và mở khóa ví."
        );
    }

    // Yêu cầu người dùng cấp quyền truy cập tài khoản.
    await window.ethereum.request({
        method: "eth_requestAccounts"
    });

    const chainId = await window.ethereum.request({
        method: "eth_chainId"
    });

    if (chainId.toLowerCase() !== SEPOLIA_CHAIN_ID) {
        throw new Error(
            "Ví đang ở sai mạng. Hãy chuyển MetaMask sang Sepolia Test Network."
        );
    }

    const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
    );

    const signer = provider.getSigner();

    return new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
    );
}

// 6. CẬP NHẬT THÔNG TIN VÍ
async function updateWalletStatus() {
    const networkStatus = getElement("networkStatus");
    const networkDot = getElement("networkDot");
    const walletAddress = getElement("walletAddress");

    networkDot.className = "network-dot";

    if (!window.ethereum) {
        networkStatus.textContent = "Chưa cài MetaMask";
        walletAddress.textContent = "Hãy cài đặt MetaMask để gửi giao dịch.";
        networkDot.classList.add("error");
        return;
    }

    try {
        const accounts = await window.ethereum.request({
            method: "eth_accounts"
        });

        const chainId = await window.ethereum.request({
            method: "eth_chainId"
        });

        if (chainId.toLowerCase() !== SEPOLIA_CHAIN_ID) {
            networkStatus.textContent = "Sai mạng";
            networkDot.classList.add("error");
        } else {
            networkStatus.textContent = "Sepolia";
            networkDot.classList.add("connected");
        }

        if (accounts.length > 0) {
            walletAddress.textContent =
                "Ví hiện tại: " + accounts[0];
        } else {
            walletAddress.textContent = "Ví chưa được kết nối.";
        }
    } catch (error) {
        networkStatus.textContent = "Không thể kiểm tra ví";
        walletAddress.textContent = getErrorMessage(error);
        networkDot.classList.add("error");
    }
}

// 7. NÚT KẾT NỐI VÍ
getElement("connectWallet").addEventListener("click", async function () {
    try {
        if (!window.ethereum) {
            throw new Error(
                "Bạn cần cài đặt MetaMask trước khi kết nối."
            );
        }

        await window.ethereum.request({
            method: "eth_requestAccounts"
        });

        await updateWalletStatus();

        showMessage(
            "Đã yêu cầu kết nối ví. Hãy kiểm tra trạng thái mạng và địa chỉ ví ở phía trên.",
            "success"
        );
    } catch (error) {
        showMessage("Lỗi kết nối ví: " + getErrorMessage(error), "error");
    }
});

// Cập nhật khi người dùng đổi tài khoản hoặc đổi mạng.
if (window.ethereum) {
    window.ethereum.on("accountsChanged", updateWalletStatus);
    window.ethereum.on("chainChanged", function () {
        updateWalletStatus();
    });
}

// 8. TRA CỨU THỬA ĐẤT
getElement("searchForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const form = event.currentTarget;
    setButtonLoading(form, true, "Đang tra cứu...");

    try {
        const maSo = validatePositiveInteger(
            getElement("searchId").value,
            "Mã số thửa đất"
        );

        showMessage("Đang truy vấn smart contract trên Sepolia...", "loading");

        // Đọc dữ liệu trực tiếp từ blockchain qua RPC.
        const chuSoHuu = await readContract.xemChuSoHuu(maSo);

        if (
            chuSoHuu.toLowerCase() === ZERO_ADDRESS.toLowerCase()
        ) {
            showMessage(
                "Thửa đất số " + maSo.toString() +
                " chưa được đăng ký hoặc chưa có chủ sở hữu.",
                "error"
            );
            return;
        }

        const [dienTich, lichSu] = await Promise.all([
            readContract.xemDienTich(maSo),
            readContract.xemLichSuChuyenNhuong(maSo)
        ]);

        const result = getElement("landInfo");
        result.replaceChildren();
        result.className = "result status-success";

        result.appendChild(
            createElement("h3", "Thông tin thửa đất số " + maSo.toString())
        );

        result.appendChild(
            createElement("p", "Diện tích: " + dienTich.toString() + " m²")
        );

        result.appendChild(
            createElement("p", "Chủ sở hữu hiện tại: " + chuSoHuu)
        );

        // Tạo đường dẫn mở địa chỉ ví trên Sepolia Etherscan.
        const ownerLink = document.createElement("a");
        ownerLink.href = EXPLORER_URL + "/address/" + chuSoHuu;
        ownerLink.target = "_blank";
        ownerLink.rel = "noopener noreferrer";
        ownerLink.textContent = "Xem địa chỉ chủ sở hữu trên Etherscan";

        result.appendChild(ownerLink);

        result.appendChild(
            createElement("h4", "Lịch sử chuyển nhượng")
        );

        const list = document.createElement("ul");

        if (lichSu.length === 0) {
            list.appendChild(
                createElement("li", "Chưa có lịch sử chuyển nhượng.")
            );
        } else {
            lichSu.forEach(function (item) {
                const li = document.createElement("li");

                li.appendChild(
                    createElement("p", "Chủ cũ: " + item.chuCu)
                );

                li.appendChild(
                    createElement("p", "Chủ mới: " + item.chuMoi)
                );

                const timestamp = item.thoiGian.toString();
                const timestampNumber = Number(timestamp);

                let dateText = "Không có thời gian";

                if (
                    Number.isSafeInteger(timestampNumber) &&
                    timestampNumber > 0
                ) {
                    dateText = new Date(
                        timestampNumber * 1000
                    ).toLocaleString("vi-VN");
                }

                li.appendChild(
                    createElement("p", "Thời gian: " + dateText)
                );

                list.appendChild(li);
            });
        }

        result.appendChild(list);

    } catch (error) {
        showMessage(
            "Lỗi tra cứu: " + getErrorMessage(error),
            "error"
        );
    } finally {
        setButtonLoading(form, false);
    }
});

// 9. ĐĂNG KÝ THỬA ĐẤT
getElement("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const form = event.currentTarget;
    setButtonLoading(form, true, "Đang xử lý...");

    try {
        const maSo = validatePositiveInteger(
            getElement("landId").value,
            "Mã số thửa đất"
        );

        const dienTich = validatePositiveInteger(
            getElement("area").value,
            "Diện tích"
        );

        const chuDauTien = validateAddress(
            getElement("firstOwner").value,
            "Địa chỉ chủ sở hữu đầu tiên"
        );

        showMessage(
            "Đang kiểm tra MetaMask và mạng Sepolia...",
            "loading"
        );

        const contract = await getContractWithSigner();

        showMessage(
            "Hãy xác nhận giao dịch đăng ký đất trong MetaMask.",
            "loading"
        );

        const tx = await contract.dangKyThuaDat(
            maSo,
            dienTich,
            chuDauTien
        );

        const result = getElement("landInfo");
        result.replaceChildren();
        result.className = "result status-loading";

        result.appendChild(
            createElement("p", "Đã gửi giao dịch đăng ký.")
        );

        result.appendChild(
            createElement("p", "TxHash: " + tx.hash)
        );

        appendTransactionLink(result, tx.hash);

        result.appendChild(
            createElement(
                "p",
                "Đang chờ giao dịch được xác nhận trên Sepolia..."
            )
        );

        // Chỉ tăng bộ đếm sau khi giao dịch được xác nhận.
        const receipt = await tx.wait();

        if (receipt.status !== 1) {
            throw new Error("Giao dịch đăng ký không thành công.");
        }

        sessionRegistered++;
        updateStats();

        result.replaceChildren();
        result.className = "result status-success";

        result.appendChild(
            createElement(
                "h3",
                "Đăng ký thửa đất thành công!"
            )
        );

        result.appendChild(
            createElement("p", "Mã thửa đất: " + maSo.toString())
        );

        result.appendChild(
            createElement("p", "Diện tích: " + dienTich.toString() + " m²")
        );

        result.appendChild(
            createElement("p", "Chủ sở hữu đầu tiên: " + chuDauTien)
        );

        result.appendChild(
            createElement("p", "TxHash: " + tx.hash)
        );

        appendTransactionLink(result, tx.hash);

        result.appendChild(
            createElement(
                "p",
                "Bạn có thể tra cứu lại mã thửa đất để kiểm tra dữ liệu."
            )
        );

        // Điền mã thửa đất vừa đăng ký vào ô tra cứu.
        getElement("searchId").value = maSo.toString();

    } catch (error) {
        showMessage(
            "Lỗi đăng ký thửa đất: " + getErrorMessage(error),
            "error"
        );
    } finally {
        setButtonLoading(form, false);
    }
});

// 10. CHUYỂN NHƯỢNG THỬA ĐẤT
getElement("transferForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const form = event.currentTarget;
    setButtonLoading(form, true, "Đang xử lý...");

    try {
        const maSo = validatePositiveInteger(
            getElement("transferId").value,
            "Mã số thửa đất"
        );

        const chuMoi = validateAddress(
            getElement("newOwner").value,
            "Địa chỉ chủ sở hữu mới"
        );

        showMessage(
            "Đang kiểm tra chủ sở hữu và mạng Sepolia...",
            "loading"
        );

        // Kiểm tra thửa đất tồn tại theo địa chỉ chủ sở hữu.
        const chuHienTai = await readContract.xemChuSoHuu(maSo);

        if (
            chuHienTai.toLowerCase() === ZERO_ADDRESS.toLowerCase()
        ) {
            throw new Error("Thửa đất chưa được đăng ký.");
        }

        if (chuHienTai.toLowerCase() === chuMoi.toLowerCase()) {
            throw new Error(
                "Ví chủ sở hữu mới trùng với chủ sở hữu hiện tại."
            );
        }

        const contract = await getContractWithSigner();

        const signerAddress = await contract.signer.getAddress();

        if (
            signerAddress.toLowerCase() !== chuHienTai.toLowerCase()
        ) {
            throw new Error(
                "Ví MetaMask hiện tại không trùng với chủ sở hữu " +
                "đang ghi nhận. Hãy kết nối đúng ví chủ sở hữu."
            );
        }

        showMessage(
            "Hãy xác nhận giao dịch chuyển nhượng trong MetaMask.",
            "loading"
        );

        const tx = await contract.chuyenNhuong(maSo, chuMoi);

        const result = getElement("landInfo");
        result.replaceChildren();
        result.className = "result status-loading";

        result.appendChild(
            createElement("p", "Đã gửi giao dịch chuyển nhượng.")
        );

        result.appendChild(
            createElement("p", "TxHash: " + tx.hash)
        );

        appendTransactionLink(result, tx.hash);

        result.appendChild(
            createElement(
                "p",
                "Đang chờ giao dịch được xác nhận trên Sepolia..."
            )
        );

        const receipt = await tx.wait();

        if (receipt.status !== 1) {
            throw new Error("Giao dịch chuyển nhượng không thành công.");
        }

        sessionTransferred++;
        updateStats();

        result.replaceChildren();
        result.className = "result status-success";

        result.appendChild(
            createElement("h3", "Chuyển nhượng thành công!")
        );

        result.appendChild(
            createElement("p", "Mã thửa đất: " + maSo.toString())
        );

        result.appendChild(
            createElement("p", "Chủ sở hữu cũ: " + chuHienTai)
        );

        result.appendChild(
            createElement("p", "Chủ sở hữu mới: " + chuMoi)
        );

        result.appendChild(
            createElement("p", "TxHash: " + tx.hash)
        );

        appendTransactionLink(result, tx.hash);

        // Điền mã đất để tiện tra cứu lại.
        getElement("searchId").value = maSo.toString();

        result.appendChild(
            createElement(
                "p",
                "Hãy tra cứu lại để xác nhận chủ sở hữu mới và lịch sử giao dịch."
            )
        );

    } catch (error) {
        showMessage(
            "Lỗi chuyển nhượng: " + getErrorMessage(error),
            "error"
        );
    } finally {
        setButtonLoading(form, false);
    }
});

// 11. KHỞI ĐỘNG ỨNG DỤNG
document.addEventListener("DOMContentLoaded", function () {
    updateStats();
    updateWalletStatus();
});
```
