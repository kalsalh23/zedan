import React, { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import BottomNav from './components/BottomNav'
import { Toasts, Spinner } from './components/UI'

// retry failed chunk loads once (fixes stuck pages after deploys or flaky networks)
const lazyRetry = (factory) =>
  lazy(() =>
    factory().catch(() => new Promise((resolve) => setTimeout(resolve, 600)).then(factory))
  )

const Home = lazyRetry(() => import('./pages/Home'))
const Shop = lazyRetry(() => import('./pages/Shop'))
const Product = lazyRetry(() => import('./pages/Product'))
const Compare = lazyRetry(() => import('./pages/Compare'))
const Favorites = lazyRetry(() => import('./pages/Favorites'))
const Cart = lazyRetry(() => import('./pages/Cart'))
const Checkout = lazyRetry(() => import('./pages/Checkout'))
const Account = lazyRetry(() => import('./pages/Account'))
const Orders = lazyRetry(() => import('./pages/Orders'))
const Addresses = lazyRetry(() => import('./pages/Addresses'))
const About = lazyRetry(() => import('./pages/About'))
const Notifications = lazyRetry(() => import('./pages/Notifications'))
const Topup = lazyRetry(() => import('./pages/Topup'))
const AdminLayout = lazyRetry(() => import('./admin/AdminLayout'))
const Dashboard = lazyRetry(() => import('./admin/Dashboard'))
const AdminProducts = lazyRetry(() => import('./admin/Products'))
const ProductForm = lazyRetry(() => import('./admin/ProductForm'))
const AdminCategories = lazyRetry(() => import('./admin/Categories'))
const AdminOrders = lazyRetry(() => import('./admin/AdminOrders'))
const AdminOffers = lazyRetry(() => import('./admin/AdminOffers'))

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: false }
  }
  static getDerivedStateFromError() {
    return { error: true }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-5xl">😵</p>
          <p className="mt-3 text-lg font-extrabold text-ink">حدث خطأ غير متوقع</p>
          <p className="mt-1 text-sm text-silver-500">تعذر عرض هذه الصفحة</p>
          <button onClick={() => window.location.reload()} className="mt-5 rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-white active:scale-95">
            إعادة تحميل الصفحة
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

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
          <ErrorBoundary>
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
            <Route path="/about" element={<About />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/topup" element={<Topup />} />
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
          </ErrorBoundary>
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
      <Toasts />
    </div>
  )
}
