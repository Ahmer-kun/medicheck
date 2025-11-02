# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)













EH BROTHA 


function ManufacturerPage({ onRegister }) {
  const [form, setForm] = useState({
    medicineName: "",
    batchNo: "",
    manufactureDate: "",
    expiryDate: "",
    formulation: "",
    quantity: 0,
  });
  const [message, setMessage] = useState(null);

  async function handleRegister(e) {
    e.preventDefault();

    // Minimal validation
    if (!form.medicineName || !form.batchNo) {
      setMessage({
        type: "error",
        text: "Medicine name and batch number are required.",
      });
      return;
    }

    // Call parent callback (or API) to register
    if (typeof onRegister === "function")
      onRegister({
        batchNo: form.batchNo,
        name: form.medicineName,
        expiry: form.expiryDate,
        formulation: form.formulation,
      });

    setMessage({ type: "success", text: "Batch registered (mock)." });
    setForm({
      medicineName: "",
      batchNo: "",
      manufactureDate: "",
      expiryDate: "",
      formulation: "",
      quantity: 0,
    });
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Register New Batch</h3>

      <form
        onSubmit={handleRegister}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded shadow"
      >
        <input
          value={form.medicineName}
          onChange={(e) =>
            setForm({ ...form, medicineName: e.target.value })
          }
          placeholder="Medicine Name"
          className="p-2 border rounded text-gray-700"
        />
        <input
          value={form.batchNo}
          onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
          placeholder="Batch No"
          className="p-2 border rounded text-gray-700"
        />
        <input
          type="date"
          value={form.manufactureDate}
          onChange={(e) =>
            setForm({ ...form, manufactureDate: e.target.value })
          }
          className="p-2 border rounded text-gray-700"
        />
        <input
          type="date"
          value={form.expiryDate}
          onChange={(e) =>
            setForm({ ...form, expiryDate: e.target.value })
          }
          className="p-2 border rounded text-gray-700"
        />
        <textarea
          value={form.formulation}
          onChange={(e) =>
            setForm({ ...form, formulation: e.target.value })
          }
          placeholder="Formulation"
          className="p-2 border rounded col-span-1 md:col-span-2 text-gray-700"
        />
        <input
          type="number"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.valueAsNumber })
          }
          placeholder="Quantity"
          className="p-2 border rounded text-gray-700"
        />

        <div className="flex items-center gap-3">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded">
            Register
          </button>
          <button
            type="button"
            className="bg-indigo-600 text-white px-4 py-2 rounded"
            onClick={() =>
              setForm({
                medicineName: "",
                batchNo: "",
                manufactureDate: "",
                expiryDate: "",
                formulation: "",
                quantity: 0,
              })
            }
          >
            Reset
          </button>
        </div>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}


##analytics old

// function AnalyticsPage() {
//   // Calculate totals dynamically
//   const totalRegistered = analyticsData.reduce((sum, d) => sum + d.Registered, 0);
//   const totalVerified = analyticsData.reduce((sum, d) => sum + d.Verified, 0);
//   const totalExpired = analyticsData.reduce((sum, d) => sum + d.Expired, 0);

//   return (
//     <div className="p-6">
//       <h3 className="text-lg font-semibold mb-4">Analytics Overview</h3>

//       {/* Summary cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <div className="bg-white p-4 rounded shadow text-center">
//           <div className="text-sm text-gray-500">Total Registered</div>
//           <div className="text-2xl font-bold text-indigo-600">{totalRegistered}</div>
//         </div>
//         <div className="bg-white p-4 rounded shadow text-center">
//           <div className="text-sm text-gray-500">Total Verified</div>
//           <div className="text-2xl font-bold text-green-600">{totalVerified}</div>
//         </div>
//         <div className="bg-white p-4 rounded shadow text-center">
//           <div className="text-sm text-gray-500">Total Expired</div>
//           <div className="text-2xl font-bold text-red-600">{totalExpired}</div>
//         </div>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <section className="bg-white p-4 rounded shadow">
//           <h4 className="font-medium mb-2">Weekly Registrations Trend</h4>
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={analyticsData}>
//               <XAxis dataKey="name" angle={-30} textAnchor="end" />
//               <YAxis />
//               <Tooltip />
//               <Line type="monotone" dataKey="Registered" stroke="#6366F1" strokeWidth={2} />
//               <Line type="monotone" dataKey="Verified" stroke="#10B981" strokeWidth={2} />
//             </LineChart>
//           </ResponsiveContainer>
//         </section>

//         <section className="bg-white p-4 rounded shadow">
//           <h4 className="font-medium mb-2">Expired vs Verified (Weekly)</h4>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={analyticsData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" angle={-30} textAnchor="end" />
//               <YAxis />
//               <Tooltip />
//               <Legend/>
//               <Bar dataKey="Verified" fill="#10B981" />
//               <Bar dataKey="Expired" fill="#EF4444" />
//             </BarChart>
//           </ResponsiveContainer>
//         </section>
//       </div>
//     </div>
//   );
// }



##pharma old 

//            -----------------Pharmacy Page---------------
function PharmacyPage({ batches, onAccept }) {
  function handleReceive(batchNo) {
    if (typeof onAccept === "function") onAccept(batchNo);
    alert("Received batch: " + String(batchNo));
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Received Batches</h3>
      <div className="bg-white p-4 rounded shadow">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Batch</th>
              <th className="py-2">Medicine</th>
              <th className="py-2">Expiry</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={String(b.batchNo)} className="border-b hover:bg-gray-50">
                <td className="py-2">{String(b.batchNo)}</td>
                <td className="py-2">{String(b.name)}</td>
                <td className="py-2">{String(b.expiry)}</td>
                <td className="py-2">
                  <button
                    onClick={() => handleReceive(b.batchNo)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                  >
                    Accept
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}











THIS IS FOR PACKAGE.JSON BACKEND




{
  "name": "medicheck-backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.19.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.10"
  }
}






//POSTMAN

{
  "batchNo": "TEST-001",
  "name": "Sample Drug",
  "manufactureDate": "2025-01-01",
  "expiry": "2026-01-01",
  "formulation": "Tablet",
  "manufacturer": "Test Pharma",
  "pharmacy": "Test Pharmacy",
  "quantity": 1000,
  "status": "active",
  "blockchainVerified": true
}