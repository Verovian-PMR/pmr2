import BookingWizard from "./BookingWizard";

export default function BookingPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 bg-neutral-100">
      <BookingWizard />
    </div>
  );
}
