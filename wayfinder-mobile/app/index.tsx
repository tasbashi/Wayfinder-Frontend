import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to the tabs layout so both web and mobile show the same homepage
  return <Redirect href="/(tabs)" />;
}

