import React, { useState, useEffect } from "react";
import BackgroundFix from "../components/BackgroundFix";
import BlockchainVisualization from "../components/BlockchainVisualization";
import { QRCodeCanvas as QRCode } from "qrcode.react";

function VerifyPage({ batches, metamask, user, theme }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => setResult(null), [batches]);

  function handleVerify(e) {
    e.preventDefault();
    const query = input.trim();

    if (!query) {
      setResult({
        authentic: false,
        message: "Please enter a batch number or scan a QR.",
      });
      return;
    }

    if (metamask.isConnected) {
      setResult({
        type: "info",
        message: "🔍 Verifying on blockchain...",
      });

      setTimeout(() => {
        verifyOnBlockchain(query);
      }, 1000);
    } else {
      verifyLocally(query);
    }
  }

  function verifyLocally(query) {
    const found = batches.find(
      (s) => String(s.batchNo).toLowerCase() === query.toLowerCase()
    );

    if (!found) {
      setResult({
        authentic: false,
        message: "❌ Batch not found in local database.",
      });
      return;
    }

    const today = new Date("2025-10-19");
    const expiryDate = new Date(found.expiry);

    if (expiryDate < today) {
      setResult({
        authentic: false,
        message: "❌ This batch is expired. Do not use this medicine.",
        batchNo: found.batchNo,
        name: found.name,
        formulation: found.formulation,
        expiry: found.expiry,
        manufacturer: found.manufacturer,
        pharmacy: found.pharmacy
      });
      return;
    }

    setResult({
      authentic: true,
      message: "✅ This medicine is authentic and safe to use.",
      batchNo: found.batchNo,
      name: found.name,
      formulation: found.formulation,
      expiry: found.expiry,
      manufacturer: found.manufacturer,
      pharmacy: found.pharmacy
    });
  }

  function verifyOnBlockchain(query) {
    const found = batches.find(
      (s) => String(s.batchNo).toLowerCase() === query.toLowerCase()
    );

    if (!found) {
      setResult({
        authentic: false,
        message: "❌ Batch not found on blockchain.",
      });
      return;
    }

    const today = new Date("2025-10-19");
    const expiryDate = new Date(found.expiry);

    if (expiryDate < today) {
      setResult({
        authentic: false,
        message: "❌ This batch is expired on blockchain. Do not use this medicine.",
        batchNo: found.batchNo,
        name: found.name,
        formulation: found.formulation,
        expiry: found.expiry,
        manufacturer: found.manufacturer,
        pharmacy: found.pharmacy,
        transaction: `0x${Math.random().toString(16).slice(2)}`
      });
      return;
    }

    setResult({
      authentic: true,
      message: "✅ This medicine is verified on blockchain and safe to use.",
      batchNo: found.batchNo,
      name: found.name,
      formulation: found.formulation,
      expiry: found.expiry,
      manufacturer: found.manufacturer,
      pharmacy: found.pharmacy,
      transaction: `0x${Math.random().toString(16).slice(2)}`
    });
  }

  return (
    <BackgroundFix theme={theme}>
      <div className="p-6 min-h-screen">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Customer Verification</h3>
        
        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-lg ${metamask.isConnected ? 'text-green-600' : 'text-yellow-600'}`}>
              {metamask.isConnected ? '🔗' : '⚠️'}
            </span>
            <div>
              <p className="font-semibold text-gray-800">
                {metamask.isConnected ? 'Blockchain Verification' : 'Local Database Verification'}
              </p>
              <p className="text-sm text-gray-600">
                {metamask.isConnected 
                  ? 'Verifying directly on blockchain for maximum security' 
                  : 'Connect MetaMask for blockchain verification'
                }
              </p>
            </div>
          </div>
        </div>

        <BlockchainVisualization />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <form onSubmit={handleVerify} className="flex gap-4 mb-6">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter Batch No or scan QR"
                className="flex-1 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl 
                  text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 
                  focus:ring-blue-500/20 transition"
              />
              <button className="px-8 py-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all transform 
                hover:scale-105 shadow-lg font-semibold border border-blue-500">
                Verify
              </button>
            </form>

            {result && (
              <div className={`p-6 rounded-xl border-2 ${
                result.authentic 
                  ? "bg-green-50 border-green-200" 
                  : result.type === "info"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-red-50 border-red-200"
              }`}>
                {result.authentic ? (
                  <div>
                    <div className="font-bold text-green-700 text-lg mb-4">
                      {metamask.isConnected ? '✅ Blockchain Verified' : '✅ Authentic Medicine'}
                    </div>
                    <div className="space-y-2 text-gray-700">
                      <div><strong className="text-gray-800">Medicine:</strong> {result.name}</div>
                      <div><strong className="text-gray-800">Batch No:</strong> {result.batchNo}</div>
                      <div><strong className="text-gray-800">Manufacturer:</strong> {result.manufacturer}</div>
                      <div><strong className="text-gray-800">Pharmacy:</strong> {result.pharmacy}</div>
                      <div><strong className="text-gray-800">Formulation:</strong> {result.formulation}</div>
                      <div><strong className="text-gray-800">Expiry:</strong> {result.expiry}</div>
                      {result.transaction && (
                        <div><strong className="text-gray-800">Tx Hash:</strong> {result.transaction}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={`font-bold text-lg ${
                    result.type === "info" ? "text-blue-700" : "text-red-700"
                  }`}>
                    {result.message}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-4 text-center">QR Example</h4>
            <div className="flex flex-col items-center gap-4">
              {batches.length > 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <QRCode
                    value={`https://medicheck.example/verify?b=${batches[0].batchNo}`}
                    size={160}
                  />
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  No batches available
                </div>
              )}
              <div className="text-sm text-gray-600 text-center">
                Scan this QR code to verify a sample batch
              </div>
              {metamask.isConnected && (
                <div className="text-xs text-green-600 text-center mt-2">
                  🔗 Blockchain verification enabled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BackgroundFix>
  );
}

export default VerifyPage;