import {BrowserRouter,Routes,Route} from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import NewReceipt from "./pages/Billing/NewReceipt";
import ReceiptSearch from "./pages/Billing/ReceiptSearch";
import ReceiptView from "./pages/Billing/ReceiptView";
import Devotees from "./pages/Masters/Devotees";
import Categories from "./pages/Masters/Categories";
import Offerings from "./pages/Masters/Offerings";
import PaymentModes from "./pages/Masters/PaymentModes";
import ReportsHome from "./pages/Reports/ReportsHome";
import Users from "./pages/Administration/Users";
import Settings from "./pages/Administration/Settings";
function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ==================================================
                    PUBLIC
                ================================================== */}
                <Route
                    path="/login"
                    element={<Login />}
                />
                {/* ==================================================
                    ALL AUTHENTICATED USERS
                ================================================== */}
                <Route
                    element={
                        <ProtectedRoute />
                    }
                >
                    <Route
                        path="/"
                        element={<AppLayout />}
                    >

                        {/* ==================================================
                            DASHBOARD
                        ================================================== */}

                        <Route
                            index
                            element={<Dashboard />}
                        />


                        {/* ==================================================
                            BILLING
                        ================================================== */}

                        <Route
                            path="billing/new"
                            element={<NewReceipt />}
                        />


                        <Route
                            path="receipts"
                            element={<ReceiptSearch />}
                        />


                        <Route
                            path="receipts/:id"
                            element={<ReceiptView />}
                        />


                        {/* ==================================================
                            REPORTS
                        ================================================== */}

                        <Route
                            path="reports"
                            element={<ReportsHome />}
                        />


                        {/* ==================================================
                            ADMINISTRATOR ONLY
                        ================================================== */}

                        <Route
                            element={
                                <AdminRoute />
                            }
                        >

                            {/* ==============================
                                MASTERS
                            ============================== */}

                            <Route
                                path="masters/devotees"
                                element={<Devotees />}
                            />


                            <Route
                                path="masters/categories"
                                element={<Categories />}
                            />


                            <Route
                                path="masters/offerings"
                                element={<Offerings />}
                            />


                            <Route
                                path="masters/payment-modes"
                                element={<PaymentModes />}
                            />


                            {/* ==============================
                                ADMINISTRATION
                            ============================== */}

                            <Route
                                path="users"
                                element={<Users />}
                            />


                            <Route
                                path="settings"
                                element={<Settings />}
                            />

                        </Route>

                    </Route>

                </Route>

            </Routes>

        </BrowserRouter>

    );

}


export default App;