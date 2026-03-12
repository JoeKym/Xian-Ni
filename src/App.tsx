import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/AuthProvider";
import Index from "./pages/Index";
import Characters from "./pages/Characters";
import Daos from "./pages/Daos";
import Cultivation from "./pages/Cultivation";
import Timeline from "./pages/Timeline";
import Multiverse from "./pages/Multiverse";
import Donghua from "./pages/Donghua";
import Lore from "./pages/Lore";
import Guide from "./pages/Guide";
import Artifacts from "./pages/Artifacts";
import Locations from "./pages/Locations";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Suspended from "./pages/Suspended";
import UserProfile from "./pages/UserProfile";
import Members from "./pages/Members";
import Communities from "./pages/Communities";
import CommunityDetail from "./pages/CommunityDetail";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import GroupMessages from "./pages/GroupMessages";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Support from "./pages/Support";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Voidy from "./pages/Voidy";
import News from "./pages/News";
import Watch from "./pages/Watch";
import About from "./pages/About";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/characters" element={<Characters />} />
              <Route path="/daos" element={<Daos />} />
              <Route path="/cultivation" element={<Cultivation />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/multiverse" element={<Multiverse />} />
              <Route path="/donghua" element={<Donghua />} />
              <Route path="/lore" element={<Lore />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="/artifacts" element={<Artifacts />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/suspended" element={<Suspended />} />
              <Route path="/members" element={<Members />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/communities/:id" element={<CommunityDetail />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/groups" element={<GroupMessages />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/support" element={<Support />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/u/:username" element={<UserProfile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/voidy" element={<Voidy />} />
              <Route path="/news" element={<News />} />
              <Route path="/watch" element={<Watch />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
