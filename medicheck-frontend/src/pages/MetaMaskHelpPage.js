import React from 'react';
import { Link } from 'react-router-dom';

function MetaMaskHelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl">🦊</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                MetaMask Connection Help
              </h1>
              <p className="text-gray-600 mt-1">Troubleshooting guide for MetaMask issues</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Common Issues */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Common Issues & Solutions</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">🔍</span>
                  <div>
                    <h4 className="font-medium text-gray-800">1. MetaMask Not Detected</h4>
                    <p className="text-sm text-gray-600">Make sure MetaMask is installed and active</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">🔒</span>
                  <div>
                    <h4 className="font-medium text-gray-800">2. Permission Denied</h4>
                    <p className="text-sm text-gray-600">Click the MetaMask icon and approve connection</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">🔄</span>
                  <div>
                    <h4 className="font-medium text-gray-800">3. Wrong Network</h4>
                    <p className="text-sm text-gray-600">Switch to Sepolia Test Network</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step by Step Guide */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Step-by-Step Fix</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Check MetaMask Installation</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      • Open Chrome/Firefox/Brave extensions<br/>
                      • Ensure MetaMask is enabled<br/>
                      • Click the fox icon in your toolbar
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Unlock MetaMask</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      • Enter your password if prompted<br/>
                      • Make sure you're on the correct account
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Check Network</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      • Click network dropdown (top center)<br/>
                      • Select <strong>Sepolia Test Network</strong><br/>
                      • If not listed, add it with the button below
                    </p>
                    <button
                      onClick={() => {
                        if (window.ethereum) {
                          window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                              chainId: '0xaa36a7',
                              chainName: 'Sepolia Test Network',
                              nativeCurrency: {
                                name: 'Sepolia ETH',
                                symbol: 'ETH',
                                decimals: 18
                              },
                              rpcUrls: ['https://rpc.sepolia.org'],
                              blockExplorerUrls: ['https://sepolia.etherscan.io']
                            }]
                          });
                        }
                      }}
                      className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      Add Sepolia Network to MetaMask
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Refresh & Try Again</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      • Refresh this page (F5 or Ctrl+R)<br/>
                      • Click "Connect MetaMask" again<br/>
                      • Approve the connection popup
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl 
                  flex items-center justify-center gap-3 hover:from-orange-600 hover:to-orange-700 
                  transition-all shadow-lg"
              >
                <span className="text-2xl">⬇️</span>
                <div className="text-left">
                  <div className="font-bold">Download MetaMask</div>
                  <div className="text-sm opacity-90">Get the latest version</div>
                </div>
              </button>

              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl 
                  flex items-center justify-center gap-3 hover:from-blue-600 hover:to-blue-700 
                  transition-all shadow-lg"
              >
                <span className="text-2xl">🔄</span>
                <div className="text-left">
                  <div className="font-bold">Refresh Page</div>
                  <div className="text-sm opacity-90">Clear cache and retry</div>
                </div>
              </button>
            </div>

            {/* Back Button */}
            <div className="pt-4 border-t border-gray-200">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetaMaskHelpPage;