import ThankYouTracker from "@/components/tracking/ThankYouTracker";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThankYouTracker />
      {children}
    </>
  );
}
