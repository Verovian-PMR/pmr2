export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-500">VivIPractice</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to your pharmacy dashboard</p>
        </div>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              className="w-full h-10 px-3 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="admin@pharmacy.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              required
              className="w-full h-10 px-3 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full h-10 bg-primary-500 text-white rounded-md text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
