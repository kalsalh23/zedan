import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import BottomNav from './components/BottomNav'
import { Toasts, Spinner } from './components/UI'

const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const Product = lazy(() => import('./pages/Product'))
const Compare = lazy(() => import('./pages/Compare'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Account = lazy(() => import('./pages/Account'))
const Orders = lazy(() => import('./pages/Orders'))
const Addresses = lazy(() => import('./pages/Addresses'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const Dashboard = lazy(() => import('./admin/Dashboard'))
const AdminProducts = lazy(() => import('./admin/Products'))
const ProductForm = lazy(() => import('./admin/ProductForm'))
const AdminCategories = lazy(() => import('./admin/Categories'))
const AdminOrders = lazy(() => import('./admin/AdminOrders'))
const AdminOffers = lazy(() => import('./admin/AdminOffers'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <ScrollToTop />
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-6 md:pb-10">
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop key="shop" view="shop" />} />
            <Route path="/new" element={<Shop key="new" view="new" />} />
            <Route path="/used" element={<Shop key="used" view="used" />} />
            <Route path="/search" element={<Shop key="search" view="search" />} />
            <Route path="/category/:slug" element={<Shop key="cat" view="category" />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/addresses" element={<Addresses />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="offers" element={<AdminOffers />} />
            </Route>
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-6xl font-extrabold text-accent">404</p>
                <p className="mt-3 font-bold text-ink">الصفحة غير موجودة</p>
                <a href="/" className="mt-5 rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-white active:scale-95">العودة للرئيسية</a>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
      <Toasts />
    </div>
  )
}
