// DOCBEE MediFlow - FHIR-Compliant Healthcare Resource Definitions
// Implements FHIR Release 4 (R4) compatible resource structures for synthetic healthcare interoperability.
// Conceptually covers: Patient, Practitioner, Organization, Appointment, Schedule, Slot, Encounter, Observation, DiagnosticReport, DocumentReference.

class FhirResource {
  constructor(resourceType, id) {
    this.resourceType = resourceType;
    this.id = id;
    this.meta = {
      versionId: "1",
      lastUpdated: new Date().toISOString(),
      profile: [`http://hl7.org/fhir/StructureDefinition/${resourceType}`]
    };
  }
}

class FhirPatient extends FhirResource {
  constructor({ id, identifier = [], name = [], telecom = [], gender = "unknown", birthDate = null, address = [], active = true }) {
    super("Patient", id);
    this.active = active;
    this.identifier = identifier; // [{ system: "urn:oid:mediflow:patient", value: "pat-1" }]
    this.name = name; // [{ use: "official", family: "Sharma", given: ["Rahul"] }]
    this.telecom = telecom; // [{ system: "phone", value: "+91 98765 00001" }, { system: "email", value: "patient@mediflow.demo" }]
    this.gender = gender; // "male" | "female" | "other" | "unknown"
    this.birthDate = birthDate; // "1995-04-12"
    this.address = address; // [{ line: ["12 Anna Salai"], city: "Chennai", state: "Tamil Nadu", country: "India" }]
  }
}

class FhirPractitioner extends FhirResource {
  constructor({ id, identifier = [], name = [], telecom = [], qualification = [], specialty = "General Medicine", hospitalAffiliation = "Apollo Hospitals", rating = 4.8, consultationFee = 800, averageDurationMinutes = 15, experienceYears = 12, education = "MBBS, MD", address = [], active = true }) {
    super("Practitioner", id);
    this.active = active;
    this.identifier = identifier;
    this.name = name; // [{ prefix: ["Dr."], family: "Sharma", given: ["Priya"] }]
    this.telecom = telecom;
    this.qualification = qualification; // [{ code: { coding: [{ system: "http://snomed.info/sct", code: "394579002", display: "Cardiology" }] } }]
    // Extended attributes for MediFlow Interoperability
    this.specialty = specialty;
    this.hospitalAffiliation = hospitalAffiliation;
    this.rating = rating;
    this.consultationFee = consultationFee;
    this.averageDurationMinutes = averageDurationMinutes;
    this.experienceYears = experienceYears;
    this.education = education;
    this.address = address;
  }
}

class FhirOrganization extends FhirResource {
  constructor({ id, identifier = [], name, type = "prov", telecom = [], address = [], active = true }) {
    super("Organization", id);
    this.active = active;
    this.identifier = identifier;
    this.name = name;
    this.type = [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/organization-type", code: type, display: "Healthcare Provider" }] }];
    this.telecom = telecom;
    this.address = address;
  }
}

class FhirSchedule extends FhirResource {
  constructor({ id, identifier = [], active = true, actor = [], planningHorizon = {}, comment = "" }) {
    super("Schedule", id);
    this.active = active;
    this.identifier = identifier;
    this.actor = actor; // [{ reference: "Practitioner/doc-1", display: "Dr. Priya Sharma" }]
    this.planningHorizon = planningHorizon; // { start: "2026-10-05T09:00:00Z", end: "2026-10-05T18:00:00Z" }
    this.comment = comment;
  }
}

class FhirSlot extends FhirResource {
  constructor({ id, identifier = [], scheduleRef, status = "free", start, end, comment = "" }) {
    super("Slot", id);
    this.identifier = identifier;
    this.schedule = { reference: `Schedule/${scheduleRef}` };
    this.status = status; // "free" | "busy"
    this.start = start; // "2026-10-05T09:00:00Z"
    this.end = end; // "2026-10-05T09:15:00Z"
    this.comment = comment;
  }
}

class FhirAppointment extends FhirResource {
  constructor({ id, identifier = [], status = "booked", serviceType = "In-Clinic Consultation", description = "", start = null, end = null, participant = [], tokenNumber = "Q-01", queueState = "WAITING", reason = "", consultationType = "In-Clinic", aiPreConsultation = null }) {
    super("Appointment", id);
    this.identifier = identifier;
    this.status = status; // "booked" | "arrived" | "in-progress" | "fulfilled" | "cancelled"
    this.serviceType = [{ coding: [{ display: serviceType }] }];
    this.description = description;
    this.start = start;
    this.end = end;
    this.created = new Date().toISOString();
    this.participant = participant; // [{ actor: { reference: "Patient/pat-1", display: "Rahul Sharma" }, status: "accepted" }, { actor: { reference: "Practitioner/doc-1", display: "Dr. Priya Sharma" }, status: "accepted" }]
    // Extended MediFlow attributes
    this.tokenNumber = tokenNumber;
    this.queueState = queueState;
    this.reason = reason;
    this.consultationType = consultationType;
    this.aiPreConsultation = aiPreConsultation;
  }
}

class FhirEncounter extends FhirResource {
  constructor({ id, identifier = [], status = "finished", patientRef, practitionerRef, appointmentRef = null, period = {}, reasonCode = [], diagnosis = [], doctorNotes = "", clinicalSummary = "" }) {
    super("Encounter", id);
    this.identifier = identifier;
    this.status = status; // "planned" | "arrived" | "in-progress" | "finished" | "cancelled"
    this.class = {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: "AMB",
      display: "ambulatory"
    };
    this.subject = { reference: `Patient/${patientRef}` };
    this.participant = [{
      individual: { reference: `Practitioner/${practitionerRef}` }
    }];
    if (appointmentRef) {
      this.appointment = [{ reference: `Appointment/${appointmentRef}` }];
    }
    this.period = period; // { start: "...", end: "..." }
    this.reasonCode = reasonCode; // [{ coding: [{ display: "Chest tightness" }] }]
    this.diagnosis = diagnosis;
    this.doctorNotes = doctorNotes;
    this.clinicalSummary = clinicalSummary;
  }
}

class FhirObservation extends FhirResource {
  constructor({ id, identifier = [], status = "final", category = "vital-signs", code, display, patientRef, encounterRef = null, effectiveDateTime = new Date().toISOString(), valueQuantity = null, valueString = null, interpretation = "Normal" }) {
    super("Observation", id);
    this.identifier = identifier;
    this.status = status;
    this.category = [{
      coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: category, display: "Vital Signs" }]
    }];
    this.code = {
      coding: [{ system: "http://loinc.org", code, display }]
    };
    this.subject = { reference: `Patient/${patientRef}` };
    if (encounterRef) {
      this.encounter = { reference: `Encounter/${encounterRef}` };
    }
    this.effectiveDateTime = effectiveDateTime;
    if (valueQuantity) this.valueQuantity = valueQuantity;
    if (valueString) this.valueString = valueString;
    this.interpretation = [{ coding: [{ display: interpretation }] }];
  }
}

class FhirDiagnosticReport extends FhirResource {
  constructor({ id, identifier = [], status = "final", code, display, patientRef, practitionerRef, encounterRef = null, effectiveDateTime = new Date().toISOString(), issued = new Date().toISOString(), conclusion = "", doctorNotes = "", clinicalSummary = "", advice = "", followUpDate = null, pdfUrl = null }) {
    super("DiagnosticReport", id);
    this.identifier = identifier;
    this.status = status;
    this.code = {
      coding: [{ system: "http://loinc.org", code: code || "11488-4", display: display || "Consultation Consultation Summary" }]
    };
    this.subject = { reference: `Patient/${patientRef}` };
    this.performer = [{ reference: `Practitioner/${practitionerRef}` }];
    if (encounterRef) {
      this.encounter = { reference: `Encounter/${encounterRef}` };
    }
    this.effectiveDateTime = effectiveDateTime;
    this.issued = issued;
    this.conclusion = conclusion;
    this.doctorNotes = doctorNotes;
    this.clinicalSummary = clinicalSummary;
    this.advice = advice;
    this.followUpDate = followUpDate;
    this.pdfUrl = pdfUrl;
  }
}

class FhirDocumentReference extends FhirResource {
  constructor({ id, identifier = [], status = "current", docStatus = "final", typeDisplay = "Medical Report", patientRef, practitionerRef = null, date = new Date().toISOString(), title = "", category = "Health Document", fileUrl = "", fileSize = "1.2 MB", contentType = "application/pdf" }) {
    super("DocumentReference", id);
    this.identifier = identifier;
    this.status = status;
    this.docStatus = docStatus;
    this.type = {
      coding: [{ system: "http://loinc.org", display: typeDisplay }]
    };
    this.category = [{
      coding: [{ display: category }]
    }];
    this.subject = { reference: `Patient/${patientRef}` };
    if (practitionerRef) {
      this.author = [{ reference: `Practitioner/${practitionerRef}` }];
    }
    this.date = date;
    this.content = [{
      attachment: {
        contentType,
        url: fileUrl,
        title,
        size: fileSize
      }
    }];
  }
}

module.exports = {
  FhirResource,
  FhirPatient,
  FhirPractitioner,
  FhirOrganization,
  FhirSchedule,
  FhirSlot,
  FhirAppointment,
  FhirEncounter,
  FhirObservation,
  FhirDiagnosticReport,
  FhirDocumentReference
};
