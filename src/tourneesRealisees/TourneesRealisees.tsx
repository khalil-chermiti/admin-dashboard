import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { databaseClient } from "../firebaseConfig";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Card, Col, Container, Modal, Row } from "react-bootstrap";
import { IoMapOutline } from "react-icons/io5";
import { PointDeCollect } from "../CentreDeDepot/types";
import { Agent } from "../agents/types";
import { AuthContext } from "../auth/AuthContext";

type Tournee = {
  id: string;
  agentId: string;
  pointsDeCollect: PointDeCollect[];
  agentName: string;
  supervisorId: string;
  camionMatricule: string;
};

type TourneeRealisee = {
  agentId: string;
  startDate: {
    toDate: () => Date;
  };
  endDate: {
    toDate: () => Date;
  };
  id: string;
  images: string[];
  agentNom?: string;
  agentPrenom?: string;
};

export const TourneesRealisees = () => {
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const [id, setId] = useState<string>("");
  const [nombreImages, setNombreImages] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const authContext = useContext(AuthContext)!;

  const [tourneesRealisees, setTourneesRealisees] = useState<TourneeRealisee[]>(
    [],
  );

  // const authContext = useContext(AuthContext)!;

  const getTournees = async () => {
    const usersCollection = collection(databaseClient, "tourneesRealisees");

    const docSnap = query(
      usersCollection,
      where("supervisorId", "==", authContext.user?.uid),
    );

    await getDocs(docSnap).then((querySnapshot) => {
      if (querySnapshot.empty) {
        toast.error("Aucune tournée realisée trouvée");
      } else {
        querySnapshot.docs.map((doc) => {
          const currentTournee = doc.data() as TourneeRealisee;
          currentTournee.images = [];
          currentTournee.id = doc.data().id;
          setTourneesRealisees((prev) => [...prev, currentTournee]);
        });
      }
    });

    const photos = collection(databaseClient, "images");
    const photoSnap = query(photos);
    getDocs(photoSnap).then((querySnapshot) => {
      querySnapshot.docs.forEach((img) => {
        const currentImage = img.data();

        setTourneesRealisees((prev) => {
          const newTournees = prev.map((tournee) => {
            console.log(tournee);
            if (tournee.id === currentImage.tourneeId) {
              console.log("bingo");
              return {
                ...tournee,
                images: [...tournee.images, currentImage.imageUrl],
              };
            }
            return tournee;
          });
          return newTournees;
        });
      });
    });

    const agents = collection(databaseClient, "agents");
    const agentSnap = query(agents);
    getDocs(agentSnap).then((querySnapshot) => {
      querySnapshot.docs.forEach((agent) => {
        const currentAgent = agent.data();
        setTourneesRealisees((prev) => {
          const newTournees = prev.map((tournee) => {
            if (tournee.agentId === currentAgent.id) {
              return {
                ...tournee,
                agentNom: currentAgent.nom,
                agentPrenom: currentAgent.prenom,
              };
            }
            return tournee;
          });
          return newTournees;
        });
      });
    });
  };

  useEffect(() => {
    setTourneesRealisees([]);
    getTournees();
  }, []);

  useEffect(() => {
    console.log(tourneesRealisees);
  }, [tourneesRealisees]);

  return (
    <div className="mt-5">
      <Modal
        show={show}
        onHide={handleClose}
        style={{
          backdropFilter: "blur(10px)",
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Rapport De La Tournee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ImprimerRapport
            handleClose={handleClose}
            id={id}
            images={nombreImages}
            startDate={startDate!}
            endDate={endDate!}
          />
        </Modal.Body>
      </Modal>

      <Container>
        <h3 className="mt-3 text-center">Liste des tournées realisees</h3>
        <Row className="mt-3" xs={2} md={8} lg={8}>
          {tourneesRealisees.map((tournee, index) => {
            return (
              <Col sm={12} md={6} lg={4} key={index} className="mb-2">
                <Card style={{ width: "18rem", marginBottom: "20px" }}>
                  <Card.Body>
                    <IoMapOutline size={35} className="mb-2" />

                    <Card.Title>
                      <div
                        style={{
                          marginBottom: "10px",
                        }}
                      >
                        agent: {tournee.agentNom} {tournee.agentPrenom}
                      </div>
                      {tournee.images.map((img) => {
                        return (
                          <img
                            key={img}
                            src={img}
                            alt="tournee"
                            style={{
                              width: "100px",
                              height: "100px",
                              padding: "5px",
                            }}
                          />
                        );
                      })}
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      <div
                        style={{
                          marginBottom: "10px",
                        }}
                      >
                        images prises: {tournee.images.length}
                      </div>

                      <div
                        style={{
                          marginBottom: "10px",
                        }}
                      >
                        startDate:{" "}
                        {new Date(tournee.startDate.toDate()).toLocaleString()}
                      </div>

                      <div
                        style={{
                          marginBottom: "10px",
                        }}
                      >
                        endDate:{" "}
                        {new Date(tournee.endDate.toDate()).toLocaleString()}
                      </div>
                      <button
                        className=" btn btn-primary"
                        onClick={() => {
                          setId(tournee.agentId);
                          setNombreImages(tournee.images.length);
                          setStartDate(tournee.startDate.toDate());
                          setEndDate(tournee.endDate.toDate());
                          handleShow();
                        }}
                      >
                        Imprimer
                      </button>
                    </Card.Subtitle>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </div>
  );
};

type User = {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  ville: string;
  role: "superviseur";
};

const ImprimerRapport: React.FC<{
  id: string;
  handleClose: () => void;
  startDate: Date;
  endDate: Date;
  images: number;
}> = ({ id, images, startDate, endDate }) => {
  const [tournee, setTournee] = useState<Tournee | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const getTournee = async (id: string) => {
    const tournee = collection(databaseClient, "tournees");
    const docSnap = query(tournee, where("agentId", "==", id));

    const doc = await getDocs(docSnap);
    const currentTournee = doc.docs[0].data() as Tournee;
    setTournee(currentTournee);

    const agent = collection(databaseClient, "agents");
    const agentSnap = query(agent, where("id", "==", currentTournee.agentId));
    const agentDoc = await getDocs(agentSnap);
    const currentAgent = agentDoc.docs[0].data() as Agent;
    setAgent(currentAgent);

    //get the user from database using the supervisorId
    const booksRef = collection(databaseClient, "users");

    const q = query(
      booksRef,
      where(documentId(), "==", currentTournee.supervisorId),
    );

    const userDoc = await getDocs(q);
    const currentUser = userDoc.docs[0].data() as User;
    setUser(currentUser);
  };

  useEffect(() => {
    if (id) getTournee(id);
  }, []);

  useEffect(() => {
    console.log(tournee);
  }, [tournee]);

  return (
    <>
      {tournee && agent ? (
        <div className="container">
          <div className="table-responsive">
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <th>Date de début:</th>
                  <td>{startDate.toLocaleString()}</td>
                </tr>
                <tr>
                  <th>Date de fin:</th>
                  <td>{endDate.toLocaleString()}</td>
                </tr>
                <tr>
                  <th>Agent:</th>
                  <td>
                    {agent.nom} {agent.prenom}
                  </td>
                </tr>
                <tr>
                  <th>Matricule du camion:</th>
                  <td>{tournee.camionMatricule}</td>
                </tr>
                <tr>
                  <th>Superviseur:</th>
                  <td>
                    {user?.nom} {user?.prenom}
                  </td>
                </tr>
                <tr>
                  <th>Images Prises:</th>
                  <td>{images}</td>
                </tr>
                <tr>
                  <th>Points de Collecte:</th>
                  <td>{tournee.pointsDeCollect.length}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-center mt-4">
            <button className="btn btn-primary" onClick={() => window.print()}>
              Imprimer
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">Chargement...</div>
      )}
    </>
  );
};
