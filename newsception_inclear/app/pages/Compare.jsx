
import ComparePage from "../compare/page";

// Legacy wrapper to keep compatibility while delegating to the App Router page.
export default function Compare(props) {
  return <ComparePage {...props} />;
}
