import Link from 'next/link';

interface HeaderProps {
  isAdmin?: boolean;
  showAuth?: boolean;
  onLogout?: () => void;
}

export default function Header({ showAuth = true, isAdmin = false, onLogout }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JD</span>
            </div>
            <span className="text-xl font-semibold">JDock</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-black transition-colors"
            >
              Aplicações
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="text-gray-700 hover:text-black transition-colors"
              >
                Administração
              </Link>
            )}

            {showAuth && (
              <div className="flex items-center gap-4">
                {isAdmin ? (
                  <>
                    <div className="px-3 py-1 bg-black text-white text-sm rounded-full">
                      Admin
                    </div>
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sair
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium hover:opacity-80 transition-opacity"
                  >
                    Entrar
                  </Link>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
