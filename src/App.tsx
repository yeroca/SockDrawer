// import ImportDialog from './components/ImportDialog'
// ParentComponent.js

import { useState } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";

// React router stuff
import { Route, Routes } from "react-router-dom";

// import other pages
import Home from "./pages/Home";
import Privacy from "./pages/Privacy";
import Usage from "./pages/Usage";
import { Link } from "react-router-dom";
import IniData from "./IniData";

const App = () => {
  // Declare these state variables here so that they are preseved when switch to other pages
  const [iniData, setIniData] = useState<IniData>({});
  const [fileName, setFileName] = useState<string>("");

  return (
    <>
      <Container fluid className="ms-2">
        <Navbar expand="lg">
          <Navbar.Brand as={Link} to="/">
            SockDrawer
          </Navbar.Brand>
          <Nav>
            <Nav.Link as={Link} to="/usage">
              Usage and known issues
            </Nav.Link>
            <Nav.Link as={Link} to="/privacy">
              Privacy and security
            </Nav.Link>
            <NavDropdown title="About" id="basic-nav-dropdown">
              <NavDropdown.Item>Version 1.3.2</NavDropdown.Item>
              <NavDropdown.Item
                target="_blank"
                href="https://github.com/yeroca/SockDrawer"
              >
                Source: https://github.com/yeroca/SockDrawer
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar>
      </Container>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              iniData={iniData}
              setIniData={setIniData}
              fileName={fileName}
              setFileName={setFileName}
            />
          }
        />
        <Route path="/usage" element={<Usage />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </>
  );
};

export default App;
