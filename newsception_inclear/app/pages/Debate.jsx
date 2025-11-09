import DebatePage from "../debate/page";

// Legacy wrapper to keep compatibility while delegating to the App Router page.
export default function Debate(props) {
  return <DebatePage {...props} />;
}