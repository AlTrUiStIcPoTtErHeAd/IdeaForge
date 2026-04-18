export function LandingSection({ children, className = "", title, subtitle, dark = false }) {
  return (
    <section className={`py-20 px-6 ${dark ? "bg-gray-900 text-white" : "bg-white text-gray-900"} ${className}`}>
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-16 animate-fade-in">
            {title && <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>}
            {subtitle && <p className={`${dark ? "text-gray-400" : "text-gray-500"} text-lg max-w-2xl mx-auto`}>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function FeatureCard({ icon, title, description, delay = "" }) {
  return (
    <div className={`p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${delay}`}>
      <div className="w-12 h-12 bg-brand-light text-brand rounded-xl flex items-center justify-center text-xl mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}

export function BentoItem({ title, description, icon, className = "", color = "brand" }) {
  const colorMap = {
    brand: "bg-brand-light text-brand",
    accent: "bg-accent-light text-accent",
    pink: "bg-pink-50 text-pink-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className={`p-6 rounded-3xl border border-gray-100 flex flex-col justify-between ${className} hover:shadow-lg transition-shadow bg-white`}>
      <div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colorMap[color] || colorMap.brand}`}>
          {icon}
        </div>
        <h4 className="text-lg font-bold mb-2">{title}</h4>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
