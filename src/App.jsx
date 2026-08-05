import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";

import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";

import NewReceipt from "./pages/Billing/NewReceipt";
import ReceiptSearch from "./pages/Billing/ReceiptSearch";
import ReceiptView from "./pages/Billing/ReceiptView";

import Devotees from "./pages/Masters/Devotees";
import Categories from "./pages/Masters/Categories";
import Offerings from "./pages/Masters/Offerings";
import PaymentModes from "./pages/Masters/PaymentModes";

import DashboardReport from "./pages/Reports/DashboardReport";

import Users from "./pages/Administration/Users";
import Settings from "./pages/Administration/Settings";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route path="/login" element={<Login />} />

                <Route path="/" element={<Layout />}>

                    <Route index element={<Dashboard />} />

                    <Route path="billing/new" element={<NewReceipt />} />

                    <Route path="receipts" element={<ReceiptSearch />} />

                    <Route path="receipts/:id" element={<ReceiptView />} />

                    <Route path="masters/devotees" element={<Devotees />} />

                    <Route path="masters/categories" element={<Categories />} />

                    <Route path="masters/offerings" element={<Offerings />} />

                    <Route path="masters/payment-modes" element={<PaymentModes />} />

                    <Route path="reports" element={<DashboardReport />} />

                    <Route path="users" element={<Users />} />

                    <Route path="settings" element={<Settings />} />

                </Route>

            </Routes>

        </BrowserRouter>

    );

}

export default App;