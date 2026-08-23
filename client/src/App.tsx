import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Affiliates from "@/pages/Affiliates";
import Assemblies from "@/pages/Assemblies";
import Championships from "@/pages/Championships";
import Finance from "@/pages/Finance";
import InstitutionalProfile from "@/pages/InstitutionalProfile";
import News from "@/pages/News";
import Obligations from "@/pages/Obligations";
import NotFound from "@/pages/NotFound";
import Reservations from "@/pages/Reservations";
import WorkPlan from "@/pages/WorkPlan";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/afiliados"} component={Affiliates} />
      <Route path={"/asambleas"} component={Assemblies} />
      <Route path={"/campeonatos"} component={Championships} />
      <Route path={"/plan-de-trabajo"} component={WorkPlan} />
      <Route path={"/obligaciones"} component={Obligations} />
      <Route path={"/finanzas"} component={Finance} />
      <Route path={"/reservas"} component={Reservations} />
      <Route path={"/institucion"} component={InstitutionalProfile} />
      <Route path={"/noticias"} component={News} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

