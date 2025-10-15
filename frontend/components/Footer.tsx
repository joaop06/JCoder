export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-sm text-gray-600">
          © {new Date().getFullYear()} JCoder. Portfolio of applications developed with NextJS and NestJS.
        </p>
      </div>
    </footer>
  );
}
