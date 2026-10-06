// DOCBEE MediFlow - Mock External FHIR Server
// Lightweight mock server simulating an external hospital's FHIR R4 REST API.
// Used for integration testing of external FHIR Provider mode.

const http = require('http');
const {
  FhirPatient,
  FhirPractitioner,
  FhirOrganization,
  FhirAppointment,
  FhirSchedule,
  FhirSlot,
  FhirEncounter,
  FhirObservation,
  FhirDiagnosticReport,
  FhirDocumentReference
} = require('./fhirModels');

class MockFhirServer {
  constructor(port = 8089) {
    this.port = port;
    this.server = null;
    this.isRunning = false;
    this.resources = {
      Patient: [
        new FhirPatient({
          id: "fhir-pat-001",
          name: [{ use: "official", family: "Sharma", given: ["Rahul"] }],
          telecom: [{ system: "email", value: "patient@mediflow.demo" }, { system: "phone", value: "+91 98765 00001" }],
          gender: "male",
          birthDate: "1995-04-12"
        })
      ],
      Practitioner: [
        new FhirPractitioner({
          id: "fhir-doc-001",
          name: [{ prefix: ["Dr."], family: "Sharma", given: ["Priya"] }],
          specialty: "Cardiology",
          hospitalAffiliation: "Apollo Hospital (External FHIR)",
          rating: 4.9,
          consultationFee: 900,
          averageDurationMinutes: 15,
          address: [{ city: "Chennai", state: "Tamil Nadu", country: "India" }]
        }),
        new FhirPractitioner({
          id: "fhir-doc-002",
          name: [{ prefix: ["Dr."], family: "Kumar", given: ["Arun"] }],
          specialty: "Cardiology",
          hospitalAffiliation: "Fortis Hospital (External FHIR)",
          rating: 4.8,
          consultationFee: 850,
          averageDurationMinutes: 15,
          address: [{ city: "Chennai", state: "Tamil Nadu", country: "India" }]
        })
      ],
      Organization: [
        new FhirOrganization({
          id: "fhir-org-001",
          name: "Apollo Main Hospital (FHIR Gateway)",
          address: [{ city: "Chennai", state: "Tamil Nadu", country: "India" }]
        })
      ],
      Appointment: [
        new FhirAppointment({
          id: "fhir-apt-001",
          status: "booked",
          participant: [
            { actor: { reference: "Patient/fhir-pat-001", display: "Rahul Sharma" } },
            { actor: { reference: "Practitioner/fhir-doc-001", display: "Dr. Priya Sharma" } }
          ],
          tokenNumber: "Q-01",
          reason: "Cardiac Checkup via External FHIR"
        })
      ],
      Schedule: [],
      Slot: [],
      Encounter: [],
      Observation: [
        new FhirObservation({
          id: "fhir-obs-001",
          code: "85354-9",
          display: "Blood Pressure",
          patientRef: "fhir-pat-001",
          valueString: "118/78 mmHg"
        })
      ],
      DiagnosticReport: [
        new FhirDiagnosticReport({
          id: "fhir-rep-001",
          display: "Cardiac Stress Test",
          patientRef: "fhir-pat-001",
          practitionerRef: "fhir-doc-001",
          conclusion: "Normal sinus rhythm with normal exercise tolerance."
        })
      ],
      DocumentReference: [
        new FhirDocumentReference({
          id: "fhir-docref-001",
          title: "Discharge Summary (FHIR)",
          patientRef: "fhir-pat-001",
          practitionerRef: "fhir-doc-001"
        })
      ]
    };
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        const urlParts = req.url.split('?');
        const pathSegments = urlParts[0].replace(/^\/fhir\//, '').replace(/^\//, '').split('/');
        const resourceType = pathSegments[0];
        const resourceId = pathSegments[1];

        res.setHeader('Content-Type', 'application/fhir+json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (req.method === 'GET') {
          if (!resourceType || resourceType === 'metadata') {
            return res.end(JSON.stringify({ resourceType: "CapabilityStatement", status: "active", fhirVersion: "4.0.1" }));
          }

          if (this.resources[resourceType]) {
            if (resourceId) {
              const item = this.resources[resourceType].find(r => r.id === resourceId);
              if (item) return res.end(JSON.stringify(item));
              res.statusCode = 404;
              return res.end(JSON.stringify({ resourceType: "OperationOutcome", issue: [{ severity: "error", code: "not-found" }] }));
            }

            // Return Bundle
            const bundle = {
              resourceType: "Bundle",
              type: "searchset",
              total: this.resources[resourceType].length,
              entry: this.resources[resourceType].map(r => ({ resource: r }))
            };
            return res.end(JSON.stringify(bundle));
          }

          res.statusCode = 404;
          return res.end(JSON.stringify({ resourceType: "OperationOutcome", issue: [{ severity: "error", code: "not-found" }] }));
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              parsed.id = parsed.id || `fhir-${Date.now()}`;
              if (!this.resources[resourceType]) this.resources[resourceType] = [];
              this.resources[resourceType].push(parsed);
              res.statusCode = 201;
              res.end(JSON.stringify(parsed));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Invalid JSON" }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: "Method not allowed" }));
      });

      this.server.listen(this.port, () => {
        this.isRunning = true;
        resolve(this.port);
      });
      this.server.on('error', reject);
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.isRunning = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = MockFhirServer;
