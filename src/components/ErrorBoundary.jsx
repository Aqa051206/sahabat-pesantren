import { Component } from 'react'
import { clearSession } from '../lib/session'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-band-1 px-4">
        <div className="w-full max-w-md rounded-3xl border border-[#e1e9e2] bg-white p-6 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-navy">Terjadi kesalahan</h1>
          <p className="mt-2 text-sm text-body">
            Halaman gagal ditampilkan. Coba muat ulang atau masuk kembali.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Muat ulang
            </button>
            <button
              type="button"
              onClick={() => {
                clearSession()
                window.location.replace('/login')
              }}
              className="min-h-11 rounded-full border border-border px-5 text-sm font-semibold text-navy hover:bg-band-1"
            >
              Masuk kembali
            </button>
          </div>
        </div>
      </div>
    )
  }
}
