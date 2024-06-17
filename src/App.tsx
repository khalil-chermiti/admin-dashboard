import { LoginPage } from "./auth/LoginPage";
import { Route, Routes } from "react-router-dom";
import { PageAgents } from "./agents/PageAgents";
import DashboardNavbar from "./components/navbar";
import { PageCamions } from "./camions/PageCamions";

import "./app.css";
import { RoleGuard } from "./auth/AuthGuard";
import { AddUser } from "./manageUsers/AddUser";
import { UsersPage } from "./manageUsers/UsersPage";
import { Tournee } from "./tournee/Tournee";
import { ListTournees } from "./tournee/ListTournees";
import { PageTracking } from "./tracking/Tracking";
import { TourneesRealisees } from "./tourneesRealisees/TourneesRealisees";
import { Incidents } from "./incident/Incidents";
import { CentreDeDepot } from "./CentreDeDepot/PagePointsDeCollect";

function App() {
  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        margin: 0,
        marginBottom: "100px",
      }}
    >
      <DashboardNavbar />

      <Routes>
        <Route
          path="/"
          element={
            <RoleGuard role="superviseur">
              <PageCamions />
            </RoleGuard>
          }
        />
        <Route
          path="/camions"
          element={
            <RoleGuard role="superviseur">
              <PageCamions />
            </RoleGuard>
          }
        />
        <Route
          path="/agents"
          element={
            <RoleGuard role="superviseur">
              <PageAgents />
            </RoleGuard>
          }
        />
        <Route
          path="/pdc"
          element={
            <RoleGuard role="superviseur">
              <CentreDeDepot />
            </RoleGuard>
          }
        />
        <Route
          path="/users"
          element={
            <RoleGuard role="admin">
              <UsersPage />
            </RoleGuard>
          }
        />
        <Route
          path="/users/add"
          element={
            <RoleGuard role="admin">
              <AddUser />
            </RoleGuard>
          }
        />
        <Route
          path="/tournees"
          element={
            <RoleGuard role="superviseur">
              <ListTournees />
            </RoleGuard>
          }
        />
        <Route
          path="/tournees/ajouter"
          element={
            <RoleGuard role="superviseur">
              <Tournee />
            </RoleGuard>
          }
        />
        <Route path="/tournees/realisees" element={<TourneesRealisees />} />
        <Route
          path="/tracking"
          element={
            <RoleGuard role="superviseur">
              <PageTracking />
            </RoleGuard>
          }
        />

        <Route
          path="/incidents"
          element={
            <RoleGuard role="superviseur">
              <Incidents />
            </RoleGuard>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
