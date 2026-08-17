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
import AccountsMaster from "./pages/Accounts/AccountsMaster";
import JournalVoucher from "./pages/Accounts/JournalVoucher";
import SupplierMaster from "./pages/Purchase/SupplierMaster";
import PurchaseInvoice from "./pages/Purchase/PurchaseInvoice";
import PhysicalStockEntry from "./pages/Purchase/PhysicalStockEntry";
import ChartsHome from "./pages/Reports/ChartsHome";
import Gallery from "./pages/Administration/Gallery";
import GalleryCategories from "./pages/Administration/GalleryCategories";
import GalleryAlbums from "./pages/Administration/GalleryAlbums";
import GalleryPhotos from "./pages/Administration/GalleryPhotos";
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
                            ADMINISTRATOR ONLY
                        ================================================== */}

                        <Route
                            element={
                                <AdminRoute />
                            }
                        >

                            {/* ==================================================
                                REPORTS - ADMIN ONLY
                            ================================================== */}

                            <Route
                                path="reports"
                                element={<ReportsHome />}
                            />

                            <Route
                                path="reports/charts"
                                element={<ChartsHome />}
                            />

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
                                ACCOUNTS
                            ============================== */}

                            <Route
                                path="accounts/master"
                                element={<AccountsMaster />}
                            />

                            <Route
                                path="accounts/journal-voucher"
                                element={<JournalVoucher />}
                            />


                            {/* ==============================
                                PURCHASE
                            ============================== */}

                            <Route
                                path="purchase/suppliers"
                                element={<SupplierMaster />}
                            />

                            <Route
                                path="purchase/invoices"
                                element={<PurchaseInvoice />}
                            />

                            <Route
                                path="purchase/physical-stock"
                                element={<PhysicalStockEntry />}
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
                            <Route
                                path="gallery"
                                element={<Gallery />}
                            />

                            <Route
                                path="gallery/categories"
                                element={<GalleryCategories />}
                            />

                            <Route
                                path="gallery/:categoryId/albums"
                                element={<GalleryAlbums />}
                            />

                            <Route
                                path="gallery/albums/:albumId/photos"
                                element={<GalleryPhotos />}
                            />

                        </Route>

                    </Route>

                </Route>

            </Routes>

        </BrowserRouter>

    );

}


export default App;