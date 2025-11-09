import FeedbackPage from "../feedback/page";

// Legacy wrapper to keep compatibility while delegating to the App Router page.
export default function Feedback(props) {
  return <FeedbackPage {...props} />;
}