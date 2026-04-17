export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <p className="text-[10px] font-bold tracking-[0.3em] text-violet-400 uppercase mb-2">
            Sistema de Cazadores
          </p>
          <h1 className="text-2xl font-black tracking-widest text-zinc-100 uppercase">
            ◈ Solo Leveling
          </h1>
        </div>

        {children}
      </div>
    </div>
  );
}
