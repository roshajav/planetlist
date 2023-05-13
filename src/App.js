// Import required modules and stylesheets
import React, { useState, useEffect } from "react";
import {
  Form,
  Table,
  Pagination,
  Spinner,
  Container,
  Navbar,
} from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";

// Main component
function App() {
  /**
   * @description Set initial states using React Hooks
   */
  const [planets, setPlanets] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState();
  const [residentsList, setResidentsList] = useState([]);
  const [residentDetails, setResidentDetails] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  /**
   *  @description Fetch planet data from API using useEffect hook and set state with the response
   */

  useEffect(() => {
    const fetchPlanets = async () => {
      let pageNumber = 1;
      let results = [];
      let response, json;
      do {
        response = await fetch(
          `https://swapi.dev/api/planets/?page=${pageNumber}`
        );
        json = await response.json();
        results = results.concat(json.results);
        if (json.next) {
          pageNumber++;
        }
        setPlanets(results);
      } while (json.next);
    };
    fetchPlanets();
  }, []);

  /**
   * @description Fetch residents data for a selected planet using useEffect hook and set state with the response.
   */
  useEffect(() => {
    let planetResidentList = [];
    let response, json;
    const fetchPlanetResidents = async () => {
      if (selectedIndex) {
        try {
          response = await fetch(
            `https://swapi.dev/api/planets/${selectedIndex}`
          );
          json = await response.json();
          planetResidentList = planetResidentList.concat(json.residents);
        } catch (error) {
          console.log(error);
        }
        setResidentsList(planetResidentList);
      }
    };
    fetchPlanetResidents();
  }, [selectedIndex]);

  /**
   * @description Fetch detailed information for each resident using useEffect hook and
   * set state with the response.
   */

  useEffect(() => {
    const fetchResidentData = async () => {
      try {
        const promises = residentsList.map(async (residentUrl) => {
          const response = await fetch(residentUrl);
          const jsonData = await response.json();
          return jsonData;
        });
        const residentData = await Promise.all(promises);
        setResidentDetails(residentData);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResidentData();
  }, [residentsList]);

  /**
   *  @description Handle planet selection event and set selected index state
   */
  const handlePlanetChange = (event) => {
    setLoading(true);
    setSelectedIndex(event.target.selectedIndex);
  };

  /**
   *  @description Calculate the index of last and first item for current page based on per page items count 
      and set current items.
   */
  const indexOfLastItem = page * perPage;
  const indexOfFirstItem = indexOfLastItem - perPage;
  const currentItems = residentDetails.slice(indexOfFirstItem, indexOfLastItem);

  /**
   * @description Calculate page numbers based on resident details count and per page items count
   */
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(residentDetails.length / perPage); i++) {
    pageNumbers.push(i);
  }

  /**
   * @description Render component
   */
  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container className="py-2">
          {<strong>PLANET RESIDENTS INFO</strong>}
        </Container>
      </Navbar>
      <Container className="py-2">
        <Form.Select
          size="sm"
          onChange={handlePlanetChange}
          aria-label="Select Planet"
        >
          <option key="">Select Planet</option>
          {planets.map((item, index) => (
            <option key={index} value={index}>
              {item?.name}
            </option>
          ))}
        </Form.Select>
        <br></br>

        {loading ? (
          <Spinner animation="border" role="status" aria-busy="true">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ) : residentDetails && residentDetails.length > 0 ? (
          <div>
            <Table
              striped
              bordered
              hover
              role="table"
              aria-rowcount={residentDetails.length}
            >
              <thead>
                <tr>
                  <th aria-label="Resident Number">#</th>
                  <th aria-label="Resident Name">Name</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((resident, index) => (
                  <tr key={index}>
                    <td>{(page - 1) * 10 + (index + 1)}</td>
                    <td>{resident.name}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {
              <Pagination aria-label="Resident Pagination">
                {pageNumbers.map((number) => (
                  <Pagination.Item
                    key={number}
                    active={number === page}
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </Pagination.Item>
                ))}
              </Pagination>
            }
          </div>
        ) : (
          <>
            <Form.Label>{<b>No Residents Found!</b>}</Form.Label>
          </>
        )}
        {residentDetails?.totalPage}
      </Container>
    </>
  );
}

export default App;
