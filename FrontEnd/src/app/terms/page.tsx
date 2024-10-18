import Navbar from "../components/Navbar";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-t from-palette1 via-palette3 via-50% to-palette5">
        <div className="font-bold text-white flex justify-center text-4xl">
          Terms and Conditions
        </div>
      </div>
    </>
  );
}
