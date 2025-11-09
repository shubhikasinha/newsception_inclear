import LandingPage from "../page";

// Legacy wrapper to keep compatibility while delegating to the App Router home page.
export default function Landing(props) {
  return <LandingPage {...props} />;
}