import toast from "react-hot-toast";
import { Button, Form } from "react-bootstrap";
import { AuthContext } from "../auth/AuthContext";
import { databaseClient } from "../firebaseConfig";
import { Agent, AgentDocument } from "../agents/types";
import { useContext, useEffect, useState } from "react";
import { addDoc, arrayUnion, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { APIProvider, AdvancedMarker, Map, Pin } from "@vis.gl/react-google-maps";
import { Camion, CamionDocument } from "../camions/type";
import { PointDeCollect } from "../CentreDeDepot/types";
import { useNavigate } from "react-router-dom";

export const Tournee = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<AgentDocument[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [selectedCamionMatricule, setSelectedCamionMatricule] = useState<string>("");

  const [agentName, setAgentName] = useState<string>("");

  const authContext = useContext(AuthContext)!;

  const [collectionPoints, setCollectionPoints] = useState<
    {
      lat: number;
      lng: number;
    }[]
  >([]);

  useEffect(() => {
    console.log("collectionPoints", collectionPoints);
  }, [collectionPoints]);

  const [centresDeDepots, setCentresDeDepots] = useState<PointDeCollect[]>([]);

  const getPointsDeCollect = async () => {
    try {
      const docRef = doc(databaseClient, "users", authContext.userId || "");

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        const CdT = data["centresDeDepots"] as PointDeCollect[];

        if (collectionPoints) setCentresDeDepots(CdT);
      }
    } catch (e) {
      toast.error("Erreur lors de la récupération des centres de depots");
    }
  };

  const createTournee = async () => {
    try {
      const docRef = doc(databaseClient, "users", authContext.userId || "");

      await updateDoc(docRef, {
        tournees: arrayUnion({
          agentId: selectedAgentId,
          agentName: agentName,
          camionMatricule: selectedCamionMatricule,
          pointsDeCollect: collectionPoints,
          supervisorId: authContext.userId,
        }),
      });

      await addDoc(collection(databaseClient, "tournees"), {
        agentId: selectedAgentId,
        agentName: agentName,
        camionMatricule: selectedCamionMatricule,
        pointsDeCollect: collectionPoints,
        supervisorId: authContext.userId,
      });

      toast.success("Tournée créée avec succès");
      navigate("/tournees");
    } catch (e) {
      toast.error("Erreur lors de la création de la tournée");
    }
  };

  const getAgents = async () => {
    try {
      const docRef = doc(databaseClient, "users", authContext.userId || "");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        const agentsData = data["agents"] as Agent[];

        setAgents(agentsData);
      }
    } catch (e) {
      toast.error("Erreur lors de la récupération des agents");
    }
  };

  const [camions, setCamions] = useState<CamionDocument[]>([]);

  const getCamions = async () => {
    try {
      const docRef = doc(databaseClient, "users", authContext.userId || "");

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        const camions = data["camions"] as Camion[];

        setCamions(camions);
      }
    } catch (e) {
      toast.error("Erreur lors de la récupération des camions");
    }
  };

  useEffect(() => {
    getAgents();
    getCamions();
    getPointsDeCollect();
  }, []);

  return (
    <>
      <h3 className="mt-3 text-center">Créer une tournée</h3>
      <div
        style={{
          backgroundColor: "#f8f9fa",
          margin: "auto",
          marginTop: "20px",
          width: "70%",
        }}
      >
        <p
          style={{
            fontSize: "16px",
            marginBottom: "10px",
          }}
        >
          Choisir les agents
        </p>
        <Form.Select
          onChange={e => {
            if (e.target.value === "Choisir un agent") {
              return;
            }
            setSelectedAgentId(agents.find(agent => agent.nom === e.target.value)?.id || "");
            setAgentName(e.target.value);
          }}
          size="sm"
        >
          <option selected>Choisir un agent</option>
          {agents?.map(agent => (
            <option>{agent.nom}</option>
          ))}
        </Form.Select>

        <p
          style={{
            fontSize: "16px",
            marginBottom: "10px",
          }}
        >
          Choisir un camion
        </p>
        <Form.Select
          onChange={e => {
            if (e.target.value === "Choisir un camion") {
              return;
            }
            setSelectedCamionMatricule(camions.find(camion => camion.matricule === e.target.value)?.matricule || "");
          }}
          size="sm"
        >
          <option selected>Choisir un camion</option>
          {camions?.map(camion => (
            <option>{camion.matricule}</option>
          ))}
        </Form.Select>
      </div>
      <div
        style={{
          backgroundColor: "#f8f9fa",
          margin: "auto",
          marginTop: "20px",
          marginBottom: "20px",
          width: "70%",
        }}
      >
        <p
          style={{
            fontSize: "16px",
            marginBottom: "10px",
          }}
        >
          Choisir les points de collect
        </p>
        <GoogleMapVisgl
          pointsDeCollect={collectionPoints}
          setPointsDeCollect={setCollectionPoints}
          centresDeDepots={centresDeDepots}
        />
      </div>
      <div
        style={{
          margin: "auto",
          width: "70%",
        }}
      >
        <Button
          style={{
            display: "block",
            marginBottom: "20px",
          }}
          variant="primary"
          onClick={() => createTournee()}
        >
          Créer la tournée
        </Button>
      </div>
    </>
  );
};

const GoogleMapVisgl: React.FC<{
  pointsDeCollect: PointDeCollect[];
  setPointsDeCollect: React.Dispatch<React.SetStateAction<PointDeCollect[]>>;
  centresDeDepots: PointDeCollect[];
}> = ({ pointsDeCollect, setPointsDeCollect, centresDeDepots }) => {
  const defaultCenter = { lat: 36.742173, lng: 10.036566 };

  const addCollectionPoint = (collectionPoint: { lat: number; lng: number }) => {
    setPointsDeCollect([...pointsDeCollect, collectionPoint]);
  };

  const removeCollectionPoint = (collectionPoint: { lat: number; lng: number }) => {
    setPointsDeCollect(pointsDeCollect.filter(p => p.lat !== collectionPoint.lat && p.lng !== collectionPoint.lng));
  };

  return (
    <APIProvider apiKey={"AIzaSyDXdXXNJTBEKGgZWNm-bYhrUDz6_3gysTY"}>
      <Map
        style={{ width: "100%", height: "80vh" }}
        defaultCenter={defaultCenter}
        defaultZoom={9}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        mapId={"someId"}
        mapTypeId="hybrid"
        onClick={e => {
          console.log(e);
          if (e.detail.latLng)
            addCollectionPoint({
              lat: e.detail.latLng?.lat,
              lng: e.detail.latLng?.lng,
            });
        }}
      >
        {pointsDeCollect?.map((point, index) => (
          <AdvancedMarker
            key={index}
            position={{ lat: point.lat, lng: point.lng }}
            onClick={() => {
              removeCollectionPoint(point);
            }}
          >
            <Pin />
          </AdvancedMarker>
        ))}

        {centresDeDepots?.map((point, index) => (
          <AdvancedMarker key={index} position={{ lat: point.lat, lng: point.lng }}>
            <Pin background={"#0f9d58"} borderColor={"#006425"} glyphColor={"#60d98f"} />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
};
