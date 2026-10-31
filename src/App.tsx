import { Navigate, Route, Routes } from "react-router";

import { AppShell, ToastStack } from "@/components/AppShell";
import { useApp } from "@/store";
import Login from "@/pages/Login";
import Feed from "@/pages/Feed";
import Videos from "@/pages/Videos";
import Reels from "@/pages/Reels";
import Marketplace, { ListingDetail } from "@/pages/Marketplace";
import Groups, { GroupDetail } from "@/pages/Groups";
import Events, { EventDetail } from "@/pages/Events";
import Pages, { PageDetail } from "@/pages/Pages";
import Profile from "@/pages/Profile";
import Friends from "@/pages/Friends";
import Messages from "@/pages/Messages";
import Saved from "@/pages/Saved";
import Search from "@/pages/Search";
import Local from "@/pages/Local";
import Dating from "@/pages/Dating";
import Creator from "@/pages/Creator";
import Ads from "@/pages/Ads";
import Wallet from "@/pages/Wallet";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

export default function App() {
  const { state } = useApp();

  return (
    <>
      {state.signedIn ? (
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Feed />} />
            <Route path="videos" element={<Videos />} />
            <Route path="reels" element={<Reels />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="marketplace/:listingId" element={<ListingDetail />} />
            <Route path="groupes" element={<Groups />} />
            <Route path="groupes/:groupId" element={<GroupDetail />} />
            <Route path="evenements" element={<Events />} />
            <Route path="evenements/:eventId" element={<EventDetail />} />
            <Route path="pages" element={<Pages />} />
            <Route path="pages/:pageId" element={<PageDetail />} />
            <Route path="profil/:username" element={<Profile />} />
            <Route path="amis" element={<Friends />} />
            <Route path="messages" element={<Messages />} />
            <Route path="enregistrements" element={<Saved />} />
            <Route path="recherche" element={<Search />} />
            <Route path="local" element={<Local />} />
            <Route path="dating" element={<Dating />} />
            <Route path="createur" element={<Creator />} />
            <Route path="publicites" element={<Ads />} />
            <Route path="portefeuille" element={<Wallet />} />
            <Route path="parametres" element={<Settings />} />
            <Route
              path="admin"
              element={state.me.staff ? <Admin /> : <Navigate to="/" replace />}
            />
            <Route path="connexion" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      ) : (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      )}
      <ToastStack />
    </>
  );
}
