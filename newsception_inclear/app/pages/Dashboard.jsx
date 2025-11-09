import DashboardPage from "../dashboard/page";

// Legacy wrapper to keep compatibility while delegating to the App Router page.
export default function Dashboard(props) {
  return <DashboardPage {...props} />;
}